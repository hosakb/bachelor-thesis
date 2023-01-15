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
  const expertiseData = responserJson.expertise;
  renderExpertise(expertiseData);
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
    type: "line",
    data: data,
    options: {
      layout: {
        autoPadding: true,
      },
    },
  };

  // eslint-disable-next-line no-undef
  new Chart(document.querySelector("#burn-rate-chart"), config);
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
    type: "line",
    data: data,
    options: {
      layout: {
        autoPadding: true,
      },
    },
  };

  // eslint-disable-next-line no-undef
  new Chart(document.querySelector("#runway-chart"), config);
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

function renderExpertise(expertiseData) {
  const data = {
    labels: expertiseData.name,
    datasets: [
      {
        label: "Expertise",
        backgroundColor: [
          "#3e45cd",
          "#4e5ea2",
          "#3c5a5f",
          "#e8c334",
          "#888850",
          "#3wddcd",
          "#54fda2",
          "#3fef5f",
          "#e33334",
          "#666850",
        ],
        borderColor: "#ffffff",
        data: expertiseData.amount,
      },
    ],
  };

  const config = {
    type: "doughnut",
    data: data,
    options: {
      layout: {
        autoPadding: true,
      },
    },
  };

  // eslint-disable-next-line no-undef
  new Chart(document.querySelector("#expertise-chart"), config);
}
