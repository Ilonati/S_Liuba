const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://sliuba-production.up.railway.app";

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
const businessStats = document.getElementById("businessStats");

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
        if (businessStats) {
            businessStats.innerHTML = `
        <div style="border:1px solid #ddd; padding:15px; margin:10px 0;">
            <p><strong>RDV ce mois:</strong> ${stats.monthAppointments}</p>
            <p><strong>RDV terminés:</strong> ${stats.completedAppointments}</p>
            <p><strong>RDV annulés:</strong> ${stats.cancelledAppointments}</p>
            <p><strong>Clients uniques:</strong> ${stats.uniqueClients}</p>
            <p><strong>Service le plus demandé:</strong> ${stats.topService} (${stats.topServiceCount})</p>
            <p><strong>Taux d’annulation:</strong> ${stats.cancellationRate}%</p>
        </div>
    `;
        }
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
const appointmentSearch = document.getElementById("appointmentSearch");
const clientFileBox = document.getElementById("clientFileBox");
const planningDate = document.getElementById("planningDate");
const dailyPlanning = document.getElementById("dailyPlanning");
const weekCalendarDate = document.getElementById("weekCalendarDate");
const weekCalendarToggle = document.getElementById("weekCalendarToggle");
const weekCalendarContent = document.getElementById("weekCalendarContent");
const weekCalendar = document.getElementById("weekCalendar");
const prevWeekBtn = document.getElementById("prevWeekBtn");
const nextWeekBtn = document.getElementById("nextWeekBtn");
let allAppointments = [];
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
if (weekCalendarToggle && weekCalendarContent) {

    weekCalendarContent.style.display = "none";

    weekCalendarToggle.addEventListener("click", () => {

        if (weekCalendarContent.style.display === "none") {

            weekCalendarContent.style.display = "block";

            weekCalendarToggle.textContent =
                "Calendrier semaine ▲";

        } else {

            weekCalendarContent.style.display = "none";

            weekCalendarToggle.textContent =
                "Calendrier semaine ▼";
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

        if (!response.ok) {
            appointmentsList.textContent = "Impossible de charger les RDV";
            return;
        }

        allAppointments = appointments;

        applyAppointmentSearch();
        renderDailyPlanning(planningDate ? planningDate.value : null);
        renderWeekCalendar(weekCalendarDate ? weekCalendarDate.value : null);
    } catch (error) {
        console.error(error);
        appointmentsList.textContent = "Erreur serveur";
    }
}

function renderAppointments(appointments) {
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

    if (!activeAppointments.length) {
        appointmentsList.textContent =
            "Aucun rendez-vous actif pour le moment.";
    } else {
        appointmentsList.innerHTML =
            activeAppointments.map((rdv) => `
                <div style="border:1px solid #ddd; padding:12px; margin:10px 0;">
                    <strong>${rdv.client_name}</strong><br>
                    ${rdv.service_title}<br>
                    Durée: <strong>${formatAdminDuration(rdv.duration_minutes)}</strong><br>
                    ${rdv.notes ? `<strong>Note:</strong> ${rdv.notes}<br>` : ""}
                    ${formatAdminDate(rdv.appointment_date)} à ${formatAdminTime(rdv.appointment_time)}<br>
                    Statut: <strong>${getStatusLabel(rdv.status)}</strong><br><br>

                    <button onclick="editAppointment(${rdv.id})">Modifier</button>
                    <button onclick="updateAppointmentStatus(${rdv.id}, 'confirmed')">Confirmer</button>
                    <button onclick="updateAppointmentStatus(${rdv.id}, 'cancelled')">Annuler</button>
                    <button onclick="updateAppointmentStatus(${rdv.id}, 'completed')">Terminé</button>
                    <button onclick="updateAppointmentStatus(${rdv.id}, 'no_show')">Absent</button>
                    <button onclick="showClientFile('${rdv.client_email}')">Fiche client</button>
                </div>
            `).join("");
    }

    if (historyAppointments) {
        if (!historyRdvs.length) {
            historyAppointments.textContent =
                "Aucun rendez-vous dans l'historique.";
        } else {
            historyAppointments.innerHTML =
                historyRdvs.map((rdv) => `
                    <div style="border:1px solid #ccc; padding:12px; margin:10px 0; background:#f8f8f8;">
                        <strong>${rdv.client_name}</strong><br>
                        ${rdv.service_title}<br>
                        Durée: <strong>${formatAdminDuration(rdv.duration_minutes)}</strong><br>
                        ${rdv.notes ? `<strong>Note:</strong> ${rdv.notes}<br>` : ""}
                        ${formatAdminDate(rdv.appointment_date)} à ${formatAdminTime(rdv.appointment_time)}<br>
                        Statut: <strong>${getStatusLabel(rdv.status)}</strong><br><br>

                        <button onclick="showClientFile('${rdv.client_email}')">Fiche client</button>
                    </div>
                `).join("");
        }
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

        await loadAppointments();
        loadDashboard();

        if (["completed", "cancelled", "no_show"].includes(status) && historyAppointments) {
            historyAppointments.style.display = "block";

            if (historyToggle) {
                historyToggle.textContent = "Historique des rendez-vous ▲";
            }
        }

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

function formatAdminDuration(durationValue) {
    const duration = Number(durationValue || 60);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (!hours) return `${minutes} min`;
    if (!minutes) return `${hours} h`;
    return `${hours} h ${minutes} min`;
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
      <button onclick="toggleService(${service.id}, ${Number(service.is_active) === 1 ? "false" : "true"})">
    ${Number(service.is_active) === 1 ? "Masquer" : "Afficher"}
</button>
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
async function toggleService(id, isActive) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/services/${id}/toggle`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            is_active: isActive
        })
    });

    if (response.ok) {
        loadServices();
        loadDashboard();
    } else {
        alert("Erreur affichage service");
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
            "Durée totale en minutes (préparation comprise)",
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

// blockedSlot

const blockedSlotForm = document.getElementById("blockedSlotForm");
const blockedSlotsList = document.getElementById("blockedSlotsList");
const blockedSlotsToggle = document.getElementById("blockedSlotsToggle");
const blockedSlotsContent = document.getElementById("blockedSlotsContent");

if (blockedSlotsToggle && blockedSlotsContent) {
    blockedSlotsContent.style.display = "none";

    blockedSlotsToggle.onclick = () => {
        const isClosed = blockedSlotsContent.style.display === "none";

        blockedSlotsContent.style.display = isClosed ? "block" : "none";
        blockedSlotsToggle.textContent = isClosed
            ? "Jours et horaires bloqués ▲"
            : "Jours et horaires bloqués ▼";
    };
}

function formatDateToApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getHoursRange(startTime, endTime) {
    if (!startTime && !endTime) return [null];

    if (startTime && !endTime) {
        return [`${startTime}:00`];
    }

    if (!startTime && endTime) {
        alert("Merci d'indiquer aussi l'heure début.");
        return null;
    }

    const startHour = Number(startTime.split(":")[0]);
    const endHour = Number(endTime.split(":")[0]);

    if (endHour < startHour) {
        alert("L'heure fin ne peut pas être avant l'heure début.");
        return null;
    }

    const hours = [];

    for (let hour = startHour; hour <= endHour; hour++) {
        hours.push(`${String(hour).padStart(2, "0")}:00:00`);
    }

    return hours;
}

if (blockedSlotForm) {
    blockedSlotForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        const startDateValue = document.getElementById("blockedStartDate").value;
        const endDateValue = document.getElementById("blockedEndDate").value;
        const startTime = document.getElementById("blockedStartTime").value;
        const endTime = document.getElementById("blockedEndTime").value;
        const reason = document.getElementById("blockedReason").value.trim();
        const message = document.getElementById("blockedMessage").value.trim();

        if (!startDateValue) {
            alert("Merci de choisir une date début.");
            return;
        }

        const startDate = new Date(startDateValue);
        const endDate = endDateValue ? new Date(endDateValue) : new Date(startDateValue);

        if (endDate < startDate) {
            alert("La date fin ne peut pas être avant la date début.");
            return;
        }

        const hoursToBlock = getHoursRange(startTime, endTime);

        if (!hoursToBlock) return;

        try {
            let currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const dateToBlock = formatDateToApi(currentDate);

                for (const blockTime of hoursToBlock) {
                    const response = await fetch(`${API_URL}/api/blocked-slots`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            block_date: dateToBlock,
                            block_time: blockTime,
                            reason: reason || null,
                            message: message || null,
                            is_active: true
                        })
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        alert(result.message || `Erreur blocage pour le ${dateToBlock}`);
                        return;
                    }
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            blockedSlotForm.reset();

            await loadBlockedSlots();

            blockedSlotsContent.style.display = "block";
            blockedSlotsToggle.textContent = "Jours et horaires bloqués ▲";

            alert("Blocage ajouté avec succès.");

        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    });
}

async function loadBlockedSlots() {
    if (!blockedSlotsList) return;

    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/api/blocked-slots/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const blocks = await response.json();

        if (!response.ok) {
            blockedSlotsList.textContent = "Impossible de charger les blocages.";
            return;
        }

        if (!blocks.length) {
            blockedSlotsList.textContent = "Aucun jour ou horaire bloqué.";
            return;
        }

        blockedSlotsList.innerHTML = blocks.map((block) => `
            <div style="
                border:1px solid #ddd;
                padding:12px;
                margin:10px 0;
                border-radius:8px;
                background:#fafafa;
            ">
                <strong>${formatAdminDate(block.block_date)}</strong><br>
                Heure: ${block.block_time ? formatAdminTime(block.block_time) : "Toute la journée"}<br>
                Raison: ${block.reason || "-"}<br>
                Message client: ${block.message || "-"}<br><br>

                <button onclick="deleteBlockedSlot(${block.id})">
                    Supprimer
                </button>
            </div>
        `).join("");

    } catch (error) {
        console.error(error);
        blockedSlotsList.textContent = "Erreur serveur";
    }
}

async function deleteBlockedSlot(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Supprimer ce blocage ?")) return;

    try {
        const response = await fetch(`${API_URL}/api/blocked-slots/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Erreur suppression blocage");
            return;
        }

        await loadBlockedSlots();

    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}

loadBlockedSlots();

function normalizeAppointmentSearch(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

function applyAppointmentSearch() {
    const query = normalizeAppointmentSearch(appointmentSearch?.value);

    if (!query) {
        renderAppointments(allAppointments);
        return;
    }

    const filtered = allAppointments.filter((rdv) => [
        rdv.client_name,
        rdv.client_email,
        rdv.client_phone,
        rdv.service_title
    ].some((value) => normalizeAppointmentSearch(value).includes(query)));

    renderAppointments(filtered);

    if (historyAppointments) {
        historyAppointments.style.display = "block";
    }

    if (historyToggle) {
        historyToggle.textContent = "Historique des rendez-vous ▲";
    }
}

if (appointmentSearch) {
    appointmentSearch.addEventListener("input", applyAppointmentSearch);
}
// ClientFile
function showClientFile(clientEmail) {
    if (!clientFileBox) return;

    const clientAppointments = allAppointments.filter((rdv) =>
        rdv.client_email === clientEmail
    );

    if (!clientAppointments.length) {
        alert("Aucun historique trouvé pour ce client.");
        return;
    }

    const client = clientAppointments[0];

    clientFileBox.style.display = "block";

    clientFileBox.innerHTML = `
        <div style="
            border:2px solid #b68c5a;
            padding:16px;
            margin:15px 0;
            border-radius:10px;
            background:#fffaf4;
        ">
            <button onclick="closeClientFile()" style="float:right;">
                Fermer
            </button>

            <h3>Fiche client</h3>

            <p><strong>Nom:</strong> ${client.client_name}</p>
            <p><strong>Email:</strong> ${client.client_email || "-"}</p>
            <p><strong>Téléphone:</strong> ${client.client_phone || "-"}</p>

            <h4>Historique des rendez-vous</h4>

            ${clientAppointments.map((rdv) => `
                <div style="
                    border:1px solid #ddd;
                    padding:10px;
                    margin:8px 0;
                    background:#ffffff;
                    border-radius:8px;
                ">
                    <strong>
                        ${formatAdminDate(rdv.appointment_date)}
                        à
                        ${formatAdminTime(rdv.appointment_time)}
                    </strong><br>

                    ${rdv.service_title}<br>

                    Durée: ${formatAdminDuration(rdv.duration_minutes)}<br>

                    ${rdv.notes ? `<strong>Note:</strong> ${rdv.notes}<br>` : ""}

                    Statut: ${getStatusLabel(rdv.status)}
                </div>
            `).join("")}
        </div>
    `;

    clientFileBox.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function closeClientFile() {
    if (!clientFileBox) return;

    clientFileBox.style.display = "none";
    clientFileBox.innerHTML = "";
}

// Planning

function renderDailyPlanning(dateValue) {
    if (!dailyPlanning) return;

    const selectedDate = dateValue || formatDateToApi(new Date());

    const dayAppointments = allAppointments
        .filter((rdv) => {
            const rdvDate = formatDateForInput(rdv.appointment_date);
            return rdvDate === selectedDate;
        })
        .sort((a, b) => {
            return a.appointment_time.localeCompare(b.appointment_time);
        });

    if (!dayAppointments.length) {
        dailyPlanning.innerHTML =
            "Aucun rendez-vous pour cette journée.";
        return;
    }

    dailyPlanning.innerHTML = dayAppointments.map((rdv) => `
        <div style="
            border:1px solid #ddd;
            padding:12px;
            margin:10px 0;
            border-radius:8px;
            background:#ffffff;
        ">
            <strong>${formatAdminTime(rdv.appointment_time)}</strong><br>
            ${rdv.client_name}<br>
            ${rdv.service_title}<br>
            Durée: <strong>${formatAdminDuration(rdv.duration_minutes)}</strong><br>
            ${rdv.notes ? `<strong>Note:</strong> ${rdv.notes}<br>` : ""}
            Statut: ${getStatusLabel(rdv.status)}
        </div>
    `).join("");
}

if (planningDate) {
    planningDate.value = formatDateToApi(new Date());

    planningDate.addEventListener("change", () => {
        renderDailyPlanning(planningDate.value);
    });
}
const WEEK_DAYS = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi"
];

const CALENDAR_HOURS = [
    "09:00:00",
    "10:00:00",
    "11:00:00",
    "12:00:00",
    "13:00:00",
    "14:00:00",
    "15:00:00",
    "16:00:00",
    "17:00:00",
    "18:00:00",
    "19:00:00"
];

function adminTimeToMinutes(timeValue) {
    const [hours, minutes] = String(timeValue || "00:00").split(":").map(Number);
    return hours * 60 + minutes;
}

function getMonday(date) {
    const current = new Date(date);
    const day = current.getDay();

    const diff = current.getDate() - day + (day === 0 ? -6 : 1);

    return new Date(current.setDate(diff));
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function renderWeekCalendar(dateValue) {
    if (!weekCalendar) return;

    const baseDate = dateValue ? new Date(dateValue) : new Date();
    const monday = getMonday(baseDate);

    const weekDates = WEEK_DAYS.map((_, index) =>
        addDays(monday, index)
    );

    weekCalendar.innerHTML = `
        <div style="
            overflow-x:auto;
            border:1px solid #ddd;
            border-radius:10px;
            background:#fff;
        ">
            <table style="
                width:100%;
                min-width:900px;
                border-collapse:collapse;
                font-family:Arial,sans-serif;
            ">
                <thead>
                    <tr>
                        <th style="border:1px solid #ddd;padding:10px;background:#f7f3ef;">
                            Heure
                        </th>

                        ${weekDates.map((date, index) => `
                            <th style="border:1px solid #ddd;padding:10px;background:#f7f3ef;">
                                ${WEEK_DAYS[index]}<br>
                                <small>${formatAdminDate(date)}</small>
                            </th>
                        `).join("")}
                    </tr>
                </thead>

                <tbody>
                    ${CALENDAR_HOURS.map((hour) => `
                        <tr>
                            <td style="
                                border:1px solid #ddd;
                                padding:10px;
                                font-weight:bold;
                                background:#fafafa;
                                width:90px;
                                text-align:center;
                            ">
                                ${formatAdminTime(hour)}
                            </td>

                            ${weekDates.map((date) => {
        const dateApi = formatDateToApi(date);
        const rowStart = adminTimeToMinutes(hour);
        const rowEnd = rowStart + 60;

        const rdv = allAppointments.find((item) => {
            const itemDate =
                formatDateForInput(item.appointment_date);
            const appointmentStart = adminTimeToMinutes(item.appointment_time);
            const appointmentEnd =
                appointmentStart + Number(item.duration_minutes || 60);

            return (
                itemDate === dateApi &&
                item.status !== "cancelled" &&
                item.status !== "no_show" &&
                appointmentStart < rowEnd &&
                rowStart < appointmentEnd
            );
        });

        if (!rdv) {
            return `
                                        <td style="
                                            border:1px solid #ddd;
                                            padding:8px;
                                            height:80px;
                                            vertical-align:top;
                                            color:#aaa;
                                            text-align:center;
                                        ">
                                            —
                                        </td>
                                    `;
        }

        const appointmentStart = adminTimeToMinutes(rdv.appointment_time);
        const isStartingRow =
            appointmentStart >= rowStart && appointmentStart < rowEnd;

        return `
                                    <td style="
                                        border:1px solid #ddd;
                                        padding:8px;
                                        height:80px;
                                        vertical-align:top;
                                        background:${isStartingRow ? "#ead7bd" : "#f5e8d8"};
                                    ">
                                        ${isStartingRow ? `
                                            <strong>${formatAdminTime(rdv.appointment_time)} — ${rdv.client_name}</strong><br>
                                            <small>${rdv.service_title}</small><br>
                                            <small>Durée: ${formatAdminDuration(rdv.duration_minutes)}</small><br>
                                            ${rdv.notes ? `<small><strong>Note:</strong> ${rdv.notes}</small><br>` : ""}
                                            <small>Statut: ${getStatusLabel(rdv.status)}</small><br>

                                            <button onclick="showClientFile('${rdv.client_email}')">
                                                Fiche
                                            </button>
                                        ` : `
                                            <strong>↳ Suite du RDV</strong><br>
                                            <small>${rdv.client_name}</small><br>
                                            <small>${rdv.service_title}</small>
                                        `}
                                    </td>
                                `;
    }).join("")}
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

if (weekCalendarDate) {
    weekCalendarDate.value = formatDateToApi(new Date());

    weekCalendarDate.addEventListener("change", () => {
        renderWeekCalendar(weekCalendarDate.value);
    });
}

if (prevWeekBtn && weekCalendarDate) {
    prevWeekBtn.addEventListener("click", () => {
        const current = new Date(weekCalendarDate.value);
        current.setDate(current.getDate() - 7);

        weekCalendarDate.value = formatDateToApi(current);
        renderWeekCalendar(weekCalendarDate.value);
    });
}

if (nextWeekBtn && weekCalendarDate) {
    nextWeekBtn.addEventListener("click", () => {
        const current = new Date(weekCalendarDate.value);
        current.setDate(current.getDate() + 7);

        weekCalendarDate.value = formatDateToApi(current);
        renderWeekCalendar(weekCalendarDate.value);
    });
}
// Créer un RDV admin
const adminAppointmentForm = document.getElementById("adminAppointmentForm");

if (adminAppointmentForm) {
    adminAppointmentForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        const data = {
            client_name: document.getElementById("adminClientName").value.trim(),
            client_email: document.getElementById("adminClientEmail").value.trim(),
            client_phone: document.getElementById("adminClientPhone").value.trim(),
            service_title: document.getElementById("adminServiceTitle").value.trim(),
            appointment_date: document.getElementById("adminAppointmentDate").value,
            appointment_time: document.getElementById("adminAppointmentTime").value + ":00",
            duration_minutes: Number(document.getElementById("adminDuration").value) || 60,
            status: "confirmed",
            source: "admin",
            notes: document.getElementById("adminNotes").value.trim()
        };

        try {
            const response = await fetch(`${API_URL}/api/appointments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Erreur création RDV");
                return;
            }

            alert("RDV créé avec succès");

            adminAppointmentForm.reset();

            await loadAppointments();
            loadDashboard();

        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    });
}

// forgotPassword
const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const forgotPasswordMessage =
    document.getElementById("forgotPasswordMessage");

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email =
            document.getElementById("forgotEmail").value.trim();

        try {
            const response = await fetch(
                `${API_URL}/api/admin/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

            const result = await response.json();

            forgotPasswordMessage.textContent =
                result.message || "Demande envoyée.";

        } catch (error) {
            console.error(error);

            forgotPasswordMessage.textContent =
                "Erreur serveur.";
        }
    });
}

// resetPassword

const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const resetPasswordMessage =
    document.getElementById("resetPasswordMessage");

if (resetPasswordForm) {
    resetPasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        const newPassword =
            document.getElementById("newPassword").value.trim();

        const confirmPassword =
            document.getElementById("confirmPassword").value.trim();

        if (!token) {
            resetPasswordMessage.textContent =
                "Lien invalide ou expiré.";
            return;
        }

        if (newPassword.length < 8) {
            resetPasswordMessage.textContent =
                "Le mot de passe doit contenir au moins 8 caractères.";
            return;
        }

        if (newPassword !== confirmPassword) {
            resetPasswordMessage.textContent =
                "Les mots de passe ne correspondent pas.";
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/api/admin/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        token,
                        newPassword
                    })
                }
            );

            const result = await response.json();

            resetPasswordMessage.textContent =
                result.message || "Mot de passe modifié.";

            if (response.ok) {
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            }

        } catch (error) {
            console.error(error);

            resetPasswordMessage.textContent =
                "Erreur serveur.";
        }
    });
}

// Galerie

const galleryToggle = document.getElementById("galleryToggle");
const galleryContent = document.getElementById("galleryContent");
const galleryForm = document.getElementById("galleryForm");
const galleryCategory = document.getElementById("galleryCategory");
const galleryList = document.getElementById("galleryList");

let galleryCategories = [];

if (galleryToggle && galleryContent) {
    galleryContent.style.display = "none";

    galleryToggle.addEventListener("click", () => {
        const isClosed = galleryContent.style.display === "none";

        galleryContent.style.display = isClosed ? "block" : "none";
        galleryToggle.textContent = isClosed ? "Galerie ▲" : "Galerie ▼";
    });
}

async function loadGalleryCategories() {
    if (!galleryCategory) return;

    try {
        const response = await fetch(`${API_URL}/api/gallery/categories`);
        const categories = await response.json();

        if (!response.ok) {
            galleryCategory.innerHTML =
                `<option value="">Impossible de charger les catégories</option>`;
            return;
        }

        galleryCategories = categories;

        galleryCategory.innerHTML =
            `<option value="">Catégorie</option>` +
            categories
                .filter((category) => Number(category.is_active) === 1)
                .map((category) => `
                    <option value="${category.id}">
                        ${category.name}
                    </option>
                `).join("");

    } catch (error) {
        console.error(error);
        galleryCategory.innerHTML =
            `<option value="">Erreur serveur</option>`;
    }
}

async function loadGalleryItems() {
    if (!galleryList) return;

    try {
        const response = await fetch(`${API_URL}/api/gallery`);
        const items = await response.json();

        if (!response.ok) {
            galleryList.textContent =
                "Impossible de charger la galerie.";
            return;
        }

        if (!items.length) {
            galleryList.textContent =
                "Aucune photo dans la galerie.";
            return;
        }

        galleryList.innerHTML = items.map((item) => {
            const category = galleryCategories.find(
                (cat) => cat.id === item.category_id
            );

            return `
                <div style="
                    border:1px solid #ddd;
                    padding:12px;
                    margin:10px 0;
                    border-radius:10px;
                    background:#fffdfb;
                    display:grid;
                    grid-template-columns:120px 1fr;
                    gap:12px;
                    align-items:start;
                ">
                    <img
                        src="${item.image_url}"
                        alt="${item.title || "Photo galerie"}"
                        style="
                            width:120px;
                            height:90px;
                            object-fit:cover;
                            border-radius:8px;
                            background:#eee;
                        "
                    >

                    <div>
                        <strong>${item.title || "Sans titre"}</strong><br>
                        Catégorie: ${category ? category.name : "-"}<br>
                        Description: ${item.description || "-"}<br>
                        Actif: ${item.is_active ? "Oui" : "Non"}<br><br>

                        <button onclick="deleteGalleryItem(${item.id})">
                            Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error(error);
        galleryList.textContent = "Erreur serveur";
    }
}

if (galleryForm) {
    galleryForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        const fileInput =
            document.getElementById("galleryImageFile");

        const file = fileInput.files[0];

        if (!file) {
            alert("Choisissez une image");
            return;
        }

        try {

            const uploadData = new FormData();
            uploadData.append("file", file);

            const uploadResponse = await fetch(
                `${API_URL}/api/upload/single`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: uploadData
                }
            );



            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                alert(uploadResult.message);
                return;
            }

            if (!uploadResult.file || !uploadResult.file.url) {
                alert("Erreur upload: URL image introuvable");
                console.log(uploadResult);
                return;
            }

            const imageUrl = `${API_URL}${uploadResult.file.url}`;

            const galleryData = {
                category_id: document.getElementById("galleryCategory").value,
                title: document.getElementById("galleryTitle").value,
                description: document.getElementById("galleryDescription").value,
                image_url: imageUrl,
                is_active: true
            };



            const response = await fetch(
                `${API_URL}/api/gallery`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(galleryData)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(result.message);
                return;
            }

            alert("Photo ajoutée");

            galleryForm.reset();

            loadGalleryItems();

        } catch (error) {

            console.error(error);

            alert("Erreur serveur");
        }

    });
}
async function deleteGalleryItem(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Supprimer cette photo ?")) return;

    try {
        const response = await fetch(`${API_URL}/api/gallery/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Erreur suppression photo");
            return;
        }

        await loadGalleryItems();

    } catch (error) {
        console.error(error);
        alert("Erreur serveur");
    }
}

loadGalleryCategories().then(() => {
    loadGalleryItems();
});
// Certificats

const certificatesToggle = document.getElementById("certificatesToggle");
const certificatesContent = document.getElementById("certificatesContent");
const certificateForm = document.getElementById("certificateForm");
const certificatesList = document.getElementById("certificatesList");

if (certificatesToggle && certificatesContent) {
    certificatesToggle.onclick = () => {
        const isClosed = certificatesContent.style.display === "none";
        certificatesContent.style.display = isClosed ? "block" : "none";
        certificatesToggle.textContent = isClosed ? "Certificats ▲" : "Certificats ▼";
    };
}

if (certificateForm) {
    certificateForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");
        const fileInput = document.getElementById("certificateFile");
        const file = fileInput.files[0];

        if (!file) {
            alert("Choisissez un fichier");
            return;
        }

        try {
            const uploadData = new FormData();
            uploadData.append("file", file);

            const uploadResponse = await fetch(`${API_URL}/api/upload/single`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: uploadData
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                alert(uploadResult.message || "Erreur upload");
                return;
            }

            const fileUrl = `${API_URL}${uploadResult.file.url}`;

            const data = {
                title: document.getElementById("certificateTitle").value.trim(),
                description: document.getElementById("certificateDescription").value.trim(),
                file_url: fileUrl,
                file_type: file.type,
                is_active: true,
                sort_order: 0
            };

            const response = await fetch(`${API_URL}/api/certificates`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message || "Erreur création certificat");
                return;
            }

            alert("Certificat ajouté");
            certificateForm.reset();
            loadCertificates();
            loadDashboard();

        } catch (error) {
            console.error(error);
            alert("Erreur serveur");
        }
    });
}

async function loadCertificates() {
    if (!certificatesList) return;

    const token = localStorage.getItem("adminToken");

    try {
        const response = await fetch(`${API_URL}/api/certificates/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const certificates = await response.json();

        if (!response.ok) {
            certificatesList.textContent = "Impossible de charger les certificats.";
            return;
        }

        if (!certificates.length) {
            certificatesList.textContent = "Aucun certificat.";
            return;
        }

        certificatesList.innerHTML = certificates.map((cert) => `
    <div style="border:1px solid #ddd; padding:12px; margin:10px 0;">
        <strong>${cert.title}</strong><br>

        Description: ${cert.description || "-"}<br>

        ${cert.file_url && cert.file_url.toLowerCase().includes(".pdf")
                ? `<a href="${cert.file_url}" target="_blank">Voir PDF</a>`
                : `<img src="${cert.file_url}" alt="${cert.title}" style="width:120px;height:90px;object-fit:cover;">`
            }

        <br><br>

        <button onclick="editCertificate(${cert.id})">
            Modifier
        </button>
<button onclick="toggleCertificate(${cert.id}, ${Number(cert.is_active) === 1 ? "false" : "true"})">
    ${Number(cert.is_active) === 1 ? "Masquer" : "Afficher"}
</button>
        <button onclick="deleteCertificate(${cert.id})">
            Supprimer
        </button>
    </div>
`).join("");

    } catch (error) {
        console.error(error);
        certificatesList.textContent = "Erreur serveur";
    }
}

async function deleteCertificate(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Supprimer ce certificat ?")) return;

    const response = await fetch(`${API_URL}/api/certificates/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        loadCertificates();
        loadDashboard();
    } else {
        alert("Erreur suppression certificat");
    }
}

loadCertificates();
async function editCertificate(id) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
        `${API_URL}/api/certificates/admin`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const certificates = await response.json();

    const cert = certificates.find(
        item => item.id === id
    );

    if (!cert) {
        alert("Certificat introuvable");
        return;
    }

    const title = prompt(
        "Titre",
        cert.title
    );

    if (title === null) return;

    const description = prompt(
        "Description",
        cert.description || ""
    );

    if (description === null) return;

    const updateResponse = await fetch(
        `${API_URL}/api/certificates/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                file_url: cert.file_url,
                file_type: cert.file_type,
                sort_order: cert.sort_order || 0,
                is_active: Boolean(cert.is_active)
            })
        }
    );

    if (updateResponse.ok) {
        alert("Certificat modifié");
        loadCertificates();
    } else {
        alert("Erreur modification certificat");
    }
}
async function toggleCertificate(id, isActive) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/certificates/${id}/toggle`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            is_active: isActive
        })
    });

    if (response.ok) {
        loadCertificates();
        loadDashboard();
    } else {
        alert("Erreur affichage certificat");
    }
}
// FAQ

const faqToggle = document.getElementById("faqToggle");
const faqContent = document.getElementById("faqContent");
const faqForm = document.getElementById("faqForm");
const faqListAdmin = document.getElementById("faqListAdmin");

if (faqToggle && faqContent) {
    faqToggle.onclick = () => {
        const isClosed = faqContent.style.display === "none";
        faqContent.style.display = isClosed ? "block" : "none";
        faqToggle.textContent = isClosed ? "FAQ ▲" : "FAQ ▼";
    };
}

if (faqForm) {
    faqForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("adminToken");

        const data = {
            question: document.getElementById("faqQuestion").value.trim(),
            answer: document.getElementById("faqAnswer").value.trim(),
            category: document.getElementById("faqCategory").value.trim(),
            is_active: true,
            sort_order: 0
        };

        const response = await fetch(`${API_URL}/api/faqs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Erreur création FAQ");
            return;
        }

        alert("FAQ ajoutée");
        faqForm.reset();
        loadFaqs();
        loadDashboard();
    });
}

async function loadFaqs() {
    if (!faqListAdmin) return;

    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/faqs/admin`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const faqs = await response.json();

    if (!response.ok) {
        faqListAdmin.textContent = "Impossible de charger les FAQ.";
        return;
    }

    if (!faqs.length) {
        faqListAdmin.textContent = "Aucune FAQ.";
        return;
    }

    faqListAdmin.innerHTML = faqs.map((faq) => `
        <div style="border:1px solid #ddd; padding:12px; margin:10px 0;">
            <strong>${faq.question}</strong><br>
            ${faq.answer}<br>
            Catégorie: ${faq.category || "-"}<br>
            Actif: ${faq.is_active ? "Oui" : "Non"}<br><br>

           
            <button onclick="editFaq(${faq.id})">Modifier</button>
            <button onclick="toggleFaq(${faq.id}, ${Number(faq.is_active) === 1 ? "false" : "true"})">
    ${Number(faq.is_active) === 1 ? "Masquer" : "Afficher"}
</button>
 <button onclick="deleteFaq(${faq.id})">Supprimer</button>
        </div>
    `).join("");
}

async function deleteFaq(id) {
    const token = localStorage.getItem("adminToken");

    if (!confirm("Supprimer cette FAQ ?")) return;

    const response = await fetch(`${API_URL}/api/faqs/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (response.ok) {
        loadFaqs();
        loadDashboard();
    } else {
        alert("Erreur suppression FAQ");
    }
}

loadFaqs();
async function editFaq(id) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/faqs/admin`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const faqs = await response.json();
    const faq = faqs.find(item => item.id === id);

    if (!faq) {
        alert("FAQ introuvable");
        return;
    }

    const question = prompt("Question", faq.question);
    if (question === null) return;

    const answer = prompt("Réponse", faq.answer);
    if (answer === null) return;

    const category = prompt("Catégorie", faq.category || "");
    if (category === null) return;

    const updateResponse = await fetch(`${API_URL}/api/faqs/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            question,
            answer,
            category,
            is_active: Boolean(faq.is_active),
            sort_order: faq.sort_order || 0
        })
    });

    if (updateResponse.ok) {
        alert("FAQ modifiée");
        loadFaqs();
    } else {
        alert("Erreur modification FAQ");
    }
}
async function toggleFaq(id, isActive) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/api/faqs/${id}/toggle`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            is_active: isActive
        })
    });

    if (response.ok) {
        loadFaqs();
        loadDashboard();
    } else {
        alert("Erreur affichage FAQ");
    }
}
