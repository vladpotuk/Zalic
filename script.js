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

  // Get the user's location or use a default city
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherDataByCoords(latitude, longitude);
      },
      () => {
        getWeatherDataByCity("Kyiv"); // Default city if geolocation fails
      }
    );
  } else {
    getWeatherDataByCity("Kyiv"); // Default city if geolocation is not supported
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
      .catch((error) => {
        console.error("Error fetching weather data:", error);
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
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        showErrorPage();
      });
  }

  function getFiveDayForecast(city) {
    fetch(`${weatherApiUrl}forecast?q=${city}&appid=${apiKey}&units=${units}`)
      .then((response) => response.json())
      .then((data) => {
        displayFiveDayForecast(data);
      })
      .catch((error) => {
        console.error("Error fetching forecast data:", error);
      });
  }

  function getNearbyPlaces(lat, lon) {
    // Placeholder URL; replace with actual API if available
    const radius = 5000; // Radius in meters
    const nearbyPlacesApiUrl = `https://api.example.com/nearby?lat=${lat}&lon=${lon}&radius=${radius}`;

    fetch(nearbyPlacesApiUrl)
      .then((response) => response.json())
      .then((data) => {
        displayNearbyPlaces(data);
      })
      .catch((error) => {
        console.error("Error fetching nearby places:", error);
        // Fallback to simulated data
        displayNearbyPlacesSimulated();
      });
  }

  function displayTodayWeather(data) {
    const today = new Date();
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
    const dayLength = calculateDayLength(sunrise, sunset);

    todayContent.innerHTML = `
      <div class="weather-summary">
        <div class="date">${today.toLocaleDateString()}</div>
        <div class="weather-icon">
          <img src="http://openweathermap.org/img/wn/${
            data.weather[0].icon
          }@2x.png" alt="Weather icon">
        </div>
        <div class="weather-details">
          <div class="temperature">${Math.round(data.main.temp)}°C</div>
          <div class="description">${data.weather[0].description}</div>
          <div class="real-feel">Real Feel: ${Math.round(
            data.main.feels_like
          )}°C</div>
          <div class="sunrise">Sunrise: ${sunrise}</div>
          <div class="sunset">Sunset: ${sunset}</div>
          <div class="day-length">Day Length: ${dayLength}</div>
        </div>
      </div>
            <div class="hourly-forecast">
        <h3>Hourly Forecast</h3>
        <div class="hourly-forecast-details">
          <!-- Hourly forecast will be appended here -->
        </div>
      </div>
      <div class="nearby-cities">
        <h3>Nearby Places</h3>
        <div class="nearby-cities-list">
          <!-- Nearby cities will be appended here -->
        </div>
      </div>
    `;

    // Fetch and display nearby places
    getNearbyPlaces(data.coord.lat, data.coord.lon);
  }

  function displayNearbyPlaces(data) {
    const nearbyCitiesContainer = todayContent.querySelector(
      ".nearby-cities-list"
    );
    const nearbyCities = data.results; // Adjust based on actual API response
    const nearbyCitiesForecast = nearbyCities
      .map(
        (place) => `
      <div class="nearby-city-item">
        <div class="city">${place.name}</div>
        <div class="weather-icon">
          <img src="http://openweathermap.org/img/wn/${
            place.weather[0].icon
          }@2x.png" alt="Weather icon">
        </div>
        <div class="temperature">${Math.round(place.main.temp)}°C</div>
      </div>
    `
      )
      .join("");

    nearbyCitiesContainer.innerHTML = nearbyCitiesForecast;
  }

  function displayNearbyPlacesSimulated() {
    const nearbyCitiesContainer = todayContent.querySelector(
      ".nearby-cities-list"
    );
    const nearbyCities = ["Bucha", "Irpin", "Vyshhorod", "Boryspil"];
    const nearbyCitiesForecast = nearbyCities
      .map(
        (city) => `
      <div class="nearby-city-item">
        <div class="city">${city}</div>
        <div class="weather-icon">
          <img src="http://openweathermap.org/img/wn/01d@2x.png" alt="Weather icon">
        </div>
        <div class="temperature">${Math.round(Math.random() * 10 + 20)}°C</div>
      </div>
    `
      )
      .join("");

    nearbyCitiesContainer.innerHTML = nearbyCitiesForecast;
  }

  function calculateDayLength(sunrise, sunset) {
    const sunriseTime = new Date(`1970-01-01T${sunrise}:00Z`);
    const sunsetTime = new Date(`1970-01-01T${sunset}:00Z`);
    const diff = sunsetTime - sunriseTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  }

  function displayFiveDayForecast(data) {
    const forecastList = data.list;
    const forecastHtml = forecastList
      .map((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        const iconUrl = `http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`;
        return `
        <div class="forecast-item">
          <div class="forecast-date">${date}</div>
          <div class="forecast-icon">
            <img src="${iconUrl}" alt="Weather icon">
          </div>
          <div class="forecast-temperature">${Math.round(
            item.main.temp
          )}°C</div>
          <div class="forecast-description">${item.weather[0].description}</div>
        </div>
      `;
      })
      .join("");

    forecastContent.innerHTML = `
      <h2>5-Day Forecast</h2>
      <div class="forecast-items">
        ${forecastHtml}
      </div>
    `;
  }

  function showTodayTab() {
    todayTab.classList.add("active");
    forecastTab.classList.remove("active");
    todayContent.style.display = "block";
    forecastContent.style.display = "none";
  }

  function showForecastTab() {
    todayTab.classList.remove("active");
    forecastTab.classList.add("active");
    todayContent.style.display = "none";
    forecastContent.style.display = "block";
  }

  function showErrorPage() {
    todayContent.innerHTML = `
      <div class="error">
        <h2>Error fetching weather data. Please try again later.</h2>
      </div>
    `;
    forecastContent.innerHTML = "";
  }
});
