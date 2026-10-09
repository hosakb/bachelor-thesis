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
  } else if (Number(progress.value) < 0 || Number(progress.value) > 100) {
    alert("Percentage of completion must be between 0 and 100.");
  } else if (end.value < start.value) {
    alert("The due date cannot be before the start date.");
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
    if (milestones.length === 0) {
      alert("Please add at least one milestone before submitting.");
      return;
    }
    const submitButton = document.querySelector("#submit-milestones-btn");
    submitButton.disabled = true;
    try {
      const response = await fetch("/startup/submit/add-milestone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ milestones }),
      });
      if (!response.ok || response.redirected) {
        throw new Error();
      }
    } catch {
      submitButton.disabled = false;
      alert("Failed to add new milestones. Please try again.");
      return;
    }

    document.getElementById("add-milestones-pane").classList.toggle("show");
    milestones = [];
    location.reload();
  });

function editMilestoneRow(x) {
  const row = document.querySelector(".milestone-" + x).children;

  let milestoneNameInput = document.createElement("input");
  milestoneNameInput.type = "text";
  milestoneNameInput.id = "milestone-name-" + x;
  milestoneNameInput.value = row[0].textContent.trim();

  row[0].innerHTML = "";
  row[0].appendChild(milestoneNameInput);

  let milestoneStartInput = document.createElement("input");
  milestoneStartInput.type = "date";
  milestoneStartInput.id = "milestone-start-" + x;
  milestoneStartInput.value = row[1].textContent.trim();

  row[1].innerHTML = "";
  row[1].appendChild(milestoneStartInput);

  let milestoneEndInput = document.createElement("input");
  milestoneEndInput.type = "date";
  milestoneEndInput.id = "milestone-end-" + x;
  milestoneEndInput.value = row[2].textContent.trim();

  row[2].innerHTML = "";
  row[2].appendChild(milestoneEndInput);

  let milestoneProgressInput = document.createElement("input");
  milestoneProgressInput.type = "number";
  milestoneProgressInput.min = 0;
  milestoneProgressInput.max = 100;
  milestoneProgressInput.id = "milestone-progress-" + x;
  milestoneProgressInput.value = row[3].textContent.trim();

  row[3].innerHTML = "";
  row[3].appendChild(milestoneProgressInput);

  document
    .querySelector("#milestone-option-btn-" + x)
    .classList.toggle("hidden");
  document.querySelector("#milestone-ok-btn-" + x).classList.toggle("hidden");
  document
    .querySelector("#milestone-cancel-btn-" + x)
    .classList.toggle("hidden");
}

function deleteMilestoneRow(x) {
  if (!confirm("Delete this milestone?")) {
    return;
  }
  const id = document.querySelector("#milestone-" + x).value;

  fetch("/startup/submit/delete-milestone", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      id: id,
    }),
  })
    .then((response) => {
      if (!response.ok || response.redirected) {
        throw new Error("Failed to delete the milestone.");
      }
      location.reload();
    })
    .catch(function (err) {
      alert(err.message);
    });
}

function saveMilestone(x) {
  const name = document.querySelector("#milestone-name-" + x).value.trim();
  const start = document.querySelector("#milestone-start-" + x).value;
  const end = document.querySelector("#milestone-end-" + x).value;
  const progress = document.querySelector("#milestone-progress-" + x).value;

  if (
    name === "" ||
    start === "" ||
    end === "" ||
    progress === "" ||
    Number(progress) < 0 ||
    Number(progress) > 100
  ) {
    alert("Please fill out all fields. Completion must be between 0 and 100.");
    return;
  }
  if (end < start) {
    alert("The due date cannot be before the start date.");
    return;
  }

  const id = document.querySelector("#milestone-" + x).value;
  const okButton = document.querySelector("#milestone-ok-btn-" + x);
  okButton.disabled = true;

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
  })
    .then(async (response) => {
      if (!response.ok || response.redirected) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update the milestone.");
      }
      location.reload();
    })
    .catch(function (err) {
      okButton.disabled = false;
      alert(err.message);
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
  technologyInput.value = row[0].textContent.trim();

  row[0].innerHTML = "";
  row[0].appendChild(technologyInput);

  let trlSelect = document.createElement("select");
  trlSelect.id = "trl-" + x;

  let trlOptionDefault = document.createElement("option");
  trlOptionDefault.selected = true;
  trlOptionDefault.disabled = true;
  trlOptionDefault.hidden = true;
  trlOptionDefault.value = row[1].textContent.trim();
  trlOptionDefault.text = row[1].textContent.trim();
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
  optionDefault.value = row[2].textContent.trim();
  optionDefault.text = row[2].textContent.trim();
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
  document.querySelector("#cancel-btn-" + x).classList.toggle("hidden");
}

function deleteRow(x) {
  if (!confirm("Delete this technology?")) {
    return;
  }
  const id = document.querySelector("#id-" + x).value;

  fetch("/startup/submit/delete-trl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id }),
  })
    .then((response) => {
      if (!response.ok || response.redirected) {
        throw new Error("Failed to delete the technology.");
      }
      location.reload();
    })
    .catch(function (err) {
      alert(err.message);
    });
}

function saveTrl(x) {
  const technology = document.querySelector("#technology-" + x).value.trim();
  const trl = document.querySelector("#trl-" + x).value;
  const criticality = document.querySelector("#criticality-" + x).value;
  const id = document.querySelector("#id-" + x).value;

  if (technology === "") {
    alert("Please enter a technology name.");
    return;
  }

  const okButton = document.querySelector("#ok-btn-" + x);
  okButton.disabled = true;

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
  })
    .then((response) => {
      if (!response.ok || response.redirected) {
        throw new Error("Failed to update the technology.");
      }
      location.reload();
    })
    .catch(function (err) {
      okButton.disabled = false;
      alert(err.message);
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
          location.reload();
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

function updateInvestorStatus(e, status) {
  const cell = e.closest("td");
  const id = cell.querySelector("input[type=hidden]").value;
  cell.querySelectorAll("button").forEach((button) => (button.disabled = true));

  fetch("/startup/submit/update-investor-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id, status }),
  })
    .then((response) => {
      if (!response.ok || response.redirected) {
        throw new Error();
      }
      location.reload();
    })
    .catch(() => {
      cell
        .querySelectorAll("button")
        .forEach((button) => (button.disabled = false));
      alert("Failed to update contacted investors status.");
    });
}

function investorAccepted(e) {
  updateInvestorStatus(e, "accepted");
}

function investorDeclined(e) {
  updateInvestorStatus(e, "declined");
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

function updatePatentStatus(p) {
  const patent = JSON.parse(p);
  document.getElementById("patent-info-pane").classList.toggle("show");

  document.getElementById("invention-header").innerHTML = patent.invention;

  if (patent.status === "initial-application") {
    document.getElementById("initial-application").classList.toggle("hidden"); // TODO: Add date of filed application
    document.getElementById("initial-patent-id").value = patent.id;
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
  document.getElementById("objection-patent-id").value = patent.id;

  document.getElementById("objection-granted-duration").innerHTML =
    patent.patentDuration + " Years";
  const grantPatentDate = new Date(patent.grantDate);
  document.getElementById("objection-granted-on").innerHTML =
    formatDate(grantPatentDate);
  document.getElementById("grant-fee-deadline").innerHTML = formatDate(
    grantPatentDate.addMonths(2)
  );

  if (patent.grantFee) {
    document.getElementById("grant-fee-deadline-checkbox").style.visibility =
      "hidden";
    document.getElementById("grant-fee-deadline-checkbox").checked = true;
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
    document.getElementById(
      "objection-filing-deadline-checkbox"
    ).style.visibility = "hidden";
    document.getElementById(
      "objection-filing-deadline-checkbox"
    ).checked = true;
    document
      .getElementById("objection-filing-deadline-check")
      .classList.remove("hidden");
  }
  document.getElementById("objection-response-deadline").innerHTML = formatDate(
    grantPatentDate.addMonths(4)
  );

  if (patent.objectionResponse) {
    document.getElementById(
      "objection-response-deadline-checkbox"
    ).style.visibility = "hidden";
    document.getElementById(
      "objection-response-deadline-checkbox"
    ).checked = true;
    document
      .getElementById("objection-response-deadline-check")
      .classList.remove("hidden");
    document
      .getElementById("objection-resolved-form")
      .classList.remove("hidden");
    document
      .getElementById("objection-examination-phase")
      .classList.add("hidden");
    document.getElementById("objection-phase-patent-id").value = patent.id;
  }
}

function examinationPhase(patent) {
  document.getElementById("examination-phase").classList.toggle("hidden");
  document.getElementById("examination-patent-id").value = patent.id;

  const examinationNoticeDate = new Date(patent.patentExaminationNoticeDate);

  document.getElementById("examination-notice-date").innerHTML = formatDate(
    examinationNoticeDate
  );
  document.getElementById("examination-notice-deadline").innerHTML = formatDate(
    examinationNoticeDate.addMonths(4)
  );

  if (patent.patentExaminationNotice) {
    document.getElementById(
      "examination-notice-deadline-checkbox"
    ).style.visibility = "hidden";
    document.getElementById(
      "examination-notice-deadline-checkbox"
    ).checked = true;
    document
      .getElementById("examination-notice-deadline-check")
      .classList.remove("hidden");
    document.getElementById("patent-grant-form").classList.remove("hidden");
    document.getElementById("submit-examination-phase").classList.add("hidden");
    document.getElementById("examination-phase-patent-id").value = patent.id;
  }
}

function disclosurePhase(patent) {
  document.getElementById("disclosure-phase").classList.remove("hidden");
  document.getElementById("disclosure-patent-id").value = patent.id;
  let confirmationDate = new Date(patent.confirmationDate);
  document.getElementById("application-filed-date").innerHTML =
    formatDate(confirmationDate);

  document.getElementById("submission-fee-deadline").innerHTML = formatDate(
    confirmationDate.addMonths(1)
  );

  if (patent.registrationFee) {
    document.getElementById(
      "submission-fee-deadline-checkbox"
    ).style.visibility = "hidden";
    document.getElementById("submission-fee-deadline-checkbox").checked = true;
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
    document.getElementById(
      "inventor-nomination-deadline-checkbox"
    ).style.visibility = "hidden";
    document.getElementById(
      "inventor-nomination-deadline-checkbox"
    ).checked = true;
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
    document.getElementById(
      "examination-request-deadline-checkbox"
    ).style.visibility = "hidden";
    document.getElementById(
      "examination-request-deadline-checkbox"
    ).checked = true;
    document
      .getElementById("examination-request-deadline-check")
      .classList.remove("hidden");
    document
      .getElementById("examination-notice-received-date-form")
      .classList.remove("hidden");
    document.getElementById("submit-disclosure-phase").classList.add("hidden");
    document.getElementById("disclosure-phase-patent-id").value = patent.id;
  }
}

function cancelPatent(id) {
  document.getElementById("cancel-patent-pane").classList.toggle("show");
  console.log(id);
  document.getElementById("cancel-patent-id").value = id;
}

document
  .getElementById("exit-cancel-patent-pane")
  .addEventListener("click", () => {
    document.getElementById("cancel-patent-pane").classList.toggle("show");
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
  return (
    date.getDate() + "." + (date.getMonth() + 1) + "." + date.getFullYear()
  );
}

if (new URLSearchParams(window.location.search).has("capTableError")) {
  history.replaceState(null, "", window.location.pathname);
  alert(
    "Please upload a valid .xlsx cap table (max. 5 MB). Nothing was changed."
  );
}
