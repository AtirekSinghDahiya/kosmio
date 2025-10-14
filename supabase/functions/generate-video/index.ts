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
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] === NEW VERSION v2.0 - REQUEST START ===`);
  console.log(`[${requestId}] Method: ${req.method}, URL: ${req.url}`);

  if (req.method === "OPTIONS") {
    console.log(`[${requestId}] Handling OPTIONS preflight`);
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log(`[${requestId}] \ud83d\udd10 Checking API key configuration...`);

    if (!RUNWAY_API_KEY) {
      console.error(`[${requestId}] \u274c RUNWAY_API_KEY environment variable is not set`);
      throw new Error("Runway API key not configured");
    }

    if (RUNWAY_API_KEY.length < 20) {
      console.error(`[${requestId}] \u274c RUNWAY_API_KEY appears to be invalid (too short)`);
      throw new Error("Invalid Runway API key configuration");
    }

    console.log(`[${requestId}] \u2705 API key configured (length: ${RUNWAY_API_KEY.length})`);

    console.log(`[${requestId}] \ud83d\udd0d Checking request body state...`);
    console.log(`[${requestId}] \ud83d\udd0d Body already consumed? ${req.bodyUsed}`);
    console.log(`[${requestId}] \ud83d\udd0d Content-Type: ${req.headers.get("Content-Type")}`);

    if (req.bodyUsed) {
      throw new Error("Request body was already consumed by middleware");
    }

    const contentType = req.headers.get("Content-Type");
    if (contentType && !contentType.includes("application/json")) {
      throw new Error(`Invalid Content-Type: ${contentType}. Expected application/json`);
    }

    let rawBody: string;
    try {
      console.log("\ud83d\udcc4 Reading request body as text...");
      rawBody = await req.text();
      console.log("\ud83d\udcc4 Raw body received (length:", rawBody.length, ")");
      console.log("\ud83d\udcc4 Raw body content:", rawBody);

      if (!rawBody || rawBody.trim() === "") {
        throw new Error("Request body is empty");
      }
    } catch (error: any) {
      console.error("\u274c Failed to read request body:", error.message);
      throw new Error(`Failed to read request body: ${error.message}`);
    }

    let body: GenerateVideoRequest;
    try {
      console.log("\ud83d\udd04 Parsing JSON...");
      body = JSON.parse(rawBody);
      console.log("\u2705 JSON parsed successfully:", JSON.stringify(body, null, 2));
    } catch (error: any) {
      console.error("\u274c JSON parsing failed:", error.message);
      console.error("\u274c Raw body that failed:", rawBody.substring(0, 200));
      throw new Error(`Invalid JSON: ${error.message}`);
    }

    console.log("\ud83d\udd0d Validating request structure...");
    if (!body || typeof body !== "object") {
      throw new Error("Request body must be an object");
    }

    if (!body.action) {
      throw new Error("Missing required field: action");
    }

    if (!["generate", "status"].includes(body.action)) {
      throw new Error(`Invalid action: ${body.action}. Must be 'generate' or 'status'`);
    }

    console.log("\u2705 Request validation passed for action:", body.action);
    console.log("\ud83d\udce5 Validated request:", JSON.stringify(body, null, 2));

    if (body.action === "generate") {
      console.log("\ud83c\udfac Starting video generation...");

      const aspectRatio = body.aspectRatio || "16:9";
      const duration = body.duration || 5;

      const resolutionMap: Record<string, string> = {
        "16:9": "1280:720",
        "9:16": "720:1280",
        "1:1": "960:960",
      };

      const resolution = resolutionMap[aspectRatio] || "1280:720";

      const payload = {
        promptText: body.prompt || "",
        model: "gen4_turbo",
        duration: duration,
        resolution: resolution,
      };

      console.log("\ud83d\udce6 Request payload:", JSON.stringify(payload, null, 2));
      console.log("\ud83c\udf10 API endpoint:", `${RUNWAY_API_BASE}/text_to_video`);

      const requestHeaders = {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      };

      console.log("\ud83d\udccb Request headers:", {
        Authorization: `Bearer ${RUNWAY_API_KEY.substring(0, 10)}...`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      });

      const response = await fetch(`${RUNWAY_API_BASE}/text_to_video`, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });

      console.log("\ud83d\udcca Response status:", response.status);
      console.log("\ud83d\udcca Response headers:", Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log("\ud83d\udcc4 Response body:", responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error("\u274c Parsed error:", JSON.stringify(errorData, null, 2));
        } catch {
          console.error("\u274c Raw error:", responseText);
          throw new Error(
            `Runway API error (${response.status}): ${responseText}`
          );
        }

        const errorMessage = errorData.message || errorData.error || errorData.detail ||
                           `Runway API error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log("\u2705 Task created successfully:", JSON.stringify(data, null, 2));

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

      console.log("\ud83d\udcca Checking status for task:", body.taskId);

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
      console.log("\ud83d\udcc4 Status response:", response.status, responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to check video status: ${response.status} - ${responseText}`
        );
      }

      const data = JSON.parse(responseText);
      console.log("\u2705 Status data:", JSON.stringify(data, null, 2));

      let videoUrl = null;
      if (data.status === "SUCCEEDED") {
        videoUrl = data.output?.[0] ||
                  data.artifacts?.[0]?.url ||
                  data.output?.url ||
                  data.video?.url ||
                  data.outputUrl;
        console.log("\ud83c\udfa5 Video URL found:", videoUrl);
      }

      return new Response(
        JSON.stringify({
          success: true,
          status: data.status,
          videoUrl,
          progress: data.progress || (data.status === "RUNNING" ? 50 : 0),
          error: data.failure || data.failureReason || data.error,
          rawData: data,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      throw new Error("Invalid action. Must be 'generate' or 'status'");
    }
  } catch (error: any) {
    console.error(`[${requestId}] \ud83d\udca5 Error occurred:`, error);
    console.error(`[${requestId}] \ud83d\udca5 Error stack:`, error.stack);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An error occurred",
        details: error.stack,
        version: "v2.0-new-validation",
        requestId: requestId,
        timestamp: new Date().toISOString(),
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