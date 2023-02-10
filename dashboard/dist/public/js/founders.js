"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
document.addEventListener("DOMContentLoaded", function () {
  return __awaiter(this, void 0, void 0, function* () {
    const responses = yield fetch("/fund/expertise", {
      method: "POST",
    });
    const expertiseData = yield responses.json();
    const data = {
      labels: expertiseData.name,
      datasets: [
        {
          label: "Expertise",
          backgroundColor: [
            "#3e45cd",
            "#4e5ea2",
            "#3c5a5f",
            "#e8c334",
            "#888850",
            "#3wddcd",
            "#54fda2",
            "#3fef5f",
            "#e33334",
            "#666850",
          ],
          borderColor: "#ffffff",
          data: expertiseData.amount,
        },
      ],
    };
    const config = {
      maintainAspectRatio: false,
      responsiveness: true,
      type: "doughnut",
      data: data,
      options: {
        // layout: {
        //   autoPadding: true,
        // },
      },
    };
    // eslint-disable-next-line no-undef
    let chart = new Chart(document.querySelector("#expertise-chart"), config);
    // chart.canvas.parentNode.style.height = "5vh";
    chart.canvas.parentNode.style.width = "25vh";
  });
});
