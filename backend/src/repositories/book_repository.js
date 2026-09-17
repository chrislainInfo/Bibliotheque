import pool from '../config/database.js';
import AppError from '../errors/AppErrors.js';


export async function findAllBooks(limit, offset) {
    const result = await pool.query(
        `SELECT
            l.id,
            l.titre,
            l.isbn,
            l.date_publication,
            l.description,
            l.id_categorie,
            c.designation AS categorie,
            l.cree_par,
            l.total_exemplaires,
            l.exemplaires_disponibles,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', a.id,
                        'prenom', a.prenom,
                        'nom', a.nom,
                        'nationalite', a.nationalite
                    ) ORDER BY a.nom ASC, a.prenom ASC
                ) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) AS auteurs
        FROM livres l
        INNER JOIN categories c
            ON c.id = l.id_categorie
        LEFT JOIN livres_auteurs la
            ON la.id_livre = l.id
        LEFT JOIN auteurs a
            ON a.id = la.id_auteur
        GROUP BY
            l.id, l.titre, l.isbn, l.date_publication, l.description,
            l.id_categorie, c.designation, l.cree_par,
            l.total_exemplaires, l.exemplaires_disponibles
        ORDER BY l.titre ASC
        LIMIT $1
        OFFSET $2`,
        [limit, offset]
    );

    return result.rows;
}


export async function countBooks() {
    const result = await pool.query(
        `SELECT COUNT(*) AS total
        FROM livres`
    );

    return Number(result.rows[0].total);
}


export async function findBookById(id) {
    const result = await pool.query(
        `SELECT
            l.id,
            l.titre,
            l.isbn,
            l.date_publication,
            l.description,
            l.id_categorie,
            c.designation AS categorie,
            l.cree_par,
            l.total_exemplaires,
            l.exemplaires_disponibles
        FROM livres l
        INNER JOIN categories c
            ON c.id = l.id_categorie
        WHERE l.id = $1`,
        [id]
    );

    return result.rows[0] || null;
}


//Vérifier l'existence d'un ISBN
export async function findBookByIsbn(isbn) {
    const result = await pool.query(
        `SELECT
            id,
            titre,
            isbn
        FROM livres
        WHERE isbn = $1`,
        [isbn]
    );

    return result.rows[0] || null;
}


//Vérifier l'existence d'une catégorie
export async function findCategoryById(id) {
    const result = await pool.query(
        `SELECT
            id,
            designation
        FROM categories
        WHERE id = $1`,
        [id]
    );

    return result.rows[0] || null;
}

//Vérifier l'existence des auteurs
export async function findAuthorsByIds(authorIds) {
    const result = await pool.query(
        `SELECT
            id,
            prenom,
            nom,
            nationalite
        FROM auteurs
        WHERE id = ANY($1::integer[])`,
        [authorIds]
    );

    return result.rows;
}


//Récupérer les auteurs d'un livre
export async function findAuthorsByBookId(bookId) {
    const result = await pool.query(
        `SELECT
            a.id,
            a.prenom,
            a.nom,
            a.nationalite
        FROM auteurs a
        INNER JOIN livres_auteurs la
            ON la.id_auteur = a.id
        WHERE la.id_livre = $1
        ORDER BY a.nom ASC, a.prenom ASC`,
        [bookId]
    );

    return result.rows;
}


//Créer un livre + ses associations avec les auteurs
export async function createBook(
    titre,
    isbn,
    datePublication,
    description,
    idCategorie,
    totalExemplaires,
    idUtilisateur,
    authorIds
) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        //Créer le livre
        
        const bookResult = await client.query(
            `INSERT INTO livres (
                titre,
                isbn,
                date_publication,
                description,
                id_categorie,
                cree_par,
                total_exemplaires,
                exemplaires_disponibles
            )
            SELECT
                $1,
                $2,
                $3,
                $4,
                $5,
                b.id,
                $6,
                $6
            FROM bibliothecaires b
            WHERE b.id_utilisateur = $7
            RETURNING
                id,
                titre,
                isbn,
                date_publication,
                description,
                id_categorie,
                cree_par,
                total_exemplaires,
                exemplaires_disponibles`,
            [
                titre,
                isbn,
                datePublication,
                description,
                idCategorie,
                totalExemplaires,
                idUtilisateur
            ]
        );

        const book = bookResult.rows[0];

        if (!book) {
            throw new AppError(
                'Le bibliothécaire connecté est introuvable',
                404
            );
        }

        //Ajouter les auteurs dans livres_auteurs
        for (const authorId of authorIds) {
            await client.query(
                `INSERT INTO livres_auteurs (
                    id_livre,
                    id_auteur
                )
                VALUES ($1, $2)`,
                [book.id, authorId]
            );
        }


        await client.query('COMMIT');

        return book;

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {
        client.release();
    }
}


//Modifier un livre + ses auteurs
export async function updateBook(
    id,
    titre,
    isbn,
    datePublication,
    description,
    idCategorie,
    totalExemplaires,
    authorIds
) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        //Modifier le livre

        const bookResult = await client.query(
            `UPDATE livres
            SET
                titre = $1,
                isbn = $2,
                date_publication = $3,
                description = $4,
                id_categorie = $5,
                total_exemplaires = $6,
                exemplaires_disponibles =
                    exemplaires_disponibles +
                    ($6 - total_exemplaires),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING
                id,
                titre,
                isbn,
                date_publication,
                description,
                id_categorie,
                cree_par,
                total_exemplaires,
                exemplaires_disponibles`,
            [
                titre,
                isbn,
                datePublication,
                description,
                idCategorie,
                totalExemplaires,
                id
            ]
        );

        const book = bookResult.rows[0];

        if (!book) {
            throw new AppError(
                'Livre introuvable',
                404
            );
        }

        //Supprimer les anciennes associations

        await client.query(
            `DELETE FROM livres_auteurs
            WHERE id_livre = $1`,
            [id]
        );


        //Ajouter les nouvelles associations

        for (const authorId of authorIds) {
            await client.query(
                `INSERT INTO livres_auteurs (
                    id_livre,
                    id_auteur
                )
                VALUES ($1, $2)`,
                [id, authorId]
            );
        }


        await client.query('COMMIT');

        return book;

    } catch (error) {

        await client.query('ROLLBACK');

        throw error;

    } finally {
        client.release();
    }
}


//Supprimer un livre
export async function deleteBook(id) {
    const result = await pool.query(
        `DELETE FROM livres
        WHERE id = $1
        RETURNING id`,
        [id]
    );

    return result.rows[0] || null;
}