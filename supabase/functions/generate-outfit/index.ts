import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gender, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate outfit suggestions based on gender and mood
    const promptText = `You are a professional fashion stylist. Create 3 outfit suggestions for a ${gender} person who wants to feel ${mood}.

For each outfit, provide:
1. A brief title (e.g., "Classic Confident Look")
2. A detailed description of the outfit including specific items (top, bottom, shoes, accessories)
3. Style tips for pulling off this look
4. An image prompt that will be used to generate a fashion image

Return the response as a JSON array with exactly 3 outfits. Each outfit should have this structure:
{
  "title": "outfit title",
  "description": "detailed outfit description",
  "tips": "styling tips",
  "imagePrompt": "detailed prompt for image generation of this outfit on a fashion model"
}

Make the image prompts very detailed and specific, describing the exact clothing items, colors, textures, and styling. Always specify professional fashion photography style.`;

    const outfitResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: promptText }],
      }),
    });

    if (!outfitResponse.ok) {
      const errorText = await outfitResponse.text();
      console.error("AI gateway error:", outfitResponse.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to generate outfits" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const outfitData = await outfitResponse.json();
    const outfitsText = outfitData.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = outfitsText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse outfit suggestions");
    }
    
    const outfits = JSON.parse(jsonMatch[0]);

    // Generate images for each outfit
    const outfitsWithImages = await Promise.all(
      outfits.map(async (outfit: any) => {
        try {
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image",
              messages: [{ role: "user", content: outfit.imagePrompt }],
              modalities: ["image", "text"],
            }),
          });

          if (imageResponse.ok) {
            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            return { ...outfit, imageUrl };
          }
          return outfit;
        } catch (error) {
          console.error("Error generating image:", error);
          return outfit;
        }
      })
    );

    return new Response(JSON.stringify({ outfits: outfitsWithImages }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
