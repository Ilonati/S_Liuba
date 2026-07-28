const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://sliuba-production.up.railway.app";

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
    const titles = document.querySelectorAll(".accordion-title");

    titles.forEach((title) => {
        title.addEventListener("click", () => {
            const content = title.nextElementSibling;

            if (!content) return;

            const isOpen = content.classList.contains("active");

            if (isOpen) {
                content.classList.remove("active");
                content.style.display = "none";
                title.classList.remove("active");
            } else {
                content.classList.add("active");
                content.style.display = "block";
                title.classList.add("active");

                if (window.refreshGalleryImages) {
                    window.refreshGalleryImages();
                }
            }
        });
    });
});
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
        const categoriesResponse = await fetch(`${API_URL}/api/gallery/categories`);
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

        const galleryResponse = await fetch(`${API_URL}/api/gallery`);
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

async function loadPermanentServicesFromBackend() {
    const container = document.querySelector(".permanent-accordion-section");

    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/api/services`);

        if (!response.ok) {
            throw new Error("Erreur API services");
        }

        const services = await response.json();

        const permanentServices = services.filter(service =>
            service.category === "Maquillage Permanent"
        );

        permanentServices.forEach(service => {
            const item = document.createElement("div");
            item.classList.add("massage");

            item.innerHTML = `
                <div class="massage_bloc">
                    <div class="massage_title">
                        <img src="${service.image_url || "images/permanente/permanent_makeup_1.png"}" alt="${service.title}">
                        <span>${service.title}</span>
                        <span class="caret">▼</span>
                    </div>

                    <div class="massage_answer-bloc">
                        <div class="massage_answer">
                            <p>${service.full_description || service.short_description || ""}</p>
                            <p class="massage-time">Durée ${service.duration_minutes || "-"} min</p>
                            <p class="massage-price">Tarif ${service.price || "Sur devis"} €</p>
                            <a href="RDV.html?serviceId=${service.id}#booking" class="massage-btn">Prendre rendez-vous</a>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(item);
        });

        initMassage();

    } catch (error) {
        console.error("Erreur services permanente:", error);
    }
}

loadPermanentServicesFromBackend();

function initProcedureBookingRows() {
    const serviceMap = {
        "Maquillage permanent - SOURCILS|Technique Poil à Poil": "Technique Poil à Poil",
        "Maquillage permanent - SOURCILS|Technique Mixte": "Technique Mixte",
        "Maquillage permanent - SOURCILS|Technique Poudré": "Technique Poudrée",
        "Maquillage permanent - SOURCILS|Retouche Fixatrice 4-5 semaines": "Retouche Fixatrice Sourcils",
        "Retouches Annuelle - SOURCILS|Technique Poil à Poil": "Retouche annuelle Poil à Poil",
        "Retouches Annuelle - SOURCILS|Technique Mixte": "Retouche annuelle Technique Mixte",
        "Retouches Annuelle - SOURCILS|Technique Poudrée": "Retouche annuelle Technique Poudrée",
        "Maquillage permanent - LINER|Ras de cils": "Ras de cils",
        "Maquillage permanent - LINER|Lash liner": "Lash liner",
        "Maquillage permanent - LINER|Retouche Fixatrice 4-5 semaines": "Retouche Fixatrice Liner",
        "Retouches Annuelle - LINER|Ras de cils": "Retouche annuelle Ras de cils",
        "Retouches Annuelle - LINER|Lash liner": "Retouche annuelle Lash liner",
        "Maquillage permanent - LÈVRES|Technique poudrée": "Technique poudrée Lèvres",
        "Maquillage permanent - LÈVRES|Retouche Fixatrice 4-5 semaines": "Retouche Fixatrice Lèvres",
        "Retouches Annuelle - LÈVRES|Retouche annuelle": "Retouche annuelle Lèvres",
        "DÉTATOUAGE sans laser|Détatouage sans laser": "Détatouage sans laser",
        "DÉTATOUAGE sans laser|Séance suivante": "Séance suivante Détatouage",
        "DÉTATOUAGE sans laser|RDV de conseil": "Conseil détatouage",
        "RECONSTRUCTION aréole mammaire / CAMOUFLAGE cicatrices, vergetures, vitiligo|Reconstruction aréole mammaire": "Reconstruction aréole mammaire",
        "RECONSTRUCTION aréole mammaire / CAMOUFLAGE cicatrices, vergetures, vitiligo|Camouflage cicatrices, vergetures, vitiligo": "Camouflage cicatrices, vergetures, vitiligo"
    };

    document.querySelectorAll(".permanent-accordion-section .massage").forEach((card) => {
        const sectionTitle = card.querySelector(".massage_title span")?.textContent.trim();
        const answer = card.querySelector(".massage_answer");
        if (!sectionTitle || !answer) return;

        if (sectionTitle === "CONSEIL MAQUILLAGE PERMANENT") {
            const row = answer.querySelector(":scope > .massage-price");
            const link = answer.querySelector(":scope > a.massage-btn");
            if (row && link) {
                row.classList.add("procedure-row");
                link.href = "RDV.html?service=Conseil%20maquillage%20permanent#booking";
                row.appendChild(link);
            }
        }

        let rowCount = 0;
        answer.querySelectorAll(":scope > p").forEach((row) => {
            const procedureTitle = row.querySelector("strong")?.textContent.trim();
            const service = serviceMap[`${sectionTitle}|${procedureTitle}`];
            if (!service) return;

            row.classList.add("procedure-row");
            let link = row.querySelector(".massage-btn");
            if (!link) {
                link = document.createElement("a");
                link.className = "massage-btn";
                row.appendChild(link);
            }
            link.textContent = "Prendre rendez-vous";
            link.href = `RDV.html?service=${encodeURIComponent(service)}#booking`;

            row.childNodes.forEach((node) => {
                if (node.nodeType !== Node.TEXT_NODE || !node.textContent.includes("•")) return;

                node.textContent = node.textContent
                    .replace(/—\s*(?:Durée\s*)?/i, " — Durée ")
                    .replace(/•\s*(?:Tarif\s*)?/i, " • Tarif ");
            });

            if (!row.querySelector(":scope > .procedure-summary")) {
                const summary = document.createElement("span");
                summary.className = "procedure-summary";

                Array.from(row.childNodes).forEach((node) => {
                    if (node !== link) summary.appendChild(node);
                });
                row.insertBefore(summary, link);
            }
            rowCount++;
        });

        if (rowCount) {
            answer.querySelectorAll(":scope > a.massage-btn").forEach((link) => link.remove());
        }
    });
}

initProcedureBookingRows();
