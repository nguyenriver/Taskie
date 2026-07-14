# Taskie — Trello-Style Task Management System

Taskie is a modern, full-stack, decoupled task management web application designed as a Trello-like workspace. It features a robust C# backend API and a component-driven React single-page application (SPA).

---

## AI-Assisted Refactor

Taskie started as an academic ASP.NET MVC project and was later refactored with an AI-assisted workflow into an ASP.NET Core Web API and React SPA. The architecture, security changes, manual verification, cleanup, and documentation were reviewed manually.

## Known Limitations

This is a portfolio and interview project, not a production SaaS application. Known limitations include:

* Automated tests are not included yet.
* Demo credentials are for local seed data only and must be changed for any real deployment.
* Database credentials and JWT signing keys must be supplied through environment configuration in real deployments.
* Production hardening, monitoring, backups, and operational runbooks are outside the current project scope.

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

## Screenshots

Screenshots can be added here for the portfolio presentation. Recommended captures are:

* Landing page and login/register flow
* Board workspace with lists and cards
* Drag-and-drop card movement
* Admin dashboard

---

## API Endpoint Summary

Most API endpoints require JWT bearer authentication; registration and login are public.

| Area | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Auth | `POST` | `/api/auth/register` | Create an account |
| Auth | `POST` | `/api/auth/login` | Sign in and receive a JWT |
| Boards | `GET` | `/api/board/list` | List boards visible to the current user |
| Boards | `POST` | `/api/board/create` | Create a board |
| Boards | `GET` | `/api/board/{boardId}` | Read a board and its details |
| Lists | `GET` | `/api/list/board/{boardId}` | Read lists for a board |
| Cards | `GET` | `/api/card/{cardId}` | Read a card |
| Members | `GET` | `/api/boardmember/board/{boardId}` | Read board members |
| Admin | `GET` | `/api/admin/users` | List users as safe DTOs (Admin only) |

Write operations for boards, lists, cards, comments, and members enforce the Owner/Editor/Viewer permissions described above.

---

## 🚀 How to Run the Application

You can run this project in two ways: using a **Full Docker Compose Setup** (one-click run) or a **Hybrid Setup** (for active development).

---

### Option A: One-Click Docker Compose Setup (Recommended for Demos)

This setup launches the entire stack (Database, C# API, Nginx frontend server) inside Docker containers. It automatically initializes the database tables and default admin accounts from the `docs/Taskie.sql` seed script.

#### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

The repository also includes [go-task](https://taskfile.dev/) and a `Taskfile.yml` for repeatable commands:

```powershell
task start:bg          # build and start the full stack
task database:init     # initialize only when TaskieDB is missing
task update:backend    # rebuild only the backend, preserving the database
task update:frontend   # rebuild only the frontend
task database:reset    # explicit destructive reset and reseed
```

`task database:reset` deletes all local TaskieDB data. It is never run automatically.

#### Steps:
1. Create your local environment file from the example:
   ```powershell
   Copy-Item .env.example .env
   ```
   Edit `.env` and replace the example `SA_PASSWORD` and `JWT_KEY` values. Keep `.env` private; it is ignored by Git.
2. In the project root directory, run the following command:
   ```powershell
   docker compose up --build
   ```
3. Wait until the output logs print `Database initialization complete` and the backend service is running.
4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```
5. Log in using the default administrator credentials (for local demo data only):
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

##### 1. Configure local settings
Create `.env` from `.env.example` as shown in Option A. Native API startup reads the same settings through .NET environment variables or your IDE launch profile.

##### 2. Start the Database Container
Ensure Docker Desktop is open and run the following command to spin up a local SQL Server instance:
```powershell
docker compose up -d db
```
*(If the container is already created, just start it using: `docker start taskie-sqlserver`)*

##### 3. Apply Code-First Migrations
Ensure the Entity Framework Core global tool is installed:
```powershell
dotnet tool install --global dotnet-ef
```
Run migrations from the root folder to set up database schemas:
```powershell
dotnet ef database update
```
*(Note: To seed the default administrator account `admin@taskie.com` and sample boards, run the SQL script `docs/Taskie.sql` inside your database client).*

##### 4. Start the Backend API
Start the Web API with hot-reload enabled:
```powershell
dotnet watch
```
The server will boot and list its active ports (e.g. `http://localhost:5199`).

##### 5. Start the React Frontend
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
* **Configuration:** Database credentials, JWT signing settings, CORS origins, and the frontend API URL are supplied through environment variables (`.env` for Docker Compose; .NET/Vite environment settings for native development).
* **Clean Code Separation:** Business database logic is decoupled from Controllers via the **Repository Pattern** to ensure testability and isolation.
