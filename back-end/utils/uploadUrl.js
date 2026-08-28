function buildUploadUrl(filename) {
    const publicUrl = (
        process.env.UPLOAD_PUBLIC_URL || 'http://localhost/Bibliofianar/uploads/files'
    ).replace(/\/$/, '');

    return filename ? `${publicUrl}/${filename}` : null;
}

module.exports = { buildUploadUrl };
