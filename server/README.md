# Logistics Dashboard (Server)

Backend for the **Logistics Dashboard App**, built with **Django** and **Django REST Framework (DRF)**.
It provides a structured API for managing logistics operations, analytics, and user interactions.

---

## 🧰 Tech Stack
- **Python 3.12+**
- **Django 5+**
- **Django REST Framework**
- **PostgreSQL (remote or local)**
- **Gunicorn (for deployment)**

---

## 🚀 Setup Guide

### 1️⃣ Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # (Linux/macOS)
venv\Scripts\activate     # (Windows)
````

### 2️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 3️⃣ Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4️⃣ Start the Server

```bash
python manage.py runserver
```

---

## 🌍 Using a Remote Database

To connect to a remote PostgreSQL instance (e.g., Railway, Supabase, Render):

1. Create a `.env` file in your root directory.
2. Add this line:

   ```
   DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<dbname>
   ```

3. In your `settings.py`, use:

   ```python
   import dj_database_url
   DATABASES = {
       'default': dj_database_url.config(default='sqlite:///db.sqlite3')
   }
   ```

---

## 🧠 Features

* RESTful API for logistics data
* Secure CORS and authentication setup
* Remote database integration ready
* Scalable Django architecture

---

## 📁 Folder Structure

```
server/
 ┣ 📁 api/           # Django REST API app
 ┣ 📁 core/          # Main project settings
 ┣ 📁 models/        # Database models
 ┣ 📁 serializers/   # Data serializers
 ┗ 📄 manage.py
```

---

## 🔐 Authentication

> Authentication is optional for this project.
> You can integrate it later using **Django REST Auth** or **Simple JWT** if you want user login/registration.

---

## 🧑‍💻 Maintained by

**Afuh Flyine Tembeng**
Full-Stack Developer | Python & JavaScript | Building real-world solutions.
