import pool from '../config/database.js';


export async function findAllCategories() {
    const result = await pool.query(
        `SELECT
            id,
            designation,
            created_at,
            updated_at
        FROM categories
        ORDER BY designation ASC`
    );

    return result.rows;
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


// Modifier une catégorie
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