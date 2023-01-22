document.addEventListener("DOMContentLoaded", async function () {
  loadChartData();
});

async function loadChartData() {
  const responses = await fetch("/fund/chart/data");
  const responserJson = await responses.json();
  const burnRateData = responserJson.burnRate;
  renderBurnRate(burnRateData);
  const runwayData = responserJson.cashRunway;
  renderRunway(runwayData);
  const liqData = responserJson.liquidity;
  renderLiq(liqData);
  const ganttData = responserJson.milestones;
  renderGantt(ganttData);
}

function renderBurnRate(burnRateData) {

  const data = {
    labels: burnRateData.months,
    datasets: [
      {
        label: "Burn Rate",
        backgroundColor: "rgb(166, 28, 60)",
        borderColor: "rgb(166, 28, 60)",
        data: burnRateData.periodData,
      },
    ],
  };

  const config = {
    maintainAspectRatio: false,
    responsiveness: true,
    type: "line",
    data: data,
    options: {
      // layout: {
      //   autoPadding: true,
      // },
      
    },
  };

  // eslint-disable-next-line no-undef
  let chart = new Chart(document.querySelector("#burn-rate-chart"), config);
  chart.canvas.parentNode.style.height = "15vh";
  chart.canvas.parentNode.style.width = "18vh";
}

function renderRunway(burnRateData) {
  const data = {
    labels: burnRateData.months,
    datasets: [
      {
        label: "Cash Runway",
        backgroundColor: "rgb(166, 28, 60)",
        borderColor: "rgb(166, 28, 60)",
        data: burnRateData.periodData,
      },
    ],
  };

  const config = {
    maintainAspectRatio: false,
    responsiveness: true,
    type: "line",
    data: data,
    options: {
      // layout: {
      //   autoPadding: true,
      // },
      
    },
  };

  // eslint-disable-next-line no-undef
  let chart = new Chart(document.querySelector("#runway-chart"), config);
//   chart.canvas.parentNode.style.height = "15vh";
// chart.canvas.parentNode.style.width = "18vh";
}

function renderLiq(liqData) {
  const data = {
    labels: liqData.months,
    datasets: [
      {
        label: "Liquidity",
        backgroundColor: "rgb(237, 184, 139)",
        borderColor: "rgb(237, 184, 139)",
        data: liqData.periodData,
      },
    ],
  };

  const config = {
    maintainAspectRatio: false,
    responsiveness: true,
    type: "line",
    data: data,
    options: {
      // layout: {
      //   autoPadding: true,
      // },
      
    },
  };

  // eslint-disable-next-line no-undef
  let chart = new Chart(document.querySelector("#liq-chart"), config);
//   chart.canvas.parentNode.style.height = "15vh";
// chart.canvas.parentNode.style.width = "18vh";
}

var gantt;
function renderGantt(data) {
  const tasks = data.map((t) => {
    return {
      custom_index: t.index,
      id: t.id,
      name: t.name,
      start: t.start,
      end: t.end,
      progress: t.progress,
      dependencies: "",
    };
  });
  // eslint-disable-next-line no-undef
  gantt = new Gantt("#gantt", tasks, {
    custom_popup_html: function (task) {
      const end_date = task.end;
      return `
      <div class="details-container">
        <h5>${task.name}</h5>
        <p>Expected to finish by ${end_date}</p>
        <p>${task.progress}% completed!</p>
      </div>
      `;
    },
  });
}

function change_view_mode(period) {
  gantt.change_view_mode(period);
}


