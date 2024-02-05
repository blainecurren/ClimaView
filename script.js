// Get form element value
var leftColumnEL = document.querySelector("#left-column");

// Get all elements of cities list for event handler
var citiesListContainerBtnEl = document.querySelector(".list-group-item");

// Daily forecast Containter
var dailyWeatherContainerEl = document.querySelector(
  "#forecast-output-container"
);

// Create form container
var formContainer = document.createElement("form");

formContainer.setAttribute("id", "dymCityForm");

formContainer.classList = "city-search-forecast-container";

leftColumnEL.appendChild(formContainer);

// Create H3 element
var formH3 = document.createElement("h3");
formH3.textContent = " Search for a City ";
formContainer.appendChild(formH3);

// Create input element
var formInput = document.createElement("input");
formInput.setAttribute("id", "city-name");
formInput.setAttribute("type", "text");
formInput.setAttribute("autofocus", "true");
formInput.classList = "form-input";
formContainer.appendChild(formInput);

// Create button element
var formButton = document.createElement("button");
formButton.setAttribute("type", "submit");
formButton.classList = "btn fas fa-search";
formContainer.appendChild(formButton);

// Find the city form
var searchEventHandler = document.querySelector("#dymCityForm");
var searchByCityEl = document.querySelector("#city-name");

// Left column cities container
var citiesContainerEl = document.createElement("div");
citiesContainerEl.setAttribute("id", "dym-cities-list");
citiesContainerEl.classList = "list-group";

// Append to the left column
leftColumnEL.appendChild(citiesContainerEl);

// Find the list div container
var citiesListContainerEl = document.querySelector("#dym-cities-list");

var populateSavedCities = function () {
  // Get array from local storage
  var citiesLocalStorage = JSON.parse(localStorage.getItem("savedCities"));

  // City exist or not. 0 = not, 1 = yes
  var cityExist = 0;

  if (citiesLocalStorage === null) {
    // It does note exist, therefore, no items to add to saved cities
    //console.log("No items to add");
  } else {
    // we will popualte the saved cities

    $(".list-group-item").remove(); // Remove all list items from the document with jquery

    for (i = 0; i < citiesLocalStorage.length; i++) {
      // Populate the cities as anchors and add necessary attribures and classes.
      var cityNameEl = document.createElement("a");
      var splitCityText = "";
      cityNameEl.setAttribute("href", "#");
      cityNameEl.setAttribute("data-city", citiesLocalStorage[i]);
      cityNameEl.setAttribute("id", citiesLocalStorage[i]);
      cityNameEl.setAttribute("role", "button");
      cityNameEl.classList =
        "list-group-item list-group-item-action list-group-item-primary";
      cityNameEl.textContent = citiesLocalStorage[i];
      //citiesListContainerEl.appendChild(cityNameEl);
      // dynContainer
      citiesContainerEl.appendChild(cityNameEl);
    }
    // alert("All saved cities have been populated");
  }
};

// *** Second fetch call, this will run as non asynchronous *** //

function fetchSecondCall(
  searchByCity,
  latNum,
  lonNum,
  unixTimeCurrentDay,
  currentDayIcon,
  currentTempImperial,
  currentHumidity,
  currentMPS,
  mphWindSpeed
) {
  // Assign API URL
  var openWeatherApiFiveDayUrl =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    latNum +
    "&lon=" +
    lonNum +
    "&appid=32a27c42260b02de3ba5e1466def4861&units=imperial";

  fetch(
    // Do fetch on lat and lon for the "onecall" open weather API
    openWeatherApiFiveDayUrl
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (secondCallData) {
      // Current Day UV
      var uvIndex = secondCallData.current.uvi;

      var unix_timestamp = unixTimeCurrentDay;

      // Create a new JavaScript Date object based on the timestamp
      var date = new Date(unix_timestamp * 1000);

      // Year format to be used
      var year = date.getFullYear();
      var monthOfYear = date.getMonth() + 1; // month Jan =0, then +1 for actual January for display
      var dayOfMonth = date.getDate();
      var fullDayDaily =
        "(" +
        (date.getMonth() + 1) +
        "/" +
        date.getDate() +
        "/" +
        date.getFullYear() +
        ")";

      // Populate current day data
      populateCurrentDayHtml(
        searchByCity,
        fullDayDaily,
        currentDayIcon,
        currentTempImperial,
        currentHumidity,
        currentMPS,
        mphWindSpeed,
        uvIndex
      );

      // Populate 5 day forcast
      populate5DayForecast(secondCallData);
    });
}

// Function to populate current day forecast
function populateCurrentDayHtml(
  searchByCity,
  fullDayDaily,
  currentDayIcon,
  currentTempImperial,
  currentHumidity,
  currentMPS,
  mphWindSpeed,
  uvIndex
) {
  // Populate current Day html elements
  var dailyForecastContainerEl = document.createElement("div");
  dailyForecastContainerEl.setAttribute("id", "daily-forecast-container");
  dailyForecastContainerEl.classList = "borderDiv";

  var currentDayTitle = document.createElement("h3");
  currentDayTitle.textContent =
    searchByCity.charAt(0).toUpperCase() +
    searchByCity.slice(1) +
    " " +
    fullDayDaily;

  var currentIconEl = document.createElement("span");
  // "<i class='fas fa-check-square status-icon icon-success'></i>"
  var currentIconSymbol =
    "http://openweathermap.org/img/wn/" + currentDayIcon + "@2x.png";
  // alert(currentIconSymbol);
  currentIconEl.innerHTML = "<img src=" + currentIconSymbol + "></img>";
  currentDayTitle.append(currentIconEl);

  // Create p elements to hold the rest of current day information
  var currentTempEl = document.createElement("p");
  var currentHumidityEl = document.createElement("p");
  var currentWinSpEl = document.createElement("p");
  var currentUvIEl = document.createElement("p");

  // Assign helments text content
  // Round temperature to no decimal places
  currentTempEl.textContent =
    "Temperature: " + currentTempImperial.toFixed(1) + " °F";
  currentHumidityEl.textContent = "Humidity: " + currentHumidity + "%";
  currentWinSpEl.textContent = "Wind Speed: " + currentMPS + " MPH";
  currentUvIEl.textContent = "UV Index: " + uvIndex;

  // Remove all list items from the document with jquery
  $("#daily-forecast-container").remove();

  // Append daily forecast
  dailyWeatherContainerEl.appendChild(dailyForecastContainerEl);
  dailyForecastContainerEl.appendChild(currentDayTitle);
  dailyForecastContainerEl.appendChild(currentTempEl);
  dailyForecastContainerEl.appendChild(currentHumidityEl);
  dailyForecastContainerEl.appendChild(currentWinSpEl);
  dailyForecastContainerEl.appendChild(currentUvIEl);
}

function populate5DayForecast(secondCallData) {
  // Remove all list items from the document with jquery
  $("#weekly-forecast-container").remove();

  // Populate current Day html elements
  var weeklyForecastContainerEl = document.createElement("div");
  weeklyForecastContainerEl.setAttribute("id", "weekly-forecast-container");

  //weeklyForecastContainerEl.classList = "borderDiv";
  weeklyForecastContainerEl.classList = "border-Div-right-column";

  var fiveDayForecast = document.createElement("h3");
  fiveDayForecast.textContent = "5-Day Forecast:";

  // Append as topmost before for loop to generate contents of each div container.
  dailyWeatherContainerEl.appendChild(weeklyForecastContainerEl);
  weeklyForecastContainerEl.appendChild(fiveDayForecast);

  // Create a div just to hold the 5 day as a flex row
  var weeklyFlexContainerEL = document.createElement("div");
  weeklyFlexContainerEL.classList = "weekly-flex-conatiner";

  // Append only after the date on the 5 Day Forecast
  weeklyForecastContainerEl.appendChild(weeklyFlexContainerEL);

  for (i = 1; i <= 5; i++) {
    // Get 5 days worth of conent from the 5 day forecast.
    var unixTime = secondCallData.daily[i].dt;

    var unix_timestamp = unixTime;

    // Create a new JavaScript Date object based on the timestamp
    var date = new Date(unix_timestamp * 1000);

    // Hours from the timestamp
    var year = date.getFullYear();
    var monthOfYear = date.getMonth() + 1;
    var dayOfMonth = date.getDate();

    // Values to be displayed
    var fullDay =
      date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(); // Date
    var iconWeather = secondCallData.daily[i].weather[0].icon; // icon
    var fahrenheitTemp = secondCallData.daily[i].temp.day; // Temp @ fahrenheit
    var humidity = secondCallData.daily[i].humidity;

    // Create a div to hold each day of the 5 day weekly forecast.
    var eachDayContainer = document.createElement("div");
    eachDayContainer.setAttribute("id", "day=" + [i]);
    eachDayContainer.classList = "border-div-five-day-forecast";

    var currentDayTitle = document.createElement("p");
    currentDayTitle.textContent = fullDay;

    // Span Element hold the icon
    var iconSpan = document.createElement("p");
    iconSpan.textContent = "";

    var currentIconEl = document.createElement("span");
    var currentIconSymbol =
      "http://openweathermap.org/img/wn/" + iconWeather + "@2x.png";

    // alert
    currentIconEl.innerHTML = "<img src=" + currentIconSymbol + "></img>";
    iconSpan.append(currentIconEl);

    // Create p elements for the rest of current day info
    var currentTempEl = document.createElement("p");
    var currentHumidityEl = document.createElement("p");

    currentTempEl.textContent =
      "Temperature: " + fahrenheitTemp.toFixed(2) + " °F";
    currentHumidityEl.textContent = "Humidity: " + humidity + "%";

    // Append daily forecast
    eachDayContainer.appendChild(currentDayTitle);
    eachDayContainer.appendChild(currentIconEl);
    eachDayContainer.appendChild(currentTempEl);
    eachDayContainer.appendChild(currentHumidityEl);

    // Once all items have been appended to the eachDayContainer we can append to the parent.
    weeklyFlexContainerEL.appendChild(eachDayContainer);
  }
}

var getWeatherData = function (event, cityClicked) {
  // Prevent multiple clickes when city entered at search bar or list of cities.
  event.preventDefault();

  if (cityClicked) {
    // get value from input elementgit
    var searchByCity = cityClicked.trim();
  } else {
    var searchByCity = searchByCityEl.value.trim();
  }

  // If search bar is emtpy
  if (searchByCity == "") {
    alert("Please do not leave city name blank");
    searchByCityEl.value = "";
    return;
  } else {
    searchByCityEl.value = "";
  }

  // Get an array from local storage
  var citiesLocalStorage = JSON.parse(localStorage.getItem("savedCities"));

  // check if city var exists
  var cityExist = 0;

  // Check if array is null and create new one again.
  if (citiesLocalStorage === null) {
    citiesSearched = new Array();
  } else {
    // Assign the localStorage values to a new array
    citiesSearched = citiesLocalStorage;
  }

  // First API call to get latitude and longitude for the oncall api
  var openWeatherApiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    searchByCity +
    "&appid=32a27c42260b02de3ba5e1466def4861&units=imperial";

  fetch(openWeatherApiUrl)
    .then(function (weatherResponse) {
      if (weatherResponse.ok) {
        return weatherResponse.json();
      } else {
        // Any other response like 400 500 will display the error.
        window.alert(
          "Error: " +
            weatherResponse.statusText +
            "\nPlease re-enter a valid city"
        );
        // Clear the input parameter from the user
        searchByCityEl.value = "";
        return;
      }
    })
    .then(function (weatherLatLon) {
      var latNum = weatherLatLon.coord.lat;
      var lonNum = weatherLatLon.coord.lon;
      var unixTimeCurrentDay = weatherLatLon.dt;
      // Icon for the current day
      var currentDayIcon = weatherLatLon.weather[0].icon;
      // Temperature
      var currentTempImperial = weatherLatLon.main.temp;
      // Humidity
      var currentHumidity = weatherLatLon.main.humidity;
      var currentMPS = weatherLatLon.wind.speed;
      var mphWindSpeed = Math.round(currentMPS * 2.237);

      // Add api call city to the local storage &  Validate if city is new.
      for (i = 0; i < citiesSearched.length; i++) {
        if (searchByCity.toLowerCase() === citiesSearched[i].toLowerCase()) {
          cityExist = 1;
          break;
        }
      }
      // if new city add to array and set to local storage
      if (cityExist === 0) {
        citiesSearched.push(
          searchByCity
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
            .join(" ")
        );
        // Save to local storage
        localStorage.setItem("savedCities", JSON.stringify(citiesSearched));
      }

      // Push city data to HTML
      fetchSecondCall(
        searchByCity
          .toLowerCase()
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
          .join(" "),
        latNum,
        lonNum,
        unixTimeCurrentDay,
        currentDayIcon,
        currentTempImperial,
        currentHumidity,
        currentMPS,
        mphWindSpeed
      );

      populateSavedCities(); // Second after a push has been done.
    })
    .catch(function (error) {
      return;
    });
};

// Event listener for searching manually and clicking the magnifiying glass.
searchEventHandler.addEventListener("submit", getWeatherData);

// Funciton to handle the event from the list of cities when clicked.
var cityClicked = function (event) {
  // User data value sfrom data-city to know which element was clicked and gets its value
  // Value will then be passed to our main funciton to get api data.
  var cityClicked = event.target.getAttribute("data-city");
  if (cityClicked) {
    getWeatherData(event, cityClicked);
    //alert(cityClicked)
  } else {
    // If the value is empty, it should not happen but it is a failsafe.
    alert(
      "Internal erro found, please email esroleo@gmail.com.\nPlease provide story of issue in order for it to be fixed"
    );
  }
};

citiesContainerEl.addEventListener("click", cityClicked);

populateSavedCities();
