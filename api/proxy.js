export default async function handler(req, res) {
    const SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  
    try {
      if (req.method === "POST") {
        // Parsear body si viene como string
        let body = req.body;
        if (typeof body === "string") {
          body = Object.fromEntries(new URLSearchParams(body));
        }
  
        const formData = new URLSearchParams();
        Object.entries(body).forEach(([k, v]) => formData.append(k, v));
  
        const response = await fetch(SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
          redirect: "follow",
        });
  
        const data = await response.json();
        res.setHeader("Access-Control-Allow-Origin", "*");
        return res.status(200).json(data);
      }
  
      // GET
      const qs = new URLSearchParams(req.query).toString();
      const response = await fetch(`${SCRIPT_URL}?${qs}`, { redirect: "follow" });
      const data = await response.json();
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(data);
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }