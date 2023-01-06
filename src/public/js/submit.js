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

  fetch("/submit/delete-trl", {
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

  fetch("/submit/update-trl", {
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

function cancelTrlEdit(x) {
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
      fetch("/submit/add-trl", {
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
