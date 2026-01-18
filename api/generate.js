// /api/generate.js
export default async function handler(req, res) {
  // CORS headers for Blogger
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const API_KEY = process.env.GEMINI_API_KEY; // hidden in Vercel

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();

    // 🔹 Robust extraction
    let aiText = "";

    if (data?.candidates?.length > 0) {
      const candidate = data.candidates[0];

      if (Array.isArray(candidate.content)) {
        // Multiple content objects
        aiText = candidate.content.map(c => {
          if (Array.isArray(c.parts)) return c.parts.map(p => p.text || "").join("\n");
          return "";
        }).join("\n");
      } else if (candidate.content?.parts?.length > 0) {
        // Single content object
        aiText = candidate.content.parts.map(p => p.text || "").join("\n");
      }
    }

    if (!aiText) throw new Error("No result returned from AI");

    res.status(200).json({ result: aiText });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
