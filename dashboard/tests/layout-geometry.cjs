// Runs in the browser; shared by every screenshot state in the route matrix.
module.exports = async function layoutGeometry(page) {
  const measure = () => {
    const sidebar = document.querySelector(".sidebar");
    const rect = sidebar?.getBoundingClientRect();
    const visible = rect && rect.width > 0 && rect.height > 0;
    const chart = document.querySelector(".overflow-chart");
    const svg = chart?.querySelector("svg.gantt");
    const header = svg?.querySelector(".grid-header");
    const chartRect = chart?.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();
    const ganttScroller = svg?.parentElement;
    const tableScrollers = [
      ...document.querySelectorAll(
        ".table-container, .submit-table-wrapper, body.layout-onboarding form table"
      ),
    ].filter((el) => el.clientWidth > 0);
    const tableScrollReachable = tableScrollers.every((el) => {
      const previous = el.scrollLeft;
      const maximum = el.scrollWidth - el.clientWidth;
      el.scrollLeft = maximum;
      const reachable = Math.abs(el.scrollLeft - maximum) <= 1;
      el.scrollLeft = previous;
      return reachable;
    });
    let ganttScrollReachable = null;
    if (ganttScroller) {
      const previous = ganttScroller.scrollLeft;
      const maximum = ganttScroller.scrollWidth - ganttScroller.clientWidth;
      ganttScroller.scrollLeft = maximum;
      ganttScrollReachable = Math.abs(ganttScroller.scrollLeft - maximum) <= 1;
      ganttScroller.scrollLeft = previous;
    }
    const ganttGridWidth = svg
      ?.querySelector(".grid-row")
      ?.getAttribute("width");
    const sidebarLinks = sidebar
      ? [...sidebar.querySelectorAll("a")].filter(
          (a) => a.getBoundingClientRect().width > 0
        )
      : [];
    return {
      sidebarVisible: Boolean(visible),
      sidebarViewportGap: visible
        ? Math.max(0, innerHeight - rect.bottom)
        : null,
      sidebarShellGap: visible
        ? Math.max(
            0,
            document.documentElement.scrollHeight - (rect.bottom + scrollY)
          )
        : null,
      sidebarTop: visible ? rect.top : null,
      sidebarBrandTop: visible
        ? sidebar.querySelector(".sidebar-brand").getBoundingClientRect().top
        : null,
      sidebarLinksReachable: sidebarLinks.every((a) => {
        const r = a.getBoundingClientRect();
        return r.top >= -1 && r.bottom <= innerHeight + 1;
      }),
      ganttTopInset: headerRect
        ? headerRect.top - chartRect.top - chart.clientTop
        : null,
      ganttPadding: svg ? getComputedStyle(svg).padding : null,
      ganttBars: svg ? svg.querySelectorAll(".bar-wrapper").length : null,
      ganttGridWidth: ganttGridWidth ? Number(ganttGridWidth) : null,
      ganttScrollWidth: ganttScroller?.scrollWidth ?? null,
      ganttClientWidth: ganttScroller?.clientWidth ?? null,
      ganttScrollReachable,
      tableScrollReachable,
    };
  };
  const initial = await page.evaluate(measure);
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight)
  );
  await page.waitForTimeout(50);
  const scrolled = await page.evaluate(measure);
  await page.evaluate(() => window.scrollTo(0, 0));
  const toggle = page.locator("#nav-toggle");
  let toggled = null;
  if (await toggle.count()) {
    await toggle.evaluate((el) => {
      el.checked = !el.checked;
    });
    await page.waitForTimeout(350);
    toggled = await page.evaluate(measure);
    await toggle.evaluate((el) => {
      el.checked = !el.checked;
    });
    await page.waitForTimeout(350);
  }
  return { initial, scrolled, toggled };
};
