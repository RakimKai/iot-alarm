import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  push,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";

//constants
const firebaseConfig = {
  apiKey: "AIzaSyCoHrKDEyEOvFKyjR81qwSplMSLkjeESNc",
  authDomain: "iot-ahmed.firebaseapp.com",
  databaseURL:
    "https://iot-ahmed-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-ahmed",
  storageBucket: "iot-ahmed.appspot.com",
  messagingSenderId: "989764614334",
  appId: "1:989764614334:web:987bc0069f49f36c8706ef",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let hours = 0;
let minutes = 0;

let on = false;

let dataSets = [];

document.getElementById("hoursInput").addEventListener("input", function (evt) {
  hours = this.value;
});

document
  .getElementById("minutesInput")
  .addEventListener("input", function (evt) {
    minutes = this.value;
  });

let ringing = 0;

const timestampsRef = ref(database, "sleepPerWeek");
const ringingRef = ref(database, "ringing");
const statusRef = ref(database, "status");

onValue(ringingRef, (snapshot) => {
  ringing = snapshot.val();

  if (ringing == 1) {
    document.getElementById("dugme").innerHTML = "Iskljuci alarm";
  } else {
    document.getElementById("dugme").innerHTML = "Ukljuci alarm";
  }
});

onValue(statusRef, (snapshot) => {
  on = snapshot.val();
});

//chart variable
var myChart = new Chart(document.getElementById("myChart"), {
  type: "bar",
  options: {
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  },
  data: {
    labels: [],

    datasets: [
      {
        label: "Sati sna",
        data: [],
        backgroundColor: "#f5b342",
      },
    ],
  },
  options: {
    scales: {
      xAxes: [
        {
          type: "time",
          position: "bottom",
          unit: "minute",
          time: {
            displayFormats: {
              hour: "HH:mm",
            },
          },
        },
      ],
    },
  },
});

let firstAddition = true;

let days = [
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
  "Nedjelja",
];

onValue(timestampsRef, (snapshot) => {
  if (firstAddition) {
    let index = 0;
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();

      addData(myChart, days[index], childData);

      firstAddition = false;

      index++;
    });
    dataSets = snapshot.val();
  }
});

function addData(chart, label, newData) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(newData);
  });
  chart.update();
}

document.getElementById("dugme").addEventListener("click", () => {
  if (on === 1) {
    on = 0;
  } else if (on === 0) {
    on = 1;
  }

  set(ref(database, "/status"), on);

  set(ref(database, "/hour"), parseInt(hours));
  set(ref(database, "/minute"), parseInt(minutes));

  const updates = {};
  updates["/sleepPerWeek/" + new Date().getDay()] =
    parseInt(hours) + dataSets[new Date().getDay()];

  update(ref(database), updates);
});

document.getElementById("iskljuciAlarm").addEventListener("click", () => {
  set(ref(database, "/ringing"), 0);
  set(ref(database, "/status"), 0);
});
