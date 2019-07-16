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


mongoose.connect(`mongodb+srv://admin-farshad:${process.env.password}@clusterweatherapp-do5i6.mongodb.net/weatherDB`, {
  useNewUrlParser: true
});
const citySchema = new mongoose.Schema({
  name: String,
});
const City = mongoose.model("City", citySchema);

// let toronto = new City ({name: "Toronto"});
//let london = new City ({name: "London"});
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

  async function getWeather(cities) {
    try {
      let weatherData = [];
      let errorData = [];

      for (let city_obj of cities) {
        let city = city_obj.name;

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}`;

        let responseBody = await fetch(url);
        let statusCode = responseBody.status;

        if (statusCode === 200) {
          let weatherJson = await responseBody.json();
          let weather = {
            cityName: city,
            country: weatherJson.sys.country,
            description: weatherJson.weather[0].description,
            weatherId: weatherJson.weather[0].id,
            weatherIcon: weatherJson.weather[0].icon,
            temp: Math.round((weatherJson.main.temp) - 273.15),
            humidity: weatherJson.main.humidity,
            windSpeed: weatherJson.wind.speed,
            windDegree: Math.round(weatherJson.wind.deg),
            code: weatherJson.cod
          };
          weatherData.push(weather);

        } else if (statusCode !== 200){
          let weatherErr = await responseBody.json();
          let errDetail = {
            code: weatherErr.cod,
            message: weatherErr.message
          };
          errorData.push(errDetail);
          console.log(errorData);
        }
      }
      return weatherData;
    } catch(err){
      console.log(err);
    }
  }


  City.find({}, function(err, cities) {
    getWeather(cities)

      .then(function(results) {
        res.render("index", {
          weatherData: results,
          today: today
        });
      });
  });

});


app.post("/", function(req, res) {

  let enteredCity = req.body.city;
  City.findOne({
    name: enteredCity
  }, function(err, foundCity) {
    if (!err) {
      if (!foundCity) {
        //create a new city in database
        let newCity = new City({
          name: enteredCity
        });
        newCity.save();
        res.redirect("/");
      } else {
        //show the existing city in database
        console.log("City has been added to the list already.");
        res.redirect("/");
      }
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(req, res) {
  console.log("Server has started successfully");
});
