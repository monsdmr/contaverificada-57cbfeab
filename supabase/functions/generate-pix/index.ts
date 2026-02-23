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
  timeoutMs?: number; zipCode: string; street: string; number: string; neighborhood: string; city: string; state: string;
  utmSource?: string; utmMedium?: string; utmCampaign?: string; utmTerm?: string; utmContent?: string;
}): Promise<{ pixCode: string; pixQrBase64: string; pixUrl: string; transactionHash: string; provider: string }> {
  const { amountCentavos, cleanCpf, name, email, phone, paymentType, ttclid, apiToken, webhookUrl, timeoutMs = CB_SIGMA_TIMEOUT_MS } = params

  // Mapeia tipo interno para título do produto
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

  const sigmaResponse = await fetch(`${SIGMA_API_URL}/transactions?api_token=${apiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      amount: amountCentavos,
      offer_hash: 'zxw2p8esaw',
      payment_method: 'pix',
      postback_url: webhookUrl,
      customer: { name, email, phone_number: phone, document: cleanCpf, zip_code: params.zipCode, street_name: params.street, number: params.number, neighborhood: params.neighborhood, city: params.city, state: params.state, country: 'br' },
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
  // SigmaPay geralmente retorna pix_url como null — construímos uma URL de fallback se possível
  const rawPixUrl = txn.pix?.url || txn.pix?.pix_url || sigmaData.pix?.pix_url || sigmaData.pix_url || ''
  const pixUrl = rawPixUrl || (pixCode ? `https://pix.sigmapay.com.br/${transactionHash}` : '')

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

  // Reutiliza o mesmo mapeamento de títulos do SigmaPay
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

    const { amount, name, email, cpf, phone, payment_type, ab_variant, ttclid, page_url, page_referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const amountCentavosOriginal = Math.round(amount * 100)

    // ─── Variação aleatória de centavos para evitar padrão detectável ─────────
    // Adiciona entre +1 e +99 centavos ao valor cobrado na adquirente
    const centavoVariation = Math.floor(Math.random() * 99) + 1
    const amountCentavos = amountCentavosOriginal + centavoVariation
    console.log(`[generate-pix] Amount variation: original=${amountCentavosOriginal}, charged=${amountCentavos} (+${centavoVariation}c)`)

    // ─── Mapa DDD → cidade/estado/CEP realista ────────────────────────────────
    const DDD_MAP: Record<number, { city: string; state: string; cep: string }> = {
      11: { city: 'São Paulo', state: 'SP', cep: '01000000' },
      12: { city: 'São José dos Campos', state: 'SP', cep: '12200000' },
      13: { city: 'Santos', state: 'SP', cep: '11000000' },
      14: { city: 'Bauru', state: 'SP', cep: '17000000' },
      15: { city: 'Sorocaba', state: 'SP', cep: '18000000' },
      16: { city: 'Ribeirão Preto', state: 'SP', cep: '14000000' },
      17: { city: 'São José do Rio Preto', state: 'SP', cep: '15000000' },
      18: { city: 'Presidente Prudente', state: 'SP', cep: '19000000' },
      19: { city: 'Campinas', state: 'SP', cep: '13000000' },
      21: { city: 'Rio de Janeiro', state: 'RJ', cep: '20000000' },
      22: { city: 'Campos dos Goytacazes', state: 'RJ', cep: '28000000' },
      24: { city: 'Volta Redonda', state: 'RJ', cep: '27200000' },
      27: { city: 'Vitória', state: 'ES', cep: '29000000' },
      28: { city: 'Cachoeiro de Itapemirim', state: 'ES', cep: '29300000' },
      31: { city: 'Belo Horizonte', state: 'MG', cep: '30000000' },
      32: { city: 'Juiz de Fora', state: 'MG', cep: '36000000' },
      33: { city: 'Governador Valadares', state: 'MG', cep: '35010000' },
      34: { city: 'Uberlândia', state: 'MG', cep: '38400000' },
      35: { city: 'Poços de Caldas', state: 'MG', cep: '37700000' },
      37: { city: 'Divinópolis', state: 'MG', cep: '35500000' },
      38: { city: 'Montes Claros', state: 'MG', cep: '39400000' },
      41: { city: 'Curitiba', state: 'PR', cep: '80000000' },
      42: { city: 'Ponta Grossa', state: 'PR', cep: '84000000' },
      43: { city: 'Londrina', state: 'PR', cep: '86000000' },
      44: { city: 'Maringá', state: 'PR', cep: '87000000' },
      45: { city: 'Foz do Iguaçu', state: 'PR', cep: '85850000' },
      46: { city: 'Francisco Beltrão', state: 'PR', cep: '85600000' },
      47: { city: 'Joinville', state: 'SC', cep: '89200000' },
      48: { city: 'Florianópolis', state: 'SC', cep: '88000000' },
      49: { city: 'Chapecó', state: 'SC', cep: '89800000' },
      51: { city: 'Porto Alegre', state: 'RS', cep: '90000000' },
      53: { city: 'Pelotas', state: 'RS', cep: '96000000' },
      54: { city: 'Caxias do Sul', state: 'RS', cep: '95000000' },
      55: { city: 'Santa Maria', state: 'RS', cep: '97000000' },
      61: { city: 'Brasília', state: 'DF', cep: '70000000' },
      62: { city: 'Goiânia', state: 'GO', cep: '74000000' },
      63: { city: 'Palmas', state: 'TO', cep: '77000000' },
      64: { city: 'Rio Verde', state: 'GO', cep: '75900000' },
      65: { city: 'Cuiabá', state: 'MT', cep: '78000000' },
      66: { city: 'Rondonópolis', state: 'MT', cep: '78700000' },
      67: { city: 'Campo Grande', state: 'MS', cep: '79000000' },
      68: { city: 'Rio Branco', state: 'AC', cep: '69900000' },
      69: { city: 'Porto Velho', state: 'RO', cep: '76800000' },
      71: { city: 'Salvador', state: 'BA', cep: '40000000' },
      73: { city: 'Ilhéus', state: 'BA', cep: '45650000' },
      74: { city: 'Juazeiro', state: 'BA', cep: '48900000' },
      75: { city: 'Feira de Santana', state: 'BA', cep: '44000000' },
      77: { city: 'Barreiras', state: 'BA', cep: '47800000' },
      79: { city: 'Aracaju', state: 'SE', cep: '49000000' },
      81: { city: 'Recife', state: 'PE', cep: '50000000' },
      82: { city: 'Maceió', state: 'AL', cep: '57000000' },
      83: { city: 'João Pessoa', state: 'PB', cep: '58000000' },
      84: { city: 'Natal', state: 'RN', cep: '59000000' },
      85: { city: 'Fortaleza', state: 'CE', cep: '60000000' },
      86: { city: 'Teresina', state: 'PI', cep: '64000000' },
      87: { city: 'Petrolina', state: 'PE', cep: '56300000' },
      88: { city: 'Juazeiro do Norte', state: 'CE', cep: '63000000' },
      91: { city: 'Belém', state: 'PA', cep: '66000000' },
      92: { city: 'Manaus', state: 'AM', cep: '69000000' },
      93: { city: 'Santarém', state: 'PA', cep: '68000000' },
      94: { city: 'Marabá', state: 'PA', cep: '68500000' },
      95: { city: 'Boa Vista', state: 'RR', cep: '69300000' },
      96: { city: 'Macapá', state: 'AP', cep: '68900000' },
      98: { city: 'São Luís', state: 'MA', cep: '65000000' },
      99: { city: 'Imperatriz', state: 'MA', cep: '65900000' },
    }
    const STREET_NAMES = [
      'Rua das Flores', 'Rua São Paulo', 'Rua Rio de Janeiro', 'Rua Bahia',
      'Rua XV de Novembro', 'Rua Sete de Setembro', 'Rua Santos Dumont',
      'Av. Brasil', 'Av. Getúlio Vargas', 'Rua Tiradentes', 'Rua Paraná',
      'Rua Goiás', 'Rua Minas Gerais', 'Rua Dom Pedro II', 'Rua Marechal Deodoro',
    ]
    const NEIGHBORHOODS = [
      'Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Santa Cruz',
      'São José', 'Jardim Europa', 'Vila Maria', 'Santo Antônio', 'Liberdade',
    ]

    // CPF: somente dígitos, exatamente 11 — NÃO faz zero-padding (CPF real nunca começa com 00)
    const rawCpf = (cpf || '').replace(/\D/g, '')
    const cleanCpf = (rawCpf.length === 11) ? rawCpf : '00000000000'

    // Nome: usa real se válido (mínimo 3 chars), senão sorteia nome brasileiro comum
    const FALLBACK_NAMES = [
      'Ana Carolina Lima', 'Carlos Eduardo Silva', 'Maria Aparecida Souza',
      'João Pedro Oliveira', 'Fernanda Cristina Costa', 'Ricardo Augusto Pereira',
      'Juliana de Almeida Santos', 'Bruno Henrique Almeida', 'Patricia Maria Rocha',
      'Lucas Gabriel Ferreira', 'Amanda Cristina Carvalho', 'Rodrigo dos Santos Martins',
      'Camila Rodrigues Gomes', 'Felipe Souza Barbosa', 'Renata Aparecida Ribeiro',
      'Marcelo José Araujo', 'Viviane Costa Nascimento', 'Eduardo Luiz Moreira',
      'Tatiane Oliveira Nunes', 'Guilherme Henrique Dias',
    ]
    let safeName = (name && name !== 'undefined' && name.trim().length >= 3)
      ? name.trim()
      : FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)]

    // Garante que o nome tenha pelo menos 2 palavras (exigência SigmaPay/SkalePay)
    if (safeName.split(/\s+/).filter(Boolean).length < 2) {
      const FALLBACK_SURNAMES = ['da Silva', 'dos Santos', 'de Oliveira', 'de Souza', 'Pereira', 'Ferreira', 'Rodrigues', 'de Almeida']
      safeName = `${safeName} ${FALLBACK_SURNAMES[Math.floor(Math.random() * FALLBACK_SURNAMES.length)]}`
    }

    // Email: usa real se válido, senão gera com padrão mais natural
    function generateEmail(forName: string): string {
      const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br', 'live.com', 'bol.com.br', 'terra.com.br']
      const weights =  [40, 18, 12, 8, 7, 5, 5, 5]
      const total = weights.reduce((a, b) => a + b, 0)
      let r = Math.random() * total
      let domain = domains[domains.length - 1]
      for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) { domain = domains[i]; break } }

      const cleanedName = forName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z\s]/g, '').trim()
      const parts = cleanedName.split(/\s+/).filter(Boolean)
      const year = 1965 + Math.floor(Math.random() * 40) // 1965–2004
      const num2 = Math.floor(Math.random() * 99) + 1
      const num4 = Math.floor(Math.random() * 9000) + 1000

      if (parts.length >= 2) {
        const first = parts[0], last = parts[parts.length - 1]
        // Padrões mais naturais e variados
        const variants = [
          `${first}.${last}`,           // maria.silva
          `${first}${last}${year}`,     // mariasilva1987
          `${first}.${last}${num2}`,    // maria.silva42
          `${first}${year}`,            // maria1987
          `${first}_${last}`,           // maria_silva
          `${first}${last}`,            // mariasilva
          `${first}.${last}${num4}`,    // maria.silva3847
          `${last}.${first}${num2}`,    // silva.maria42
        ]
        return `${variants[Math.floor(Math.random() * variants.length)]}@${domain}`
      }
      return `${parts[0] || 'usuario'}${year}@${domain}`
    }

    const rawEmail = (email || '').trim().toLowerCase()
    const safeEmail = (rawEmail && rawEmail !== 'undefined' && rawEmail.includes('@') && rawEmail.includes('.') && rawEmail.length <= 254)
      ? rawEmail
      : generateEmail(safeName)

    // Telefone: somente dígitos, exatamente 11 (DDD + 9 + 8 dígitos)
    function generatePhone(): string {
      const ddds = [11,12,13,14,15,16,17,18,19,21,22,24,27,28,31,32,33,34,35,37,38,41,42,43,44,45,46,47,48,49,51,53,54,55,61,62,63,64,65,66,67,71,73,74,75,77,79,81,82,83,84,85,86,87,88,91,92,93,94,95,96,98,99]
      const ddd = ddds[Math.floor(Math.random() * ddds.length)]
      const second = [6,7,8,9][Math.floor(Math.random() * 4)]
      const rest = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
      return `${ddd}9${second}${rest}`
    }

    const rawPhone = (phone || '').replace(/\D/g, '')
    const safePhone = (rawPhone.length === 11) ? rawPhone : generatePhone()

    // Endereço realista baseado no DDD do telefone
    const ddd = parseInt(safePhone.substring(0, 2), 10)
    const geoData = DDD_MAP[ddd] || { city: 'São Paulo', state: 'SP', cep: '01000000' }
    // Variação aleatória nos últimos 3 dígitos do CEP para não ser sempre igual
    const cepBase = geoData.cep.substring(0, 5)
    const cepSuffix = String(Math.floor(Math.random() * 900) + 100) // 100-999
    const safeCep = `${cepBase}${cepSuffix}`
    const safeStreet = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)]
    const safeNumber = String(Math.floor(Math.random() * 2000) + 1) // 1-2000
    const safeNeighborhood = NEIGHBORHOODS[Math.floor(Math.random() * NEIGHBORHOODS.length)]

    console.log(`[generate-pix] Sanitized — CPF: ${cleanCpf.length}d, Phone: ${safePhone.substring(0,2)}, City: ${geoData.city}/${geoData.state}, Name: ${safeName.split(/\s+/).length}w`)

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
            zipCode: safeCep, street: safeStreet, number: safeNumber,
            neighborhood: safeNeighborhood, city: geoData.city, state: geoData.state,
            utmSource: utm_source, utmMedium: utm_medium, utmCampaign: utm_campaign,
            utmTerm: utm_term, utmContent: utm_content,
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
