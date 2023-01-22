document.addEventListener("DOMContentLoaded", async function () {
    
    const responses = await fetch("/fund/expertise", {
        method: "POST",
    });
    
    const expertiseData = await responses.json();

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
      chart.canvas.parentNode.style.height = "15vh";
    chart.canvas.parentNode.style.width = "18vh";

});