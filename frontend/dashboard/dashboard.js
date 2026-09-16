/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL = "http://localhost:3000/api";


/* =========================================================
   INITIALISATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    setupMobileMenu();
    setupCommonNavigation();

    try {
        await loadDashboard();
    } catch (error) {
        console.error("Erreur dashboard :", error);
        showDashboardError(error.message);
    }
});


/* =========================================================
   AUTHENTIFICATION
========================================================= */

function getToken() {
    return localStorage.getItem("token");
}


function getUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
}


/* =========================================================
   REQUÊTES API
========================================================= */

async function apiRequest(endpoint, options = {}) {

    const token = getToken();

    if (!token) {
        redirectToLogin();
        return;
    }

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type": "application/json",

                ...(token
                    ? {
                        Authorization: `Bearer ${token}`
                    }
                    : {}),

                ...(options.headers || {})
            }
        }
    );


    /*
        Si le JWT est invalide ou expiré
    */

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        redirectToLogin();

        throw new Error(
            "Votre session a expiré."
        );
    }


    /*
        Lecture de la réponse
    */

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }


    /*
        Gestion des erreurs API
    */

    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.error ||
            "Une erreur est survenue."
        );
    }


    return data;
}


/* =========================================================
   CHARGEMENT DU DASHBOARD
========================================================= */

async function loadDashboard() {

    /*
        Endpoint prévu spécialement pour le dashboard
    */

    const response = await apiRequest(
        "/dashboard/bibliothecaire"
    );

    const dashboard = response?.dashboard || response || {};


    console.log(
        "Données dashboard :",
        dashboard
    );


    /*
        Affichage du bibliothécaire connecté
    */

    displayLibrarian();


    /*
        Statistiques
    */

    displayStatistics(
        dashboard.statistiques
    );


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
        dashboard.emprunts_recents || dashboard.empruntsRecents || [],
        dashboard.livres_plus_empruntes || dashboard.livresPopulaires || []
    );


    /*
        Disponibilité des livres

        L'endpoint dashboard ne retourne pas directement
        les exemplaires disponibles.

        On récupère donc les livres pour calculer
        la disponibilité réelle.
    */

    await loadBookAvailability();
}


/* =========================================================
   PROFIL BIBLIOTHÉCAIRE
========================================================= */

function displayLibrarian() {

    const user = getUser();

    if (!user) {
        return;
    }


    const firstName =
        user.prenom ||
        user.firstName ||
        "";


    const lastName =
        user.nom ||
        user.lastName ||
        "";


    const fullName =
        `${firstName} ${lastName}`.trim();


    const initials =
        getInitials(
            firstName,
            lastName
        );


    const headerName =
        document.querySelector(
            "#headerLibrarianName"
        );


    const sidebarName =
        document.querySelector(
            "#sidebarLibrarianName"
        );


    const headerAvatar =
        document.querySelector(
            "#headerAvatar"
        );


    const sidebarAvatar =
        document.querySelector(
            ".profile-avatar"
        );


    if (headerName) {
        headerName.textContent =
            fullName || "Bibliothécaire";
    }


    if (sidebarName) {
        sidebarName.textContent =
            fullName || "Bibliothécaire";
    }


    if (headerAvatar) {
        headerAvatar.textContent =
            initials || "B";
    }


    if (sidebarAvatar) {
        sidebarAvatar.textContent =
            initials || "B";
    }
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
   DISPONIBILITÉ DES LIVRES
========================================================= */

async function loadBookAvailability() {

    /*
        On demande une grande page afin de calculer
        les exemplaires disponibles.

        Le backend utilise une pagination :
        ?page=1&limit=10
    */

    const response = await apiRequest(
        "/livres?page=1&limit=1000"
    );


    const books =
        response?.books || [];


    let totalCopies = 0;
    let availableCopies = 0;


    for (const book of books) {

        totalCopies += Number(
            book.total_exemplaires || 0
        );


        availableCopies += Number(
            book.exemplaires_disponibles || 0
        );
    }


    /*
        Si aucun livre n'est présent
    */

    if (totalCopies === 0) {

        updateAvailability(
            0,
            0,
            0
        );

        return;
    }


    const borrowedCopies =
        Math.max(
            totalCopies - availableCopies,
            0
        );


    const percentage =
        Math.round(
            (availableCopies / totalCopies) * 100
        );


    updateAvailability(
        availableCopies,
        borrowedCopies,
        percentage
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
        document.querySelector(
            "#overdueList"
        );


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

function displayRecentActivity(
    recentLoans = [],
    popularBooks = []
) {

    const container =
        document.querySelector(
            "#activityList"
        );


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
        Livres populaires

        Cette partie permet de profiter
        des données retournées par l'API
        sans inventer d'activité.
    */

    for (
        const book
        of popularBooks.slice(0, 2)
    ) {

        const title =
            book.titre ||
            book.livre?.titre;


        if (!title) {
            continue;
        }


        activities.push({
            type: "book",
            title: "Livre populaire",
            description: title,
            date:
                book.created_at ||
                book.date_emprunt
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