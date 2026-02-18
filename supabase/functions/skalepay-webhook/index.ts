import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const payload = await req.json()
    console.log('[skalepay-webhook] Received:', JSON.stringify(payload))

    const transactionId = payload.transaction_id || payload.id || payload.hash
    const status = payload.status || payload.payment_status

    if (!transactionId) {
      console.warn('[skalepay-webhook] No transaction_id in payload')
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const isPaid = status && ['paid', 'approved', 'PAID', 'APPROVED'].includes(status)

    if (isPaid) {
      // Try with skale_ prefix
      const skaleTransactionId = `skale_${transactionId}`

      const { error } = await supabase
        .from('pix_payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('transaction_id', skaleTransactionId)

      if (error) {
        console.error('[skalepay-webhook] Update error:', error)
        // Try without prefix (transaction_hash match)
        await supabase
          .from('pix_payments')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('transaction_hash', transactionId)
      } else {
        console.log(`[skalepay-webhook] Payment marked as paid: ${skaleTransactionId}`)
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('[skalepay-webhook] Error:', error)
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
