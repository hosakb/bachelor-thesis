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
      alert("Failed to add new Startup. Please try again.");
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
  let technologyInput = document.createElement("input");
  technologyInput.type = "text";
  technologyInput.id = "new-technology";

  let technologyTd = document.createElement("td");
  technologyTd.appendChild(technologyInput);
  // -----------------------------------------------------------
  let trlSelect = document.createElement("select");
  trlSelect.id = "new-trl";

  let trlOptionOne = document.createElement("option");
  trlOptionOne.value = 1;
  trlOptionOne.text = 1;
  trlOptionOne.defaultSelected = true;
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

  let trlTd = document.createElement("td");
  trlTd.appendChild(trlSelect);

  // -----------------------------------------------------------
  let criticalitySelect = document.createElement("select");
  criticalitySelect.id = "new-criticality";

  let optionOne = document.createElement("option");
  optionOne.value = 1;
  optionOne.text = 1;
  trlOptionOne.defaultSelected = true;
  criticalitySelect.appendChild(optionOne);

  let optionTwo = document.createElement("option");
  optionTwo.value = 2;
  optionTwo.text = 2;
  criticalitySelect.appendChild(optionTwo);

  let optionThree = document.createElement("option");
  optionThree.value = 3;
  optionThree.text = 3;
  criticalitySelect.appendChild(optionThree);

  let criticalityTd = document.createElement("td");
  criticalityTd.appendChild(criticalitySelect);

  // -----------------------------------------------------------
  let okBtn = document.createElement("button");
  okBtn.id = "ok-new-trl-btn";
  okBtn.innerHTML = "<i class='las la-check-circle'></i>";
  let cancelBtn = document.createElement("select");
  cancelBtn.id = "cancel-new-trl-btn";
  cancelBtn.innerHTML = "<i class='las la-times'></i>";

  let optionTd = document.createElement("td");
  optionTd.appendChild(okBtn);
  optionTd.appendChild(cancelBtn);
  // -----------------------------------------------------------

  let tr = document.createElement("tr");
  tr.appendChild(technologyTd);
  tr.appendChild(trlTd);
  tr.appendChild(criticalityTd);
  tr.appendChild(optionTd);

  const trlTbody = document.querySelector("#trl-tbody");
  trlTbody.appendChild(tr);

  document.querySelector("#ok-new-trl-btn").addEventListener("click", () => {
    const technology = document.querySelector("#new-technology").value;
    const trl = document.querySelector("#new-trl").value;
    const criticality = document.querySelector("#new-criticality").value;

    if (technology.value == "") {
      alert("Please input a value for the technology.");
    } else {
      fetch("/startup/submit/add-trl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({
          trlData: {
            technology: technology,
            trl: trl,
            criticality: criticality,
          },
        }),
      })
        .then((response) => {
          if (response.redirected) {
            window.location.href = response.url;
          }
        })
        .catch(function (err) {
          console.info(err); //TODO:
        });
    }
  });

  document
    .querySelector("#cancel-new-trl-btn")
    .addEventListener("click", () => {
      location.reload();
    });
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

document.querySelector("#investor-accepted").addEventListener("click", (e) => {
  const td = e.target.parentElement.parentElement.parentElement;
  const span = document.createElement("span");
  span.classList.add("las");
  span.classList.add("la-check");
  td.appendChild(span);
  td.children[1].classList.add("hidden");

  const id = td.children[0].value;

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
});

document.getElementById("investor-declined").addEventListener("click", (e) => {
  const td = e.target.parentElement.parentElement.parentElement;
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
});
