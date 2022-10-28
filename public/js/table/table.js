const columnDefs = [
  { field: "id", hide: true },
  { field: "name", headerName: "Startup Name" },
  { field: "totalInvestment", headerName: "Total Investment ($)" },
  { field: "share", headerName: "Portfolio Share (%)" },
  { field: "sector", headerName: "Sector" },
];

// specify the data
const rowData = [
  {
    id: "01041536-a76f-43a5-a3e1-c0e76f8acefa",
    name: "Finvia",
    totalInvestment: "10000000",
    share: 20,
    sector: "Family Office",
  },
  {
    id: "2",
    name: "Vulcan Energy Resources",
    totalInvestment: "1200000000",
    share: 30,
    sector: "Lithium",
  },
  {
    id: "3",
    name: "SpaceX",
    totalInvestment: "30000000000",
    share: 50,
    sector: "Space",
  },
  {
    id: "4",
    name: "Liquid",
    totalInvestment: "10000000",
    share: 20,
    sector: "Robo Advisor",
  },
  {
    id: "5",
    name: "Moonfare",
    totalInvestment: "1200000000",
    share: 30,
    sector: "Robo Advisor",
  },
  {
    id: "6",
    name: "Blue Origin",
    totalInvestment: "30000000000",
    share: 50,
    sector: "Space",
  },
];

// let the grid know which columns and what data to use
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  rowSelection: "single",
  onSelectionChanged: onSelectionChanged,
};

function onSelectionChanged() {
  const selectedRows = gridOptions.api.getSelectedRows();

  console.log(selectedRows[0].id);

  fetch("/dashboard/startup", {
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
      console.info(err + " url: " + url);
    });
}

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", () => {
  const gridDiv = document.querySelector("#table");
  new agGrid.Grid(gridDiv, gridOptions);
  gridOptions.api.sizeColumnsToFit();
});
