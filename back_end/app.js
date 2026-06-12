const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://s-liuba.onrender.com"
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
    res.json({
        message: "S Liuba backend is running"
    });
});


app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/gallery", require("./routes/galleryRoutes"));
app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/slots", require("./routes/slotRoutes"));
app.use("/api/blocked-slots", require("./routes/blockRoutes"));
app.use("/api/blocked-clients", require("./routes/blockedClientRoutes"));
app.use("/api/calendar", require("./routes/calendarRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/pages", require("./routes/pageRoutes"));
app.use("/api/content-blocks", require("./routes/contentBlockRoutes"));
app.use("/api/certificates", require("./routes/certificateRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

const reminderService = require("./services/reminderService");

reminderService.startAppointmentReminderCron();



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});