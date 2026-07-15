# 📝 CRUD API: Task Manager

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)

A fast, in-memory RESTful API for managing tasks, built as part of the **FlyRank Backend Internship (Week 2 - Assignment A1)**. 

This project demonstrates core backend concepts including routing, request validation, HTTP status codes, and interactive API documentation.

## ✨ Features

- **Full CRUD** functionality (Create, Read, Update, Delete)
- **Interactive Documentation** powered by Swagger UI
- **Input Validation** for robust error handling (400 Bad Request)
- **Advanced Querying**: Filter tasks by status or search by title
- **ES Modules** syntax for modern JavaScript

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
npm install
```

### 2. Run the Server
```bash
npm run start
```
The server will start on `http://localhost:3000`.

---

## 📖 API Documentation

Once the server is running, visit the interactive Swagger UI to explore and test all endpoints directly from your browser:

👉 **[http://localhost:3000/docs](http://localhost:3000/docs)**

![Swagger UI Screenshot](./swagger.png)

---

## 🛤️ Endpoints Overview

| Method | Endpoint | Description | Status Codes |
| ------ | -------- | ----------- | ------------ |
| `GET` | `/` | API Root / Welcome | `200` |
| `GET` | `/health` | Server health check | `200` |
| `GET` | `/tasks` | List tasks (Supports `?done=true` & `?search=term`) | `200` |
| `GET` | `/tasks/:id`| Get a single task by ID | `200`, `404` |
| `POST` | `/tasks` | Create a new task | `201`, `400` |
| `PUT` | `/tasks/:id`| Update task title or status | `200`, `400`, `404`|
| `DELETE`| `/tasks/:id`| Remove a task | `204`, `404` |
| `GET` | `/stats` | View task statistics (Total, Open, Done) | `200` |
| `POST` | `/reset` | Reset database to initial mock data | `200` |

---

## 🧪 Example Usage

Creating a new task using `curl`:

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete backend assignment"}'
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 4,
  "title": "Complete backend assignment",
  "done": false
}
```

---

## 🤖 Stage 7: AI vs Me Reflection

*(Note: As per Stage 7 of the assignment, this section is reserved for reflecting on how the AI-generated code compared to a manual implementation. Fill in your observations below!)*

- **What the AI did better:** ...
- **What it got wrong/ignored:** ...
- **What my prompt forgot to specify:** ...
