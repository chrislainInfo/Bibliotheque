import pool from '../config/database.js';

// Connexion bibliothécaire
export async function findLibrarianByEmail(email) {
    const result = await pool.query(
        `SELECT
            u.id,
            u.email,
            u.mot_de_passe,
            u.role,
            b.prenom,
            b.nom
        FROM utilisateurs u
        INNER JOIN bibliothecaires b
            ON b.id_utilisateur = u.id
        WHERE u.email = $1
        AND u.role = 'bibliothecaire'`,
        [email]
    )

    return result.rows[0] || null
}

// Connexion adhérent
export async function findAdherentByCode(code) {
    const result = await pool.query(
        `SELECT
            u.id,
            u.code,
            u.mot_de_passe,
            u.role,
            a.prenom,
            a.nom
        FROM utilisateurs u
        INNER JOIN adherents a
            ON a.id_utilisateur = u.id
        WHERE u.code = $1
        AND u.role = 'adherent'`,
        [code]
    );

    return result.rows[0] || null
}