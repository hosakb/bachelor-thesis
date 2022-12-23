const productToMarketSelect = document.querySelector("#product-to-market");
const estTimeToMarket = document.querySelector("#est-time-to-market");

if (productToMarketSelect.value == "no") {
  if (estTimeToMarket.classList.contains("hidden")) {
    estTimeToMarket.classList.remove("hidden");
  }
} else {
  if (!estTimeToMarket.classList.contains("hidden")) {
    estTimeToMarket.classList.add("hidden");
  }
}

productToMarketSelect.addEventListener("change", () => {
  let estTimeToMarket = document.querySelector("#est-time-to-market");

  if (productToMarketSelect.value == "no") {
    if (estTimeToMarket.classList.contains("hidden")) {
      estTimeToMarket.classList.remove("hidden");
    }
  } else {
    if (!estTimeToMarket.classList.contains("hidden")) {
      estTimeToMarket.classList.add("hidden");
    }
  }
});

const addMilestoneBtn = document.querySelector("#add-milestone-btn");

addMilestoneBtn.addEventListener("click", () => {
  const milestone = document.querySelector("#milestone");
  const startDate = document.querySelector("#start-date-milestone");
  const dueDate = document.querySelector("#due-date-milestone");
  const milestoneCompletion = document.querySelector("#milestone-completion");

  const milestonesTbody = document.querySelector("#milestones-tbody");

  let tr = document.createElement("tr");

  let tdFirstName = document.createElement("td");
  let tdStartDate = document.createElement("td");
  let tdDueDate = document.createElement("td");
  let tdMilestoneCompletion = document.createElement("td");

  tdFirstName.appendChild(document.createTextNode(milestone.value));
  tdStartDate.appendChild(document.createTextNode(startDate.value));
  tdDueDate.appendChild(document.createTextNode(dueDate.value));
  tdMilestoneCompletion.appendChild(
    document.createTextNode(milestoneCompletion.value)
  );

  tr.appendChild(tdFirstName);
  tr.appendChild(tdStartDate);
  tr.appendChild(tdDueDate);
  tr.appendChild(tdMilestoneCompletion);

  milestonesTbody.appendChild(tr);

  milestone.value = "";
  startDate.value = "";
  dueDate.value = "";
  milestoneCompletion.value = "";
});

function submitCapTable() {
  var form = document.getElementById("cap-table-form");
  var formData = new FormData(form);
  fetch("/onboarding/cap-table", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const table = document.querySelector("#cap-table");
      const rows = JSON.parse(data).capTable;
      document.querySelector("#cap-table-div").classList.toggle("hidden");
      for (const row of rows) {
        let tr = document.createElement("tr");
        for (const cell of row) {
          let td = document.createElement("td");
          if (cell != null) {
            td.appendChild(document.createTextNode(cell));
          } else {
            td.appendChild(document.createTextNode(""));
          }
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function submitStartupData() {
  const phase = document.querySelector("#phase").value;
  const dueDatePhase = document.querySelector("#due-date-phase").value;
  const productToMarket = document.querySelector("#product-to-market").value;
  const timeToMarket = document.querySelector("#time-to-market").value;
  const sector = document.querySelector("#sector").value;
  const progress = document.querySelector("#progress").value;

  const milestonesTbody = document.querySelector("#milestones-tbody");
  let milestoneData = [];

  for (const tr of milestonesTbody.children) {
    milestoneData.push({
      name: tr.children[0].innerHTML,
      start: tr.children[1].innerHTML,
      end: tr.children[2].innerHTML,
      progress: tr.children[3].innerHTML,
    });
  }

  let today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  today = yyyy + "-" + mm + "-" + dd;

  fetch("/onboarding/startup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      startupInfo: {
        phase: phase,
        sector: sector,
        productToMarket: productToMarket,
        timeToMarket: timeToMarket,
        startDatePhase: today,
        dueDatePhase: dueDatePhase,
        progress: progress,
        milestoneData: milestoneData,
      },
    }),
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch(function (err) {
      console.error(err); //TODO:
    });
}
