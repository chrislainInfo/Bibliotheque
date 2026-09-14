import pool from '../config/database.js';
import AppError from '../errors/AppErrors.js';


// GET /api/emprunts
export async function findAllEmprunts(limit, offset) {

    const result = await pool.query(
        `SELECT
            e.id,
            e.id_adherent,
            a.prenom AS adherent_prenom,
            a.nom AS adherent_nom,
            e.id_livre,
            l.titre AS livre_titre,
            l.isbn,
            e.id_bibliothecaire,
            b.prenom AS bibliothecaire_prenom,
            b.nom AS bibliothecaire_nom,
            e.date_emprunt,
            e.date_retour_prevue,
            e.date_retour,
            CASE
                WHEN e.date_retour IS NOT NULL THEN 'retourne'
                WHEN e.date_retour_prevue < CURRENT_DATE THEN 'en_retard'
                ELSE 'en_cours'
            END AS statut
        FROM emprunts e

        INNER JOIN adherents a ON a.id = e.id_adherent

        INNER JOIN livres l ON l.id = e.id_livre

        INNER JOIN bibliothecaires b ON b.id = e.id_bibliothecaire

        ORDER BY e.date_emprunt DESC, e.id DESC

        LIMIT $1
        OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
}


// Compter les emprunts
export async function countEmprunts() {

    const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM emprunts`
    );

    return Number(result.rows[0].total);
}


// GET /api/emprunts/:id
export async function findEmpruntById(id) {

    const result = await pool.query(
        `SELECT
            e.id,
            e.id_adherent,
            a.prenom AS adherent_prenom,
            a.nom AS adherent_nom,
            e.id_livre,
            l.titre AS livre_titre,
            l.isbn,
            e.id_bibliothecaire,
            b.prenom AS bibliothecaire_prenom,
            b.nom AS bibliothecaire_nom,
            e.date_emprunt,
            e.date_retour_prevue,
            e.date_retour,
            CASE
                WHEN e.date_retour IS NOT NULL THEN 'retourne'
                WHEN e.date_retour_prevue < CURRENT_DATE THEN 'en_retard'
                ELSE 'en_cours'
            END AS statut
        FROM emprunts e

        INNER JOIN adherents a
            ON a.id = e.id_adherent

        INNER JOIN livres l
            ON l.id = e.id_livre

        INNER JOIN bibliothecaires b
            ON b.id = e.id_bibliothecaire

        WHERE e.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


// Vérifier l'adhérent
export async function findAdherentById(id) {

    const result = await pool.query(
        `SELECT
            id,
            id_utilisateur,
            prenom,
            nom,
            date_adhesion,
            date_expiration
        FROM adherents
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


// Vérifier le livre
export async function findBookById(id) {

    const result = await pool.query(
        `SELECT
            id,
            titre,
            isbn,
            total_exemplaires,
            exemplaires_disponibles
        FROM livres
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


// Compter les emprunts actifs d'un adhérent
export async function countActiveLoansByAdherent(
    adherentId,
    excludedLoanId = null
) {

    const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM emprunts
        WHERE id_adherent = $1
        AND date_retour IS NULL
        AND ($2::integer IS NULL OR id <> $2)`,
        [
            adherentId,
            excludedLoanId
        ]
    );

    return Number(result.rows[0].total);
}


// Créer un emprunt
export async function createEmprunt(
    adherentId,
    bookId,
    dateEmprunt,
    dateRetourPrevue,
    idUtilisateur
) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');

        const bookResult = await client.query(
            `SELECT
                id,
                titre,
                exemplaires_disponibles
            FROM livres
            WHERE id = $1
            FOR UPDATE`,
            [bookId]
        );

        const book = bookResult.rows[0];

        if (!book) {
            throw new AppError(
                'Livre introuvable',
                404
            );
        }

        if (book.exemplaires_disponibles <= 1) {
            throw new AppError(
                'Cet emprunt est impossible : la bibliothèque doit conserver au moins un exemplaire de ce livre',
                409
            );
        }


        const activeLoansResult = await client.query(
            `SELECT COUNT(*) AS total
            FROM emprunts
            WHERE id_adherent = $1
            AND date_retour IS NULL`,
            [adherentId]
        );

        const activeLoans =
            Number(activeLoansResult.rows[0].total);

        if (activeLoans >= 3) {
            throw new AppError(
                'Cet adhérent a déjà atteint la limite de 3 emprunts actifs',
                409
            );
        }


        const librarianResult = await client.query(
            `SELECT id
            FROM bibliothecaires
            WHERE id_utilisateur = $1`,
            [idUtilisateur]
        );

        const librarian = librarianResult.rows[0];

        if (!librarian) {
            throw new AppError(
                'Bibliothécaire introuvable',
                404
            );
        }


        const loanResult = await client.query(
            `INSERT INTO emprunts (
                id_adherent,
                id_livre,
                id_bibliothecaire,
                date_emprunt,
                date_retour_prevue
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                id_adherent,
                id_livre,
                id_bibliothecaire,
                date_emprunt,
                date_retour_prevue,
                date_retour`,
            [
                adherentId,
                bookId,
                librarian.id,
                dateEmprunt,
                dateRetourPrevue
            ]
        );


        await client.query(
            `UPDATE livres
            SET
                exemplaires_disponibles =
                    exemplaires_disponibles - 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [bookId]
        );


        await client.query('COMMIT');

        return loanResult.rows[0];

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


// Modifier un emprunt en cours
export async function updateEmprunt(
    id,
    adherentId,
    bookId,
    dateEmprunt,
    dateRetourPrevue
) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');


        const loanResult = await client.query(
            `SELECT
                id,
                id_adherent,
                id_livre,
                date_retour
            FROM emprunts
            WHERE id = $1
            FOR UPDATE`,
            [id]
        );

        const oldLoan = loanResult.rows[0];

        if (!oldLoan) {
            throw new AppError(
                'Emprunt introuvable',
                404
            );
        }

        if (oldLoan.date_retour !== null) {
            throw new AppError(
                'Un emprunt déjà retourné ne peut plus être modifié',
                409
            );
        }


        const adherentResult = await client.query(
            `SELECT id
            FROM adherents
            WHERE id = $1`,
            [adherentId]
        );

        if (!adherentResult.rows[0]) {
            throw new AppError(
                'Adhérent introuvable',
                404
            );
        }


        const bookResult = await client.query(
            `SELECT
                id,
                exemplaires_disponibles
            FROM livres
            WHERE id = $1
            FOR UPDATE`,
            [bookId]
        );

        const newBook = bookResult.rows[0];

        if (!newBook) {
            throw new AppError(
                'Livre introuvable',
                404
            );
        }


        const activeLoansResult = await client.query(
            `SELECT COUNT(*) AS total
            FROM emprunts
            WHERE id_adherent = $1
            AND date_retour IS NULL
            AND id <> $2`,
            [
                adherentId,
                id
            ]
        );

        const activeLoans =
            Number(activeLoansResult.rows[0].total);

        if (activeLoans >= 3) {
            throw new AppError(
                'Cet adhérent a déjà atteint la limite de 3 emprunts actifs',
                409
            );
        }


        if (
            oldLoan.id_livre !== bookId &&
            newBook.exemplaires_disponibles <= 1
        ) {
            throw new AppError(
                'Ce livre ne peut pas être attribué : la bibliothèque doit conserver au moins un exemplaire',
                409
            );
        }


        if (oldLoan.id_livre !== bookId) {

            await client.query(
                `UPDATE livres
                SET
                    exemplaires_disponibles =
                        exemplaires_disponibles + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1`,
                [oldLoan.id_livre]
            );


            await client.query(
                `UPDATE livres
                SET
                    exemplaires_disponibles =
                        exemplaires_disponibles - 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $1`,
                [bookId]
            );
        }


        const updatedLoanResult = await client.query(
            `UPDATE emprunts
            SET
                id_adherent = $1,
                id_livre = $2,
                date_emprunt = $3,
                date_retour_prevue = $4
            WHERE id = $5
            RETURNING
                id,
                id_adherent,
                id_livre,
                id_bibliothecaire,
                date_emprunt,
                date_retour_prevue,
                date_retour`,
            [
                adherentId,
                bookId,
                dateEmprunt,
                dateRetourPrevue,
                id
            ]
        );


        await client.query('COMMIT');

        return updatedLoanResult.rows[0];

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


// Retour d'un emprunt
export async function returnEmprunt(id, dateRetour) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');


        const loanResult = await client.query(
            `SELECT
                id,
                id_livre,
                date_retour
            FROM emprunts
            WHERE id = $1
            FOR UPDATE`,
            [id]
        );

        const loan = loanResult.rows[0];

        if (!loan) {
            throw new AppError(
                'Emprunt introuvable',
                404
            );
        }

        if (loan.date_retour !== null) {
            throw new AppError(
                'Cet emprunt a déjà été retourné',
                409
            );
        }


        const updatedLoanResult = await client.query(
            `UPDATE emprunts
            SET
                date_retour = $1
            WHERE id = $2
            RETURNING
                id,
                id_adherent,
                id_livre,
                id_bibliothecaire,
                date_emprunt,
                date_retour_prevue,
                date_retour`,
            [
                dateRetour,
                id
            ]
        );


        await client.query(
            `UPDATE livres
            SET
                exemplaires_disponibles =
                    exemplaires_disponibles + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [loan.id_livre]
        );


        await client.query('COMMIT');

        return updatedLoanResult.rows[0];

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}


// DELETE /api/emprunts/:id
export async function deleteEmprunt(id) {

    const client = await pool.connect();

    try {

        await client.query('BEGIN');


        const loanResult = await client.query(
            `SELECT
                id,
                id_livre,
                date_retour
            FROM emprunts
            WHERE id = $1
            FOR UPDATE`,
            [id]
        );

        const loan = loanResult.rows[0];

        if (!loan) {
            throw new AppError(
                'Emprunt introuvable',
                404
            );
        }

        if (loan.date_retour !== null) {
            throw new AppError(
                'Un emprunt déjà retourné ne peut pas être supprimé',
                409
            );
        }


        await client.query(
            `DELETE FROM emprunts
            WHERE id = $1`,
            [id]
        );


        await client.query(
            `UPDATE livres
            SET
                exemplaires_disponibles =
                    exemplaires_disponibles + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [loan.id_livre]
        );


        await client.query('COMMIT');

        return loan;

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {

        client.release();
    }
}