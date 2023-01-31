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
document.getElementById("submit-new-startup").addEventListener("click", () => {
  let name = document.getElementById("name").value;
  let bcCompany = document.getElementById("company").value;
  let bcUsername = document.getElementById("bc-username").value;
  let bcPassword = document.getElementById("bc-password").value;
  if (name == "" || bcUsername == "" || bcPassword == "" || bcCompany == "") {
    alert("Please fill out all fields.");
  } else {
    const newStartup = {
      name,
      bcCompany,
      bcUsername,
      bcPassword,
    };
    fetch("/admin/add-startup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(newStartup),
    })
      .then(() => {
        document.getElementById("name").value = "";
        document.getElementById("company").value = "";
        document.getElementById("bc-username").value = "";
        document.getElementById("bc-password").value = "";
        alert("Successfully added new Startup");
      })
      .catch(() => {
        alert("Failed to add new Startup. Please try again.");
      });
  }
});
document.getElementById("startups").addEventListener("change", (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch("/admin/get-startup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({ id: e.target.value }),
    }).catch(() => {
      alert("Failed to fetch Startup. Please try again.");
    });
    const startup = yield res.json();
    document.getElementById("edited-name").value = startup.name;
    document.getElementById("edited-company").value = startup.company;
    document.getElementById("edited-bc-username").value = startup.username;
  })
);
document
  .getElementById("submit-edited-startup")
  .addEventListener("click", (e) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const id = document.getElementById("startups").value;
      const name = document.getElementById("edited-name").value;
      const bcCompany = document.getElementById("edited-company").value;
      const bcUsername = document.getElementById("edited-bc-username").value;
      const bcPassword = document.getElementById("edited-bc-password").value;
      if (
        name == "" ||
        bcUsername == "" ||
        bcPassword == "" ||
        bcCompany == ""
      ) {
        alert("Please fill out all fields.");
      } else {
        fetch("/admin/update-startup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          body: JSON.stringify({ id, name, bcUsername, bcPassword, bcCompany }),
        })
          .then(() => {
            alert("Successfully updated startup credentials");
            document.getElementById("edited-name").value = "";
            document.getElementById("edited-company").value = "";
            document.getElementById("edited-bc-username").value = "";
            document.getElementById("edited-bc-password").value = "";
          })
          .catch(() => {
            alert("Failed to add new Startup. Please try again.");
          });
      }
    })
  );
document.querySelector("#delete-btn").addEventListener("click", (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!document.querySelector("#select-delete-startup").value == "") {
      e.target.classList.add("hidden");
      document.querySelector("#chose-delete").classList.remove("hidden");
    }
  })
);
document.querySelector("#dont-delete").addEventListener("click", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    document.querySelector("#chose-delete").classList.add("hidden");
    document.querySelector("#delete-btn").classList.remove("hidden");
  })
);
document.querySelector("#yes-delete-btn").addEventListener("click", (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const deleteStartupId = document.querySelector(
      "#select-delete-startup"
    ).value;
    fetch("/admin/delete-startup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({ id: deleteStartupId }),
    })
      .then(() => {
        document.querySelector("#chose-delete").classList.add("hidden");
        alert("Successfully deleted startup.");
      })
      .catch(() => {
        alert("Failed to delete startup.");
      });
  })
);
