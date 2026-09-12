import pool from '../config/database.js';

export async function findBibliothecaireByEmail(email) {
    const result = await pool.query(
        `SELECT
            u.id,
            u.email,
            u.mot_de_passe,
            u.role,
            b.prenom
        FROM utilisateurs u
        INNER JOIN bibliothecaires b
            ON b.id_utilisateur = u.id
        WHERE u.email = $1
        AND u.role = 'bibliothecaire'`,
        [email]
    );

    return result.rows[0] || null;
}
