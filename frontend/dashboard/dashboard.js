/* =========================================================
   DASHBOARD
   ========================================================= */


/*
 * Données temporaires
 *
 * Plus tard, ces données viendront de l'API.
 */

const dashboardData = {

    totalBooks: 1250,

    totalMembers: 384,

    activeLoans: 76,

    overdueLoans: 8,

    availableBooks: 987

};


/* =========================================================
   STATISTIQUES
   ========================================================= */

function loadDashboardStats() {

    const totalBooks =
        document.querySelector("#totalBooks");

    const totalMembers =
        document.querySelector("#totalMembers");

    const activeLoans =
        document.querySelector("#activeLoans");

    const overdueLoans =
        document.querySelector("#overdueLoans");


    if (totalBooks) {

        totalBooks.textContent =
            dashboardData.totalBooks.toLocaleString("fr-FR");

    }


    if (totalMembers) {

        totalMembers.textContent =
            dashboardData.totalMembers.toLocaleString("fr-FR");

    }


    if (activeLoans) {

        activeLoans.textContent =
            dashboardData.activeLoans.toLocaleString("fr-FR");

    }


    if (overdueLoans) {

        overdueLoans.textContent =
            dashboardData.overdueLoans.toLocaleString("fr-FR");

    }

}


/* =========================================================
   DISPONIBILITÉ
   ========================================================= */

function loadAvailability() {

    const availableBooksElement =
        document.querySelector("#availableBooks");


    const borrowedBooksElement =
        document.querySelector("#borrowedBooks");


    const availabilityPercentageElement =
        document.querySelector("#availabilityPercentage");


    const availabilityCircle =
        document.querySelector("#availabilityCircle");


    const availableBooks =
        dashboardData.availableBooks;


    const borrowedBooks =
        dashboardData.totalBooks - availableBooks;


    const percentage =
        Math.round(
            (availableBooks / dashboardData.totalBooks) * 100
        );


    if (availableBooksElement) {

        availableBooksElement.textContent =
            availableBooks.toLocaleString("fr-FR");

    }


    if (borrowedBooksElement) {

        borrowedBooksElement.textContent =
            borrowedBooks.toLocaleString("fr-FR");

    }


    if (availabilityPercentageElement) {

        availabilityPercentageElement.textContent =
            `${percentage}%`;

    }


    if (availabilityCircle) {

        availabilityCircle.style.setProperty(
            "--availability",
            `${percentage}%`
        );

    }

}


/* =========================================================
   INITIALISATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadDashboardStats();

    loadAvailability();

});