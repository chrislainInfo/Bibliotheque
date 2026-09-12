import AppError from '../errors/AppErrors.js';
import { isValidEmail } from '../utils/utils.js';
import { findBibliothecaireByEmail } from '../repositories/auth_repository.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
    const { email, password, code } = req.body;

    // Connexion bibliothécaire
    if (email && password && !code) {

        if (!isValidEmail(email)) {
            throw new AppError('Adresse e-mail invalide', 400);
        }

        const utilisateur = await findBibliothecaireByEmail(email);

        if (!utilisateur) {
            throw new AppError('Email incorrect', 401);
        }

        const passwordCorrect = await bcrypt.compare(
            password,
            utilisateur.mot_de_passe
        );

        if (!passwordCorrect) {
            throw new AppError('Mot de passe incorrect', 401);
        }

        const token = jwt.sign(
            {
                id: utilisateur.id,
                role: utilisateur.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );


        return res.json({
            message: 'Connexion bibliothécaire réussie',
            token,
            user: {
                id: utilisateur.id,
                role: utilisateur.role,
                prenom: utilisateur.prenom,
            }
        });
    }

    // Connexion adhérent
    if (code && !email && !password) {

        console.log('Tentative de connexion adhérent');

        // La logique adhérent viendra ici
    }

    // Aucun format de connexion reconnu
    throw new AppError('Données de connexion invalides', 400);
}