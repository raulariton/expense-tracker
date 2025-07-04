export default {
  expenseCategories: {
    "Food & Dining": "Food & Dining",
    "Shopping": "Shopping",
    "Transport": "Transport",
    "Bills": "Bills",
    "Other": "Other"
  },
  navbar: {
    dashboard: "Dashboard",
    addExpense: "Add Expense",
    statistics: "Statistics",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    language: "Language",
    adminManagement: "Admin Management",
    scanReceipt: "Scan Receipt",
  },
  dashboard: {
    totalSpent: "Spent This Month",
    spentToday: "Spent Today",
    thisWeek: "Spent This Week",
    addExpense: "Add Expense",
    recentExpenses: "Recents",
    subtitleMonth: "Last 30 Days",
    subtitleToday: "Last 24 Hours",
    subtitleWeek: "Last 7 Days"
  },
  statistics: {
    title: "All your expenses",
    byCategory: "Spending by Category",
    overTime: "Spending Over Time",
    loginMessage: "Please log in to view your statistics"
  },
  addExpense: {
    title: "Add Expense",
    manualTab: "Manual Entry",
    scanTab: "Scan Your Receipt",
    submit: "Submit",
    uploadReceipt: "Upload an image of your receipt",
    submitToApi: "Submit & Scan",
    or: "or",
    qrcodePlaceholder: "Scan this QR code to take an image with your phone",
    previewTitle: "Review results",
    amount: "Amount",
    category: "Category",
    vendor: "Vendor",
    dateTime: "Date/Time",
    add: "Add"
  },
  settings: {
    title: "Account Settings",
    viewTitle: "Account Information",
    name: "First Name",
    username: "Username",
    email: "Email",
    password: "Password",
    created: "Account Created",
    edit: "Edit Profile",
    cancel: "Cancel",
    save: "Save Changes",
    role: "Role",
    userExists: "Username already taken"
  },
  auth: {
    loginTab: "Login",
    registerTab: "Register",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    loginBtn: "Login",
    signupBtn: "Create Account",
    errorInvalid: "Invalid credentials",
    errorExists: "Email is already registered",
    errorMismatch: "Passwords do not match",
    signupDisabled: "Sign up is not available in demo mode."
  },
  footer: {
    rights: "All rights reserved",
    credits: "Credits"
  },
  home: {
    title: "Welcome to ExpenseTracker",
    description: "Track your spending easily, manage receipts, and gain insights into your expenses in a clean and modern interface.",
    ShomeTitle: "...",
     
  },
  admin: {
    title: "Create new Admin",
    button: "Create Admin",
    response: "Status: ",
    adminList: "Admin List"
  },
  adminDashboardTileDescriptions: {
    usersRegistered: "Users registered",
    totalAmountExpensesLogged: "worth of expenses logged",
    totalExpensesLogged: "Expenses logged",
    receiptsScanned: "Receipts scanned",
    ocrAccuracy: "Receipt scanning accuracy",
  },
  adminDashboard: {
    expenseCountByCategory: "Expenses count by category",
    expenseAmountByCategory: "Expenses amount by category",
    legend: "Legend",
    entries: "entries",
  },
  adminManagement: {
    header: "Admin Management",
    description: "View, create and manage administrators for the application.",
    searchPlaceholder: "Search for an admin",
    createAdmin: "Create New Admin",
    sortOptions: {
      emailAsc: "Email (A-Z)",
      emailDesc: "Email (Z-A)",
      dateAsc: "Date Created (Oldest First)",
      dateDesc: "Date Created (Newest First)",
      default: "Default (no sorting)"
    },
    noAdministratorsFound: "No administrators found.",
    adminCreationForm: {
      header: "Create New Admin",
      instructions: "Enter the email address of the new administrator you want to create. They will receive an email with their password to log in.",
      emailLabel: "Email",
      emailPlaceholder: "john.doe@gmail.com",
      emailError: "Admin already exists!",
      createButton: "Create",
      creatingButton: "Creating...",
      successMessage: "Admin Created Successfully!",
      successDescription: "An invitation email has been sent to the administrator.",
      closeButton: "Close",
    }
  },
  adminScanReceipt: {
    header: "Scan Receipt",
    description: "Test out the receipt scanning functionality. You can also use the provided example receipts proven to work well.",
    resultsTabLabel: "Results",
    JSONCodeTabLabel: "JSON Code",
    exampleReceiptsHeader: "Example Receipts",

  }
};
