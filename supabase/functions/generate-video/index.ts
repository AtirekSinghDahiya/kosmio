import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
const RUNWAY_API_BASE = "https://api.dev.runwayml.com/v1";

interface GenerateVideoRequest {
  action: "generate" | "status";
  prompt?: string;
  duration?: number;
  aspectRatio?: string;
  taskId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!RUNWAY_API_KEY) {
      throw new Error("Runway API key not configured");
    }

    const body: GenerateVideoRequest = await req.json();
    console.log("📥 Received request:", body);

    if (body.action === "generate") {
      const payload = {
        promptText: body.prompt || "",
        model: "gen3a_turbo",
        duration: body.duration || 5,
        ratio: body.aspectRatio || "16:9",
        watermark: false,
      };

      console.log("🎬 Generating video with payload:", payload);
      console.log("🔑 Using API base:", RUNWAY_API_BASE);

      const response = await fetch(`${RUNWAY_API_BASE}/image-to-video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06",
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("📤 Runway API response:", response.status, responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Runway API error (${response.status}): ${responseText}`
          );
        }
        throw new Error(
          errorData.message || errorData.error ||
            `Runway API error: ${response.status}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("✅ Task created:", data);

      return new Response(
        JSON.stringify({ success: true, taskId: data.id, data }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else if (body.action === "status") {
      if (!body.taskId) {
        throw new Error("Task ID is required for status check");
      }

      console.log("📊 Checking status for task:", body.taskId);

      const response = await fetch(
        `${RUNWAY_API_BASE}/tasks/${body.taskId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${RUNWAY_API_KEY}`,
            "Content-Type": "application/json",
            "X-Runway-Version": "2024-11-06",
          },
        }
      );

      const responseText = await response.text();
      console.log("📤 Status response:", response.status, responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to check video status: ${response.status} - ${responseText}`
        );
      }

      const data = JSON.parse(responseText);

      let videoUrl = null;
      if (data.status === "SUCCEEDED") {
        videoUrl = data.output?.[0] || data.artifacts?.[0]?.url ||
          data.output?.url || data.video?.url;
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: data.status,
          videoUrl,
          progress: data.progress || (data.status === "RUNNING" ? 50 : 0),
          error: data.failure || data.failureReason || data.error,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      throw new Error("Invalid action");
    }
  } catch (error: any) {
    console.error("💥 Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});