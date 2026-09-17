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
            u.code,
            u.email,
            (
                SELECT COUNT(*)
                FROM emprunts e
                WHERE e.id_adherent = a.id
                AND e.date_retour IS NULL
            ) AS emprunts_actifs
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
            u.code,
            u.email,
            (
                SELECT COUNT(*)
                FROM emprunts e
                WHERE e.id_adherent = a.id
                AND e.date_retour IS NULL
            ) AS emprunts_actifs
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

export async function findUserByEmail(email, excludedUserId = null) {
    const result = await pool.query(
        `SELECT id, email
        FROM utilisateurs
        WHERE LOWER(email) = LOWER($1)
        AND ($2::integer IS NULL OR id <> $2)`,
        [email, excludedUserId]
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
    email,
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
                email,
                mot_de_passe,
                role
            )
            VALUES (
                $1,
                $2,
                $3,
                'adherent'
            )
            RETURNING id, code, role`,
            [
                code,
                email,
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
    email,
    telephone,
    adresse,
    dateAdhesion,
    dateExpiration
) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            `UPDATE utilisateurs
            SET email = $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = (
                SELECT id_utilisateur
                FROM adherents
                WHERE id = $2
            )`,
            [email, id]
        );

        const result = await client.query(
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

        await client.query('COMMIT');
        return result.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const adherentResult = await client.query(
            `SELECT id_utilisateur
             FROM adherents
             WHERE id = $1
             FOR UPDATE`,
            [id]
        );
        const adherent = adherentResult.rows[0];

        if (!adherent) {
            await client.query('ROLLBACK');
            return null;
        }

        const loansResult = await client.query(
            `SELECT 1
             FROM emprunts
             WHERE id_adherent = $1
             LIMIT 1`,
            [id]
        );

        if (loansResult.rowCount > 0) {
            throw new AppError(
                'Cet adhérent ne peut pas être supprimé car il possède un historique d’emprunts',
                409
            );
        }

        await client.query('DELETE FROM adherents WHERE id = $1', [id]);
        const userResult = await client.query(
            'DELETE FROM utilisateurs WHERE id = $1 RETURNING id',
            [adherent.id_utilisateur]
        );

        await client.query('COMMIT');
        return userResult.rows[0] || null;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}