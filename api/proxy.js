export default async function handler(req, res) {
    const SCRIPT_URL = process.env.APPS_SCRIPT_URL;
    
    const qs = new URLSearchParams(req.query).toString();
    const url = `${SCRIPT_URL}?${qs}`;
  
    try {
      const response = await fetch(url, { redirect: "follow" });
      const data = await response.json();
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }