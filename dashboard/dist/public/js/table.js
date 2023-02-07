"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let gridOptions;
const mobile = window.matchMedia("(max-width: 700px)");
// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", () => __awaiter(void 0, void 0, void 0, function* () {
    const columnDefs = [
        { field: "id", hide: true },
        { field: "name", headerName: "Startup Name" },
        { field: "sector", headerName: "Sector" },
        { field: "stage", headerName: "Investment Stage" },
        { field: "totalInvestment", headerName: "Total Investment (M$)" },
        { field: "rating", headerName: "Rating" },
    ];
    gridOptions = {
        columnDefs: columnDefs,
        rowData: yield getTableData(),
        rowSelection: "single",
        onSelectionChanged: onSelectionChanged,
    };
    const gridDiv = document.querySelector("#table");
    // eslint-disable-next-line no-undef
    new agGrid.Grid(gridDiv, gridOptions);
    if (!mobile.matches) {
        gridOptions.api.sizeColumnsToFit();
    }
}));
function getTableData() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("/fund/table/values");
        return yield res.json();
    });
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
