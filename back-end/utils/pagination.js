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

async function runPaginatedQuery({ baseSql, values = [], searchColumns = [], filterClauses = [], filterValues = [], orderBy, pagination }) {
    const safeColumns = searchColumns.filter(column => /^[A-Za-z0-9_]+$/.test(column));
    const conditions = [...filterClauses];
    const conditionValues = [...filterValues];
    if (pagination.search && safeColumns.length) {
        conditions.push(`CONCAT_WS(' ', ${safeColumns.map(column => `COALESCE(CAST(source.\`${column}\` AS CHAR), '')`).join(', ')}) LIKE ?`);
        conditionValues.push(`%${pagination.search}%`);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const queryValues = [...values, ...conditionValues, pagination.limit, pagination.offset];
    const ordering = orderBy ? `ORDER BY ${orderBy}` : '';

    const rows = await query(
        `SELECT source.*, COUNT(*) OVER() AS __pagination_total
         FROM (${baseSql.replace(/;\s*$/, '')}) AS source
         ${whereClause}
         ${ordering}
         LIMIT ? OFFSET ?`,
        queryValues
    );

    const total = Number(rows[0]?.__pagination_total || 0);
    rows.forEach(row => delete row.__pagination_total);
    return { rows, total };
}

module.exports = { getPagination, paginatedResponse, runPaginatedQuery };
