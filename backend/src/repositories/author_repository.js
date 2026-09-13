import pool from '../config/database.js';


export async function findAllAuthors(limit, offset) {
    const result = await pool.query(
        `SELECT
            id,
            prenom,
            nom,
            nationalite
        FROM auteurs
        ORDER BY nom ASC, prenom ASC
        LIMIT $1
        OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
}


export async function countAuthors() {
    const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM auteurs`
    );

    return Number(result.rows[0].total);
}


export async function findAuthorById(id) {
    const result = await pool.query(
        `SELECT
            id,
            prenom,
            nom,
            nationalite
        FROM auteurs
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


export async function findAuthorByName(prenom, nom) {
    const result = await pool.query(
        `SELECT
            id,
            prenom,
            nom,
            nationalite
        FROM auteurs
        WHERE LOWER(prenom) = LOWER($1)
        AND LOWER(nom) = LOWER($2)`,
        [prenom, nom]
    );

    return result.rows[0] || null;
}


export async function createAuthor(
    prenom,
    nom,
    nationalite,
    idUtilisateur
) {
    const result = await pool.query(
        `INSERT INTO auteurs (
            prenom,
            nom,
            nationalite,
            cree_par
        )
        SELECT
            $1,
            $2,
            $3,
            b.id
        FROM bibliothecaires b
        WHERE b.id_utilisateur = $4
        RETURNING
            id,
            prenom,
            nom,
            nationalite,
            cree_par,
            created_at,
            updated_at`,
        [
            prenom,
            nom,
            nationalite,
            idUtilisateur
        ]
    );

    return result.rows[0] || null;
}


export async function updateAuthor(
    id,
    prenom,
    nom,
    nationalite
) {
    const result = await pool.query(
        `UPDATE auteurs
        SET
            prenom = $1,
            nom = $2,
            nationalite = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING
            id,
            prenom,
            nom,
            nationalite,`,
        [
            prenom,
            nom,
            nationalite,
            id
        ]
    );

    return result.rows[0] || null;
}


export async function deleteAuthor(id) {
    const result = await pool.query(
        `DELETE FROM auteurs
        WHERE id = $1
        RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}