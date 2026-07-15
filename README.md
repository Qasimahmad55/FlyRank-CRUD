# CRUD API

A simple in-memory CRUD API built with Express for managing tasks.

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the server:
   ```bash
   npm run start
   ```

## Endpoints

| HTTP Method | Endpoint | Description |
| ----------- | -------- | ----------- |
| GET | `/tasks` | List all tasks. (Supports query params: `?done=true` and `?search=milk`) |
| GET | `/tasks/:id` | Get a specific task by ID. |
| POST | `/tasks` | Create a new task. Requires JSON body with `title`. |
| PUT | `/tasks/:id` | Update an existing task. Can update `title` and/or `done`. |
| DELETE | `/tasks/:id` | Delete a specific task by ID. |
| GET | `/stats` | View statistics about tasks. |
| POST | `/reset` | Restores the database to 3 initial example tasks. |
| GET | `/docs` | View interactive Swagger UI documentation. |

## Example Usage

```bash
curl -i -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Buy milk"}'

HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 42

{"id":4,"title":"Buy milk","done":false}
```

## Documentation
Interactive documentation is available at `http://localhost:3000/docs` once the server is running.
