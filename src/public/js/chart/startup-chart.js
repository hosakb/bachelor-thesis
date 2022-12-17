// window.onload = function () {
  fetch("/startup/chart/noe")
    .then((res) => res.json())
    .then((tsData) => {
      const data = {
        labels: tsData.months,
        datasets: [
          {
            label: "Number of Employees",
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
      new Chart(document.querySelector("#noe-chart"), config);
    });

  fetch("/startup/chart/cfr")
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
        options: {
          layout: {
            autoPadding: true,
          },
        },
      };

      // eslint-disable-next-line no-undef
      new Chart(document.querySelector("#cfr-chart"), config);
    });

  fetch("/startup/chart/liq")
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
        options: {
          layout: {
            autoPadding: true,
          },
        },
      };

      // eslint-disable-next-line no-undef
      new Chart(document.querySelector("#liq-chart"), config);
    });

  fetch("/fund/chart/expertise")
    .then((res) => res.json())
    .then((expertiseData) => {
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
    });

    var gantt;
    fetch("/startup/chart/gantt")
      .then((res) => res.json())
      .then((tasks) => {
        console.log(tasks);
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
      });
  
    function change_view_mode(period) {
      gantt.change_view_mode(period);
    }
// };
