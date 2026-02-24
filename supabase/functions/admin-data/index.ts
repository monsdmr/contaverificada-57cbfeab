import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')
    const providedPassword = req.headers.get('x-admin-password')

    if (!adminPassword || !providedPassword || providedPassword !== adminPassword) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const todayStart = new Date().toISOString().slice(0, 10)

    // Fetch all data in parallel
    const [summaryToday, summaryTotal, stepsData, abData] = await Promise.all([
      supabase.from('pix_payments').select('status, amount').gte('created_at', todayStart),
      supabase.from('pix_payments').select('status, amount'),
      supabase.from('pix_payments').select('payment_type, status, amount').gte('created_at', todayStart),
      supabase.from('pix_payments').select('ab_variant, status, amount').eq('payment_type', 'upsell_tenf').not('ab_variant', 'is', null).gte('created_at', todayStart),
    ])

    return new Response(JSON.stringify({
      summaryToday: summaryToday.data,
      summaryTotal: summaryTotal.data,
      stepsData: stepsData.data,
      abData: abData.data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[admin-data] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
