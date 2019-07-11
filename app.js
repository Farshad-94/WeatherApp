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

async function getWeather(cities) {
  let weatherData = [];

  for (let city_obj of cities){
    let city = city_obj.name;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`;

      let responseBody = await request(url);
      let weatherJson = JSON.parse(responseBody);

      let weather = {
        cityName: city,
        country: weatherJson.sys.country,
        description: weatherJson.weather[0].description,
        weatherId: weatherJson.weather[0].id,
        weatherIcon: weatherJson.weather[0].icon,
        temp: Math.round((weatherJson.main.temp) - 273.15),
        humidity: weatherJson.main.humidity,
        windSpeed: weatherJson.wind.speed,
        windDegree: Math.round(weatherJson.wind.deg)
      };
      weatherData.push(weather);
      console.log(weatherData);
  }
  return weatherData;
}



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

  City.find({}, function(err, cities) {
    getWeather(cities).then(function(results){
      res.render("index", {weatherData: results, today:today});
    });
  });


});


app.listen(3000, function(req, res) {
  console.log("Server started on port 3000");
});
