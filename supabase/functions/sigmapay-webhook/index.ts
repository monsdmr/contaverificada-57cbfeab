import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

/** #12 - Webhook para receber notificações de pagamento da SigmaPay */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const payload = await req.json()
    console.log('[webhook] Received:', JSON.stringify(payload))

    // SigmaPay sends: hash, status, payment_status, transaction
    const hash = payload.hash || payload.transaction_hash || payload.transaction?.hash
    const status = payload.payment_status || payload.status || payload.transaction?.payment_status

    if (!hash) {
      console.warn('[webhook] No hash in payload')
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[webhook] Hash: ${hash}, Status: ${status}`)

    if (status === 'paid' || status === 'approved') {
      const { data, error } = await supabase
        .from('pix_payments')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('transaction_hash', hash)
        .select('transaction_id')

      if (error) {
        console.error('[webhook] DB update error:', error)
      } else {
        console.log(`[webhook] Payment confirmed for hash ${hash}:`, data)
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[webhook] Error:', error)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, // Always 200 to avoid SigmaPay retries on our errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
