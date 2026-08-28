const fs = require('fs');

function hasValidSignature(buffer, mimeType) {
    if (mimeType === 'image/jpeg') {
        return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    }

    if (mimeType === 'image/png') {
        return buffer.subarray(0, 8).equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        );
    }

    if (mimeType === 'image/webp') {
        return buffer.subarray(0, 4).toString('ascii') === 'RIFF'
            && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    }

    return false;
}

module.exports = async function validateUploadedImage(req, res, next) {
    if (!req.file) {
        next();
        return;
    }

    let fileHandle;
    try {
        fileHandle = await fs.promises.open(req.file.path, 'r');
        const signature = Buffer.alloc(12);
        await fileHandle.read(signature, 0, signature.length, 0);

        if (!hasValidSignature(signature, req.file.mimetype)) {
            await fileHandle.close();
            fileHandle = null;
            await fs.promises.unlink(req.file.path).catch(() => {});
            res.status(415).json({ message: 'Le contenu du fichier ne correspond pas a une image valide.' });
            return;
        }

        await fileHandle.close();
        next();
    } catch (error) {
        if (fileHandle) await fileHandle.close().catch(() => {});
        if (req.file?.path) await fs.promises.unlink(req.file.path).catch(() => {});
        next(error);
    }
};
