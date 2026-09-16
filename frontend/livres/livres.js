const BOOKS_API = "/livres";
let books = [];
let authors = [];
let categories = [];
let booksPage = 1;

const booksTableBody = document.querySelector("#booksTableBody");
const booksEmptyState = document.querySelector("#booksEmptyState");
const bookSearch = document.querySelector("#bookSearch");
const categoryFilter = document.querySelector("#categoryFilter");
const authorFilter = document.querySelector("#authorFilter");
const availabilityFilter = document.querySelector("#availabilityFilter");

function getAuthorName(book) {
    const author = book.auteur || book.author;
    if (typeof author === "string") return author;
    if (author) return `${author.prenom || ""} ${author.nom || author.name || ""}`.trim();
    const id = book.auteur_id ?? book.author_id;
    const found = authors.find((item) => String(item.id) === String(id));
    return found ? `${found.prenom || ""} ${found.nom || ""}`.trim() : "Auteur inconnu";
}

function getCategoryName(book) {
    const category = book.categorie || book.category;
    if (typeof category === "string") return category;
    if (category) return category.designation || category.nom || category.name || "Catégorie inconnue";
    const id = book.id_categorie ?? book.categorie_id ?? book.category_id;
    const found = categories.find((item) => String(item.id) === String(id));
    return found?.designation || found?.nom || "Catégorie inconnue";
}

function availableCopies(book) {
    return Number(book.exemplaires_disponibles ?? book.available_copies ?? 0);
}

function totalCopies(book) {
    return Number(book.total_exemplaires ?? book.nombre_exemplaires ?? 0);
}

function filteredBooks() {
    const search = bookSearch?.value.trim().toLowerCase() || "";
    const category = categoryFilter?.value || "";
    const author = authorFilter?.value || "";
    const availability = availabilityFilter?.value || "";

    return books.filter((book) => {
        const title = String(book.titre || "").toLowerCase();
        const isbn = String(book.isbn || "").toLowerCase();
        const authorName = getAuthorName(book).toLowerCase();
        const categoryName = getCategoryName(book).toLowerCase();
        const available = availableCopies(book);
        const categoryId = book.id_categorie ?? book.categorie_id ?? book.category_id;
        const authorId = book.auteur_id ?? book.author_id;

        return (!search || `${title} ${isbn} ${authorName} ${categoryName}`.includes(search))
            && (!category || String(categoryId) === category || categoryName === category.toLowerCase())
            && (!author || String(authorId) === author || authorName === author.toLowerCase())
            && (!availability || (availability === "available" && available > 0) || (availability === "borrowed" && available < totalCopies(book)) || (availability === "unavailable" && available <= 0));
    });
}

function renderBooks() {
    const filtered = filteredBooks();
    const result = paginateItems(filtered, booksPage);
    booksTableBody.innerHTML = "";
    booksEmptyState.hidden = result.items.length > 0;

    result.items.forEach((book) => {
        const row = document.createElement("tr");
        const available = availableCopies(book);
        row.innerHTML = `
            <td>${escapeHtml(book.titre || "Sans titre")}</td>
            <td>${escapeHtml(getAuthorName(book))}</td>
            <td>${escapeHtml(getCategoryName(book))}</td>
            <td>${escapeHtml(book.isbn || "—")}</td>
            <td>${totalCopies(book)}</td>
            <td>${available} / ${totalCopies(book)}</td>
            <td>
                <button type="button" class="book-action-button" data-action="edit" data-id="${book.id}" aria-label="Modifier"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="book-action-button delete" data-action="delete" data-id="${book.id}" aria-label="Supprimer"><i class="fa-solid fa-trash"></i></button>
            </td>`;
        booksTableBody.appendChild(row);
    });

    const total = books.reduce((sum, book) => sum + totalCopies(book), 0);
    const availableTotal = books.reduce((sum, book) => sum + availableCopies(book), 0);
    document.querySelector("#totalBooks").textContent = total;
    document.querySelector("#availableBooks").textContent = availableTotal;
    document.querySelector("#borrowedBooks").textContent = Math.max(total - availableTotal, 0);
    document.querySelector("#booksResultCount").textContent = `${filtered.length} livre${filtered.length > 1 ? "s" : ""}`;
    updatePagination(document.querySelector("#booksPagination"), result.pagination, (page) => {
        booksPage = page;
        renderBooks();
    });
}

function populateSelect(select, values, placeholder) {
    if (!select) return;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    values.forEach((value) => {
        const option = document.createElement("option");
        option.value = value.id;
        option.textContent = value.designation || value.nom || `${value.prenom || ""} ${value.nom || ""}`.trim();
        select.appendChild(option);
    });
}

function createBookModal(book = null) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay open";
    overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
            <div class="modal-header"><h2>${book ? "Modifier" : "Ajouter"} un livre</h2><button type="button" class="modal-close" data-close aria-label="Fermer">×</button></div>
            <form class="form-group" id="dynamicBookForm">
                <input name="titre" placeholder="Titre" value="${escapeHtml(book?.titre)}" required>
                <input name="isbn" placeholder="ISBN" value="${escapeHtml(book?.isbn)}" required>
                <input name="date_publication" type="date" value="${book?.date_publication || ""}">
                <input name="total_exemplaires" type="number" min="1" value="${book?.total_exemplaires || 1}" required>
                <select name="id_categorie" required></select>
                <select name="auteurs" required></select>
                <textarea name="description" placeholder="Description">${escapeHtml(book?.description)}</textarea>
                <div class="modal-actions"><button type="button" class="button-secondary" data-close>Annuler</button><button type="submit" class="button-primary">Enregistrer</button></div>
            </form>
        </div>`;
    document.body.appendChild(overlay);
    populateSelect(overlay.querySelector('[name="id_categorie"]'), categories, "Catégorie");
    populateSelect(overlay.querySelector('[name="auteurs"]'), authors, "Auteur");
    overlay.querySelector('[name="id_categorie"]').value = book?.id_categorie || "";
    overlay.querySelector('[name="auteurs"]').value = book?.auteur_id || "";
    overlay.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", () => overlay.remove()));
    overlay.querySelector("form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const payload = {
            titre: data.get("titre").trim(), isbn: data.get("isbn").trim(),
            date_publication: data.get("date_publication") || null,
            total_exemplaires: Number(data.get("total_exemplaires")), id_categorie: Number(data.get("id_categorie")),
            auteurs: [Number(data.get("auteurs"))], description: data.get("description").trim()
        };
        await apiRequest(book ? `${BOOKS_API}/${book.id}` : BOOKS_API, { method: book ? "PUT" : "POST", body: JSON.stringify(payload) });
        overlay.remove();
        await loadBooks();
    });
}

async function loadBooks() {
    showState(booksTableBody, "loading", "Chargement des livres…", "fa-spinner");
    try {
        const [bookResponse, authorResponse, categoryResponse] = await Promise.all([
            apiRequest(`${BOOKS_API}?page=1&limit=1000`), apiRequest("/auteurs?page=1&limit=1000"), apiRequest("/categories?page=1&limit=1000")
        ]);
        books = extractCollection(bookResponse, "books");
        authors = extractCollection(authorResponse, "authors");
        categories = extractCollection(categoryResponse, "categories");
        populateSelect(authorFilter, authors, "Tous les auteurs");
        populateSelect(categoryFilter, categories, "Toutes les catégories");
        renderBooks();
    } catch (error) {
        showState(booksTableBody, "error", error.message, "fa-triangle-exclamation");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupCommonNavigation();
    const pagination = document.createElement("div");
    pagination.id = "booksPagination";
    pagination.className = "pagination-controls";
    document.querySelector(".livres-list-card")?.appendChild(pagination);
    [bookSearch, categoryFilter, authorFilter, availabilityFilter].forEach((control) => control?.addEventListener("input", () => { booksPage = 1; renderBooks(); }));
    document.querySelector("#openAddBookButton")?.addEventListener("click", () => createBookModal());
    booksTableBody?.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-action]");
        if (!button) return;
        const book = books.find((item) => String(item.id) === button.dataset.id);
        if (button.dataset.action === "edit") createBookModal(book);
        if (button.dataset.action === "delete" && await confirmAction("Voulez-vous supprimer ce livre ?")) {
            await apiRequest(`${BOOKS_API}/${button.dataset.id}`, { method: "DELETE" });
            await loadBooks();
        }
    });
    loadBooks();
});
