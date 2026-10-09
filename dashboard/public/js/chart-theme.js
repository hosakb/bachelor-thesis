// Shared Chart.js presentation defaults: readable axis/legend text on the
// dark cards and the dashboard font. Only appearance is configured here;
// datasets, colors per series and values stay in the page scripts.
// Loaded (deferred) after chart.min.js and before any chart is created,
// because the page scripts build charts on DOMContentLoaded.
(function () {
  // eslint-disable-next-line no-undef
  if (typeof Chart === "undefined") return;
  // eslint-disable-next-line no-undef
  const d = Chart.defaults;
  const reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  d.color = "#d7dae0";
  d.borderColor = "rgba(255, 255, 255, 0.10)";
  d.font.family = getComputedStyle(document.body).fontFamily;
  d.font.size = 12;

  d.plugins.legend.labels.boxWidth = 12;
  d.plugins.legend.labels.boxHeight = 12;
  d.plugins.legend.labels.padding = 14;
  d.plugins.tooltip.padding = 10;
  d.plugins.tooltip.cornerRadius = 6;
  d.plugins.tooltip.titleFont = { weight: "600" };

  d.elements.line.borderWidth = 2.5;
  d.elements.point.radius = 3.5;
  d.elements.point.hoverRadius = 5.5;
  d.layout.padding = 4;

  if (reduceMotion) d.animation = false;
})();
