import {cityNameUI, searchButton, cityNameInput, temperatureUI, weatherIconUI} from './view.js';


let cityName = cityNameInput.value;
const serverUrl = 'http://api.openweathermap.org/data/2.5/weather';
const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';
let url = `${serverUrl}?q=${cityName}&appid=${apiKey}`;
let weatherJSON;
let getedResult;

const cityNameUIArray = Array.from(cityNameUI);
const temperatureUIArray = Array.from(temperatureUI);

searchButton.addEventListener('click', getCityName);

function getCityName() {
    cityName = cityNameInput.value;
    getWeatherDetails();
}

function getWeatherDetails () {
    
    url = `${serverUrl}?q=${cityName}&appid=${apiKey}`;
    weatherJSON = fetch(url);
    weatherJSON = weatherJSON
    .then(response => response.json())
    .then(json => {getedResult = json;

        let tempCelci = Math.round(getedResult.main.temp - 273.15);
        const iconCode = getedResult.weather[0].icon;
        const imgUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

        cityNameUIArray.forEach(item => item.innerText = getedResult.name);
        temperatureUIArray.forEach(item => item.innerText = tempCelci);
        weatherIconUI.src = imgUrl;

        console.log(getedResult);
    });

}




