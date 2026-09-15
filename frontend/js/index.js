/* ========================================
   MODALE DE CONNEXION
   ======================================== */

const loginModal = document.querySelector("#loginModal");

const openLoginButton = document.querySelector("#openLoginButton");
const heroLoginButton = document.querySelector("#heroLoginButton");
const closeLoginButton = document.querySelector("#closeLoginButton");


/* ========================================
   OUVRIR LA MODALE
   ======================================== */

function openLoginModal() {
    loginModal.classList.add("open");

    loginModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}


/* ========================================
   FERMER LA MODALE
   ======================================== */

function closeLoginModal() {
    loginModal.classList.remove("open");

    loginModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


/* Bouton connexion du header */

openLoginButton.addEventListener("click", openLoginModal);


/* Bouton connexion de la hero */

heroLoginButton.addEventListener("click", openLoginModal);


/* Bouton X */

closeLoginButton.addEventListener("click", closeLoginModal);


/* ========================================
   FERMER EN CLIQUANT SUR L'OVERLAY
   ======================================== */

loginModal.addEventListener("click", (event) => {

    if (event.target === loginModal) {
        closeLoginModal();
    }

});


/* ========================================
   FERMER AVEC LA TOUCHE ESC
   ======================================== */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        loginModal.classList.contains("open")
    ) {
        closeLoginModal();
    }

});


/* ========================================
   ONGLETS BIBLIOTHÉCAIRE / ADHÉRENT
   ======================================== */

const loginTabs = document.querySelectorAll(".login-tab");

const loginForms = document.querySelectorAll(".login-form");


loginTabs.forEach((tab) => {

    tab.addEventListener("click", () => {

        const selectedRole = tab.dataset.role;


        /* Retirer active de tous les onglets */

        loginTabs.forEach((currentTab) => {

            currentTab.classList.remove("active");

            currentTab.setAttribute(
                "aria-selected",
                "false"
            );

        });


        /* Activer l'onglet sélectionné */

        tab.classList.add("active");

        tab.setAttribute(
            "aria-selected",
            "true"
        );


        /* Masquer tous les formulaires */

        loginForms.forEach((form) => {

            form.classList.remove("active");

        });


        /* Afficher le formulaire correspondant */

        const selectedForm = document.querySelector(
            `.login-form[data-form="${selectedRole}"]`
        );

        if (selectedForm) {
            selectedForm.classList.add("active");
        }

    });

});


/* ========================================
   AFFICHER / MASQUER MOT DE PASSE
   ======================================== */

const passwordToggles = document.querySelectorAll(
    ".password-toggle"
);


passwordToggles.forEach((button) => {

    button.addEventListener("click", () => {

        const targetId = button.dataset.target;

        const passwordInput = document.querySelector(
            `#${targetId}`
        );

        const icon = button.querySelector("i");


        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");

            button.setAttribute(
                "aria-label",
                "Masquer le mot de passe"
            );

        } else {

            passwordInput.type = "password";

            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");

            button.setAttribute(
                "aria-label",
                "Afficher le mot de passe"
            );

        }

    });

});


/* ========================================
   FORMULAIRE BIBLIOTHÉCAIRE
   ======================================== */

const librarianForm = document.querySelector("#librarianForm");


librarianForm.addEventListener("submit", (event) => {

    event.preventDefault();

    /*
        L'AUTHENTIFICATION BACKEND
        SERA AJOUTÉE PLUS TARD.

        Ici on empêche simplement
        le rechargement de la page.
    */

    console.log("Connexion bibliothécaire");

});


/* ========================================
   FORMULAIRE ADHÉRENT
   ======================================== */

const memberForm = document.querySelector("#memberForm");


memberForm.addEventListener("submit", (event) => {

    event.preventDefault();

    /*
        L'AUTHENTIFICATION BACKEND
        SERA AJOUTÉE PLUS TARD.
    */

    console.log("Connexion adhérent");

});