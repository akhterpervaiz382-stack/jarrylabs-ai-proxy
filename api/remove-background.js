import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const file = req.body?.image; // Expect base64 string
  if (!file) return res.status(400).json({ error: "Image is required" });

  const formData = new FormData();
  formData.append("image_file_b64", file);
  formData.append("size", "auto");

  try {
    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": "YOUR_REMOVE_BG_API_KEY_HERE"
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || "Remove.bg API failed");
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    res.status(200).json({ result: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
