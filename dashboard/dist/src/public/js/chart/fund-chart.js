"use strict";
window.onload = function () {
  fetch("/fund/chart/noe")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Fund KPI I",
            backgroundColor: "rgb(49, 175, 212)",
            borderColor: "rgb(49, 175, 212)",
            data: tsData.periodData,
          },
        ],
      };
      const config = {
        type: "line",
        data: data,
        options: {
          layout: {
            autoPadding: true,
          },
        },
      };
      // eslint-disable-next-line no-undef
      new Chart(document.querySelector("#npm-chart"), config);
    });
  fetch("/fund/chart/cfr")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Fund KPI II",
            backgroundColor: "rgb(166, 28, 60)",
            borderColor: "rgb(166, 28, 60)",
            data: tsData.periodData,
          },
        ],
      };
      const config = {
        type: "line",
        data: data,
        options: {
          layout: {
            autoPadding: true,
          },
        },
      };
      // eslint-disable-next-line no-undef
      new Chart(document.querySelector("#cfr-chart"), config);
    });
  fetch("/fund/chart/liq")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Fund KPI III",
            backgroundColor: "rgb(237, 184, 139)",
            borderColor: "rgb(237, 184, 139)",
            data: tsData.periodData,
          },
        ],
      };
      const config = {
        type: "line",
        data: data,
        options: {
          layout: {
            autoPadding: true,
          },
        },
      };
      // eslint-disable-next-line no-undef
      new Chart(document.querySelector("#liq-chart"), config);
    });
};
