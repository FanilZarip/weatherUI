import {cityNameUI, searchButton, cityNameInput, temperatureUI, weatherIconUI} from './view.js';

let cityName = cityNameInput.value;
const serverUrl = 'https://api.openweathermap.org/data/2.5/weather';
const metric = 'units=metric'
const apiKey = 'f660a2fb1e4bad108d6160b7f58c555f';
let weatherJSON;
let getedResult;

const cityNameUIArray = Array.from(cityNameUI);
const temperatureUIArray = Array.from(temperatureUI);

searchButton.addEventListener('click', getCityName);

function getCityName() {
    cityName = cityNameInput.value;
    // console.log(url);
    getWeatherDetails(cityName);
}

function getWeatherDetails (cityName) {

    let url = `${serverUrl}?q=${cityName}&appid=${apiKey}&${metric}`;
    weatherJSON = fetch(url);
    weatherJSON
    .then(response => {
        if(response.status === 404) {
            alert('Enter correct city');
        }
        else {
            return response.json();
        }
    })
    .then(json => {
        
        getedResult = json;
        let tempAtCelci = Math.round(getedResult.main.temp);
        const iconCode = getedResult.weather[0].icon;
        const imgUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        cityNameUIArray.forEach(item => item.innerText = getedResult.name);
        temperatureUIArray.forEach(item => item.innerText = tempAtCelci);
        
        weatherIconUI.src = imgUrl;

        console.log(getedResult);
    });

}




