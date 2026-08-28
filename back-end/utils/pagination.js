const db = require('../config/db');

function getPagination(req) {
    if (req.query.page === undefined) return null;

    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedPageSize = Number.parseInt(req.query.pageSize, 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const pageSize = Number.isFinite(requestedPageSize)
        ? Math.min(Math.max(requestedPageSize, 10), 100)
        : 20;

    return {
        page,
        pageSize,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search: String(req.query.search || '').trim().slice(0, 150),
        filters: {
            type: String(req.query.type || '').split(',').filter(Boolean).slice(0, 10),
            dewey: String(req.query.dewey || '').split(',').filter(Boolean).slice(0, 10),
            validity: String(req.query.validity || '').trim()
        }
    };
}

function paginatedResponse(result, pagination) {
    return {
        data: result.rows,
        pagination: {
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: result.total
        }
    };
}

function query(sql, values) {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (error, result) => error ? reject(error) : resolve(result));
    });
}

async function runPaginatedQuery({
    baseSql,
    values = [],
    searchColumns = [],
    filterClauses = [],
    filterValues = [],
    orderBy,
    pagination,
    totalMode = 'window'
}) {
    const safeColumns = searchColumns.filter(column => /^[A-Za-z0-9_]+$/.test(column));
    const conditions = [...filterClauses];
    const conditionValues = [...filterValues];
    if (pagination.search && safeColumns.length) {
        conditions.push(`CONCAT_WS(' ', ${safeColumns.map(column => `COALESCE(CAST(source.\`${column}\` AS CHAR), '')`).join(', ')}) LIKE ?`);
        conditionValues.push(`%${pagination.search}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const filteredValues = [...values, ...conditionValues];
    const ordering = orderBy ? `ORDER BY ${orderBy}` : '';
    const normalizedBaseSql = baseSql.replace(/;\s*$/, '');

    if (totalMode === 'window') {
        const rows = await query(
            `SELECT source.*, COUNT(*) OVER() AS __pagination_total
             FROM (${normalizedBaseSql}) AS source
             ${whereClause}
             ${ordering}
             LIMIT ? OFFSET ?`,
            [...filteredValues, pagination.limit, pagination.offset]
        );

        let total = Number(rows[0]?.__pagination_total || 0);
        rows.forEach(row => delete row.__pagination_total);

        // Une page devenue vide apres une suppression ne contient plus la
        // valeur de fenetre. Recompter seulement dans ce cas exceptionnel.
        if (rows.length === 0 && pagination.offset > 0) {
            const countRows = await query(
                `SELECT COUNT(*) AS total
                 FROM (${normalizedBaseSql}) AS source
                 ${whereClause}`,
                filteredValues
            );
            total = Number(countRows[0]?.total || 0);
        }

        return { rows, total };
    }

    // Sur une liste simple, la requete de lignes peut s'arreter des que LIMIT
    // est atteint. Le comptage se fait en parallele sans elargir chaque ligne
    // avec une fonction fenetre, ce qui reduit les lectures et la memoire SQL.
    const [rows, countRows] = await Promise.all([
        query(
            `SELECT source.*
             FROM (${normalizedBaseSql}) AS source
             ${whereClause}
             ${ordering}
             LIMIT ? OFFSET ?`,
            [...filteredValues, pagination.limit, pagination.offset]
        ),
        query(
            `SELECT COUNT(*) AS total
             FROM (${normalizedBaseSql}) AS source
             ${whereClause}`,
            filteredValues
        )
    ]);

    return { rows, total: Number(countRows[0]?.total || 0) };
}

module.exports = { getPagination, paginatedResponse, runPaginatedQuery };
