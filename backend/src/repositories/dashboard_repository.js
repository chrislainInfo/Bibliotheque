import pool from '../config/database.js';


// Dashboard bibliothécaire
export async function getBibliothecaireDashboard() {

    const statisticsResult = await pool.query(
        `SELECT
            (SELECT COUNT(*) FROM livres) AS livres,
            (SELECT COALESCE(SUM(total_exemplaires), 0) FROM livres) AS total_exemplaires,
            (SELECT COALESCE(SUM(exemplaires_disponibles), 0) FROM livres) AS exemplaires_disponibles,
            (SELECT COUNT(*) FROM adherents) AS adherents,
            (SELECT COUNT(*) FROM auteurs) AS auteurs,
            (SELECT COUNT(*)
             FROM emprunts
             WHERE date_retour IS NULL) AS emprunts_actifs,
            (SELECT COUNT(*)
             FROM emprunts
             WHERE date_retour IS NULL
             AND date_retour_prevue < CURRENT_DATE) AS emprunts_en_retard`
    );


    const recentLoansResult = await pool.query(
        `SELECT
            e.id,
            a.prenom AS adherent_prenom,
            a.nom AS adherent_nom,
            l.titre AS livre_titre,
            e.date_emprunt,
            e.date_retour_prevue,
            e.date_retour
        FROM emprunts e

        INNER JOIN adherents a
            ON a.id = e.id_adherent

        INNER JOIN livres l
            ON l.id = e.id_livre

        ORDER BY e.date_emprunt DESC, e.id DESC

        LIMIT 5`
    );


    const lateLoansResult = await pool.query(
        `SELECT
            e.id,
            a.prenom AS adherent_prenom,
            a.nom AS adherent_nom,
            l.titre AS livre_titre,
            e.date_emprunt,
            e.date_retour_prevue
        FROM emprunts e

        INNER JOIN adherents a
            ON a.id = e.id_adherent

        INNER JOIN livres l
            ON l.id = e.id_livre

        WHERE e.date_retour IS NULL
        AND e.date_retour_prevue < CURRENT_DATE

        ORDER BY e.date_retour_prevue ASC

        LIMIT 5`
    );


    const popularBooksResult = await pool.query(
        `SELECT
            l.id,
            l.titre,
            COUNT(e.id) AS nombre_emprunts
        FROM livres l

        INNER JOIN emprunts e
            ON e.id_livre = l.id

        GROUP BY l.id, l.titre

        ORDER BY COUNT(e.id) DESC

        LIMIT 5`
    );


    return {
        statistiques: {
            livres: Number(
                statisticsResult.rows[0].livres
            ),
            total_exemplaires: Number(
                statisticsResult.rows[0].total_exemplaires
            ),
            exemplaires_disponibles: Number(
                statisticsResult.rows[0].exemplaires_disponibles
            ),
            exemplaires_empruntes: Number(
                statisticsResult.rows[0].total_exemplaires
                - statisticsResult.rows[0].exemplaires_disponibles
            ),
            adherents: Number(
                statisticsResult.rows[0].adherents
            ),
            auteurs: Number(
                statisticsResult.rows[0].auteurs
            ),
            emprunts_actifs: Number(
                statisticsResult.rows[0].emprunts_actifs
            ),
            emprunts_en_retard: Number(
                statisticsResult.rows[0].emprunts_en_retard
            )
        },

        emprunts_recents: recentLoansResult.rows,

        emprunts_en_retard: lateLoansResult.rows,

        livres_plus_empruntes: popularBooksResult.rows
    };
}


// Dashboard adhérent
export async function getAdherentDashboard(
    idUtilisateur
) {

    const adherentResult = await pool.query(
        `SELECT
            a.id,
            a.prenom,
            a.nom,
            a.telephone,
            a.adresse,
            a.date_adhesion,
            a.date_expiration
        FROM adherents a

        WHERE a.id_utilisateur = $1`,
        [idUtilisateur]
    );

    const adherent = adherentResult.rows[0];

    if (!adherent) {
        return null;
    }


    const statisticsResult = await pool.query(
        `SELECT
            COUNT(*) FILTER (
                WHERE date_retour IS NULL
            ) AS emprunts_actifs,

            COUNT(*) FILTER (
                WHERE date_retour IS NULL
                AND date_retour_prevue < CURRENT_DATE
            ) AS emprunts_en_retard,

            COUNT(*) FILTER (
                WHERE date_retour IS NOT NULL
            ) AS emprunts_retournes

        FROM emprunts

        WHERE id_adherent = $1`,
        [adherent.id]
    );


    const loansResult = await pool.query(
        `SELECT
            e.id,
            l.titre AS livre_titre,
            l.isbn,
            e.date_emprunt,
            e.date_retour_prevue,
            e.date_retour,

            CASE
                WHEN e.date_retour IS NOT NULL
                    THEN 'retourne'

                WHEN e.date_retour_prevue < CURRENT_DATE
                    THEN 'en_retard'

                ELSE 'en_cours'
            END AS statut

        FROM emprunts e

        INNER JOIN livres l
            ON l.id = e.id_livre

        WHERE e.id_adherent = $1

        ORDER BY e.date_emprunt DESC, e.id DESC`,
        [adherent.id]
    );


    return {
        profil: adherent,

        statistiques: {
            emprunts_actifs: Number(
                statisticsResult.rows[0].emprunts_actifs
            ),
            emprunts_en_retard: Number(
                statisticsResult.rows[0].emprunts_en_retard
            ),
            emprunts_retournes: Number(
                statisticsResult.rows[0].emprunts_retournes
            )
        },

        emprunts: loansResult.rows
    };
}