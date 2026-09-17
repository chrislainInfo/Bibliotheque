/* =========================================================
   CONFIGURATION
========================================================= */

/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    setupCommonNavigation();

    try {
        await loadDashboard();
    } catch (error) {
        console.error("Erreur dashboard :", error);
        showDashboardError(error.message);
    }
});


/* =========================================================
   CHARGEMENT DU DASHBOARD
========================================================= */

async function loadDashboard() {

    /*
        Endpoint prévu spécialement pour le dashboard
    */

    const response = await apiRequest("/dashboard/bibliothecaire");
    const dashboard = response?.dashboard || response || {};


    /*
        Affichage du bibliothécaire connecté
    */

    displayLibrarian();


    /*
        Statistiques
    */

    const statistiques = dashboard.statistiques || {};

    displayStatistics(statistiques);


    /*
        Emprunts en retard
    */

    displayOverdueLoans(
        dashboard.emprunts_en_retard || dashboard.empruntsEnRetard || []
    );


    /*
        Activité récente
    */

    displayRecentActivity(
        dashboard.emprunts_recents || dashboard.empruntsRecents || []
    );

    updateAvailability(
        Number(statistiques.exemplaires_disponibles || 0),
        Number(statistiques.exemplaires_empruntes || 0),
        Number(statistiques.total_exemplaires || 0)
            ? Math.round(
                (Number(statistiques.exemplaires_disponibles || 0)
                    / Number(statistiques.total_exemplaires)) * 100
            )
            : 0
    );
}


/* =========================================================
   PROFIL BIBLIOTHÉCAIRE
========================================================= */

function displayLibrarian() {
    updateAuthenticatedProfile();
}


/* =========================================================
   INITIALES
========================================================= */

function getInitials(firstName, lastName) {

    const firstInitial =
        firstName
            ?.trim()
            .charAt(0) || "";


    const lastInitial =
        lastName
            ?.trim()
            .charAt(0) || "";


    return (
        `${firstInitial}${lastInitial}`
    ).toUpperCase();
}


/* =========================================================
   STATISTIQUES
========================================================= */

function displayStatistics(statistiques = {}) {

    const totalBooks =
        Number(
            statistiques.livres || statistiques.totalLivres || 0
        );


    const totalMembers =
        Number(
            statistiques.adherents || statistiques.totalAdherents || 0
        );


    const activeLoans =
        Number(
            statistiques.emprunts_actifs || statistiques.empruntsActifs || 0
        );


    const overdueLoans =
        Number(
            statistiques.emprunts_en_retard || statistiques.empruntsEnRetard || 0
        );


    setText(
        "#totalBooks",
        totalBooks
    );


    setText(
        "#totalMembers",
        totalMembers
    );


    setText(
        "#activeLoans",
        activeLoans
    );


    setText(
        "#overdueLoans",
        overdueLoans
    );
}


/* =========================================================
   AFFICHAGE DISPONIBILITÉ
========================================================= */

function updateAvailability(
    availableBooks,
    borrowedBooks,
    percentage
) {

    setText(
        "#availableBooks",
        availableBooks
    );


    setText(
        "#borrowedBooks",
        borrowedBooks
    );


    setText(
        "#availabilityPercentage",
        `${percentage}%`
    );


    const ring =
        document.querySelector(
            ".availability-ring"
        );


    if (!ring) {
        return;
    }


    ring.style.background =
        `conic-gradient(
            var(--color-green) 0 ${percentage}%,
            #eeeaf0 ${percentage}% 100%
        )`;
}


/* =========================================================
   EMPRUNTS EN RETARD
========================================================= */

function displayOverdueLoans(loans) {

    const container =
        document.querySelector("#overdueList, .loan-list");


    if (!container) {
        return;
    }


    /*
        Aucun emprunt en retard
    */

    if (!Array.isArray(loans) || loans.length === 0) {

        container.innerHTML = `
            <div class="empty-row">
                <i class="fa-regular fa-circle-check"></i>
                <span>Aucun emprunt en retard</span>
            </div>
        `;

        return;
    }


    /*
        On limite l'affichage aux
        quelques éléments visibles dans le dashboard.
    */

    const visibleLoans =
        loans.slice(0, 5);


    container.innerHTML =
        visibleLoans
            .map(
                (loan) =>
                    createOverdueLoanHTML(loan)
            )
            .join("");
}


/* =========================================================
   HTML EMPRUNT EN RETARD
========================================================= */

function createOverdueLoanHTML(loan) {

    const firstName =
        loan.adherent_prenom ||
        loan.prenom ||
        loan.adherent?.prenom ||
        "";


    const lastName =
        loan.adherent_nom ||
        loan.nom ||
        loan.adherent?.nom ||
        "";


    const memberName =
        `${firstName} ${lastName}`.trim()
        || "Adhérent";


    const bookTitle =
        loan.livre_titre ||
        loan.titre ||
        loan.livre?.titre ||
        "Livre";


    const initials =
        getInitials(
            firstName,
            lastName
        )
        || "AD";


    const daysLate =
        calculateDaysLate(
            loan.date_retour_prevue
        );


    return `
        <div class="loan-item">

            <div class="loan-avatar">
                ${escapeHTML(initials)}
            </div>

            <div class="loan-info">

                <strong>
                    ${escapeHTML(memberName)}
                </strong>

                <span>
                    ${escapeHTML(bookTitle)}
                </span>

            </div>

            <span class="status-badge overdue">
                ${daysLate} jour${daysLate > 1 ? "s" : ""}
            </span>

        </div>
    `;
}


/* =========================================================
   CALCUL RETARD
========================================================= */

function calculateDaysLate(dateString) {

    if (!dateString) {
        return 0;
    }


    const today =
        new Date();


    const dueDate =
        new Date(dateString);


    /*
        On remet les heures à zéro
        pour éviter les problèmes liés
        aux heures/minutes.
    */

    today.setHours(
        0,
        0,
        0,
        0
    );


    dueDate.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        today.getTime() -
        dueDate.getTime();


    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


    return Math.max(days, 0);
}


/* =========================================================
   ACTIVITÉ RÉCENTE
========================================================= */

function displayRecentActivity(recentLoans = []) {

    const container =
        document.querySelector(
            "#activityList, .activity-list");


    if (!container) {
        return;
    }


    const activities = [];


    /*
        Emprunts récents
    */

    for (
        const loan
        of recentLoans.slice(0, 3)
    ) {

        const memberName =
            `${loan.adherent_prenom || loan.prenom || ""} ${loan.adherent_nom || loan.nom || ""}`
                .trim()
            || "Un adhérent";


        const bookTitle =
            loan.livre_titre ||
            loan.titre ||
            loan.livre?.titre ||
            "Un livre";


        activities.push({
            type: "loan",
            title: "Nouvel emprunt",
            description:
                `${bookTitle} — ${memberName}`,
            date:
                loan.date_emprunt
        });
    }


    /*
        Rien à afficher
    */

    if (activities.length === 0) {

        container.innerHTML = `
            <div class="empty-row">
                <i class="fa-regular fa-clock"></i>
                <span>Aucune activité récente</span>
            </div>
        `;

        return;
    }


    container.innerHTML =
        activities
            .slice(0, 5)
            .map(
                activity =>
                    createActivityHTML(
                        activity
                    )
            )
            .join("");
}


/* =========================================================
   HTML ACTIVITÉ
========================================================= */

function createActivityHTML(activity) {

    const isLoan =
        activity.type === "loan";


    const iconClass =
        isLoan
            ? "fa-arrow-down"
            : "fa-book";


    const colorClass =
        isLoan
            ? "green"
            : "purple";


    return `
        <div class="activity-item">

            <span class="activity-icon ${colorClass}">
                <i class="fa-solid ${iconClass}"></i>
            </span>

            <div>

                <strong>
                    ${escapeHTML(activity.title)}
                </strong>

                <span>
                    ${escapeHTML(activity.description)}
                </span>

            </div>

            <time>
                ${formatRelativeDate(activity.date)}
            </time>

        </div>
    `;
}


/* =========================================================
   DATE RELATIVE
========================================================= */

function formatRelativeDate(dateString) {

    if (!dateString) {
        return "Récemment";
    }


    const date =
        new Date(dateString);


    if (Number.isNaN(date.getTime())) {
        return "Récemment";
    }


    const now =
        new Date();


    const difference =
        now.getTime() -
        date.getTime();


    const minutes =
        Math.floor(
            difference /
            (1000 * 60)
        );


    if (minutes < 1) {
        return "À l'instant";
    }


    if (minutes < 60) {
        return `Il y a ${minutes} min`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    if (hours < 24) {
        return `Il y a ${hours} h`;
    }


    const days =
        Math.floor(
            hours / 24
        );


    if (days === 1) {
        return "Hier";
    }


    return `Il y a ${days} jours`;
}


/* =========================================================
   UTILITAIRE TEXTE
========================================================= */

function setText(selector, value) {

    const element =
        document.querySelector(
            selector
        );


    if (element) {
        element.textContent =
            value;
    }
}


/* =========================================================
   PROTECTION HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   ERREUR DASHBOARD
========================================================= */

function showDashboardError(message) {

    console.error(
        "Dashboard :",
        message
    );


    /*
        On garde les cartes/design intacts.
        On indique simplement l'erreur
        dans la console pour le développement.
    */

    const activityList =
        document.querySelector(
            "#activityList"
        );


    if (activityList) {

        activityList.innerHTML = `
            <div class="empty-row">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <span>
                    Impossible de charger les données.
                </span>
            </div>
        `;
    }
}


/* =========================================================
   REDIRECTION LOGIN
========================================================= */

function redirectToLogin() {

    window.location.href =
        "../index.html";
}


/* =========================================================
   MENU MOBILE
========================================================= */

function setupMobileMenu() {

    const mobileMenuButton =
        document.querySelector(
            "#mobileMenuButton"
        );


    const mobileMoreButton =
        document.querySelector(
            "#mobileMoreButton"
        );


    const overlay =
        document.querySelector(
            "#mobileMenuOverlay"
        );


    const closeButton =
        document.querySelector(
            "#closeMobileMenu"
        );


    function openMenu() {

        if (!overlay) {
            return;
        }


        overlay.classList.add(
            "open"
        );


        document.body.style.overflow =
            "hidden";
    }


    function closeMenu() {

        if (!overlay) {
            return;
        }


        overlay.classList.remove(
            "open"
        );


        document.body.style.overflow =
            "";
    }


    mobileMenuButton?.addEventListener(
        "click",
        openMenu
    );


    mobileMoreButton?.addEventListener(
        "click",
        openMenu
    );


    closeButton?.addEventListener(
        "click",
        closeMenu
    );


    overlay?.addEventListener(
        "click",
        (event) => {

            if (
                event.target === overlay
            ) {
                closeMenu();
            }
        }
    );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                overlay?.classList.contains("open")
            ) {
                closeMenu();
            }
        }
    );
}


/* =========================================================
   DÉCONNEXION
========================================================= */

function setupLogout() {

    const logoutButton =
        document.querySelector(
            "#logoutButton"
        );


    const mobileLogoutButton =
        document.querySelector(
            "#mobileLogoutButton"
        );


    function logout() {

        localStorage.removeItem(
            "token"
        );


        localStorage.removeItem(
            "user"
        );


        redirectToLogin();
    }


    logoutButton?.addEventListener(
        "click",
        logout
    );


    mobileLogoutButton?.addEventListener(
        "click",
        logout
    );
}