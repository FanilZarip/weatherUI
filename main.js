// import {cityNameUI, searchButton, cityNameInput, temperature, weatherIcon} from './view.js';
import {format, fromUnixTime} from 'date-fns';
import Cookies from 'js-cookie';

const UI_ELEMS = {
    cityNameInput: document.querySelector('.inputCity'),
    searchButton: document.querySelector('.search__button'),
    cityNameUI: document.querySelectorAll('.cityName'),
    temperature: document.querySelectorAll('.temperature__value'),
    feelsLike: document.querySelector('.feelsLike__value'),
    weatherStatus: document.querySelector('.weather__status'),
    sunsetTime: document.querySelector('.sunset__time'),
    sunriseTime: document.querySelector('.sunrise__time'),
    weatherIcon: document.querySelector('.weather_icon'),
    favoriteListBlock: document.querySelector('.favorite__List'),
    currentCityName: document.querySelector('.current__city'),
    addToFavoriteButton: document.querySelector('.addToFavorityButton'),
    forecast: document.querySelector('#Forecast'), 
    forecastList: document.querySelector('.forecast__list'),
};


const UI_COLLECTION_ARRAY = {
    cityName: Array.from(UI_ELEMS.cityNameUI),
    temperature: Array.from(UI_ELEMS.temperature),
};

const SERVER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_SERVER_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const IMG_URL = 'https://openweathermap.org/img/wn/';
const forecastCount = 'cnt=3';
const METRIC = 'units=metric'
const API_KEY = '97f36208f41daeec8c857deb48d7e06c';

// Using idCounter For Hidden Radio in "Added List"
let idCounter = 0;

// В будущем используй function Expression для вызова подобных коллекций.
let favoriteCityCollectionArray = [];
const addedCitiesListSet = getDataFromLocalStorage();

addToFavoriteFromSaved(addedCitiesListSet);
getWeatherForSavedSelectedCity(addedCitiesListSet);

// Листенер вызов анонимной функции для исключения их из function getCityName()
UI_ELEMS.searchButton.addEventListener('click', function(){getWeatherDetails(getCityName())}); //Так делать нормально или слишком замудрено?
UI_ELEMS.searchButton.addEventListener('click', function(){getForecastDetails(getCityName())}); //Так делать нормально или слишком замудрено?
UI_ELEMS.searchButton.addEventListener('click', function(){setToDefaultAddedListbackground(favoriteCityCollectionArray)});
UI_ELEMS.searchButton.addEventListener('click', () => {addLastSelectedCityToLocalStorage('null')});


function getCityName() {
    const cityName = UI_ELEMS.cityNameInput.value;
    return cityName;
}

function checkError404(awaitResult) {
    try {
        if (awaitResult.status === 404) {
            throw new Error('Enter correct city');
        }
    }
    catch (error) {
        (alert(error));
    }
}

async function getWeatherDetails(cityName) {

    const url = `${SERVER_URL}?q=${cityName}&appid=${API_KEY}&${METRIC}`;

    try {
        const weatherJSON = await fetch(url);
        checkError404(weatherJSON); 
        const weatherResultJson = await weatherJSON.json();

        const WEATHER_NOW_DATA = {
            temperature: Math.round(weatherResultJson.main.temp),
            cityName: weatherResultJson.name,
            imgIcon: weatherResultJson.weather[0].icon,
        }

        const WEATHER_DETAILS_DATA = {
            time: 'time',
            sunriseTime: weatherResultJson.sys.sunrise,
            sunsetTime: weatherResultJson.sys.sunset,            
            feelsLikeTemperature: Math.round(weatherResultJson.main.feels_like),
            weatherStatus: weatherResultJson.weather[0].main,
        }

        outputWeatherNow(WEATHER_NOW_DATA);
        outputWeatherDetails(WEATHER_DETAILS_DATA);
    } catch (err) {
        console.log('I have await Error', err.stack);
    }
}

async function getForecastDetails(cityName) {

    const url = `${FORECAST_SERVER_URL}?q=${cityName}&appid=${API_KEY}&${METRIC}&${forecastCount}`;
    
    try {
        const forecastJSON = await fetch(url);
        checkError404(forecastJSON);
        const forecastData = await forecastJSON.json();
        const forecastArray = forecastData.list;
        UI_ELEMS.forecastList.innerHTML = null;
        
        forecastArray.forEach(elem => {
            // Тут лучше использовать деструктуризацию?
            // Оказалось, лучше оставить объект, т.к. его можно передать при вызове функции.
            // Но это не точно)
            const FORECAST_DATA = {
                day: convertDateToHumanReadable(elem.dt, 'day'),
                time: convertDateToHumanReadable(elem.dt, 'time'),
                currentTemperature: Math.round(elem.main.temp),
                feelsLikeTemperature: Math.round(elem.main.feels_like),
                currentWeatherStatus: elem.weather[0].main,
                feelsLikeImgCode: elem.weather[0].icon,
            }
            createForecastBlock(FORECAST_DATA);
        });

    } catch (error) {
        alert(error.stack)
    }
}

// Working with Added Locations

UI_ELEMS.addToFavoriteButton.addEventListener('click', addToFavorite);
UI_ELEMS.addToFavoriteButton.addEventListener('click', getFavoriteCityCollection);
UI_ELEMS.addToFavoriteButton.addEventListener('click', getAddedCitiesBlock);




function addToFavoriteFromSaved (savedData) {
    savedData.forEach(elem => {
        currentId = idCounter++;
        createFavoriteListBlock(elem, currentId);
        getAddedCitiesBlock();
        getFavoriteCityCollection();
    });
}

function getWeatherForSavedSelectedCity(savedData) {
    const selectedCity = Cookies.get('lastSelectedCity');
    const haveLastSelectedCity = savedData.has(selectedCity);

    if (haveLastSelectedCity) {
        
        const selectedCityFromSaved = favoriteCityCollectionArray.find(elem => elem.children[1].innerText === selectedCity);
        const selectedCityDiv = selectedCityFromSaved.children[1].parentNode;

        changeSelectedCityBackground(selectedCityDiv);
        getWeatherDetails(selectedCity);
        getForecastDetails(selectedCity);
    }
}


function addToFavorite () {
    currentId = idCounter++;
    // Не используем глобальную переменную т.к. очередь статическая?
    const cityName = UI_ELEMS.currentCityName.innerText;
    const cityNotInFavoriteSet = !addedCitiesListSet.has(cityName);
    
    if (cityNotInFavoriteSet) {
        createFavoriteListBlock(cityName, currentId);
        addCityToAddedListSet(cityName);
    }
}

// Таким образом можно получить актуальное состояние коллекции. Нет необходимости писать в переменную глобальной области видимости
function getAddedCitiesBlock() {
    // Лучше записать в переменную область видимости?
    const addedCitiesList = document.querySelector('.favorite__List');
    return addedCitiesList;
}

// Cбор текущей коллекции правильнее выше или ниже (через присвоение переменной в глобальной области видимости)

function getFavoriteCityCollection() {
    const favoriteCityCollection = document.querySelectorAll(".favoriteCity");
    favoriteCityCollectionArray = Array.from(favoriteCityCollection);
    console.log('radioCollection', favoriteCityCollectionArray);
}

const addedCitiesBlock = getAddedCitiesBlock(); //Стоит так заморачиваться или можно вешать листенер на функцию?
addedCitiesBlock.addEventListener('click', selectCityOnListUI);
addedCitiesBlock.addEventListener('click', deleteCityFromUIFavorite);
addedCitiesBlock.addEventListener('click', () => {setDefaultUnselectedCityBackground(favoriteCityCollectionArray);});

function selectCityOnListUI(event) {
    const isClickOnCityName = event.target.hasAttribute('name');

    if (isClickOnCityName) {
        const cityName = event.target.parentNode.children[1].innerText;
        const selectedCityDiv = event.target.parentNode;

        getWeatherDetails(cityName);
        getForecastDetails(cityName);
        addLastSelectedCityToLocalStorage(cityName);
        changeSelectedCityBackground(selectedCityDiv);
    }
}


function deleteCityFromUIFavorite(event) {
    const cityBlockInList = event.target.parentNode;
    const clickOnRemoveButton = event.target.className === 'removeCity';
    
    if (clickOnRemoveButton) {
        const deletCityName = event.target.parentNode.children[1].innerText;
        cityBlockInList.remove();
        deletCityFromAddedListSet(deletCityName);
    }
}


function addCityToAddedListSet(cityName) {
    addedCitiesListSet.add(cityName);
    console.log("Test Add to Set", addedCitiesListSet);
    addToLocalStorage(addedCitiesListSet);
}

function deletCityFromAddedListSet(cityName) {
    addedCitiesListSet.delete(cityName);
    addToLocalStorage(addedCitiesListSet);
}

// Changing UNIX timestamp to UserFriendly time

function convertDateToHumanReadable(unixTimeStamp, dateOrTime) {

    const DateHumanFormat = fromUnixTime(unixTimeStamp);

    const timeWithoutMinuts = format(DateHumanFormat, "kk:mm");
    const dayWithMonth = format(DateHumanFormat, "d MMM");
    
    switch (dateOrTime) {
        case 'time':
        return timeWithoutMinuts;
        break;

        case 'day':
        return dayWithMonth;
        break;
    }

}

// ///////////
// UI
////////////

function changeSelectedCityBackground(divBlock) {
    divBlock.classList.add('favoriteCityChecked');       
}

function setDefaultUnselectedCityBackground(favoriteCityArray) {
    favoriteCityArray.forEach(elem => {

        if (!elem.childNodes[0].checked) {
            const cityName = elem.children[1].innerText;
            console.log('I search elem', cityName);
            elem.classList.remove('favoriteCityChecked');
        }
    });
}

function setToDefaultAddedListbackground (favoriteCityArray) {
    favoriteCityArray.forEach(elem => {
        elem.childNodes[0].checked = false;
        elem.classList.remove('favoriteCityChecked');
    });
}

function outputWeatherNow({imgIcon, cityName, temperature}) {
    const imgUrl = `${IMG_URL}${imgIcon}@2x.png`;

    UI_COLLECTION_ARRAY.cityName.forEach(item => item.innerText = cityName);
    UI_COLLECTION_ARRAY.temperature.forEach(item => item.innerText = temperature);
    UI_ELEMS.weatherIcon.src = imgUrl;
}

function outputWeatherDetails({time, feelsLikeTemperature, weatherStatus, sunriseTime, sunsetTime}) {
    UI_ELEMS.feelsLike.innerText = feelsLikeTemperature;
    UI_ELEMS.weatherStatus.innerText = weatherStatus;
    UI_ELEMS.sunriseTime.innerText = convertDateToHumanReadable(sunriseTime, time);
    UI_ELEMS.sunsetTime.innerText = convertDateToHumanReadable(sunsetTime, time);
}


function createFavoriteListBlock (cityName, id) {

    const FAVORITE_LIST_BLOCK_ELEM = {
        favoriteCityDiv: document.createElement('div'),
        removeSpan: document.createElement('span'),
        favoriteCity: document.createElement('p'),
        RadioHidden: document.createElement('input'),
        labeForRadio: document.createElement('label'),
        RemoveButton: 'x',
        radioId: 'fovoriteCity-'+id,
    };

    FAVORITE_LIST_BLOCK_ELEM.favoriteCityDiv.classList.add('favoriteCity', 'd-flex');

    FAVORITE_LIST_BLOCK_ELEM.RadioHidden.setAttribute('type', 'radio');
    FAVORITE_LIST_BLOCK_ELEM.RadioHidden.setAttribute('id', FAVORITE_LIST_BLOCK_ELEM.radioId);
    FAVORITE_LIST_BLOCK_ELEM.RadioHidden.setAttribute('name', 'favoriteCityRadioName');
    FAVORITE_LIST_BLOCK_ELEM.RadioHidden.setAttribute('hidden', true);

    FAVORITE_LIST_BLOCK_ELEM.labeForRadio.setAttribute('for', FAVORITE_LIST_BLOCK_ELEM.radioId);
    FAVORITE_LIST_BLOCK_ELEM.labeForRadio.classList.add('labelWidth');

    FAVORITE_LIST_BLOCK_ELEM.removeSpan.classList.add('removeCity');
    FAVORITE_LIST_BLOCK_ELEM.removeSpan.innerText = FAVORITE_LIST_BLOCK_ELEM.RemoveButton;

    FAVORITE_LIST_BLOCK_ELEM.favoriteCity.classList.add('location__name', 'cityAtFavorite');
    FAVORITE_LIST_BLOCK_ELEM.favoriteCity.innerText = cityName;

    UI_ELEMS.favoriteListBlock.prepend(FAVORITE_LIST_BLOCK_ELEM.favoriteCityDiv);

    FAVORITE_LIST_BLOCK_ELEM.favoriteCityDiv.prepend(FAVORITE_LIST_BLOCK_ELEM.removeSpan);
    FAVORITE_LIST_BLOCK_ELEM.favoriteCityDiv.prepend(FAVORITE_LIST_BLOCK_ELEM.labeForRadio);
    FAVORITE_LIST_BLOCK_ELEM.favoriteCityDiv.prepend(FAVORITE_LIST_BLOCK_ELEM.RadioHidden);

    FAVORITE_LIST_BLOCK_ELEM.labeForRadio.prepend(FAVORITE_LIST_BLOCK_ELEM.favoriteCity);

}

function createForecastBlock({day, time, currentTemperature, feelsLikeTemperature, currentWeatherStatus, feelsLikeImgCode}) {
    
    const temperatureTitle = 'Temperature: ';
    const feelsLikeTemperatureTitle = 'Feels Like: ';

    const icon = feelsLikeImgCode;
    const imgUrl = `https://openweathermap.org/img/wn/${icon}.png`;

    const FORECAST_CSS = {
        // Это не избыточно?
    }

    const FORECAST_ELEM = {

        li: document.createElement('li'),

        dateDiv: document.createElement('div'),
        dateDay: document.createElement('p'),
        dateTime: document.createElement('p'),
        
        temperatureWrapper: document.createElement('div'),
        temperature: document.createElement('div'),
        temperatureTitle: document.createElement('span'),
        temperatureNumber: document.createElement('span'),
        weatherStatus: document.createElement('p'),
        
        feelsLikeWrapper: document.createElement('div'),
        feelsLikeData: document.createElement('div'),
        feelsLikeTemperatureTitle: document.createElement('span'),
        feelsLikeTemperatureNumber: document.createElement('span'),
        feelsLikeWeatherStatus: document.createElement('img'),
    };

    FORECAST_ELEM.li.classList.add('forecast__item');
    UI_ELEMS.forecastList.append(FORECAST_ELEM.li);

    FORECAST_ELEM.dateDiv.classList.add('forecast__day', 'd-flex');
    FORECAST_ELEM.li.prepend(FORECAST_ELEM.dateDiv);
    
    FORECAST_ELEM.dateDay.classList.add('day');
    FORECAST_ELEM.dateDay.innerText = day;
    FORECAST_ELEM.dateDiv.prepend(FORECAST_ELEM.dateDay);
    
    FORECAST_ELEM.dateTime.classList.add('time');
    FORECAST_ELEM.dateTime.innerText = time;
    FORECAST_ELEM.dateDay.after(FORECAST_ELEM.dateTime);

// //////////////////////////
    FORECAST_ELEM.temperatureWrapper.classList.add('forecast__temperature', 'd-flex');
    FORECAST_ELEM.dateDiv.after(FORECAST_ELEM.temperatureWrapper);
    FORECAST_ELEM.temperature.classList.add('temperature__item');
    FORECAST_ELEM.temperatureWrapper.prepend(FORECAST_ELEM.temperature);

    FORECAST_ELEM.temperatureTitle.classList.add('forecast__temperature_title');
    FORECAST_ELEM.temperatureTitle.innerText = temperatureTitle;
    FORECAST_ELEM.temperature.prepend(FORECAST_ELEM.temperatureTitle);

    FORECAST_ELEM.temperatureNumber.classList.add('forecast__temperature_date');
    FORECAST_ELEM.temperatureTitle.after(FORECAST_ELEM.temperatureNumber);
    FORECAST_ELEM.temperatureNumber.innerText = currentTemperature + '°';

    FORECAST_ELEM.weatherStatus.classList.add('forecast__temperature__state');
    FORECAST_ELEM.weatherStatus.innerText = currentWeatherStatus;
    FORECAST_ELEM.temperature.after(FORECAST_ELEM.weatherStatus);

///////////////////////////////////
    FORECAST_ELEM.feelsLikeWrapper.classList.add('forecast__feels_like', 'd-flex');
    FORECAST_ELEM.temperatureWrapper.after(FORECAST_ELEM.feelsLikeWrapper);

    FORECAST_ELEM.feelsLikeData.classList.add('temperature__item');
    FORECAST_ELEM.feelsLikeWrapper.prepend(FORECAST_ELEM.feelsLikeData);
    
    FORECAST_ELEM.feelsLikeTemperatureTitle.classList.add('forecast__temperature_title');
    FORECAST_ELEM.feelsLikeTemperatureTitle.innerText = temperatureTitle;
    FORECAST_ELEM.feelsLikeData.prepend(FORECAST_ELEM.feelsLikeTemperatureTitle);
    
    FORECAST_ELEM.feelsLikeTemperatureNumber.classList.add('forecast__temperature_date');
    FORECAST_ELEM.feelsLikeTemperatureNumber.innerText = feelsLikeTemperature + '°';
    FORECAST_ELEM.feelsLikeTemperatureTitle.after(FORECAST_ELEM.feelsLikeTemperatureNumber);
    
    FORECAST_ELEM.feelsLikeWeatherStatus.classList.add('forecast__temperature__state');
    FORECAST_ELEM.feelsLikeWeatherStatus.src = imgUrl;
    FORECAST_ELEM.feelsLikeData.after(FORECAST_ELEM.feelsLikeWeatherStatus);

}

// ////////////////
////////////////// LocalStorage
/////////////////

function addToLocalStorage(set) {
    localStorage.setItem('favoriteCitiesListStorage', JSON.stringify([...set]));
}

function addLastSelectedCityToLocalStorage(city) {
    Cookies.set('lastSelectedCity', city, { expires: 1/48 });
}

function getDataFromLocalStorage() {
    const favoriteCityListJSON = localStorage.getItem('favoriteCitiesListStorage');
    const favoriteCityListParsed = JSON.parse(favoriteCityListJSON);
    const firstLaunch = favoriteCityListParsed === null;
    
    console.log(favoriteCityListParsed);

    if (firstLaunch) {
        const emptySet = new Set();
        return emptySet;
    } else {
        const setFromStorage = new Set(favoriteCityListParsed);
        return setFromStorage;
    }
}
