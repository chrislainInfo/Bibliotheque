// ============================================================
// EMPRUNTS - Gestion des emprunts
// ============================================================

const API_URL = "http://localhost:3000/api/emprunts";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const empruntsContainer = document.querySelector("#emprunts-container");
const empruntForm = document.querySelector("#emprunt-form");

// ============================================================
// RÉCUPÉRER TOUS LES EMPRUNTS
// ============================================================

async function getEmprunts() {
    try {
        const data = await apiRequest(API_URL, {
            method: "GET",
        });

        afficherEmprunts(extractCollection(data, "emprunts"));

    } catch (error) {
        console.error("Erreur lors du chargement des emprunts :", error);

        if (empruntsContainer) {
            empruntsContainer.innerHTML = `
                <p>Impossible de charger les emprunts.</p>
            `;
        }
    }
}

// ============================================================
// AFFICHER LES EMPRUNTS
// ============================================================

function afficherEmprunts(emprunts) {

    if (!empruntsContainer) {
        return;
    }

    if (!emprunts || emprunts.length === 0) {
        empruntsContainer.innerHTML = `
            <p>Aucun emprunt trouvé.</p>
        `;

        return;
    }

    empruntsContainer.innerHTML = "";

    emprunts.forEach(emprunt => {

        const element = document.createElement("div");

        element.innerHTML = `
            <div class="emprunt-item">

                <div>
                    <h3>
                        ${emprunt.livre?.titre ?? "Livre inconnu"}
                    </h3>

                    <p>
                        Adhérent :
                        ${emprunt.adherent?.nom ?? "Inconnu"}
                        ${emprunt.adherent?.prenom ?? ""}
                    </p>

                    <p>
                        Date d'emprunt :
                        ${emprunt.date_emprunt ?? "Non renseignée"}
                    </p>

                    <p>
                        Date de retour :
                        ${emprunt.date_retour ?? "Non renseignée"}
                    </p>

                    <p>
                        Statut :
                        ${emprunt.statut ?? "Non renseigné"}
                    </p>
                </div>

                <div>

                    <button
                        type="button"
                        class="btn-modifier-emprunt"
                        data-id="${emprunt.id}"
                    >
                        Modifier
                    </button>

                    <button
                        type="button"
                        class="btn-supprimer-emprunt"
                        data-id="${emprunt.id}"
                    >
                        Supprimer
                    </button>

                </div>

            </div>
        `;

        empruntsContainer.appendChild(element);
    });
}

// ============================================================
// CRÉER UN EMPRUNT
// ============================================================

async function ajouterEmprunt(emprunt) {

    try {

        const nouvelEmprunt = await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify(emprunt)
        });

        console.log("Emprunt créé :", nouvelEmprunt);

        await getEmprunts();

        if (empruntForm) {
            empruntForm.reset();
        }

    } catch (error) {

        console.error("Erreur lors de la création :", error);

        alert(error.message);
    }
}

// ============================================================
// MODIFIER UN EMPRUNT
// ============================================================

async function modifierEmprunt(id, emprunt) {

    try {

        const empruntModifie = await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(emprunt)
        });

        console.log("Emprunt modifié :", empruntModifie);

        await getEmprunts();

    } catch (error) {

        console.error("Erreur lors de la modification :", error);

        alert(error.message);
    }
}

// ============================================================
// SUPPRIMER UN EMPRUNT
// ============================================================

async function supprimerEmprunt(id) {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cet emprunt ?"
    );

    if (!confirmation) {
        return;
    }

    try {

        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        console.log("Emprunt supprimé :", id);

        await getEmprunts();

    } catch (error) {

        console.error("Erreur lors de la suppression :", error);

        alert(error.message);
    }
}

// ============================================================
// FORMULAIRE DE CRÉATION D'UN EMPRUNT
// ============================================================

if (empruntForm) {

    empruntForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(empruntForm);

        const emprunt = {
            id_livre: formData.get("livre_id"),
            id_adherent: formData.get("adherent_id"),
            date_emprunt: formData.get("date_emprunt"),
            date_retour_prevue: formData.get("date_retour_prevue")
        };

        await ajouterEmprunt(emprunt);
    });
}

// ============================================================
// ACTIONS MODIFIER / SUPPRIMER
// ============================================================

if (empruntsContainer) {

    empruntsContainer.addEventListener("click", async (event) => {

        // -----------------------------
        // SUPPRIMER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-supprimer-emprunt"
            )
        ) {

            const id = event.target.dataset.id;

            await supprimerEmprunt(id);
        }

        // -----------------------------
        // MODIFIER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-modifier-emprunt"
            )
        ) {

            const id = event.target.dataset.id;

            console.log(
                "Modifier l'emprunt avec l'id :",
                id
            );

            // Le formulaire de modification sera connecté
            // lorsque nous aurons le HTML exact.
        }

    });
}

// ============================================================
// INITIALISATION
// ============================================================

getEmprunts();