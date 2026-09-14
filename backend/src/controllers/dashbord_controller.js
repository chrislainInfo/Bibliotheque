import AppError from '../errors/AppErrors.js';

import {
    getBibliothecaireDashboard,
    getAdherentDashboard
} from '../repositories/dashboard_repository.js';


// GET /api/dashboard/bibliothecaire
export async function getBibliothecaireDashboardController(
    req,
    res
) {

    const dashboard =
        await getBibliothecaireDashboard();

    return res.status(200).json({
        dashboard
    });
}


// GET /api/dashboard/adherent
export async function getAdherentDashboardController(
    req,
    res
) {

    const dashboard =
        await getAdherentDashboard(
            req.user.id
        );

    if (!dashboard) {
        throw new AppError(
            'Adhérent introuvable',
            404
        );
    }

    return res.status(200).json({
        dashboard
    });
}