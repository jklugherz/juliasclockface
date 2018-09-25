import clock from "clock";
import { battery } from "power";
import document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { today } from "user-activity";
import { battery } from "power";
import { display } from "display";
import * as util from "../common/utils";



//set auto turn display off after some time
display.autoOff = true;

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> elements
const time = document.getElementById("time");
const day = document.getElementById("day");
const month = document.getElementById("month");
const date = document.getElementById("date"); 
const hr = document.getElementById("heartrate");
const steps = document.getElementById("steps");
const distance = document.getElementById("distance");
const floors = document.getElementById("floors");
const activeMins = document.getElementById("activeMins");
const batteryLevel = document.getElementById("battery");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  const dayArray = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const monthArray = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEPT", "OCT", "NOV", "DEC"];
  
  // day
  let dayIndex = today.getDay();
  let dayValue = dayArray[dayIndex];
  day.text = dayValue;
  
  // month
  let monthIndex = today.getMonth();
  let monthValue = monthArray[monthIndex];
  month.text = monthValue;
  
  // date
  let dateValue = today.getDate();
  date.text = dateValue;
  
  
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  time.text = `${hours}:${mins}`;
}


//update non-time related things every second when display is on
let hrm = new HeartRateSensor();
let lastReading = 0;

if (display.on) {
  hrm.start();
  setInterval(function(){ 
    // Update floors, minutes active, battery
    onUpdateDistanceFloorsMinsBattery();
    // Update steps
    onUpdateSteps();
    //start monitoring hr
    hrm.start();
    }, 1000);
} else {
  hrm.stop(); //stop monitoring hr when display is off
}


// Funciton to update steps
function onUpdateSteps() {
  let stepReading = today.local.steps;
  let stepString = stepReading.toString();
  if (stepReading > 10000) {
    stepReading = `${stepString.slice(0, 2)},${stepString.slice(2)}`;
  }  else if (stepReading < 10000 && stepReading > 999) {
    stepReading = `${stepString.slice(0, 1)},${stepString.slice(1)}`;
  } else {
    stepReading = stepString;
  }
  steps.text = stepReading || 0;
}



// Heart rate
hrm.onreading = function() {
  let heartRate;
  if (hrm.timestamp === lastReading) {
    // timestamp has not updated, reading is stale
    heartRate = "--";
  } else {
    heartRate = hrm.heartRate;
  }
  
  hr.text = heartRate;
  lastReading = hrm.timestamp;
}




// Function that updates distance floors, mins active, battery
function onUpdateDistanceFloorsMinsBattery() {
  // Distance
  let distanceReading = (today.local.distance/1609.34).toString();
  distance.text = (distanceReading.slice(0, 3) || 0.0) + 'mi';
  
  // Floors
  floors.text = today.local.elevationGain || 0;

  // Active mins
  activeMins.text = today.local.activeMinutes || 0;

  // Battery
  batteryLevel.text = (battery.chargeLevel || 0) + "%";
}


