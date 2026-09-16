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
const memberSearch = document.querySelector("#memberSearch");
const memberStatusFilter = document.querySelector("#memberStatusFilter");
let allAdherents = [];
let adherentPage = 1;

// ============================================================
// CHARGER TOUS LES ADHÉRENTS
// ============================================================

async function getAdherents() {
    showState(adherentsContainer, "loading", "Chargement des adhérents…", "fa-spinner");
    try {
        const data = await apiRequest(`${API_URL}?page=1&limit=1000`);
        allAdherents = extractCollection(data, "adherents");
        renderFilteredAdherents();
        updateMemberStats();

        if (data.pagination) {
            updatePagination(document.querySelector("#membersPagination"), data.pagination, (page) => {
                adherentPage = page;
                renderFilteredAdherents();
            });
        }

    } catch (error) {
        console.error("Erreur :", error);

        showState(adherentsContainer, "error", error.message, "fa-triangle-exclamation");
    }
}

function renderFilteredAdherents() {
    const search = memberSearch?.value.trim().toLowerCase() || "";
    const filtered = allAdherents.filter((adherent) => {
        const text = `${adherent.nom} ${adherent.prenom} ${adherent.telephone || ""}`.toLowerCase();
        return !search || text.includes(search);
    });
    const result = paginateItems(filtered, adherentPage);
    afficherAdherents(result.items);
    updatePagination(document.querySelector("#membersPagination"), result.pagination, (page) => {
        adherentPage = page;
        renderFilteredAdherents();
    });
    const count = document.querySelector("#membersResultCount");
    if (count) count.textContent = `${filtered.length} adhérent${filtered.length > 1 ? "s" : ""}`;
}

function updateMemberStats() {
    const total = document.querySelector("#totalMembers");
    if (total) total.textContent = allAdherents.length;

    const active = allAdherents.filter((adherent) => {
        return !adherent.date_expiration || new Date(adherent.date_expiration) >= new Date();
    }).length;
    const activeElement = document.querySelector("#activeMembers");
    if (activeElement) activeElement.textContent = active;
}

// ============================================================
// AFFICHER LES ADHÉRENTS
// ============================================================

function afficherAdherents(adherents) {

    if (!adherentsContainer) {
        return;
    }

    if (!adherents || adherents.length === 0) {
        const empty = document.querySelector("#membersEmptyState");
        if (empty) empty.hidden = false;
        adherentsContainer.innerHTML = `
        `;
        return;
    }

    const empty = document.querySelector("#membersEmptyState");
    if (empty) empty.hidden = true;

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

    if (!await confirmAction("Voulez-vous vraiment supprimer cet adhérent ?")) {
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
            telephone: formData.get("telephone"),
            adresse: "",
            date_adhesion: formData.get("date_inscription") || new Date().toISOString().slice(0, 10),
            date_expiration: new Date(new Date(formData.get("date_inscription") || Date.now()).setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10)
        };

        if (adherentForm.dataset.id) {
            await modifierAdherent(adherentForm.dataset.id, adherent);
        } else {
            await ajouterAdherent(adherent);
        }
    });
}

memberSearch?.addEventListener("input", () => {
    adherentPage = 1;
    renderFilteredAdherents();
});
memberStatusFilter?.addEventListener("change", () => {
    adherentPage = 1;
    renderFilteredAdherents();
});


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

            adherentForm.dataset.id = id;
            document.querySelector("#memberModal")?.classList.add("open");
            document.querySelector("#memberModal")?.removeAttribute("hidden");
        }

    });
}


// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    setupCommonNavigation();
    setupModal("memberModal", "openAddMemberButton", ["closeMemberModalButton", "cancelMemberButton"]);
    const pagination = document.createElement("div");
    pagination.id = "membersPagination";
    pagination.className = "pagination-controls";
    document.querySelector(".adherents-list-card")?.appendChild(pagination);
    getAdherents();
});