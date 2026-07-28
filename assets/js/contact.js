const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://sliuba-production.up.railway.app";

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
// scroll 
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

// formulaire 
const contactForm = document.getElementById("contactForm");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");

if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const initialButtonText = submitButton ? submitButton.textContent : "Envoyer";

        if (submitButton?.disabled) return;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Envoi en cours…";
            submitButton.setAttribute("aria-busy", "true");
        }

        const name = document.getElementById("name").value.trim();
        const prenom = document.getElementById("prenom").value.trim();
        const email = document.getElementById("email").value.trim();
        const telephone = document.getElementById("telephone").value.trim();
        const subject = document.getElementById("subject").value;
        const message = document.getElementById("message").value.trim();

        const formData = {
            name: `${name} ${prenom}`,
            email: email,
            phone: telephone,
            subject: subject,
            message: message
        };

        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const responseText = await response.text();
            let result = {};

            if (responseText) {
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.warn("Réponse non JSON reçue:", parseError);
                }
            }

            if (response.ok) {
                contactForm.reset();

                if (successModal) {
                    successModal.classList.add("show");
                    successModal.setAttribute("aria-hidden", "false");
                    document.body.classList.add("modal-open");
                    closeModal?.focus();
                } else {
                    alert("Merci ! Votre message a bien été envoyé.");
                }
            } else {
                alert(result.message || "Erreur. Impossible d'envoyer votre message.");
            }

        } catch (error) {
            console.error("Erreur:", error);
            alert("Une erreur est survenue. Veuillez vérifier votre connexion et réessayer.");
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = initialButtonText;
                submitButton.removeAttribute("aria-busy");
            }
        }
    });
}

function hideSuccessModal() {
    if (!successModal) return;
    successModal.classList.remove("show");
    successModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

if (closeModal) {
    closeModal.addEventListener("click", hideSuccessModal);
}

window.addEventListener("click", function (event) {
    if (event.target === successModal) {
        hideSuccessModal();
    }
});

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && successModal?.classList.contains("show")) {
        hideSuccessModal();
    }
});
