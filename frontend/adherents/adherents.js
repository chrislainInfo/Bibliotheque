// ============================================================
// ADHÉRENTS - Gestion des adhérents
// ============================================================

// URL de base de l'API
const API_URL = "http://localhost:3000/api/adherents";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const adherentsContainer = document.querySelector("#membersTableBody");
const adherentForm = document.querySelector("#memberForm");

// ============================================================
// CHARGER TOUS LES ADHÉRENTS
// ============================================================

async function getAdherents() {
    try {
        const data = await apiRequest(API_URL, {
            method: "GET",
        });

        afficherAdherents(extractCollection(data, "adherents"));

    } catch (error) {
        console.error("Erreur :", error);

        if (adherentsContainer) {
            adherentsContainer.innerHTML = `
                <p>Impossible de charger les adhérents.</p>
            `;
        }
    }
}

// ============================================================
// AFFICHER LES ADHÉRENTS
// ============================================================

function afficherAdherents(adherents) {

    if (!adherentsContainer) {
        return;
    }

    if (!adherents || adherents.length === 0) {
        adherentsContainer.innerHTML = `
            <p>Aucun adhérent trouvé.</p>
        `;
        return;
    }

    adherentsContainer.innerHTML = "";

    adherents.forEach(adherent => {

        const element = document.createElement("tr");

        element.innerHTML = `
            <td>${adherent.nom ?? ""} ${adherent.prenom ?? ""}</td>
            <td>${adherent.email ?? "Non renseigné"}</td>
            <td>${adherent.telephone ?? "Non renseigné"}</td>
            <td>${adherent.date_adhesion ?? "Non renseignée"}</td>
            <td>—</td>
            <td><span class="badge badge-active">Actif</span></td>
            <td>
                <button type="button" class="btn-modifier-adherent" data-id="${adherent.id}">Modifier</button>
                <button type="button" class="btn-supprimer-adherent" data-id="${adherent.id}">Supprimer</button>
            </td>
        `;

        adherentsContainer.appendChild(element);
    });
}


// ============================================================
// AJOUTER UN ADHÉRENT
// ============================================================

async function ajouterAdherent(adherent) {

    try {

        const nouvelAdherent = await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify(adherent)
        });

        console.log("Adhérent ajouté :", nouvelAdherent);

        await getAdherents();

        if (adherentForm) {
            adherentForm.reset();
        }

    } catch (error) {

        console.error("Erreur :", error);

        alert(error.message);
    }
}


// ============================================================
// MODIFIER UN ADHÉRENT
// ============================================================

async function modifierAdherent(id, adherent) {

    try {

        const adherentModifie = await apiRequest(`${API_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(adherent)
        });

        console.log("Adhérent modifié :", adherentModifie);

        await getAdherents();

    } catch (error) {

        console.error("Erreur :", error);

        alert(error.message);
    }
}


// ============================================================
// SUPPRIMER UN ADHÉRENT
// ============================================================

async function supprimerAdherent(id) {

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer cet adhérent ?"
    );

    if (!confirmation) {
        return;
    }

    try {

        await apiRequest(`${API_URL}/${id}`, {
            method: "DELETE",
        });

        console.log("Adhérent supprimé :", id);

        await getAdherents();

    } catch (error) {

        console.error("Erreur :", error);

        alert(error.message);
    }
}


// ============================================================
// FORMULAIRE D'AJOUT
// ============================================================

if (adherentForm) {

    adherentForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const formData = new FormData(adherentForm);

        const adherent = {
            nom: formData.get("nom"),
            prenom: formData.get("prenom"),
            email: formData.get("email"),
            telephone: formData.get("telephone")
        };

        await ajouterAdherent(adherent);
    });
}


// ============================================================
// ACTIONS MODIFIER / SUPPRIMER
// ============================================================

if (adherentsContainer) {

    adherentsContainer.addEventListener("click", async (event) => {

        // -----------------------------
        // SUPPRIMER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-supprimer-adherent"
            )
        ) {

            const id = event.target.dataset.id;

            await supprimerAdherent(id);
        }


        // -----------------------------
        // MODIFIER
        // -----------------------------

        if (
            event.target.classList.contains(
                "btn-modifier-adherent"
            )
        ) {

            const id = event.target.dataset.id;

            console.log(
                "Modifier l'adhérent avec l'id :",
                id
            );

            // La logique du formulaire de modification
            // sera connectée lorsque nous aurons
            // le HTML exact de la page.
        }

    });
}


// ============================================================
// INITIALISATION
// ============================================================

getAdherents();