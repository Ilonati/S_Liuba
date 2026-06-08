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