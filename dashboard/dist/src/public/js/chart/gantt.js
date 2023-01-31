"use strict";
var tasks = [
  {
    id: "Task 1",
    name: "Early Stage",
    start: "2022-12-1",
    end: "2023-12-1",
    progress: 20,
    dependencies: "",
    custom_class: "bar-milestone", // optional
  },
  {
    id: "Task 2",
    name: "Research and Development",
    start: "2024-12-1",
    end: "2025-12-1",
    progress: 20,
    dependencies: "Task 1",
    custom_class: "bar-milestone", // optional
  },
  {
    id: "Task 3",
    name: "Growth Stage",
    start: "2026-12-1",
    end: "2027-12-1",
    progress: 20,
    dependencies: "Task 2",
    custom_class: "bar-milestone", // optional
  },
  {
    id: "Task 4",
    name: "Later Stage",
    start: "2028-12-1",
    end: "2029-12-1",
    progress: 20,
    dependencies: "Task 3",
    custom_class: "bar-milestone", // optional
  },
  {
    id: "Task 5",
    name: "launch website",
    start: "2018-12-28",
    end: "2019-12-31",
    progress: 20,
    dependencies: "Task 4",
    custom_class: "bar-milestone", // optional
  },
];
// eslint-disable-next-line no-undef
var gantt = new Gantt("#gantt", tasks, {
  // can be a function that returns html
  // or a simple html string
  custom_popup_html: function (task) {
    // the task object will contain the updated
    // dates and progress value
    const end_date = task.end;
    return `
		<div class="details-container">
		  <h5>${task.name}</h5>
		  <p>Expected to finish by ${end_date}</p>
		  <p>${task.progress}% completed!</p>
		</div>
	  `;
  },
});
function change_view_mode(period) {
  gantt.change_view_mode(period);
}
