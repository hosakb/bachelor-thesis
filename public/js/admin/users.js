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

document.querySelector("#users").addEventListener("change", async (e) => {
  const responses = await fetch("/admin/get-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id: e.target.value }),
  });

  const responserJson = await responses.json();

  let newUser = document.querySelector("#new-user");
  if (newUser.classList.contains("hidden")) {
    newUser.classList.remove("hidden");
  }

  document.querySelector("#same-id").value = responserJson.id;
  document.querySelector("#new-first-name").value = responserJson.firstName;
  document.querySelector("#new-last-name").value = responserJson.lastName;
  document.querySelector("#new-email").value = responserJson.email;
});

document.querySelector("#delete-btn").addEventListener("click", async (e) => {
  if (!document.querySelector("#select-delete-users").value == "") {
    e.target.classList.add("hidden");
    document.querySelector("#chose-delete").classList.remove("hidden");
  }
});

document.querySelector("#dont-delete").addEventListener("click", async () => {
  document.querySelector("#chose-delete").classList.add("hidden");
  document.querySelector("#delete-btn").classList.remove("hidden");
});

function emptyInputsAddUser() {
  var inputs = document.querySelectorAll("#add-user-inputs div input");
  for (const input of inputs) if (input.value === "") return true;
  return false;
}

document
  .getElementById("submit-new-user")
  .addEventListener("click", async () => {
    if (emptyInputsAddUser()) {
      alert("Please fill out all fields.");
    } else {
      const email = document.getElementById("email").value;
      const emailTakenResult = await fetch("/admin/email-taken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ email: email }),
      });

      const emailTakenResultJson = await emailTakenResult.json();
      const emailTaken = document.getElementById("email-taken");
      if (emailTakenResultJson) {
        if (emailTaken.classList.contains("hidden")) {
          emailTaken.classList.remove("hidden");
        }
      } else {
        if (!emailTaken.classList.contains("hidden")) {
          emailTaken.classList.add("hidden");
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

        console.log(document.getElementById("startup"))

        fetch("/admin/add-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          body: JSON.stringify(newUser),
        }).then(() => {
          alert("Successfully added new user.")
        document.getElementById("email").value = "";
        document.getElementById("first-name").value = "";
        document.getElementById("last-name").value = "";
        document.getElementById("password").value = "";
        document.getElementById("role").value = "";
        document.getElementById("fund").value = "";
        document.getElementById("startup").value = "";
        });
      }
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
  .addEventListener("click", async () => {
    if (emptyInputsEditUser()) {
      alert("Please fill out all fields.");
    } else {
      const email = document.getElementById("email").value;
      const emailTakenResult = await fetch("/admin/email-taken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ email: email }),
      });

      const emailTakenResultJson = await emailTakenResult.json();

      if (emailTakenResultJson) {
        alert("Email already taken. Please choose another mail address.");
      } else {
        const res = await fetch("/admin/edit-user", {
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
          alert("Something went wrong during saving of updated credentials. ");
        });

        alert("User updated");
      }
    }
  });

document
  .querySelector("#yes-delete-btn")
  .addEventListener("click", async () => {
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
  });
