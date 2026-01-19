// /api/generate.js
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const API_KEY = process.env.GEMINI_API_KEY; // hidden safely in Vercel

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();

    let aiText = "";

    // 🔹 Try candidates
    if (data?.candidates?.length > 0) {
      const candidate = data.candidates[0];

      if (candidate.content) {
        if (Array.isArray(candidate.content)) {
          aiText = candidate.content.map(c => c.parts?.map(p => p.text || "").join("\n")).join("\n");
        } else if (candidate.content.parts) {
          aiText = candidate.content.parts.map(p => p.text || "").join("\n");
        }
      }

      // Try fallback fields
      if (!aiText && candidate.output_text) aiText = candidate.output_text;
      if (!aiText && candidate.output_text_array) aiText = candidate.output_text_array.join("\n");
    }

    // 🔹 Try top-level fallback
    if (!aiText && data.output_text) aiText = data.output_text;
    if (!aiText && data.output_text_array) aiText = data.output_text_array.join("\n");

    if (!aiText) throw new Error("No result returned from AI");

    res.status(200).json({ result: aiText });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
