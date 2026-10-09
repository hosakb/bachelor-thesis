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
      responsive: true,
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
      responsive: true,
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
      responsive: true,
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
      custom_index: t.index,
      // Frappe Gantt matches bars by their string data-id attribute.
      id: String(t.id),
      name: t.name,
      start: t.start,
      end: t.end,
      progress: t.progress,
      dependencies: "",
    };
  });

  sessionStorage.setItem("tasks", JSON.stringify(tasks));
  if (tasks.length === 0) {
    document.querySelector("#gantt").textContent = "No milestones yet. Add one on the Submit page.";
    gantt = null;
    return;
  }

  // eslint-disable-next-line no-undef
  gantt = new Gantt("#gantt", tasks, {
    bar_height: 20,
    bar_corner_radius: 10,
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
  if (gantt) gantt.change_view_mode(period);
}

// Pending Gantt edits keyed by task id. Each drag replaces the previous
// pending value for that task, and the Ok/Cancel buttons are wired once, so
// repeated drags never stack listeners or send duplicate/stale requests.
const pendingGanttChanges = new Map();

function toIsoDate(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function updatePeriod(task, start, end) {
  const change = pendingGanttChanges.get(task.id) || {};
  change.period = { start: toIsoDate(start), end: toIsoDate(end) };
  pendingGanttChanges.set(task.id, change);
}

function updateProgress(task, progress) {
  const change = pendingGanttChanges.get(task.id) || {};
  change.progress = progress;
  pendingGanttChanges.set(task.id, change);
}

async function sendGanttUpdate(url, body) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify(body),
  });
  if (!response.ok || response.redirected) {
    throw new Error("Failed to save milestone changes.");
  }
}

async function saveGanttChanges() {
  const okButton = document.querySelector("#gantt-changes-ok-btn");
  okButton.disabled = true;
  try {
    for (const [taskId, change] of pendingGanttChanges) {
      if (change.period) {
        await sendGanttUpdate("/startup/gantt/period", {
          taskId,
          start: change.period.start,
          end: change.period.end,
        });
      }
      if (change.progress !== undefined) {
        await sendGanttUpdate("/startup/gantt/progress", {
          taskId,
          progress: change.progress,
        });
      }
      pendingGanttChanges.delete(taskId);
    }
    document.querySelector("#gantt-changes").classList.add("hidden");
    sessionStorage.setItem(
      "tasks",
      JSON.stringify(
        gantt.tasks.map((t) => ({
          custom_index: t.custom_index,
          id: t.id,
          name: t.name,
          start: toIsoDate(t._start),
          // _end is exclusive (midnight after the last day).
          end: toIsoDate(new Date(t._end.getTime() - 1000)),
          progress: t.progress,
          dependencies: "",
        }))
      )
    );
  } catch (err) {
    alert(err.message);
  } finally {
    okButton.disabled = false;
  }
}

function cancelGanttChanges() {
  pendingGanttChanges.clear();
  let tasks = JSON.parse(sessionStorage.getItem("tasks"));
  gantt.refresh(tasks);
  document.querySelector("#gantt-changes").classList.add("hidden");
}

const ganttOkButton = document.querySelector("#gantt-changes-ok-btn");
if (ganttOkButton) {
  ganttOkButton.addEventListener("click", saveGanttChanges);
  document
    .querySelector("#gantt-changes-cancel-btn")
    .addEventListener("click", cancelGanttChanges);
}
