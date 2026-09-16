const API_URL = "http://localhost:3000/api/auteurs";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const auteursContainer = document.querySelector("#authorsTableBody");
const auteurForm = document.querySelector("#authorForm");
const authorSearch = document.querySelector("#authorSearch");
let allAuthors = [];
let authorPage = 1;


// ============================================================
// RÉCUPÉRER TOUS LES AUTEURS
// ============================================================

async function getAuteurs() {
    showState(auteursContainer, "loading", "Chargement des auteurs…", "fa-spinner");
    try {
        const data = await apiRequest(`${API_URL}?page=1&limit=1000`);
        allAuthors = extractCollection(data, "authors");
        renderFilteredAuthors();
        const total = document.querySelector("#totalAuthors");
        if (total) total.textContent = allAuthors.length;

    } catch (error) {
        console.error("Erreur lors du chargement des auteurs :", error);

        showState(auteursContainer, "error", error.message, "fa-triangle-exclamation");
    }
}

function renderFilteredAuthors() {
    const search = authorSearch?.value.trim().toLowerCase() || "";
    const filtered = allAuthors.filter((author) => `${author.nom} ${author.prenom}`.toLowerCase().includes(search));
    const result = paginateItems(filtered, authorPage);
    afficherAuteurs(result.items);
    updatePagination(document.querySelector("#authorsPagination"), result.pagination, (page) => {
        authorPage = page;
        renderFilteredAuthors();
    });
    const count = document.querySelector("#authorsResultCount");
    if (count) count.textContent = filtered.length;
}


// ============================================================
// AFFICHER LES AUTEURS
// ============================================================

function afficherAuteurs(auteurs) {

    if (!auteursContainer) {
        return;
    }

    if (!auteurs || auteurs.length === 0) {
        document.querySelector("#authorsEmptyState")?.removeAttribute("hidden");
        auteursContainer.innerHTML = "";

        return;
    }

    document.querySelector("#authorsEmptyState")?.setAttribute("hidden", "");

    auteursContainer.innerHTML = "";

    auteurs.forEach(auteur => {

        const element = document.createElement("tr");

        element.innerHTML = `
            <td>${auteur.nom ?? ""}</td>
            <td>${auteur.prenom ?? ""}</td>
            <td>—</td>
            <td>—</td>
            <td>
                <button type="button" class="btn-modifier-auteur" data-id="${auteur.id}">Modifier</button>
                <button type="button" class="btn-supprimer-auteur" data-id="${auteur.id}">Supprimer</button>
            </td>
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

async function enregistrerAuteur(auteur) {
    const id = document.querySelector("#authorId")?.value;
    if (id) {
        await modifierAuteur(id, auteur);
        return;
    }
    await ajouterAuteur(auteur);
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

    if (!await confirmAction("Voulez-vous vraiment supprimer cet auteur ?")) {
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

        await enregistrerAuteur(auteur);
    });
}

authorSearch?.addEventListener("input", () => {
    authorPage = 1;
    renderFilteredAuthors();
});


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
            const auteur = allAuthors.find((item) => String(item.id) === String(id));
            const modal = document.querySelector("#authorModal");
            if (auteur && modal) {
                document.querySelector("#authorId").value = auteur.id;
                document.querySelector("#authorFirstName").value = auteur.prenom || "";
                document.querySelector("#authorLastName").value = auteur.nom || "";
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
    setupModal("authorModal", "openAddAuthorButton", ["closeAuthorModalButton", "cancelAuthorButton"]);
    const pagination = document.createElement("div");
    pagination.id = "authorsPagination";
    pagination.className = "pagination-controls";
    document.querySelector(".auteurs-list-card")?.appendChild(pagination);
    getAuteurs();
});