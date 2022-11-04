//Toggle User and GP Form
let registerGp = document.querySelector("#register-gp");

function toggleRegisterPartners() {
  registerGp.classList.toggle("show");
}

let partnerUl = document.querySelector("#partner-list");
let removePartnerBtn = document.querySelector("#remove-partner-btn");

let partners = [];

function addPartner() {
  let firstNameInput = document.querySelector("#partner-first-name");
  let lastNameInput = document.querySelector("#partner-last-name");
  let emailInput = document.querySelector("#partner-email");
  let passwordInput = document.querySelector("#partner-password");

  let firstName = firstNameInput.value;
  let lastName = lastNameInput.value;
  let email = emailInput.value;
  let password = passwordInput.value;

  // TODO: Check if email exists

  partners.push({ firstName, lastName, email, password });

  let li = document.createElement("li");
  li.appendChild(document.createTextNode(firstName + " " + lastName));
  partnerUl.appendChild(li);

  firstNameInput.value = "";
  lastNameInput.value = "";
  emailInput.value = "";
  passwordInput.value = "";
}

partnerUl.onclick = function (event) {
  if (event.target.tagName != "LI") return;

  addedStartupUl.childNodes.forEach((li) => {
    if (li.classList != undefined) {
      li.classList.remove("selected");
    }
  });

  if (event.ctrlKey || event.metaKey) {
    toggleSelect(event.target);
  } else {
    singleSelect(existingStartupUl, event.target);
  }
};

removePartnerBtn.onclick = function (event) {
  let selected = partnerUl.querySelectorAll(".selected");
  for (let elem of selected) {
    partnerUl.removeChild(elem);
    fundPartners;
  }
};

function createGp() {
  const gpName = document.querySelector("#gp-name").value;
  document.querySelector("#gp").value = gpName;
  document.querySelector("#partners").value = JSON.stringify(partners);
  toggleRegisterPartners();
}

// Startup Selection

let existingStartupUl = document.querySelector("#existing-startup");
let addedStartupUl = document.querySelector("#added-startup");
let addStartupBtn = document.querySelector("#add-startup-btn");
let removeStartupBtn = document.querySelector("#remove-startup-btn");

// -------- Existing Startup -> Added Startup
existingStartupUl.onclick = function (event) {
  if (event.target.tagName != "LI") return;

  addedStartupUl.childNodes.forEach((li) => {
    if (li.classList != undefined) {
      li.classList.remove("selected");
    }
  });

  if (event.ctrlKey || event.metaKey) {
    toggleSelect(event.target);
  } else {
    singleSelect(existingStartupUl, event.target);
  }
};

// prevent unneeded selection of list elements on clicks
existingStartupUl.onmousedown = function () {
  return false;
};

addStartupBtn.onclick = function (event) {
  let selected = existingStartupUl.querySelectorAll(".selected");
  const startupIds = [];
  for (let elem of selected) {
    const content = elem.textContent || this.innerHTML;
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(content));
    addedStartupUl.appendChild(li);
    existingStartupUl.removeChild(elem);
  }
};

// -------- Added Startup -> Existing Startup
addedStartupUl.onclick = function (event) {
  if (event.target.tagName != "LI") return;

  existingStartupUl.childNodes.forEach((li) => {
    if (li.classList != undefined) {
      li.classList.remove("selected");
    }
  });

  if (event.ctrlKey || event.metaKey) {
    toggleSelect(event.target);
  } else {
    singleSelect(addedStartupUl, event.target);
  }
};

// prevent unneeded selection of list elements on clicks
addedStartupUl.onmousedown = function () {
  return false;
};

removeStartupBtn.onclick = function (event) {
  let selected = addedStartupUl.querySelectorAll(".selected");
  for (let elem of selected) {
    const content = elem.textContent || this.innerHTML;
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(content));
    existingStartupUl.appendChild(li);
    addedStartupUl.removeChild(elem);
  }
};

// -------- Shared Functions
function toggleSelect(li) {
  li.classList.toggle("selected");
}

function singleSelect(list, li) {
  let selected = list.querySelectorAll(".selected");
  for (let elem of selected) {
    elem.classList.remove("selected");
  }
  li.classList.add("selected");
}

// --------------------------------------------------------------------

//Toggle Startup form
let registerStartup = document.querySelector("#register-startup");

function toggleRegisterStartup() {
  registerStartup.classList.toggle("show");
}

// Startup Users
let userFirstNameInput = document.querySelector("#user-first-name");
let userLastNameInput = document.querySelector("#user-last-name");
let userEmailInput = document.querySelector("#user-email");
let userPasswordInput = document.querySelector("#user-password");
let userRoleInput = document.querySelector("#user-role");

let startupUserTBody = document.querySelector("#startup-user-tbody");

let startupUsers = [];

function addStartupUser() {
  let firstName = userFirstNameInput.value;
  let lastName = userLastNameInput.value;
  let email = userEmailInput.value;
  let password = userPasswordInput.value;
  let role = userRoleInput.value;

  // TODO: Check if email exists

  startupUsers.push({ firstName, lastName, email, password, role });

  let tr = document.createElement("tr");

  let tdFirstName = document.createElement("td");
  let tdLastName = document.createElement("td");
  let tdEmail = document.createElement("td");
  let tdRole = document.createElement("td");

  tdFirstName.appendChild(document.createTextNode(firstName));
  tdLastName.appendChild(document.createTextNode(lastName));
  tdEmail.appendChild(document.createTextNode(role));
  tdRole.appendChild(document.createTextNode(email));

  tr.appendChild(tdFirstName);
  tr.appendChild(tdLastName);
  tr.appendChild(tdEmail);
  tr.appendChild(tdRole);

  startupUserTBody.appendChild(tr);

  userFirstNameInput.value = "";
  userLastNameInput.value = "";
  userEmailInput.value = "";
  userPasswordInput.value = "";
  userRoleInput.value = "";
}

function registerNewStartup() {
  let startupName = document.querySelector("#startup-name");
  let phase = document.querySelector("#phase");

  let startup = {
    name: startupName.value,
    phase: phase.value,
    users: JSON.stringify(startupUsers),
  };

  toggleRegisterStartup();

  const XHR = new XMLHttpRequest();
  const urlEncodedDataPairs = [];

  for (const [name, value] of Object.entries(startup)) {
    urlEncodedDataPairs.push(
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    );
  }

  const urlEncodedData = urlEncodedDataPairs.join("&").replace(/%20/g, "+");

  // Define what happens in case of error
  XHR.addEventListener("error", (event) => {
    alert("Something went wrong while transmitting new Startups.");
  });

  // Set up our request
  XHR.open("POST", "admin/new-startup");

  // Add the required HTTP header for form data POST requests
  XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

  // Finally, send our data.
  XHR.send(urlEncodedData);
}
