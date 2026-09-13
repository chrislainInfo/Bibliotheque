import AppError from '../errors/AppErrors.js';

import {
    findAllCategories,
    countCategories,
    findCategoryById,
    findCategoryByDesignation,
    createCategory,
    updateCategory,
    deleteCategory
} from '../repositories/category_repository.js';


// GET /api/categories
export async function getCategories(req, res) {

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

    const categories = await findAllCategories(
        limit,
        offset
    );

    const total = await countCategories();

    const totalPages = Math.ceil(total / limit);

    return res.json({
        categories,
        pagination: {
            page,
            limit,
            total,
            totalPages
        }
    });
}


// GET /api/categories/:id
export async function getCategoryById(req, res) {
    const { id } = req.params;

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        throw new AppError('ID de catégorie invalide', 400);
    }

    const category = await findCategoryById(categoryId);

    if (!category) {
        throw new AppError('Catégorie introuvable', 404);
    }

    return res.status(200).json({
        category
    });
}


// POST /api/categories
export async function createCategoryController(req, res) {
    const { designation } = req.body;

    
    if (!designation) {
        throw new AppError('La désignation de la catégorie est obligatoire', 400)
    }

    if (typeof designation !== 'string') {
        throw new AppError('La désignation doit être une chaîne de caractères', 400)
    }

    const cleanDesignation = designation.trim();

    if (!cleanDesignation) {
        throw new AppError('La désignation de la catégorie est obligatoire', 400)
    }


    const existingCategory = await findCategoryByDesignation(cleanDesignation);

    if (existingCategory) {
        throw new AppError('Cette catégorie existe déjà', 409)
    }

    const category = await createCategory(cleanDesignation);

    return res.status(201).json({
        message: 'Catégorie créée avec succès',
        category
    });
}


// PUT /api/categories/:id
export async function updateCategoryController(req, res) {
    const { id } = req.params;
    const { designation } = req.body;

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        throw new AppError('ID de catégorie invalide', 400);
    }

    if (!designation) {
        throw new AppError('La désignation de la catégorie est obligatoire', 400);
    }

    if (typeof designation !== 'string') {
        throw new AppError('La désignation doit être une chaîne de caractères', 400)
    }

    const cleanDesignation = designation.trim();

    if (!cleanDesignation) {
        throw new AppError('La désignation de la catégorie est obligatoire', 400)
    }

    const category = await findCategoryById(categoryId);

    if (!category) {
        throw new AppError('Catégorie introuvable', 404);
    }


    const existingCategory = await findCategoryByDesignation(cleanDesignation);

    if ( existingCategory && existingCategory.id !== categoryId ) {
        throw new AppError('Cette catégorie existe déjà', 409);
    }

    const updatedCategory = await updateCategory(
        categoryId,
        cleanDesignation
    );

    return res.status(200).json({
        message: 'Catégorie modifiée avec succès',
        category: updatedCategory
    });
}


// DELETE /api/categories/:id
export async function deleteCategoryController(req, res) {
    const { id } = req.params;

    const categoryId = Number(id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
        throw new AppError('ID de catégorie invalide', 400);
    }

    const category = await findCategoryById(categoryId);

    if (!category) {
        throw new AppError('Catégorie introuvable', 404);
    }

    await deleteCategory(categoryId);

    return res.status(200).json({
        message: 'Catégorie supprimée avec succès'
    });
}