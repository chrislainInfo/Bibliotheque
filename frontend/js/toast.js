function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `app-toast app-toast-${type}`;
    toast.setAttribute("role", "status");
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        window.setTimeout(() => toast.remove(), 200);
    }, 3200);
}
