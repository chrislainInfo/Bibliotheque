import { Router } from 'express';

import { authenticateToken } from '../middleware/auth_middleware.js';
import { authorizeRole } from '../middleware/role_middleware.js';

import {
    getAuthors,
    getAuthorById,
    createAuthorController,
    updateAuthorController,
    deleteAuthorController
} from '../controllers/author_controller.js';

const router = Router();


// GET /api/auteurs
router.get(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire', 'adherent'),
    getAuthors
);


// GET /api/auteurs/:id
router.get(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire', 'adherent'),
    getAuthorById
);


// POST /api/auteurs
router.post(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    createAuthorController
);


// PUT /api/auteurs/:id
router.put(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    updateAuthorController
);


// DELETE /api/auteurs/:id
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    deleteAuthorController
);

export default router;