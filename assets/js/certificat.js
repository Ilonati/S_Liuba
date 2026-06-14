
const header = document.querySelector('.header');
const burger = document.getElementById('burger');

header.addEventListener('click', (e) => {

    if (e.target === burger) return;


    window.location.href = 'index.html';
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
//  scroll 
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

// SLIDES
const slider = document.querySelector('.slider-container');
const slides = document.querySelectorAll('.certificat-slider .slide');
const prevBtn = document.querySelector('.certificat-slider .prev');
const nextBtn = document.querySelector('.certificat-slider .next');

let currentIndex = 0;

function updateSlides() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
    });
}

if (slider && slides.length && prevBtn && nextBtn) {
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
    });

    updateSlides();
}

async function loadCertificatesFromBackend() {
    const slider = document.querySelector(".slider-container");

    if (!slider) return;

    try {
        const response = await fetch("https://sliuba-production.up.railway.app/api/certificates");

        if (!response.ok) {
            throw new Error("Erreur API certificats");
        }

        const certificates = await response.json();

        certificates.forEach((cert) => {
            const slide = document.createElement("div");
            slide.classList.add("slide");

            const img = document.createElement("img");

            if (cert.file_url.startsWith("/uploads")) {
                img.src = `https://sliuba-production.up.railway.app${cert.file_url}`;
            } else {
                img.src = cert.file_url;
            }

            img.alt = cert.title || "Certificat";

            slide.appendChild(img);
            slider.appendChild(slide);
        });

        refreshCertificateSlider();
    } catch (error) {
        console.error("Erreur certificats backend:", error);
    }
}

function refreshCertificateSlider() {
    const slider = document.querySelector(".slider-container");
    const slides = document.querySelectorAll(".certificat-slider .slide");
    const prevBtn = document.querySelector(".certificat-slider .prev");
    const nextBtn = document.querySelector(".certificat-slider .next");

    let currentIndex = 0;

    function updateSlides() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;

        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === currentIndex);
        });
    }

    if (slider && slides.length && prevBtn && nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlides();
        };

        prevBtn.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlides();
        };

        updateSlides();
    }
}

loadCertificatesFromBackend();