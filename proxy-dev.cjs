const express = require("express");
const fetch = require("node-fetch");

const app = express();
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydPvxfDbCiFv4cv3xHTtfU9DliO8PFzJ3ePnCcAfooZ-kemNTm2oQDv_mtPHhtGvDq/exec";

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.all("/api/proxy", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.sendStatus(200);

  try {
    let response;

    if (req.method === "POST") {
      const formData = new URLSearchParams();
      Object.entries(req.body).forEach(([k, v]) => formData.append(k, v));
      response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        redirect: "follow",
      });
    } else {
      const qs = new URLSearchParams(req.query).toString();
      response = await fetch(`${SCRIPT_URL}?${qs}`, { redirect: "follow" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Proxy corriendo en http://localhost:3001"));