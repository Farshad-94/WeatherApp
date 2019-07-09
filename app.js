//jshint esversion:8

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const request = require("request-promise");
const mongoose = require("mongoose");
const promise = require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


mongoose.connect("mongodb://localhost:27017/weatherDB", {
  useNewUrlParser: true
});
const citySchema = new mongoose.Schema({
  name: String
});
const City = mongoose.model("City", citySchema);

// let lasVegas = new City ({name: "Las Vegas"});
// let toronto = new City ({name: "Toronto"});
// let london = new City ({name: "London"});
//lasVegas.save();
//toronto.save();
//london.save();


app.get("/", function(req, res) {

  //rendering date at the top of the page:
  let date = new Date();
  let options = {
    day: "numeric",
    weekday: "short",
    year: "numeric",
    month: "short",
    hour: "numeric",
    minute: "numeric"
  };
  let today = date.toLocaleDateString("en-US", options);


  //using promise to fetch data from multiple API:
  let urls = [
    'https://ipinfo.io/json',
    `https://api.openweathermap.org/data/2.5/weather?q=Toronto&appid=${process.env.API_KEY}`
  ];

  Promise.all(urls.map(url => {
    return fetch(url)
    .then(resp =>
       resp.json());
  }))
  .then(results => {
    console.log(results[1]);
  })
  .catch(() => console.log(error));


  //getting location of user by IP Address
  request("https://ipinfo.io/json", function(error, response, body) {

    let ipInfo = JSON.parse(body);
    let location = ipInfo.city;
    let country = ipInfo.country;
    let lonLat = ipInfo.loc;
    let lat = lonLat.split(",")[0];
    let lon = lonLat.split(",")[1];

    //using the IP address to get the weather
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`;

    request(weatherUrl, function(error, response, body) {
      let weatherInfo = JSON.parse(body);
      let cityName = weatherInfo.name;
      let description = weatherInfo.weather[0].description;
      let weatherId = weatherInfo.weather[0].id;
      let weatherIcon = weatherInfo.weather[0].icon;
      let temp = Math.round((weatherInfo.main.temp) - 273.15);
      let humidity = weatherInfo.main.humidity;
      let windSpeed = weatherInfo.wind.speed;
      let windDegree = Math.round(weatherInfo.wind.deg);


      res.render("index", {
        cityName: cityName,
        country: country,
        temp: temp,
        humidity: humidity,
        windSpeed: windSpeed,
        windDegree: windDegree,
        description: description,
        weatherId: weatherId,
        weatherIcon: weatherIcon,
        today: today
      });
    });
});
});


app.listen(3000, function(req, res) {
  console.log("Server started on port 3000");
});
