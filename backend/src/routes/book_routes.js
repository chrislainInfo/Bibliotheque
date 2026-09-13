import { Router } from 'express';

import { authenticateToken } from '../middleware/auth_middleware.js';

import { authorizeRole } from '../middleware/role_middleware.js';

import {
    getBooks,
    getBookById,
    createBookController,
    updateBookController,
    deleteBookController
} from '../controllers/book_controller.js';


const router = Router();


//GET /api/livres
//Bibliothécaire + adhérent
router.get(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire','adherent'),
    getBooks
);

//GET /api/livres/:id
//Bibliothécaire + adhérent
router.get(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire','adherent'),
    getBookById
);

// POST /api/livres
//Bibliothécaire uniquement
router.post(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    createBookController
);

// PUT /api/livres/:id
//Bibliothécaire uniquement
router.put(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    updateBookController
);


//DELETE /api/livres/:id
//Bibliothécaire uniquement
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    deleteBookController
);


export default router;