# Logistics Dashboard App

A full-stack logistics management system built with **Next.js (client)** and **Django (server)**.
The platform provides real-time insights, task coordination, and streamlined operations for logistics and supply chain teams.

---

## 🚀 Project Overview

This project combines a **modern React-based frontend** with a **powerful Django backend** to deliver an interactive and scalable logistics dashboard.

### Tech Stack
| Layer | Technologies |
|--------|---------------|
| **Frontend** | Next.js 15, TypeScript, TailwindCSS |
| **Backend** | Django, Django REST Framework |
| **Database** | PostgreSQL / Remote DB (e.g. Railway, Render, Supabase) |
| **Deployment** | Vercel (client), Render / Railway (server) |

---

## 🧩 Folder Structure

```

root/
┣ 📁 client/     # Next.js frontend (UI + logic)
┣ 📁 server/     # Django backend (API + database)
┗ 📄 README.md   # Base project readme

````

---

## 🧠 Features

- Modern, responsive logistics dashboard UI
- RESTful API with Django backend
- Secure environment configuration
- Real-time updates (Socket/REST endpoints)
- Scalable database setup (supports remote DBs)

---

## 🧰 Setup Guide

### 1️⃣ Clone the repo
```bash
git clone https://github.com/<your-username>/logistics-dashboard-app.git
cd logistics-dashboard-app
````

### 2️⃣ Setup the Client

```bash
cd client
pnpm install
pnpm dev
```

### 3️⃣ Setup the Server

```bash
cd server
pip install -r requirements.txt
python manage.py runserver
```

---

## 🌍 Deployment

* **Client:** Vercel
* **Server:** Render / Railway / AWS EC2 (your choice)
* **Database:** Remote PostgreSQL or MySQL

---

## 🧑‍💻 Author

**Afuh Flyine Tembeng**
Software Engineering Student & Full-Stack Developer
Passionate about building scalable, real-world tech solutions.

---

## 🪄 License

This project is licensed under the **MIT License**.
