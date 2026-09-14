import { Router } from 'express';

import { authenticateToken } from '../middleware/auth_middleware.js';

import { authorizeRole } from '../middleware/role_middleware.js';

import {
    getEmprunts,
    getEmpruntById,
    createEmpruntController,
    updateEmpruntController,
    returnEmpruntController,
    deleteEmpruntController
} from '../controllers/emprunt_controller.js';

const router = Router();


// GET /api/emprunts
router.get(
    '/',
    authenticateToken,
    authorizeRole(
        'bibliothecaire',
        'adherent'
    ),
    getEmprunts
);


// GET /api/emprunts/:id
router.get(
    '/:id',
    authenticateToken,
    authorizeRole(
        'bibliothecaire',
        'adherent'
    ),
    getEmpruntById
);


// POST /api/emprunts
router.post(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    createEmpruntController
);


// PUT /api/emprunts/:id
router.put(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    updateEmpruntController
);


// PUT /api/emprunts/:id/retour
router.put(
    '/:id/retour',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    returnEmpruntController
);


// DELETE /api/emprunts/:id
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    deleteEmpruntController
);

export default router;