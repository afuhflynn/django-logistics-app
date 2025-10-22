
# Logistics Dashboard (Client)

Frontend for the **Logistics Dashboard App**, built using **Next.js 15**, **TypeScript**, and **TailwindCSS**.
It provides a clean, responsive, and user-friendly interface for managing logistics operations efficiently.

---

## ⚙️ Tech Stack
- **Next.js 15**
- **TypeScript**
- **TailwindCSS**
- **React Hooks**
- **Axios (for API calls)**

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```bash
pnpm install
````

### 2️⃣ Run Development Server

```bash
pnpm dev
```

### 3️⃣ Build for Production

```bash
pnpm build
pnpm start
```

---

## 🧠 Features

* Dashboard layout for logistics data visualization
* Modular components (Charts, Tables, Cards)
* API integration with Django backend
* Dark/Light mode ready
* Fast and responsive UI

---

## 🌍 Deployment

This client is deployed on **Vercel**.
Pushes to `main` automatically trigger deployment.

**Live URL:** [https://vercel.com/afuh-flynns-tembengs-projects/logistics-dashboard](https://vercel.com/afuh-flynns-tembengs-projects/logistics-dashboard)

---

## 📁 Folder Overview

```
client/
 ┣ 📁 app/          # Next.js app directory
 ┣ 📁 components/   # Reusable UI components
 ┣ 📁 lib/          # Utilities and helpers
 ┣ 📁 public/       # Static assets
 ┗ 📄 tailwind.config.js
```

---

## ✨ Notes

This folder only contains the **client-side application**.
All data and API routes are handled by the **Django server** in `/server`.
