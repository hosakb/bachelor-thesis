document.addEventListener("DOMContentLoaded", async function () {
  loadChartData();
});

// ----------------------- Sidebar Startup --------------------
let submit = document.querySelector("#side-submit").childNodes[0];
let dashboard = document.querySelector("#side-dashboard").childNodes[0];

submit.onclick = function () {
  submit.classList.add("active");
  dashboard.classList.remove("active");
};

dashboard.onclick = function () {
  submit.classList.remove("active");
  dashboard.classList.add("active");
};

async function loadChartData() {
  const responses = await fetch("/startup/chart/data");
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

// ----------------- Gantt Chart ------------------------------
var gantt;
function renderGantt(data) {
  const tasks = data.map((t) => {
    return {
      id: t.id,
      name: t.name,
      start: t.start,
      end: t.end,
      progress: t.progress,
      dependencies: "",
    };
  });

  sessionStorage.setItem("tasks", JSON.stringify(tasks));

  // eslint-disable-next-line no-undef
  gantt = new Gantt("#gantt", tasks, {
    // can be a function that returns html
    // or a simple html string
    custom_popup_html: function (task) {
      // the task object will contain the updated
      // dates and progress value
      const end_date = task.end;
      return `
          <div class="details-container">
            <h5>${task.name}</h5>
            <p>Expected to finish by ${end_date}</p>
            <p>${task.progress}% completed!</p>
          </div>
          `;
    },
    on_date_change: function (task, start, end) {
      document.querySelector("#gantt-changes").classList.remove("hidden");
      updatePeriod(task, start, end);
    },
    on_progress_change: function (task, progress) {
      document.querySelector("#gantt-changes").classList.remove("hidden");
      updateProgress(task, progress);
    },
  });
}

function change_view_mode(period) {
  gantt.change_view_mode(period);
}

function updatePeriod(task, start, end) {
  document
    .querySelector("#gantt-changes-ok-btn")
    .addEventListener("click", () => {
      document.querySelector("#gantt-changes").classList.add("hidden");

      const taskDuration = { taskId: task.id, start: start, end: end };

      fetch("/startup/gantt/period", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(taskDuration),
      }).catch(function (err) {
        console.error(err); //TODO:
      });
    });
  document
    .querySelector("#gantt-changes-cancel-btn")
    .addEventListener("click", () => {
      cancelGanttChanges();
    });
}

function updateProgress(task, progress) {
  const taskProgress = { taskId: task.id, progress: progress };

  document
    .querySelector("#gantt-changes-ok-btn")
    .addEventListener("click", () => {
      document.querySelector("#gantt-changes").classList.add("hidden");
      fetch("/startup/gantt/progress", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify(taskProgress),
      }).catch(function (err) {
        console.error(err); //TODO:
      });
    });
  document
    .querySelector("#gantt-changes-cancel-btn")
    .addEventListener("click", () => {
      cancelGanttChanges();
    });
}

function cancelGanttChanges() {
  let tasks = JSON.parse(sessionStorage.getItem("tasks"));
  gantt.refresh(tasks);
  document.querySelector("#gantt-changes").classList.add("hidden");
}
