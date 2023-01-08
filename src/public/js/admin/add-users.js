document.querySelector("#role").addEventListener("change", (e) => {
  if (e.target.value == "startup") {
    document.querySelector("#fund-input").classList.remove("hidden");
    let startupInput = document.querySelector("#startup-input");
    if (!startupInput.classList.contains("hidden")) {
      startupInput.classList.add("hidden");
    }
  } else if (e.target.value == "fund") {
    document.querySelector("#startup-input").classList.remove("hidden");
    let fund = document.querySelector("#fund-input");
    if (!fund.classList.contains("hidden")) {
      fund.classList.add("hidden");
    }
  } else {
    let startupInput = document.querySelector("#startup-input");
    if (!startupInput.classList.contains("hidden")) {
      startupInput.classList.add("hidden");
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

  document.querySelector("#new-first-name").value = responserJson.firstName;
  document.querySelector("#new-last-name").value = responserJson.lastName;
  document.querySelector("#new-email").value = responserJson.email;
});

document.querySelector("#delete-btn").addEventListener("click", async (e) => {
  e.target.classList.add("hidden");
  document.querySelector("#chose-delete").classList.remove("hidden");
});

document.querySelector("#dont-delete").addEventListener("click", async (e) => {
  document.querySelector("#chose-delete").classList.add("hidden");
  document.querySelector("#delete-btn").classList.remove("hidden");
});
