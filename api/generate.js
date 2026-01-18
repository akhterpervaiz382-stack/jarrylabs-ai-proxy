// /api/generate.js
export default async function handler(req, res) {
  // Allow cross-origin requests (from any domain)
  res.setHeader("Access-Control-Allow-Origin", "*"); // or restrict to your blog domain
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    // Use your Gemini API key from Vercel environment variable
    const API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.[0]?.text || data.candidates?.[0]?.content;

    res.status(200).json({ result: aiText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
