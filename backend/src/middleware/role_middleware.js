import AppError from '../errors/AppErrors.js';

export function authorizeRole(...rolesAutorises) {
    return (req, res, next) => {

        if (!req.user) {
            throw new AppError('Utilisateur non authentifié', 401);
        }

        // Vérifier que son rôle est autorisé
        if (!rolesAutorises.includes(req.user.role)) {
            throw new AppError('Accès interdit', 403);
        }

        next();
    };
}