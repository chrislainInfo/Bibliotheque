import pool from '../config/database.js';
import AppError from '../errors/AppErrors.js';


//GET - Tous les adhérents avec pagination
export async function findAllAdherents(limit, offset) {

    const result = await pool.query(
        `SELECT
            a.id,
            a.id_utilisateur,
            a.prenom,
            a.nom,
            a.telephone,
            a.adresse,
            a.date_adhesion,
            a.date_expiration,
            a.cree_par,
            u.code
        FROM adherents a
        INNER JOIN utilisateurs u
            ON u.id = a.id_utilisateur
        ORDER BY a.nom ASC, a.prenom ASC
        LIMIT $1
        OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
}


//Nombre total d'adhérents
export async function countAdherents() {

    const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM adherents`
    );

    return Number(result.rows[0].total);
}


//GET - Un adhérent par son ID
export async function findAdherentById(id) {

    const result = await pool.query(
        `SELECT
            a.id,
            a.id_utilisateur,
            a.prenom,
            a.nom,
            a.telephone,
            a.adresse,
            a.date_adhesion,
            a.date_expiration,
            a.cree_par,
            u.code
        FROM adherents a
        INNER JOIN utilisateurs u
            ON u.id = a.id_utilisateur
        WHERE a.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


//Vérifier si un code existe déjà
export async function findUserByCode(code) {

    const result = await pool.query(
        `SELECT
            id,
            code
        FROM utilisateurs
        WHERE code = $1`,
        [code]
    );

    return result.rows[0] || null;
}


/*
|--------------------------------------------------------------------------
| Créer un adhérent
|--------------------------------------------------------------------------
|
| Cette opération crée :
|
| 1. utilisateurs
| 2. adherents
|
| Les deux sont dans UNE SEULE transaction.
|
|--------------------------------------------------------------------------
*/
export async function createAdherent(
    prenom,
    nom,
    telephone,
    adresse,
    dateAdhesion,
    dateExpiration,
    code,
    passwordHash,
    idBibliothecaire
) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        //Créer l'utilisateur

        const userResult = await client.query(
            `INSERT INTO utilisateurs (
                code,
                mot_de_passe,
                role
            )
            VALUES (
                $1,
                $2,
                'adherent'
            )
            RETURNING id, code, role`,
            [
                code,
                passwordHash
            ]
        );

        const user = userResult.rows[0];

        //Créer le profil adhérent

        const adherentResult = await client.query(
            `INSERT INTO adherents (
                id_utilisateur,
                cree_par,
                prenom,
                nom,
                telephone,
                adresse,
                date_adhesion,
                date_expiration
            )
            SELECT
                $1,
                b.id,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7
            FROM bibliothecaires b
            WHERE b.id = $8
            RETURNING
                id,
                id_utilisateur,
                cree_par,
                prenom,
                nom,
                telephone,
                adresse,
                date_adhesion,
                date_expiration,
                created_at,
                updated_at`,
            [
                user.id,
                prenom,
                nom,
                telephone,
                adresse,
                dateAdhesion,
                dateExpiration,
                idBibliothecaire
            ]
        );

        const adherent = adherentResult.rows[0];

        if (!adherent) {
            throw new AppError(
                'Le bibliothécaire connecté est introuvable',
                404
            );
        }


        //Valider toute l'opération

        await client.query('COMMIT');

        return {
            adherent,
            code: user.code
        };

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


//Modifier un adhérent
export async function updateAdherent(
    id,
    prenom,
    nom,
    telephone,
    adresse,
    dateAdhesion,
    dateExpiration
) {

    const result = await pool.query(
        `UPDATE adherents
        SET
            prenom = $1,
            nom = $2,
            telephone = $3,
            adresse = $4,
            date_adhesion = $5,
            date_expiration = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING
            id,
            id_utilisateur,
            cree_par,
            prenom,
            nom,
            telephone,
            adresse,
            date_adhesion,
            date_expiration,
            created_at,
            updated_at`,
        [
            prenom,
            nom,
            telephone,
            adresse,
            dateAdhesion,
            dateExpiration,
            id
        ]
    );

    return result.rows[0] || null;
}


/*
|--------------------------------------------------------------------------
| Supprimer un adhérent
|--------------------------------------------------------------------------
|
| On supprime d'abord l'utilisateur.
|
| Grâce à ON DELETE CASCADE :
|
| utilisateurs
|      ↓
| adherents
|
| Le profil adhérent sera automatiquement supprimé.
|
|--------------------------------------------------------------------------
*/

export async function deleteAdherent(id) {

    const result = await pool.query(
        `DELETE FROM utilisateurs
        WHERE id = (
            SELECT id_utilisateur
            FROM adherents
            WHERE id = $1
        )
        RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}