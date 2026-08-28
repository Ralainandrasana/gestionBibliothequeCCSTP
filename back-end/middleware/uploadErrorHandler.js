const multer = require('multer');

module.exports = function uploadErrorHandler(error, _req, res, next) {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            const maximumSize = Number(process.env.UPLOAD_MAX_SIZE_MB) || 3;
            res.status(413).json({
                message: `La photo depasse la taille maximale autorisee de ${maximumSize} Mo.`
            });
            return;
        }

        res.status(400).json({ message: 'Le fichier envoye est invalide.' });
        return;
    }

    if (error?.code === 'UNSUPPORTED_IMAGE_TYPE') {
        res.status(415).json({ message: error.message });
        return;
    }

    next(error);
};
