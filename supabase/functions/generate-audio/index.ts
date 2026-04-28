import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SARVAM_API_KEY = Deno.env.get("SARVAM_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // ── Auth: verify the user is logged in ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!SARVAM_API_KEY) {
      throw new Error("Sarvam API key not configured on server.");
    }

    // ── Parse request body ──
    const { text, model, speaker, pace, sample_rate, temperature } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Proxy to Sarvam TTS API ──
    const payload: Record<string, unknown> = {
      text: text.trim(),
      target_language_code: "en-IN",
      speaker: speaker ?? "anushka",
      model: model ?? "bulbul:v2",
      pace: pace ?? 1.0,
      sample_rate: sample_rate ?? 22050,
    };

    // temperature only supported by v3
    if (model === "bulbul:v3" && temperature !== undefined) {
      payload.temperature = temperature;
    }

    console.log(`[generate-audio] user=${user.id} model=${payload.model} chars=${text.length}`);

    const sarvamRes = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error(`[generate-audio] Sarvam error ${sarvamRes.status}: ${errText}`);
      throw new Error(`Sarvam API error (${sarvamRes.status}): ${errText}`);
    }

    const sarvamData = await sarvamRes.json();

    if (!sarvamData.audios || sarvamData.audios.length === 0) {
      throw new Error("Sarvam returned no audio data.");
    }

    return new Response(
      JSON.stringify({ success: true, audio: sarvamData.audios[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[generate-audio] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
