import jwt from 'jsonwebtoken';
import AppError from '../errors/AppErrors.js';

export function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization

    if (!authorization) {
        throw new AppError('Token d’authentification manquant', 401)
    }

    const [type, token] = authorization.split(' ')

    if (type !== 'Bearer' || !token) {
        throw new AppError('Format du token invalide', 401)
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        throw new AppError('Token invalide ou expiré', 401);
    }
}