import { Router } from 'express';

import {
    authenticateToken
} from '../middlewares/auth.middleware.js';

import {
    authorizeRole
} from '../middlewares/role.middleware.js';

import {
    getBibliothecaireDashboardController,
    getAdherentDashboardController
} from '../controllers/dashboard.controller.js';

const router = Router();


// GET /api/dashboard/bibliothecaire
router.get(
    '/bibliothecaire',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    getBibliothecaireDashboardController
);


// GET /api/dashboard/adherent
router.get(
    '/adherent',
    authenticateToken,
    authorizeRole('adherent'),
    getAdherentDashboardController
);

export default router;