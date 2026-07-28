const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://sliuba-production.up.railway.app";

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

/* P animation */
function wrapWords(element) {
    if (!element) return;

    element.childNodes.forEach(node => {
        if (node.nodeType === 3) {
            const words = node.textContent.split(" ");
            const fragment = document.createDocumentFragment();

            words.forEach((word, index) => {
                if (word.trim() !== "") {
                    const span = document.createElement("span");
                    span.className = "hover-word";
                    span.textContent = word;
                    fragment.appendChild(span);
                }

                if (index < words.length - 1) {
                    fragment.appendChild(document.createTextNode(" "));
                }
            });

            node.replaceWith(fragment);
        } else if (node.nodeType === 1) {
            wrapWords(node);
        }
    });
}

const beautyText = document.getElementById("beauty-text");

if (beautyText) {
    wrapWords(beautyText);
}

/* Burger menu */
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');

        if (nav.classList.contains('active')) {
            burger.textContent = "✖";
        } else {
            burger.textContent = "☰";
        }
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

// /* Massage accordion */
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

function initMassageBookingRows(root = document) {
    root.querySelectorAll(".massage_answer").forEach((answer) => {
        const price = answer.querySelector(":scope > .massage-price");
        const button = answer.querySelector(":scope > .massage-btn");
        if (!price || !button) return;

        price.textContent = price.textContent
            .replace(/^Durée totale/i, "Durée")
            .replace(/^Tarif\s*/i, "Durée non précisée • Tarif ");
        price.classList.add("massage-booking-row");
        price.appendChild(button);

        const metadata = document.createElement("span");
        metadata.className = "massage-booking-meta";
        Array.from(price.childNodes).forEach((node) => {
            if (node !== button) metadata.appendChild(node);
        });
        price.insertBefore(metadata, button);
    });
}

function updateMassageContactButtons() {
    const isPhone = window.matchMedia("(max-width: 768px) and (pointer: coarse)").matches;

    document.querySelectorAll('.massage_answer a[href^="tel:0783714349"], .massage_answer a[data-contact-booking]').forEach((button) => {
        button.dataset.contactBooking = "true";

        if (isPhone) {
            button.href = "tel:0783714349";
            button.textContent = "Appeler : 07 83 71 43 49";
            button.removeAttribute("target");
            button.removeAttribute("rel");
        } else {
            button.href = "https://wa.me/33783714349?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous.";
            button.textContent = "WhatsApp : 07 83 71 43 49";
            button.target = "_blank";
            button.rel = "noopener noreferrer";
        }
    });
}

function initMassage() {
    const blocs = document.querySelectorAll('.massage_bloc');

    blocs.forEach(bloc => {
        const title = bloc.querySelector('.massage_title');
        title.onclick = () => toggleMassage(bloc);

        if (bloc.classList.contains('active')) {
            const wrapper = bloc.querySelector('.massage_answer-bloc');
            const content = bloc.querySelector('.massage_answer');

            if (wrapper && content) {
                wrapper.style.height = content.scrollHeight + 'px';
            }
        }
    });
}

initMassageBookingRows();
updateMassageContactButtons();
initMassage();

window.addEventListener("resize", updateMassageContactButtons);

/* Recalculate accordion height when resize */
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
        const response = await fetch(`${API_URL}/api/services`);

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
                            <p class="massage-price">Durée ${service.duration_minutes || "-"} min • Tarif ${service.price || "Sur devis"} €</p>
                            <a href="RDV.html?serviceId=${service.id}#booking" class="massage-btn">Prendre rendez-vous</a>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(item);
            initMassageBookingRows(item);
        });

        initMassage();

    } catch (error) {
        console.error("Erreur services:", error);
    }
}

loadServicesFromBackend();
