import { Router } from 'express';

import { authenticateToken } from '../middleware/auth_middleware.js';
import { authorizeRole } from '../middleware/role_middleware.js';

import {
    getCategories,
    getCategoryById,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController
} from '../controllers/category_controller.js';

const router = Router();


// GET /api/categories
// Bibliothécaire + adhérent
router.get(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire', 'adherent'),
    getCategories
);


// GET /api/categories/:id
// Bibliothécaire + adhérent
router.get(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire', 'adherent'),
    getCategoryById
);


// POST /api/categories
// Bibliothécaire uniquement
router.post(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    createCategoryController
);


// PUT /api/categories/:id
// Bibliothécaire uniquement
router.put(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    updateCategoryController
);


// DELETE /api/categories/:id
// Bibliothécaire uniquement
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    deleteCategoryController
);

export default router;