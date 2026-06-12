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

        renderAppointments(appointments);
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

if (appointmentSearch) {
    appointmentSearch.addEventListener("input", () => {
        const query = appointmentSearch.value.toLowerCase().trim();

        if (!query) {
            renderAppointments(allAppointments);
            return;
        }

        const filtered = allAppointments.filter((rdv) => {
            return (
                (rdv.client_name || "").toLowerCase().includes(query) ||
                (rdv.client_email || "").toLowerCase().includes(query) ||
                (rdv.client_phone || "").toLowerCase().includes(query) ||
                (rdv.service_title || "").toLowerCase().includes(query)
            );
        });

        renderAppointments(filtered);
    });
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

        const rdv = allAppointments.find((item) => {
            const itemDate =
                formatDateForInput(item.appointment_date);

            return (
                itemDate === dateApi &&
                item.appointment_time === hour &&
                item.status !== "cancelled" &&
                item.status !== "no_show"
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

        return `
                                    <td style="
                                        border:1px solid #ddd;
                                        padding:8px;
                                        height:80px;
                                        vertical-align:top;
                                        background:#fffaf4;
                                    ">
                                        <strong>${rdv.client_name}</strong><br>
                                        <small>${rdv.service_title}</small><br>
                                        ${rdv.notes ? `<small><strong>Note:</strong> ${rdv.notes}</small><br>` : ""}
                                        <small>Statut: ${getStatusLabel(rdv.status)}</small><br>

                                        <button onclick="showClientFile('${rdv.client_email}')">
                                            Fiche
                                        </button>
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