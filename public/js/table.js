let gridOptions;

const mobile = window.matchMedia("(max-width: 700px)")

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", async () => {
  const columnDefs = [
    { field: "id", hide: true },
    { field: "name", headerName: "Startup Name" },
    { field: "sector", headerName: "Sector" },
    { field: "stage", headerName: "Investment Stage" },
    { field: "totalInvestment", headerName: "Total Investment ($)" },
    { field: "rating", headerName: "Rating" },
  ];

  gridOptions = {
    columnDefs: columnDefs,
    rowData: await getTableData(),
    rowSelection: "single",
    onSelectionChanged: onSelectionChanged,
  };

  const gridDiv = document.querySelector("#table");
  // eslint-disable-next-line no-undef
  new agGrid.Grid(gridDiv, gridOptions);
  if(!mobile.matches) {
    gridOptions.api.sizeColumnsToFit();
  }
});

async function getTableData() {
  const res = await fetch("/fund/table/values");
  return await res.json();
}

function onSelectionChanged() {
  const selectedRows = gridOptions.api.getSelectedRows();

  fetch("/fund/startup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id: selectedRows[0].id }),
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch(function (err) {
      //TODO:
    });
}
