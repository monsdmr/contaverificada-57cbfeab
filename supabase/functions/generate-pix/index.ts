import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SIGMA_API_URL = 'https://api.sigmapay.com.br/api/public/v1'
const SKALE_API_URL = 'https://api.conta.skalepay.com.br/v1'

// ─── Circuit Breaker Config ───────────────────────────────────────────────────
const CB_FAILURE_THRESHOLD = 5       // open circuit after N consecutive failures
const CB_OPEN_DURATION_MS  = 120_000 // stay open for 2 min before trying half-open
const CB_SIGMA_TIMEOUT_MS  = 15_000  // increased timeout to avoid false positives under load
const CB_SKALE_TIMEOUT_MS  = 30_000  // SkalePay is fallback, give it more time

type CircuitState = 'closed' | 'open' | 'half_open'

interface CircuitBreaker {
  gateway: string
  state: CircuitState
  failure_count: number
  last_failure_at: string | null
  opened_at: string | null
  last_success_at: string | null
}

// ─── Circuit Breaker Helpers ──────────────────────────────────────────────────

async function getCircuitState(supabase: ReturnType<typeof createClient>, gateway: string): Promise<CircuitBreaker> {
  const { data } = await supabase
    .from('gateway_circuit_breaker')
    .select('*')
    .eq('gateway', gateway)
    .single()

  if (!data) return { gateway, state: 'closed', failure_count: 0, last_failure_at: null, opened_at: null, last_success_at: null }

  // Auto-transition open → half_open after CB_OPEN_DURATION_MS
  if (data.state === 'open' && data.opened_at) {
    const msSinceOpen = Date.now() - new Date(data.opened_at).getTime()
    if (msSinceOpen >= CB_OPEN_DURATION_MS) {
      await supabase.from('gateway_circuit_breaker')
        .update({ state: 'half_open', updated_at: new Date().toISOString() })
        .eq('gateway', gateway)
      return { ...data, state: 'half_open' }
    }
  }

  return data as CircuitBreaker
}

async function recordSuccess(supabase: ReturnType<typeof createClient>, gateway: string): Promise<void> {
  await supabase.from('gateway_circuit_breaker').update({
    state: 'closed',
    failure_count: 0,
    last_success_at: new Date().toISOString(),
    opened_at: null,
    updated_at: new Date().toISOString(),
  }).eq('gateway', gateway)
}

async function recordFailure(supabase: ReturnType<typeof createClient>, gateway: string, currentCount: number): Promise<void> {
  const newCount = currentCount + 1
  const shouldOpen = newCount >= CB_FAILURE_THRESHOLD
  const now = new Date().toISOString()

  await supabase.from('gateway_circuit_breaker').update({
    state: shouldOpen ? 'open' : 'closed',
    failure_count: newCount,
    last_failure_at: now,
    opened_at: shouldOpen ? now : null,
    updated_at: now,
  }).eq('gateway', gateway)

  if (shouldOpen) {
    console.warn(`[circuit-breaker] ${gateway} circuit OPENED after ${newCount} failures`)
  }
}

// ─── SigmaPay provider ────────────────────────────────────────────────────────
async function generateWithSigma(params: {
  amountCentavos: number; cleanCpf: string; name: string; email: string;
  phone: string; paymentType: string; ttclid: string; apiToken: string; webhookUrl: string;
  timeoutMs?: number;
}): Promise<{ pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }> {
  const { amountCentavos, cleanCpf, name, email, phone, paymentType, ttclid, apiToken, webhookUrl, timeoutMs = CB_SIGMA_TIMEOUT_MS } = params

  const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions?api_token=${apiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      amount: amountCentavos,
      offer_hash: 'zxw2p8esaw',
      payment_method: 'pix',
      postback_url: webhookUrl,
      customer: { name, email, phone_number: phone, document: cleanCpf },
      cart: [{
        product_hash: '31atjri7nd', title: paymentType || 'Pagamento',
        cover: null, price: amountCentavos, quantity: 1, operation_type: 1, tangible: false,
      }],
      expire_in_days: 1,
      transaction_origin: 'api',
      tracking: { src: ttclid || '', utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '' },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  })

  const contentType = sigmaResponse.headers.get('content-type')
  if (!contentType?.includes('application/json')) {
    const text = await sigmaResponse.text()
    console.error('[generate-pix][sigma] Non-JSON response:', text.substring(0, 300))
    throw new Error('SigmaPay returned invalid response format')
  }

  const sigmaData = await sigmaResponse.json()
  console.log('[generate-pix][sigma] Raw response:', JSON.stringify(sigmaData))

  if (!sigmaResponse.ok) {
    console.error('[generate-pix][sigma] API error:', JSON.stringify(sigmaData))
    throw new Error(`SigmaPay error [${sigmaResponse.status}]: ${JSON.stringify(sigmaData)}`)
  }

  const txn = sigmaData.transaction || sigmaData
  const transactionHash = sigmaData.hash || txn.id || sigmaData.transaction_hash || sigmaData.id || crypto.randomUUID()
  const pixCode = txn.pix?.code || txn.pix?.pix_qr_code || sigmaData.pix?.code || sigmaData.pix?.pix_qr_code || sigmaData.pix_code || ''
  const pixQrBase64 = txn.pix?.url || sigmaData.pix?.pix_url || sigmaData.pix?.qr_code_base64 || sigmaData.pix_qr_code_base64 || ''
  const pixUrl = txn.pix?.url || sigmaData.pix?.pix_url || sigmaData.pix_url || ''

  if (!pixCode) throw new Error(`SigmaPay: pix_code missing in response. Keys: ${Object.keys(sigmaData).join(', ')}`)

  return { pixCode, pixQrBase64, pixUrl, transactionHash, provider: 'sigma' }
}

// ─── SkalePay provider ────────────────────────────────────────────────────────
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
    signal: AbortSignal.timeout(CB_SKALE_TIMEOUT_MS),
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
  const pixQrBase64 = ''
  const pixUrl = skaleData.secureUrl || ''

  if (!pixCode) throw new Error('SkalePay: pix_code missing in response')

  return { pixCode, pixQrBase64, pixUrl, transactionHash, provider: 'skale' }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
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

    // Nome: usa real se válido, senão sorteia nome brasileiro comum
    const FALLBACK_NAMES = [
      'Ana Lima', 'Carlos Silva', 'Maria Souza', 'João Oliveira', 'Fernanda Costa',
      'Ricardo Pereira', 'Juliana Santos', 'Bruno Almeida', 'Patricia Rocha', 'Lucas Ferreira',
      'Amanda Carvalho', 'Rodrigo Martins', 'Camila Gomes', 'Felipe Barbosa', 'Renata Ribeiro',
      'Marcelo Araujo', 'Viviane Nascimento', 'Eduardo Moreira', 'Tatiane Nunes', 'Guilherme Dias',
    ]
    const safeName = (name && name !== 'undefined' && name.trim().length >= 3)
      ? name.trim()
      : FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)]

    // Email: usa real se válido (inclui '@' e '.'), senão gera baseado no nome real
    function generateEmail(forName: string): string {
      const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br', 'live.com']
      const weights =  [35, 22, 13, 10, 8, 5]
      const total = weights.reduce((a, b) => a + b, 0)
      let r = Math.random() * total
      let domain = domains[domains.length - 1]
      for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) { domain = domains[i]; break } }

      const cleanedName = forName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim()
      const parts = cleanedName.split(/\s+/).filter(Boolean)
      const year = 1970 + Math.floor(Math.random() * 34) // 1970–2003
      const suffixOpts = [String(year), String(Math.floor(Math.random() * 999) + 1), String(Math.floor(Math.random() * 9999) + 1000)]
      const suffix = suffixOpts[Math.floor(Math.random() * suffixOpts.length)]

      if (parts.length >= 2) {
        const first = parts[0], last = parts[parts.length - 1]
        const variants = [`${first}.${last}${suffix}`, `${first}${last}${suffix}`, `${first}.${last}`, `${first}${suffix}`]
        return `${variants[Math.floor(Math.random() * variants.length)]}@${domain}`
      }
      return `${parts[0] || 'usuario'}${suffix}@${domain}`
    }

    const safeEmail = (email && email !== 'undefined' && email.includes('@') && email.includes('.'))
      ? email.trim().toLowerCase()
      : generateEmail(safeName)

    // Telefone: usa real se 11 dígitos, senão gera celular brasileiro válido
    function generatePhone(): string {
      const ddds = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,71,73,74,75,77,79,81,82,83,84,85,86,87,88,91,92,93,94,95,96,98,99]
      const ddd = ddds[Math.floor(Math.random() * ddds.length)]
      const second = [6,7,8,9][Math.floor(Math.random() * 4)]
      const rest = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
      return `${ddd}9${second}${rest}`
    }

    const rawPhone = phone?.replace(/\D/g, '') || ''
    const safePhone = (rawPhone.length === 11) ? rawPhone : generatePhone()

    const sigmaWebhookUrl = `${SUPABASE_URL}/functions/v1/sigmapay-webhook`
    const skaleWebhookUrl = `${SUPABASE_URL}/functions/v1/skalepay-webhook`

    // Deduplication by CPF — reuse pending PIX from same CPF/payment_type within last 2h
    if (cleanCpf && cleanCpf !== '00000000000') {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data: existingPix } = await supabase
        .from('pix_payments')
        .select('transaction_id, pix_code, pix_qr_code_base64, pix_url, amount, status')
        .eq('customer_cpf', cleanCpf)
        .eq('payment_type', payment_type || 'unknown')
        .in('status', ['pending', 'waiting_payment'])
        .gte('created_at', twoHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingPix?.pix_code) {
        console.log(`[generate-pix] Reusing existing PIX for CPF ${cleanCpf}: ${existingPix.transaction_id}`)
        return new Response(
          JSON.stringify({
            transaction_id: existingPix.transaction_id,
            pix_code: existingPix.pix_code,
            pix_qr_code_base64: existingPix.pix_qr_code_base64,
            pix_url: existingPix.pix_url,
            amount: existingPix.amount,
            status: existingPix.status,
            reused: true,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    console.log(`[generate-pix] Creating transaction: ${amountCentavos} centavos, type: ${payment_type}`)

    let result: { pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }

    // ─── Circuit breaker + provider selection ─────────────────────────────────
    if (SIGMA_API_TOKEN) {
      const sigmaCircuit = await getCircuitState(supabase, 'sigmapay')
      const sigmaBlocked = sigmaCircuit.state === 'open'

      if (sigmaBlocked) {
        // Circuit is OPEN — skip SigmaPay entirely, go straight to SkalePay
        console.warn(`[circuit-breaker] SigmaPay circuit is OPEN (opened at ${sigmaCircuit.opened_at}). Bypassing → SkalePay`)
        if (!SKALE_PAY_SECRET_KEY) throw new Error('SigmaPay circuit open and no SkalePay fallback configured')

        try {
          result = await generateWithSkale({
            amountCentavos, cleanCpf, name: safeName, email: safeEmail,
            phone: safePhone, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY,
            webhookUrl: skaleWebhookUrl,
          })
          console.log(`[generate-pix] SkalePay (circuit bypass) succeeded: ${result.transactionHash}`)
        } catch (skaleErr) {
          await recordFailure(supabase, 'skalepay', 0)
          throw skaleErr
        }
      } else {
        // Circuit is CLOSED or HALF_OPEN — try SigmaPay with tight timeout
        const isHalfOpen = sigmaCircuit.state === 'half_open'
        const timeoutMs = CB_SIGMA_TIMEOUT_MS // 9s — fail fast

        try {
          result = await generateWithSigma({
            amountCentavos, cleanCpf, name: safeName, email: safeEmail,
            phone: safePhone, paymentType: payment_type, ttclid: ttclid || '',
            apiToken: SIGMA_API_TOKEN,
            webhookUrl: sigmaWebhookUrl,
            timeoutMs,
          })
          console.log(`[generate-pix] SigmaPay succeeded${isHalfOpen ? ' (half-open probe)' : ''}: ${result.transactionHash}`)
          // Success — reset circuit
          await recordSuccess(supabase, 'sigmapay')
        } catch (sigmaErr) {
          const sigmaErrMsg = sigmaErr instanceof Error ? sigmaErr.message : String(sigmaErr)
          console.error(`[circuit-breaker] SigmaPay failure (count=${sigmaCircuit.failure_count + 1}/${CB_FAILURE_THRESHOLD}): ${sigmaErrMsg}`)

          // Record failure and potentially open the circuit
          await recordFailure(supabase, 'sigmapay', sigmaCircuit.failure_count)

          if (!SKALE_PAY_SECRET_KEY) throw sigmaErr

          // Fallback to SkalePay
          try {
            result = await generateWithSkale({
              amountCentavos, cleanCpf, name: safeName, email: safeEmail,
              phone: safePhone, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY,
              webhookUrl: skaleWebhookUrl,
            })
            console.log(`[generate-pix] SkalePay fallback succeeded: ${result.transactionHash}`)
            await recordSuccess(supabase, 'skalepay')
          } catch (skaleErr) {
            await recordFailure(supabase, 'skalepay', 0)
            throw skaleErr
          }
        }
      }
    } else if (SKALE_PAY_SECRET_KEY) {
      result = await generateWithSkale({
        amountCentavos, cleanCpf, name: safeName, email: safeEmail,
        phone: safePhone, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY,
        webhookUrl: skaleWebhookUrl,
      })
      console.log(`[generate-pix] SkalePay direct succeeded: ${result.transactionHash}`)
    } else {
      throw new Error('No payment provider configured (SIGMA_API_TOKEN or SKALE_PAY_SECRET_KEY)')
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
      customer_name: safeName,
      customer_email: safeEmail,
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
