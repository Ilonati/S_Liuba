// Google Translate
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://sliuba-production.up.railway.app";

function googleTranslateElementInit() {
    if (window.google && google.translate) {
        new google.translate.TranslateElement({
            pageLanguage: 'fr'
        }, 'google_translate_element');
    }
}

// Translate menu
const translateBtn = document.getElementById('translateBtn');
const translateMenu = document.getElementById('translateMenu');

if (translateBtn && translateMenu) {
    translateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        translateMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.translate-widget')) {
            translateMenu.classList.add('hidden');
        }
    });
}

function changeLang(lang) {
    const select = document.querySelector('.goog-te-combo');

    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
    }

    if (translateMenu) {
        translateMenu.classList.add('hidden');
    }
}

// Burger menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

if (burger && nav) {
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
        burger.textContent = nav.classList.contains('active') ? '✖' : '☰';
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            burger.textContent = '☰';
        });
    });
}

// Reveal animation
function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach((item) => {
        const revealTop = item.getBoundingClientRect().top;

        if (revealTop < window.innerHeight - 150) {
            item.classList.add('active');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// Scroll button
const scrollBtn = document.getElementById('scrollTopBtn');

if (scrollBtn) {
    window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('show', window.scrollY > 400);
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Service selection
const serviceOptions = document.querySelectorAll('.service-option');

let selectedService = '';
let selectedPrice = '';
let selectedDuration = null;
let selectedServiceId = null;
function getDurationFromOption(option) {
    if (option.dataset.duration) {
        return Number(option.dataset.duration) || 60;
    }

    const text = option.textContent;

    const hoursMinutes = text.match(/(\d+)h\s*(\d+)/i);
    if (hoursMinutes) {
        return Number(hoursMinutes[1]) * 60 + Number(hoursMinutes[2]);
    }

    const hours = text.match(/(\d+)h/i);
    if (hours) {
        return Number(hours[1]) * 60;
    }

    const minutes = text.match(/(\d+)\s*min/i);
    if (minutes) {
        return Number(minutes[1]);
    }

    return 60;
}
serviceOptions.forEach((option) => {
    option.addEventListener('click', () => {
        serviceOptions.forEach((item) => item.classList.remove('selected'));

        option.classList.add('selected');

        selectedService = option.dataset.service || 'Service non précisé';
        selectedPrice = option.dataset.price || 'Prix non précisé';
        selectedDuration = getDurationFromOption(option);
        selectedServiceId = option.dataset.serviceId || null;

        loadAvailableSlots();
    });
});

// Calendar
const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const calendarMonth = document.getElementById('calendarMonth');
const calendarGrid = document.getElementById('calendarGrid');
const prevMonth = document.getElementById('prevMonth');
const nextMonth = document.getElementById('nextMonth');

const today = new Date();

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

function renderCalendar() {
    if (!calendarMonth || !calendarGrid) return;

    calendarGrid.innerHTML = '';
    calendarMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    weekdays.forEach((day) => {
        const weekday = document.createElement('div');
        weekday.className = 'weekday';
        weekday.textContent = day;
        calendarGrid.appendChild(weekday);
    });

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startIndex = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < startIndex; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'day';
        button.textContent = day;

        const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        //добавляем  день недели который отключаем
        const isPast = date < todayStart;
        // const isTuesday = date.getDay() === 2;
        const isSunday = date.getDay() === 0;

        const isSelected =
            selectedDate &&
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
        //меняем день недели 
        if (isPast || isSunday) {
            button.classList.add('disabled');
            button.disabled = true;
        }

        if (isSelected) {
            button.classList.add('selected');
        }

        button.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            loadAvailableSlots();
        });

        calendarGrid.appendChild(button);
    }
}

if (prevMonth) {
    prevMonth.addEventListener('click', () => {
        const previous = new Date(currentYear, currentMonth - 1, 1);
        const currentStart = new Date(today.getFullYear(), today.getMonth(), 1);

        if (previous >= currentStart) {
            currentMonth--;

            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }

            renderCalendar();
        }
    });
}

if (nextMonth) {
    nextMonth.addEventListener('click', () => {
        currentMonth++;

        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }

        renderCalendar();
    });
}

renderCalendar();

// Time selection from backend
const timeGrid = document.getElementById('timeGrid');
let selectedTime = '';

function formatSlotForDisplay(slot) {
    return slot.slice(0, 5);
}

async function loadAvailableSlots() {
    if (!timeGrid || !selectedDate) return;

    if (!selectedService || !selectedDuration) {
        timeGrid.innerHTML = `
            <p class="closed-message">
                Choisissez d’abord une prestation pour voir les horaires disponibles.
            </p>
        `;
        selectedTime = "";
        return;
    }

    const dateForApi = formatDateForApi(selectedDate);

    try {
        const response = await fetch(
            `${API_URL}/api/slots?date=${dateForApi}&duration=${selectedDuration}`
        );

        const result = await response.json();

        timeGrid.innerHTML = "";
        selectedTime = "";

        if (result.closed) {
            timeGrid.innerHTML = `
                <p class="closed-message">
                    ${result.message || "Institut fermé ce jour-là."}
                </p>
            `;
            return;
        }

        if (!result.slots || result.slots.length === 0) {
            timeGrid.innerHTML = `
                <p class="closed-message">
                    Aucun créneau disponible ce jour-là.
                </p>
            `;
            return;
        }

        result.slots.forEach((slot) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "time-btn";
            button.textContent = formatSlotForDisplay(slot);

            button.addEventListener("click", () => {
                document
                    .querySelectorAll(".time-btn")
                    .forEach((item) => item.classList.remove("selected"));

                button.classList.add("selected");
                selectedTime = button.textContent.trim();
            });

            timeGrid.appendChild(button);
        });
    } catch (error) {
        console.error("Erreur slots:", error);
        timeGrid.innerHTML = `
            <p class="closed-message">
                Impossible de charger les créneaux.
            </p>
        `;
    }
}
loadAvailableSlots();
// Form + Backend RDV
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');
let isBookingSubmissionInProgress = false;

function formatDateForApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatTimeForApi(time) {
    if (!time) return "";
    return `${time}:00`;
}

if (bookingForm && successMessage) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isBookingSubmissionInProgress) return;

        const name = document.getElementById('clientName').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const message = document.getElementById('clientMessage').value.trim();

        if (!name || !phone || !email) {
            successMessage.classList.add('show');
            successMessage.innerHTML = 'Merci de remplir votre nom, téléphone et email.';
            return;
        }

        if (!selectedService || !selectedTime || !selectedDate) {
            successMessage.classList.add('show');
            successMessage.innerHTML = 'Merci de choisir une prestation, une date et une heure.';
            return;
        }

        const appointmentData = {
            client_name: name,
            client_email: email,
            client_phone: phone,
            service_id: selectedServiceId,
            service_title: selectedService,
            appointment_date: formatDateForApi(selectedDate),
            appointment_time: formatTimeForApi(selectedTime),
            duration_minutes: selectedDuration,
            source: "client",
            notes: message
        };

        const submitButton = bookingForm.querySelector('[type="submit"]');
        isBookingSubmissionInProgress = true;
        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(`${API_URL}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(appointmentData)
            });

            const result = await response.json();

            successMessage.classList.add('show');

            if (response.ok) {
                successMessage.innerHTML = `
                    Merci ${name} ✨<br> Votre rendez-vous a bien été réservé.<br>
                     Un email de confirmation vous a été envoyé.<br>

    ✨Si vous souhaitez modifier ou annuler votre rendez-vous,
    merci de nous contacter via la page Contact du site
    en sélectionnant le sujet :<br>
    <strong>« Annulation RDV »</strong>.<br>
    Je vous répondrons dans les meilleurs délais.
                `;
                bookingForm.reset();
                await loadAvailableSlots();
            } else {
                successMessage.innerHTML =
                    result.message || "Impossible de réserver ce rendez-vous.";

                if (response.status === 409) {
                    await loadAvailableSlots();
                }
            }

        } catch (error) {
            console.error("Erreur RDV:", error);
            successMessage.classList.add('show');
            successMessage.innerHTML = "Erreur serveur. Merci de réessayer plus tard.";
        } finally {
            isBookingSubmissionInProgress = false;
            if (submitButton) submitButton.disabled = false;
        }
    });
}
// Service category accordion
function initServiceCategoryAccordion() {
    const categories = document.querySelectorAll('.service-category');

    categories.forEach((category) => {
        const header = category.querySelector('.service-category-header');
        const content = category.querySelector('.service-category-content');

        if (!header || !content) return;

        if (category.classList.contains('active')) {
            content.style.height = content.scrollHeight + 'px';
        } else {
            content.style.height = '0';
        }

        header.onclick = () => {
            const isOpen = category.classList.contains('active');

            categories.forEach((item) => {
                const itemContent = item.querySelector('.service-category-content');

                item.classList.remove('active');

                if (itemContent) {
                    itemContent.style.height = '0';
                }
            });

            if (!isOpen) {
                category.classList.add('active');
                content.style.height = content.scrollHeight + 'px';
            }
        };
    });
}


initServiceCategoryAccordion();

async function loadServicesForBookingFromBackend() {
    const serviceList = document.querySelector(".service-list");

    if (!serviceList) return;

    try {
        const response = await fetch(`${API_URL}/api/services`);

        if (!response.ok) {
            throw new Error("Erreur API services");
        }

        const services = await response.json();

        if (!services.length) return;

        const backendCategory = document.createElement("div");
        backendCategory.classList.add("service-category");

        backendCategory.innerHTML = `
            <button type="button" class="service-category-header">
                <span>Nouveautés / Services ajoutés</span>
                <span class="category-arrow">▼</span>
            </button>

            <div class="service-category-content"></div>
        `;

        const content = backendCategory.querySelector(".service-category-content");

        services.forEach((service) => {
            const option = document.createElement("div");
            option.classList.add("service-option");

            option.dataset.service = service.title;
            option.dataset.price = service.price ? `${service.price} €` : "Sur devis";
            option.dataset.duration = service.duration_minutes || 60;
            option.dataset.serviceId = service.id;

            option.innerHTML = `
                <img src="${service.image_url || "images/photos/massage (1).jpg"}" alt="${service.title}">
                <div>
                    <h3>${service.title}</h3>
                  ${service.notes ? `<strong>Note:</strong> ${service.notes}<br>` : ""}
                    <p>${service.short_description || service.category || ""}</p>
                    <strong>${service.duration_minutes || "-"} min · ${service.price || "Sur devis"} €</strong>
                </div>
                <div class="radio-dot"></div>
            `;

            option.addEventListener("click", () => {
                document
                    .querySelectorAll(".service-option")
                    .forEach((item) => item.classList.remove("selected"));

                option.classList.add("selected");

                selectedService = option.dataset.service || "Service non précisé";
                selectedPrice = option.dataset.price || "Prix non précisé";
            });

            content.appendChild(option);
        });

        serviceList.appendChild(backendCategory);

        initServiceCategoryAccordion();

    } catch (error) {
        console.error("Erreur services RDV:", error);
    }
}

// loadServicesForBookingFromBackend();

function findCategoryContentByTitle(categoryTitle) {
    const categories = document.querySelectorAll(".service-category");

    for (const category of categories) {
        const title = category
            .querySelector(".service-category-header span")
            ?.textContent
            .trim()
            .toLowerCase();

        if (title === categoryTitle.toLowerCase()) {
            return category.querySelector(".service-category-content");
        }
    }

    return null;
}

function getFrontendCategoryName(backendCategory) {
    const map = {
        "Massage": "Massages",
        "Maquillage Permanent": "Maquillage permanent - Sourcils",
        "Épilation Femmes": "Épilation Femmes",
        "Épilation Hommes": "Épilation Hommes",
        "Cils": "Extensions de cils",
        "Soin du visage": "Soins du visage, cils et teinture"
    };

    return map[backendCategory] || null;
}

function getOrCreateCategoryContent(categoryTitle) {
    const existingContent = findCategoryContentByTitle(categoryTitle);
    if (existingContent) return existingContent;

    const serviceList = document.querySelector(".service-list");
    if (!serviceList) return null;

    const category = document.createElement("div");
    category.className = "service-category";
    category.innerHTML = `
        <button type="button" class="service-category-header">
            <span>${categoryTitle}</span>
            <span class="category-arrow">▼</span>
        </button>
        <div class="service-category-content"></div>
    `;
    serviceList.appendChild(category);

    return category.querySelector(".service-category-content");
}

function createBookingServiceOption(service) {
    const option = document.createElement("div");
    option.classList.add("service-option");

    option.dataset.service = service.title;
    option.dataset.price = service.price ? `${service.price} €` : "Sur devis";
    option.dataset.duration = service.duration_minutes || 60;
    option.dataset.serviceId = service.id;

    option.innerHTML = `
    <img src="${service.image_url || "images/photos/massage (1).jpg"}" alt="${service.title}">
    <div>
        <h3>${service.title}</h3>
        ${service.notes ? `<strong>Note:</strong> ${service.notes}<br>` : ""}
        <p>${service.short_description || service.category || ""}</p>

        <strong>${service.duration_minutes || "-"} min · ${service.price || "Sur devis"} €</strong>
    </div>
    <div class="radio-dot"></div>
`;

    option.addEventListener("click", () => {
        document
            .querySelectorAll(".service-option")
            .forEach((item) => item.classList.remove("selected"));

        option.classList.add("selected");

        selectedService = option.dataset.service || "Service non précisé";
        selectedPrice = option.dataset.price || "Prix non précisé";
        selectedDuration = getDurationFromOption(option);
        selectedServiceId = option.dataset.serviceId || null;
        loadAvailableSlots();
    });

    return option;
}

async function loadServicesIntoExistingCategories() {
    try {
        const response = await fetch(`${API_URL}/api/services`);

        if (!response.ok) {
            throw new Error("Erreur API services");
        }

        const services = await response.json();

        services.forEach((service) => {
            const frontendCategory =
                getFrontendCategoryName(service.category) ||
                service.category ||
                "Autres prestations";

            const categoryContent = getOrCreateCategoryContent(frontendCategory);

            if (!categoryContent) return;

            const option = createBookingServiceOption(service);
            categoryContent.appendChild(option);
        });

        initServiceCategoryAccordion();

    } catch (error) {
        console.error("Erreur services RDV:", error);
    }
}

function normalizeServiceName(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/gi, " ")
        .trim()
        .toLowerCase();
}

function selectServiceFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const serviceFromUrl = params.get("service");
    const serviceIdFromUrl = params.get("serviceId");

    if (!serviceFromUrl && !serviceIdFromUrl) return;

    const options = document.querySelectorAll(".service-option");
    const normalizedRequestedService = normalizeServiceName(serviceFromUrl);

    for (const option of options) {
        const matchesId = serviceIdFromUrl &&
            option.dataset.serviceId === serviceIdFromUrl;
        const matchesName = serviceFromUrl &&
            normalizeServiceName(option.dataset.service) === normalizedRequestedService;

        if (matchesId || matchesName) {

            document
                .querySelectorAll(".service-option")
                .forEach((item) => item.classList.remove("selected"));

            option.classList.add("selected");

            selectedService = option.dataset.service;
            selectedPrice = option.dataset.price;
            selectedDuration = getDurationFromOption(option);
            selectedServiceId = option.dataset.serviceId || null;
            loadAvailableSlots();

            const category = option.closest(".service-category");
            const content = category?.querySelector(".service-category-content");

            if (category && content) {
                category.classList.add("active");
                content.style.height = content.scrollHeight + "px";
            }

            option.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            break;
        }
    }
}

loadServicesIntoExistingCategories().then(selectServiceFromUrl);
