import express from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
const app = express();
const port = 3000;

app.use(express.json());

// Load OpenAPI spec
const openapiSpec = JSON.parse(fs.readFileSync(new URL("./openapi.json", import.meta.url)));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

const initialTasks = [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Do laundry", done: true },
  { id: 3, title: "Finish assignment", done: false }
];

let tasks = JSON.parse(JSON.stringify(initialTasks));
let nextId = 4;

app.get('/', (req, res) => {
  res.json({ "name": "Task API", "version": "1.0", "endpoints": ["/tasks"] });
});

app.get('/health', (req, res) => {
  res.json({ "status": "ok" });
});

// Extras: Stats
app.get('/stats', (req, res) => {
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const open = total - done;
  res.json({ total, done, open });
});

// Extras: Reset
app.post('/reset', (req, res) => {
  tasks = JSON.parse(JSON.stringify(initialTasks));
  nextId = 4;
  res.status(200).json({ message: "Tasks reset to initial state" });
});

// Stage 2: Read list and single task
app.get('/tasks', (req, res) => {
  let result = tasks;
  
  if (req.query.done !== undefined) {
    const isDone = req.query.done === 'true';
    result = result.filter(t => t.done === isDone);
  }
  
  if (req.query.search !== undefined) {
    const query = req.query.search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(query));
  }
  
  res.json(result);
});

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  res.json(task);
});

// Stage 3: Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "Title is required" });
  }
  const newTask = {
    id: nextId++,
    title: title.trim(),
    done: false
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Stage 4: Update and Delete
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  const { title, done } = req.body;
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: "Title cannot be empty" });
    }
    task.title = title.trim();
  }
  if (done !== undefined) {
    task.done = Boolean(done);
  }
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${req.params.id} not found` });
  }
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
