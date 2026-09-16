/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:3000/api";


/* =========================================================
   ÉTAT
========================================================= */

let books = [];
let authors = [];
let categories = [];

let bookToDelete = null;


/* =========================================================
   ÉLÉMENTS DOM
========================================================= */

const booksTableBody =
    document.querySelector("#booksTableBody");

const emptyBooks =
    document.querySelector("#booksEmptyState");

const searchBook =
    document.querySelector("#bookSearch");

const categoryFilter =
    document.querySelector("#categoryFilter");

const authorFilter =
    document.querySelector("#authorFilter");

const availabilityFilter =
    document.querySelector("#availabilityFilter");

const totalBooks =
    document.querySelector("#totalBooks");

const availableBooks =
    document.querySelector("#availableBooks");

const borrowedBooks =
    document.querySelector("#borrowedBooks");

const booksResultText =
    document.querySelector("#booksResultCount");


/* =========================================================
   TOKEN
========================================================= */

function getToken() {

    return localStorage.getItem("token");

}


/* =========================================================
   HEADERS
========================================================= */

function getHeaders() {

    const token = getToken();

    return {
        "Content-Type": "application/json",

        ...(token
            ? {
                Authorization: `Bearer ${token}`
            }
            : {})
    };

}


/* =========================================================
   REQUÊTE API
========================================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                headers: {
                    ...getHeaders(),
                    ...(options.headers || {})
                }
            }
        );


    /* Token invalide */

    if (response.status === 401) {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        window.location.href =
            "../index.html";

        throw new Error(
            "Votre session a expiré."
        );

    }


    let data = null;


    try {

        data = await response.json();

    } catch {

        data = null;

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.error ||
            "Une erreur est survenue."
        );

    }


    return data;

}


/* =========================================================
   EXTRACTION DES DONNÉES
========================================================= */

function extractArray(response) {

    if (Array.isArray(response)) {
        return response;
    }


    if (Array.isArray(response?.data)) {
        return response.data;
    }


    if (Array.isArray(response?.livres)) {
        return response.livres;
    }


    if (Array.isArray(response?.books)) {
        return response.books;
    }


    if (Array.isArray(response?.auteurs)) {
        return response.auteurs;
    }


    if (Array.isArray(response?.categories)) {
        return response.categories;
    }


    return [];

}


/* =========================================================
   LIVRES
========================================================= */

async function loadBooks() {

    try {

        const response =
            await apiRequest("/livres");


        books =
            extractArray(response);


        renderBooks();

        updateStatistics();

    } catch (error) {

        console.error(
            "Erreur livres :",
            error
        );


        booksTableBody.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="books-loading"
                >
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Impossible de charger les livres.
                </td>
            </tr>
        `;


        booksResultText.textContent =
            "Erreur lors du chargement.";

    }

}


/* =========================================================
   AUTEURS
========================================================= */

async function loadAuthors() {

    try {

        const response =
            await apiRequest("/auteurs");


        authors =
            extractArray(response);


        populateAuthors();

    } catch (error) {

        console.error(
            "Erreur auteurs :",
            error
        );

    }

}


/* =========================================================
   CATÉGORIES
========================================================= */

async function loadCategories() {

    try {

        const response =
            await apiRequest("/categories");


        categories =
            extractArray(response);


        populateCategories();

    } catch (error) {

        console.error(
            "Erreur catégories :",
            error
        );

    }

}


/* =========================================================
   SELECT AUTEURS
========================================================= */

function populateAuthors() {

    authorFilter.innerHTML = `
        <option value="">
            Tous les auteurs
        </option>
    `;


    const authorSelect =
        document.querySelector("#bookAuthor");


    authorSelect.innerHTML = `
        <option value="">
            Sélectionner un auteur
        </option>
    `;


    authors.forEach((author) => {

        const name =
            getAuthorName(author);


        authorFilter.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${author.id}">
                    ${escapeHtml(name)}
                </option>
            `
        );


        authorSelect.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${author.id}">
                    ${escapeHtml(name)}
                </option>
            `
        );

    });

}


/* =========================================================
   SELECT CATÉGORIES
========================================================= */

function populateCategories() {

    categoryFilter.innerHTML = `
        <option value="">
            Toutes les catégories
        </option>
    `;


    const categorySelect =
        document.querySelector("#bookCategory");


    categorySelect.innerHTML = `
        <option value="">
            Sélectionner une catégorie
        </option>
    `;


    categories.forEach((category) => {

        const name =
            getCategoryName(category);


        categoryFilter.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${category.id}">
                    ${escapeHtml(name)}
                </option>
            `
        );


        categorySelect.insertAdjacentHTML(
            "beforeend",
            `
                <option value="${category.id}">
                    ${escapeHtml(name)}
                </option>
            `
        );

    });

}


/* =========================================================
   AUTEUR
========================================================= */

function getAuthorName(data) {

    if (data.auteur) {

        if (
            typeof data.auteur ===
            "string"
        ) {

            return data.auteur;

        }


        return (
            data.auteur.nom ||
            data.auteur.name ||
            `${data.auteur.prenom || ""} ${data.auteur.nom || ""}`.trim() ||
            "Auteur inconnu"
        );

    }


    if (data.author) {

        if (
            typeof data.author ===
            "string"
        ) {

            return data.author;

        }


        return (
            data.author.nom ||
            data.author.name ||
            "Auteur inconnu"
        );

    }


    const authorId =
        data.auteur_id ??
        data.author_id;


    const author =
        authors.find(
            (item) =>
                String(item.id) ===
                String(authorId)
        );


    if (!author) {
        return "Auteur inconnu";
    }


    return (
        author.nom ||
        author.name ||
        `${author.prenom || ""} ${author.nom || ""}`.trim() ||
        "Auteur inconnu"
    );

}


/* =========================================================
   CATÉGORIE
========================================================= */

function getCategoryName(data) {

    if (data.categorie) {

        if (
            typeof data.categorie ===
            "string"
        ) {

            return data.categorie;

        }


        return (
            data.categorie.nom ||
            data.categorie.name ||
            "Catégorie inconnue"
        );

    }


    if (data.category) {

        if (
            typeof data.category ===
            "string"
        ) {

            return data.category;

        }


        return (
            data.category.nom ||
            data.category.name ||
            "Catégorie inconnue"
        );

    }


    const categoryId =
        data.categorie_id ??
        data.category_id;


    const category =
        categories.find(
            (item) =>
                String(item.id) ===
                String(categoryId)
        );


    if (!category) {
        return "Catégorie inconnue";
    }


    return (
        category.nom ||
        category.name ||
        "Catégorie inconnue"
    );

}


/* =========================================================
   EXEMPLAIRES
========================================================= */

function getTotalCopies(book) {

    return Number(
        book.nombre_exemplaires ??
        book.nombreExemplaires ??
        book.total_exemplaires ??
        book.totalCopies ??
        book.copies ??
        0
    );

}


function getAvailableCopies(book) {

    return Number(
        book.exemplaires_disponibles ??
        book.exemplairesDisponibles ??
        book.available_copies ??
        book.availableCopies ??
        book.stock_disponible ??
        0
    );

}


/* =========================================================
   FILTRAGE
========================================================= */

function getFilteredBooks() {

    const search =
        searchBook.value
            .trim()
            .toLowerCase();


    const selectedCategory =
        categoryFilter.value;


    const selectedAuthor =
        authorFilter.value;


    const selectedAvailability =
        availabilityFilter.value;


    return books.filter((book) => {

        const title =
            String(
                book.titre ??
                book.title ??
                ""
            ).toLowerCase();


        const isbn =
            String(
                book.isbn ??
                ""
            ).toLowerCase();


        const authorName =
            getAuthorName(book)
                .toLowerCase();


        const categoryName =
            getCategoryName(book)
                .toLowerCase();


        const authorId =
            book.auteur_id ??
            book.author_id ??
            book.auteur?.id ??
            book.author?.id;


        const categoryId =
            book.categorie_id ??
            book.category_id ??
            book.categorie?.id ??
            book.category?.id;


        const available =
            getAvailableCopies(book);


        const matchesSearch =
            !search ||
            title.includes(search) ||
            isbn.includes(search) ||
            authorName.includes(search) ||
            categoryName.includes(search);


        const matchesCategory =
            !selectedCategory ||
            String(categoryId) ===
            String(selectedCategory);


        const matchesAuthor =
            !selectedAuthor ||
            String(authorId) ===
            String(selectedAuthor);


        const matchesAvailability =
            !selectedAvailability ||
            (
                selectedAvailability ===
                "available" &&
                available > 0
            ) ||
            (
                selectedAvailability ===
                "unavailable" &&
                available <= 0
            );


        return (
            matchesSearch &&
            matchesCategory &&
            matchesAuthor &&
            matchesAvailability
        );

    });

}


/* =========================================================
   AFFICHAGE
========================================================= */

function renderBooks() {

    const filteredBooks =
        getFilteredBooks();


    booksTableBody.innerHTML = "";


    if (
        filteredBooks.length ===
        0
    ) {

        emptyBooks.hidden = false;

        booksResultText.textContent =
            "Aucun livre trouvé.";

        return;

    }


    emptyBooks.hidden = true;


    booksResultText.textContent =
        `${filteredBooks.length} livre${filteredBooks.length > 1 ? "s" : ""}`;


    filteredBooks.forEach((book) => {

        booksTableBody.insertAdjacentHTML(
            "beforeend",
            createBookRow(book)
        );

    });

}


/* =========================================================
   LIGNE LIVRE
========================================================= */

function createBookRow(book) {

    const title =
        book.titre ??
        book.title ??
        "Sans titre";


    const isbn =
        book.isbn ??
        "—";


    const author =
        getAuthorName(book);


    const category =
        getCategoryName(book);


    const total =
        getTotalCopies(book);


    const available =
        getAvailableCopies(book);


    const isAvailable =
        available > 0;


    return `
        <tr>

            <td>

                <div class="book-name">

                    <div class="book-icon">
                        <i class="fa-solid fa-book"></i>
                    </div>

                    <div class="book-title">
                        ${escapeHtml(title)}
                    </div>

                </div>

            </td>


            <td>
                ${escapeHtml(author)}
            </td>


            <td>
                ${escapeHtml(category)}
            </td>


            <td>
                <span class="book-isbn">
                    ${escapeHtml(isbn)}
                </span>
            </td>


            <td>
                <span class="book-quantity">
                    ${total}
                </span>
            </td>


            <td>

                <span
                    class="${
                        isAvailable
                            ? "book-available"
                            : "book-unavailable"
                    }"
                >
                    ${available}
                </span>

            </td>


            <td>

                <span
                    class="
                        book-status
                        ${
                            isAvailable
                                ? "available"
                                : "unavailable"
                        }
                    "
                >

                    <i class="fa-solid fa-circle"></i>

                    ${
                        isAvailable
                            ? "Disponible"
                            : "Indisponible"
                    }

                </span>

            </td>


            <td>

                <div class="book-actions">


                    <button
                        type="button"
                        class="book-action-button"
                        title="Modifier"
                        data-action="edit"
                        data-id="${book.id}"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>



                    <button
                        type="button"
                        class="book-action-button delete"
                        title="Supprimer"
                        data-action="delete"
                        data-id="${book.id}"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>
    `;

}


/* =========================================================
   STATISTIQUES
========================================================= */

function updateStatistics() {

    const total =
        books.reduce(
            (sum, book) =>
                sum + getTotalCopies(book),
            0
        );


    const available =
        books.reduce(
            (sum, book) =>
                sum + getAvailableCopies(book),
            0
        );


    const borrowed =
        Math.max(
            total - available,
            0
        );


    totalBooks.textContent =
        total.toLocaleString("fr-FR");


    availableBooks.textContent =
        available.toLocaleString("fr-FR");


    borrowedBooks.textContent =
        borrowed.toLocaleString("fr-FR");

}


/* =========================================================
   AJOUT LIVRE
========================================================= */

async function addBook(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const submitButton =
        document.querySelector(
            "#submitBookButton"
        );


    const formMessage =
        document.querySelector(
            "#bookFormMessage"
        );


    const formData =
        new FormData(form);


    const payload = {

        titre:
            formData
                .get("titre")
                .trim(),

        isbn:
            formData
                .get("isbn")
                .trim(),

        nombre_exemplaires:
            Number(
                formData.get(
                    "nombre_exemplaires"
                )
            ),

        auteur_id:
            Number(
                formData.get(
                    "auteur_id"
                )
            ),

        categorie_id:
            Number(
                formData.get(
                    "categorie_id"
                )
            ),

        description:
            formData
                .get("description")
                .trim()

    };


    try {

        submitButton.disabled = true;


        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Ajout...</span>
        `;


        hideFormMessage();


        await apiRequest(
            "/livres",
            {
                method: "POST",

                body:
                    JSON.stringify(payload)
            }
        );


        showFormMessage(
            "Livre ajouté avec succès.",
            "success"
        );


        await loadBooks();


        setTimeout(() => {

            closeBookModal();

            form.reset();

            hideFormMessage();

        }, 700);


    } catch (error) {

        console.error(
            "Erreur ajout livre :",
            error
        );


        showFormMessage(
            error.message,
            "error"
        );

    } finally {

        submitButton.disabled = false;


        submitButton.innerHTML = `
            <i class="fa-solid fa-plus"></i>
            <span>Ajouter le livre</span>
        `;

    }

}


/* =========================================================
   MODAL AJOUT
========================================================= */

function openBookModal() {

    const overlay =
        document.querySelector(
            "#bookModalOverlay"
        );


    overlay.classList.add("open");


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(() => {

        document
            .querySelector("#bookTitle")
            ?.focus();

    }, 200);

}


function closeBookModal() {

    const overlay =
        document.querySelector(
            "#bookModalOverlay"
        );


    overlay.classList.remove("open");


    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   MESSAGE FORMULAIRE
========================================================= */

function showFormMessage(
    message,
    type
) {

    const element =
        document.querySelector(
            "#bookFormMessage"
        );


    element.hidden = false;

    element.className =
        `book-form-message ${type}`;

    element.textContent =
        message;

}


function hideFormMessage() {

    const element =
        document.querySelector(
            "#bookFormMessage"
        );


    element.hidden = true;

    element.textContent = "";

}


/* =========================================================
   SUPPRESSION
========================================================= */

function openDeleteModal(bookId) {

    bookToDelete =
        books.find(
            (book) =>
                String(book.id) ===
                String(bookId)
        );


    if (!bookToDelete) {
        return;
    }


    const overlay =
        document.querySelector(
            "#deleteModalOverlay"
        );


    overlay.classList.add("open");


    overlay.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeDeleteModal() {

    const overlay =
        document.querySelector(
            "#deleteModalOverlay"
        );


    overlay.classList.remove("open");


    overlay.setAttribute(
        "aria-hidden",
        "true"
    );


    bookToDelete = null;

}


async function deleteBook() {

    if (!bookToDelete) {
        return;
    }


    const button =
        document.querySelector(
            "#confirmDeleteButton"
        );


    try {

        button.disabled = true;


        button.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Supression...
        `;


        await apiRequest(
            `/livres/${bookToDelete.id}`,
            {
                method: "DELETE"
            }
        );


        closeDeleteModal();


        await loadBooks();


    } catch (error) {

        console.error(
            "Erreur suppression :",
            error
        );


        alert(
            error.message ||
            "Impossible de supprimer le livre."
        );

    } finally {

        button.disabled = false;


        button.innerHTML = `
            <i class="fa-solid fa-trash"></i>
            Supprimer
        `;

    }

}


/* =========================================================
   BOTTOM SHEET PLUS
========================================================= */

const moreBottomSheet =
    document.querySelector(
        "#moreBottomSheet"
    );


const mobileSheetOverlay =
    document.querySelector(
        "#mobileSheetOverlay"
    );


function openMoreMenu() {

    moreBottomSheet.classList.add(
        "open"
    );


    mobileSheetOverlay.classList.add(
        "open"
    );


    document.body.style.overflow =
        "hidden";

}


function closeMoreMenu() {

    moreBottomSheet.classList.remove(
        "open"
    );


    mobileSheetOverlay.classList.remove(
        "open"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   DÉCONNEXION
========================================================= */

function logout() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "../index.html";

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ÉVÉNEMENTS
========================================================= */


/* Chargement initial */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await Promise.all([
            loadAuthors(),
            loadCategories()
        ]);


        await loadBooks();

    }
);


/* Recherche */

searchBook.addEventListener(
    "input",
    renderBooks
);


/* Filtres */

categoryFilter.addEventListener(
    "change",
    renderBooks
);


authorFilter.addEventListener(
    "change",
    renderBooks
);


availabilityFilter.addEventListener(
    "change",
    renderBooks
);


/* =========================================================
   MODAL AJOUT
========================================================= */

document
    .querySelector(
        "#openAddBookButton"
    )
    .addEventListener(
        "click",
        openBookModal
    );


document
    .querySelector(
        "#closeBookModalButton"
    )
    .addEventListener(
        "click",
        closeBookModal
    );


document
    .querySelector(
        "#cancelBookButton"
    )
    .addEventListener(
        "click",
        closeBookModal
    );


document
    .querySelector(
        "#addBookForm"
    )
    .addEventListener(
        "submit",
        addBook
    );


/* Fermeture en cliquant sur l'overlay */

document
    .querySelector(
        "#bookModalOverlay"
    )
    .addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                event.currentTarget
            ) {

                closeBookModal();

            }

        }
    );


/* =========================================================
   SUPPRESSION
========================================================= */

document
    .querySelector(
        "#cancelDeleteButton"
    )
    .addEventListener(
        "click",
        closeDeleteModal
    );


document
    .querySelector(
        "#confirmDeleteButton"
    )
    .addEventListener(
        "click",
        deleteBook
    );


document
    .querySelector(
        "#deleteModalOverlay"
    )
    .addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                event.currentTarget
            ) {

                closeDeleteModal();

            }

        }
    );


/* =========================================================
   ACTIONS TABLE
========================================================= */

booksTableBody.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const bookId =
            button.dataset.id;


        if (
            action ===
            "delete"
        ) {

            openDeleteModal(
                bookId
            );

        }


        if (
            action ===
            "edit"
        ) {

            /*
             * La modification sera branchée
             * sur PUT /api/livres/:id.
             */

            console.log(
                "Modifier le livre :",
                bookId
            );

        }

    }
);


/* =========================================================
   BOTTOM SHEET PLUS
========================================================= */

document
    .querySelector(
        "#openMoreMenuButton"
    )
    .addEventListener(
        "click",
        openMoreMenu
    );


document
    .querySelector(
        "#closeMoreMenuButton"
    )
    .addEventListener(
        "click",
        closeMoreMenu
    );


mobileSheetOverlay.addEventListener(
    "click",
    closeMoreMenu
);


/* =========================================================
   DÉCONNEXION
========================================================= */

document
    .querySelector(
        "#headerLogout"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .querySelector(
        "#sheetLogout"
    )
    .addEventListener(
        "click",
        logout
    );


/* =========================================================
   TOUCHE ESC
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key !==
            "Escape"
        ) {
            return;
        }


        closeBookModal();

        closeDeleteModal();

        closeMoreMenu();

    }
);