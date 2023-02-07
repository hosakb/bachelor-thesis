"use strict";
let data = [];
document.getElementById("add-technology-btn").addEventListener("click", () => {
    if (document.getElementById("technology").value == "") {
        alert("Input missing for Technology.");
    }
    else {
        const submitTechnologies = document.getElementById("submit-technolgies-btn");
        if (submitTechnologies.classList.contains("hidden")) {
            submitTechnologies.classList.remove("hidden");
        }
        const technology = document.getElementById("technology");
        const trl = document.getElementById("trl");
        const criticality = document.getElementById("criticality");
        const valuesTbody = document.getElementById("trl-prod-values");
        let tr = document.createElement("tr");
        let tdTechnology = document.createElement("td");
        let tdTrl = document.createElement("td");
        let tdCriticality = document.createElement("td");
        tdTechnology.appendChild(document.createTextNode(technology.value));
        tdTrl.appendChild(document.createTextNode(trl.value));
        tdCriticality.appendChild(document.createTextNode(criticality.value));
        data.push({
            technology: technology.value,
            trl: trl.value,
            criticality: criticality.value,
        });
        document.getElementById("trl-data").value = JSON.stringify(data);
        tr.appendChild(tdTechnology);
        tr.appendChild(tdTrl);
        tr.appendChild(tdCriticality);
        valuesTbody.appendChild(tr);
        technology.value = "";
        trl.value = "";
        criticality.value = "";
    }
});
