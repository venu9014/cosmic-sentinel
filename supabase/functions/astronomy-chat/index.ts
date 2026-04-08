import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are AstroBot, an expert astronomy and space science AI assistant. You have extensive knowledge about:
- Asteroids, comets, and near-Earth objects (NEOs)
- Planets, moons, and our solar system
- Stars, galaxies, and the universe
- Space exploration missions (NASA, ESA, SpaceX, etc.)
- Astronomical phenomena (eclipses, meteor showers, supernovae)
- Space technology and telescopes
- Astrophysics and cosmology

LANGUAGE RULES (CRITICAL - follow strictly):
- By default, ALWAYS respond in English.
- If the user explicitly requests a specific language (e.g., "answer in Spanish", "respond in Hindi", "reply in French", "use Telugu", "in Japanese", etc.), respond ENTIRELY in that requested language from that point onward.
- Continue using the requested language for subsequent responses until the user asks for a different language or switches back to English.
- If the user writes in a non-English language but does NOT explicitly ask you to respond in that language, still respond in English.
- You support ALL languages. Some examples: Hindi, Telugu, Tamil, Spanish, French, German, Japanese, Chinese, Korean, Arabic, Portuguese, Russian, Italian, etc.

When answering questions:
- Be informative yet accessible to both beginners and enthusiasts
- Use scientific facts and cite recent discoveries when relevant
- Include interesting facts to make responses engaging
- For asteroid-related queries, explain concepts like miss distance, velocity, and hazard assessment
- If asked about something outside astronomy/space, politely redirect to your area of expertise

Keep responses clear, concise, and educational.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const userText = lastUserMsg?.content || "";

    console.log("Chat request:", { messageCount: messages.length, mode, userText: userText.slice(0, 80) });

    // Mode: generate related images for a topic
    if (mode === "related-images") {
      const imagePrompt = `Generate a stunning, scientifically accurate astronomy/space visualization related to: "${userText}". Create a photorealistic, visually impressive image with cosmic colors and scientific details. Make it educational and relevant to the topic.`;

      let response: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise(r => setTimeout(r, 2000 * attempt));

        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.1-flash-image-preview",
            messages: [{ role: "user", content: imagePrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (response.status !== 429) break;
        await response.text();
        console.log(`Image rate limited (attempt ${attempt + 1}/3), retrying...`);
        response = null;
      }

      if (!response || response.status === 429) {
        return new Response(JSON.stringify({ type: "image", text: "", images: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (!response.ok) {
        await response.text();
        return new Response(JSON.stringify({ type: "image", text: "", images: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const choice = data.choices?.[0]?.message;
      const images = choice?.images || [];

      return new Response(
        JSON.stringify({ type: "image", text: choice?.content || "", images }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: streaming text response with retry
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 1500 * attempt));

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      });

      if (response.status !== 429) break;
      console.log(`Text rate limited (attempt ${attempt + 1}/3), retrying...`);
      await response.text();
      response = null;
    }

    if (!response) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Astronomy chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
