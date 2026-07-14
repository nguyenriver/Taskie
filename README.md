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
* Production monitoring, automatic off-site backups, and full operational runbooks are outside the current project scope. Local manual backup and restore commands are included.

---

## 🛠️ Technology Stack

### Backend (Server)
* **Framework:** ASP.NET Core 10.0 Web API (REST Architecture)
* **Database Access (ORM):** Entity Framework Core 10.0.9
* **Database Engine:** Microsoft SQL Server
* **Security:** JWT authentication stored in an HttpOnly, SameSite cookie

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
* A secure, dedicated panel for system administrators (`[Authorize(Roles = "Admin")]`) to manage accounts, system roles, board records, ownership, and memberships.
* Administrators do not automatically receive access to private card or comment content.

---

## Screenshots

Screenshots can be added here for the portfolio presentation. Recommended captures are:

* Landing page and login/register flow
* Board workspace with lists and cards
* Drag-and-drop card movement
* Admin dashboard

---

## API Endpoint Summary

Most API endpoints require authentication. The browser receives the JWT only as an HttpOnly cookie; registration and login are public.

| Area | Method | Endpoint | Purpose |
| --- | --- | --- | --- |
| Auth | `POST` | `/api/auth/register` | Create an account |
| Auth | `POST` | `/api/auth/login` | Sign in and set the secure authentication cookie |
| Auth | `GET` | `/api/auth/me` | Restore the current browser session |
| Auth | `POST` | `/api/auth/logout` | Clear the authentication cookie |
| Boards | `GET` | `/api/board/list` | List boards visible to the current user |
| Boards | `POST` | `/api/board/create` | Create a board |
| Boards | `GET` | `/api/board/{boardId}` | Read a board and its details |
| Lists | `GET` | `/api/list/board/{boardId}` | Read lists for a board |
| Cards | `GET` | `/api/card/{cardId}` | Read a card |
| Members | `GET` | `/api/boardmember/board/{boardId}` | Read board members |
| Admin | `GET` | `/api/admin/users` | List users as safe DTOs (Admin only) |
| Admin | `PUT` | `/api/admin/boards/transfer-owner` | Transfer ownership and retain the previous owner as Editor |

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
task database:init     # initialize if missing and apply pending migrations
task database:migrate  # apply pending migrations without deleting data
task database:backup   # create a timestamped .bak file in backups/
task database:restore -- <backup-file> # explicitly restore and replace TaskieDB
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
docker compose down
```

SQL Server data is stored in the `taskie-db-data` named volume and survives normal container teardown. Use `task database:reset` only when you intentionally want to delete and reseed `TaskieDB`; `docker compose down -v` also deletes the volume.

Incremental schema changes live in `docs/migrations` and are recorded in the `SchemaMigrations` table. Add a new sequentially numbered SQL file, such as `002_add_card_label.sql`, then run `task database:migrate`. Applied migrations are skipped on later starts.

To create and restore local backups:

```powershell
task database:backup
Get-ChildItem backups
task database:restore -- TaskieDB_YYYYMMDDTHHMMSSZ.bak
```

Restore replaces the current `TaskieDB`, so it is intentionally explicit. Backup files are ignored by Git.

---

### Option B: Hybrid Local Setup (Recommended for Active Development)

This setup runs the database container in Docker, while running the React client and C# Web API natively on your local machine to support instant hot-reloading (HMR) and easy debugging.

#### Prerequisites
1. **.NET 10.0 SDK** installed.
2. **Node.js** (v20+ recommended) and **npm** installed.
3. **Docker Desktop** installed and running.

#### Steps:

##### 1. Configure local settings
Create `.env` from `.env.example` as shown in Option A. Docker Compose reads this file for SQL Server and container configuration.

##### 2. Start and initialize the database
Ensure Docker Desktop is open, then start SQL Server and initialize the schema only if `TaskieDB` is missing:
```powershell
task database:init
```

The local Docker demo uses `docs/Taskie.sql` only for a fresh bootstrap and `docs/migrations` for incremental updates. Do not run `dotnet ef database update` against this SQL-managed database.

##### 3. Configure native API secrets
ASP.NET Core does not load `.env` automatically. Store the native API configuration with .NET user-secrets, using the same local password/key values from `.env`:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=TaskieDB;User Id=sa;Password=<SA_PASSWORD from .env>;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "<JWT_KEY from .env>"
dotnet user-secrets set "Jwt:Issuer" "TaskieAPI"
dotnet user-secrets set "Jwt:Audience" "TaskieClient"
dotnet user-secrets set "Cors:AllowedOrigins" "http://localhost:5173"
```

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
* **Authentication:** The API uses a short-lived JWT, but the browser never stores or reads it. Login places it in an HttpOnly, SameSite cookie, API requests include credentials, and logout removes the cookie.
* **Password Hashing:** Upgraded to **BCrypt** (via `BCrypt.Net-Next`) to ensure secure salted password hashing, including work-factor tuning. A SHA256 fallback is included for legacy database compatibilities.
* **Configuration:** Database credentials, JWT signing settings, CORS origins, and the frontend API URL are supplied through environment variables (`.env` for Docker Compose; .NET/Vite environment settings for native development).
* **Clean Code Separation:** Business database logic is decoupled from Controllers via the **Repository Pattern** to ensure testability and isolation.
