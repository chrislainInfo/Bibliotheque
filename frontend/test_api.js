const API_URL = 'http://localhost:3000/api';
let bibliothecaireToken = '';
let adherentToken = '';
let bibliothecaireUser = null;
let adherentUser = null;
let adherentId = null;
let auteurId = null;
let categorieId = null;
let livreId = null;
let empruntId = null;
// Fonction fetch générale
async function request(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    const data = await response.json();
    console.log(`\n${options.method || 'GET'} ${url}`);
    console.log('Status :', response.status);
    console.log('Réponse :', data);
    if (!response.ok) {
        throw new Error(
            data.message || 'Erreur API'
        );
    }
    return data;
}
// ================================
// AUTHENTIFICATION
// ================================
// Connexion bibliothécaire
async function loginBibliothecaire(email, password) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            email,
            password
        })
    });
    bibliothecaireToken = data.token;
    bibliothecaireUser = data.user;
    return data;
}

// Connexion adhérent
async function loginAdherent(code) {
    const data = await request('/auth/login-adherent', {
        method: 'POST',
        body: JSON.stringify({
            code
        })
    });
    adherentToken = data.token;
    adherentUser = data.user;
    return data;
}
// ================================
// CATEGORIES
// ================================
// GET /api/categories
async function getCategories() {
    return await request('/categories', {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// GET /api/categories/:id
async function getCategoryById(id) {
    return await request(`/categories/${id}`, {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// POST /api/categories
async function createCategory() {
    const data = await request('/categories', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            designation: 'Architecture'
        })
    });
    categorieId = data.category?.id || data.categorie?.id;
    return data;
}
// PUT /api/categories/:id
async function updateCategory(id) {
    return await request(`/categories/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            designation: 'Architecture informatique'
        })
    });
}
// DELETE /api/categories/:id
async function deleteCategory(id) {
    return await request(`/categories/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// ================================
// AUTEURS
// ================================
// GET /api/auteurs
async function getAuthors() {
    return await request('/auteurs', {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// GET /api/auteurs/:id
async function getAuthorById(id) {
    return await request(`/auteurs/${id}`, {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// POST /api/auteurs
async function createAuthor() {
    const data = await request('/auteurs', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            prenom: 'Jean',
            nom: 'Dupont',
            nationalite: 'Française'
        })
    });
    auteurId = data.auteur?.id;
    return data;
}
// PUT /api/auteurs/:id
async function updateAuthor(id) {
    return await request(`/auteurs/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            prenom: 'Jean-Pierre',
            nom: 'Dupont',
            nationalite: 'Française'
        })
    });
}
// DELETE /api/auteurs/:id
async function deleteAuthor(id) {
    return await request(`/auteurs/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// ================================
// LIVRES
// ================================
// GET /api/livres
async function getBooks() {
    return await request('/livres', {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// GET /api/livres/:id
async function getBookById(id) {
    return await request(`/livres/${id}`, {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// POST /api/livres
async function createBook(authorId, categoryId) {
    const data = await request('/livres', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            titre: 'Introduction à Node.js',
            isbn: '9781234567890',
            date_publication: '2026-01-01',
            description: 'Livre de test pour l API bibliothèque.',
            id_categorie: categoryId,
            total_exemplaires: 5,
            auteurs: [authorId]
        })
    });
    livreId = data.livre?.id;
    return data;
}
// PUT /api/livres/:id
async function updateBook(id, authorId, categoryId) {
    return await request(`/livres/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            titre: 'Introduction complète à Node.js',
            isbn: '9781234567890',
            date_publication: '2026-01-01',
            description: 'Livre de test modifié.',
            id_categorie: categoryId,
            total_exemplaires: 6,
            auteurs: [authorId]
        })
    });
}
// DELETE /api/livres/:id
async function deleteBook(id) {
    return await request(`/livres/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// ================================
// ADHERENTS
// ================================
// GET /api/adherents
async function getAdherents() {
    return await request('/adherents', {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// GET /api/adherents/:id
async function getAdherentById(id) {
    return await request(`/adherents/${id}`, {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// POST /api/adherents
async function createAdherent() {
    const data = await request('/adherents', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            prenom: 'Test',
            nom: 'Adherent',
            telephone: '060999999',
            adresse: 'Brazzaville',
            date_adhesion: '2026-09-01',
            date_expiration: '2027-09-01'
        })
    });
    adherentId = data.adherent?.id;
    console.log(
        'Code de connexion généré :',
        data.code
    );
    return data;
}
// PUT /api/adherents/:id
async function updateAdherent(id) {
    return await request(`/adherents/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            prenom: 'Test Modifié',
            nom: 'Adherent',
            telephone: '060999998',
            adresse: 'Pointe-Noire',
            date_adhesion: '2026-09-01',
            date_expiration: '2027-09-01'
        })
    });
}
// DELETE /api/adherents/:id
async function deleteAdherent(id) {
    return await request(`/adherents/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// ================================
// EMPRUNTS
// ================================
// GET /api/emprunts
async function getEmprunts() {
    return await request('/emprunts', {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// GET /api/emprunts/:id
async function getEmpruntById(id) {
    return await request(`/emprunts/${id}`, {
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// POST /api/emprunts
async function createEmprunt(adherentId, bookId) {
    const data = await request('/emprunts', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            id_adherent: adherentId,
            id_livre: bookId,
            date_emprunt: '2026-09-10',
            date_retour_prevue: '2026-09-24'
        })
    });
    empruntId = data.emprunt?.id;
    return data;
}
// PUT /api/emprunts/:id
async function updateEmprunt(
    id,
    adherentId,
    bookId
) {
    return await request(`/emprunts/${id}`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            id_adherent: adherentId,
            id_livre: bookId,
            date_emprunt: '2026-09-10',
            date_retour_prevue: '2026-09-25'
        })
    });
}
// PUT /api/emprunts/:id/retour
async function returnEmprunt(id) {
    return await request(`/emprunts/${id}/retour`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        },
        body: JSON.stringify({
            date_retour: '2026-09-20'
        })
    });
}
// DELETE /api/emprunts/:id
async function deleteEmprunt(id) {
    return await request(`/emprunts/${id}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${bibliothecaireToken}`
        }
    });
}
// ================================
// DASHBOARD
// ================================
// Dashboard bibliothécaire
async function getBibliothecaireDashboard() {
    return await request(
        '/dashboard/bibliothecaire',
        {
            headers: {
                Authorization:
                    `Bearer ${bibliothecaireToken}`
            }
        }
    );
}
// Dashboard adhérent
async function getAdherentDashboard() {
    return await request(
        '/dashboard/adherent',
        {
            headers: {
                Authorization:
                    `Bearer ${adherentToken}`
            }
        }
    );
}
// ================================
// TEST GLOBAL
// ================================
async function runTests() {
    try {
        console.log(
            '================================'
        );
        console.log('DÉBUT DES TESTS API');
        console.log(
            '================================'
        );
        // Auth bibliothécaire
        await loginBibliothecaire();
        // Dashboard bibliothécaire
        await getBibliothecaireDashboard();
        // Catégories
        await getCategories();
        await getCategoryById(1);
        const category = await createCategory();
        const createdCategoryId =
            category.categorie?.id ||
            category.category?.id ||
            categorieId;
        if (createdCategoryId) {
            await getCategoryById(
                createdCategoryId
            );
            await updateCategory(
                createdCategoryId
            );
        }
        // Auteurs
        await getAuthors();
        await getAuthorById(1);
        const author = await createAuthor();
        const createdAuthorId =
            author.auteur?.id ||
            auteurId;
        if (createdAuthorId) {
            await getAuthorById(
                createdAuthorId
            );
            await updateAuthor(
                createdAuthorId
            );
        }
        // Livres
        await getBooks();
        await getBookById(1);
        if (createdAuthorId && createdCategoryId) {
            const book = await createBook(
                createdAuthorId,
                createdCategoryId
            );
            const createdBookId =
                book.livre?.id ||
                livreId;
            if (createdBookId) {
                await getBookById(
                    createdBookId
                );
                await updateBook(
                    createdBookId,
                    createdAuthorId,
                    createdCategoryId
                );
            }
        }
        // Adhérents
        await getAdherents();
        await getAdherentById(1);
        const newAdherent =
            await createAdherent();
        const createdAdherentId =
            newAdherent.adherent?.id ||
            adherentId;
        if (createdAdherentId) {
            await getAdherentById(
                createdAdherentId
            );
            await updateAdherent(
                createdAdherentId
            );
        }
        // Emprunts
        await getEmprunts();
        await getEmpruntById(1);
        if (
            createdAdherentId &&
            createdBookId
        ) {
            const loan = await createEmprunt(
                createdAdherentId,
                createdBookId
            );
            const createdLoanId =
                loan.emprunt?.id ||
                empruntId;
            if (createdLoanId) {
                await getEmpruntById(
                    createdLoanId
                );
                await updateEmprunt(
                    createdLoanId,
                    createdAdherentId,
                    createdBookId
                );
                await returnEmprunt(
                    createdLoanId
                );
            }
        }
        // Dashboard bibliothécaire
        await getBibliothecaireDashboard();
        // Connexion adhérent
        //
        // Le code doit être récupéré depuis
        // le seed ou depuis la création d'un adhérent.
        //
        // Exemple :
        // await loginAdherent('AKA-12345');
        console.log(
            '\n================================'
        );
        console.log('TESTS TERMINÉS');
        console.log(
            '================================'
        );
    } catch (error) {
        console.error(
            '\nTEST ARRÊTÉ :',
            error.message
        );
    }
}
// Lancement
// runTests();