CREATE TABLE utilisateurs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    mot_de_passe TEXT,
    role VARCHAR(50) NOT NULL,
    code VARCHAR(50) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT utilisateurs_role_check
        CHECK (role IN ('bibliothecaire', 'adherent'))
);


CREATE TABLE bibliothecaires (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL UNIQUE,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT bibliothecaires_utilisateur_fk
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id)
);


CREATE TABLE adherents (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_utilisateur INTEGER NOT NULL UNIQUE,
    cree_par INTEGER NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    telephone VARCHAR(30),
    adresse TEXT,
    date_adhesion DATE NOT NULL,
    date_expiration DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT adherents_utilisateur_fk
        FOREIGN KEY (id_utilisateur)
        REFERENCES utilisateurs(id),

    CONSTRAINT adherents_cree_par_fk
        FOREIGN KEY (cree_par)
        REFERENCES bibliothecaires(id),

    CONSTRAINT adherents_dates_check
        CHECK (date_expiration >= date_adhesion)
);


CREATE TABLE auteurs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    nationalite VARCHAR(100),
    cree_par INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT auteurs_cree_par_fk
        FOREIGN KEY (cree_par)
        REFERENCES bibliothecaires(id)
);


CREATE TABLE categories (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    designation VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE livres (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    date_publication DATE,
    description TEXT,
    id_categorie INTEGER NOT NULL,
    cree_par INTEGER NOT NULL,
    total_exemplaires INTEGER NOT NULL DEFAULT 0,
    exemplaires_disponibles INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT livres_categorie_fk
        FOREIGN KEY (id_categorie)
        REFERENCES categories(id),

    CONSTRAINT livres_cree_par_fk
        FOREIGN KEY (cree_par)
        REFERENCES bibliothecaires(id),

    CONSTRAINT livres_total_check
        CHECK (total_exemplaires >= 0),

    CONSTRAINT livres_disponibles_check
        CHECK (exemplaires_disponibles >= 0),

    CONSTRAINT livres_stock_check
        CHECK (exemplaires_disponibles <= total_exemplaires)
);


CREATE TABLE livres_auteurs (
    id_livre INTEGER NOT NULL,
    id_auteur INTEGER NOT NULL,

    PRIMARY KEY (id_livre, id_auteur),

    CONSTRAINT livres_auteurs_livre_fk
        FOREIGN KEY (id_livre)
        REFERENCES livres(id)
        ON DELETE CASCADE,

    CONSTRAINT livres_auteurs_auteur_fk
        FOREIGN KEY (id_auteur)
        REFERENCES auteurs(id)
        ON DELETE CASCADE
);


CREATE TABLE emprunts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_adherent INTEGER NOT NULL,
    id_livre INTEGER NOT NULL,
    id_bibliothecaire INTEGER NOT NULL,
    date_emprunt DATE NOT NULL,
    date_retour_prevue DATE NOT NULL,
    date_retour DATE,

    CONSTRAINT emprunts_adherent_fk
        FOREIGN KEY (id_adherent)
        REFERENCES adherents(id),

    CONSTRAINT emprunts_livre_fk
        FOREIGN KEY (id_livre)
        REFERENCES livres(id),

    CONSTRAINT emprunts_bibliothecaire_fk
        FOREIGN KEY (id_bibliothecaire)
        REFERENCES bibliothecaires(id)
);