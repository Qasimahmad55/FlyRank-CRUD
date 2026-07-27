import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { DatabaseSync as Database } from "node:sqlite";

const app = express();
const port = 3000;

app.use(express.json());

// Load OpenAPI spec
const openapiSpec = JSON.parse(fs.readFileSync(new URL("./openapi.json", import.meta.url)));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Stage 0: Initialize SQLite database and seed initial tasks if empty
const db = new Database("tasks.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

const { count } = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();
if (count === 0) {
  const insertStmt = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  insertStmt.run("Buy groceries", 0);
  insertStmt.run("Do laundry", 1);
  insertStmt.run("Finish assignment", 0);
}

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ "status": "ok" });
});

// Stage 1: Read from the database
app.get('/tasks', (req, res) => {
  const rows = db.prepare("SELECT * FROM tasks").all();
  res.json(rows.map(t => ({ ...t, done: Boolean(t.done) })));
});

app.get('/tasks/:id', (req, res) => {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json({ ...row, done: Boolean(row.done) });
});

// Stage 2: Create a new task (insert into database)
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required" });
  }
  const cleanTitle = title.trim();
  const stmt = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  const info = stmt.run(cleanTitle, 0);
  
  const newTask = {
    id: info.lastInsertRowid,
    title: cleanTitle,
    done: false
  };
  res.status(201).json(newTask);
});

// Stage 3: Update Task
app.put('/tasks/:id', (req, res) => {
  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  const { title, done } = req.body;
  let newTitle = existing.title;
  let newDone = existing.done;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    newTitle = title.trim();
  }
  if (done !== undefined) {
    newDone = Boolean(done) ? 1 : 0;
  }

  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?").run(newTitle, newDone, req.params.id);
  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(req.params.id);
  res.json({ ...updated, done: Boolean(updated.done) });
});

// Stage 3: Delete Task
app.delete('/tasks/:id', (req, res) => {
  const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  if (info.changes === 0) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
