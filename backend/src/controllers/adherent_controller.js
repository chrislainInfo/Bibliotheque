import bcrypt from 'bcrypt';

import AppError from '../errors/AppErrors.js';

import {
    findAllAdherents,
    countAdherents,
    findAdherentById,
    findUserByCode,
    createAdherent,
    updateAdherent,
    deleteAdherent
} from '../repositories/adherent_repository.js';

import { generateAdherentPassword } from '../utils/utils.js';


//GET /api/adherents
export async function getAdherents(req, res) {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;


    if (
        !Number.isInteger(page) ||
        page <= 0
    ) {
        throw new AppError(
            'Le numéro de page doit être un entier supérieur à 0',
            400
        );
    }


    if (
        !Number.isInteger(limit) ||
        limit <= 0
    ) {
        throw new AppError(
            'La limite doit être un entier supérieur à 0',
            400
        );
    }


    const offset = (page - 1) * limit;


    const adherents = await findAllAdherents(
        limit,
        offset
    );


    const total = await countAdherents();


    const totalPages = Math.ceil(
        total / limit
    );


    return res.json({
        adherents,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    });
}


//GET /api/adherents/:id
export async function getAdherentById(req, res) {

    const id = Number(req.params.id);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new AppError(
            'Identifiant de l’adhérent invalide',
            400
        );
    }


    const adherent = await findAdherentById(id);


    if (!adherent) {
        throw new AppError(
            'Adhérent introuvable',
            404
        );
    }


    return res.json({
        adherent
    });
}


//POST /api/adherents
export async function createAdherentController(
    req,
    res
) {

    const {
        prenom,
        nom,
        telephone,
        adresse,
        date_adhesion,
        date_expiration
    } = req.body;

    //Prénom

    if (
        typeof prenom !== 'string' ||
        prenom.trim() === ''
    ) {
        throw new AppError(
            'Le prénom est obligatoire',
            400
        );
    }


    //Nom

    if (
        typeof nom !== 'string' ||
        nom.trim() === ''
    ) {
        throw new AppError(
            'Le nom est obligatoire',
            400
        );
    }

    //Dates

    if (!date_adhesion) {
        throw new AppError(
            'La date d’adhésion est obligatoire',
            400
        );
    }


    if (!date_expiration) {
        throw new AppError(
            'La date d’expiration est obligatoire',
            400
        );
    }


    if (
        new Date(date_expiration) <
        new Date(date_adhesion)
    ) {
        throw new AppError(
            'La date d’expiration doit être supérieure ou égale à la date d’adhésion',
            400
        );
    }


    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();

    const cleanTelephone =
        typeof telephone === 'string'
            ? telephone.trim() || null
            : null;

    const cleanAdresse =
        typeof adresse === 'string'
            ? adresse.trim() || null
            : null;


    //Générer le code / mot de passe

    let password;

    let existingUser;

    do {

        password = generateAdherentPassword();

        existingUser = await findUserByCode( password );

    } while (existingUser);


    //Hash du mot de passe

    const passwordHash = await bcrypt.hash(
        password,
        10
    );

    //Créer l'adhérent

    const result = await createAdherent(
        cleanPrenom,
        cleanNom,
        cleanTelephone,
        cleanAdresse,
        date_adhesion,
        date_expiration,
        password,
        passwordHash,
        req.user.id
    );


    /*
    |--------------------------------------------------------------------------
    | Réponse
    |--------------------------------------------------------------------------
    |
    | Le mot de passe est affiché ici uniquement parce
    | qu'il vient d'être généré.
    |
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
        message: 'Adhérent créé avec succès',

        adherent: result.adherent,

        identifiants: {
            code: result.code,
            mot_de_passe: password
        }
    });
}

//PUT /api/adherents/:id
export async function updateAdherentController(
    req,
    res
) {

    const id = Number(req.params.id);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new AppError(
            'Identifiant de l’adhérent invalide',
            400
        );
    }


    const existingAdherent =
        await findAdherentById(id);


    if (!existingAdherent) {
        throw new AppError(
            'Adhérent introuvable',
            404
        );
    }


    const {
        prenom,
        nom,
        telephone,
        adresse,
        date_adhesion,
        date_expiration
    } = req.body;

    //Validation prénom
    if (
        typeof prenom !== 'string' ||
        prenom.trim() === ''
    ) {
        throw new AppError(
            'Le prénom est obligatoire',
            400
        );
    }

    //Validation nom

    if (
        typeof nom !== 'string' ||
        nom.trim() === ''
    ) {
        throw new AppError(
            'Le nom est obligatoire',
            400
        );
    }

    //Validation dates

    if (!date_adhesion) {
        throw new AppError(
            'La date d’adhésion est obligatoire',
            400
        );
    }


    if (!date_expiration) {
        throw new AppError(
            'La date d’expiration est obligatoire',
            400
        );
    }


    if (
        new Date(date_expiration) <
        new Date(date_adhesion)
    ) {
        throw new AppError(
            'La date d’expiration doit être supérieure ou égale à la date d’adhésion',
            400
        );
    }


    const cleanPrenom = prenom.trim();
    const cleanNom = nom.trim();

    const cleanTelephone =
        typeof telephone === 'string'
            ? telephone.trim() || null
            : null;

    const cleanAdresse =
        typeof adresse === 'string'
            ? adresse.trim() || null
            : null;



    const adherent = await updateAdherent(
        id,
        cleanPrenom,
        cleanNom,
        cleanTelephone,
        cleanAdresse,
        date_adhesion,
        date_expiration
    );


    if (!adherent) {
        throw new AppError(
            'Impossible de modifier l’adhérent',
            500
        );
    }


    return res.json({
        message: 'Adhérent modifié avec succès',
        adherent
    });
}


//DELETE /api/adherents/:id
export async function deleteAdherentController(
    req,
    res
) {

    const id = Number(req.params.id);


    if (
        !Number.isInteger(id) ||
        id <= 0
    ) {
        throw new AppError(
            'Identifiant de l’adhérent invalide',
            400
        );
    }


    const adherent =
        await findAdherentById(id);


    if (!adherent) {
        throw new AppError(
            'Adhérent introuvable',
            404
        );
    }


    const deleted =
        await deleteAdherent(id);


    if (!deleted) {
        throw new AppError(
            'Impossible de supprimer l’adhérent',
            500
        );
    }


    return res.json({
        message: 'Adhérent supprimé avec succès'
    });
}