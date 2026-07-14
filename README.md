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

## 🚀 How to Run the Application

You can run this project in two ways: using a **Full Docker Compose Setup** (one-click run) or a **Hybrid Setup** (for active development).

---

### Option A: One-Click Docker Compose Setup (Recommended for Demos)

This setup launches the entire stack (Database, C# API, Nginx frontend server) inside Docker containers. It automatically initializes the database tables and default admin accounts from the `docs/Taskie.sql` seed script.

#### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

#### Steps:
1. In the project root directory, run the following command:
   ```powershell
   docker compose up --build
   ```
2. Wait until the output logs print `Database initialization complete` and the backend service is running.
3. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```
4. Log in using the default administrator credentials:
   * **Email:** `admin@taskie.com`
   * **Password:** `admin123`

To tear down the containers:
```powershell
docker compose down -v
```

---

### Option B: Hybrid Local Setup (Recommended for Active Development)

This setup runs the database container in Docker, while running the React client and C# Web API natively on your local machine to support instant hot-reloading (HMR) and easy debugging.

#### Prerequisites
1. **.NET 10.0 SDK** installed.
2. **Node.js** (v20+ recommended) and **npm** installed.
3. **Docker Desktop** installed and running.

#### Steps:

##### 1. Start the Database Container
Ensure Docker Desktop is open and run the following command to spin up a local SQL Server instance:
```powershell
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" -p 1433:1433 --name taskie-sqlserver -d mcr.microsoft.com/mssql/server:2022-latest
```
*(If the container is already created, just start it using: `docker start taskie-sqlserver`)*

##### 2. Apply Code-First Migrations
Ensure the Entity Framework Core global tool is installed:
```powershell
dotnet tool install --global dotnet-ef
```
Run migrations from the root folder to set up database schemas:
```powershell
dotnet ef database update
```
*(Note: To seed the default administrator account `admin@taskie.com` and sample boards, run the SQL script `docs/Taskie.sql` inside your database client).*

##### 3. Start the Backend API
Start the Web API with hot-reload enabled:
```powershell
dotnet watch
```
The server will boot and list its active ports (e.g. `http://localhost:5199`).

##### 4. Start the React Frontend
Open another terminal, navigate to the `client` directory, install packages, and start the Vite dev server:
```powershell
cd client
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔒 Security & Architecture Notes
* **Authentication:** The project transitioned from session-based cookie cookies to stateless **JWT Token authentication** in `.NET 10.0`.
* **Password Hashing:** Upgraded to **BCrypt** (via `BCrypt.Net-Next`) to ensure secure salted password hashing, including work-factor tuning. A SHA256 fallback is included for legacy database compatibilities.
* **CORS Policy:** Strict origin control is implemented in `Program.cs` allowing only the designated local frontend port (`http://localhost:5173`) with allowed request headers and methods.
* **Clean Code Separation:** Business database logic is decoupled from Controllers via the **Repository Pattern** to ensure testability and isolation.
