import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SIGMA_API_URL = 'https://api.sigmapay.com.br/api/public/v1'
const SKALE_API_URL = 'https://api.conta.skalepay.com.br/v1'

// --- SigmaPay provider ---
async function generateWithSigma(params: {
  amountCentavos: number; cleanCpf: string; name: string; email: string;
  phone: string; paymentType: string; ttclid: string; apiToken: string;
}): Promise<{ pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }> {
  const { amountCentavos, cleanCpf, name, email, phone, paymentType, ttclid, apiToken } = params

  const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions?api_token=${apiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      amount: amountCentavos,
      offer_hash: 'zxw2p8esaw',
      payment_method: 'pix',
      customer: { name, email, phone_number: phone, document: cleanCpf },
      cart: [{
        product_hash: '31atjri7nd', title: paymentType || 'Pagamento',
        cover: null, price: amountCentavos, quantity: 1, operation_type: 1, tangible: false,
      }],
      expire_in_days: 1,
      transaction_origin: 'api',
      tracking: { src: ttclid || '', utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '' },
    }),
    signal: AbortSignal.timeout(60000),
  })

  const contentType = sigmaResponse.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const text = await sigmaResponse.text()
    console.error('[generate-pix][sigma] Non-JSON response:', text.substring(0, 300))
    throw new Error('SigmaPay returned invalid response format')
  }

  const sigmaData = await sigmaResponse.json()
  if (!sigmaResponse.ok) {
    console.error('[generate-pix][sigma] API error:', JSON.stringify(sigmaData))
    throw new Error(`SigmaPay error [${sigmaResponse.status}]: ${JSON.stringify(sigmaData)}`)
  }

  const transactionHash = sigmaData.hash || sigmaData.transaction_hash || sigmaData.id || crypto.randomUUID()
  const pixCode = sigmaData.pix?.pix_qr_code || sigmaData.pix?.code || sigmaData.pix_code || ''
  const pixQrBase64 = sigmaData.pix?.pix_url || sigmaData.pix?.qr_code_base64 || sigmaData.pix_qr_code_base64 || ''
  const pixUrl = sigmaData.pix?.pix_url || sigmaData.pix_url || ''

  if (!pixCode) throw new Error('SigmaPay: pix_code missing in response')

  return { pixCode, pixQrBase64, pixUrl, transactionHash, provider: 'sigma' }
}

// --- SkalePay provider ---
async function generateWithSkale(params: {
  amountCentavos: number; cleanCpf: string; name: string; email: string;
  phone: string; paymentType: string; secretKey: string; webhookUrl: string;
}): Promise<{ pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }> {
  const { amountCentavos, cleanCpf, name, email, phone, secretKey, webhookUrl } = params

  const basicAuth = btoa(`${secretKey}:x`)

  const skaleResponse = await fetch(`${SKALE_API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
    },
    body: JSON.stringify({
      paymentMethod: 'pix',
      amount: amountCentavos,
      customer: { name: name || 'Cliente', email: email || 'cliente@pagamento.com', phone: phone || '11999999999', document: { type: cleanCpf.length <= 11 ? 'cpf' : 'cnpj', number: cleanCpf } },
      items: [{
        title: params.paymentType || 'Pagamento',
        unitPrice: amountCentavos,
        quantity: 1,
        tangible: false,
      }],
      postBackUrl: webhookUrl,
    }),
    signal: AbortSignal.timeout(60000),
  })

  const contentType = skaleResponse.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const text = await skaleResponse.text()
    console.error('[generate-pix][skale] Non-JSON response:', text.substring(0, 300))
    throw new Error('SkalePay returned invalid response format')
  }

  const skaleData = await skaleResponse.json()
  if (!skaleResponse.ok) {
    console.error('[generate-pix][skale] API error:', JSON.stringify(skaleData))
    throw new Error(`SkalePay error [${skaleResponse.status}]: ${JSON.stringify(skaleData)}`)
  }

  console.log('[generate-pix][skale] Response:', JSON.stringify(skaleData))

  const transactionHash = String(skaleData.id || skaleData.transaction_id || skaleData.hash || crypto.randomUUID())
  const pixCode = skaleData.pix?.qrcode || skaleData.pix?.copy_and_paste || skaleData.pix?.qr_code || ''
  const pixQrBase64 = '' // Skale doesn't return base64, QR will be generated client-side from pixCode
  const pixUrl = skaleData.secureUrl || ''

  if (!pixCode) throw new Error('SkalePay: pix_code missing in response')

  return { pixCode, pixQrBase64, pixUrl, transactionHash, provider: 'skale' }
}

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

    const { amount, name, email, cpf, phone, payment_type, ab_variant, ttclid, page_url, page_referrer } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amountCentavos = Math.round(amount * 100)
    const cleanCpf = cpf?.replace(/\D/g, '') || '00000000000'
    const safeName = name || 'Cliente'
    const safeEmail = email || 'cliente@pagamento.com'
    const safePhone = phone || '11999999999'

    console.log(`[generate-pix] Creating transaction: ${amountCentavos} centavos, type: ${payment_type}`)

    let result: { pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }

    // Try SkalePay first
    if (SKALE_PAY_SECRET_KEY) {
      try {
        const webhookUrl = `${SUPABASE_URL}/functions/v1/skalepay-webhook`
        result = await generateWithSkale({
          amountCentavos, cleanCpf, name: safeName, email: safeEmail,
          phone: safePhone, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY, webhookUrl,
        })
        console.log(`[generate-pix] SkalePay succeeded: ${result.transactionHash}`)
      } catch (skaleErr) {
        console.error('[generate-pix] SkalePay failed, trying SigmaPay:', skaleErr instanceof Error ? skaleErr.message : skaleErr)

        if (!SIGMA_API_TOKEN) throw skaleErr // no fallback available

        result = await generateWithSigma({
          amountCentavos, cleanCpf, name: safeName, email: safeEmail,
          phone: safePhone, paymentType: payment_type, ttclid: ttclid || '', apiToken: SIGMA_API_TOKEN,
        })
        console.log(`[generate-pix] SigmaPay fallback succeeded: ${result.transactionHash}`)
      }
    } else if (SIGMA_API_TOKEN) {
      // No SkalePay key, use SigmaPay directly
      result = await generateWithSigma({
        amountCentavos, cleanCpf, name: safeName, email: safeEmail,
        phone: safePhone, paymentType: payment_type, ttclid: ttclid || '', apiToken: SIGMA_API_TOKEN,
      })
      console.log(`[generate-pix] SigmaPay direct succeeded: ${result.transactionHash}`)
    } else {
      throw new Error('No payment provider configured (SKALE_PAY_SECRET_KEY or SIGMA_API_TOKEN)')
    }

    // Build transaction_id with provider prefix
    const transactionId = `${result.provider}_${result.transactionHash}`

    // Save to database
    const { error: dbError } = await supabase.from('pix_payments').insert({
      transaction_id: transactionId,
      transaction_hash: result.transactionHash,
      amount,
      status: 'pending',
      payment_type: payment_type || 'unknown',
      pix_code: result.pixCode,
      pix_qr_code_base64: result.pixQrBase64,
      pix_url: result.pixUrl,
      customer_name: name,
      customer_email: email,
      customer_cpf: cleanCpf,
      ab_variant,
      ttclid,
      page_url,
      page_referrer,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip'),
      user_agent: req.headers.get('user-agent'),
    })

    if (dbError) console.error('[generate-pix] DB error:', dbError)

    const responseData = {
      transaction_id: transactionId,
      pix_code: result.pixCode,
      pix_qr_code_base64: result.pixQrBase64,
      pix_url: result.pixUrl,
      amount,
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
