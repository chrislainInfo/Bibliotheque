import AppError from '../errors/AppErrors.js';

import {
    findAllAuthors,
    countAuthors,
    findAuthorById,
    findAuthorByName,
    createAuthor,
    updateAuthor,
    deleteAuthor
} from '../repositories/author_repository.js';


// GET /api/auteurs
export async function getAuthors(req, res) {

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

    const authors = await findAllAuthors(
        limit,
        offset
    );

    const total = await countAuthors();

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        authors,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    });
}



// GET /api/auteurs/:id
export async function getAuthorById(req, res) {
    const { id } = req.params;

    const authorId = Number(id);

    if (!Number.isInteger(authorId) || authorId <= 0) {
        throw new AppError('ID auteur invalide', 400);
    }

    const author = await findAuthorById(authorId);

    if (!author) {
        throw new AppError('Auteur introuvable', 404);
    }

    return res.status(200).json({
        author
    });
}


// POST /api/auteurs
export async function createAuthorController(req, res) {
    const { prenom, nom, nationalite } = req.body

    if (typeof prenom !== 'string' || typeof nom !== 'string') {
        throw new AppError('Le prénom et le nom sont obligatoires', 400)
    }

    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();

    if (!cleanPrenom) {
        throw new AppError('Le prénom est obligatoire', 400)
    }

    if (!cleanNom) {
        throw new AppError('Le nom est obligatoire', 400)
    }

    // Nationalité facultative
    let cleanNationalite = null;

    if (nationalite !== undefined && nationalite !== null) {

        if (typeof nationalite !== 'string') {
            throw new AppError('Toutes les données doivent être une chaîne de caractères', 400)
        }

        cleanNationalite = nationalite.trim();

        if (!cleanNationalite) {
            cleanNationalite = null;
        }
    }

    //Verification de l'existance de l'auteur
    const existingAuthor = await findAuthorByName(cleanPrenom, cleanNom)

    if (existingAuthor) {
        throw new AppError(
            'Cet auteur existe déjà',
            409
        );
    }


    // Création
    // req.user.id = utilisateurs.id
    const author = await createAuthor(
        cleanPrenom,
        cleanNom,
        cleanNationalite,
        req.user.id
    );


    // Le bibliothécaire correspondant n'existe pas
    if (!author) {
        throw new AppError('Bibliothécaire introuvable', 404)
    }


    return res.status(201).json({
        message: 'Auteur créé avec succès',
        author
    });
}


// PUT /api/auteurs/:id
export async function updateAuthorController(req, res) {
    const { id } = req.params;

    const { prenom, nom, nationalite } = req.body;

    const authorId = Number(id);


    if (!Number.isInteger(authorId) || authorId <= 0) {
        throw new AppError('ID auteur invalide', 400)
    }

    if (!prenom) {
        throw new AppError(
            'Le prénom est obligatoire',
            400
        );
    }

    if (typeof prenom !== 'string') {
        throw new AppError(
            'Le prénom doit être une chaîne de caractères',
            400
        );
    }


    // Vérification du nom
    if (!nom) {
        throw new AppError(
            'Le nom est obligatoire',
            400
        );
    }

    if (typeof nom !== 'string') {
        throw new AppError(
            'Le nom doit être une chaîne de caractères',
            400
        );
    }


    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();


    if (!cleanPrenom) {
        throw new AppError(
            'Le prénom est obligatoire',
            400
        );
    }

    if (!cleanNom) {
        throw new AppError(
            'Le nom est obligatoire',
            400
        );
    }


    // Nationalité facultative
    let cleanNationalite = null;

    if (nationalite !== undefined && nationalite !== null) {

        if (typeof nationalite !== 'string') {
            throw new AppError(
                'La nationalité doit être une chaîne de caractères',
                400
            );
        }

        cleanNationalite = nationalite.trim();

        if (!cleanNationalite) {
            cleanNationalite = null;
        }
    }


    // Vérifier que l'auteur existe
    const author = await findAuthorById(authorId);

    if (!author) {
        throw new AppError(
            'Auteur introuvable',
            404
        );
    }


    // Modification
    const updatedAuthor = await updateAuthor(
        authorId,
        cleanPrenom,
        cleanNom,
        cleanNationalite
    );


    return res.status(200).json({
        message: 'Auteur modifié avec succès',
        author: updatedAuthor
    });
}


// DELETE /api/auteurs/:id
export async function deleteAuthorController(req, res) {
    const { id } = req.params;

    const authorId = Number(id);


    if (!Number.isInteger(authorId) || authorId <= 0) {
        throw new AppError(
            'ID auteur invalide',
            400
        );
    }


    // Vérifier que l'auteur existe
    const author = await findAuthorById(authorId);

    if (!author) {
        throw new AppError(
            'Auteur introuvable',
            404
        );
    }

    await deleteAuthor(authorId);

    return res.status(200).json({
        message: 'Auteur supprimé avec succès'
    });
}