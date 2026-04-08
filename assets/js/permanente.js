const header = document.querySelector('.header');
const burger = document.getElementById('burger');

header.addEventListener('click', (e) => {

    if (e.target === burger) return;


    window.location.href = 'index.html';
});
// Burger menu

const nav = document.getElementById('nav');

burger.addEventListener('click', () => {


    nav.classList.toggle('active');


    if (nav.classList.contains('active')) {
        burger.textContent = "✖";
    } else {
        burger.textContent = "☰";
    }
});
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');

    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveals[i].classList.add('active');
        }
    }
}
/* translateMenu */
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'fr'
    }, 'google_translate_element');
}
const btn = document.getElementById('translateBtn');
const menu = document.getElementById('translateMenu');

btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
});

function changeLang(lang) {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
    }
    menu.classList.add('hidden');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.translate-widget')) {
        menu.classList.add('hidden');
    }
});
// === scroll ===
const scrollBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const hash = window.location.hash;

    if (hash) {
        const section = document.querySelector(hash);
        const accordionContent = section?.querySelector(".accordion-content");
        const title = section?.querySelector(".accordion-title");

        if (accordionContent && title) {
            accordionContent.style.display = "block";
            accordionContent.classList.add("open");
            title.classList.add("active");

            setTimeout(() => {
                section.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 300);
        }
    }


    const titles = document.querySelectorAll(".accordion-title");
    titles.forEach((t) => {
        t.addEventListener("click", () => {
            const content = t.nextElementSibling;

            if (content.classList.contains("open")) {
                content.style.display = "none";
                content.classList.remove("open");
                t.classList.remove("active");
            } else {

                document.querySelectorAll(".accordion-content.open").forEach((openEl) => {
                    openEl.style.display = "none";
                    openEl.classList.remove("open");
                    openEl.previousElementSibling.classList.remove("active");
                });


                content.style.display = "block";
                content.classList.add("open");
                t.classList.add("active");
            }
        });
    });
});