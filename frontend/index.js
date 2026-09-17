const API_BASE_URL = "http://localhost:3000/api";

/* =========================================================
   ÉLÉMENTS DU DOM
   ========================================================= */

const loginModal = document.querySelector("#loginModal");
const openLoginButton = document.querySelector("#openLoginButton");
const heroLoginButton = document.querySelector("#heroLoginButton");
const closeLoginButton = document.querySelector("#closeLoginButton");

const loginTabs = document.querySelectorAll(".login-tab");
const loginForms = document.querySelectorAll(".login-form");

const passwordToggles = document.querySelectorAll(".password-toggle");

const librarianForm = document.querySelector("#librarianForm");
const memberForm = document.querySelector("#memberForm");

function showLoginMessage(message) {
    const element = document.querySelector("#librarianLoginMessage");
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
}


/* =========================================================
   MODALE DE CONNEXION
   ========================================================= */

function openLoginModal() {
    loginModal.classList.add("open");
    loginModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function closeLoginModal() {
    loginModal.classList.remove("open");
    loginModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}

openLoginButton.addEventListener("click", openLoginModal);

heroLoginButton.addEventListener("click", openLoginModal);

closeLoginButton.addEventListener("click", closeLoginModal);


/* =========================================================
   FERMETURE DE LA MODALE
   ========================================================= */

loginModal.addEventListener("click", (event) => {
    if (event.target === loginModal) {
        closeLoginModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        loginModal.classList.contains("open")
    ) {
        closeLoginModal();
    }
});


/* =========================================================
   ONGLETS BIBLIOTHÉCAIRE / ADHÉRENT
   ========================================================= */

loginTabs.forEach((tab) => {
    tab.addEventListener("click", () => {

        const selectedRole = tab.dataset.role;

        loginTabs.forEach((currentTab) => {
            currentTab.classList.remove("active");
            currentTab.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        loginForms.forEach((form) => {
            form.classList.remove("active");
        });

        const selectedForm = document.querySelector(
            `.login-form[data-form="${selectedRole}"]`
        );

        if (selectedForm) {
            selectedForm.classList.add("active");
        }
    });
});


/* =========================================================
   AFFICHER / MASQUER LE MOT DE PASSE
   ========================================================= */

passwordToggles.forEach((button) => {

    button.addEventListener("click", () => {

        const targetId = button.dataset.target;

        const passwordInput = document.querySelector(
            `#${targetId}`
        );

        const icon = button.querySelector("i");

        if (!passwordInput || !icon) {
            return;
        }

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


/* =========================================================
   CONNEXION BIBLIOTHÉCAIRE
   ========================================================= */

librarianForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const emailInput = document.querySelector("#librarianEmail");
    const passwordInput = document.querySelector("#librarianPassword");

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        console.error("Veuillez remplir tous les champs.");

        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }
        );

        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Échec de la connexion."
            );
        }


        if (!data.token) {

            throw new Error(
                "Le serveur n'a pas retourné de token."
            );
        }

        /*
         * Vérification du rôle retourné
         * par le backend.
         */

        if (
            !data.user ||
            data.user.role !== "bibliothecaire"
        ) {

            throw new Error(
                "Cet utilisateur n'est pas un bibliothécaire."
            );
        }

        /* =================================================
           STOCKAGE DU TOKEN
           ================================================= */

        localStorage.setItem(
            "token",
            data.token
        );

        /* =================================================
           STOCKAGE DES INFORMATIONS UTILISATEUR
           ================================================= */

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        console.log(
            "Connexion réussie :",
            data.user
        );

        /*
         * Redirection vers le dashboard
         */

        window.location.href = "./dashboard/dashboard.html";

    } catch (error) {

        console.error(
            "Erreur de connexion :",
            error
        );

        /*
         * Pour le moment, on affiche l'erreur
         * dans une alerte.
         *
         * Plus tard, on pourra remplacer cela
         * par un message d'erreur intégré
         * au design de la modale.
         */

        showLoginMessage(error.message);
    }
});


/* =========================================================
   CONNEXION ADHÉRENT
   ========================================================= */

/*
 * Pour l'instant, on ne modifie pas le fonctionnement
 * de la connexion adhérent.
 *
 * Elle sera branchée à l'API lorsque nous travaillerons
 * sur le dashboard adhérent.
 */

memberForm.addEventListener("submit", (event) => {

    event.preventDefault();

    console.log("Connexion adhérent");
});