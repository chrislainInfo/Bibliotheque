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
];

const categories = [
    'Roman',
    'Science-fiction',
    'Histoire',
    'Informatique',
    'Philosophie',
    'Développement personnel',
    'Jeunesse',
    'Poésie',
    'Biographie',
    'Économie'
];

const adherents = [
    {
        prenom: 'Jean',
        nom: 'Mabiala',
        telephone: '060100001',
        adresse: 'Brazzaville',
        dateAdhesion: '2026-01-10',
        dateExpiration: '2027-01-10',
        creePar: 1
    },
    {
        prenom: 'Patrick',
        nom: 'Ngouabi',
        telephone: '060100002',
        adresse: 'Poto-Poto',
        dateAdhesion: '2026-01-15',
        dateExpiration: '2027-01-15',
        creePar: 1
    },
    {
        prenom: 'Sarah',
        nom: 'Mouanga',
        telephone: '060100003',
        adresse: 'Bacongo',
        dateAdhesion: '2026-02-01',
        dateExpiration: '2027-02-01',
        creePar: 1
    },
    {
        prenom: 'Kevin',
        nom: 'Mpassi',
        telephone: '060100004',
        adresse: 'Talangaï',
        dateAdhesion: '2026-02-05',
        dateExpiration: '2027-02-05',
        creePar: 1
    },
    {
        prenom: 'Grâce',
        nom: 'Makaya',
        telephone: '060100005',
        adresse: 'Mfilou',
        dateAdhesion: '2026-02-10',
        dateExpiration: '2027-02-10',
        creePar: 1
    },
    {
        prenom: 'Daniel',
        nom: 'Nzinga',
        telephone: '060100006',
        adresse: 'Ouenzé',
        dateAdhesion: '2026-02-15',
        dateExpiration: '2027-02-15',
        creePar: 2
    },
    {
        prenom: 'Estelle',
        nom: 'Bakala',
        telephone: '060100007',
        adresse: 'Moungali',
        dateAdhesion: '2026-03-01',
        dateExpiration: '2027-03-01',
        creePar: 2
    },
    {
        prenom: 'Christian',
        nom: 'Okemba',
        telephone: '060100008',
        adresse: 'Makelekele',
        dateAdhesion: '2026-03-05',
        dateExpiration: '2027-03-05',
        creePar: 2
    },
    {
        prenom: 'Brigitte',
        nom: 'Loubaki',
        telephone: '060100009',
        adresse: 'Djiri',
        dateAdhesion: '2026-03-10',
        dateExpiration: '2027-03-10',
        creePar: 2
    },
    {
        prenom: 'Michel',
        nom: 'Koumba',
        telephone: '060100010',
        adresse: 'Mfilou',
        dateAdhesion: '2026-03-15',
        dateExpiration: '2027-03-15',
        creePar: 2
    }
];

const auteurs = [
    {
        prenom: 'Albert',
        nom: 'Camus',
        nationalite: 'Française',
        creePar: 1
    },
    {
        prenom: 'Victor',
        nom: 'Hugo',
        nationalite: 'Française',
        creePar: 1
    },
    {
        prenom: 'George',
        nom: 'Orwell',
        nationalite: 'Britannique',
        creePar: 1
    },
    {
        prenom: 'Jules',
        nom: 'Verne',
        nationalite: 'Française',
        creePar: 1
    },
    {
        prenom: 'Paulo',
        nom: 'Coelho',
        nationalite: 'Brésilienne',
        creePar: 1
    },
    {
        prenom: 'Fiodor',
        nom: 'Dostoïevski',
        nationalite: 'Russe',
        creePar: 1
    },
    {
        prenom: 'Antoine',
        nom: 'de Saint-Exupéry',
        nationalite: 'Française',
        creePar: 1
    },
    {
        prenom: 'Gabriel',
        nom: 'Garcia Marquez',
        nationalite: 'Colombienne',
        creePar: 1
    },
    {
        prenom: 'Stephen',
        nom: 'Hawking',
        nationalite: 'Britannique',
        creePar: 1
    },
    {
        prenom: 'Robert',
        nom: 'Kiyosaki',
        nationalite: 'Américaine',
        creePar: 1
    }
];

const livres = [
    {
        titre: "L'Étranger",
        isbn: '9782070360024',
        datePublication: '1942-01-01',
        description: 'Roman d’Albert Camus.',
        idCategorie: 1,
        creePar: 1,
        totalExemplaires: 5
    },
    {
        titre: 'Les Misérables',
        isbn: '9782253004226',
        datePublication: '1862-01-01',
        description: 'Grand roman de Victor Hugo.',
        idCategorie: 1,
        creePar: 1,
        totalExemplaires: 5
    },
    {
        titre: '1984',
        isbn: '9780451524935',
        datePublication: '1949-06-08',
        description: 'Roman dystopique de George Orwell.',
        idCategorie: 2,
        creePar: 1,
        totalExemplaires: 4
    },
    {
        titre: 'Vingt mille lieues sous les mers',
        isbn: '9782070512930',
        datePublication: '1870-01-01',
        description: 'Roman d’aventure de Jules Verne.',
        idCategorie: 2,
        creePar: 1,
        totalExemplaires: 4
    },
    {
        titre: "L'Alchimiste",
        isbn: '9780062315007',
        datePublication: '1988-01-01',
        description: 'Roman de Paulo Coelho.',
        idCategorie: 1,
        creePar: 1,
        totalExemplaires: 5
    },
    {
        titre: 'Crime et Châtiment',
        isbn: '9780140449136',
        datePublication: '1866-01-01',
        description: 'Roman de Fiodor Dostoïevski.',
        idCategorie: 1,
        creePar: 1,
        totalExemplaires: 4
    },
    {
        titre: 'Le Petit Prince',
        isbn: '9782070612758',
        datePublication: '1943-04-06',
        description: 'Conte poétique d’Antoine de Saint-Exupéry.',
        idCategorie: 7,
        creePar: 1,
        totalExemplaires: 6
    },
    {
        titre: 'Cent ans de solitude',
        isbn: '9780241968581',
        datePublication: '1967-01-01',
        description: 'Roman de Gabriel Garcia Marquez.',
        idCategorie: 1,
        creePar: 1,
        totalExemplaires: 4
    },
    {
        titre: "Une brève histoire du temps",
        isbn: '9780553380163',
        datePublication: '1988-01-01',
        description: 'Ouvrage scientifique de Stephen Hawking.',
        idCategorie: 3,
        creePar: 1,
        totalExemplaires: 3
    },
    {
        titre: 'Père riche, père pauvre',
        isbn: '9781612680194',
        datePublication: '1997-01-01',
        description: 'Livre sur la gestion financière personnelle.',
        idCategorie: 10,
        creePar: 1,
        totalExemplaires: 5
    }
];

const livresAuteurs = [
    { idLivre: 1, idAuteur: 1 },
    { idLivre: 2, idAuteur: 2 },
    { idLivre: 3, idAuteur: 3 },
    { idLivre: 4, idAuteur: 4 },
    { idLivre: 5, idAuteur: 5 },
    { idLivre: 6, idAuteur: 6 },
    { idLivre: 7, idAuteur: 7 },
    { idLivre: 8, idAuteur: 8 },
    { idLivre: 9, idAuteur: 9 },
    { idLivre: 10, idAuteur: 10 }
];

const emprunts = [
    {
        adherent: 1,
        livre: 1,
        bibliothecaire: 1,
        dateEmprunt: '2026-09-01',
        dateRetourPrevue: '2026-09-15',
        dateRetour: null
    },
    {
        adherent: 2,
        livre: 2,
        bibliothecaire: 1,
        dateEmprunt: '2026-09-02',
        dateRetourPrevue: '2026-09-16',
        dateRetour: null
    },
    {
        adherent: 3,
        livre: 3,
        bibliothecaire: 2,
        dateEmprunt: '2026-08-20',
        dateRetourPrevue: '2026-09-03',
        dateRetour: null
    },
    {
        adherent: 4,
        livre: 4,
        bibliothecaire: 2,
        dateEmprunt: '2026-08-25',
        dateRetourPrevue: '2026-09-08',
        dateRetour: null
    },
    {
        adherent: 5,
        livre: 5,
        bibliothecaire: 3,
        dateEmprunt: '2026-09-03',
        dateRetourPrevue: '2026-09-17',
        dateRetour: null
    },
    {
        adherent: 6,
        livre: 6,
        bibliothecaire: 1,
        dateEmprunt: '2026-08-01',
        dateRetourPrevue: '2026-08-15',
        dateRetour: '2026-08-14'
    },
    {
        adherent: 7,
        livre: 7,
        bibliothecaire: 1,
        dateEmprunt: '2026-08-05',
        dateRetourPrevue: '2026-08-19',
        dateRetour: '2026-08-18'
    },
    {
        adherent: 8,
        livre: 8,
        bibliothecaire: 2,
        dateEmprunt: '2026-08-10',
        dateRetourPrevue: '2026-08-24',
        dateRetour: '2026-08-23'
    },
    {
        adherent: 9,
        livre: 9,
        bibliothecaire: 3,
        dateEmprunt: '2026-08-12',
        dateRetourPrevue: '2026-08-26',
        dateRetour: '2026-08-25'
    },
    {
        adherent: 10,
        livre: 10,
        bibliothecaire: 1,
        dateEmprunt: '2026-08-15',
        dateRetourPrevue: '2026-08-29',
        dateRetour: '2026-08-28'
    }
];

export async function seedBibliothecaires(client) {
    const ids = [];

    for (const bibliothecaire of bibliothecaires) {
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

        const utilisateurId =
            utilisateurResult.rows[0].id;

        const result = await client.query(
            `INSERT INTO bibliothecaires (
                id_utilisateur,
                prenom,
                nom,
                telephone
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [
                utilisateurId,
                bibliothecaire.prenom,
                bibliothecaire.nom,
                bibliothecaire.telephone
            ]
        );

        ids.push(result.rows[0].id);

        console.log(
            `Bibliothécaire créé : ${bibliothecaire.email}`
        );
    }

    return ids;
}

export async function seedCategories(client) {
    const ids = [];

    for (const designation of categories) {
        const result = await client.query(
            `INSERT INTO categories (
                designation
            )
            VALUES ($1)
            RETURNING id`,
            [designation]
        );

        ids.push(result.rows[0].id);
    }

    console.log(`${ids.length} catégories créées.`);

    return ids;
}

export async function seedAdherents(client, bibliothecaireIds) {
    const ids = [];

    for (const adherent of adherents) {
        const code = `AKA-${Math.floor(
            10000 + Math.random() * 90000
        )}`;

        const hashedPassword = await bcrypt.hash(
            code,
            10
        );

        const utilisateurResult = await client.query(
            `INSERT INTO utilisateurs (
                mot_de_passe,
                role,
                code
            )
            VALUES ($1, $2, $3)
            RETURNING id`,
            [
                hashedPassword,
                'adherent',
                code
            ]
        );

        const utilisateurId =
            utilisateurResult.rows[0].id;

        const bibliothecaireId =
            bibliothecaireIds[adherent.creePar - 1];

        const result = await client.query(
            `INSERT INTO adherents (
                id_utilisateur,
                cree_par,
                prenom,
                nom,
                telephone,
                adresse,
                date_adhesion,
                date_expiration
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [
                utilisateurId,
                bibliothecaireId,
                adherent.prenom,
                adherent.nom,
                adherent.telephone,
                adherent.adresse,
                adherent.dateAdhesion,
                adherent.dateExpiration
            ]
        );

        ids.push(result.rows[0].id);

        console.log(
            `Adhérent créé : ${adherent.prenom} ${adherent.nom} | Code : ${code}`
        );
    }

    return ids;
}

export async function seedAuteurs(client, bibliothecaireIds) {
    const ids = [];

    for (const auteur of auteurs) {
        const bibliothecaireId =
            bibliothecaireIds[auteur.creePar - 1];

        const result = await client.query(
            `INSERT INTO auteurs (
                prenom,
                nom,
                nationalite,
                cree_par
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [
                auteur.prenom,
                auteur.nom,
                auteur.nationalite,
                bibliothecaireId
            ]
        );

        ids.push(result.rows[0].id);
    }

    console.log(`${ids.length} auteurs créés.`);

    return ids;
}

export async function seedLivres(client, bibliothecaireIds) {
    const ids = [];

    for (const livre of livres) {
        const bibliothecaireId =
            bibliothecaireIds[livre.creePar - 1];

        const result = await client.query(
            `INSERT INTO livres (
                titre,
                isbn,
                date_publication,
                description,
                id_categorie,
                cree_par,
                total_exemplaires,
                exemplaires_disponibles
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
            RETURNING id`,
            [
                livre.titre,
                livre.isbn,
                livre.datePublication,
                livre.description,
                livre.idCategorie,
                bibliothecaireId,
                livre.totalExemplaires
            ]
        );

        ids.push(result.rows[0].id);
    }

    console.log(`${ids.length} livres créés.`);

    return ids;
}

export async function seedLivresAuteurs(client) {
    for (const relation of livresAuteurs) {
        await client.query(
            `INSERT INTO livres_auteurs (
                id_livre,
                id_auteur
            )
            VALUES ($1, $2)`,
            [
                relation.idLivre,
                relation.idAuteur
            ]
        );
    }

    console.log(
        `${livresAuteurs.length} relations livres/auteurs créées.`
    );
}

export async function seedEmprunts(client) {
    for (const emprunt of emprunts) {
        await client.query(
            `INSERT INTO emprunts (
                id_adherent,
                id_livre,
                id_bibliothecaire,
                date_emprunt,
                date_retour_prevue,
                date_retour
            )
            VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                emprunt.adherent,
                emprunt.livre,
                emprunt.bibliothecaire,
                emprunt.dateEmprunt,
                emprunt.dateRetourPrevue,
                emprunt.dateRetour
            ]
        );

        if (!emprunt.dateRetour) {
            await client.query(
                `UPDATE livres
                 SET exemplaires_disponibles =
                     exemplaires_disponibles - 1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $1`,
                [emprunt.livre]
            );
        }
    }

    console.log(`${emprunts.length} emprunts créés.`);
}

async function seed() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Début du seed...\n');

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

        console.log('\nSeed terminé avec succès.');
    } catch (error) {
        await client.query('ROLLBACK');

        console.error(
            'Erreur pendant le seed :',
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
