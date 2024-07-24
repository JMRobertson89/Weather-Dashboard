const apiKey = 'a62915ca2ffd9620d9f39d90f68fc54d'
const curWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

let searchForm = document.getElementById('searchForm');
let cityInput = document.getElementById('searchInput');
let forecastContainer = document.getElementById('forecastCards');
let previousSearchesEl = document.getElementById('prevSearches');


// TODO Search Form event listener



function handleSearchFormSubmit(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city === ''){
        alert('Please enter a city name');
        return;
    }
    fetchCurrentWeather(city)
    .then(data => {
        console.log('Weather Data', data);
        updateCurrentWeather(data);
        saveSearch(city);
    })
    fetchForecast(city)
    .then(data => {
        console.log('Forecast Data', data);
        updateForecastUI(data);
    })

    cityInput.value = '';
}

searchForm.addEventListener('submit', handleSearchFormSubmit);
displayPreviousSearches();






// TODO Display previous searches 

function displayPreviousSearches(){
    previousSearchesEl.innerHTML = '';
    let searches = JSON.parse(localStorage.getItem('weatherSearches')) || [];
    searches.forEach(city => {
        const searchItem = document.createElement('button');
        searchItem.classList.add('btn', 'btn-outline-secondary', 'previous-search-item');
        searchItem.textContent = city;
        searchItem.addEventListener('click', () => {
            fetchCurrentWeather(city)
    .then(data => {
        updateCurrentWeather(data);
    });
    fetchForecast(city)
    .then(data => {
        updateForecastUI(data);
    })
        });
        previousSearchesEl.appendChild(searchItem);
    });
}


// TODO Save to local storage 

function saveSearch(city) {
    let searches = JSON.parse(localStorage.getItem('weatherSearches')) || [];
    searches.unshift(city);
    localStorage.setItem('weatherSearches', JSON.stringify(searches));
    displayPreviousSearches();
}




// TODO Fetch API

async function fetchCurrentWeather(city) {
    const url = `${curWeatherUrl}?q=${city}&appid=${apiKey}&units=imperial`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error ('Failed to fetch weather data');
        }
    } catch (error) {
        console.error(error);
    }
}

async function fetchForecast(city) {
    const url = `${forecastUrl}?q=${city}&appid=${apiKey}&units=imperial`;
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error ('Failed to fetch weather data');
        }
    } catch (error) {
        console.error(error);
    }
}




//TODO Update Current Weather

function updateCurrentWeather(data){
    const cityElement = document.getElementById('city');
    const dateElement = document.getElementById('date');
    const iconElement = document.getElementById('icon');
    const tempElement = document.getElementById('temp');
    const humidityElement = document.getElementById('humidity');
    const windSpeedElement = document.getElementById('windspeed');

    if (cityElement) cityElement.textContent = data.name;
    if (dateElement) dateElement.textContent = new Date(data.dt * 1000).toLocaleDateString();
    if (iconElement) iconElement.src = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    if (tempElement) tempElement.textContent = `Temperature: ${data.main.temp} °F`;
    if (humidityElement) humidityElement.textContent = `Humidity: ${data.main.humidity}%`;
    if (windSpeedElement) windSpeedElement.textContent = `Wind Speed: ${data.wind.speed} mp/h`;
}




// TODO Create forecast containers


function updateForecastUI(data) {
    const forecastContainer = document.getElementById('forecastCards');
    forecastContainer.innerHTML = '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyForecasts = {};

    data.list.forEach(item => {
        const forecastDate = new Date(item.dt * 1000);
        forecastDate.setHours(0, 0, 0, 0);

        if (forecastDate.getTime() <= today.getTime()) {
            return;
        }

        const dateKey = forecastDate.toISOString().slice(0, 10);

        if (!dailyForecasts[dateKey]) {
            dailyForecasts[dateKey] = {
                date: forecastDate,
                entries: [],
                highestTemp: -Infinity,
                highestHumidity: -Infinity,
                highestWindSpeed: -Infinity,
                fourthEntryIcon: null
            };
        }

        dailyForecasts[dateKey].entries.push({
            icon: item.weather[0].icon,
            temp: item.main.temp,
            humidity: item.main.humidity,
            windSpeed: item.wind.speed
        });

        if (item.main.temp > dailyForecasts[dateKey].highestTemp) {
            dailyForecasts[dateKey].highestTemp = item.main.temp;
        }
        if (item.main.humidity > dailyForecasts[dateKey].highestHumidity) {
            dailyForecasts[dateKey].highestHumidity = item.main.humidity;
        }
        if (item.wind.speed > dailyForecasts[dateKey].highestWindSpeed) {
            dailyForecasts[dateKey].highestWindSpeed = item.wind.speed;
        }
        if (dailyForecasts[dateKey].entries.length === 4) {
            dailyForecasts[dateKey].fourthEntryIcon = item.weather[0].icon;
        }
    });

    Object.values(dailyForecasts).forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('col');
        forecastCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${day.date.toLocaleDateString()}</h5>
                    <img src="https://openweathermap.org/img/w/${day.fourthEntryIcon}.png" alt="Weather Icon" class="card-img-top">
                    <p class="card-text">Temp: ${day.highestTemp}°F</p>
                    <p class="card-text">Humidity: ${day.highestHumidity}%</p>
                    <p class="card-text">Wind: ${day.highestWindSpeed}mph</p>
                </div>
            </div>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}















