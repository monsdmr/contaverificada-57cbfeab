import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SIGMA_API_URL = 'https://api.sigmapay.com.br/api/public/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SIGMA_API_TOKEN = Deno.env.get('SIGMA_API_TOKEN')
    if (!SIGMA_API_TOKEN) {
      throw new Error('SIGMA_API_TOKEN not configured')
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { transaction_id } = await req.json()

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: 'transaction_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[check-payment] Checking: ${transaction_id}`)

    // Get local record
    const { data: localPayment, error: dbError } = await supabase
      .from('pix_payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single()

    if (dbError || !localPayment) {
      console.error('[check-payment] Payment not found:', dbError)
      return new Response(
        JSON.stringify({ error: 'Payment not found', status: 'not_found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If already paid locally, return immediately
    if (localPayment.status === 'paid' || localPayment.status === 'approved') {
      console.log(`[check-payment] Already paid: ${transaction_id}`)
      return new Response(
        JSON.stringify({ status: 'paid', transaction_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check with SigmaPay API
    const transactionHash = localPayment.transaction_hash
    if (!transactionHash) {
      return new Response(
        JSON.stringify({ status: localPayment.status, transaction_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions/${transactionHash}?api_token=${SIGMA_API_TOKEN}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30000),
    })

    if (!sigmaResponse.ok) {
      const errorText = await sigmaResponse.text()
      console.warn(`[check-payment] SigmaPay check failed [${sigmaResponse.status}]:`, errorText.substring(0, 200))
      // Return local status if API check fails
      return new Response(
        JSON.stringify({ status: localPayment.status, transaction_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const sigmaData = await sigmaResponse.json()
    const sigmaStatus = sigmaData.payment_status || sigmaData.status || sigmaData.transaction?.status || sigmaData.transaction?.payment_status

    console.log(`[check-payment] SigmaPay status for ${transactionHash}: ${sigmaStatus}`)

    // Update local status if changed
    if (sigmaStatus === 'paid' || sigmaStatus === 'approved') {
      const { error: updateError } = await supabase
        .from('pix_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('transaction_id', transaction_id)

      if (updateError) {
        console.error('[check-payment] Update error:', updateError)
      }

      return new Response(
        JSON.stringify({ status: 'paid', transaction_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ status: sigmaStatus || localPayment.status, transaction_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[check-payment] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage, status: 'error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
