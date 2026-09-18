const API_URL = "https://bibliotheque-da9x.onrender.com/api/categories";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const categoriesContainer = document.querySelector("#categoriesTableBody");
const categorieForm = document.querySelector("#categoryForm");
const categorySearch = document.querySelector("#categorySearch");
let allCategories = [];
let categoryPage = 1;


// ============================================================
// RÉCUPÉRER TOUTES LES CATÉGORIES
// ============================================================

async function getCategories() {
    showState(categoriesContainer, "loading", "Chargement des catégories…", "fa-spinner");
    try {
        const [data, booksData] = await Promise.all([
            apiRequest(`${API_URL}?page=1&limit=1000`),
            apiRequest("/livres?page=1&limit=1000")
        ]);
        allCategories = extractCollection(data, "categories");
        const books = extractCollection(booksData, "books");
        renderFilteredCategories();
        const total = document.querySelector("#totalCategories");
        if (total) total.textContent = allCategories.length;
        const used = new Set(books.map((book) => String(book.id_categorie ?? book.categorie_id ?? book.category_id)).filter(Boolean)).size;
        const usedElement = document.querySelector("#usedCategories");
        if (usedElement) usedElement.textContent = used;
        const recent = document.querySelector("#recentCategories");
        if (recent) recent.textContent = allCategories.length;

    } catch (error) {
        console.error(
            "Erreur lors du chargement des catégories :",
            error
        );

        showState(categoriesContainer, "error", error.message, "fa-triangle-exclamation");
    }
}

function renderFilteredCategories() {
    const search = categorySearch?.value.trim().toLowerCase() || "";
    const filtered = allCategories.filter((category) => (category.designation || category.nom || "").toLowerCase().includes(search));
    const result = paginateItems(filtered, categoryPage);
    afficherCategories(result.items);
    updatePagination(document.querySelector("#categoriesPagination"), result.pagination, (page) => {
        categoryPage = page;
        renderFilteredCategories();
    });
    const count = document.querySelector("#categoriesResultCount");
    if (count) count.textContent = filtered.length;
}


// ============================================================
// AFFICHER LES CATÉGORIES
// ============================================================

function afficherCategories(categories) {

    if (!categoriesContainer) {
        return;
    }

    if (!categories || categories.length === 0) {
        document.querySelector("#categoriesEmptyState")?.removeAttribute("hidden");
        categoriesContainer.innerHTML = "";

        return;
    }

    document.querySelector("#categoriesEmptyState")?.setAttribute("hidden", "");

    categoriesContainer.innerHTML = "";

    categories.forEach(categorie => {

        const element = document.createElement("tr");

        element.innerHTML = `
            <td>${categorie.designation ?? categorie.nom ?? ""}</td>
            <td>${Number(categorie.nombre_livres || 0)}</td>
            <td>${escapeHtml(formatDate(categorie.created_at))}</td>
            <td>
                <button type="button" class="table-action-button" data-action="edit" data-id="${categorie.id}" aria-label="Modifier"><i class="fa-solid fa-pen"></i></button>
                <button type="button" class="table-action-button delete" data-action="delete" data-id="${categorie.id}" aria-label="Supprimer"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        categoriesContainer.appendChild(element);
    });
}


// ============================================================
// AJOUTER UNE CATÉGORIE
// ============================================================

async function ajouterCategorie(categorie) {

    try {

        const nouvelleCategorie = await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({
                designation: categorie.nom
            })
        });

        console.log(
            "Catégorie ajoutée :",
            nouvelleCategorie
        );

        await getCategories();
        showToast("Catégorie ajoutée avec succès");

        if (categorieForm) {
            categorieForm.reset();
        }

    } catch (error) {

        console.error(
            "Erreur lors de l'ajout :",
            error
        );

        showFormMessage("#categoryFormMessage", error.message);
    }
}

async function enregistrerCategorie(categorie) {
    const id = document.querySelector("#categoryId")?.value;
    if (id) {
        await modifierCategorie(id, categorie);
        return;
    }
    await ajouterCategorie(categorie);
}


// ============================================================
// MODIFIER UNE CATÉGORIE
// ============================================================

async function modifierCategorie(id, categorie) {

    try {

        const categorieModifiee = await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                designation: categorie.nom
            })
        });

        console.log(
            "Catégorie modifiée :",
            categorieModifiee
        );

        await getCategories();
        showToast("Catégorie modifiée avec succès");

    } catch (error) {

        console.error(
            "Erreur lors de la modification :",
            error
        );

        showFormMessage("#categoryFormMessage", error.message);
    }
}


// ============================================================
// SUPPRIMER UNE CATÉGORIE
// ============================================================

async function supprimerCategorie(id) {

    if (!await confirmAction("Voulez-vous vraiment supprimer cette catégorie ?")) {
        return;
    }

    try {

        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        console.log(
            "Catégorie supprimée :",
            id
        );

        await getCategories();
        showToast("Catégorie supprimée avec succès");

    } catch (error) {

        console.error(
            "Erreur lors de la suppression :",
            error
        );

        showToast(error.message, "error");
    }
}


// ============================================================
// FORMULAIRE D'AJOUT
// ============================================================

if (categorieForm) {

    categorieForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(categorieForm);

        const categorie = {
            nom: formData.get("nom"),
            description: formData.get("description")
        };

        await enregistrerCategorie(categorie);
    });
}

categorySearch?.addEventListener("input", () => {
    categoryPage = 1;
    renderFilteredCategories();
});


// ============================================================
// ACTIONS MODIFIER / SUPPRIMER
// ============================================================

if (categoriesContainer) {

    categoriesContainer.addEventListener("click", async (event) => {

        // -----------------------------
        // SUPPRIMER
        // -----------------------------

        const button = event.target.closest("[data-action]");
        if (!button) return;

        if (button.dataset.action === "delete") {

            const id = button.dataset.id;

            await supprimerCategorie(id);
        }


        // -----------------------------
        // MODIFIER
        // -----------------------------

        if (button.dataset.action === "edit") {

            const id = button.dataset.id;
            const categorie = allCategories.find((item) => String(item.id) === String(id));
            const modal = document.querySelector("#categoryModal");
            if (categorie && modal) {
                document.querySelector("#categoryId").value = categorie.id;
                document.querySelector("#categoryName").value = categorie.designation || categorie.nom || "";
                modal.hidden = false;
                modal.classList.add("open");
            }
        }
    });
}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    setupCommonNavigation();
    setupModal("categoryModal", "openAddCategoryButton", ["closeCategoryModalButton", "cancelCategoryButton"]);
    const pagination = document.createElement("div");
    pagination.id = "categoriesPagination";
    pagination.className = "pagination-controls";
    document.querySelector(".categories-list-card")?.appendChild(pagination);
    getCategories();
});