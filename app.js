//jshint esversion:6


const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv").config();
const request = require("request");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


app.get("/", function(req, res){

//getting location of user by IP Address
  request("https://ipinfo.io/json", function(error, response, body){

      let ipInfo = JSON.parse(body);
      let location = ipInfo.city;
      let country = ipInfo.country;
      let lonLat = ipInfo.loc;
      let lat = lonLat.split(",")[0];
      let lon = lonLat.split(",")[1];

//using the IP address to get the weather
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`;

    request(weatherUrl, function(error, response, body){
      let weatherInfo = JSON.parse(body);
      let cityName = weatherInfo.name;
      let description = weatherInfo.weather[0].description;
      let weatherId = weatherInfo.weather[0].id;
      let weatherIcon = weatherInfo.weather[0].icon;

      let temp = Math.round((weatherInfo.main.temp)-273.15);
      let humidity = weatherInfo.main.humidity;
      let windSpeed = weatherInfo.wind.speed;
      let windDegree = weatherInfo.wind.deg;

//rendering date at the top of the page:
      let date = new Date();
      let options = {weekday: "short", year: "numeric", month: "short", hour: "numeric", minute: "numeric"};
      let today = date.toLocaleDateString("en-US", options);

      res.render("index", {
        cityName: cityName ,
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


app.listen(3000, function(req, res){
  console.log("Server started on port 3000");
});
