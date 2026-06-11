const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.WEATHER_API_KEY;
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5";

if (!API_KEY) {
  console.error("Missing WEATHER_API_KEY in .env. Create a .env file with WEATHER_API_KEY=your_openweather_key");
  process.exit(1);
}

app.use(cors());

async function fetchWeatherData(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    const message = data?.message || "Unable to fetch weather data.";
    const status = response.status >= 400 && response.status < 600 ? response.status : 502;
    const error = new Error(message);
    error.status = status;
    throw error;
  }

  return data;
}

app.get("/api/weather", async (req, res) => {
  const city = (req.query.city || "").trim();
  console.log("GET /api/weather - city:", city);

  if (!city) {
    return res.status(400).json({ message: "City query parameter is required." });
  }

  try {
    const url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const data = await fetchWeatherData(url);
    res.json(data);
  } catch (error) {
    console.error("/api/weather error:", error.message || error);
    res.status(error.status || 502).json({ message: error.message || "Unable to fetch current weather." });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = (req.query.city || "").trim();
  console.log("GET /api/forecast - city:", city);

  if (!city) {
    return res.status(400).json({ message: "City query parameter is required." });
  }

  try {
    const url = `${OPENWEATHER_BASE}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const data = await fetchWeatherData(url);
    res.json(data);
  } catch (error) {
    console.error("/api/forecast error:", error.message || error);
    res.status(error.status || 502).json({ message: error.message || "Unable to fetch forecast data." });
  }
});

app.use(express.static(path.join(__dirname), { dotfiles: "ignore" }));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
