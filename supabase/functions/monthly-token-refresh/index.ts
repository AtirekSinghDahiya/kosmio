import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RefreshResult {
  users_refreshed: number;
  total_tokens_granted: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Verify this is being called by cron or admin
    const authHeader = req.headers.get('Authorization');
    const apiKey = req.headers.get('apikey');

    // Create Supabase client with service role key for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🔄 Starting monthly token refresh...');

    // Call the database function to refresh tokens
    const { data, error } = await supabase.rpc('refresh_monthly_free_tokens');

    if (error) {
      console.error('❌ Refresh failed:', error);
      throw error;
    }

    const result = data as RefreshResult[];
    const refreshResult = result[0];

    const response = {
      success: true,
      message: 'Monthly token refresh completed',
      users_refreshed: refreshResult?.users_refreshed || 0,
      total_tokens_granted: refreshResult?.total_tokens_granted || 0,
      timestamp: new Date().toISOString(),
    };

    console.log('✅ Refresh complete:', response);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('💥 Error in monthly-token-refresh:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
