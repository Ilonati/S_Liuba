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

// images
const images = document.querySelectorAll('.gallery-grid img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCloseBtn = document.getElementById('lightbox-close');


const prevBtn = document.createElement('div');
const nextBtn = document.createElement('div');
prevBtn.className = 'lightbox-prev';
nextBtn.className = 'lightbox-next';
prevBtn.innerHTML = '❮';
nextBtn.innerHTML = '❯';
lightbox.appendChild(prevBtn);
lightbox.appendChild(nextBtn);

let currentIndex = 0;


function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightbox.style.display = 'flex';
}


images.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(index));
});

lightboxCloseBtn.addEventListener('click', () => (lightbox.style.display = 'none'));
lightbox.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.style.display = 'none';
});


function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
}
function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
}

nextBtn.addEventListener('click', showNext);
prevBtn.addEventListener('click', showPrev);


document.addEventListener('keydown', e => {
    if (lightbox.style.display === 'flex') {
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'Escape') lightbox.style.display = 'none';
    }
});
// accordion-title
const titles = document.querySelectorAll('.accordion-title');
titles.forEach(title => {
    title.addEventListener('click', () => {
        const content = title.nextElementSibling;
        const isActive = content.classList.contains('active');


        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.accordion-title').forEach(t => t.classList.remove('active'));


        if (!isActive) {
            title.classList.add('active');
            content.classList.add('active');
        }
    });
});

//  Ouvrir automatiquement la première section (par exemple, Manucure)
const firstTitle = document.querySelector('.accordion-title');
if (firstTitle) {
    firstTitle.classList.add('active');
    const firstContent = firstTitle.nextElementSibling;
    if (firstContent) firstContent.classList.add('active');
}



