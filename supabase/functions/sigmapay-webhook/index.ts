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
    console.log('[sigmapay-webhook] Received:', JSON.stringify(payload))

    // SigmaPay payload structure:
    // { transaction: { id, status }, status, hash, transaction_hash, ... }
    const transactionHash =
      payload.transaction?.id ||
      payload.hash ||
      payload.transaction_hash ||
      payload.id
    const status = payload.status || payload.transaction?.status || payload.payment_status

    if (!transactionHash) {
      console.warn('[sigmapay-webhook] No transaction hash in payload')
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const isPaid = status && ['paid', 'approved', 'PAID', 'APPROVED', 'complete', 'COMPLETE'].includes(status)

    console.log(`[sigmapay-webhook] Hash: ${transactionHash}, Status: ${status}, isPaid: ${isPaid}`)

    if (isPaid) {
      const sigmaTransactionId = `sigma_${transactionHash}`
      const now = new Date().toISOString()

      // Try with sigma_ prefix first
      const { error, count } = await supabase
        .from('pix_payments')
        .update({ status: 'paid', paid_at: now, updated_at: now })
        .eq('transaction_id', sigmaTransactionId)
        .select('id', { count: 'exact', head: true })

      if (error || count === 0) {
        console.warn(`[sigmapay-webhook] Not found by transaction_id, trying transaction_hash`)
        // Fallback: match by raw hash
        const { error: err2 } = await supabase
          .from('pix_payments')
          .update({ status: 'paid', paid_at: now, updated_at: now })
          .eq('transaction_hash', transactionHash)

        if (err2) {
          console.error('[sigmapay-webhook] Fallback update error:', err2)
        } else {
          console.log(`[sigmapay-webhook] Payment marked paid via hash: ${transactionHash}`)
        }
      } else {
        console.log(`[sigmapay-webhook] Payment marked paid: ${sigmaTransactionId}`)
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[sigmapay-webhook] Error:', error)
    // Always return 200 so SigmaPay doesn't retry excessively
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
