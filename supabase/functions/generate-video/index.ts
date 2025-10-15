import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY") || "key_cff628ee8fed37b71af389ddf8d0d5fcca392c33e0822e4959e2f7c47161397fb25ad7dd8bf297f0fadd9ee34bd2bd1a7ce643c05177e799d2a3d98e";
const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";
const PIXVERSE_API_KEY = Deno.env.get("PIXVERSE_API_KEY") || "sk-02a32a4f8964c44ade58cb1f396146dd";
const PIXVERSE_API_BASE = "https://api.pixverse.ai/v2";

Deno.serve(async (req: Request) => {
  const rid = crypto.randomUUID().slice(0, 8);
  console.log(`[${rid}] gen4_turbo | ${req.method} ${req.url}`);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const text = await req.text();
    console.log(`[${rid}] Body:`, text);

    const body = JSON.parse(text);
    console.log(`[${rid}] Parsed:`, JSON.stringify(body));

    const provider = body.provider || "pixverse";

    if (body.action === "generate" && provider === "pixverse") {
      if (!PIXVERSE_API_KEY) {
        throw new Error("PIXVERSE_API_KEY not configured");
      }

      const payload = {
        prompt: body.prompt || "",
        aspect_ratio: body.aspectRatio || "16:9",
        seed: body.seed || Math.floor(Math.random() * 1000000)
      };

      console.log(`[${rid}] Calling Pixverse:`, JSON.stringify(payload));

      const res = await fetch(`${PIXVERSE_API_BASE}/video/generate`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${PIXVERSE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resText = await res.text();
      console.log(`[${rid}] Pixverse response (${res.status}):`, resText);

      if (!res.ok) {
        throw new Error(`Pixverse API error (${res.status}): ${resText}`);
      }

      const data = JSON.parse(resText);
      return new Response(
        JSON.stringify({ success: true, taskId: data.id || data.task_id, data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (body.action === "status" && provider === "pixverse") {
      if (!body.taskId) {
        throw new Error("taskId required for status check");
      }

      console.log(`[${rid}] Checking Pixverse status:`, body.taskId);

      const res = await fetch(`${PIXVERSE_API_BASE}/video/status/${body.taskId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PIXVERSE_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      const resText = await res.text();
      console.log(`[${rid}] Pixverse status response (${res.status}):`, resText);

      if (!res.ok) {
        throw new Error(`Status check failed (${res.status}): ${resText}`);
      }

      const data = JSON.parse(resText);
      let videoUrl = null;

      if (data.status === "completed" || data.state === "completed") {
        videoUrl = data.video_url || data.output?.video_url || data.video?.url;
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: data.status || data.state,
          videoUrl,
          progress: data.progress || (data.status === "processing" ? 50 : 0),
          error: data.error || data.failure_reason,
          rawData: data
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (body.action === "generate") {
      if (!RUNWAY_API_KEY) {
        throw new Error("RUNWAY_API_KEY not configured");
      }
      const payload = {
        promptText: body.prompt || "",
        model: "gen4_turbo",
        duration: body.duration || 5,
        ratio: body.aspectRatio === "9:16" ? "720:1280" : body.aspectRatio === "1:1" ? "960:960" : "1280:720"
      };

      console.log(`[${rid}] Calling Runway:`, JSON.stringify(payload));

      const res = await fetch(`${RUNWAY_API_BASE}/text_to_video`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06"
        },
        body: JSON.stringify(payload)
      });

      const resText = await res.text();
      console.log(`[${rid}] Runway response (${res.status}):`, resText);

      if (!res.ok) {
        throw new Error(`Runway API error (${res.status}): ${resText}`);
      }

      const data = JSON.parse(resText);
      return new Response(
        JSON.stringify({ success: true, taskId: data.id, data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (body.action === "status") {
      if (!body.taskId) {
        throw new Error("taskId required for status check");
      }

      console.log(`[${rid}] Checking status:`, body.taskId);

      const res = await fetch(`${RUNWAY_API_BASE}/tasks/${body.taskId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06"
        }
      });

      const resText = await res.text();
      console.log(`[${rid}] Status response (${res.status}):`, resText);

      if (!res.ok) {
        throw new Error(`Status check failed (${res.status}): ${resText}`);
      }

      const data = JSON.parse(resText);
      let videoUrl = null;
      
      if (data.status === "SUCCEEDED") {
        videoUrl = data.output?.[0] || data.artifacts?.[0]?.url || data.output?.url || data.video?.url || data.outputUrl;
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: data.status,
          videoUrl,
          progress: data.progress || (data.status === "RUNNING" ? 50 : 0),
          error: data.failure || data.failureReason || data.error,
          rawData: data
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      throw new Error(`Invalid action: ${body.action}`);
    }
  } catch (err: any) {
    console.error(`[${rid}] ERROR:`, err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message, version: "gen4_turbo" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
