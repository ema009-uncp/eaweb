// ----------- Utilities -----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const isMac = navigator.platform.toLowerCase().includes("mac");
$("#modKey").textContent = isMac ? "Cmd" : "Ctrl";

// ----------- Views / Routing -----------
const views = {
    home: $("#view-home"),
    projects: $("#view-projects"),
    notes: $("#view-notes"),
    analytics: $("#view-analytics"),
    settings: $("#view-settings"),
};

const dockButtons = $$(".dockBtn");
const crumbs = $("#crumbs");
const statusPill = $("#statusPill");

function setActiveView(key, {push = true} = {}) {
    if (!views[key]) return;

    // animate
    Object.entries(views).forEach(([k, el]) => {
    el.classList.toggle("active", k === key);
    });

    dockButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.target === key));

    const title = views[key].dataset.title || key;
    crumbs.textContent = title;
    statusPill.textContent = `Viewing: ${title}`;

    if (push) {
    history.pushState({key}, "", `#${key}`);
    }
}

dockButtons.forEach(btn => {
    btn.addEventListener("click", () => setActiveView(btn.dataset.target));
});

window.addEventListener("popstate", (e) => {
    const key = (e.state && e.state.key) || (location.hash || "#home").slice(1);
    setActiveView(key, {push: false});
});

// initial route
const initial = (location.hash || "#home").slice(1);
history.replaceState({key: initial}, "", `#${initial}`);
setActiveView(initial, {push: false});

// ----------- Command Palette -----------
const overlay = $("#overlay");
const palInput = $("#palInput");
const palList = $("#palList");
const palCount = $("#palCount");
const openPaletteBtn = $("#openPaletteBtn");

const commands = [
    { key: "home", label: "Home", hint: "Go to home view", icon: "H" },
    { key: "projects", label: "Projects", hint: "Your work area", icon: "P" },
    { key: "notes", label: "Notes", hint: "Scratchpad / notes", icon: "N" },
    { key: "analytics", label: "Analytics", hint: "Insights & charts", icon: "A" },
    { key: "settings", label: "Settings", hint: "Preferences", icon: "S" },
];

let filtered = [...commands];
let activeIndex = 0;

function openPalette(){
    overlay.classList.add("open");
    palInput.value = "";
    filtered = [...commands];
    activeIndex = 0;
    renderCommands();
    setTimeout(() => palInput.focus(), 0);
}

function closePalette(){
    overlay.classList.remove("open");
    palInput.blur();
}

function renderCommands(){
    palList.innerHTML = "";
    filtered.forEach((cmd, idx) => {
    const row = document.createElement("div");
    row.className = "item" + (idx === activeIndex ? " active" : "");
    row.tabIndex = 0;
    row.dataset.key = cmd.key;

    row.innerHTML = `
        <div class="badge">${cmd.icon}</div>
        <div class="meta">
        <b>${cmd.label}</b>
        <span>${cmd.hint}</span>
        </div>
    `;

    row.addEventListener("click", () => {
        setActiveView(cmd.key);
        closePalette();
    });

    palList.appendChild(row);
    });

    palCount.textContent = `${filtered.length} command${filtered.length === 1 ? "" : "s"}`;

    // keep selected item visible
    const active = $(".item.active", palList);
    if (active) active.scrollIntoView({block: "nearest"});
}

function applyFilter(text){
    const q = text.trim().toLowerCase();
    filtered = commands.filter(c =>
    c.label.toLowerCase().includes(q) ||
    c.hint.toLowerCase().includes(q) ||
    c.key.toLowerCase().includes(q)
    );
    activeIndex = 0;
    renderCommands();
}

palInput.addEventListener("input", (e) => applyFilter(e.target.value));

// Keyboard interactions
function paletteKeydown(e){
    if (!overlay.classList.contains("open")) return;

    if (e.key === "Escape"){
    e.preventDefault();
    closePalette();
    return;
    }

    if (e.key === "ArrowDown"){
    e.preventDefault();
    if (filtered.length === 0) return;
    activeIndex = (activeIndex + 1) % filtered.length;
    renderCommands();
    return;
    }

    if (e.key === "ArrowUp"){
    e.preventDefault();
    if (filtered.length === 0) return;
    activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
    renderCommands();
    return;
    }

    if (e.key === "Enter"){
    e.preventDefault();
    const cmd = filtered[activeIndex];
    if (!cmd) return;
    setActiveView(cmd.key);
    closePalette();
    }
}

document.addEventListener("keydown", (e) => {
    // Global open palette shortcut: Ctrl/Cmd + K
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k"){
    e.preventDefault();
    if (overlay.classList.contains("open")) closePalette();
    else openPalette();
    }
    paletteKeydown(e);
});

openPaletteBtn.addEventListener("click", openPalette);

overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePalette();
});

// Tiny touch: update title on view changes
const originalTitle = document.title;
function syncDocTitle(){
    const key = (location.hash || "#home").slice(1);
    const title = (views[key] && views[key].dataset.title) ? views[key].dataset.title : "Home";
    document.title = `${title} — Blank Site`;
}
window.addEventListener("hashchange", syncDocTitle);
syncDocTitle();

// Diagram Button (Home) //
const viewDiagramBtn = document.getElementById("viewDiagramBtn");

/* Light Mode */
    // ---- Theme toggle (Light/Dark) ----
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const themeLabel = document.getElementById("themeLabel");
    const THEME_KEY = "theme_preference"; // "light" | "dark"

    function applyTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    if (themeLabel) themeLabel.textContent = theme === "light" ? "Dark" : "Light";
    }

    function getInitialTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;

    // fallback to system preference
    const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
    return prefersLight ? "light" : "dark";
    }

    // Initialize
    let currentTheme = getInitialTheme();
    applyTheme(currentTheme);

    themeToggleBtn?.addEventListener("click", () => {
    currentTheme = document.body.classList.contains("light") ? "dark" : "light";
    localStorage.setItem(THEME_KEY, currentTheme);
    applyTheme(currentTheme);
    });

    // Optional keyboard shortcut: press "t" (when not typing)
    document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "t" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const typing = tag === "input" || tag === "textarea";
        if (typing) return;

        currentTheme = document.body.classList.contains("light") ? "dark" : "light";
        localStorage.setItem(THEME_KEY, currentTheme);
        applyTheme(currentTheme);
    }
    });

    function goToNotesArch() {
    // 1) switch to Notes
    setActiveView("notes");

    // 2) after the view becomes visible, scroll to the card
    // requestAnimationFrame twice helps ensure layout is updated
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
        const target = document.getElementById("arch-diagram");
        if (!target) return;

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        target.classList.add("pulseHighlight");
        setTimeout(() => target.classList.remove("pulseHighlight"), 900);
        });
    });
    }