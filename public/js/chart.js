window.onload = function () {
  fetch("/dashboard/chart/npm")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Net Profit Margin",
            backgroundColor: "rgb(49, 175, 212)",
            borderColor: "rgb(49, 175, 212)",
            data: tsData.periodData,
          },
        ],
      };

      const config = {
        type: "line",
        data: data,
        options: {layout: {
             autoPadding: true
          }},
      };

      const myChart = new Chart(document.querySelector("#npm-chart"), config);
    });

  fetch("/dashboard/chart/cfr")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Cash-Flow Rate",
            backgroundColor: "rgb(166, 28, 60)",
            borderColor: "rgb(166, 28, 60)",
            data: tsData.periodData,
          },
        ],
      };

      const config = {
        type: "line",
        data: data,
        options: {layout: {
             autoPadding: true
          }},
      };

      const myChart = new Chart(document.querySelector("#cfr-chart"), config);
    });

  fetch("/dashboard/chart/liq")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Liquidity",
            backgroundColor: "rgb(237, 184, 139)",
            borderColor: "rgb(237, 184, 139)",
            data: tsData.periodData,
          },
        ],
      };

      const config = {
        type: "line",
        data: data,
        options: {layout: {
            autoPadding: true

          }},
      };

      const myChart = new Chart(document.querySelector("#liq-chart"), config);
    });
};
