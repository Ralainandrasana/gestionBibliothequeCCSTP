const multer = require('multer');
const path = require('path');

// Définir le stockage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/xampp/htdocs/Bibliofianar/uploads/files'); // Utilisez le chemin complet
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom de fichier unique
    }
});

// Initialiser multer avec le stockage défini
const upload = multer({ storage: storage });

module.exports = upload;
