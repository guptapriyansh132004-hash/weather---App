const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("city");
const message = document.getElementById("message");
const result = document.getElementById("result");
const button = form.querySelector("button");

form.addEventListener("submit", async function(event) {
event.preventDefault();

const city = cityInput.value.trim();

if (!city) {
    message.textContent = "Please enter a city name.";
    return;
}

button.disabled = true;
message.textContent = "Loading weather...";
result.hidden = true;

try {
    const geoURL =
        "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(city) +
        "&count=1&language=en&format=json";

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
        throw new Error("City search failed.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found. Check spelling.");
    }

    const place = geoData.results[0];

    const weatherURL =
        "https://api.open-meteo.com/v1/forecast?latitude=" +
        place.latitude +
        "&longitude=" +
        place.longitude +
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto";

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
        throw new Error("Weather data unavailable.");
    }

    const data = await weatherResponse.json();
    const current = data.current;

    document.getElementById("cityName").textContent =
        place.name + ", " + place.country;

    document.getElementById("temp").textContent =
        Math.round(current.temperature_2m) + " °C";

    document.getElementById("feelsLike").textContent =
        "Feels like: " +
        Math.round(current.apparent_temperature) + " °C";

    document.getElementById("humidity").textContent =
        "Humidity: " + current.relative_humidity_2m + "%";

    document.getElementById("wind").textContent =
        "Wind: " + current.wind_speed_10m + " km/h";

    const weather = getWeather(current.weather_code);

    document.getElementById("icon").textContent = weather.icon;
    document.getElementById("description").textContent =
        weather.description;

    result.hidden = false;
    message.textContent = "Weather loaded successfully.";

} catch (error) {
    message.textContent =
        error.message || "Check your internet connection.";
} finally {
    button.disabled = false;
}

});

function getWeather(code) {
if (code === 0) return {icon: "☀️", description: "Clear Sky"};
if ([1, 2, 3].includes(code)) return {icon: "☁️", description: "Cloudy"};
if ([45, 48].includes(code)) return {icon: "🌫️", description: "Foggy"};
if ([51, 53, 55, 56, 57].includes(code)) return {icon: "🌦️", description: "Drizzle"};
if ([61, 63, 65, 80, 81, 82].includes(code)) return {icon: "🌧️", description: "Rain"};
if ([71, 73, 75, 77, 85, 86].includes(code)) return {icon: "❄️", description: "Snow"};
if ([95, 96, 99].includes(code)) return {icon: "⛈️", description: "Thunderstorm"};
return {icon: "🌤️", description: "Variable Weather"};
}