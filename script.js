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

  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      const city = searchInput.value.trim();
      if (city) {
        getWeatherDataByCity(city);
      }
    }
  });

  todayTab.addEventListener("click", () => {
    showTodayTab();
  });

  forecastTab.addEventListener("click", () => {
    showForecastTab();
  });

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

  function displayTodayWeather(data) {
    todayContent.innerHTML = `
      <h2 class="city-name">${data.name}</h2>
      <div class="weather-summary">
        <div class="weather-icon ${getIconClass(
          data.weather[0].main.toLowerCase()
        )}">
          <img src="http://openweathermap.org/img/wn/${
            data.weather[0].icon
          }@2x.png" alt="${data.weather[0].description}">
        </div>
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <div class="weather-description">${data.weather[0].description}</div>
        <div class="weather-details">
          <div>Humidity: ${data.main.humidity}%</div>
          <div>Wind Speed: ${Math.round(data.wind.speed)} m/s</div>
        </div>
      </div>
    `;
  }

  function displayFiveDayForecast(data) {
    const forecastContainer = document.getElementById("shortForecast");
    forecastContainer.innerHTML = `<h2 class="city-name">${currentCity}</h2>`;

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

  function getIconClass(condition) {
    switch (condition) {
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

  function showTodayTab() {
    todayTab.classList.add("active");
    forecastTab.classList.remove("active");
    todayContent.classList.add("active");
    forecastContent.classList.remove("active");
    document.getElementById("errorSection").style.display = "none";
  }

  function showForecastTab() {
    todayTab.classList.remove("active");
    forecastTab.classList.add("active");
    todayContent.classList.remove("active");
    forecastContent.classList.add("active");
    document.getElementById("errorSection").style.display = "none";
  }

  function showErrorPage() {
    todayContent.innerHTML = "";
    forecastContent.innerHTML = "";
    document.getElementById("errorSection").style.display = "block";
  }
});
