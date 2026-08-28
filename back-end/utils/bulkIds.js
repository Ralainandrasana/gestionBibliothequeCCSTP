const MAX_BULK_IDS = 100;

function parseBulkIds(value) {
    if (!Array.isArray(value)) return [];

    return [...new Set(
        value
            .map(id => Number(id))
            .filter(id => Number.isInteger(id) && id > 0)
    )].slice(0, MAX_BULK_IDS);
}

module.exports = { parseBulkIds, MAX_BULK_IDS };
