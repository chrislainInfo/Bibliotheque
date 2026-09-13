import AppError from '../errors/AppErrors.js';

import {
    findAllBooks,
    countBooks,
    findBookById,
    findBookByIsbn,
    findCategoryById,
    findAuthorsByIds,
    findAuthorsByBookId,
    createBook,
    updateBook,
    deleteBook
} from '../repositories/book_repository.js';


//Validation des auteurs
function validateAuthors(authors) {

    if (!Array.isArray(authors) || authors.length === 0) {
        throw new AppError(
            'Le livre doit avoir au moins un auteur',
            400
        );
    }

    for (const authorId of authors) {

        if (!Number.isInteger(authorId) || authorId <= 0) {
            throw new AppError(
                'Chaque identifiant d’auteur doit être un entier supérieur à 0',
                400
            );
        }
    }


    const uniqueAuthors = new Set(authors);

    if (uniqueAuthors.size !== authors.length) {
        throw new AppError(
            'Un même auteur ne peut pas être associé plusieurs fois au même livre',
            400
        );
    }
}


//GET /api/livres
export async function getBooks(req, res) {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!Number.isInteger(page) || page <= 0) {
        throw new AppError(
            'Le numéro de page doit être un entier supérieur à 0',
            400
        );
    }

    if (!Number.isInteger(limit) || limit <= 0) {
        throw new AppError(
            'La limite doit être un entier supérieur à 0',
            400
        );
    }

    const offset = (page - 1) * limit;

    const books = await findAllBooks(
        limit,
        offset
    );

    const total = await countBooks();

    const totalPages = Math.ceil(
        total / limit
    );

    return res.json({
        books,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    });
}


//GET /api/livres/:id
export async function getBookById(req, res) {

    const id = Number(req.params.id);

    if ( !Number.isInteger(id) || id <= 0 ) {

        throw new AppError(
            'Identifiant du livre invalide',
            400
        );
    }

    const book = await findBookById(id);

    if (!book) {
        throw new AppError(
            'Livre introuvable',
            404
        );
    }

    const authors = await findAuthorsByBookId(id);

    return res.status(200).json({
        book,
        authors
    });
}


//POST /api/livres
export async function createBookController(req, res) {

    const {
        titre,
        isbn,
        date_publication,
        description,
        id_categorie,
        total_exemplaires,
        auteurs
    } = req.body;


    //Titre
    if (
        typeof titre !== 'string' ||
        titre.trim() === ''
    ) {
        throw new AppError(
            'Le titre du livre est obligatoire',
            400
        );
    }


    //ISBN
    if (
        typeof isbn !== 'string' ||
        isbn.trim() === ''
    ) {
        throw new AppError(
            'L’ISBN est obligatoire',
            400
        );
    }

    const cleanTitre = titre.trim();
    const cleanIsbn = isbn.trim();

    //Catégorie
    const categoryId = Number(id_categorie);

    if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
    ) {
        throw new AppError(
            'L’identifiant de la catégorie est invalide',
            400
        );
    }


    //Nombre d'exemplaires
    const totalExemplaires = Number(
        total_exemplaires
    );

    if (
        !Number.isInteger(totalExemplaires) ||
        totalExemplaires <= 0
    ) {
        throw new AppError(
            'Le nombre total d’exemplaires doit être un entier supérieur à 0',
            400
        );
    }

    //Auteurs

    validateAuthors(auteurs);

    //Vérifier l'ISBN

    const existingBook = await findBookByIsbn(
        cleanIsbn
    );

    if (existingBook) {
        throw new AppError(
            'Un livre avec cet ISBN existe déjà',
            409
        );
    }

    // Vérifier la catégorie

    const category = await findCategoryById(
        categoryId
    );

    if (!category) {
        throw new AppError(
            'La catégorie indiquée n’existe pas',
            404
        );
    }

    //Vérifier les auteurs

    const authors = await findAuthorsByIds(
        auteurs
    );

    if (authors.length !== auteurs.length) {
        throw new AppError(
            'Un ou plusieurs auteurs indiqués n’existent pas',
            404
        );
    }

    //Création

    const book = await createBook(
        cleanTitre,
        cleanIsbn,
        date_publication || null,
        description?.trim() || null,
        categoryId,
        totalExemplaires,
        req.user.id,
        auteurs
    );


    return res.status(201).json({
        message: 'Livre créé avec succès',
        book,
        authors
    });
}


//PUT /api/livres/:id
export async function updateBookController(req, res) {

    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new AppError(
            'Identifiant du livre invalide',
            400
        );
    }


    const {
        titre,
        isbn,
        date_publication,
        description,
        id_categorie,
        total_exemplaires,
        auteurs
    } = req.body;


    //Vérifier le livre
    
    const existingBook = await findBookById(id);

    if (!existingBook) {
        throw new AppError(
            'Livre introuvable',
            404
        );
    }

    //Titre

    if (
        typeof titre !== 'string' ||
        titre.trim() === ''
    ) {
        throw new AppError(
            'Le titre du livre est obligatoire',
            400
        );
    }

    //ISBN

    if (
        typeof isbn !== 'string' ||
        isbn.trim() === ''
    ) {
        throw new AppError(
            'L’ISBN est obligatoire',
            400
        );
    }

    const cleanTitre = titre.trim();
    const cleanIsbn = isbn.trim();

    //Vérifier l'unicité de l'ISBN

    const existingIsbn = await findBookByIsbn(
        cleanIsbn
    );

    if (
        existingIsbn &&
        existingIsbn.id !== id
    ) {
        throw new AppError(
            'Un autre livre possède déjà cet ISBN',
            409
        );
    }

    //Catégorie

    const categoryId = Number(id_categorie);

    if (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
    ) {
        throw new AppError(
            'L’identifiant de la catégorie est invalide',
            400
        );
    }

    const category = await findCategoryById(
        categoryId
    );

    if (!category) {
        throw new AppError(
            'La catégorie indiquée n’existe pas',
            404
        );
    }

    //Nombre d'exemplaires

    const totalExemplaires = Number(
        total_exemplaires
    );

    if (
        !Number.isInteger(totalExemplaires) ||
        totalExemplaires <= 0
    ) {
        throw new AppError(
            'Le nombre total d’exemplaires doit être un entier supérieur à 0',
            400
        );
    }

    //Vérifier les exemplaires actuellement empruntés

    const nombreEmpruntes =
        existingBook.total_exemplaires -
        existingBook.exemplaires_disponibles;

    if (
        totalExemplaires < nombreEmpruntes
    ) {
        throw new AppError(
            `Impossible de définir ${totalExemplaires} exemplaires : ${nombreEmpruntes} exemplaire(s) sont actuellement emprunté(s)`,
            400
        );
    }

    //Auteurs

    validateAuthors(auteurs);

    const authors = await findAuthorsByIds(
        auteurs
    );

    if (authors.length !== auteurs.length) {
        throw new AppError(
            'Un ou plusieurs auteurs indiqués n’existent pas',
            404
        );
    }

    //Modification

    const book = await updateBook(
        id,
        cleanTitre,
        cleanIsbn,
        date_publication || null,
        description?.trim() || null,
        categoryId,
        totalExemplaires,
        auteurs
    );


    return res.status(200).json({
        message: 'Livre modifié avec succès',
        book,
        authors
    });
}

//DELETE /api/livres/:id
export async function deleteBookController(req, res) {

    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new AppError(
            'Identifiant du livre invalide',
            400
        );
    }

    //Vérifier le livre

    const book = await findBookById(id);

    if (!book) {
        throw new AppError(
            'Livre introuvable',
            404
        );
    }

    //Vérifier les emprunts 

    if (
        book.exemplaires_disponibles <
        book.total_exemplaires
    ) {
        throw new AppError(
            'Impossible de supprimer ce livre car certains exemplaires sont actuellement empruntés',
            400
        );
    }

    //Supprimer

    const deletedBook = await deleteBook(id);

    if (!deletedBook) {
        throw new AppError(
            'Impossible de supprimer le livre',
            500
        );
    }


    return res.json({
        message: 'Livre supprimé avec succès'
    });
}