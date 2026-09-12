import bcrypt from 'bcrypt';
import pool from '../src/config/database.js';


const bibliothecaires = [
    {
        nom: 'Mouyockolo',
        prenom: 'Chrislain',
        telephone: '064024955',
        email: 'adelininfo08@gmail.com',
        password: 'chrislain'
    },
    {
        nom: 'Ngoma',
        prenom: 'Bernard',
        telephone: '060000002',
        email: 'bernard@biblio.com',
        password: 'Bernard123'
    },
    {
        nom: 'Mouanda',
        prenom: 'Charles',
        telephone: '060000003',
        email: 'charles@biblio.com',
        password: 'Charles123'
    }
]


async function seed() {

    const client = await pool.connect();


    try {
        
        await client.query('BEGIN')
        
        for (let bibliothecaire of bibliothecaires) {
            
            const hashedPassword = await bcrypt.hash(
                bibliothecaire.password,
                10
            );
            
            const utilisateurResult = await client.query(
                `INSERT INTO utilisateurs (
                    email,
                    mot_de_passe,
                    role
                )
                VALUES ($1, $2, $3)
                RETURNING id`,
                [
                    bibliothecaire.email,
                    hashedPassword,
                    'bibliothecaire'
                ]
            );
            
            const utilisateurId = utilisateurResult.rows[0].id;
            
            await client.query(
                `INSERT INTO bibliothecaires (
                    id_utilisateur,
                    prenom,
                    nom,
                    telephone
                )
                VALUES ($1, $2, $3, $4)`,
                [
                    utilisateurId,
                    bibliothecaire.prenom,
                    bibliothecaire.nom,
                    bibliothecaire.telephone
                ]
            );
            console.log(
                `Bibliothécaire préparé : ${bibliothecaire.email}`
            );
        }
        
        await client.query('COMMIT');

        console.log('Seed terminé avec succès.');
        console.log('Toutes les opérations ont été validées.');
    } catch (error) {

        await client.query('ROLLBACK');

        console.error('Erreur pendant le seed :', error.message);
        console.error('Toutes les opérations ont été annulées.');
        
    } finally {

        client.release();
        await pool.end();

    }
}
seed();