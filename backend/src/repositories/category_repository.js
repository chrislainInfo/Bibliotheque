import pool from '../config/database.js';


export async function findAllCategories(limit, offset) {
    const result = await pool.query(
        `SELECT
            c.id,
            c.designation,
            c.created_at,
            c.updated_at,
            COUNT(l.id)::integer AS nombre_livres
        FROM categories c
        LEFT JOIN livres l ON l.id_categorie = c.id
        GROUP BY c.id, c.designation, c.created_at, c.updated_at
        ORDER BY c.designation ASC
        LIMIT $1
        OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
}


export async function countCategories() {
    const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM categories`
    );

    return Number(result.rows[0].total);
}


export async function findCategoryById(id) {
    const result = await pool.query(
        `SELECT
            id,
            designation,
            created_at,
            updated_at
        FROM categories
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


export async function findCategoryByDesignation(designation) {
    const result = await pool.query(
        `SELECT
            id,
            designation
        FROM categories
        WHERE LOWER(designation) = LOWER($1)`,
        [designation]
    );

    return result.rows[0] || null;
}


export async function createCategory(designation) {
    const result = await pool.query(
        `INSERT INTO categories (designation)
         VALUES ($1)
         RETURNING
            id,
            designation,
            created_at,
            updated_at`,
        [designation]
    );

    return result.rows[0];
}


export async function updateCategory(id, designation) {
    const result = await pool.query(
        `UPDATE categories
         SET
            designation = $1,
            updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING
            id,
            designation,
            created_at,
            updated_at`,
        [designation, id]
    );

    return result.rows[0] || null;
}


export async function deleteCategory(id) {
    const result = await pool.query(
        `DELETE FROM categories
        WHERE id = $1
        RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}