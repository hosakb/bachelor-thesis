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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function submitStartupData() {
  const phase = document.querySelector("#phase").value;
  const revenue = document.querySelector("#revenue").value;
  const productToMarket = document.querySelector("#product-to-market").value;
  const timeToMarket = document.querySelector("#time-to-market").value;
  const sector = document.querySelector("#sector").value;
  fetch("/onboarding/startup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      startupInfo: {
        phase: phase,
        revenue: revenue,
        productToMarket: productToMarket,
        timeToMarket: timeToMarket,
        sector: sector,
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
