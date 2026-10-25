# Sri Viswa School E-Connect — Starter UI Prototype

This is the first-stage, static UI prototype for the agreed project blueprint.

## Included
- Mobile-responsive entry screen: School, Parent, and separate Valiass Super Admin entry
- Demo role selection and role-specific dashboard cards
- Placeholder detail views with fake sample information
- No Exam Marks / Results feature
- No real student data, authentication, or database writes

## Run locally
1. Download and extract the ZIP.
2. Open `index.html` in a modern browser.
3. For a closer hosting preview, serve this folder using any static local web server.

## Important security boundary
This is **not a production app**. Role selection is only a UI preview; it is not authentication or authorization. Do not enter real student/family data. Before launch, implement Firebase Authentication, Firestore Security Rules, trusted privileged-account provisioning, parent-child verification, database validation, audit logging, and backup/restore controls.

## Planned next steps
1. Review the UI prototype and approve labels/layout.
2. Create or confirm the Firebase project and Cloudflare Pages/GitHub setup.
3. Implement Firebase Authentication and least-privilege Firestore Security Rules.
4. Add schema and workflows with demo data first.
5. Test cross-role access and parent-child isolation before any real data is imported.
