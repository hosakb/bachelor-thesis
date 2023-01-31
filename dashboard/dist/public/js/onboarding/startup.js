"use strict";
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
