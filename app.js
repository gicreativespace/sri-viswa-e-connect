/* Sri Viswa School E-Connect — Firebase sign-in + role gate.
   Dashboard cards are still UI placeholders; do not enter real student data yet. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCAJD4RxTq7xdaU6Dqd9lffpKmJ9aDjY",
  authDomain: "sri-viswa-school-e-connect.firebaseapp.com",
  projectId: "sri-viswa-school-e-connect",
  storageBucket: "sri-viswa-school-e-connect.firebasestorage.app",
  messagingSenderId: "9347484126",
  appId: "1:9347484126:web:74cb022890076467bff54f"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
let authenticatedRole = null;
let loginMode = "school";

const roles = {
  principal: {
    label: "Principal",
    description: "School-wide reports and approved information",
    subtitle: "School overview",
    cards: [
      ["📊", "Attendance Reports", "Class-wise attendance overview"],
      ["📣", "Notices & Announcements", "View approved school announcements"],
      ["🏫", "School Information", "Approved school information"],
      ["🗓️", "Staff Leave Status", "View leave status"]
    ]
  },
  vicePrincipal: {
    label: "Vice Principal",
    description: "Approvals and staff administration",
    subtitle: "Approvals & school operations",
    cards: [
      ["👥", "Manage Staff", "Create and manage staff profiles"],
      ["📘", "E-Diary Approval", "Review submitted homework"],
      ["📣", "Notices & Announcements", "Review and publish notices"],
      ["📝", "Leave Approval", "Approve or reject leave requests"],
      ["📊", "Attendance Reports", "Review class attendance"],
      ["🏫", "School Information Approval", "Review information updates"],
      ["✓", "Attendance Correction Approval", "Review correction requests"]
    ]
  },
  incharge: {
    label: "In-charge",
    description: "Assigned class management, homework and attendance",
    subtitle: "Assigned classes",
    cards: [
      ["🏷️", "Class Management", "Set up class roster and roll numbers"],
      ["📘", "E-Diary", "Enter subject-wise homework"],
      ["✓", "Attendance", "Record and finalize attendance"]
    ]
  },
  teacher: {
    label: "Teacher",
    description: "Class communication and leave requests",
    subtitle: "Teaching staff",
    cards: [
      ["📣", "Notices & Announcements", "View relevant announcements"],
      ["💬", "Class Communication", "Submit a class message for approval"],
      ["🗓️", "Apply for Leave", "Request leave and check its status"]
    ]
  },
  officeStaff: {
    label: "Office Staff",
    description: "School information drafts and submissions",
    subtitle: "School information",
    cards: [
      ["🏫", "School Information", "Prepare information for VP approval"],
      ["🖼️", "School Gallery", "Manage gallery items for review"],
      ["🗓️", "Academic Calendar", "Draft calendar updates"]
    ]
  },
  parent: {
    label: "Parent",
    description: "View approved information for your linked child",
    subtitle: "Family dashboard",
    cards: [
      ["📘", "E-Diary", "Approved homework by date and subject"],
      ["✓", "Attendance", "Daily and monthly attendance"],
      ["📣", "Notices & Announcements", "Relevant approved notices"],
      ["🏫", "School Information", "Approved school details"],
      ["👧", "Add Your Kid / Switch Child", "Manage linked children"],
      ["👤", "Profile", "Parent profile"],
      ["❔", "Help & Support", "Get help using the portal"]
    ]
  },
  valiassSuperAdmin: {
    label: "Valiass Super Admin",
    description: "Privileged system administration",
    subtitle: "System administration",
    cards: [
      ["👤", "Manage Principal & VP", "Manage privileged accounts"],
      ["💾", "Attendance Backup", "Create and validate a backup"],
      ["↩️", "Restore", "Preview and restore a verified backup"],
      ["🗓️", "Academic Year Reset", "Preview the year transition"],
      ["🧹", "Cleanup", "Review eligible records before cleanup"],
      ["📈", "System Usage", "Open usage metrics and review quotas"]
    ]
  }
};

const views = {
  welcome: document.getElementById("welcomeView"),
  login: document.getElementById("loginView"),
  dashboard: document.getElementById("dashboardView")
};
const homeButton = document.getElementById("homeButton");
const loginTitle = document.getElementById("loginTitle");
const loginDescription = document.getElementById("loginDescription");
const loginEyebrow = document.getElementById("loginEyebrow");
const roleOptions = document.getElementById("roleOptions");
const dashboardTitle = document.getElementById("dashboardTitle");
const dashboardSubtitle = document.getElementById("dashboardSubtitle");
const dashboardCards = document.getElementById("dashboardCards");
const detailPanel = document.getElementById("detailPanel");
const detailTitle = document.getElementById("detailTitle");
const detailText = document.getElementById("detailText");
const detailContent = document.getElementById("detailContent");

let currentPath = "welcome";

// These are the existing Firebase Auth UIDs for the two pre-created accounts.
// This screen only changes each account's Firestore enabled flag; it does not create Auth users.
const managedAccounts = [
  { key: "principal", label: "Principal", uid: "R96kHp1J3KMHK4j0R9JM3LvmRBh2" },
  { key: "vicePrincipal", label: "Vice Principal", uid: "0hwCvNASOBSEwfEPOfzd2c5JuC72" }
];

function showView(name) {
  Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name; });
  currentPath = name;
  homeButton.hidden = name === "welcome";
  detailPanel.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openLogin(path) {
  loginMode = path;
  if (path === "parent") {
    loginEyebrow.textContent = "PARENT ACCESS";
    loginTitle.textContent = "Parent sign in";
    loginDescription.textContent = "Sign in with your registered account.";
  } else if (path === "admin") {
    loginEyebrow.textContent = "RESTRICTED ADMIN ACCESS";
    loginTitle.textContent = "Valiass Super Admin";
    loginDescription.textContent = "Authorized administrator sign-in only.";
  } else {
    loginEyebrow.textContent = "SCHOOL STAFF ACCESS";
    loginTitle.textContent = "School sign in";
    loginDescription.textContent = "Enter your assigned login ID and password.";
  }
  renderRoleOptions();
  showView("login");
}

function renderRoleOptions() {
  roleOptions.replaceChildren();
  const form = document.createElement("form");
  form.className = "auth-form";
  const loginLabel = document.createElement("label");
  loginLabel.htmlFor = "loginId";
  loginLabel.textContent = "Login ID or email";
  const loginInput = document.createElement("input");
  loginInput.id = "loginId";
  loginInput.name = "loginId";
  loginInput.autocomplete = "username";
  loginInput.required = true;
  loginInput.placeholder = loginMode === "admin" ? "Your administrator email" : "PRINCIPAL, VICEPRINCIPAL or registered email";
  const passwordLabel = document.createElement("label");
  passwordLabel.htmlFor = "loginPassword";
  passwordLabel.textContent = "Password";
  const passwordInput = document.createElement("input");
  passwordInput.id = "loginPassword";
  passwordInput.name = "password";
  passwordInput.type = "password";
  passwordInput.autocomplete = "current-password";
  passwordInput.required = true;
  passwordInput.minLength = 6;
  passwordInput.placeholder = "Enter your password";
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.className = "primary-button";
  submit.textContent = "Sign in";
  const message = document.createElement("p");
  message.className = "auth-message";
  message.setAttribute("role", "status");
  message.setAttribute("aria-live", "polite");
  form.append(loginLabel, loginInput, passwordLabel, passwordInput, submit, message);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    submit.disabled = true;
    message.textContent = "Checking your account…";
    try {
      let email = loginInput.value.trim();
      if (email.toUpperCase() === "PRINCIPAL") email = "principal@viswaschool.com";
      else if (email.toUpperCase() === "VICEPRINCIPAL") email = "viceprincipal@viswaschool.com";
      const credential = await signInWithEmailAndPassword(auth, email, passwordInput.value);
      const roleSnapshot = await getDoc(doc(db, "userRoles", credential.user.uid));
      if (!roleSnapshot.exists()) {
        await signOut(auth);
        throw new Error("This account has no assigned school role.");
      }
      const userRole = roleSnapshot.data();
      if (userRole.enabled !== true) {
        await signOut(auth);
        throw new Error("Your account is disabled. Contact Valiass Super Admin.");
      }
      const allowedRoles = {
        school: ["principal", "vicePrincipal", "incharge", "teacher", "officeStaff"],
        parent: ["parent"],
        admin: ["valiassSuperAdmin"]
      };
      if (!allowedRoles[loginMode]?.includes(userRole.role)) {
        await signOut(auth);
        throw new Error("This account is not authorized for this login area.");
      }
      authenticatedRole = userRole.role;
      renderDashboard(authenticatedRole);
    } catch (error) {
      console.error("Sign-in error:", error.code || error.message);
      const messages = {
        "auth/invalid-credential": "Incorrect login ID or password.",
        "auth/invalid-email": "Please enter a valid email or login ID.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "permission-denied": "Role access was blocked by Firestore Rules."
      };
      message.textContent = messages[error.code] || error.message || "Sign-in failed. Please try again.";
    } finally {
      submit.disabled = false;
    }
  });
  roleOptions.appendChild(form);
}

function renderDashboard(key) {
  const role = roles[key];
  dashboardTitle.textContent = role.label;
  dashboardSubtitle.textContent = role.subtitle;
  dashboardCards.replaceChildren();

  role.cards.forEach(([icon, title, subtitle]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dashboard-card";
    button.innerHTML = `<span class="card-icon">${icon}</span><span class="card-title"></span><span class="card-subtitle"></span>`;
    button.querySelector(".card-title").textContent = title;
    button.querySelector(".card-subtitle").textContent = subtitle;
    button.addEventListener("click", () => {
      if (key === "valiassSuperAdmin" && title === "Manage Principal & VP") {
        openRoleManagement();
      } else {
        openDemoDetail(key, title, subtitle);
      }
    });
    dashboardCards.appendChild(button);
  });
  showView("dashboard");
}

async function openRoleManagement() {
  if (authenticatedRole !== "valiassSuperAdmin" || !auth.currentUser) {
    alert("Only an authenticated Valiass Super Admin can manage these accounts.");
    return;
  }

  detailTitle.textContent = "Manage Principal & Vice Principal";
  detailText.textContent = "Enable or disable access for the existing accounts. This does not create accounts or change passwords.";
  detailContent.replaceChildren();
  const list = document.createElement("div");
  list.className = "sample-list";
  const statusMessage = document.createElement("p");
  statusMessage.className = "muted";
  statusMessage.setAttribute("role", "status");
  statusMessage.textContent = "Loading account status…";
  detailContent.append(statusMessage, list);
  detailPanel.hidden = false;
  detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    // Re-check the current admin's role before rendering privileged controls.
    const adminSnap = await getDoc(doc(db, "userRoles", auth.currentUser.uid));
    if (!adminSnap.exists() || adminSnap.data().role !== "valiassSuperAdmin" || adminSnap.data().enabled !== true) {
      throw new Error("Admin access is no longer enabled. Sign in again or contact the system owner.");
    }

    list.replaceChildren();
    for (const account of managedAccounts) {
      const snap = await getDoc(doc(db, "userRoles", account.uid));
      const row = document.createElement("div");
      row.className = "sample-row account-management-row";
      const info = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = account.label;
      const status = document.createElement("p");
      status.className = "account-status";
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "primary-button account-toggle";

      if (!snap.exists() || snap.data().role !== account.key) {
        status.textContent = "Account role document missing or mismatched.";
        toggle.textContent = "Unavailable";
        toggle.disabled = true;
      } else {
        let enabled = snap.data().enabled === true;
        status.textContent = enabled ? "Access: Enabled" : "Access: Disabled";
        toggle.textContent = enabled ? "Disable access" : "Enable access";
        toggle.classList.toggle("danger-button", enabled);
        toggle.addEventListener("click", async () => {
          toggle.disabled = true;
          status.textContent = "Saving change…";
          try {
            const freshAdmin = await getDoc(doc(db, "userRoles", auth.currentUser.uid));
            if (!freshAdmin.exists() || freshAdmin.data().role !== "valiassSuperAdmin" || freshAdmin.data().enabled !== true) {
              throw new Error("Your admin access is disabled.");
            }
            await updateDoc(doc(db, "userRoles", account.uid), { enabled: !enabled });
            enabled = !enabled;
            status.textContent = enabled ? "Access: Enabled" : "Access: Disabled";
            toggle.textContent = enabled ? "Disable access" : "Enable access";
            toggle.classList.toggle("danger-button", enabled);
          } catch (error) {
            console.error("Account status update failed:", error.code || error.message);
            status.textContent = error.code === "permission-denied"
              ? "Update blocked by Firestore Rules. Check the admin role and rules."
              : (error.message || "Could not update account status.");
          } finally {
            toggle.disabled = false;
          }
        });
      }
      info.append(name, status);
      row.append(info, toggle);
      list.appendChild(row);
    }
    statusMessage.textContent = "Account status loaded. Changes apply to the role gate on the next sign-in attempt.";
  } catch (error) {
    console.error("Role management load failed:", error.code || error.message);
    statusMessage.textContent = error.code === "permission-denied"
      ? "Access denied by Firestore Rules. Confirm the Valiass role document is enabled."
      : (error.message || "Could not load account status.");
  }
}

function openDemoDetail(roleKey, title, subtitle) {
  detailTitle.textContent = title;
  detailText.textContent = subtitle;
  detailContent.replaceChildren();

  const samples = {
    "Attendance": [
      ["Demo Class 4-A", "Strength: 30 · Present: 27 · Absent: 2 · Leave: 1"],
      ["Status", "Demo only — no records are saved."]
    ],
    "Attendance Reports": [
      ["Demo Class 4-A", "Strength: 30 · Present: 27 · Absent: 2 · Leave: 1"],
      ["Not marked", "0 in this sample report"]
    ],
    "E-Diary": [
      ["English", "Read the assigned passage (sample homework)"],
      ["Mathematics", "Complete practice questions (sample homework)"]
    ],
    "E-Diary Approval": [
      ["Sample submission", "Status: Pending review"],
      ["Approval rule", "A real implementation must require a VP decision."]
    ],
    "Attendance Backup": [
      ["Step 1", "Select academic year and month."],
      ["Step 2", "Create backup and validate record count and checksum."],
      ["Step 3", "Only after validation may the previous backup be replaced."]
    ],
    "Academic Year Reset": [
      ["Protected", "Stable Student IDs, parent links, staff accounts and important notice archive."],
      ["Review first", "Attendance must be backed up and validated before deletion."]
    ],
    "Add Your Kid / Switch Child": [
      ["Required", "Use a school-issued verification code or verified mobile confirmation."],
      ["Important", "Class + Roll + DOB alone is not sufficient verification."]
    ]
  };

  const rows = samples[title] || [
    ["Prototype preview", "This screen is a layout placeholder for the approved workflow."],
    ["Next implementation step", "Connect the workflow to authenticated, permission-checked Firebase data."]
  ];
  const list = document.createElement("div");
  list.className = "sample-list";
  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "sample-row";
    const strong = document.createElement("strong");
    strong.textContent = `${label}: `;
    row.append(strong, document.createTextNode(value));
    list.appendChild(row);
  });
  detailContent.appendChild(list);
  detailPanel.hidden = false;
  detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelectorAll("[data-entry]").forEach(button => {
  button.addEventListener("click", () => openLogin(button.dataset.entry));
});
document.getElementById("adminEntry").addEventListener("click", () => openLogin("admin"));
document.querySelectorAll("[data-back]").forEach(button => button.addEventListener("click", () => showView("welcome")));
document.getElementById("homeButton").addEventListener("click", () => showView("welcome"));
document.getElementById("signOutButton").addEventListener("click", async () => {
  try { await signOut(auth); } catch (error) { console.error("Sign-out error:", error); }
  authenticatedRole = null;
  showView("welcome");
});
document.getElementById("closeDetail").addEventListener("click", () => { detailPanel.hidden = true; });

showView("welcome");
onAuthStateChanged(auth, user => {
  // Require an explicit sign-in each time a dashboard is opened in this prototype.
  if (!user) authenticatedRole = null;
});

/* Valiass Contact Popup */
const valiassLink = document.getElementById("valiassLink");
const valiassPopup = document.getElementById("valiassPopup");
const closeValiassPopup = document.getElementById("closeValiassPopup");

function openValiassPopup() {
  valiassPopup.hidden = false;
  closeValiassPopup.focus();
}

function closeValiassContactPopup() {
  valiassPopup.hidden = true;
  valiassLink.focus();
}

valiassLink.addEventListener("click", openValiassPopup);

closeValiassPopup.addEventListener("click", closeValiassContactPopup);

valiassPopup.addEventListener("click", (event) => {
  if (event.target === valiassPopup) {
    closeValiassContactPopup();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !valiassPopup.hidden) {
    closeValiassContactPopup();
  }
});
