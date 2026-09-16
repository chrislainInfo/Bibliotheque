const API_URL = "http://localhost:3000/api/categories";

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
        const data = await apiRequest(`${API_URL}?page=1&limit=1000`);
        allCategories = extractCollection(data, "categories");
        renderFilteredCategories();
        const total = document.querySelector("#totalCategories");
        if (total) total.textContent = allCategories.length;

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
            <td>${categorie.description ?? "Aucune description"}</td>
            <td>—</td>
            <td>${categorie.created_at ?? "—"}</td>
            <td>
                <button type="button" class="btn-modifier-categorie" data-id="${categorie.id}">Modifier</button>
                <button type="button" class="btn-supprimer-categorie" data-id="${categorie.id}">Supprimer</button>
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

        if (categorieForm) {
            categorieForm.reset();
        }

    } catch (error) {

        console.error(
            "Erreur lors de l'ajout :",
            error
        );

        alert(error.message);
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

    } catch (error) {

        console.error(
            "Erreur lors de la modification :",
            error
        );

        alert(error.message);
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

    } catch (error) {

        console.error(
            "Erreur lors de la suppression :",
            error
        );

        alert(error.message);
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

        if (
            event.target.classList.contains(
                "btn-supprimer-categorie"
            )
        ) {

            const id = event.target.dataset.id;

            await supprimerCategorie(id);
        }


        // -----------------------------
        // MODIFIER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-modifier-categorie"
            )
        ) {

            const id = event.target.dataset.id;
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