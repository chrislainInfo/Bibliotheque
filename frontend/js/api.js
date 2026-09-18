const API_BASE_URL = "https://bibliotheque-da9x.onrender.com/api";

async function apiRequest(url, options = {}) {
    const token = localStorage.getItem("token");
    const requestUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

    const response = await fetch(requestUrl, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../index.html";
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            "Une erreur est survenue."
        );
    }

    return data;
}

function extractCollection(response, key) {
    if (Array.isArray(response)) {
        return response;
    }

    return Array.isArray(response?.[key]) ? response[key] : [];
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : new Intl.DateTimeFormat("fr-FR").format(date);
}

function showFormMessage(selector, message, type = "error") {
    const element = document.querySelector(selector);
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.toggle("success", type === "success");
    element.hidden = false;
}

function showState(container, type, message, icon = "fa-circle-info") {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <tr class="table-state-row">
            <td colspan="20">
                <div class="empty-state ${type}">
                    <i class="fa-solid ${icon}"></i>
                    <p>${escapeHtml(message)}</p>
                </div>
            </td>
        </tr>
    `;
}

function updatePagination(container, pagination, onChange) {
    if (!container) {
        return;
    }

    const page = Number(pagination?.page || 1);
    const totalPages = Number(pagination?.totalPages || 1);

    container.innerHTML = `
        <button type="button" class="pagination-button" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""} aria-label="Page précédente">
            <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span>Page ${page} sur ${totalPages}</span>
        <button type="button" class="pagination-button" data-page="${page + 1}" ${page >= totalPages ? "disabled" : ""} aria-label="Page suivante">
            <i class="fa-solid fa-chevron-right"></i>
        </button>
    `;

    container.querySelectorAll("[data-page]").forEach((button) => {
        button.addEventListener("click", () => onChange(Number(button.dataset.page)));
    });
}

function paginateItems(items, page, pageSize = 10) {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;

    return {
        items: items.slice(start, start + pageSize),
        pagination: { page: safePage, totalPages, total: items.length }
    };
}

function confirmAction(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay open confirmation-overlay";
        overlay.innerHTML = `
            <div class="modal modal-small" role="dialog" aria-modal="true">
                <div class="modal-header">
                    <div>
                        <span class="modal-eyebrow">ATTENTION</span>
                        <h2>Confirmation</h2>
                    </div>
                </div>
                <div class="delete-content">
                    <div class="delete-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                    <p>${escapeHtml(message)}</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="button-secondary" data-confirm="false">Annuler</button>
                    <button type="button" class="button-danger" data-confirm="true">Confirmer</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        overlay.querySelectorAll("[data-confirm]").forEach((button) => {
            button.addEventListener("click", () => {
                overlay.remove();
                resolve(button.dataset.confirm === "true");
            });
        });
    });
}

function setupCommonNavigation() {
    const moreButton = document.querySelector("#mobileMoreButton");
    const sheet = document.querySelector("#bottomSheet");
    const overlay = document.querySelector("#bottomSheetOverlay");
    const closeButton = document.querySelector("#bottomSheetClose");

    const close = () => {
        sheet?.classList.remove("open");
        overlay?.classList.remove("open");
        sheet?.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    };

    const open = () => {
        sheet?.classList.add("open");
        overlay?.classList.add("open");
        sheet?.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    };

    moreButton?.addEventListener("click", open);
    closeButton?.addEventListener("click", close);
    overlay?.addEventListener("click", close);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            close();
        }
    });

    document.querySelectorAll("#logoutButton, #bottomSheetLogout").forEach((button) => {
        button.addEventListener("click", async () => {
            if (await confirmAction("Voulez-vous vraiment vous déconnecter ?")) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "../index.html";
            }
        });
    });

    updateAuthenticatedProfile();
}

function updateAuthenticatedProfile() {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        user = null;
    }

    if (!user) {
        return;
    }

    const firstName = user.prenom || user.firstName || "";
    const lastName = user.nom || user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Bibliothécaire";
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "B";

    document.querySelectorAll(".sidebar-profile-name, #headerLibrarianName").forEach((element) => {
        element.textContent = fullName;
    });
    document.querySelectorAll(".sidebar-profile-avatar, .profile-avatar, #headerAvatar").forEach((element) => {
        element.textContent = initials;
    });
    document.querySelectorAll(".sidebar-profile-role").forEach((element) => {
        element.textContent = user.role === "bibliothecaire" ? "Bibliothécaire" : "Adhérent";
    });
}

function setupModal(modalId, openId, closeIds = []) {
    const modal = document.querySelector(`#${modalId}`);
    const openButton = document.querySelector(`#${openId}`);
    if (!modal) return;

    const close = () => {
        modal.hidden = true;
        modal.classList.remove("open");
        document.body.style.overflow = "";
    };
    const open = () => {
        modal.hidden = false;
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    openButton?.addEventListener("click", open);
    closeIds.forEach((id) => document.querySelector(`#${id}`)?.addEventListener("click", close));
    modal.addEventListener("click", (event) => {
        if (event.target === modal) close();
    });
    return { open, close };
}