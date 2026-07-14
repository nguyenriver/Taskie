# Taskie — Trello-Style Task Management System

Taskie is a modern, full-stack, decoupled task management web application designed as a Trello-like workspace. It features a robust C# backend API and a component-driven React single-page application (SPA).

---

## 🛠️ Technology Stack

### Backend (Server)
* **Framework:** ASP.NET Core 10.0 Web API (REST Architecture)
* **Database Access (ORM):** Entity Framework Core 10.0.9 (Code-First Migrations)
* **Database Engine:** Microsoft SQL Server
* **Security:** JWT (JSON Web Tokens) Bearer Authentication

### Frontend (Client)
* **Framework/Bundler:** Vite + React (TypeScript)
* **Styling:** Tailwind CSS v4
* **Typography & Assets:** Google Sans and Font Awesome Free v6 (locally hosted)

---

## 🌟 Key Features

### 📋 Board Workspace
* **Dynamic Boards:** Create, update, and delete workspaces.
* **Trello-Style Flow:** Organize tasks into customizable Lists (columns) and drag-and-drop Cards (items).
* **Positional Persistence:** Persistent sorting order for both Lists and Cards.

### 👥 Sharing & Collaboration
* **Board Invitations:** Share boards with other users via email.
* **Role-Based Access Control (RBAC):** Supports granular permissions:
  * **Owner:** Full control (manage boards, edit lists/cards, delete workspace).
  * **Editor:** Manage lists and cards, edit descriptions, add/remove comments.
  * **Viewer:** Read-only access to boards, lists, cards, and comments.

### 💬 Card Details & Comments
* **Task Context:** Card descriptions, custom due dates, and status tracking (To Do, In Progress, Done).
* **Discussions:** Add and delete comments under cards to communicate within teams.

### 🛡️ Admin Dashboard
* A secure, dedicated panel for system administrators (`[Authorize(Roles = "Admin")]`) to perform global CRUD management over Users, Boards, Lists, Cards, Comments, and Memberships.

---

## 🚀 Setup & Running Locally

### Prerequisites
1. **.NET 10.0 SDK** installed.
2. **Node.js** (v20+ recommended) and **npm** installed.
3. **Docker Desktop** installed and running.

---

### Step 1: Run the Database (Docker)
Ensure Docker Desktop is open and run the following command to spin up a local SQL Server instance:
```powershell
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 --name taskie-sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```

---

### Step 2: Initialize Database Schemas (EF Core)
Install the Entity Framework Core global tool (if you haven't already):
```powershell
dotnet tool install --global dotnet-ef
```

Apply code-first migrations to create database tables:
```powershell
# In the project root directory
dotnet ef database update
```
*(Note: If you want to seed a default administrator account `admin@taskie.com`, refer to the SQL seed script in `docs/Taskie.sql`)*

---

### Step 3: Run the Backend API
Start the ASP.NET Core Web API:
```powershell
dotnet watch
```
The API server will launch at `https://localhost:7196` (or `http://localhost:5031`).

---

### Step 4: Run the React Frontend
Navigate to the `client` directory, install packages, and start the Vite dev server:
```powershell
cd client
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security & Architecture Notes (Self-Assessment)
* **Authentication:** The project transitioned from session-based cookie cookies to stateless **JWT Token authentication** in `.NET 10.0`.
* **Password Hashing:** Upgraded to **BCrypt** (via `BCrypt.Net-Next`) to ensure secure salted password hashing, including work-factor tuning. A SHA256 fallback is included for legacy database compatibilities.
* **CORS Policy:** Strict origin control is implemented in `Program.cs` allowing only the designated local frontend port (`http://localhost:5173`) with allowed request headers and methods.
* **Clean Code Separation:** Business database logic is decoupled from Controllers via the **Repository Pattern** to ensure testability and isolation.
