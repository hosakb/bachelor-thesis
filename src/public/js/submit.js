// eslint-disable-next-line @typescript-eslint/no-unused-vars
function submitKpiData() {
  const date = document.querySelector("#date").innerHTML;
  const netProfitMargin =
    document.querySelector("#netProfitMargin").children[0].innerHTML;
  const cashFlowRate =
    document.querySelector("#cashFlowRate").children[0].innerHTML;
  const liquidity = document.querySelector("#liquidity").children[0].innerHTML;

  fetch("/submit/kpis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({
      kpis: {
        date: date,
        netProfitMargin: netProfitMargin,
        cashFlowRate: cashFlowRate,
        liquidity: liquidity,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reuploadKpiData() {
  fetch("/submit/reupload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
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
