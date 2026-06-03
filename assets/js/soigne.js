

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

        if (title) {
            title.addEventListener('click', () => toggleMassage(bloc));
        }
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


