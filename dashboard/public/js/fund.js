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
  // chart.canvas.parentNode.style.height = "15vh";
  // chart.canvas.parentNode.style.width = "18vh";
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

// ======================== Patent ========================================
function patentInfo(p) {
  const patent = JSON.parse(p);
  document.getElementById("patent-info-pane").classList.toggle("show");

  document.getElementById("invention-header").innerHTML = patent.invention;

  if (patent.status === "initial-application") {
    document.getElementById("initial-application").classList.toggle("hidden"); // TODO: Add date of filed application
  } else if (patent.status == "disclosure-phase") {
    disclosurePhase(patent);
  } else if (patent.status === "examination-phase") {
    examinationPhase(patent);
  } else if (patent.status === "objection-phase") {
    objectionPhase(patent);
  } else if (patent.status === "granted") {
    const grantPatentDate = formatDate(new Date(patent.grantDate));
    document.getElementById("granted").classList.toggle("hidden");
    document.getElementById("granted-duration").innerHTML =
      patent.patentDuration + " Years";
    document.getElementById("granted-on").innerHTML = grantPatentDate;
  } else if (patent.status === "rejected" || patent.status === "canceled") {
    document.getElementById("rejected").classList.toggle("hidden");
    document.getElementById("rejection-reason").innerHTML =
      patent.rejectionReason;
    document.getElementById("cancel-status").innerHTML = patent.status;
    document.getElementById("rejected-on").innerHTML = formatDate(
      new Date(patent.rejectionDate)
    );
  }
}

document.querySelector("#exit-patent-info").addEventListener("click", (e) => {
  document.getElementById("patent-info-pane").classList.toggle("show");

  if (
    !document.getElementById("initial-application").classList.contains("hidden")
  ) {
    document.getElementById("initial-application").classList.add("hidden");
  } else if (
    !document.getElementById("disclosure-phase").classList.contains("hidden")
  ) {
    document.getElementById("disclosure-phase").classList.add("hidden");
  } else if (
    !document.getElementById("examination-phase").classList.contains("hidden")
  ) {
    document.getElementById("examination-phase").classList.add("hidden");
  } else if (
    !document.getElementById("objection-phase").classList.contains("hidden")
  ) {
    document.getElementById("objection-phase").classList.add("hidden");
  } else if (!document.getElementById("granted").classList.contains("hidden")) {
    document.getElementById("granted").classList.add("hidden");
  } else if (
    !document.getElementById("rejected").classList.contains("hidden")
  ) {
    document.getElementById("rejected").classList.add("hidden");
  }
});

function objectionPhase(patent) {
  document.getElementById("objection-phase").classList.toggle("hidden");

  document.getElementById("objection-granted-duration").innerHTML =
    patent.patentDuration + " Years";
  const grantPatentDate = new Date(patent.grantDate);
  document.getElementById("objection-granted-on").innerHTML =
    formatDate(grantPatentDate);
  document.getElementById("grant-fee-deadline").innerHTML = formatDate(
    grantPatentDate.addMonths(2)
  );

  if (patent.grantFee) {
    document
      .getElementById("grant-fee-deadline-check")
      .classList.remove("hidden");
  }
  if (patent.patentOffice == "german") {
    document.getElementById("objection-filing-deadline").innerHTML = formatDate(
      grantPatentDate.addMonths(1)
    );
  } else {
    document.getElementById("objection-filing-deadline").innerHTML = formatDate(
      grantPatentDate.addMonths(7)
    );
  }

  if (patent.objection) {
    document
      .getElementById("objection-filing-deadline-check")
      .classList.remove("hidden");
  }
  document.getElementById("objection-response-deadline").innerHTML = formatDate(
    grantPatentDate.addMonths(4)
  );

  if (patent.objectionResponse) {
    document
      .getElementById("objection-response-deadline-check")
      .classList.remove("hidden");
  }
}

function examinationPhase(patent) {
  document.getElementById("examination-phase").classList.toggle("hidden");

  const examinationNoticeDate = new Date(patent.patentExaminationNoticeDate);

  document.getElementById("examination-notice-date").innerHTML = formatDate(
    examinationNoticeDate
  );
  document.getElementById("examination-notice-deadline").innerHTML = formatDate(
    examinationNoticeDate.addMonths(4)
  );

  if (patent.patentExaminationNotice) {
    document
      .getElementById("examination-notice-deadline-check")
      .classList.remove("hidden");
  }
}

function disclosurePhase(patent) {
  document.getElementById("disclosure-phase").classList.remove("hidden");
  let confirmationDate = new Date(patent.confirmationDate);
  document.getElementById("application-filed-date").innerHTML =
    formatDate(confirmationDate);

  document.getElementById("submission-fee-deadline").innerHTML = formatDate(
    confirmationDate.addMonths(1)
  );

  if (patent.registrationFee) {
    document
      .getElementById("submission-fee-deadline-check")
      .classList.remove("hidden");
  }

  document.getElementById("research-result-deadline").innerHTML = formatDate(
    confirmationDate.addMonths(5)
  );
  document.getElementById("annual-fee-deadline").innerHTML = formatDate(
    new Date(patent.annualFeeDate)
  );
  document.getElementById("parallel-patent-deadline").innerHTML =
    formatDate(confirmationDate);

  document.getElementById("inventor-nomination-deadline").innerHTML =
    formatDate(confirmationDate.addMonths(3));

  if (patent.inventorNomination) {
    document
      .getElementById("inventor-nomination-deadline-check")
      .classList.remove("hidden");
  }

  document.getElementById("compensation-claim-deadline").innerHTML = formatDate(
    confirmationDate.addMonths(3)
  );
  document.getElementById("disclosure-deadline").innerHTML =
    formatDate(confirmationDate);
  document.getElementById("secrecy-deadline").innerHTML =
    formatDate(confirmationDate);
  document.getElementById("additional-patent-deadline").innerHTML =
    formatDate(confirmationDate);

  document.getElementById("examination-request-deadline").innerHTML =
    formatDate(confirmationDate.addMonths(66));

  if (patent.examinationRequest) {
    document
      .getElementById("examination-request-deadline-check")
      .classList.remove("hidden");
  }
}

Date.isLeapYear = function (year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

Date.getDaysInMonth = function (year, month) {
  return [
    31,
    Date.isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month];
};

Date.prototype.isLeapYear = function () {
  return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
  return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
  var n = this.getDate();
  this.setDate(1);
  this.setMonth(this.getMonth() + value);
  this.setDate(Math.min(n, this.getDaysInMonth()));
  return this;
};

function formatDate(date) {
  return (
    date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
  );
}
