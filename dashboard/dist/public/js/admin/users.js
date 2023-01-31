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
const PW_LENGHT = 16;
// eslint-disable-next-line no-useless-escape
const pattern = new RegExp(/[a-zA-Z0-9_\-\+\.\?\!]/);
function getRandomizedByte() {
  if (window.crypto && window.crypto.getRandomValues) {
    var result = new Uint8Array(1);
    window.crypto.getRandomValues(result);
    return result[0];
  } else if (window.msCrypto && window.msCrypto.getRandomValues) {
    var res = new Uint8Array(1);
    window.msCrypto.getRandomValues(res);
    return res[0];
  } else {
    return Math.floor(Math.random() * 256);
  }
}
function generatePw(length) {
  return Array.apply(null, { length: length })
    .map(function () {
      var result;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        result = String.fromCharCode(getRandomizedByte());
        if (pattern.test(result)) {
          return result;
        }
      }
    })
    .join("");
}
document.getElementById("password").value = generatePw(PW_LENGHT);
document.querySelector("#role").addEventListener("change", (e) => {
  if (e.target.value == "startup") {
    let fund = document.querySelector("#fund-input");
    if (!fund.classList.contains("hidden")) {
      fund.classList.add("hidden");
    }
    let startup = document.querySelector("#startup-input");
    if (startup.classList.contains("hidden")) {
      startup.classList.remove("hidden");
    }
  } else if (e.target.value == "fund" || e.target.value == "stakeholder") {
    let startup = document.querySelector("#startup-input");
    if (!startup.classList.contains("hidden")) {
      startup.classList.add("hidden");
    }
    let fund = document.querySelector("#fund-input");
    if (fund.classList.contains("hidden")) {
      fund.classList.remove("hidden");
    }
  } else {
    let startup = document.querySelector("#startup-input");
    if (!startup.classList.contains("hidden")) {
      startup.classList.add("hidden");
    }
    let fund = document.querySelector("#fund-input");
    if (!fund.classList.contains("hidden")) {
      fund.classList.add("hidden");
    }
  }
});
document.querySelector("#users").addEventListener("change", (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const responses = yield fetch("/admin/get-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({ id: e.target.value }),
    });
    const responserJson = yield responses.json();
    let newUser = document.querySelector("#new-user");
    if (newUser.classList.contains("hidden")) {
      newUser.classList.remove("hidden");
    }
    document.querySelector("#same-id").value = responserJson.id;
    document.querySelector("#new-first-name").value = responserJson.firstName;
    document.querySelector("#new-last-name").value = responserJson.lastName;
    document.querySelector("#new-email").value = responserJson.email;
  })
);
document.querySelector("#delete-btn").addEventListener("click", (e) =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (!document.querySelector("#select-delete-users").value == "") {
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
function emptyInputsAddUser() {
  var inputs = document.querySelectorAll("#add-user-inputs div input");
  for (const input of inputs) if (input.value === "") return true;
  return false;
}
document.getElementById("submit-new-user").addEventListener("click", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    if (emptyInputsAddUser()) {
      alert("Please fill out all fields.");
    } else {
      const email = document.getElementById("email").value;
      const emailTakenResult = yield fetch("/admin/email-taken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ email: email }),
      });
      const emailTakenResultJson = yield emailTakenResult.json();
      const emailTaken = document.getElementById("email-taken");
      const insertStatus = document.getElementById("insert-status");
      if (emailTakenResultJson) {
        if (emailTaken.classList.contains("hidden")) {
          emailTaken.classList.remove("hidden");
        }
        if (!insertStatus.classList.contains("hidden")) {
          insertStatus.classList.add("hidden");
        }
      } else {
        if (!emailTaken.classList.contains("hidden")) {
          emailTaken.classList.add("hidden");
        }
        if (insertStatus.classList.contains("hidden")) {
          insertStatus.classList.remove("hidden");
        }
        let newUser;
        if (document.getElementById("role").value == "admin") {
          newUser = {
            firstName: document.getElementById("first-name").value,
            lastName: document.getElementById("last-name").value,
            email: email,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value,
            fund: null,
            startup: null,
          };
        } else if (document.getElementById("role").value == "startup") {
          newUser = {
            firstName: document.getElementById("first-name").value,
            lastName: document.getElementById("last-name").value,
            email: email,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value,
            fund: null,
            startup: document.getElementById("startup").value,
          };
        } else {
          newUser = {
            firstName: document.getElementById("first-name").value,
            lastName: document.getElementById("last-name").value,
            email: email,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value,
            fund: document.getElementById("fund").value,
            startup: null,
          };
        }
        const res = yield fetch("/admin/add-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          body: JSON.stringify(newUser),
        });
        document.getElementById("email").value = "";
        document.getElementById("first-name").value = "";
        document.getElementById("last-name").value = "";
        document.getElementById("password").value = "";
        document.getElementById("role").value = "";
        document.getElementById("fund").value = "";
        document.getElementById("startup").value = "";
        const user = yield res.json();
        document.getElementById("added-first-name").value = user.firstName;
        document.getElementById("added-last-name").value = user.lastName;
        document.getElementById("added-email").value = user.email;
        document.getElementById("added-password").value = user.password;
        document.getElementById("added-role").value = user.role;
        document.getElementById("added-fund").value = user.fund;
        document.getElementById("added-startup").value = user.startup;
      }
    }
  })
);
document.querySelector("#show-pw").addEventListener("click", () => {
  if (document.querySelector("#added-password").type == "password") {
    document.querySelector("#added-password").type = "text";
    document.querySelector("#show-pw").innerHTML = "Hide Password";
  } else {
    document.querySelector("#added-password").type = "password";
    document.querySelector("#show-pw").innerHTML = "Show Password";
  }
});
function emptyInputsEditUser() {
  var inputs = document.querySelectorAll("#new-user div input");
  for (const input of inputs)
    if (input.value === "") {
      console.log(input);
      return true;
    }
  return false;
}
document
  .querySelector("#submit-new-credentials")
  .addEventListener("click", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (emptyInputsEditUser()) {
        alert("Please fill out all fields.");
      } else {
        const email = document.getElementById("email").value;
        const emailTakenResult = yield fetch("/admin/email-taken", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          body: JSON.stringify({ email: email }),
        });
        const emailTakenResultJson = yield emailTakenResult.json();
        if (emailTakenResultJson) {
          alert("Email already taken. Please choose another mail address.");
        } else {
          const res = yield fetch("/admin/edit-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify({
              id: document.getElementById("same-id").value,
              firstName: document.getElementById("new-first-name").value,
              lastName: document.getElementById("new-last-name").value,
              email: document.getElementById("new-email").value,
              password: document.getElementById("new-password").value,
            }),
          }).catch(() => {
            alert(
              "Something went wrong during saving of updated credentials. "
            );
          });
          alert("User updated");
        }
      }
    })
  );
document.querySelector("#yes-delete-btn").addEventListener("click", () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const deleteUserId = document.querySelector("#select-delete-users").value;
    fetch("/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({ id: deleteUserId }),
    })
      .then(() => {
        document.querySelector("#chose-delete").classList.add("hidden");
        alert("Successfully deleted user.");
      })
      .catch(() => {
        alert("Failed to delete user.");
      });
  })
);
