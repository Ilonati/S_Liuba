// Google Translate
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

let selectedService = 'Massage détente';
let selectedPrice = '60 €';

serviceOptions.forEach((option) => {
    option.addEventListener('click', () => {
        serviceOptions.forEach((item) => item.classList.remove('selected'));

        option.classList.add('selected');

        selectedService = option.dataset.service || 'Service non précisé';
        selectedPrice = option.dataset.price || 'Prix non précisé';
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

        const isPast = date < todayStart;
        const isTuesday = date.getDay() === 2;

        const isSelected =
            selectedDate &&
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();

        if (isPast || isTuesday) {
            button.classList.add('disabled');
            button.disabled = true;
        }

        if (isSelected) {
            button.classList.add('selected');
        }

        button.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
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

// Time selection
const timeButtons = document.querySelectorAll('.time-btn');
let selectedTime = '';

const defaultSelectedTime = document.querySelector('.time-btn.selected');

if (defaultSelectedTime) {
    selectedTime = defaultSelectedTime.textContent.trim();
}

timeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        timeButtons.forEach((item) => item.classList.remove('selected'));

        button.classList.add('selected');
        selectedTime = button.textContent.trim();
    });
});

// Form + WhatsApp
const bookingForm = document.getElementById('bookingForm');
const successMessage = document.getElementById('successMessage');

if (bookingForm && successMessage) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName').value.trim();
        const phone = document.getElementById('clientPhone').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        const message = document.getElementById('clientMessage').value.trim();

        if (!name || !phone) {
            successMessage.classList.add('show');
            successMessage.innerHTML = 'Merci de remplir votre nom et votre téléphone.';
            return;
        }

        if (!selectedTime) {
            successMessage.classList.add('show');
            successMessage.innerHTML = 'Merci de choisir une heure de rendez-vous.';
            return;
        }

        const formattedDate = selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const whatsappText = encodeURIComponent(
            `Bonjour, je souhaite réserver un rendez-vous.\n\n` +
            `Service : ${selectedService}\n` +
            `Prix : ${selectedPrice}\n` +
            `Date : ${formattedDate}\n` +
            `Heure : ${selectedTime}\n\n` +
            `Nom : ${name}\n` +
            `Téléphone : ${phone}\n` +
            `Email : ${email || 'Non renseigné'}\n` +
            `Message : ${message || 'Aucun message'}`
        );

        successMessage.classList.add('show');
        successMessage.innerHTML = `
            Merci ${name} ✨ Votre demande est prête.<br><br>
            <a href="https://wa.me/33783714349?text=${whatsappText}" 
               target="_blank" 
               rel="noopener" 
               style="color:#a8752d;font-weight:800;">
                Envoyer la demande sur WhatsApp
            </a>
        `;
    });
}