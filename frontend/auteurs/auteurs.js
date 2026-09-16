const API_URL = "http://localhost:3000/api/auteurs";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const auteursContainer = document.querySelector("#auteurs-container");
const auteurForm = document.querySelector("#auteur-form");


// ============================================================
// RÉCUPÉRER TOUS LES AUTEURS
// ============================================================

async function getAuteurs() {
    try {
        const data = await apiRequest(API_URL, {
            method: "GET",
        });

        afficherAuteurs(extractCollection(data, "authors"));

    } catch (error) {
        console.error("Erreur lors du chargement des auteurs :", error);

        if (auteursContainer) {
            auteursContainer.innerHTML = `
                <p>Impossible de charger les auteurs.</p>
            `;
        }
    }
}


// ============================================================
// AFFICHER LES AUTEURS
// ============================================================

function afficherAuteurs(auteurs) {

    if (!auteursContainer) {
        return;
    }

    if (!auteurs || auteurs.length === 0) {
        auteursContainer.innerHTML = `
            <p>Aucun auteur trouvé.</p>
        `;

        return;
    }

    auteursContainer.innerHTML = "";

    auteurs.forEach(auteur => {

        const element = document.createElement("div");

        element.innerHTML = `
            <div class="auteur-item">

                <div>
                    <h3>
                        ${auteur.nom ?? ""}
                        ${auteur.prenom ?? ""}
                    </h3>

                    <p>
                        Nationalité :
                        ${auteur.nationalite ?? "Non renseignée"}
                    </p>

                    <p>
                        Date de naissance :
                        ${auteur.date_naissance ?? "Non renseignée"}
                    </p>
                </div>

                <div>

                    <button
                        type="button"
                        class="btn-modifier-auteur"
                        data-id="${auteur.id}"
                    >
                        Modifier
                    </button>

                    <button
                        type="button"
                        class="btn-supprimer-auteur"
                        data-id="${auteur.id}"
                    >
                        Supprimer
                    </button>

                </div>

            </div>
        `;

        auteursContainer.appendChild(element);
    });
}


// ============================================================
// AJOUTER UN AUTEUR
// ============================================================

async function ajouterAuteur(auteur) {

    try {

        const nouvelAuteur = await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify(auteur)
        });

        console.log("Auteur ajouté :", nouvelAuteur);

        await getAuteurs();

        if (auteurForm) {
            auteurForm.reset();
        }

    } catch (error) {

        console.error("Erreur lors de l'ajout :", error);

        alert(error.message);
    }
}


// ============================================================
// MODIFIER UN AUTEUR
// ============================================================

async function modifierAuteur(id, auteur) {

    try {

        const auteurModifie = await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(auteur)
        });

        console.log("Auteur modifié :", auteurModifie);

        await getAuteurs();

    } catch (error) {

        console.error(
            "Erreur lors de la modification :",
            error
        );

        alert(error.message);
    }
}


// ============================================================
// SUPPRIMER UN AUTEUR
// ============================================================

async function supprimerAuteur(id) {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cet auteur ?"
    );

    if (!confirmation) {
        return;
    }

    try {

        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        console.log("Auteur supprimé :", id);

        await getAuteurs();

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

if (auteurForm) {

    auteurForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(auteurForm);

        const auteur = {
            nom: formData.get("nom"),
            prenom: formData.get("prenom"),
            nationalite: formData.get("nationalite"),
            date_naissance: formData.get("date_naissance")
        };

        await ajouterAuteur(auteur);
    });
}


// ============================================================
// ACTIONS MODIFIER / SUPPRIMER
// ============================================================

if (auteursContainer) {

    auteursContainer.addEventListener("click", async (event) => {

        // -----------------------------
        // SUPPRIMER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-supprimer-auteur"
            )
        ) {

            const id = event.target.dataset.id;

            await supprimerAuteur(id);
        }


        // -----------------------------
        // MODIFIER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-modifier-auteur"
            )
        ) {

            const id = event.target.dataset.id;

            console.log(
                "Modifier l'auteur avec l'id :",
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

getAuteurs();