// ---------------------------- Milestones ----------------------------

let milestones = [];

document
  .getElementById("milestones-form-btn")
  .addEventListener("click", (e) => {
    document.getElementById("add-milestones-pane").classList.toggle("show");
  });

document
  .querySelector("#exit-new-milestones")
  .addEventListener("click", (e) => {
    document.getElementById("add-milestones-pane").classList.toggle("show");
  });

document.querySelector("#add-milestone-btn").addEventListener("click", (e) => {
  const name = document.querySelector("#milestone");
  const start = document.querySelector("#start-date-milestone");
  const end = document.querySelector("#due-date-milestone");
  const progress = document.querySelector("#milestone-completion");

  const milestonesListTbody = document.querySelector("#milestones-new-tbody");

  if (
    name.value == "" ||
    start.value == "" ||
    end.value == "" ||
    progress.value == ""
  ) {
    alert("Please fill out all the fields.");
  } else {
    milestones.push({
      name: name.value,
      start: start.value,
      end: end.value,
      progress: progress.value,
    });

    let tr = document.createElement("tr");

    let tdName = document.createElement("td");
    let tdStart = document.createElement("td");
    let tdEnd = document.createElement("td");
    let tdProgress = document.createElement("td");

    tdName.appendChild(document.createTextNode(name.value));
    tdStart.appendChild(document.createTextNode(start.value));
    tdEnd.appendChild(document.createTextNode(end.value));
    tdProgress.appendChild(document.createTextNode(progress.value));

    tr.appendChild(tdName);
    tr.appendChild(tdStart);
    tr.appendChild(tdEnd);
    tr.appendChild(tdProgress);

    milestonesListTbody.appendChild(tr);

    name.value = "";
    start.value = "";
    end.value = "";
    progress.value = "";
  }
});

document
  .querySelector("#submit-milestones-btn")
  .addEventListener("click", async () => {
    await fetch("/startup/submit/add-milestone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({ milestones }),
    }).catch(() => {
      alert("Failed to add new Startupatent. Please try again.");
    });

    document.getElementById("add-milestones-pane").classList.toggle("show");
    milestones = [];
    location.reload();
  });

function editMilestoneRow(x) {
  const row = document.querySelector(".milestone-" + x).children;

  let milestoneNameInput = document.createElement("input");
  milestoneNameInput.type = "text";
  milestoneNameInput.id = "milestone-name-" + x;
  milestoneNameInput.value = row[0].innerHTML.trim();

  row[0].innerHTML = "";
  row[0].appendChild(milestoneNameInput);

  let milestoneStartInput = document.createElement("input");
  milestoneStartInput.type = "date";
  milestoneStartInput.id = "milestone-start-" + x;
  milestoneStartInput.value = row[1].innerHTML.trim();

  row[1].innerHTML = "";
  row[1].appendChild(milestoneStartInput);

  let milestoneEndInput = document.createElement("input");
  milestoneEndInput.type = "date";
  milestoneEndInput.id = "milestone-end-" + x;
  milestoneEndInput.value = row[2].innerHTML.trim();

  row[2].innerHTML = "";
  row[2].appendChild(milestoneEndInput);

  let milestoneProgressInput = document.createElement("input");
  milestoneProgressInput.type = "number";
  milestoneProgressInput.min = 0;
  milestoneProgressInput.max = 100;
  milestoneProgressInput.id = "milestone-progress-" + x;
  milestoneProgressInput.value = row[3].innerHTML.trim();

  row[3].innerHTML = "";
  row[3].appendChild(milestoneProgressInput);

  document
    .querySelector("#milestone-option-btn-" + x)
    .classList.toggle("hidden");
  document.querySelector("#milestone-ok-btn-" + x).classList.toggle("hidden");
}

function deleteMilestoneRow(x) {
  const id = document.querySelector("#milestone-" + x).value;
  const milestoneTbody = document.querySelector("#milestones-list-tbody");
  const tr = document.querySelector(".milestone-" + x);

  milestoneTbody.removeChild(tr);

  fetch("/startup/submit/delete-milestone", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      id: id,
    }),
  }).catch(function (err) {
    console.info(err); //TODO:
  });
}

function saveMilestone(x) {
  const name = document.querySelector("#milestone-name-" + x).value;
  const start = document.querySelector("#milestone-start-" + x).value;
  const end = document.querySelector("#milestone-end-" + x).value;
  const progress = document.querySelector("#milestone-progress-" + x).value;

  const id = document.querySelector("#milestone-" + x).value;
  document
    .querySelector("#milestone-option-btn-" + x)
    .classList.toggle("hidden");
  document.querySelector("#milestone-ok-btn-" + x).classList.toggle("hidden");

  const row = document.querySelector(".milestone-" + x).children;
  row[0].innerHTML = name;
  row[1].innerHTML = start;
  row[2].innerHTML = end;
  row[3].innerHTML = progress;

  fetch("/startup/submit/update-milestone", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      id,
      name,
      start,
      end,
      progress,
    }),
  }).catch(function (err) {
    console.info(err); //TODO:
  });
}

function cancelEdit() {
  location.reload();
}

// ---------------------------- TRL ----------------------------

function editRow(x) {
  const row = document.querySelector(".trl-" + x).children;

  let technologyInput = document.createElement("input");
  technologyInput.type = "text";
  technologyInput.id = "technology-" + x;
  technologyInput.value = row[0].innerHTML.trim();

  row[0].innerHTML = "";
  row[0].appendChild(technologyInput);

  let trlSelect = document.createElement("select");
  trlSelect.id = "trl-" + x;

  let trlOptionDefault = document.createElement("option");
  trlOptionDefault.selected = true;
  trlOptionDefault.disabled = true;
  trlOptionDefault.hidden = true;
  trlOptionDefault.value = row[1].innerHTML.trim();
  trlOptionDefault.text = row[1].innerHTML.trim();
  trlSelect.appendChild(trlOptionDefault);

  let trlOptionOne = document.createElement("option");
  trlOptionOne.value = 1;
  trlOptionOne.text = 1;
  trlSelect.appendChild(trlOptionOne);

  let trlOptionTwo = document.createElement("option");
  trlOptionTwo.value = 2;
  trlOptionTwo.text = 2;
  trlSelect.appendChild(trlOptionTwo);

  let trlOptionThree = document.createElement("option");
  trlOptionThree.value = 3;
  trlOptionThree.text = 3;
  trlSelect.appendChild(trlOptionThree);

  let trlOptionFour = document.createElement("option");
  trlOptionFour.value = 4;
  trlOptionFour.text = 4;
  trlSelect.appendChild(trlOptionFour);

  let trlOptionFive = document.createElement("option");
  trlOptionFive.value = 5;
  trlOptionFive.text = 5;
  trlSelect.appendChild(trlOptionFive);

  let trlOptionSix = document.createElement("option");
  trlOptionSix.value = 6;
  trlOptionSix.text = 6;
  trlSelect.appendChild(trlOptionSix);

  let trlOptionSeven = document.createElement("option");
  trlOptionSeven.value = 7;
  trlOptionSeven.text = 7;
  trlSelect.appendChild(trlOptionSeven);

  let trlOptionEight = document.createElement("option");
  trlOptionEight.value = 8;
  trlOptionEight.text = 8;
  trlSelect.appendChild(trlOptionEight);

  let trlOptionNine = document.createElement("option");
  trlOptionNine.value = 9;
  trlOptionNine.text = 9;
  trlSelect.appendChild(trlOptionNine);

  row[1].innerHTML = "";
  row[1].appendChild(trlSelect);

  let criticalitySelect = document.createElement("select");
  criticalitySelect.id = "criticality-" + x;

  let optionDefault = document.createElement("option");
  optionDefault.selected = true;
  optionDefault.disabled = true;
  optionDefault.hidden = true;
  optionDefault.value = row[2].innerHTML.trim();
  optionDefault.text = row[2].innerHTML.trim();
  criticalitySelect.appendChild(optionDefault);

  let optionOne = document.createElement("option");
  optionOne.value = 1;
  optionOne.text = 1;
  criticalitySelect.appendChild(optionOne);

  let optionTwo = document.createElement("option");
  optionTwo.value = 2;
  optionTwo.text = 2;
  criticalitySelect.appendChild(optionTwo);

  let optionThree = document.createElement("option");
  optionThree.value = 3;
  optionThree.text = 3;
  criticalitySelect.appendChild(optionThree);

  row[2].innerHTML = "";
  row[2].appendChild(criticalitySelect);

  document.querySelector("#option-btn-" + x).classList.toggle("hidden");
  document.querySelector("#ok-btn-" + x).classList.toggle("hidden");
}

function deleteRow(x) {
  const id = document.querySelector("#id-" + x).value;
  const trlTbody = document.querySelector("#trl-tbody");
  const tr = document.querySelector(".trl-" + x);

  trlTbody.removeChild(tr);

  fetch("/startup/submit/delete-trl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      id: {
        id: id,
      },
    }),
  }).catch(function (err) {
    console.info(err); //TODO:
  });
}

function saveTrl(x) {
  const technology = document.querySelector("#technology-" + x).value;
  const trl = document.querySelector("#trl-" + x).value;
  const criticality = document.querySelector("#criticality-" + x).value;
  const id = document.querySelector("#id-" + x).value;

  document.querySelector("#option-btn-" + x).classList.toggle("hidden");
  document.querySelector("#ok-btn-" + x).classList.toggle("hidden");

  const row = document.querySelector(".trl-" + x).children;
  row[0].innerHTML = technology;
  row[1].innerHTML = trl;
  row[2].innerHTML = criticality;

  fetch("/startup/submit/update-trl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      trlData: {
        id: id,
        technology: technology,
        trl: trl,
        criticality: criticality,
      },
    }),
  }).catch(function (err) {
    console.info(err); //TODO:
  });
}

function cancelMilestoneEdit(x) {
  location.reload();
}
document.querySelector("#add-technology-btn").addEventListener("click", () => {
  document.getElementById("new-trl").classList.toggle("show");
});

document.querySelector("#exit-new-trl").addEventListener("click", (e) => {
  document.getElementById("new-trl").classList.toggle("show");
});

document.getElementById("add-investor").addEventListener("click", (e) => {
  document.getElementById("add-investor-form").classList.toggle("show");
});

document
  .getElementById("submit-potential-investor")
  .addEventListener("click", (e) => {
    document.getElementById("add-investor-form").classList.toggle("show");
    const name = document.getElementById("investor-name").value;
    const type = document.getElementById("investor-type").value;
    const email = document.getElementById("investor-email").value;
    const number = document.getElementById("investor-number").value;
    const url = document.getElementById("investor-url").value;
    const country = document.getElementById("investor-country").value;
    const notes = document.getElementById("investor-notes").value;
    const contactDate = document.getElementById("investor-contact-date").value;

    if (
      name == "" ||
      type == "" ||
      country == "" ||
      contactDate == "" ||
      (email == "" && number == "" && url == "")
    ) {
      alert("Please fill out all the fields.");
    } else {
      fetch("/startup/submit/new-investor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({
          name,
          type,
          email,
          number,
          url,
          country,
          notes,
          contactDate,
        }),
      })
        .then(() => {
          alert("Successfully added contacted investor");
        })
        .catch(() => {
          alert("Failed to add contacted investor.");
        });
    }
  });

document.querySelector("#exit-new-investor").addEventListener("click", (e) => {
  document.getElementById("add-investor-form").classList.toggle("show");
});

document
  .getElementById("next-investment-round-btn")
  .addEventListener("click", (e) => {
    const currentInvestmentPhase = document.getElementById(
      "current-investment-phase"
    ).value;
    let possiblePhases = [];
    switch (currentInvestmentPhase) {
      case "pre-seed":
        {
          const option = document.createElement("option");
          option.value = "seed";
          option.innerHTML = "Seed";
          possiblePhases.push(option);
        }
        break;
      case "seed":
        {
          const option = document.createElement("option");
          option.value = "startup";
          option.innerHTML = "Startup";
          possiblePhases.push(option);
        }
        break;
      case "startup":
        {
          const option = document.createElement("option");
          option.value = "series-a";
          option.innerHTML = "Series A";
          possiblePhases.push(option);
        }
        break;
      case "series-a":
        {
          const option = document.createElement("option");
          option.value = "series-b";
          option.innerHTML = "Series B";
          possiblePhases.push(option);
        }
        break;
      case "series-b":
        {
          const option = document.createElement("option");
          option.value = "series-c";
          option.innerHTML = "Series C";
          possiblePhases.push(option);
        }
        break;
      case "series-c":
        {
          const option = document.createElement("option");
          option.value = "series-d";
          option.innerHTML = "Series D";
          possiblePhases.push(option);

          const option1 = document.createElement("option");
          option1.value = "ipo";
          option1.innerHTML = "IPO";
          possiblePhases.push(option1);

          const option2 = document.createElement("option");
          option2.value = "emerging-growth";
          option2.innerHTML = "Emerging-Growth";
          possiblePhases.push(option2);

          const option3 = document.createElement("option");
          option3.value = "conquering";
          option3.innerHTML = "Conquering";
          possiblePhases.push(option3);

          const option4 = document.createElement("option");
          option4.value = "capturing";
          option4.innerHTML = "Capturing";
          possiblePhases.push(option4);

          possiblePhases.push(option, option1, option2, option3, option4);
        }
        break;
      default:
        {
          const option1 = document.createElement("option");
          option1.value = "ipo";
          option1.innerHTML = "IPO";
          possiblePhases.push(option1);

          const option2 = document.createElement("option");
          option2.value = "emerging-growth";
          option2.innerHTML = "Emerging-Growth";
          possiblePhases.push(option2);

          const option3 = document.createElement("option");
          option3.value = "conquering";
          option3.innerHTML = "Conquering";
          possiblePhases.push(option3);

          const option4 = document.createElement("option");
          option4.value = "capturing";
          option4.innerHTML = "Capturing";
          possiblePhases.push(option4);

          possiblePhases.push(option1, option2, option3, option4);
        }
        break;
    }
    possiblePhases.forEach((option) => {
      document.getElementById("next-phase").appendChild(option);
    });

    document.getElementById("next-investment-round").classList.toggle("show");
  });

document
  .getElementById("submit-investment-stage")
  .addEventListener("click", (e) => {
    document.getElementById("next-investment-round").classList.toggle("show");
  });

document
  .querySelector("#exit-next-investment-round")
  .addEventListener("click", (e) => {
    document.getElementById("next-investment-round").classList.toggle("show");
  });

function investorAccepted(e) {
  const td = e.parentElement.parentElement.parentElement;
  const span = document.createElement("span");
  span.classList.add("las");
  span.classList.add("la-check");
  td.appendChild(span);
  td.children[1].classList.add("hidden");

  const id = td.children[6].children[0].value;

  fetch("/startup/submit/update-investor-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id, status: "accepted" }),
  })
    .then(() => {
      alert("Successfully updated contacted investors status");
    })
    .catch(() => {
      alert("Failed to update contacted investors status.");
    });
}

function investorDeclined(e) {
  const td = e.parentElement.parentElement.parentElement;
  const span = document.createElement("span");
  span.classList.add("las");
  span.classList.add("la-times");
  td.appendChild(span);
  td.children[1].classList.add("hidden");

  const id = td.children[0].value;

  fetch("/startup/submit/update-investor-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id, status: "declined" }),
  })
    .then(() => {
      alert("Successfully updated contacted investors status");
    })
    .catch(() => {
      alert("Failed to update contacted investors status.");
    });
}

// ============================== Patent ========================================

document.querySelector("#new-patent-btn").addEventListener("click", (e) => {
  document.getElementById("new-patent-pane").classList.toggle("show");
});

document.querySelector("#exit-new-patent").addEventListener("click", (e) => {
  document.getElementById("new-patent-pane").classList.toggle("show");
});

document.querySelector("#patent-status").addEventListener("change", (e) => {
  if (e.target.value === "disclosure-phase") {
    document.querySelector("#patent-confirmation").classList.remove("hidden");
    document.querySelector("#patent-confirmation-input").required = true;
  } else {
    if (
      !document
        .querySelector("#patent-confirmation")
        .classList.contains("hidden")
    ) {
      document.querySelector("#patent-confirmation").classList.add("hidden");
    }
    document.querySelector("#patent-confirmation-input").required = false;
  }
  if (e.target.value === "examination-phase") {
    document.querySelector("#patent-examination").classList.remove("hidden");
    document.querySelector("#patent-examination-input").required = true;
  } else {
    if (
      !document
        .querySelector("#patent-examination")
        .classList.contains("hidden")
    ) {
      document.querySelector("#patent-examination").classList.add("hidden");
    }
    document.querySelector("#patent-examination-input").required = false;
  }
  if (e.target.value === "granted" || e.target.value === "objection-phase") {
    document.querySelector("#patent-granted").classList.remove("hidden");
    document.querySelector("#patent-grant-input").required = true;
    document.querySelector("#patent-duration-input").required = true;
  } else {
    if (
      !document.querySelector("#patent-granted").classList.contains("hidden")
    ) {
      document.querySelector("#patent-granted").classList.add("hidden");
    }
    document.querySelector("#patent-grant-input").required = false;
    document.querySelector("#patent-duration-input").required = false;
  }
});

function showPatentInfo(p) {
  const patent = JSON.parse(p);
  document.getElementById("patent-id").value = patent.id;
  document.getElementById("patent-status").value = patent.status;
  document.getElementById("patent-info-pane").classList.toggle("show");

  document.getElementById("invention-header").innerHTML = patent.invention;

  if (patent.status === "initial-application") {
    document.getElementById("initial-application").classList.toggle("hidden"); // TODO: Add date of filed application
  } else if (patent.status == "disclosure-phase") {
    document.getElementById("disclosure-phase").classList.remove("hidden");

    let confirmationDate = new Date(patent.confirmationDate);
    document.getElementById("application-filed-date").innerHTML =
      formatDate(confirmationDate);

    document.getElementById("submission-fee-deadline").innerHTML = formatDate(
      confirmationDate.addMonths(1)
    );
    console.log(patent.registrationFee);

    if(patent.registrationFee) {
      document.getElementById("submission-fee-deadline-checkbox").classList.add("hidden");
      document.getElementById("submission-fee-deadline-check").classList.remove("hidden");
    }

    document.getElementById("research-result-deadline").innerHTML = formatDate(
      confirmationDate.addMonths(5)
    );

    if(patent.annualFee) {
      document.getElementById("annual-fee-deadline-checkbox").classList.add("hidden");
      document.getElementById("annual-fee-deadline-check").classList.remove("hidden");
    }

    document.getElementById("annual-fee-deadline").innerHTML = formatDate(
      confirmationDate.addMonths(7)
    );
    document.getElementById("parallel-patent-deadline").innerHTML =
      formatDate(confirmationDate);

    document.getElementById("inventor-nomination-deadline").innerHTML =
      formatDate(confirmationDate.addMonths(3));

    if(patent.inventorNomination) {
      document.getElementById("inventor-nomination-deadline-checkbox").classList.add("hidden");
      document.getElementById("inventor-nomination-deadline-check").classList.remove("hidden");
    }

    document.getElementById("compensation-claim-deadline").innerHTML =
      formatDate(confirmationDate.addMonths(3));
    document.getElementById("disclosure-deadline").innerHTML =
      formatDate(confirmationDate);
    document.getElementById("secrecy-deadline").innerHTML =
      formatDate(confirmationDate);
    document.getElementById("additional-patent-deadline").innerHTML =
      formatDate(confirmationDate);

    document.getElementById("examination-request-deadline").innerHTML =
      formatDate(confirmationDate.addMonths(66));

    if(patent.patentExaminationRequest) {
      document.getElementById("examination-request-deadline-checkbox").classList.add("hidden");
      document.getElementById("examination-request-deadline-check").classList.remove("hidden");
    }

  } else if (patent.status === "examination-phase") {
    document.getElementById("examination-phase").classList.toggle("hidden");
    const examinationNoticeDate = new Date(patent.patentExaminationNoticeDate);

    document.getElementById("examination-notice-date").innerHTML = formatDate(
      examinationNoticeDate
    );
    document.getElementById("examination-notice-deadline").innerHTML =
      formatDate(examinationNoticeDate.addMonths(4));

    if(patent.patentExaminationNotice) {
      document.getElementById("examination-notice-deadline-checkbox").classList.add("hidden");
      document.getElementById("examination-notice-deadline-check").classList.remove("hidden");
    }
  } else if (patent.status === "objection-phase") {
    document.getElementById("objection-phase").classList.toggle("hidden");

    document.getElementById("objection-granted-duration").innerHTML =
      patent.patentDuration + " Years";
    const grantPatentDate = new Date(patent.grantDate);
    document.getElementById("objection-granted-on").innerHTML =
      formatDate(grantPatentDate);
    document.getElementById("grant-fee-deadline").innerHTML = formatDate(
      grantPatentDate.addMonths(2)
    );

    if(patent.grantFee) {
      document.getElementById("grant-fee-deadline-checkbox").classList.add("hidden");
      document.getElementById("grant-fee-deadline-check").classList.remove("hidden");
    }
    document.getElementById("objection-filing-deadline").innerHTML = formatDate(
      grantPatentDate.addMonths(1)
    );

    if(patent.objection) {
      document.getElementById("objection-filing-deadline-checkbox").classList.add("hidden");
      document.getElementById("objection-filing-deadline-check").classList.remove("hidden");
    }
    document.getElementById("objection-response-deadline").innerHTML =
      formatDate(grantPatentDate.addMonths(4));
    if(patent.objectionResponse) {
      document.getElementById("objection-response-deadline-checkbox").classList.add("hidden");
      document.getElementById("objection-response-deadline-check").classList.remove("hidden");
    }
  } else if (patent.status === "granted") {
    const grantPatentDate = formatDate(new Date(patent.grantDate));
    console.log(patent.patentDuration);
    document.getElementById("granted").classList.toggle("hidden");
    document.getElementById("granted-duration").innerHTML =
      patent.patentDuration + " Years";
    document.getElementById("granted-on").innerHTML = grantPatentDate;
  } else if (patent.status === "rejected") {
    document.getElementById("rejected").classList.toggle("hidden");
    document.getElementById("rejection-reason").innerHTML =
      patent.rejectionReason;
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
  } else if (
    !document.getElementById("granted").classList.contains("hidden")
  ) {
    document.getElementById("granted").classList.add("hidden");
  }else if (
    !document.getElementById("rejected").classList.contains("hidden")
  ) {
    document.getElementById("rejected").classList.add("hidden");
  }
});

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
  return date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
}
