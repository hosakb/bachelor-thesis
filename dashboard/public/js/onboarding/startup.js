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
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload the cap table.");
      }
      return data;
    })
    .then((data) => {
      const table = document.querySelector("#cap-table");
      const rows = JSON.parse(data).capTable;
      table.replaceChildren();
      document.querySelector("#cap-table-div").classList.remove("hidden");
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
    })
    .catch((err) => {
      alert(err.message);
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function submitStartupData() {
  const phase = document.querySelector("#phase").value;
  const productToMarket = document.querySelector("#product-to-market").value;
  let timeToMarket = document.querySelector("#time-to-market").value;
  const sector = document.querySelector("#sector").value;
  const investedCapital = document.querySelector("#invested-capital").value;

  if (productToMarketSelect.value === "yes") {
    timeToMarket = null;
  }

  if (timeToMarket !== "") {
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
          investedCapital: investedCapital,
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
  } else {
    alert("Please provide the estimated time to market.");
  }
}
