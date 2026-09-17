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

function populateLoanOptions(books, adherents) {
    const bookSelect = document.querySelector("#loanBook");
    const memberSelect = document.querySelector("#loanMember");

    if (bookSelect) {
        bookSelect.innerHTML = '<option value="">Sélectionner un livre</option>';
        books.forEach((book) => {
            const option = document.createElement("option");
            option.value = book.id;
            option.textContent = `${book.titre} (${book.exemplaires_disponibles} disponible(s))`;
            option.disabled = Number(book.exemplaires_disponibles || 0) <= 1;
            bookSelect.appendChild(option);
        });
    }

    if (memberSelect) {
        memberSelect.innerHTML = '<option value="">Sélectionner un adhérent</option>';
        adherents.forEach((adherent) => {
            const option = document.createElement("option");
            option.value = adherent.id;
            option.textContent = `${adherent.prenom} ${adherent.nom}`;
            memberSelect.appendChild(option);
        });
    }
}

async function loadLoanOptions() {
    const [booksResponse, adherentsResponse] = await Promise.all([
        apiRequest("/livres?page=1&limit=1000"),
        apiRequest("/adherents?page=1&limit=1000")
    ]);
    populateLoanOptions(
        extractCollection(booksResponse, "books"),
        extractCollection(adherentsResponse, "adherents")
    );
}

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
    const period = document.querySelector("#loanPeriodFilter")?.value || "";
    const now = new Date();
    const periodStart = period === "today"
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
        : period === "week"
            ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
            : period === "month"
                ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)
                : null;
    const filtered = allLoans.filter((loan) => {
        const text = `${loan.livre_titre || ""} ${loan.adherent_nom || ""} ${loan.adherent_prenom || ""}`.toLowerCase();
        const matchesStatus = !status || status === loan.statut || (status === "active" && loan.statut === "en_cours") || (status === "late" && loan.statut === "en_retard") || (status === "returned" && loan.statut === "retourne");
        const loanDate = new Date(loan.date_emprunt);
        const matchesPeriod = !periodStart || loanDate >= periodStart;
        return (!search || text.includes(search)) && matchesStatus && matchesPeriod;
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
            <td>${escapeHtml(emprunt.livre_titre ?? emprunt.livre?.titre ?? "Livre inconnu")}</td>
            <td>${escapeHtml(`${emprunt.adherent_nom ?? emprunt.adherent?.nom ?? "Inconnu"} ${emprunt.adherent_prenom ?? emprunt.adherent?.prenom ?? ""}`)}</td>
            <td>${escapeHtml(formatDate(emprunt.date_emprunt))}</td>
            <td>${escapeHtml(formatDate(emprunt.date_retour_prevue))}</td>
            <td>${escapeHtml(formatDate(emprunt.date_retour))}</td>
            <td>${escapeHtml(emprunt.statut ?? "Non renseigné")}</td>
            <td>
                ${emprunt.statut !== "retourne" ? `
                    <button type="button" class="table-action-button" data-action="edit" data-id="${emprunt.id}" aria-label="Modifier"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="table-action-button" data-action="return" data-id="${emprunt.id}" aria-label="Retourner"><i class="fa-solid fa-rotate-left"></i></button>
                    <button type="button" class="table-action-button delete" data-action="delete" data-id="${emprunt.id}" aria-label="Supprimer"><i class="fa-solid fa-trash"></i></button>
                ` : `<span class="table-action-empty">Aucune action</span>`}
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
        showToast("Emprunt créé avec succès");

        if (empruntForm) {
            empruntForm.reset();
        }

    } catch (error) {

        console.error("Erreur lors de la création :", error);

        showFormMessage("#loanFormMessage", error.message);
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
        showToast("Emprunt modifié avec succès");

    } catch (error) {

        console.error("Erreur lors de la modification :", error);

        showFormMessage("#loanFormMessage", error.message);
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
        showToast("Emprunt supprimé avec succès");

    } catch (error) {

        console.error("Erreur lors de la suppression :", error);

        showToast(error.message, "error");
    }
}

async function retournerEmprunt(id) {
    if (!await confirmAction("Confirmer le retour de ce livre ?")) return;

    try {
        const today = new Date();
        const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        await apiRequest(`${API_URL}/${id}/retour`, {
            method: "PUT",
            body: JSON.stringify({ date_retour: localDate })
        });
        await getEmprunts();
        await loadLoanOptions();
        showToast("Livre retourné avec succès");
    } catch (error) {
        showFormMessage("#loanFormMessage", error.message);
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
document.querySelector("#loanPeriodFilter")?.addEventListener("change", () => {
    loanPage = 1;
    renderFilteredLoans();
});

document.querySelector("#exportOverdueLoansButton")?.addEventListener("click", () => {
    if (allLoans.length === 0) {
        showToast("Aucun emprunt à exporter", "error");
        return;
    }
    exportLoansToCsv(allLoans, "emprunts.csv");
    showToast("Export CSV généré avec succès");
});

// ============================================================
// ACTIONS MODIFIER / SUPPRIMER
// ============================================================

if (empruntsContainer) {

    empruntsContainer.addEventListener("click", async (event) => {

        // -----------------------------
        // SUPPRIMER
        // -----------------------------

        const button = event.target.closest("[data-action]");
        if (!button) return;

        if (button.dataset.action === "delete") {

            const id = button.dataset.id;

            await supprimerEmprunt(id);
        }

        // -----------------------------
        // MODIFIER
        // -----------------------------

        if (button.dataset.action === "return") {
            await retournerEmprunt(button.dataset.id);
            return;
        }

        if (button.dataset.action === "edit") {

            const id = button.dataset.id;
            const emprunt = allLoans.find((item) => String(item.id) === String(id));

            empruntForm.dataset.id = id;
            if (emprunt) {
                document.querySelector("#loanBook").value = emprunt.id_livre || "";
                document.querySelector("#loanMember").value = emprunt.id_adherent || "";
                document.querySelector("#loanStartDate").value = emprunt.date_emprunt || "";
                document.querySelector("#loanDueDate").value = emprunt.date_retour_prevue || "";
            }
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
    Promise.all([loadLoanOptions(), getEmprunts()]).catch((error) => {
        showFormMessage("#loanFormMessage", error.message);
    });
});