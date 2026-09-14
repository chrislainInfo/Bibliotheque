import { Router } from 'express';

import {
    authenticateToken
} from '../middleware/auth_middleware.js';

import {
    authorizeRole
} from '../middleware/role_middleware.js';

import {
    getBibliothecaireDashboardController,
    getAdherentDashboardController
} from '../controllers/dashboard_controller.js';

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