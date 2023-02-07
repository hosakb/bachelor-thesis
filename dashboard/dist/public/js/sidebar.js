"use strict";
let submit = document.querySelector("#side-submit").childNodes[0];
let dashboard = document.querySelector("#side-dashboard").childNodes[0];
submit.onclick = function () {
    submit.classList.add("active");
    dashboard.classList.remove("active");
};
dashboard.onclick = function () {
    submit.classList.remove("active");
    dashboard.classList.add("active");
};
