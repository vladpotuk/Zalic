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

  function getNearbyPlaces(lat, lon) {
    const radius = 5000;
    const nearbyPlacesApiUrl = `https://api.example.com/nearby?lat=${lat}&lon=${lon}&radius=${radius}`;

    fetch(nearbyPlacesApiUrl)
      .then((response) => response.json())
      .then((data) => {
        displayNearbyPlaces(data);
      })
      .catch(() => {
        displayNearbyPlacesSimulated();
      });
  }

  function displayTodayWeather(data) {
    const today = new Date();
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    const dayLength = calculateDayLength(sunrise, sunset);

    const weatherCondition = data.weather[0].main.toLowerCase();

    todayContent.innerHTML = `
      <div class="weather-summary">
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

  function calculateDayLength(sunrise, sunset) {
    const sunriseTime = new Date(`1970-01-01T${sunrise}Z`);
    const sunsetTime = new Date(`1970-01-01T${sunset}Z`);
    const dayLength = sunsetTime - sunriseTime;
    const hours = Math.floor(dayLength / 3600000);
    const minutes = Math.floor((dayLength % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  function displayFiveDayForecast(data) {
    const forecast = data.list;
    let shortForecastHTML = "";
    let hourlyForecastHTML = "";

    forecast.forEach((item, index) => {
      if (index % 8 === 0) {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        const weatherCondition = item.weather[0].main.toLowerCase();

        shortForecastHTML += `
          <div class="day-summary" onclick="showHourlyForecast(${index})">
            <div class="date">${day}</div>
            <div class="weather-icon ${getIconClass(weatherCondition)}">
              <img src="http://openweathermap.org/img/wn/${
                item.weather[0].icon
              }@2x.png" alt="${item.weather[0].description}">
            </div>
            <div class="temperature">${Math.round(item.main.temp)}°C</div>
            <div class="weather-description">${
              item.weather[0].description
            }</div>
          </div>
        `;
      }
    });

    document.getElementById("shortForecast").innerHTML = shortForecastHTML;

    function showHourlyForecast(index) {
      const dayForecast = forecast.slice(index, index + 8);
      hourlyForecastHTML = "";

      dayForecast.forEach((item) => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        hourlyForecastHTML += `
          <div class="hourly-forecast-item">
            <div class="hour">${time}</div>
            <div class="temperature">${Math.round(item.main.temp)}°C</div>
            <div class="weather-icon ${getIconClass(
              item.weather[0].main.toLowerCase()
            )}">
              <img src="http://openweathermap.org/img/wn/${
                item.weather[0].icon
              }@2x.png" alt="${item.weather[0].description}">
            </div>
            <div class="weather-description">${
              item.weather[0].description
            }</div>
          </div>
        `;
      });

      document.getElementById("detailedForecast").innerHTML =
        hourlyForecastHTML;
    }
  }

  function displayNearbyPlaces(data) {
    const placesHTML = data.results
      .map(
        (place) => `
      <div class="nearby-city-item">
        <div class="name">${place.name}</div>
        <div class="distance">${place.distance} meters away</div>
      </div>
    `
      )
      .join("");

    document.querySelector(".nearby-cities").innerHTML = `
      <h3>Nearby Places:</h3>
      <div class="nearby-cities-list">
        ${placesHTML}
      </div>
    `;
  }

  function displayNearbyPlacesSimulated() {
    const simulatedData = [
      { name: "Place 1", distance: "100" },
      { name: "Place 2", distance: "500" },
      { name: "Place 3", distance: "1000" },
    ];

    displayNearbyPlaces(simulatedData);
  }

  function showTodayTab() {
    todayTab.classList.add("active");
    forecastTab.classList.remove("active");
    todayContent.classList.add("active");
    forecastContent.classList.remove("active");
  }

  function showForecastTab() {
    todayTab.classList.remove("active");
    forecastTab.classList.add("active");
    todayContent.classList.remove("active");
    forecastContent.classList.add("active");
  }

  function showErrorPage() {
    document.getElementById("errorSection").style.display = "block";
    todayContent.style.display = "none";
    forecastContent.style.display = "none";
  }

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
});
