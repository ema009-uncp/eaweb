const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");

const toggleMenu = () => {
    const isOpen = menu.classList.toggle("is-open");
    menuToggle.classList.toggle("is-active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
};

menuToggle.addEventListener("click", toggleMenu);

document.addEventListener("click", (event) => {
    if (!menu.classList.contains("is-open")) {
        return;
    }
    if (menu.contains(event.target) || menuToggle.contains(event.target)) {
        return;
    }
    menu.classList.remove("is-open");
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
});
