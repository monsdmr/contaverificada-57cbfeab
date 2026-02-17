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

    const { amount, name, email, cpf, phone, payment_type, ab_variant, ttclid, page_url, page_referrer } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Amount in centavos for SigmaPay
    const amountCentavos = Math.round(amount * 100)
    const cleanCpf = cpf?.replace(/\D/g, '') || '00000000000'

    console.log(`[generate-pix] Creating transaction: ${amountCentavos} centavos, type: ${payment_type}`)

    // Create transaction on SigmaPay with correct payload format
    const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions?api_token=${SIGMA_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        amount: amountCentavos,
        offer_hash: 'zxw2p8esaw',
        payment_method: 'pix',
        customer: {
          name: name || 'Cliente',
          email: email || 'cliente@pagamento.com',
          phone_number: phone || '11999999999',
          document: cleanCpf,
        },
        cart: [
          {
            product_hash: '31atjri7nd',
            title: payment_type || 'Pagamento',
            cover: null,
            price: amountCentavos,
            quantity: 1,
            operation_type: 1,
            tangible: false,
          }
        ],
        expire_in_days: 1,
        transaction_origin: 'api',
        tracking: {
          src: ttclid || '',
          utm_source: '',
          utm_medium: '',
          utm_campaign: '',
          utm_term: '',
          utm_content: '',
        },
      }),
      signal: AbortSignal.timeout(60000),
    })

    const contentType = sigmaResponse.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const textResponse = await sigmaResponse.text()
      console.error('[generate-pix] SigmaPay returned non-JSON:', textResponse.substring(0, 500))
      throw new Error('SigmaPay returned invalid response format')
    }

    const sigmaData = await sigmaResponse.json()

    if (!sigmaResponse.ok) {
      console.error('[generate-pix] SigmaPay API error:', JSON.stringify(sigmaData))
      throw new Error(`SigmaPay error [${sigmaResponse.status}]: ${JSON.stringify(sigmaData)}`)
    }

    console.log('[generate-pix] SigmaPay response:', JSON.stringify(sigmaData))

    // Extract PIX data from SigmaPay response
    // SigmaPay returns: pix.pix_qr_code (copia-e-cola), pix.pix_url (QR code base64 image)
    const transactionHash = sigmaData.hash || sigmaData.transaction_hash || sigmaData.id || crypto.randomUUID()
    const pixCode = sigmaData.pix?.pix_qr_code || sigmaData.pix?.code || sigmaData.pix_code || ''
    const pixQrBase64 = sigmaData.pix?.pix_url || sigmaData.pix?.qr_code_base64 || sigmaData.pix_qr_code_base64 || ''
    const pixUrl = sigmaData.pix?.pix_url || sigmaData.pix_url || ''

    // Generate a unique transaction_id for our system
    const transactionId = `sigma_${transactionHash}`

    // Save to database
    const { error: dbError } = await supabase.from('pix_payments').insert({
      transaction_id: transactionId,
      transaction_hash: transactionHash,
      amount: amount,
      status: 'pending',
      payment_type: payment_type || 'unknown',
      pix_code: pixCode,
      pix_qr_code_base64: pixQrBase64,
      pix_url: pixUrl,
      customer_name: name,
      customer_email: email,
      customer_cpf: cleanCpf,
      ab_variant: ab_variant,
      ttclid: ttclid,
      page_url: page_url,
      page_referrer: page_referrer,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      user_agent: req.headers.get('user-agent'),
    })

    if (dbError) {
      console.error('[generate-pix] Database error:', dbError)
    }

    const responseData = {
      transaction_id: transactionId,
      pix_code: pixCode,
      pix_qr_code_base64: pixQrBase64,
      pix_url: pixUrl,
      amount: amount,
      status: 'pending',
    }

    console.log('[generate-pix] Success:', transactionId)

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[generate-pix] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})