export default {
    expenseCategories: {
      "Food & Dining": "Mâncare & Restaurant",
      "Shopping": "Shopping",
      "Transport": "Transport",
      "Bills": "Facturi",
      "Other": "Altele"
    },
    navbar: {
      dashboard: "Dashboard",
      addExpense: "Adaugă Cheltuială",
      statistics: "Statistici",
      profile: "Profil",
      settings: "Setări",
      logout: "Deconectare",
      login: "Conectare",
      language: "Limbă",
      adminManagement: "Administrare Admini",
      scanReceipt: "Scanare Bon",
    },
    dashboard: {
      totalSpent: "Cheltuielile lunii",
      spentToday: "Cheltuielile de azi",
      thisWeek: "Cheltuielile săptămânii",
      addExpense: "Add Expense",
      recentExpenses: "Recente",
      subtitleMonth: "Ultimele 30 de zile",
      subtitleToday: "Ultimele 24 de ore",
      subtitleWeek: "Ultimele 7 zile"
    },
    statistics: {
      title: "Toate cheltuielile tale",
      byCategory: "Cheltuieli pe categorii",
      overTime: "Cheltuieli în timp",
      loginMessage: "Conectează-te pentru a vizualiza statisticile tale"
    },
    addExpense: {
      title: "Adaugă Cheltuială",
      manualTab: "Introducere manuală",
      scanTab: "Scanează-ți bonul",
      submit: "Trimitere",
      uploadReceipt: "Adaugă o imagine a bonului tău",
      submitToApi: "Trimite și scanează",
      or: "sau",
      qrcodePlaceholder: "Scanează acest cod QR pentru a face o poză cu telefonul tău",
      previewTitle: "Revizuiește rezultatele",
      amount: "Sumă",
      category: "Categorie",
      vendor: "Vânzător",
      dateTime: "Data/Ora",
      add: "Adaugă",
    },
    settings: {
      title: "Setări cont",
      viewTitle: "Informații cont",
      name: "Prenume",
      username: "Nume Utilizator",
      email: "Email",
      password: "Parolă",
      created: "Cont creat",
      edit: "Editează profilul",
      cancel: "Anulează",
      save: "Salvează",
      role: "Rol",
      userExists: "Nume deja folosit"
    },
    auth: {
      loginTab: "Conectare",
      registerTab: "Înregistrare",
      email: "Email",
      password: "Parolă",
      confirmPassword: "Confirmă parola",
      loginBtn: "Conectare",
      signupBtn: "Creare cont",
      errorInvalid: "Datele de conectare sunt invalide",
      errorExists: "Email-ul este deja înregistrat",
      errorMismatch: "Parolele nu se potrivesc",
      signupDisabled: "Înregistrarea este momentan indisponibilă"
    },
    footer: {
      rights: "Toate drepturile rezervate",
      credits: "Credite"
    },
    home: {
      title: "Bine ai venit la ExpenseTracker",
      description: "Ține cont de cheltuielile tale, încarcă bonurile fiscale și primește perspective despre cheltuielile tale. Totul într-o interfață modernă și simplă.",
      ShomeTitle: "...",

    },
  admin: {
    title: "Creează Admin nou",
    button: "Creează Admin",
    response: "Status: ",
    adminList: "Lista Adminilor"
  },
  adminDashboardTileDescriptions: {
    usersRegistered: "Utilizatori înregistrați",
    totalAmountExpensesLogged: "valoarea cheltuielilor înregistrate",
    totalExpensesLogged: "Cheltuieli înregistrate",
    receiptsScanned: "Bonuri scanate",
    ocrAccuracy: "Precizie scanare bonuri",
  },
  adminDashboard: {
    expenseCountByCategory: "Număr de cheltuieli pe categorii",
    expenseAmountByCategory: "Suma cheltuielilor pe categorii",
    legend: "Legendă",
    entries: "înregistrări (cheltuieli)",
  },
  adminManagement: {
    header: "Administrare Admini",
    description: "Vizualizați, creați și administrați administratorii aplicației.",
    searchPlaceholder: "Caută un admin",
    createAdmin: "Creare Admin Nou",
    sortOptions: {
      emailAsc: "Email (A-Z)",
      emailDesc: "Email (Z-A)",
      dateAsc: "Dată Creare (Cele mai vechi întâi)",
      dateDesc: "Dată Creare (Cele mai noi întâi)",
      default: "Implicit (fără sortare)"
    },
    noAdministratorsFound: "Nu s-au găsit administratori.",
    adminCreationForm: {
      header: "Creare Admin Nou",
      instructions: "Introduceți email-uli administratorului nou care doriți să creați. El va primi un email cu o parolă pentru logarea în cont.",
      emailLabel: "Email",
      emailPlaceholder: "ana.popescu@gmail.com",
      emailError: "Administratorul există deja!",
      createButton: "Creează",
      creatingButton: "Se creează...",
      successMessage: "Administrator creat cu succes!",
      successDescription: "S-a trimis un email de invitație spre administrator.",
      closeButton: "Închide",
    },
  },
  adminScanReceipt: {
    header: "Scanare Bon",
    description: "Testați functionalitatea de scanare a bonurilor fiscale. Puteți folosi imaginile exemplare date mai jos, ele fiind cazuri ideale.",
    resultsTabLabel: "Rezultate",
    JSONCodeTabLabel: "Cod JSON",
    exampleReceiptsHeader: "Bonuri Exemplare",
  }
};
