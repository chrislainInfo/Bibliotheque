import { Router } from 'express';
import { authenticateToken } from '../middleware/auth_middleware.js';
import { authorizeRole } from '../middleware/role_middleware.js';

import {
    getAdherents,
    getAdherentById,
    createAdherentController,
    updateAdherentController,
    deleteAdherentController
} from '../controllers/adherent.controller.js';


const router = Router();


//GET /api/adherents
//Bibliothécaire + adhérent
router.get(
    '/',
    authenticateToken,
    authorizeRole( 'bibliothecaire', 'adherent'),
    getAdherents
);


/*
| GET /api/adherents/:id
| Bibliothécaire + adhérent
*/
router.get(
    '/:id',
    authenticateToken,
    authorizeRole( 'bibliothecaire','adherent' ),
    getAdherentById
);


/*
| POST /api/adherents
| Bibliothécaire uniquement
*/

router.post(
    '/',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    createAdherentController
);


/*
| PUT /api/adherents/:id
| Bibliothécaire uniquement
*/

router.put(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    updateAdherentController
);


/*
| DELETE /api/adherents/:id
| Bibliothécaire uniquement
*/

router.delete(
    '/:id',
    authenticateToken,
    authorizeRole('bibliothecaire'),
    deleteAdherentController
);


export default router;