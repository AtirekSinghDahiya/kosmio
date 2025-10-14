import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  const rid = crypto.randomUUID().slice(0, 8);
  console.log(`[${rid}] ===ULTRA-SIMPLE TEST v3===`);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    console.log(`[${rid}] Reading body...`);
    const text = await req.text();
    console.log(`[${rid}] Body text:`, text);
    
    const json = JSON.parse(text);
    console.log(`[${rid}] Parsed:`, JSON.stringify(json));

    return new Response(
      JSON.stringify({ success: true, test: "v3-ultra-simple", got: json }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error(`[${rid}] ERROR:`, err.message, err.stack);
    return new Response(
      JSON.stringify({ success: false, error: err.message, test: "v3-ultra-simple", stack: err.stack }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});