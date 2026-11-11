// Select-only comboboxes keep the native values and change/input events used by
// the catalog, while drawing their menus inside the page instead of OS windows.
export function initializeSelects() {
  const controls = new WeakMap();
  let sequence = 0,
    current = null,
    refreshPending = false;
  const menu = document.createElement("div");
  menu.id = "catalog-select-menu";
  menu.className = "catalog-select-menu";
  menu.role = "listbox";
  menu.hidden = true;
  document.body.append(menu);

  function labelFor(select) {
    if (select.getAttribute("aria-label"))
      return select.getAttribute("aria-label");
    const label = (select.labels?.[0] || select.closest("label"))?.cloneNode(
      true,
    );
    label
      ?.querySelectorAll("select,button,.catalog-select")
      .forEach((node) => node.remove());
    return (
      label?.textContent.trim() || select.selectedOptions[0]?.textContent || ""
    );
  }
  function synchronize(select, control) {
    const text = select.selectedOptions[0]?.textContent || "";
    if (control.value.textContent !== text) control.value.textContent = text;
    control.button.setAttribute("aria-label", labelFor(select));
    control.button.disabled = select.disabled;
  }
  function close() {
    if (!current) return;
    current.control.button.setAttribute("aria-expanded", "false");
    current.control.button.removeAttribute("aria-activedescendant");
    menu.hidden = true;
    current = null;
  }
  function activate(index) {
    if (!current) return;
    current.index = Math.max(0, Math.min(current.options.length - 1, index));
    const option = menu.children[current.index];
    for (const child of menu.children)
      child.classList.toggle("active", child === option);
    current.control.button.setAttribute("aria-activedescendant", option.id);
    option.scrollIntoView({ block: "nearest" });
  }
  function position() {
    if (!current) return;
    const rect = current.control.button.getBoundingClientRect();
    const viewport = window.visualViewport;
    const x0 = viewport?.offsetLeft || 0,
      y0 = viewport?.offsetTop || 0;
    const width = viewport?.width || innerWidth,
      height = viewport?.height || innerHeight;
    const margin = 10,
      gap = 6;
    const context = document.createElement("canvas").getContext("2d");
    context.font = getComputedStyle(menu).font;
    const textWidth = Math.max(
      ...current.options.map(
        (option) => context.measureText(option.textContent).width,
      ),
    );
    const menuWidth = Math.min(
      width - margin * 2,
      Math.max(rect.width, textWidth + 54, 130),
    );
    menu.style.width = `${menuWidth}px`;
    const below = y0 + height - rect.bottom - margin - gap;
    const above = rect.top - y0 - margin - gap;
    const openAbove =
      below < Math.min(240, current.options.length * 40 + 12) && above > below;
    menu.style.maxHeight = `${Math.max(36, Math.min(320, openAbove ? above : below))}px`;
    const menuHeight = menu.getBoundingClientRect().height;
    menu.style.left = `${Math.max(x0 + margin, Math.min(rect.left, x0 + width - menuWidth - margin))}px`;
    menu.style.top = `${Math.max(y0 + margin, Math.min(openAbove ? rect.top - gap - menuHeight : rect.bottom + gap, y0 + height - menuHeight - margin))}px`;
  }
  function open(select, control) {
    close();
    const options = [...select.options].filter(
      (option) => !option.disabled && !option.hidden,
    );
    if (!options.length || select.disabled) return;
    current = {
      select,
      control,
      options,
      index: Math.max(
        0,
        options.findIndex((option) => option.selected),
      ),
      typed: "",
      typedAt: 0,
    };
    menu.style.font = getComputedStyle(control.button).font;
    menu.replaceChildren(
      ...options.map((option, index) => {
        const row = document.createElement("div");
        row.id = `${control.button.id}-option-${index}`;
        row.className = "catalog-select-option";
        row.role = "option";
        row.dataset.index = index;
        row.setAttribute("aria-selected", String(option.selected));
        if (option.lang) row.lang = option.lang;
        const check = document.createElement("span");
        check.className = "catalog-select-check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = option.selected ? "✓" : "";
        const text = document.createElement("span");
        text.textContent = option.textContent;
        row.append(check, text);
        return row;
      }),
    );
    menu.setAttribute("aria-label", labelFor(select));
    control.button.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    position();
    activate(current.index);
  }
  function choose() {
    if (!current) return;
    const { select, control, options, index } = current;
    const value = options[index].value;
    close();
    select.value = value;
    synchronize(select, control);
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function keydown(event, select, control) {
    const wasOpen = current?.select === select;
    if (event.key === "Escape") {
      if (wasOpen) {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
      return;
    }
    if (event.key === "Tab") {
      if (wasOpen) choose();
      return;
    }
    if (event.altKey && event.key === "ArrowUp" && wasOpen) {
      event.preventDefault();
      choose();
      return;
    }
    const navigation = [
      "ArrowDown",
      "ArrowUp",
      "Home",
      "End",
      "PageDown",
      "PageUp",
    ];
    if (
      navigation.includes(event.key) ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      if (!wasOpen) open(select, control);
      if (!current) return;
      if (event.key === "Home" || (!wasOpen && event.key === "ArrowUp"))
        activate(0);
      else if (event.key === "End") activate(current.options.length - 1);
      else if (wasOpen && ["Enter", " "].includes(event.key)) choose();
      else if (wasOpen)
        activate(
          current.index +
            ({ ArrowDown: 1, ArrowUp: -1, PageDown: 10, PageUp: -10 }[
              event.key
            ] || 0),
        );
      return;
    }
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      event.preventDefault();
      if (!wasOpen) open(select, control);
      if (!current) return;
      const now = performance.now();
      current.typed =
        (now - current.typedAt < 650 ? current.typed : "") +
        event.key.toLocaleLowerCase();
      current.typedAt = now;
      if (
        [...current.typed].every((character) => character === current.typed[0])
      )
        current.typed = current.typed[0];
      const start = current.typed.length === 1 ? current.index + 1 : 0;
      for (let i = 0; i < current.options.length; i++) {
        const index = (start + i) % current.options.length;
        if (
          current.options[index].textContent
            .trim()
            .toLocaleLowerCase()
            .startsWith(current.typed)
        ) {
          activate(index);
          break;
        }
      }
    }
  }
  function refresh() {
    refreshPending = false;
    if (current && !current.select.isConnected) close();
    for (const select of document.querySelectorAll("select")) {
      let control = controls.get(select);
      if (!control) {
        const wrapper = document.createElement("span");
        wrapper.className = "catalog-select";
        const button = document.createElement("button");
        button.type = "button";
        button.className = "catalog-select-trigger";
        button.id = `catalog-select-${++sequence}`;
        button.role = "combobox";
        button.setAttribute("aria-haspopup", "listbox");
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", menu.id);
        const value = document.createElement("span");
        value.className = "catalog-select-value";
        const arrow = document.createElement("span");
        arrow.className = "catalog-select-arrow";
        arrow.setAttribute("aria-hidden", "true");
        button.append(value, arrow);
        select.before(wrapper);
        wrapper.append(button, select);
        select.hidden = true;
        control = { wrapper, button, value };
        controls.set(select, control);
        button.addEventListener("click", () =>
          current?.select === select ? close() : open(select, control),
        );
        button.addEventListener("keydown", (event) =>
          keydown(event, select, control),
        );
      }
      synchronize(select, control);
    }
    if (current) menu.setAttribute("aria-label", labelFor(current.select));
  }
  new MutationObserver((records) => {
    const relevant = records.some(
      (record) =>
        (record.target instanceof Element && record.target.closest("select")) ||
        [...record.addedNodes].some(
          (node) =>
            node instanceof Element &&
            (node.matches("select") || node.querySelector("select")),
        ),
    );
    if (relevant && !refreshPending) {
      refreshPending = true;
      queueMicrotask(refresh);
    }
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label", "disabled"],
  });
  document.addEventListener("change", (event) => {
    const control = controls.get(event.target);
    if (control) synchronize(event.target, control);
  });
  menu.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse") event.preventDefault();
  });
  menu.addEventListener("pointermove", (event) => {
    const option = event.target.closest("[role=option]");
    if (option && current) activate(Number(option.dataset.index));
  });
  menu.addEventListener("click", (event) => {
    const option = event.target.closest("[role=option]");
    if (option) {
      activate(Number(option.dataset.index));
      choose();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (
      current &&
      !current.control.wrapper.contains(event.target) &&
      !menu.contains(event.target)
    )
      close();
  });
  document.addEventListener("focusin", (event) => {
    if (
      current &&
      event.target !== current.control.button &&
      !menu.contains(event.target)
    )
      close();
  });
  window.addEventListener("resize", position);
  window.visualViewport?.addEventListener("resize", position);
  window.addEventListener(
    "scroll",
    (event) => {
      if (current && !menu.contains(event.target)) {
        const rect = current.control.button.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) close();
        else position();
      }
    },
    true,
  );
  refresh();
}
