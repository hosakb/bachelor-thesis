document.getElementById("submit-new-startup").addEventListener("click", () => {
  let name = document.getElementById("name").value;
  let bcCompany = document.getElementById("company").value;
  let bcUsername = document.getElementById("bc-username").value;
  let bcPassword = document.getElementById("bc-password").value;
  let fund = document.getElementById("fund").value;

  if (
    name == "" ||
    bcUsername == "" ||
    bcPassword == "" ||
    fund == "" ||
    bcCompany == ""
  ) {
    alert("Please fill out all fields.");
  } else {
    const newStartup = {
      name,
      bcCompany,
      bcUsername,
      bcPassword,
      fund,
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
        document.getElementById("fund").value = "";
        alert("Successfully added new Startup");
      })
      .catch(() => {
        alert("Failed to add new Startup. Please try again.");
      });
  }
});

document.getElementById("startups").addEventListener("change", async (e) => {
  const res = await fetch("/admin/get-startup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id: e.target.value }),
  }).catch(() => {
    alert("Failed to add new Startup. Please try again.");
  });

  const startup = await res.json();

  document.getElementById("edited-name").value = startup.name;
  document.getElementById("edited-company").value = startup.company;
  document.getElementById("edited-bc-username").value = startup.username;
});

document
  .getElementById("submit-edited-startup")
  .addEventListener("click", async (e) => {
    const id = document.getElementById("startups").value;
    const name = document.getElementById("edited-name").value;
    const bcCompany = document.getElementById("edited-company").value;
    const bcUsername = document.getElementById("edited-bc-username").value;
    const bcPassword = document.getElementById("edited-bc-password").value;

    if (name == "" || bcUsername == "" || bcPassword == "" || bcCompany == "") {
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
  });

document.querySelector("#delete-btn").addEventListener("click", async (e) => {
  if (!document.querySelector("#select-delete-startup").value == "") {
    e.target.classList.add("hidden");
    document.querySelector("#chose-delete").classList.remove("hidden");
  }
});

document.querySelector("#dont-delete").addEventListener("click", async () => {
  document.querySelector("#chose-delete").classList.add("hidden");
  document.querySelector("#delete-btn").classList.remove("hidden");
});

document
  .querySelector("#yes-delete-btn")
  .addEventListener("click", async (e) => {
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
  });
