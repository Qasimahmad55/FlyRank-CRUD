# 📝 CRUD API: Task Manager (with SQLite Persistence)

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)

A fast, persistent RESTful API for managing tasks, built as part of the **FlyRank Backend Internship (Week 3 - Assignment A2: Connecting your CRUD to the database)**. 

This project takes our in-memory CRUD API from Week 2 and moves its storage layer to a real **SQLite** database (`tasks.db`) using Node.js synchronous SQLite (`node:sqlite`). Your data now survives server restarts while keeping the exact same API contract and endpoint behavior.

---

## ✨ Features

- **Real Database Persistence**: Data is saved to disk in a SQLite database (`tasks.db`), surviving server restarts.
- **Zero-Setup Database**: Automatically initializes and creates the `tasks` table and seeds example tasks on first run.
- **Full CRUD Functionality**: Create, Read, Update, and Delete tasks via REST endpoints.
- **Safe Parameterized Queries**: All SQL commands use placeholders (`?`) to guarantee protection against SQL injection.
- **Advanced SQL Querying**: Filter tasks by status (`WHERE done = ?`) or search by title (`WHERE title LIKE ?`) directly in the database.
- **SQL-Computed Statistics**: Calculate task counts using `SELECT COUNT(*)` in SQL.
- **Interactive Documentation**: Powered by Swagger UI.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd CRUD
npm install
```

### 2. Run the Server
```bash
npm start
```
The server will start on `http://localhost:3000`. On first run, it automatically creates `tasks.db` and seeds three initial tasks.

---

## 💾 Why SQLite & Database Storage Details

### Why SQLite?
SQLite was chosen because it is **serverless, lightweight, and requires zero setup or external database daemons**. It stores the entire database in a single file on disk, making it ideal for fast development, easy cloning, and reliable persistence without configuring PostgreSQL or MySQL servers.

### Where Does the Database Live?
- The database file is named `tasks.db` and lives directly in the root directory of the project.
- It is created automatically the first time the application runs (`new Database("tasks.db")`).
- `tasks.db` is explicitly added to `.gitignore` so that every stranger or teammate who clones the repo starts fresh with clean seeded data instead of inheriting someone else's modified state.

---

## 🔍 Stage 4: Explored SQLite by Hand

Using **DB Browser for SQLite**, we inspected the `tasks.db` table directly and ran manual SQL queries in the **Execute SQL** tab to see instant results without going through the API server.

### Example SQL Query Executed:
```sql
SELECT * FROM tasks WHERE done = 1;
```
**What it returned:** This query returned all completed task records in the database, such as row `id: 2` with `title: "Do laundry"` and `done: 1`. 

### DB Browser Screenshot:
*(Place your DB Browser screenshot showing the tasks table below)*
![DB Browser Screenshot](./db_screenshot.png)

---

## 💡 Proof of Storage as an Implementation Detail

A key concept in backend engineering is separating *what* an application does (the API contract) from *where* it stores its data (the storage layer).

Our Assignment 1 API tests and `curl` commands pass 100% identically against this new SQLite version. Why? Because the API client only interacts with the REST endpoints and JSON request/response payloads (`200`, `201`, `204`, `400`, `404`). Whether the server stores tasks in a JavaScript array in RAM or in rows inside a SQLite database file is **just an implementation detail** hidden behind the API boundary.

---

## 📖 API Documentation & Endpoints

Visit the interactive Swagger UI to explore and test all endpoints:
👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

| Method | Endpoint | Description | Status Codes |
| ------ | -------- | ----------- | ------------ |
| `GET` | `/` | API Root / Welcome | `200` |
| `GET` | `/health` | Server health check | `200` |
| `GET` | `/tasks` | List tasks read live from SQLite | `200` |
| `GET` | `/tasks/:id`| Get a single task by ID | `200`, `404` |
| `POST` | `/tasks` | Create a new task (Inserts row into DB) | `201`, `400` |
| `PUT` | `/tasks/:id`| Update task title or status via SQL `UPDATE` | `200`, `400`, `404`|
| `DELETE`| `/tasks/:id`| Remove a task via SQL `DELETE` | `204`, `404` |

---

## 🧪 Example Usage with Curl

Creating a new task:
```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Master SQLite queries"}'
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 4,
  "title": "Master SQLite queries",
  "done": false
}
```
