// Frappe Gantt 0.6 uses innerHTML for SVG labels as well as popup markup.
// Encode at both boundaries; keep the original name separately for popup text.
(function (root) {
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
  const fitPopup = () => {
    const chart = root.document.querySelector("#gantt");
    const viewport = chart && chart.closest(".overflow-chart");
    const element = chart && chart.parentElement.querySelector(".popup-wrapper");
    if (!viewport || !element) return;
    const bounds = viewport.getBoundingClientRect();
    Object.assign(element.style, {
      maxWidth: Math.max(0, bounds.width - 16) + "px",
      width: "max-content", whiteSpace: "normal", overflowWrap: "anywhere",
      boxSizing: "border-box", overflow: "auto",
      maxHeight: Math.max(0, bounds.height - 16) + "px",
    });
    const rect = element.getBoundingClientRect();
    const left = Math.max(bounds.left + 8, Math.min(rect.left, bounds.right - rect.width - 8));
    const top = Math.max(bounds.top + 8, Math.min(rect.top, bounds.bottom - rect.height - 8));
    element.style.left = (parseFloat(element.style.left || "0") + left - rect.left) + "px";
    element.style.top = (parseFloat(element.style.top || "0") + top - rect.top) + "px";
  };
  const popup = (task) => {
    // The library positions the popup after this callback returns. Clamp on the
    // next frame so literal long names stay readable inside the scroll viewport.
    if (root.requestAnimationFrame) root.requestAnimationFrame(fitPopup);
    return `
    <div class="details-container">
      <h5>${escape(task.plainName)}</h5>
      <p>Expected to finish by ${escape(task.end)}</p>
      <p>${escape(task.progress)}% completed!</p>
    </div>`;
  };
  const api = {escape, popup};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GanttContent = api;
})(typeof window !== "undefined" ? window : globalThis);
