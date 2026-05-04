// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherContainer = document.getElementById('weatherContainer');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const closeErrorBtn = document.getElementById('closeErrorBtn');
const welcomeContainer = document.getElementById('welcomeContainer');
const loadingSpinner = document.getElementById('loadingSpinner');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', handleLocationClick);
closeErrorBtn.addEventListener('click', hideError);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Main fetch weather function
async function fetchWeather(latitude, longitude) {
    try {
        showLoading(true);
        hideError();

        // Fetch weather data from Open-Meteo API
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,uv_index,visibility&daily=sunrise,sunset&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`;

        const response = await fetch(weatherUrl);
        if (!response.ok) throw new Error('Failed to fetch weather data');

        const data = await response.json();
        displayWeather(data);
        updateBackground(data.current.weather_code);

        showLoading(false);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to fetch weather data. Please try again.');
        showLoading(false);
    }
}

// Fetch coordinates from city name
async function fetchCoordinatesFromCity(cityName) {
    try {
        const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;

        const response = await fetch(geocodingUrl);
        if (!response.ok) throw new Error('Failed to fetch coordinates');

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            showError(`City "${cityName}" not found. Please try another city.`);
            return null;
        }

        const result = data.results[0];
        return {
            latitude: result.latitude,
            longitude: result.longitude,
            cityName: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}${result.country ? ', ' + result.country : ''}`,
            country: result.country
        };
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        showError('Error finding city. Please try again.');
        return null;
    }
}

// Handle city search
async function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }

    const coords = await fetchCoordinatesFromCity(city);
    if (coords) {
        // Store city name and fetch weather
        sessionStorage.setItem('lastCity', coords.cityName);
        fetchWeather(coords.latitude, coords.longitude);
        cityInput.value = '';
    }
}

// Handle geolocation button click
function handleLocationClick() {
    if ('geolocation' in navigator) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                sessionStorage.setItem('lastLat', latitude);
                sessionStorage.setItem('lastLng', longitude);
                fetchWeather(latitude, longitude);
                fetchCityFromCoordinates(latitude, longitude);
            },
            (error) => {
                showLoading(false);
                let errorMsg = 'Unable to access your location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Location permission denied. Please enable it in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Location request timeout.';
                        break;
                }
                showError(errorMsg);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
}

// Reverse geocoding - get city from coordinates
async function fetchCityFromCoordinates(latitude, longitude) {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (data.address) {
                const cityName = data.address.city || data.address.town || data.address.village || 'Unknown Location';
                const country = data.address.country || '';
                sessionStorage.setItem('lastCity', `${cityName}, ${country}`);
            }
        }
    } catch (error) {
        console.error('Error fetching city from coordinates:', error);
    }
}

// Display weather information
function displayWeather(data) {
    const current = data.current;
    const lastCity = sessionStorage.getItem('lastCity') || 'Current Location';

    // Update DOM with weather data
    document.getElementById('cityName').textContent = lastCity;
    document.getElementById('temperature').textContent = Math.round(current.temperature_2m);
    document.getElementById('feelsLike').textContent = Math.round(current.apparent_temperature);
    document.getElementById('humidity').textContent = current.relative_humidity_2m;
    document.getElementById('windSpeed').textContent = Math.round(current.wind_speed_10m);
    document.getElementById('pressure').textContent = current.pressure_msl;
    document.getElementById('uvIndex').textContent = Math.round(current.uv_index * 10) / 10;
    document.getElementById('visibility').textContent = (current.visibility / 1000).toFixed(1) + ' km';

    // Format sunrise and sunset from daily data
    const sunrise = new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const sunset = new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;

    // Update weather description and icon
    const weatherInfo = getWeatherInfo(current.weather_code);
    document.getElementById('weatherDescription').textContent = weatherInfo.description;
    document.getElementById('weatherIcon').textContent = weatherInfo.icon;

    // Show weather container and hide welcome
    weatherContainer.classList.remove('hidden');
    welcomeContainer.classList.add('hidden');
}

// Get weather description and icon based on WMO weather code
function getWeatherInfo(code) {
    const weatherCodes = {
        0: { description: 'Clear sky', icon: '☀️' },
        1: { description: 'Mainly clear', icon: '🌤️' },
        2: { description: 'Partly cloudy', icon: '⛅' },
        3: { description: 'Overcast', icon: '☁️' },
        45: { description: 'Foggy', icon: '🌫️' },
        48: { description: 'Depositing rime fog', icon: '🌫️' },
        51: { description: 'Light drizzle', icon: '🌧️' },
        53: { description: 'Moderate drizzle', icon: '🌧️' },
        55: { description: 'Dense drizzle', icon: '🌧️' },
        61: { description: 'Slight rain', icon: '🌧️' },
        63: { description: 'Moderate rain', icon: '🌧️' },
        65: { description: 'Heavy rain', icon: '⛈️' },
        71: { description: 'Slight snow', icon: '❄️' },
        73: { description: 'Moderate snow', icon: '❄️' },
        75: { description: 'Heavy snow', icon: '❄️' },
        77: { description: 'Snow grains', icon: '❄️' },
        80: { description: 'Slight rain showers', icon: '🌧️' },
        81: { description: 'Moderate rain showers', icon: '🌧️' },
        82: { description: 'Violent rain showers', icon: '⛈️' },
        85: { description: 'Slight snow showers', icon: '❄️' },
        86: { description: 'Heavy snow showers', icon: '❄️' },
        95: { description: 'Thunderstorm', icon: '⛈️' },
        96: { description: 'Thunderstorm with hail', icon: '⛈️' },
        99: { description: 'Thunderstorm with hail', icon: '⛈️' }
    };

    return weatherCodes[code] || { description: 'Unknown', icon: '🌐' };
}

// Update background based on weather code
function updateBackground(weatherCode) {
    document.body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'stormy', 'default-bg');

    if (weatherCode === 0 || weatherCode === 1) {
        document.body.classList.add('sunny');
    } else if (weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
        document.body.classList.add('cloudy');
    } else if (weatherCode >= 51 && weatherCode <= 82) {
        document.body.classList.add('rainy');
    } else if ((weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86) {
        document.body.classList.add('snowy');
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        document.body.classList.add('stormy');
    } else {
        document.body.classList.add('default-bg');
    }
}

// Show/hide loading spinner
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorContainer.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorContainer.classList.add('hidden');
    errorMessage.textContent = '';
}

// Initialize on page load
window.addEventListener('load', () => {
    // Try to load last city if available
    const lastCity = sessionStorage.getItem('lastCity');
    if (lastCity) {
        console.log('Loading last city:', lastCity);
        // Optionally auto-load previous location
    }
});
