function exportLoansToCsv(loans, filename = "emprunts-en-retard.csv") {
    const headers = ["Livre", "Adhérent", "Date d'emprunt", "Retour prévu", "Retour effectif", "Statut"];
    const rows = loans.map((loan) => [
        loan.livre_titre || "",
        `${loan.adherent_prenom || ""} ${loan.adherent_nom || ""}`.trim(),
        formatDate(loan.date_emprunt),
        formatDate(loan.date_retour_prevue),
        formatDate(loan.date_retour),
        loan.statut === "en_cours" ? "En cours" : loan.statut === "en_retard" ? "En retard" : "Retourné"
    ]);
    const csv = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(";"))
        .join("\r\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function calculateLoanDelay(dateString) {
    if (!dateString) return 0;
    const today = new Date();
    const dueDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return Math.max(Math.ceil((today - dueDate) / 86400000), 0);
}
