"use strict";
let previousVentures;
let ventureForm;
let submitVentureBtn;
let venturesTbl;
let ventureName;
let foundingDate;
let coFounders;
let ventureInBusiness;
let lastValuation;
// ----------------- Expertise Selection ---------------------
let expertiseSelect = document.querySelector("#expertise");
let otherExpertise = document.querySelector("#other-expertise");
if (expertiseSelect.value == "other") {
  if (otherExpertise.classList.contains("hidden")) {
    otherExpertise.classList.remove("hidden");
  }
} else {
  if (!otherExpertise.classList.contains("hidden")) {
    otherExpertise.classList.add("hidden");
  }
}
expertiseSelect.addEventListener("change", () => {
  let otherExpertise = document.querySelector("#other-expertise");
  if (expertiseSelect.value == "other") {
    if (otherExpertise.classList.contains("hidden")) {
      otherExpertise.classList.remove("hidden");
    }
  } else {
    if (!otherExpertise.classList.contains("hidden")) {
      otherExpertise.classList.add("hidden");
    }
  }
});
// ----------------- Previous Ventures ---------------------
let firstVentureSelect = document.querySelector("#first-venture");
firstVentureSelect.addEventListener("change", () => {
  previousVentures = document.querySelector("#previous-ventures");
  if (
    firstVentureSelect.value == "no" &&
    previousVentures.classList.contains("hidden")
  ) {
    previousVentures.classList.remove("hidden");
  } else {
    previousVentures.classList.add("hidden");
  }
});
const addVentureBtn = document.querySelector("#add-venture-btn");
addVentureBtn.addEventListener("click", () => {
  ventureForm = document.querySelector(".venture-form");
  submitVentureBtn = document.querySelector("#submit-venture-btn");
  ventureForm.classList.toggle("hidden");
  addVentureBtn.classList.toggle("hidden");
  submitVentureBtn.classList.toggle("hidden");
});
function areVentureInputsEmpty() {
  var inputs = document.querySelectorAll(".venture-form div input");
  for (const input of inputs) if (input.value === "") return true;
  return false;
}
submitVentureBtn = document.querySelector("#submit-venture-btn");
submitVentureBtn.addEventListener("click", () => {
  if (areVentureInputsEmpty()) {
    alert("Form is not complete or received wrong data format.");
  } else {
    ventureForm = document.querySelector(".venture-form");
    ventureForm.classList.toggle("hidden");
    addVentureBtn.classList.toggle("hidden");
    submitVentureBtn.classList.toggle("hidden");
    venturesTbl = document.querySelector("#ventures");
    let row = venturesTbl.insertRow(-1);
    let ventureNameCell = row.insertCell(0);
    let foundingDateCell = row.insertCell(1);
    let coFoundersCell = row.insertCell(2);
    let lastValuationCell = row.insertCell(3);
    let ventureInBusinessCell = row.insertCell(4);
    ventureName = document.querySelector("#venture-name");
    foundingDate = document.querySelector("#founding-date");
    coFounders = document.querySelector("#co-founders");
    ventureInBusiness = document.querySelector("#venture-in-business");
    lastValuation = document.querySelector("#last-valuation");
    ventureNameCell.innerHTML = ventureName.value;
    foundingDateCell.innerHTML = foundingDate.value;
    coFoundersCell.innerHTML = coFounders.value;
    ventureInBusinessCell.innerHTML = ventureInBusiness.value;
    lastValuationCell.innerHTML = lastValuation.value;
    ventureName.value = "";
    foundingDate.value = "";
    coFounders.value = "";
    ventureInBusiness.value = "";
    lastValuation.value = "";
  }
});
function areTrackRecordsInputsEmpty() {
  let inputs = [];
  var expertise = document.querySelector("#expertise");
  var otherExpertise = document.querySelector("#other-expertise");
  if (expertise.value == "other") {
    inputs.push(otherExpertise.value);
  } else {
    inputs.push(expertise.value);
  }
  for (const val of inputs) if (val === "") return true;
  return false;
}
let submitBtn = document.querySelector("#submit-track-record-btn");
submitBtn.addEventListener("click", () => {
  if (areTrackRecordsInputsEmpty()) {
    alert("Please fill out allthe track record details.");
  } else {
    var tbl = document.querySelector("#ventures");
    var tds = tbl.getElementsByTagName("td");
    let ventures = [];
    for (var i = 0; i < tds.length; i += 5) {
      ventures.push({
        ventureName: tds[i].innerHTML,
        foundingDate: tds[i + 1].innerHTML,
        coFounders: tds[i + 2].innerHTML,
        lastValuation: tds[i + 3].innerHTML,
        inBusiness: tds[i + 4].innerHTML,
      });
    }
    let expertise = document.querySelector("#expertise").value;
    if (expertise == "other") {
      let otherExpertise = document.querySelector("#other-expertise").value;
      expertise = otherExpertise;
    }
    console.log(
      JSON.parse(
        JSON.stringify({
          expertise: expertise,
          ventures: ventures,
        })
      )
    );
    fetch("/onboarding/track-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({
        trackRecord: {
          expertise: expertise,
          ventures: ventures,
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
