const API_URL = "http://localhost:3000/api/categories";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const categoriesContainer = document.querySelector("#categories-container");
const categorieForm = document.querySelector("#categorie-form");


// ============================================================
// RÉCUPÉRER TOUTES LES CATÉGORIES
// ============================================================

async function getCategories() {
    try {
        const data = await apiRequest(API_URL, {
            method: "GET",
        });

        afficherCategories(extractCollection(data, "categories"));

    } catch (error) {
        console.error(
            "Erreur lors du chargement des catégories :",
            error
        );

        if (categoriesContainer) {
            categoriesContainer.innerHTML = `
                <p>Impossible de charger les catégories.</p>
            `;
        }
    }
}


// ============================================================
// AFFICHER LES CATÉGORIES
// ============================================================

function afficherCategories(categories) {

    if (!categoriesContainer) {
        return;
    }

    if (!categories || categories.length === 0) {
        categoriesContainer.innerHTML = `
            <p>Aucune catégorie trouvée.</p>
        `;

        return;
    }

    categoriesContainer.innerHTML = "";

    categories.forEach(categorie => {

        const element = document.createElement("div");

        element.innerHTML = `
            <div class="categorie-item">

                <div>
                    <h3>
                        ${categorie.nom ?? ""}
                    </h3>

                    <p>
                        ${categorie.description ?? "Aucune description"}
                    </p>
                </div>

                <div>

                    <button
                        type="button"
                        class="btn-modifier-categorie"
                        data-id="${categorie.id}"
                    >
                        Modifier
                    </button>

                    <button
                        type="button"
                        class="btn-supprimer-categorie"
                        data-id="${categorie.id}"
                    >
                        Supprimer
                    </button>

                </div>

            </div>
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

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cette catégorie ?"
    );

    if (!confirmation) {
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

        await ajouterCategorie(categorie);
    });
}


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

            console.log(
                "Modifier la catégorie avec l'id :",
                id
            );

            // Le formulaire de modification
            // sera connecté avec le HTML.
        }
    });
}


// ============================================================
// INITIALISATION
// ============================================================

getCategories();