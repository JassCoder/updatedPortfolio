// === CONFIG ===
// 1) Create a free account at https://openweathermap.org/api
// 2) Put your API key below
const API_KEY = "PASTE_YOUR_OPENWEATHERMAP_KEY_HERE";
const BASE = "https://api.openweathermap.org/data/2.5";

const els = {
  form: document.getElementById("searchForm"),
  input: document.getElementById("cityInput"),
  status: document.getElementById("status"),

  currentCard: document.getElementById("currentCard"),
  forecastCard: document.getElementById("forecastCard"),

  place: document.getElementById("place"),
  desc: document.getElementById("desc"),
  icon: document.getElementById("icon"),
  temp: document.getElementById("temp"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  feels: document.getElementById("feels"),
  pressure: document.getElementById("pressure"),

  forecast: document.getElementById("forecast"),

  recentList: document.getElementById("recentList"),
  clearRecentBtn: document.getElementById("clearRecentBtn"),
};

const RECENT_KEY = "weather_recent_v1";
const MAX_RECENT = 8;

// --- helpers ---
function setStatus(msg, type = "info") {
  els.status.textContent = msg || "";
  els.status.classList.toggle("error", type === "error");
}

function setLoading(isLoading) {
  if (isLoading) setStatus("Loading…");
  else setStatus("");
}

function showCards(show) {
  els.currentCard.classList.toggle("hidden", !show);
  els.forecastCard.classList.toggle("hidden", !show);
}

function celsius(n) {
  return Math.round(n);
}

function windKmh(ms) {
  // OpenWeatherMap gives wind speed in m/s by default
  return Math.round(ms * 3.6);
}

function dayLabel(dateStr) {
  // dateStr: "YYYY-MM-DD"
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let text = "";
    try { text = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

// --- recent searches ---
function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function addRecent(city) {
  const c = city.trim();
  if (!c) return;

  let list = loadRecent();
  // normalize for duplicates (case-insensitive)
  list = list.filter(x => x.toLowerCase() !== c.toLowerCase());
  list.unshift(c);
  list = list.slice(0, MAX_RECENT);
  saveRecent(list);
  renderRecent();
}

function renderRecent() {
  const list = loadRecent();
  els.recentList.innerHTML = "";

  if (list.length === 0) {
    const p = document.createElement("p");
    p.className = "muted";
    p.style.margin = "0";
    p.textContent = "No recent searches.";
    els.recentList.appendChild(p);
    return;
  }

  list.forEach(city => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip";
    btn.textContent = city;
    btn.addEventListener("click", () => searchCity(city));
    els.recentList.appendChild(btn);
  });
}

// --- rendering ---
function renderCurrent(data) {
  const name = data.name;
  const country = data.sys?.country ? `, ${data.sys.country}` : "";
  const weather = data.weather?.[0];
  const main = data.main;

  els.place.textContent = `${name}${country}`;
  els.desc.textContent = weather?.description ? capitalize(weather.description) : "";
  els.icon.src = weather?.icon ? iconUrl(weather.icon) : "";
  els.icon.alt = weather?.main || "Weather icon";

  els.temp.textContent = celsius(main.temp);
  els.humidity.textContent = `${main.humidity}%`;
  els.wind.textContent = `${windKmh(data.wind.speed)} km/h`;
  els.feels.textContent = `${celsius(main.feels_like)}°C`;
  els.pressure.textContent = `${main.pressure} hPa`;
}

function renderForecast(days) {
  els.forecast.innerHTML = "";

  days.forEach(d => {
    const div = document.createElement("div");
    div.className = "day";

    const h = document.createElement("h3");
    h.textContent = `${dayLabel(d.date)} (${d.date.slice(5)})`;

    const img = document.createElement("img");
    img.src = iconUrl(d.icon);
    img.alt = d.desc;

    const p1 = document.createElement("p");
    p1.className = "t";
    p1.textContent = `${celsius(d.min)}° / ${celsius(d.max)}°`;

    const p2 = document.createElement("p");
    p2.className = "muted";
    p2.style.margin = "6px 0 0";
    p2.style.fontSize = "12px";
    p2.textContent = d.desc;

    div.appendChild(h);
    div.appendChild(img);
    div.appendChild(p1);
    div.appendChild(p2);

    els.forecast.appendChild(div);
  });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

// --- data shaping: 5-day from /forecast (3-hour steps) ---
function buildDailyForecast(list) {
  // list: array of 3-hour forecast entries
  // Pick one per day near midday, plus min/max for the day
  const byDate = new Map();

  for (const item of list) {
    const dt = new Date(item.dt * 1000);
    const date = dt.toISOString().slice(0, 10); // YYYY-MM-DD
    const hour = dt.getUTCHours(); // may differ from city local, but OK for demo

    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date).push({ item, hour });
  }

  const dates = Array.from(byDate.keys()).sort();
  const today = new Date().toISOString().slice(0, 10);

  // exclude today, show next 5 dates
  const nextDates = dates.filter(d => d > today).slice(0, 5);

  return nextDates.map(date => {
    const entries = byDate.get(date).map(x => x.item);
    const temps = entries.map(e => e.main.temp);
    const min = Math.min(...temps);
    const max = Math.max(...temps);

    // choose entry closest to 12:00 UTC for icon/description
    let chosen = entries[0];
    let bestDist = Infinity;
    for (const e of entries) {
      const h = new Date(e.dt * 1000).getUTCHours();
      const dist = Math.abs(h - 12);
      if (dist < bestDist) {
        bestDist = dist;
        chosen = e;
      }
    }

    return {
      date,
      min,
      max,
      icon: chosen.weather?.[0]?.icon || "01d",
      desc: capitalize(chosen.weather?.[0]?.description || ""),
    };
  });
}

// --- main search ---
async function searchCity(city) {
  const q = city.trim();
  if (!q) return;

  if (!API_KEY || API_KEY.includes("PASTE_YOUR")) {
    setStatus("Add your OpenWeatherMap API key in app.js first.", "error");
    showCards(false);
    return;
  }

  setLoading(true);
  showCards(false);

  try {
    const currentUrl = `${BASE}/weather?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric`;
    const current = await fetchJson(currentUrl);

    const forecastUrl = `${BASE}/forecast?q=${encodeURIComponent(q)}&appid=${API_KEY}&units=metric`;
    const forecast = await fetchJson(forecastUrl);

    renderCurrent(current);

    const days = buildDailyForecast(forecast.list);
    renderForecast(days);

    showCards(true);
    addRecent(current.name); // use canonical city name from API
    setStatus("");
  } catch (err) {
    console.error(err);
    showCards(false);

    // nicer message for common cases
    const msg = String(err.message || "");
    if (msg.includes("404")) {
      setStatus("City not found. Try a different spelling.", "error");
    } else if (msg.includes("401")) {
      setStatus("API key rejected. Check your OpenWeatherMap key.", "error");
    } else {
      setStatus("Something broke while fetching weather. Try again.", "error");
    }
  } finally {
    setLoading(false);
  }
}

// --- events ---
els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  searchCity(els.input.value);
});

els.clearRecentBtn.addEventListener("click", () => {
  localStorage.removeItem(RECENT_KEY);
  renderRecent();
});

// init
renderRecent();
setStatus("Search a city to begin.");
