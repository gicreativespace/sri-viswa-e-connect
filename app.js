/* Sri Viswa School E-Connect — UI prototype only.
   This file intentionally uses demo navigation and fake sample data.
   It does NOT authenticate users or enforce authorization. Do not connect live student data. */

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

function showView(name) {
  Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name; });
  currentPath = name;
  homeButton.hidden = name === "welcome";
  detailPanel.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openLogin(path) {
  if (path === "parent") {
    loginEyebrow.textContent = "PARENT ACCESS";
    loginTitle.textContent = "Parent sign in";
    loginDescription.textContent = "Preview the Parent dashboard using demo mode.";
    renderRoleOptions(["parent"]);
  } else if (path === "admin") {
    loginEyebrow.textContent = "RESTRICTED ADMIN ACCESS";
    loginTitle.textContent = "Valiass Super Admin";
    loginDescription.textContent = "Preview privileged system administration screens.";
    renderRoleOptions(["valiassSuperAdmin"]);
  } else {
    loginEyebrow.textContent = "SCHOOL STAFF ACCESS";
    loginTitle.textContent = "School sign in";
    loginDescription.textContent = "Choose a demo role to preview its dashboard.";
    renderRoleOptions(["principal", "vicePrincipal", "incharge", "teacher", "officeStaff"]);
  }
  showView("login");
}

function renderRoleOptions(keys) {
  roleOptions.replaceChildren();
  keys.forEach(key => {
    const role = roles[key];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "role-button";
    button.innerHTML = `<span>${role.label}<small>${role.description}</small></span><span aria-hidden="true">→</span>`;
    button.addEventListener("click", () => renderDashboard(key));
    roleOptions.appendChild(button);
  });
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
    button.addEventListener("click", () => openDemoDetail(key, title, subtitle));
    dashboardCards.appendChild(button);
  });
  showView("dashboard");
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
document.getElementById("signOutButton").addEventListener("click", () => showView("welcome"));
document.getElementById("closeDetail").addEventListener("click", () => { detailPanel.hidden = true; });

showView("welcome");

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
