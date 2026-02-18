import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SIGMA_API_URL = 'https://api.sigmapay.com.br/api/public/v1'
const SKALE_API_URL = 'https://api.conta.skalepay.com.br/v1'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SIGMA_API_TOKEN = Deno.env.get('SIGMA_API_TOKEN')
    const SKALE_PAY_SECRET_KEY = Deno.env.get('SKALE_PAY_SECRET_KEY')
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

    const transactionHash = localPayment.transaction_hash
    if (!transactionHash) {
      return new Response(
        JSON.stringify({ status: localPayment.status, transaction_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Detect provider from transaction_id prefix
    const isSkale = transaction_id.startsWith('skale_')

    let remoteStatus: string | null = null

    if (isSkale && SKALE_PAY_SECRET_KEY) {
      // Check with SkalePay
      try {
        const basicAuth = btoa(`${SKALE_PAY_SECRET_KEY}:x`)
        const skaleResponse = await fetch(`${SKALE_API_URL}/transactions/${transactionHash}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json', 'Authorization': `Basic ${basicAuth}` },
          signal: AbortSignal.timeout(30000),
        })

        if (skaleResponse.ok) {
          const skaleData = await skaleResponse.json()
          remoteStatus = skaleData.status || skaleData.payment_status || null
          console.log(`[check-payment][skale] Status for ${transactionHash}: ${remoteStatus}`)
        } else {
          const errorText = await skaleResponse.text()
          console.warn(`[check-payment][skale] Check failed [${skaleResponse.status}]:`, errorText.substring(0, 200))
        }
      } catch (e) {
        console.warn('[check-payment][skale] Error:', e instanceof Error ? e.message : e)
      }
    } else if (!isSkale && SIGMA_API_TOKEN) {
      // Check with SigmaPay
      try {
        const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions/${transactionHash}?api_token=${SIGMA_API_TOKEN}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(30000),
        })

        if (sigmaResponse.ok) {
          const sigmaData = await sigmaResponse.json()
          remoteStatus = sigmaData.payment_status || sigmaData.status || sigmaData.transaction?.status || sigmaData.transaction?.payment_status || null
          console.log(`[check-payment][sigma] Status for ${transactionHash}: ${remoteStatus}`)
        } else {
          const errorText = await sigmaResponse.text()
          console.warn(`[check-payment][sigma] Check failed [${sigmaResponse.status}]:`, errorText.substring(0, 200))
        }
      } catch (e) {
        console.warn('[check-payment][sigma] Error:', e instanceof Error ? e.message : e)
      }
    }

    // Normalize paid statuses
    const isPaid = remoteStatus && ['paid', 'approved', 'PAID', 'APPROVED'].includes(remoteStatus)

    if (isPaid) {
      const { error: updateError } = await supabase
        .from('pix_payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('transaction_id', transaction_id)

      if (updateError) console.error('[check-payment] Update error:', updateError)

      return new Response(
        JSON.stringify({ status: 'paid', transaction_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ status: remoteStatus || localPayment.status, transaction_id }),
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
