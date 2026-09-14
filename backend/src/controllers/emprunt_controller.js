import AppError from '../errors/AppErrors.js';

import {
    findAllEmprunts,
    countEmprunts,
    findEmpruntById,
    findAdherentById,
    findBookById,
    countActiveLoansByAdherent,
    createEmprunt,
    updateEmprunt,
    returnEmprunt,
    deleteEmprunt
} from '../repositories/emprunt_repository.js';


// GET /api/emprunts
export async function getEmprunts(req, res) {

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

    const emprunts = await findAllEmprunts(
        limit,
        offset
    );

    const total = await countEmprunts();

    const totalPages = Math.ceil(
        total / limit
    );

    return res.status(200).json({
        emprunts,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    });
}


// GET /api/emprunts/:id
export async function getEmpruntById(req, res) {

    const { id } = req.params;

    const empruntId = Number(id);

    if (!Number.isInteger(empruntId) || empruntId <= 0) {
        throw new AppError(
            'ID emprunt invalide',
            400
        );
    }

    const emprunt = await findEmpruntById(
        empruntId
    );

    if (!emprunt) {
        throw new AppError(
            'Emprunt introuvable',
            404
        );
    }

    return res.status(200).json({
        emprunt
    });
}


// POST /api/emprunts
export async function createEmpruntController(req, res) {

    const {
        id_adherent,
        id_livre,
        date_emprunt,
        date_retour_prevue
    } = req.body;

    const adherentId = Number(id_adherent);
    const bookId = Number(id_livre);

    if (
        !Number.isInteger(adherentId) ||
        adherentId <= 0
    ) {
        throw new AppError(
            'ID adhérent invalide',
            400
        );
    }

    if (
        !Number.isInteger(bookId) ||
        bookId <= 0
    ) {
        throw new AppError(
            'ID livre invalide',
            400
        );
    }

    if (!date_emprunt) {
        throw new AppError(
            'La date d’emprunt est obligatoire',
            400
        );
    }

    if (!date_retour_prevue) {
        throw new AppError(
            'La date de retour prévue est obligatoire',
            400
        );
    }

    if (
        new Date(date_retour_prevue) <
        new Date(date_emprunt)
    ) {
        throw new AppError(
            'La date de retour prévue doit être supérieure ou égale à la date d’emprunt',
            400
        );
    }


    const adherent = await findAdherentById(
        adherentId
    );

    if (!adherent) {
        throw new AppError(
            'Adhérent introuvable',
            404
        );
    }


    if (
        new Date(adherent.date_expiration) <
        new Date(date_emprunt)
    ) {
        throw new AppError(
            'L’adhésion de cet adhérent est expirée',
            409
        );
    }


    const book = await findBookById(
        bookId
    );

    if (!book) {
        throw new AppError(
            'Livre introuvable',
            404
        );
    }


    if (book.exemplaires_disponibles <= 1) {
        throw new AppError(
            'Cet emprunt est impossible : la bibliothèque doit conserver au moins un exemplaire',
            409
        );
    }


    const activeLoans =
        await countActiveLoansByAdherent(
            adherentId
        );

    if (activeLoans >= 3) {
        throw new AppError(
            'Cet adhérent a déjà atteint la limite de 3 emprunts actifs',
            409
        );
    }


    const emprunt = await createEmprunt(
        adherentId,
        bookId,
        date_emprunt,
        date_retour_prevue,
        req.user.id
    );


    return res.status(201).json({
        message: 'Emprunt créé avec succès',
        emprunt
    });
}


// PUT /api/emprunts/:id
export async function updateEmpruntController(req, res) {

    const { id } = req.params;

    const {
        id_adherent,
        id_livre,
        date_emprunt,
        date_retour_prevue
    } = req.body;

    const empruntId = Number(id);
    const adherentId = Number(id_adherent);
    const bookId = Number(id_livre);


    if (
        !Number.isInteger(empruntId) ||
        empruntId <= 0
    ) {
        throw new AppError(
            'ID emprunt invalide',
            400
        );
    }

    if (
        !Number.isInteger(adherentId) ||
        adherentId <= 0
    ) {
        throw new AppError(
            'ID adhérent invalide',
            400
        );
    }

    if (
        !Number.isInteger(bookId) ||
        bookId <= 0
    ) {
        throw new AppError(
            'ID livre invalide',
            400
        );
    }

    if (!date_emprunt) {
        throw new AppError(
            'La date d’emprunt est obligatoire',
            400
        );
    }

    if (!date_retour_prevue) {
        throw new AppError(
            'La date de retour prévue est obligatoire',
            400
        );
    }

    if (
        new Date(date_retour_prevue) <
        new Date(date_emprunt)
    ) {
        throw new AppError(
            'La date de retour prévue doit être supérieure ou égale à la date d’emprunt',
            400
        );
    }


    const emprunt = await findEmpruntById(
        empruntId
    );

    if (!emprunt) {
        throw new AppError(
            'Emprunt introuvable',
            404
        );
    }

    if (emprunt.date_retour !== null) {
        throw new AppError(
            'Un emprunt déjà retourné ne peut plus être modifié',
            409
        );
    }


    const adherent = await findAdherentById(
        adherentId
    );

    if (!adherent) {
        throw new AppError(
            'Adhérent introuvable',
            404
        );
    }


    if (
        new Date(adherent.date_expiration) <
        new Date(date_emprunt)
    ) {
        throw new AppError(
            'L’adhésion de cet adhérent est expirée',
            409
        );
    }


    const book = await findBookById(
        bookId
    );

    if (!book) {
        throw new AppError(
            'Livre introuvable',
            404
        );
    }


    const activeLoans =
        await countActiveLoansByAdherent(
            adherentId,
            empruntId
        );

    if (activeLoans >= 3) {
        throw new AppError(
            'Cet adhérent a déjà atteint la limite de 3 emprunts actifs',
            409
        );
    }


    if (
        emprunt.id_livre !== bookId &&
        book.exemplaires_disponibles <= 1
    ) {
        throw new AppError(
            'Ce livre ne peut pas être attribué : la bibliothèque doit conserver au moins un exemplaire',
            409
        );
    }


    const updatedEmprunt =
        await updateEmprunt(
            empruntId,
            adherentId,
            bookId,
            date_emprunt,
            date_retour_prevue
        );


    return res.status(200).json({
        message: 'Emprunt modifié avec succès',
        emprunt: updatedEmprunt
    });
}


// PUT /api/emprunts/:id/retour
export async function returnEmpruntController(req, res) {

    const { id } = req.params;

    const { date_retour } = req.body;

    const empruntId = Number(id);

    if (
        !Number.isInteger(empruntId) ||
        empruntId <= 0
    ) {
        throw new AppError(
            'ID emprunt invalide',
            400
        );
    }

    if (!date_retour) {
        throw new AppError(
            'La date de retour est obligatoire',
            400
        );
    }


    const emprunt = await findEmpruntById(
        empruntId
    );

    if (!emprunt) {
        throw new AppError(
            'Emprunt introuvable',
            404
        );
    }

    if (emprunt.date_retour !== null) {
        throw new AppError(
            'Cet emprunt a déjà été retourné',
            409
        );
    }


    if (
        new Date(date_retour) <
        new Date(emprunt.date_emprunt)
    ) {
        throw new AppError(
            'La date de retour ne peut pas être antérieure à la date d’emprunt',
            400
        );
    }


    const returnedEmprunt =
        await returnEmprunt(
            empruntId,
            date_retour
        );


    return res.status(200).json({
        message: 'Livre retourné avec succès',
        emprunt: returnedEmprunt
    });
}


// DELETE /api/emprunts/:id
export async function deleteEmpruntController(req, res) {

    const { id } = req.params;

    const empruntId = Number(id);

    if (
        !Number.isInteger(empruntId) ||
        empruntId <= 0
    ) {
        throw new AppError(
            'ID emprunt invalide',
            400
        );
    }


    const emprunt = await findEmpruntById(
        empruntId
    );

    if (!emprunt) {
        throw new AppError(
            'Emprunt introuvable',
            404
        );
    }

    if (emprunt.date_retour !== null) {
        throw new AppError(
            'Un emprunt déjà retourné ne peut pas être supprimé',
            409
        );
    }


    await deleteEmprunt(empruntId);


    return res.status(200).json({
        message: 'Emprunt supprimé avec succès'
    });
}