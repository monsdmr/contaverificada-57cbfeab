import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const SIGMA_API_URL = 'https://api.sigmapay.com.br/api/public/v1'
const SKALE_API_URL = 'https://api.conta.skalepay.com.br/v1'

// ─── Circuit Breaker Config ───────────────────────────────────────────────────
const CB_FAILURE_THRESHOLD = 5
const CB_OPEN_DURATION_MS  = 120_000
const CB_SIGMA_TIMEOUT_MS  = 15_000
const CB_SKALE_TIMEOUT_MS  = 30_000

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

// ─── Dados do lead: só envia o que existe de verdade ──────────────────────────
interface LeadData {
  cleanCpf: string
  name: string | null      // null = não tem dado real
  
  zipCode: string | null
  city: string | null
  state: string | null
}

// ─── SigmaPay provider ────────────────────────────────────────────────────────
async function generateWithSigma(params: {
  amountCentavos: number; lead: LeadData; paymentType: string; ttclid: string;
  apiToken: string; webhookUrl: string; timeoutMs?: number;
  utmSource?: string; utmMedium?: string; utmCampaign?: string; utmTerm?: string; utmContent?: string;
  clientIp?: string; userAgent?: string;
}): Promise<{ pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }> {
  const { amountCentavos, lead, paymentType, ttclid, apiToken, webhookUrl, timeoutMs = CB_SIGMA_TIMEOUT_MS } = params

  const PAYMENT_TYPE_LABELS: Record<string, string> = {
    tax:                    'Livro Um',
    upsell_tenf:            'Livro Dois',
    upsell_transacional:    'Livro Três',
    upsell_anti_fraude:     'Livro Quatro',
    upsell_anti_reversao:   'Livro Cinco',
    upsell_anti_erros:      'Livro Seis',
    upsell_saque_imediato:  'Livro Sete',
    upsell_saldo_duplicado: 'Livro Oito',
    upsell_bonus_oculto:    'Livro Nove',
  }
  const itemTitle = PAYMENT_TYPE_LABELS[paymentType] || 'Livro Digital'

  const sigmaHeaders: Record<string, string> = { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  if (params.clientIp) sigmaHeaders['X-Forwarded-For'] = params.clientIp
  if (params.userAgent) sigmaHeaders['User-Agent'] = params.userAgent

  // Formata CPF com pontos e traço para exibição no dashboard
  const fmtCpf = lead.cleanCpf.length === 11
    ? `${lead.cleanCpf.slice(0,3)}.${lead.cleanCpf.slice(3,6)}.${lead.cleanCpf.slice(6,9)}-${lead.cleanCpf.slice(9)}`
    : lead.cleanCpf

  // Monta customer apenas com campos que existem de verdade
  const customer: Record<string, string> = {
    document: fmtCpf,
    cpf: fmtCpf,
    country: 'br',
  }
  if (lead.name) customer.name = lead.name
  if (params.clientIp) customer.ip = params.clientIp
  if (lead.zipCode) customer.zip_code = lead.zipCode
  if (lead.city) customer.city = lead.city
  if (lead.state) customer.state = lead.state
  // Só envia endereço se tiver CEP real
  if (lead.zipCode) {
    customer.street_name = 'Rua Principal'
    customer.number = '100'
    customer.neighborhood = 'Centro'
  }

  const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions?api_token=${apiToken}`, {
    method: 'POST',
    headers: sigmaHeaders,
    body: JSON.stringify({
      amount: amountCentavos,
      offer_hash: 'zxw2p8esaw',
      payment_method: 'pix',
      postback_url: webhookUrl,
      customer,
      cart: [{
        product_hash: '31atjri7nd', title: itemTitle,
        cover: 'https://dlzpblyjxiqfa.cloudfront.net/903979396/products/903lgdug3fk9ecaopmgsmvzde',
        price: amountCentavos, quantity: 1, operation_type: 1, tangible: true,
      }],
      expire_in_days: 1,
      transaction_origin: 'checkout',
      tracking: {
        src: ttclid || '',
        utm_source: params.utmSource || (ttclid ? 'tiktok' : 'organic'),
        utm_medium: params.utmMedium || (ttclid ? 'paid' : 'direct'),
        utm_campaign: params.utmCampaign || (ttclid ? 'recompensas' : ''),
        utm_term: params.utmTerm || '',
        utm_content: params.utmContent || (ttclid ? 'video' : ''),
      },
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
  const pixQrBase64 = txn.pix?.qr_code_base64 || sigmaData.pix?.qr_code_base64 || sigmaData.pix_qr_code_base64 || ''
  const rawPixUrl = txn.pix?.url || txn.pix?.pix_url || sigmaData.pix?.pix_url || sigmaData.pix_url || ''
  const pixUrl = rawPixUrl || (pixCode ? `https://pix.sigmapay.com.br/${transactionHash}` : '')

  if (!pixCode) throw new Error(`SigmaPay: pix_code missing in response. Keys: ${Object.keys(sigmaData).join(', ')}`)

  return { pixCode, pixQrBase64, pixUrl, transactionHash, provider: 'sigma' }
}

// ─── SkalePay provider ────────────────────────────────────────────────────────
async function generateWithSkale(params: {
  amountCentavos: number; lead: LeadData; paymentType: string;
  secretKey: string; webhookUrl: string;
}): Promise<{ pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }> {
  const { amountCentavos, lead, secretKey, webhookUrl } = params

  const basicAuth = btoa(`${secretKey}:x`)

  const SKALE_PAYMENT_TYPE_LABELS: Record<string, string> = {
    tax:                    'Livro Um',
    upsell_tenf:            'Livro Dois',
    upsell_transacional:    'Livro Três',
    upsell_anti_fraude:     'Livro Quatro',
    upsell_anti_reversao:   'Livro Cinco',
    upsell_anti_erros:      'Livro Seis',
    upsell_saque_imediato:  'Livro Sete',
    upsell_saldo_duplicado: 'Livro Oito',
    upsell_bonus_oculto:    'Livro Nove',
  }
  const skaleItemTitle = SKALE_PAYMENT_TYPE_LABELS[params.paymentType] || 'Livro Digital'

  // Monta customer — SkalePay exige email, gera placeholder com CPF
  const skaleEmail = `${lead.cleanCpf}@cliente.pix`
  const customer: Record<string, unknown> = {
    document: { type: lead.cleanCpf.length <= 11 ? 'cpf' : 'cnpj', number: lead.cleanCpf },
    email: skaleEmail,
  }
  if (lead.name) customer.name = lead.name

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
      customer,
      items: [{
        title: skaleItemTitle,
        unitPrice: amountCentavos,
        quantity: 1,
        tangible: true,
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

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || ''

    const { amount, name, cpf, payment_type, ab_variant, ttclid, page_url, page_referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amountCentavosOriginal = Math.round(amount * 100)
    const centavoVariation = Math.floor(Math.random() * 99) + 1
    const amountCentavos = amountCentavosOriginal + centavoVariation
    console.log(`[generate-pix] Amount variation: original=${amountCentavosOriginal}, charged=${amountCentavos} (+${centavoVariation}c)`)

    // ─── Extrair apenas dados reais do lead ───────────────────────────────────
    const rawCpf = (cpf || '').replace(/\D/g, '')
    const cleanCpf = (rawCpf.length === 11) ? rawCpf : '00000000000'

    // Nome: só se tiver dado real com >= 3 chars
    let safeName: string | null = (name && name !== 'undefined' && name.trim().length >= 3)
      ? name.trim()
      : null
    // Se tem nome mas é palavra única, adiciona sobrenome
    if (safeName && safeName.split(/\s+/).filter(Boolean).length < 2) {
      safeName = `${safeName} Lead`
    }

    const lead: LeadData = { cleanCpf, name: safeName, zipCode: null, city: null, state: null }

    console.log(`[generate-pix] Lead data — CPF: ${cleanCpf.length}d, Name: ${safeName || 'none'}`)

    const sigmaWebhookUrl = `${SUPABASE_URL}/functions/v1/sigmapay-webhook`
    const skaleWebhookUrl = `${SUPABASE_URL}/functions/v1/skalepay-webhook`

    // Deduplication by CPF
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
        console.warn(`[circuit-breaker] SigmaPay circuit is OPEN (opened at ${sigmaCircuit.opened_at}). Bypassing → SkalePay`)
        if (!SKALE_PAY_SECRET_KEY) throw new Error('SigmaPay circuit open and no SkalePay fallback configured')

        try {
          result = await generateWithSkale({
            amountCentavos, lead, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY,
            webhookUrl: skaleWebhookUrl,
          })
          console.log(`[generate-pix] SkalePay (circuit bypass) succeeded: ${result.transactionHash}`)
        } catch (skaleErr) {
          await recordFailure(supabase, 'skalepay', 0)
          throw skaleErr
        }
      } else {
        const isHalfOpen = sigmaCircuit.state === 'half_open'

        try {
          result = await generateWithSigma({
            amountCentavos, lead, paymentType: payment_type, ttclid: ttclid || '',
            apiToken: SIGMA_API_TOKEN,
            webhookUrl: sigmaWebhookUrl,
            timeoutMs: CB_SIGMA_TIMEOUT_MS,
            utmSource: utm_source, utmMedium: utm_medium, utmCampaign: utm_campaign,
            utmTerm: utm_term, utmContent: utm_content,
            clientIp,
            userAgent: req.headers.get('user-agent') || '',
          })
          console.log(`[generate-pix] SigmaPay succeeded${isHalfOpen ? ' (half-open probe)' : ''}: ${result.transactionHash}`)
          await recordSuccess(supabase, 'sigmapay')
        } catch (sigmaErr) {
          const sigmaErrMsg = sigmaErr instanceof Error ? sigmaErr.message : String(sigmaErr)
          console.error(`[circuit-breaker] SigmaPay failure (count=${sigmaCircuit.failure_count + 1}/${CB_FAILURE_THRESHOLD}): ${sigmaErrMsg}`)
          await recordFailure(supabase, 'sigmapay', sigmaCircuit.failure_count)

          if (!SKALE_PAY_SECRET_KEY) throw sigmaErr

          try {
            result = await generateWithSkale({
              amountCentavos, lead, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY,
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
        amountCentavos, lead, paymentType: payment_type, secretKey: SKALE_PAY_SECRET_KEY,
        webhookUrl: skaleWebhookUrl,
      })
      console.log(`[generate-pix] SkalePay direct succeeded: ${result.transactionHash}`)
    } else {
      throw new Error('No payment provider configured (SIGMA_API_TOKEN or SKALE_PAY_SECRET_KEY)')
    }

    const transactionId = `${result.provider}_${result.transactionHash}`

    // Save to database — só salva campos que existem
    const dbRecord: Record<string, unknown> = {
      transaction_id: transactionId,
      transaction_hash: result.transactionHash,
      amount,
      status: 'pending',
      payment_type: payment_type || 'unknown',
      pix_code: result.pixCode,
      pix_qr_code_base64: result.pixQrBase64,
      pix_url: result.pixUrl,
      customer_cpf: cleanCpf,
      ab_variant: ab_variant || null,
      ttclid: ttclid || null,
      page_url: page_url || null,
      page_referrer: page_referrer || null,
      ip_address: clientIp || null,
      user_agent: req.headers.get('user-agent') || null,
    }
    if (safeName) dbRecord.customer_name = safeName

    const { error: dbError } = await supabase.from('pix_payments').insert(dbRecord)
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
