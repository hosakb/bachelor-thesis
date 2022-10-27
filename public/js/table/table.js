const columnDefs = [{ field: "name" }, { field: "total investment ($)" }, { field: "portfolio share (%)" }, { field: "sector" }];

// specify the data
const rowData = [
  { name: "Finvia", "total investment ($)": "10000000", "portfolio share (%)": 20, sector: "Family Office" },
  { name: "Vulcan Energy Resources", "total investment ($)": "1200000000", "portfolio share (%)": 30, sector: "Lithium" },
  { name: "SpaceX", "total investment ($)": "30000000000", "portfolio share (%)": 50, sector: "Space" },
  { name: "Liquid", "total investment ($)": "10000000", "portfolio share (%)": 20, sector: "Robo Advisor" },
  { name: "Moonfare", "total investment ($)": "1200000000", "portfolio share (%)": 30, sector: "Robo Advisor" },
  { name: "Blue Origin", "total investment ($)": "30000000000", "portfolio share (%)": 50, sector: "Space" },
];

// let the grid know which columns and what data to use
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowData,
  onGridReady: (params) => {
    params.api.sizeColumnsToFit();

    window.addEventListener('resize', function () {
      setTimeout(function () {
        params.api.sizeColumnsToFit();
      });
    });
  }
};

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", () => {
  const gridDiv = document.querySelector("#table");
  new agGrid.Grid(gridDiv, gridOptions);
  gridOptions.api.sizeColumnsToFit();
});
