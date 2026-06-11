const BASE_URL = "/api";

const DANGER_CODES = {
  thunderstorm: { min: 200, max: 232, message: "WARNING: Severe Thunderstorm active in this area! Take safety precautions." },
  heavyRain: { ids: [502, 503, 504, 522, 531], message: "WARNING: Heavy or extreme rainfall detected! Avoid flooded areas and stay indoors." },
  heavySnow: { ids: [602, 611, 612, 613, 615, 616, 622], message: "WARNING: Heavy snow or blizzard conditions! Limit travel and stay warm." },
  tornado: { ids: [781], message: "WARNING: Tornado reported in this area! Seek shelter immediately in a sturdy building." },
  squall: { ids: [771], message: "WARNING: Squall conditions detected! Secure loose objects and avoid open water." },
};

const WEATHER_EMOJI = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Smoke: "🌫️",
  Haze: "🌫️",
  Dust: "🌫️",
  Fog: "🌫️",
  Sand: "🌫️",
  Ash: "🌫️",
  Squall: "💨",
  Tornado: "🌪️",
};

const elements = {
  form: document.getElementById("search-form"),
  cityInput: document.getElementById("city-input"),
  searchBtn: document.getElementById("search-btn"),
  hazardAlert: document.getElementById("hazard-alert"),
  alertMessage: document.getElementById("alert-message"),
  errorMessage: document.getElementById("error-message"),
  currentWeather: document.getElementById("current-weather"),
  cityName: document.getElementById("city-name"),
  temperature: document.getElementById("temperature"),
  weatherCondition: document.getElementById("weather-condition"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("wind-speed"),
  forecastSection: document.getElementById("forecast-section"),
  forecastRow: document.getElementById("forecast-row"),
};

elements.form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = elements.cityInput.value.trim();
  if (!city) return;

  clearError();
  setLoading(true);

  try {
    const [currentData, forecastData] = await Promise.all([
      fetchWeather(`${BASE_URL}/weather?city=${encodeURIComponent(city)}`),
      fetchWeather(`${BASE_URL}/forecast?city=${encodeURIComponent(city)}`),
    ]);

    renderCurrentWeather(currentData);
    renderForecast(forecastData);
    const isNight = isNightTime(currentData.dt, currentData.sys.sunrise, currentData.sys.sunset);
    applyTheme(currentData.weather[0].id, currentData.weather[0].main, isNight);
    evaluateHazard(currentData.weather[0].id, currentData.weather[0].description);

    elements.currentWeather.hidden = false;
    elements.forecastSection.hidden = false;
  } catch (error) {
    showError(error.message);
    hideHazardAlert();
    elements.currentWeather.hidden = true;
    elements.forecastSection.hidden = true;
    applyTheme(null);
  } finally {
    setLoading(false);
  }
});

async function fetchWeather(url) {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("City not found. Please check the spelling and try again.");
    }
    if (response.status === 401) {
      throw new Error("Invalid API key. Please verify your OpenWeatherMap credentials.");
    }
    throw new Error(data.message || "Unable to fetch weather data. Please try again later.");
  }

  return data;
}

function checkHazardCondition(weatherId) {
  if (weatherId >= DANGER_CODES.thunderstorm.min && weatherId <= DANGER_CODES.thunderstorm.max) {
    return DANGER_CODES.thunderstorm.message;
  }

  for (const key of ["heavyRain", "heavySnow", "tornado", "squall"]) {
    const rule = DANGER_CODES[key];
    if (rule.ids.includes(weatherId)) {
      return rule.message;
    }
  }

  return null;
}

function evaluateHazard(weatherId, description) {
  const warning = checkHazardCondition(weatherId);

  if (warning) {
    elements.alertMessage.textContent = warning;
    elements.hazardAlert.classList.add("visible");
  } else {
    hideHazardAlert();
  }
}

function hideHazardAlert() {
  elements.hazardAlert.classList.remove("visible");
  elements.alertMessage.textContent = "";
}

function renderCurrentWeather(data) {
  elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
  elements.temperature.textContent = `${Math.round(data.main.temp)}°C`;
  elements.weatherCondition.textContent = data.weather[0].description;
  elements.humidity.textContent = `${data.main.humidity}%`;
  elements.windSpeed.textContent = `${data.wind.speed} m/s`;
}

function renderForecast(data) {
  const dailyMap = new Map();

  data.list.forEach((entry) => {
    const dateKey = entry.dt_txt.split(" ")[0];
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        temps: [],
        conditions: [],
        main: entry.weather[0].main,
        description: entry.weather[0].description,
      });
    }
    const day = dailyMap.get(dateKey);
    day.temps.push(entry.main.temp);
    day.conditions.push(entry.weather[0]);
  });

  const today = new Date().toISOString().split("T")[0];
  const days = Array.from(dailyMap.values())
    .filter((day) => day.date !== today)
    .slice(0, 5);

  elements.forecastRow.innerHTML = days
    .map((day) => {
      const high = Math.round(Math.max(...day.temps));
      const low = Math.round(Math.min(...day.temps));
      const midday = day.conditions[Math.floor(day.conditions.length / 2)];
      const emoji = WEATHER_EMOJI[midday.main] || "🌡️";
      const label = formatDayLabel(day.date);

      return `
        <article class="forecast-card">
          <span class="forecast-day">${label}</span>
          <span class="forecast-icon" aria-hidden="true">${emoji}</span>
          <span class="forecast-condition">${midday.description}</span>
          <span class="forecast-temps">
            <span class="forecast-high">${high}°</span>
            <span class="forecast-low"> / ${low}°</span>
          </span>
        </article>
      `;
    })
    .join("");
}

function formatDayLabel(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isNightTime(timestamp, sunrise, sunset) {
  return timestamp < sunrise || timestamp >= sunset;
}

const THEME_CLASSES = [
  "default-theme",
  "sunny-theme",
  "cloudy-theme",
  "rainy-theme",
  "snowy-theme",
  "stormy-theme",
  "foggy-theme",
  "night-theme",
];

function applyTheme(weatherId, weatherMain, isNight = false) {
  document.body.classList.remove(...THEME_CLASSES);

  if (weatherId === null) {
    document.body.classList.add("default-theme");
    return;
  }

  if (weatherId >= 200 && weatherId < 300) {
    document.body.classList.add("stormy-theme");
  } else if (weatherId >= 300 && weatherId < 600) {
    document.body.classList.add("rainy-theme");
  } else if (weatherId >= 600 && weatherId < 700) {
    document.body.classList.add("snowy-theme");
  } else if (weatherId >= 700 && weatherId < 800) {
    document.body.classList.add("foggy-theme");
  } else if ((weatherMain === "Clear" || weatherId === 800) && isNight) {
    document.body.classList.add("night-theme");
  } else if (weatherMain === "Clear" || weatherId === 800) {
    document.body.classList.add("sunny-theme");
  } else if (weatherMain === "Clouds" || (weatherId >= 801 && weatherId <= 804)) {
    document.body.classList.add(isNight ? "night-theme" : "cloudy-theme");
  } else {
    document.body.classList.add(isNight ? "night-theme" : "cloudy-theme");
  }
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.hidden = false;
}

function clearError() {
  elements.errorMessage.textContent = "";
  elements.errorMessage.hidden = true;
}

function setLoading(isLoading) {
  elements.searchBtn.disabled = isLoading;
  elements.searchBtn.textContent = isLoading ? "Loading…" : "Search";
}
