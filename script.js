const apiKey = "98792ccfbdf55d2f6d77e723064f3524";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/";
const units = "metric";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("cityInput");
  const todayTab = document.getElementById("todayTab");
  const forecastTab = document.getElementById("forecastTab");
  const todayContent = document.getElementById("todaySection");
  const forecastContent = document.getElementById("forecastSection");

  let currentCity = "";

  // Try to get user's location or default to Kyiv
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherDataByCoords(latitude, longitude);
      },
      () => {
        getWeatherDataByCity("Kyiv");
      }
    );
  } else {
    getWeatherDataByCity("Kyiv");
  }

  // Handle search input and fetch weather data for the city
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const city = searchInput.value.trim();
      if (city) {
        getWeatherDataByCity(city);
      }
    }
  });

  // Switch between tabs
  todayTab.addEventListener("click", () => {
    showTodayTab();
  });

  forecastTab.addEventListener("click", () => {
    showForecastTab();
  });

  // Fetch weather data by coordinates
  function getWeatherDataByCoords(lat, lon) {
    fetch(
      `${weatherApiUrl}weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
    )
      .then((response) => response.json())
      .then((data) => {
        currentCity = data.name;
        searchInput.value = currentCity;
        displayTodayWeather(data);
        getFiveDayForecast(currentCity);
      })
      .catch(() => {
        showErrorPage();
      });
  }

  // Fetch weather data by city name
  function getWeatherDataByCity(city) {
    fetch(`${weatherApiUrl}weather?q=${city}&appid=${apiKey}&units=${units}`)
      .then((response) => response.json())
      .then((data) => {
        currentCity = data.name;
        searchInput.value = currentCity;
        displayTodayWeather(data);
        getFiveDayForecast(currentCity);
      })
      .catch(() => {
        showErrorPage();
      });
  }

  // Fetch 5-day weather forecast
  function getFiveDayForecast(city) {
    fetch(`${weatherApiUrl}forecast?q=${city}&appid=${apiKey}&units=${units}`)
      .then((response) => response.json())
      .then((data) => {
        displayFiveDayForecast(data);
      })
      .catch(() => {
        showErrorPage();
      });
  }

  // Display current weather
  function displayTodayWeather(data) {
    const today = new Date();
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    const dayLength = calculateDayLength(sunrise, sunset);

    const weatherCondition = data.weather[0].main.toLowerCase();

    todayContent.innerHTML = `
      <div class="weather-summary">
        <div class="city-name">${data.name}</div>
        <div class="date">${today.toLocaleDateString()}</div>
        <div class="weather-icon ${getIconClass(weatherCondition)}">
          <img src="http://openweathermap.org/img/wn/${
            data.weather[0].icon
          }@2x.png" alt="${data.weather[0].description}">
        </div>
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <div class="weather-description">${data.weather[0].description}</div>
        <div class="sunrise">Sunrise: ${sunrise}</div>
        <div class="sunset">Sunset: ${sunset}</div>
        <div class="day-length">Day Length: ${dayLength}</div>
      </div>
    `;
  }

  // Display 5-day forecast
  function displayFiveDayForecast(data) {
    const forecastContainer = document.getElementById("shortForecast");
    forecastContainer.innerHTML = `<h2 class="city-name">${currentCity}</h2>`; // Add city name here

    const dailyData = {};

    data.list.forEach((entry) => {
      const date = entry.dt_txt.split(" ")[0];
      if (!dailyData[date]) {
        dailyData[date] = entry;
      }
    });

    for (let date in dailyData) {
      const entry = dailyData[date];
      const weatherCondition = entry.weather[0].main.toLowerCase();
      const temp = Math.round(entry.main.temp);

      const dayElement = document.createElement("div");
      dayElement.classList.add("day-summary");
      dayElement.innerHTML = `
        <div class="date">${new Date(date).toLocaleDateString()}</div>
        <div class="weather-icon ${getIconClass(weatherCondition)}">
          <img src="http://openweathermap.org/img/wn/${
            entry.weather[0].icon
          }@2x.png" alt="${entry.weather[0].description}">
        </div>
        <div class="temperature">${temp}°C</div>
        <div class="weather-description">${entry.weather[0].description}</div>
      `;

      forecastContainer.appendChild(dayElement);
    }
  }

  // Calculate day length
  function calculateDayLength(sunrise, sunset) {
    const [sunriseHour, sunriseMinute] = sunrise.split(":").map(Number);
    const [sunsetHour, sunsetMinute] = sunset.split(":").map(Number);

    const hourDiff = sunsetHour - sunriseHour;
    const minuteDiff = sunsetMinute - sunriseMinute;

    return `${hourDiff}h ${minuteDiff}m`;
  }

  // Get weather icon class based on condition
  function getIconClass(weatherCondition) {
    switch (weatherCondition) {
      case "clear":
        return "sunny";
      case "clouds":
        return "cloudy";
      case "rain":
        return "rainy";
      case "snow":
        return "snowy";
      default:
        return "";
    }
  }

  // Show today's weather tab
  function showTodayTab() {
    todayTab.classList.add("active");
    forecastTab.classList.remove("active");
    todayContent.classList.add("active");
    forecastContent.classList.remove("active");
    document.getElementById("errorSection").style.display = "none";
  }

  // Show forecast tab
  function showForecastTab() {
    forecastTab.classList.add("active");
    todayTab.classList.remove("active");
    forecastContent.classList.add("active");
    todayContent.classList.remove("active");
    document.getElementById("errorSection").style.display = "none";
  }

  // Show error page
  function showErrorPage() {
    document.getElementById("errorSection").style.display = "block";
  }
});
