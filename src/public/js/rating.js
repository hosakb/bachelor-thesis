const weightingInputs = document.querySelectorAll(".weighting-input");
sessionStorage.setItem("input-h1", document.querySelector("#input-h1").value);
sessionStorage.setItem("input-h2", document.querySelector("#input-h2").value);
sessionStorage.setItem("input-h3", document.querySelector("#input-h3").value);
sessionStorage.setItem("input-h4", document.querySelector("#input-h4").value);
sessionStorage.setItem("input-h5", document.querySelector("#input-h5").value);
sessionStorage.setItem("input-h6", document.querySelector("#input-h6").value);
sessionStorage.setItem("input-h7", document.querySelector("#input-h7").value);
sessionStorage.setItem("input-h8", document.querySelector("#input-h8").value);

weightingInputs.forEach((x) => {

    x.addEventListener("change", (e) => {

        const td = e.target.parentElement;
    
        td.children[1].classList.remove("hidden");
        td.children[2].classList.remove("hidden");
    })
});

const submitWeightingBtn = document.querySelectorAll(".submit-weighting-btn");
    submitWeightingBtn.forEach((x) => {
        x.addEventListener("click", (e) => {

        const td = e.target.parentElement.parentElement;
        td.children[1].classList.add("hidden");
        td.children[2].classList.add("hidden");
    
        const inputs = document.querySelectorAll(".weighting-input");
    
        let weightSum = 0;
        
        for (const i of inputs) {
            weightSum += parseInt(i.value);  
        }

        sessionStorage.setItem("input-h1", inputs[0].value);
        sessionStorage.setItem("input-h2", inputs[1].value);
        sessionStorage.setItem("input-h3", inputs[2].value);
        sessionStorage.setItem("input-h4", inputs[3].value);
        sessionStorage.setItem("input-h5", inputs[4].value);
        sessionStorage.setItem("input-h6", inputs[5].value);
        sessionStorage.setItem("input-h7", inputs[6].value);
        sessionStorage.setItem("input-h8", inputs[7].value);

        fetch("/fund/update-weights", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            redirect: "follow",
            body: JSON.stringify({
                weights: {
                h1: parseInt(inputs[0].value),
                h2: parseInt(inputs[1].value),
                h3: parseInt(inputs[2].value),
                h4: parseInt(inputs[3].value),
                h5: parseInt(inputs[4].value),
                h6: parseInt(inputs[5].value),
                h7: parseInt(inputs[6].value),
                h8: parseInt(inputs[7].value),
                sum: weightSum,
              },
            }),
          })
            .then((response) => {
              if (response.redirected) {
                window.location.href = response.url;
              }
            })
            .catch(function (err) {
              console.info(err); //TODO:
            });
        })
});

const cancelWeightingBtn = document.querySelectorAll(".cancel-weighting-btn");
cancelWeightingBtn.forEach((x) => {
  x.addEventListener("click", (e) => {
    const td = e.target.parentElement.parentElement;
    const id = td.children[0].id;
    
    td.children[0].value = sessionStorage.getItem(id);
    td.children[1].classList.add("hidden");
    td.children[2].classList.add("hidden");
  })
});


  function showSection(elem) {
    const tbody = elem.parentElement.parentElement.parentElement;
    for (let index = 1; index < tbody.children.length; index++) {
     if (tbody.children[index].classList.contains("subLine")) {
      tbody.children[index].classList.remove("hidden");
     }
    }
   
    elem.parentElement.children[0].classList.add("hidden")
    elem.parentElement.children[1].classList.remove("hidden")
  }

  function hideSection(elem) {
    const tbody = elem.parentElement.parentElement.parentElement;
    for (let index = 1; index < tbody.children.length; index++) {
      tbody.children[index].classList.add("hidden");
    }
   
    elem.parentElement.children[0].classList.remove("hidden")
    elem.parentElement.children[1].classList.add("hidden")
  }

  function showSubSection(elem) {
    const className = elem.parentElement.parentElement.classList[0];
    const tbody = elem.parentElement.parentElement.parentElement;

    for (const child of tbody.children) {
      if(child.classList.contains(className) && child.classList.contains("hidden")) {
        child.classList.remove("hidden");
      }
    }

    elem.parentElement.children[0].classList.add("hidden");
    elem.parentElement.children[1].classList.remove("hidden")

  }

  function hideSubSection(elem) {
    const className = elem.parentElement.parentElement.classList[0];
    const tbody = elem.parentElement.parentElement.parentElement;

    for (const child of tbody.children) {
      if(child.classList.contains(className) && !child.classList.contains("hidden")) {
        child.classList.add("hidden");
      }
      
    }

    elem.parentElement.children[0].classList.remove("hidden");
    elem.parentElement.children[1].classList.add("hidden")

  }