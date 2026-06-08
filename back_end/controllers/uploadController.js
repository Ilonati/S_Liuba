function uploadSingleFile(req, res) {
    if (!req.file) {
        return res.status(400).json({
            message: "Aucun fichier envoyé"
        });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
        message: "Fichier uploadé",
        file: {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            url: fileUrl
        }
    });
}

module.exports = {
    uploadSingleFile
};
const fs = require("fs");
const path = require("path");

function deleteFile(req, res) {
    const { filename } = req.params;

    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            message: "Fichier introuvable"
        });
    }

    fs.unlinkSync(filePath);

    res.json({
        message: "Fichier supprimé"
    });
}

module.exports = {
    uploadSingleFile,
    deleteFile
};