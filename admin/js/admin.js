const API_URL = "http://localhost:5000";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch(`${API_URL}/api/admin/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                loginMessage.textContent = result.message || "Erreur de connexion";
                return;
            }

            localStorage.setItem("adminToken", result.token);

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error(error);
            loginMessage.textContent = "Erreur serveur";
        }
    });
}

const dashboardStats = document.getElementById("dashboardStats");

async function loadDashboard() {
    if (!dashboardStats) return;

    const token = localStorage.getItem("adminToken");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const stats = await response.json();

        if (!response.ok) {
            localStorage.removeItem("adminToken");
            window.location.href = "login.html";
            return;
        }

        dashboardStats.innerHTML = `
      <ul>
        <li>RDV aujourd'hui: ${stats.todayAppointments}</li>
        <li>RDV cette semaine: ${stats.weekAppointments}</li>
        <li>Nouveaux messages: ${stats.newMessages}</li>
        <li>Services actifs: ${stats.activeServices}</li>
        <li>FAQ actives: ${stats.activeFaqs}</li>
        <li>Certificats actifs: ${stats.activeCertificates}</li>
        <li>Clients bloqués: ${stats.blockedClients}</li>
      </ul>
    `;
    } catch (error) {
        console.error(error);
        dashboardStats.textContent = "Erreur serveur";
    }
}

loadDashboard();

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminToken");
        window.location.href = "login.html";
    });
}

const appointmentsList = document.getElementById("appointmentsList");
const historyAppointments = document.getElementById("historyAppointments");
const historyToggle = document.getElementById("historyToggle");

if (historyToggle && historyAppointments) {

    historyAppointments.style.display = "none";

    historyToggle.addEventListener("click", () => {

        if (historyAppointments.style.display === "none") {

            historyAppointments.style.display = "block";
            historyToggle.textContent =
                "Historique des rendez-vous ▲";

        } else {

            historyAppointments.style.display = "none";
            historyToggle.textContent =
                "Historique des rendez-vous ▼";

        }

    });
}

async function loadAppointments() {
    if (!appointmentsList) return;

    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/api/appointments/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const appointments = await response.json();
        const activeAppointments = appointments.filter(
            (rdv) =>
                rdv.status !== "completed" &&
                rdv.status !== "cancelled" &&
                rdv.status !== "no_show"
        );

        const historyRdvs = appointments.filter(
            (rdv) =>
                rdv.status === "completed" ||
                rdv.status === "cancelled" ||
                rdv.status === "no_show"
        );

        if (!response.ok) {
            appointmentsList.textContent = "Impossible de charger les RDV";
            return;
        }

        if (!activeAppointments.length) {
            appointmentsList.textContent =
                "Aucun rendez-vous actif pour le moment.";
        } else {

            appointmentsList.innerHTML =
                activeAppointments.map((rdv) => `
        <div style="border:1px solid #ddd; padding:12px; margin:10px 0;">
            <strong>${rdv.client_name}</strong><br>

            ${rdv.service_title}<br>
${rdv.notes ? `Note: ${rdv.notes}<br>` : ""}
           ${formatAdminDate(rdv.appointment_date)} à ${formatAdminTime(rdv.appointment_time)}<br>

            Statut:
            <strong>${getStatusLabel(rdv.status)}</strong>
            <br><br>
            <button onclick="editAppointment(${rdv.id})"> Modifier </button>

            <button onclick="updateAppointmentStatus(${rdv.id}, 'confirmed')">
                Confirmer
            </button>

            <button onclick="updateAppointmentStatus(${rdv.id}, 'cancelled')">
                Annuler
            </button>

            <button onclick="updateAppointmentStatus(${rdv.id}, 'completed')">
                Terminé
            </button>

            <button onclick="updateAppointmentStatus(${rdv.id}, 'no_show')">
                Absent
            </button>
        </div>
    `).join("");

        }

        if (historyAppointments) {

            historyAppointments.innerHTML =
                historyRdvs.map((rdv) => `
        <div style="border:1px solid #ccc;
                    padding:12px;
                    margin:10px 0;
                    background:#f8f8f8;">

            <strong>${rdv.client_name}</strong><br>

            ${rdv.service_title}<br>
${rdv.notes ? `Note: ${rdv.notes}<br>` : ""}
           ${formatAdminDate(rdv.appointment_date)} à ${formatAdminTime(rdv.appointment_time)}<br>

            Statut:
            <strong>${getStatusLabel(rdv.status)}</strong>

        </div>
    `).join("");

        }

    } catch (error) {
        console.error(error);
        appointmentsList.textContent = "Erreur serveur";
    }
}

async function updateAppointmentStatus(id, status) {
    const token = localStorage.getItem("adminToken");

    let reason = "";

    if (status === "cancelled") {
        reason = prompt("Raison de l'annulation") || "";
    }

    try {
        const response = await fetch(`${API_URL}/api/appointments/${id}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                status,
                reason
            })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Erreur modification statut");
            return;
        }

        loadAppointments();
        loadDashboard();

    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}

function getStatusLabel(status) {
    const labels = {
        pending: "En attente",
        confirmed: "Confirmé",
        cancelled: "Annulé",
        completed: "Terminé",
        no_show: "Absent"
    };

    return labels[status] || status;
}
function formatAdminDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    return date.toLocaleDateString("fr-FR", {
        timeZone: "Europe/Paris",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}

function formatAdminTime(timeValue) {
    if (!timeValue) return "-";

    return timeValue.toString().slice(0, 5).replace(":", "h");
}

function formatDateForInput(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
loadAppointments();


const contactMessagesList = document.getElementById("contactMessagesList");

async function loadContactMessages() {
    if (!contactMessagesList) return;

    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/api/contact/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const messages = await response.json();

        if (!response.ok) {
            contactMessagesList.textContent = "Impossible de charger les messages";
            return;
        }

        if (!messages.length) {
            contactMessagesList.textContent = "Aucun message pour le moment.";
            return;
        }

        contactMessagesList.innerHTML = messages.map((msg) => `
      <div style="border:1px solid #ddd; padding:12px; margin:10px 0;">
        <strong>${msg.name}</strong><br>
        Email: ${msg.email}<br>
        Téléphone: ${msg.phone || "-"}<br>
        Sujet: ${msg.subject || "-"}<br>
        Message: ${msg.message}<br>
        Statut: ${msg.status}<br><br>

        <button onclick="deleteContactMessage(${msg.id})">
          Supprimer
        </button>
      </div>
    `).join("");

    } catch (error) {
        console.error(error);
        contactMessagesList.textContent = "Erreur serveur";
    }
}

async function deleteContactMessage(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Supprimer ce message ?")) return;

    try {
        const response = await fetch(`${API_URL}/api/contact/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.ok) {
            loadContactMessages();
        } else {
            alert("Erreur suppression message");
        }
    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}

loadContactMessages();

const serviceForm = document.getElementById("serviceForm");
const servicesList = document.getElementById("servicesList");

if (serviceForm) {
    serviceForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        const data = {
            title: document.getElementById("serviceTitle").value,
            category: document.getElementById("serviceCategory").value,
            duration_minutes: Number(document.getElementById("serviceDuration").value),
            price: Number(document.getElementById("servicePrice").value),
            short_description: document.getElementById("serviceDescription").value,
            full_description: document.getElementById("serviceDescription").value,
            is_active: true,
            sort_order: 0
        };

        const response = await fetch(`${API_URL}/api/services`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            serviceForm.reset();
            loadServices();
        } else {
            alert("Erreur création service");
        }
    });
}

async function loadServices() {
    if (!servicesList) return;

    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/services/admin`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const services = await response.json();

    servicesList.innerHTML = services.map((service) => `
    <div style="border:1px solid #ddd; padding:12px; margin:10px 0;">
      <strong>${service.title}</strong><br>
      Catégorie: ${service.category}<br>
      Durée: ${service.duration_minutes} min<br>
      Prix: ${service.price} €<br>
      Actif: ${service.is_active ? "Oui" : "Non"}<br><br>

      <button onclick="editService(${service.id})">Modifier</button>
<button onclick="deleteService(${service.id})">Supprimer</button>
    </div>
  `).join("");
}

async function deleteService(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Supprimer ce service ?")) return;

    const response = await fetch(`${API_URL}/api/services/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        loadServices();
    } else {
        alert("Erreur suppression service");
    }
}

loadServices();

async function editService(id) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/services/admin`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const services = await response.json();
    const service = services.find((item) => item.id === id);

    if (!service) {
        alert("Service introuvable");
        return;
    }

    const title = prompt("Nom du service", service.title);
    if (title === null) return;

    const category = prompt("Catégorie", service.category);
    if (category === null) return;

    const duration = prompt("Durée en minutes", service.duration_minutes);
    if (duration === null) return;

    const price = prompt("Prix", service.price);
    if (price === null) return;

    const description = prompt(
        "Description",
        service.short_description || ""
    );
    if (description === null) return;

    const updateResponse = await fetch(`${API_URL}/api/services/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            title,
            category,
            duration_minutes: Number(duration),
            price: Number(price),
            short_description: description,
            full_description: description,
            image_url: service.image_url || "",
            is_popular: Boolean(service.is_popular),
            is_active: Boolean(service.is_active),
            sort_order: service.sort_order || 0
        })
    });

    if (updateResponse.ok) {
        loadServices();
    } else {
        alert("Erreur modification service");
    }
}
async function editAppointment(id) {
    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/api/appointments/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const appointments = await response.json();

        const rdv = appointments.find((item) => item.id === id);

        if (!rdv) {
            alert("Rendez-vous introuvable");
            return;
        }

        const clientName = prompt("Nom du client", rdv.client_name);
        if (clientName === null) return;

        const clientEmail = prompt("Email du client", rdv.client_email);
        if (clientEmail === null) return;

        const clientPhone = prompt("Téléphone du client", rdv.client_phone || "");
        if (clientPhone === null) return;

        const serviceTitle = prompt("Prestation", rdv.service_title);
        if (serviceTitle === null) return;

        const appointmentDate = prompt(
            "Date du RDV au format YYYY-MM-DD",
            formatDateForInput(rdv.appointment_date)
        );
        if (appointmentDate === null) return;

        const appointmentTime = prompt(
            "Heure du RDV au format HH:MM:SS",
            rdv.appointment_time
        );
        if (appointmentTime === null) return;

        const durationMinutes = prompt(
            "Durée en minutes",
            rdv.duration_minutes || 60
        );
        if (durationMinutes === null) return;

        const notes = prompt("Notes", rdv.notes || "");
        if (notes === null) return;

        const updateResponse = await fetch(`${API_URL}/api/appointments/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                client_name: clientName,
                client_email: clientEmail,
                client_phone: clientPhone,
                service_id: rdv.service_id || null,
                service_title: serviceTitle,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                duration_minutes: Number(durationMinutes),
                status: rdv.status || "confirmed",
                source: rdv.source || "admin",
                notes,
                admin_notes: rdv.admin_notes || null
            })
        });

        const result = await updateResponse.json();

        if (!updateResponse.ok) {
            alert(result.message || "Erreur modification RDV");
            return;
        }

        alert("Rendez-vous modifié");
        loadAppointments();
        loadDashboard();

    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}

// blockedClient
const blockedClientForm = document.getElementById("blockedClientForm");
const blockedClientsList = document.getElementById("blockedClientsList");
const blockedClientsToggle = document.getElementById("blockedClientsToggle");
const blockedClientsContent = document.getElementById("blockedClientsContent");

if (blockedClientsToggle && blockedClientsContent) {
    blockedClientsContent.style.display = "none";

    blockedClientsToggle.onclick = () => {
        const isClosed = blockedClientsContent.style.display === "none";

        blockedClientsContent.style.display = isClosed ? "block" : "none";
        blockedClientsToggle.textContent = isClosed
            ? "Clients bloqués ▲"
            : "Clients bloqués ▼";
    };
}

if (blockedClientForm) {
    blockedClientForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        const email = document.getElementById("blockedClientEmail").value.trim();
        const phone = document.getElementById("blockedClientPhone").value.trim();
        const reason = document.getElementById("blockedClientReason").value.trim();

        if (!email && !phone) {
            alert("Merci d'indiquer au moins un email ou un téléphone.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/blocked-clients`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    client_email: email || null,
                    client_phone: phone || null,
                    reason: reason || null,
                    is_active: true
                })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Erreur blocage client");
                return;
            }

            blockedClientForm.reset();

            await loadBlockedClients();

            if (blockedClientsContent && blockedClientsToggle) {
                blockedClientsContent.style.display = "block";
                blockedClientsToggle.textContent = "Clients bloqués ▲";
            }

            loadDashboard();

        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    });
}

async function loadBlockedClients() {
    if (!blockedClientsList) return;

    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/api/blocked-clients/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const clients = await response.json();

        if (!response.ok) {
            blockedClientsList.textContent =
                "Impossible de charger les clients bloqués.";
            return;
        }

        if (!clients.length) {
            blockedClientsList.textContent = "Aucun client bloqué.";
            return;
        }

        blockedClientsList.innerHTML = clients.map((client) => `
            <div style="
                border:1px solid #ddd;
                padding:12px;
                margin:10px 0;
                border-radius:8px;
                background:#fafafa;
            ">
                <strong>${client.client_email || "-"}</strong><br>
                Téléphone: ${client.client_phone || "-"}<br>
                Raison: ${client.reason || "-"}<br>
                Actif: ${client.is_active ? "Oui" : "Non"}<br><br>

                <button onclick="unblockClient(${client.id})">
                    Débloquer
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error(error);
        blockedClientsList.textContent = "Erreur serveur";
    }
}

async function unblockClient(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Débloquer ce client ?")) return;

    try {
        const response = await fetch(`${API_URL}/api/blocked-clients/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Erreur déblocage client");
            return;
        }

        await loadBlockedClients();
        loadDashboard();

    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}

loadBlockedClients();