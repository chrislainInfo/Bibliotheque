// ============================================================
// EMPRUNTS - Gestion des emprunts
// ============================================================

const API_URL = "http://localhost:3000/api/emprunts";

// ============================================================
// ÉLÉMENTS HTML
// ============================================================

const empruntsContainer = document.querySelector("#loansTableBody");
const empruntForm = document.querySelector("#loanForm");
const loanSearch = document.querySelector("#loanSearch");
const loanStatusFilter = document.querySelector("#loanStatusFilter");
let allLoans = [];
let loanPage = 1;

// ============================================================
// RÉCUPÉRER TOUS LES EMPRUNTS
// ============================================================

async function getEmprunts() {
    showState(empruntsContainer, "loading", "Chargement des emprunts…", "fa-spinner");
    try {
        const data = await apiRequest(`${API_URL}?page=1&limit=1000`);
        allLoans = extractCollection(data, "emprunts");
        renderFilteredLoans();
        const total = document.querySelector("#totalLoans");
        const active = document.querySelector("#activeLoans");
        const late = document.querySelector("#lateLoans");
        if (total) total.textContent = data.pagination?.total ?? allLoans.length;
        if (active) active.textContent = allLoans.filter((loan) => loan.statut === "en_cours").length;
        if (late) late.textContent = allLoans.filter((loan) => loan.statut === "en_retard").length;

    } catch (error) {
        console.error("Erreur lors du chargement des emprunts :", error);

        showState(empruntsContainer, "error", error.message, "fa-triangle-exclamation");
    }
}

function renderFilteredLoans() {
    const search = loanSearch?.value.trim().toLowerCase() || "";
    const status = loanStatusFilter?.value || "";
    const filtered = allLoans.filter((loan) => {
        const text = `${loan.livre_titre || ""} ${loan.adherent_nom || ""} ${loan.adherent_prenom || ""}`.toLowerCase();
        const matchesStatus = !status || status === loan.statut || (status === "active" && loan.statut === "en_cours") || (status === "late" && loan.statut === "en_retard") || (status === "returned" && loan.statut === "retourne");
        return (!search || text.includes(search)) && matchesStatus;
    });
    const result = paginateItems(filtered, loanPage);
    afficherEmprunts(result.items);
    updatePagination(document.querySelector("#loansPagination"), result.pagination, (page) => {
        loanPage = page;
        renderFilteredLoans();
    });
    const count = document.querySelector("#loansResultCount");
    if (count) count.textContent = `${filtered.length} emprunt${filtered.length > 1 ? "s" : ""}`;
}

// ============================================================
// AFFICHER LES EMPRUNTS
// ============================================================

function afficherEmprunts(emprunts) {

    if (!empruntsContainer) {
        return;
    }

    if (!emprunts || emprunts.length === 0) {
        document.querySelector("#loansEmptyState")?.removeAttribute("hidden");
        empruntsContainer.innerHTML = "";

        return;
    }

    document.querySelector("#loansEmptyState")?.setAttribute("hidden", "");

    empruntsContainer.innerHTML = "";

    emprunts.forEach(emprunt => {

        const element = document.createElement("tr");

        element.innerHTML = `
            <td>${emprunt.livre_titre ?? emprunt.livre?.titre ?? "Livre inconnu"}</td>
            <td>${emprunt.adherent_nom ?? emprunt.adherent?.nom ?? "Inconnu"} ${emprunt.adherent_prenom ?? emprunt.adherent?.prenom ?? ""}</td>
            <td>${emprunt.date_emprunt ?? "Non renseignée"}</td>
            <td>${emprunt.date_retour_prevue ?? "Non renseignée"}</td>
            <td>${emprunt.date_retour ?? "Non renseignée"}</td>
            <td>${emprunt.statut ?? "Non renseigné"}</td>
            <td>
                <button type="button" class="btn-modifier-emprunt" data-id="${emprunt.id}">Modifier</button>
                <button type="button" class="btn-supprimer-emprunt" data-id="${emprunt.id}">Supprimer</button>
            </td>
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

    if (!await confirmAction("Voulez-vous vraiment supprimer cet emprunt ?")) {
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

        if (empruntForm.dataset.id) {
            await modifierEmprunt(empruntForm.dataset.id, emprunt);
        } else {
            await ajouterEmprunt(emprunt);
        }
    });
}

loanSearch?.addEventListener("input", () => {
    loanPage = 1;
    renderFilteredLoans();
});
loanStatusFilter?.addEventListener("change", () => {
    loanPage = 1;
    renderFilteredLoans();
});

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

            empruntForm.dataset.id = id;
            document.querySelector("#loanModal")?.classList.add("open");
            document.querySelector("#loanModal")?.removeAttribute("hidden");
        }

    });
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    setupCommonNavigation();
    setupModal("loanModal", "openAddLoanButton", ["closeLoanModalButton", "cancelLoanButton"]);
    const pagination = document.createElement("div");
    pagination.id = "loansPagination";
    pagination.className = "pagination-controls";
    document.querySelector(".emprunts-list-card")?.appendChild(pagination);
    getEmprunts();
});