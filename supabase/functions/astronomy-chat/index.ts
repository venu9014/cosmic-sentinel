import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const IMAGE_KEYWORDS = [
  "generate", "create", "draw", "make", "show me", "picture", "image",
  "illustration", "visualize", "render", "paint", "design", "sketch",
  "photo of", "imagine", "depict",
];

function isImageRequest(message: string): boolean {
  const lower = message.toLowerCase();
  return IMAGE_KEYWORDS.some((kw) => lower.includes(kw)) &&
    (lower.includes("image") || lower.includes("picture") || lower.includes("photo") ||
     lower.includes("draw") || lower.includes("generate") || lower.includes("create") ||
     lower.includes("show me") || lower.includes("visualize") || lower.includes("illustrat"));
}

const systemPrompt = `You are AstroBot, an expert astronomy and space science AI assistant. You have extensive knowledge about:
- Asteroids, comets, and near-Earth objects (NEOs)
- Planets, moons, and our solar system
- Stars, galaxies, and the universe
- Space exploration missions (NASA, ESA, SpaceX, etc.)
- Astronomical phenomena (eclipses, meteor showers, supernovae)
- Space technology and telescopes
- Astrophysics and cosmology

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
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const userText = lastUserMsg?.content || "";
    const wantsImage = isImageRequest(userText);

    console.log("Chat request:", { messageCount: messages.length, wantsImage, userText: userText.slice(0, 80) });

    if (wantsImage) {
      // Use image generation model
      const imagePrompt = `Create a stunning, scientifically accurate astronomy/space image: ${userText}. Make it photorealistic and visually impressive with cosmic colors and details.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.1-flash-image-preview",
          messages: [
            { role: "user", content: imagePrompt },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Image generation error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify({ error: "Image generation failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await response.json();
      const choice = data.choices?.[0]?.message;
      const textContent = choice?.content || "Here's the generated astronomy image!";
      const images = choice?.images || [];

      return new Response(
        JSON.stringify({ type: "image", text: textContent, images }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Regular text streaming
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

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
