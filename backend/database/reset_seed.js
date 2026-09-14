import pool from '../src/config/database.js';

import {
    seedBibliothecaires,
    seedCategories,
    seedAdherents,
    seedAuteurs,
    seedLivres,
    seedLivresAuteurs,
    seedEmprunts
} from './seed.js';

async function resetDatabase(client) {
    await client.query(`
        TRUNCATE TABLE
            emprunts,
            livres_auteurs,
            livres,
            auteurs,
            adherents,
            categories,
            bibliothecaires,
            utilisateurs
        RESTART IDENTITY CASCADE
    `);

    console.log('Base de données réinitialisée.');
}

async function seed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Réinitialisation de la base...\n');

        await resetDatabase(client);

        console.log('\nInsertion des données...\n');

        const bibliothecaireIds =
            await seedBibliothecaires(client);

        await seedCategories(client);

        await seedAdherents(
            client,
            bibliothecaireIds
        );

        await seedAuteurs(
            client,
            bibliothecaireIds
        );

        await seedLivres(
            client,
            bibliothecaireIds
        );

        await seedLivresAuteurs(client);

        await seedEmprunts(client);

        await client.query('COMMIT');

        console.log('\nReset + seed terminé avec succès.');
    } catch (error) {
        await client.query('ROLLBACK');

        console.error(
            'Erreur pendant le reset + seed :',
            error.message
        );

        console.error(
            'Toutes les opérations ont été annulées.'
        );
    } finally {
        client.release();
        await pool.end();
    }
}

seed();