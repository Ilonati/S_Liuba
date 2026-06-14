

/* translateMenu */
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'fr'
    }, 'google_translate_element');
}

const btn = document.getElementById('translateBtn');
const menu = document.getElementById('translateMenu');

if (btn && menu) {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('hidden');
    });
}

function changeLang(lang) {
    const select = document.querySelector(".goog-te-combo");

    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event("change"));
    }

    if (menu) {
        menu.classList.add('hidden');
    }
}

document.addEventListener('click', (e) => {
    if (menu && !e.target.closest('.translate-widget')) {
        menu.classList.add('hidden');
    }
});

/* Burger menu */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.textContent = nav.classList.contains('active') ? "✖" : "☰";
    });
}

/* Reveal animation */
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

/* Scroll top */
const scrollBtn = document.getElementById('scrollTopBtn');

if (scrollBtn) {
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
}

// images / lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCloseBtn = document.getElementById('lightbox-close');

let currentIndex = 0;
let images = [];

if (lightbox && lightboxImg && lightboxCloseBtn) {
    const prevBtn = document.createElement('div');
    const nextBtn = document.createElement('div');

    prevBtn.className = 'lightbox-prev';
    nextBtn.className = 'lightbox-next';
    prevBtn.innerHTML = '❮';
    nextBtn.innerHTML = '❯';

    lightbox.appendChild(prevBtn);
    lightbox.appendChild(nextBtn);

    window.refreshGalleryImages = function () {
        images = Array.from(document.querySelectorAll('.gallery-grid img'));

        images.forEach((img, index) => {
            img.onclick = () => openLightbox(index);
        });
    };

    function openLightbox(index) {
        window.refreshGalleryImages();

        if (!images.length) return;

        currentIndex = index;
        lightboxImg.src = images[currentIndex].src;
        lightbox.style.display = 'flex';
    }

    function showNext() {
        if (!images.length) return;

        currentIndex = (currentIndex + 1) % images.length;
        lightboxImg.src = images[currentIndex].src;
    }

    function showPrev() {
        if (!images.length) return;

        currentIndex = (currentIndex - 1 + images.length) % images.length;
        lightboxImg.src = images[currentIndex].src;
    }

    lightboxCloseBtn.onclick = () => {
        lightbox.style.display = 'none';
    };

    lightbox.onclick = (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    };

    nextBtn.onclick = showNext;
    prevBtn.onclick = showPrev;

    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowRight') showNext();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'Escape') lightbox.style.display = 'none';
        }
    });

    window.refreshGalleryImages();
}

async function loadPageGallery() {
    const galleryGrid = document.getElementById("pageGalleryGrid");
    const gallerySection = document.querySelector(".gallery-section");

    if (!galleryGrid || !gallerySection) return;

    const currentCategory = gallerySection.dataset.galleryCategory;

    try {
        const categoriesResponse = await fetch("http://localhost:5000/api/gallery/categories");
        const categories = await categoriesResponse.json();

        const category = categories.find(cat =>
            cat.name === currentCategory
        );

        if (!category) {
            console.warn("Catégorie galerie introuvable:", currentCategory);

            if (window.refreshGalleryImages) {
                window.refreshGalleryImages();
            }

            return;
        }

        const galleryResponse = await fetch("http://localhost:5000/api/gallery");
        const photos = await galleryResponse.json();

        const filteredPhotos = photos.filter(photo =>
            Number(photo.category_id) === Number(category.id) &&
            Number(photo.is_active) === 1
        );

        if (filteredPhotos.length) {
            galleryGrid.insertAdjacentHTML("beforeend", filteredPhotos.map(photo => `
                <img src="${photo.image_url}" alt="${photo.title || 'Photo galerie'}">
            `).join(""));
        }

        if (window.refreshGalleryImages) {
            window.refreshGalleryImages();
        }

    } catch (error) {
        console.error("Erreur galerie:", error);
    }
}

loadPageGallery();
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

/* Accordion */
function closeAllMassage(exceptBloc = null) {
    const blocs = document.querySelectorAll('.massage_bloc');

    blocs.forEach(bloc => {
        if (bloc !== exceptBloc) {
            bloc.classList.remove('active');

            const wrapper = bloc.querySelector('.massage_answer-bloc');
            if (wrapper) {
                wrapper.style.height = '0';
            }
        }
    });
}

function toggleMassage(bloc) {
    const isOpen = bloc.classList.contains('active');
    const wrapper = bloc.querySelector('.massage_answer-bloc');
    const content = bloc.querySelector('.massage_answer');

    if (!wrapper || !content) return;

    if (isOpen) {
        bloc.classList.remove('active');
        wrapper.style.height = '0';
    } else {
        closeAllMassage(bloc);
        bloc.classList.add('active');
        wrapper.style.height = content.scrollHeight + 'px';
    }
}

function initMassage() {
    const blocs = document.querySelectorAll('.massage_bloc');

    blocs.forEach(bloc => {
        const title = bloc.querySelector('.massage_title');
        title.onclick = () => toggleMassage(bloc);

    });
}

initMassage();

window.addEventListener('resize', () => {
    const activeBloc = document.querySelector('.massage_bloc.active');

    if (activeBloc) {
        const wrapper = activeBloc.querySelector('.massage_answer-bloc');
        const content = activeBloc.querySelector('.massage_answer');

        if (wrapper && content) {
            wrapper.style.height = content.scrollHeight + 'px';
        }
    }
});

async function loadServicesFromBackend() {
    const container = document.querySelector(".services-container");

    if (!container) return;

    const currentCategory = container.dataset.category;

    try {
        const response = await fetch("http://localhost:5000/api/services");

        if (!response.ok) {
            throw new Error("Erreur API services");
        }

        const services = await response.json();

        const filteredServices = services.filter(service =>
            service.category === currentCategory
        );

        filteredServices.forEach(service => {
            const item = document.createElement("div");
            item.classList.add("massage");

            item.innerHTML = `
                <div class="massage_bloc">
                    <div class="massage_title">
                        <img src="${service.image_url || "images/massage/relax.png"}" alt="${service.title}">
                        <span>${service.title}</span>
                        <span class="caret">▼</span>
                    </div>

                    <div class="massage_answer-bloc">
                        <div class="massage_answer">
                            <p>${service.full_description || service.short_description || ""}</p>
                            <p class="massage-time">Durée ${service.duration_minutes || "-"} min</p>
                            <p class="massage-price">Tarif ${service.price || "Sur devis"} €</p>
                            <a href="RDV.html#booking" class="massage-btn">Prendre rendez-vous</a>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(item);
        });

        initMassage();

    } catch (error) {
        console.error("Erreur services:", error);
    }
}

loadServicesFromBackend();