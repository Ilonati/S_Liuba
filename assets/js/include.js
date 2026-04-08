
async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (el) {
        const res = await fetch(file);
        const html = await res.text();
        el.innerHTML = html;
    }
}


loadComponent("header-placeholder", "assets/components/header.html");
loadComponent("footer-placeholder", "assets/components/footer.html");
