document.addEventListener("DOMContentLoaded", async function() {
  loadChartData()
});

async function loadChartData() {
  const noe = "/fund/chart/noe";
  const cfr = "/fund/chart/cfr";
  const liq = "/fund/chart/liq";
  const gantt = "/fund/chart/gantt";
  const expertise = "/fund/chart/expertise";

  const responses = await Promise.all([fetch(noe), fetch(cfr), fetch(liq), fetch(gantt), fetch(expertise)]);

  const noeData = await responses[0].json()
  console.log(noeData)
  renderNoe(noeData);
  const cfrData = await responses[1].json()
  renderCfr(cfrData)
  const liqData = await responses[2].json()
  renderLiq(liqData)
  const ganttData = await responses[3].json()
  renderGantt(ganttData)
  const expertiseData = await responses[4].json()
  renderExpertise(expertiseData)

}

function renderNoe(noeData) {
  const data = {
    labels: noeData.months,
    datasets: [
      {
        label: "Fund KPI I",
        backgroundColor: "rgb(49, 175, 212)",
        borderColor: "rgb(49, 175, 212)",
        data: noeData.periodData,
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
  new Chart(document.querySelector("#noe-chart"), config);
}
function renderCfr(cfrData) {
  const data = {
    labels: cfrData.months,
    datasets: [
      {
        label: "Fund KPI II",
        backgroundColor: "rgb(166, 28, 60)",
        borderColor: "rgb(166, 28, 60)",
        data: cfrData.periodData,
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
}
function renderLiq(liqData) {
  const data = {
    labels: liqData.months,
    datasets: [
      {
        label: "Fund KPI III",
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
function renderGantt(tasks) {
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