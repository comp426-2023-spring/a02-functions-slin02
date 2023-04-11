#!/usr/bin/env node
import minimist from 'minimist';
import moment from 'moment-timezone';
import fetch from 'node-fetch';

// process args
var args = minimist(process.argv.slice(2));

// if ask for help, log help info
if (args.h) {
	console.log(`Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE
    -h            Show this help message and exit.
    -n, -s        Latitude: N positive; S negative.
    -e, -w        Longitude: E positive; W negative.
    -z            Time zone: uses tz.guess() from moment-timezone by default.
    -d 0-6        Day to retrieve weather: 0 is today; defaults to 1.
    -j            Echo pretty JSON from open-meteo API and exit`);
	process.exit(0);
}

const timezone = moment.tz.guess();

// set latitude and longitude. multiply args.s/args.w with -1 so it has the proper coordinates
const latitude = args.n || args.s * -1;
const longitude = args.e || args.w * -1;

// get weather data
const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&daily=weathercode,temperature_2m_max,precipitation_hours,windspeed_10m_max,winddirection_10m_dominant&current_weather=true&timezone=' + timezone);

// create data
const data = await response.json();

// if user called -j, just log out the data
if (args.j) {
	console.log(data);
	process.exit(0);
}

// set days to 1 (tomorrow) by default or to args.d if it exists
let days;
if (args.d == null) {
	days = 1;
} else {
	days = args.d;
}

// create a weather message var. if it's rainy, add that or add that it will be sunny instead
let weather = "";
if (data.daily.precipitation_hours[days] > 0) {
	weather += "It might be a bit rainy ";
} else {
	weather += "It will be sunny ";
}

// depending on the day, append the appropriate string to the weather message
if (days == 0) {
	weather += "today";
} else if (days > 1) {
	weather += "in " + days + " days.";
} else {
	weather += "tomorrow.";
}

// log weather message to console
console.log(weather);
