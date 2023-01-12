document.getElementById("select-fund-stakeholder").addEventListener("change", (e) => {
  const type = e.target.value;
  if(type == "fund") {
    document.getElementById("register-fund").classList.remove("hidden");
    document.getElementById("register-stakeholders").classList.add("hidden");
  } else {
    document.getElementById("register-stakeholders").classList.remove("hidden");
    document.getElementById("register-fund").classList.add("hidden");
  }
});

async function registerFund() {
  const fundName = document.getElementById("name").value;
  const investmentSector = document.getElementById("sector").value;
  const hardCap = document.getElementById("hard-cap").value;
  const fundVolume = document.getElementById("fund-volume").value;
  const nextClosing = document.getElementById("next-closing").value;
  const finalClosing = document.getElementById("final-closing").value;

  const fundsStartups = [];
  const startups = document.querySelectorAll("#startups-list li input");
  for (const startup of startups) {
    if(startup.checked == true) {
      fundsStartups.push(startup.value);
    }
  }

  if(fundName == "" || investmentSector == "" || hardCap == "" || fundVolume == "" || finalClosing == "" || nextClosing == "" || fundsStartups.length == 0) {
    alert("Please fill out the whole form.")
  } else {

    const newFund = {
      fundName,
      investmentSector,
      hardCap,
      fundVolume,
      nextClosing,
      finalClosing,
      startups: fundsStartups,
      type: "fund"
    }

    fetch("/admin/add-fund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(newFund),
    })
      .then(() => {
        document.getElementById("name").value = "";
        document.getElementById("sector").value = "";
        document.getElementById("hard-cap").value = "";
        document.getElementById("fund-volume").value = "";
        document.getElementById("next-closing").value = "";
        document.getElementById("final-closing").value = "";
    
        for (const checkbox of  document.querySelectorAll("#startups-list li input")) {
          checkbox.checked = false;
        }
        alert("Successfully added new Fund");
      })
      .catch(() => {
        alert("Failed to add new Fund. Please try again.");
      });
  }
}

async function registerStakeholder() {
  const fundName = document.getElementById("stakeholder-name").value;

  const fundsStartups = [];
  const startups = document.querySelectorAll("#startups-list-stakeholder li input");
  for (const startup of startups) {
    if(startup.checked == true) {
      fundsStartups.push(startup.value);
    }
  }

  if(fundName == "" ||  fundsStartups.length == 0) {
    alert("Please fill out the whole form.")
  } else {

    const newStakeholder = {
      fundName,
      investmentSector: null,
      hardCap: null,
      fundVolume: null,
      nextClosing: null,
      finalClosing: null,
      startups: fundsStartups,
      type: "stakeholder"
    }

    fetch("/admin/add-fund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(newStakeholder),
    })
      .then(() => {
        document.getElementById("stakeholder-name").value = "";
    
        for (const checkbox of  document.querySelectorAll("#startups-list-stakeholder li input")) {
          checkbox.checked = false;
        }
        alert("Successfully added new Stakeholder");
      })
      .catch(() => {
        alert("Failed to add new Stakeholder. Please try again.");
      });
  }
}

document.getElementById("funds").addEventListener("change", async (e) => {
  const res = await fetch("/admin/get-fund", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    body: JSON.stringify({ id: e.target.value }),
  }).catch(() => {
    alert("Failed to fetch Fund. Please try again.");
  });

  const fund = await res.json();

  if(fund.type == "fund") {
    document.getElementById("hidden-edit-fields").classList.remove("hidden");
    document.getElementById("submit-edited-fund").classList.remove("hidden");
    document.getElementById("submit-edited-stakeholder").classList.add("hidden");
    document.getElementById("new-sector").value = fund.sector;
    document.getElementById("new-hard-cap").value = fund.hardCap;
    document.getElementById("new-fund-volume").value = fund.volume;
    document.getElementById("new-next-closing").value = fund.nextClosing.split("T")[0];
    document.getElementById("new-final-closing").value = fund.finalClosing.split("T")[0];
  } else {
    document.getElementById("hidden-edit-fields").classList.add("hidden");
    document.getElementById("submit-edited-fund").classList.add("hidden");
    document.getElementById("submit-edited-stakeholder").classList.remove("hidden");
  }
  document.getElementById("new-name").value = fund.name;
  
  document.getElementById("new-fund").classList.remove("hidden")

  const startups = document.querySelectorAll("#new-startups-list li input");
  for (const startup of startups) {
    if(fund.startups.includes(startup.value)) {
      startup.checked = true;
    }
  }

});

async function submitEditedFund() {
    const id = document.getElementById("funds").value;
    const fundName = document.getElementById("new-name").value;
    const investmentSector = document.getElementById("new-sector").value;
    const hardCap = document.getElementById("new-hard-cap").value;
    const fundVolume = document.getElementById("new-fund-volume").value;
    const nextClosing = document.getElementById("new-next-closing").value;
    const finalClosing = document.getElementById("new-final-closing").value;
  
    const fundsStartups = [];
    const startups = document.querySelectorAll("#new-startups-list li input");
    for (const startup of startups) {
      if(startup.checked == true) {
        fundsStartups.push(startup.value);
      }
    }

    if(id == "" || fundName == "" || investmentSector == "" || hardCap == "" || fundVolume == "" || finalClosing == "" || nextClosing == "" || fundsStartups.length == 0) {
      alert("Please fill out the whole form.")
    } else {
      fetch("/admin/update-fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ id,
          fundName,
          investmentSector,
          hardCap,
          fundVolume,
          finalClosing,
          nextClosing,
          fundsStartups ,}),
      })
        .then(() => {
          alert("Successfully updated fund");
          document.getElementById("new-name").value = "";
          document.getElementById("new-sector").value = "";
          document.getElementById("new-hard-cap").value = "";
          document.getElementById("new-fund-volume").value = "";
          document.getElementById("new-next-closing").value = "";
          document.getElementById("new-final-closing").value = "";
          
          const startups = document.querySelectorAll("#new-startups-list li input");
          for (const startup of startups) {
            startup.checked = false;
          }

          document.getElementById("new-fund").classList.add("hidden");
        
          
        })
        .catch(() => {
          alert("Failed to add new Fund. Please try again.");
        });
    }
  }

  async function submitEditedStakeholder() {
    const id = document.getElementById("funds").value;
    const fundName = document.getElementById("new-name").value;
    const fundsStartups = [];
    const startups = document.querySelectorAll("#new-startups-list li input");
    for (const startup of startups) {
      if(startup.checked == true) {
        fundsStartups.push(startup.value);
      }
    }

    if(id == "" || fundName == "" ||  fundsStartups.length == 0) {
      alert("Please fill out the whole form.")
    } else {
      fetch("/admin/update-fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ id,
          fundName,
          investmentSector: null,
          hardCap: null,
          fundVolume: null,
          finalClosing: null,
          nextClosing: null,
          fundsStartups}),
      })
        .then(() => {
          alert("Successfully Stakeholder fund");
          document.getElementById("new-name").value = "";
          
          const startups = document.querySelectorAll("#new-startups-list li input");
          for (const startup of startups) {
            startup.checked = false;
          }

          document.getElementById("new-fund").classList.add("hidden");
        
          
        })
        .catch(() => {
          alert("Failed to add new Stakeholder. Please try again.");
        });
    }
  }

  document.querySelector("#delete-btn").addEventListener("click", async (e) => {
    if (!document.querySelector("#select-delete-fund").value == "") {
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
    .addEventListener("click", async () => {
      const deleteFundId = document.querySelector(
        "#select-delete-fund"
      ).value;
      fetch("/admin/delete-fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ id: deleteFundId }),
      })
        .then(() => {
          document.querySelector("#chose-delete").classList.add("hidden");
  
          alert("Successfully deleted fund.");
        })
        .catch(() => {
          alert("Failed to delete fund.");
        });
    });

