# Background Job API

This is a small API that demonstrates handling slow work using background jobs with Inngest. It accepts a request instantly, processes the work in the background, and allows clients to poll for the status.

## How to Run It

1. **Start the API server:**
   ```bash
   node server.js
   ```
2. **Start the Inngest Dev Server (in a second terminal):**
   ```bash
   npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
   ```

## Endpoints and Functions

| Method | Path           | Description                                                |
|--------|----------------|------------------------------------------------------------|
| GET    | `/health`      | Health check endpoint, returns status 200 OK               |
| POST   | `/reports`     | Starts a report generation job and returns 202 Accepted    |
| GET    | `/reports/:id` | Polls the status of the report (pending, done, or 404)     |

| Inngest Function | Trigger Event        | Description                                     |
|------------------|----------------------|-------------------------------------------------|
| `say-hello`      | `test/hello`         | Simple function with a 5-second sleep           |
| `make-report`    | `report/requested`   | Main background job that simulates 8-sec work   |
| `heartbeat`      | Cron: `* * * * *`    | Logs report summary every minute                |

## Proof of Execution

**1. POST Request (Immediate 202 Accepted):**
```bash
$ curl -i -X POST http://localhost:3000/reports -H "Content-Type: application/json" -d '{"topic":"cats"}'
HTTP/1.1 202 Accepted
...
{"id":"...","topic":"cats","status":"pending"}
```

**2. Poll (Pending):**
```bash
$ curl -i http://localhost:3000/reports/<id>
HTTP/1.1 200 OK
...
{"id":"...","topic":"cats","status":"pending"}
```

**3. Poll (Done):**
```bash
$ curl -i http://localhost:3000/reports/<id>
HTTP/1.1 200 OK
...
{"id":"...","topic":"cats","status":"done"}
```

## Stage 3 & 4 Answers

- **Stage 3 (Bad input):** A wrong input (missing topic) is rejected at the door with a 400 response and creates no job, because a wrong moment (like a network drop) deserves a retry, but bad data will always fail and thus doesn't warrant wasting background worker resources.
- **Stage 4 (Cron Expressions):** 
  - Every day at 08:00: `0 8 * * *`
  - Every Sunday at 22:00: `0 22 * * 0`

*(Add screenshot of Inngest dashboard here showing `make-report`, `say-hello` and `heartbeat` runs)*
