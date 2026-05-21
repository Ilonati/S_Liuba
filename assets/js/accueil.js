
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
// P animation
function wrapWords(element) {
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
        }

        else if (node.nodeType === 1) {
            wrapWords(node);
        }
    });
}
wrapWords(document.getElementById("beauty-text"));

// FAQ toggle
const faqs = [
    {
        question: "Comment prendre rendez-vous ?",
        answer: "Vous pouvez réserver un rendez-vous sur le site ou simplement en appelant le 0783714349."
    },
    {
        question: "Est-il nécessaire de faire une consultation préalable ?",
        answer: "Oui, il est possible de réserver une consultation  de 30 minutes. Cela permet de répondre à vos questions, d’évaluer vos besoins et de choisir ensemble la meilleure solution pour vous."
    },
    {
        question: "Quelles mesures d’hygiène et de stérilisation utilisez-vous ?",
        answer: "J’utilise uniquement des matériaux certifiés et conformes aux normes d’hygiène. De plus, j’ai suivi une formation en désinfection et stérilisation à Tarbes, afin de garantir à mes clientes un maximum de sécurité et de qualité."
    },
    {
        question: "Quels sont les tarifs et proposez-vous des forfaits ou réductions ?",
        answer: "Les tarifs sont indiqués directement sur le site."
    },
    {
        question: "Quelles techniques de maquillage permanent utilisez-vous ?",
        answer: "J’utilise différentes techniques adaptées aux besoins de chaque cliente : • Sourcils : technique poudrée et technique poil par poil naturel • Lèvres : technique aquarelle et technique « rouge à lèvres mat » • Yeux : technique poudrée avec effet « ras de cils poudré » et technique classic « ras de cils classic »."
    },
    {
        question: "Faut-il une retouche après la première séance ?",
        answer: "Faut-il une retouche après la première séance ? Oui, la retouche est obligatoire pour le maquillage permanent des sourcils et des yeux. Pour le maquillage permanent des lèvres, la retouche n’est pas indispensable — elle est proposée uniquement si vous souhaitez intensifier la couleur."
    },
    {
        question: "Puis-je faire un maquillage permanent si j’ai des allergies ?",
        answer: "Puis-je faire un maquillage permanent si j’ai des allergies ? Non.Les allergies constituent une contre- indication absolue à la procédure. Lors de la consultation, j’explique en détail quelles sont les contre - indications absolues et quels risques éventuels peuvent exister."
    },
    {
        question: "Quels sont les risques du maquillage permanent ?",
        answer: "Quels sont les risques du maquillage permanent ? Comme pour toute procédure esthétique, il peut exister certains risques : rougeurs temporaires, légers gonflements ou petites croûtes pendant la cicatrisation. Ces effets sont généralement passagers. Grâce à l’utilisation de matériels certifiés, de techniques modernes et au respect strict des règles d’hygiène, les risques sont minimisés. Lors de la consultation, j’informe toujours mes clientes sur les précautions à prendre et les éventuelles contre-indications."
    },
    {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer: "Le règlement peut se faire par carte bancaire ou espèces . Les chèques ne sont pas acceptés. Pour réserver un rendez-vous de maquillage permanent, un acompte de 50 € est obligatoire. Ce montant sera ensuite déduit du prix total de la prestation."
    }
];

const faqList = document.getElementById("faqList");


faqs.forEach((faq) => {
    const item = document.createElement("div");
    item.classList.add("faq-item");

    const question = document.createElement("div");
    question.classList.add("faq-question");
    question.innerHTML = `
    <span>${faq.question}</span>
    <span class="faq-icon">▶</span>
  `;

    const answer = document.createElement("div");
    answer.classList.add("faq-answer");
    answer.innerText = faq.answer;

    question.addEventListener("click", () => {
        const isOpen = answer.classList.contains("open");
        document.querySelectorAll(".faq-answer").forEach(a => a.classList.remove("open"));
        document.querySelectorAll(".faq-icon").forEach(icon => icon.classList.remove("open"));

        if (!isOpen) {
            answer.classList.add("open");
            question.querySelector(".faq-icon").classList.add("open");
        }
    });

    item.appendChild(question);
    item.appendChild(answer);
    faqList.appendChild(item);
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

//pour charger la page //
window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

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




