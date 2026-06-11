# Weather Dashboard

A real-time weather application with a secure backend API that keeps your OpenWeather API key private.

## Live Demo

[Open the live app on Render](https://weather-dashboard-jgl5.onrender.com)

## Features

- 🔍 Search for any city's weather
- 🌤️ Dynamic themed UI (sunny, rainy, snowy, stormy, etc.)
- 📅 5-day weather forecast
- ⚠️ Hazard alerts (thunderstorms, heavy snow, tornadoes, etc.)
- 🔐 API key hidden from browser (backend-only access)
- 📱 Fully responsive design

## Project Structure

```
.
├── server.js              # Express backend (proxies OpenWeather API)
├── app.js                 # Frontend JavaScript
├── index.html             # HTML markup
├── style.css              # Styling
├── package.json           # Dependencies and scripts
├── .env                   # API key (local only, not in repo)
├── .env.example           # Template for .env
├── .gitignore             # Excludes .env from git
└── README.md              # This file
```

## Getting Started Locally

### Prerequisites
- Node.js 18+
- An OpenWeather API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. **Clone the repo**:
   ```bash
   git clone <your-repo-url>
   cd Weather
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API key:
   ```
   WEATHER_API_KEY=your_openweather_api_key
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Open in browser**:
   ```
   http://localhost:3000
   ```

## How It Works

### Frontend (`app.js`)
- User types a city name and clicks "Search"
- Makes requests to **backend routes only**:
  - `GET /api/weather?city=<city>`
  - `GET /api/forecast?city=<city>`
- Renders weather data, forecast cards, and theme changes

### Backend (`server.js`)
- Reads `WEATHER_API_KEY` from `.env` using `dotenv`
- Proxies requests to OpenWeather API with the key
- Returns JSON responses to the frontend
- **API key never leaves the server**

### Security
- `.gitignore` excludes `.env` from version control
- Browser only sees `/api/...` requests, not the OpenWeather endpoints
- DevTools shows no API key in Network tab
- GitHub repo contains no secrets

---

## Deployment on Render

### Step 1: Push to GitHub

1. Initialize git in your project:
   ```bash
   git init
   git add .
   git commit -m "Weather dashboard with secure backend"
   ```

2. Create a **new repository** on GitHub (don't initialize with README):
   - Go to [github.com/new](https://github.com/new)
   - Name it `weather-dashboard` (or your choice)
   - Click "Create repository"

3. Push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/your-username/weather-dashboard.git
   git push -u origin main
   ```

   *(Replace `your-username` with your GitHub username)*

4. **Verify** `.env` is NOT in the repo:
   ```bash
   git ls-files | grep .env
   ```
   Should show nothing. If it shows `.env`, run:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   git push
   ```

---

### Step 2: Deploy on Render

1. **Sign up / Log in** to [render.com](https://render.com)

2. **Create a new Web Service**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account (click "GitHub" button)
   - Find and select your `weather-dashboard` repo
   - Click "Connect"

3. **Configure the service**:
   - **Name**: `weather-dashboard` (or any name)
   - **Environment**: `Node`
   - **Region**: Choose nearest to you (e.g., `N. Virginia` for US)
   - **Build Command**: 
     ```
     npm install
     ```
   - **Start Command**:
     ```
     npm start
     ```

4. **Add Environment Variables**:
   - Click **"Environment"** tab
   - Add variable:
     - **Key**: `WEATHER_API_KEY`
     - **Value**: `your_openweather_api_key` (paste your actual key)
   - Click "Save"

5. **Deploy**:
   - Scroll down, click **"Create Web Service"**
   - Render will build and deploy automatically
   - Wait 2-3 minutes for the build to complete
   - Once successful, you'll see a public URL: `https://weather-abc123.onrender.com`

---

### Step 3: Test Your Deployment

1. Open the Render URL in your browser
2. Search for a city (e.g., "London", "Tokyo", "New York")
3. Verify weather and forecast appear
4. Open DevTools (F12 → Network) and check:
   - Requests go only to `/api/weather` and `/api/forecast`
   - NO direct calls to `api.openweathermap.org`
   - NO API key visible anywhere

---

## Sharing with Others

Once deployed, share the Render URL:
```
https://weather-abc123.onrender.com
```

Anyone can visit it, search for weather, and it works 24/7—no matter if your laptop is on or off.

---

## API Endpoints

### `GET /api/weather?city=<city>`
Returns current weather for a city.

**Example**:
```
GET /api/weather?city=London
```

**Response** (JSON):
```json
{
  "name": "London",
  "main": { "temp": 15.5, "humidity": 72 },
  "weather": [{ "id": 803, "main": "Clouds", "description": "broken clouds" }],
  "wind": { "speed": 5.2 },
  "sys": { "country": "GB", "sunrise": 1654321200, "sunset": 1654375200 }
}
```

### `GET /api/forecast?city=<city>`
Returns 5-day forecast for a city.

**Example**:
```
GET /api/forecast?city=London
```

**Response**: Array of forecast entries with hourly predictions.

---

## Troubleshooting

### "WEATHER_API_KEY is missing"
- On Render, did you add the environment variable?
- Check the "Environment" section in the Render dashboard
- Restart the service after updating variables (click "Manual Deploy")

### "Failed to fetch" in browser
- Ensure the Render URL is correct (check dashboard)
- Wait for the service to fully deploy (green status)
- Check browser DevTools Network tab for error messages

### Local server won't start
- Is `.env` file created with your API key?
- Do you have Node 18+? (`node --version`)
- Did you run `npm install`?

### API key accidentally pushed to GitHub
- [Revoke the key](https://openweathermap.org/api) immediately
- Create a new one
- Force-remove `.env` from git history:
  ```bash
  git filter-branch --tree-filter 'rm -f .env' HEAD
  git push -f
  ```

---

## Technologies

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js, CORS
- **API**: OpenWeather API
- **Deployment**: Render
- **Version Control**: Git, GitHub

---

## License

Open source. Use freely for personal or commercial projects.

---

## Support

For OpenWeather API documentation: [https://openweathermap.org/api](https://openweathermap.org/api)

For Render documentation: [https://render.com/docs](https://render.com/docs)
