# Secure API with Supabase Auth

This project is a secure API that handles user authentication (Sign Up, Log In, Log Out) and protects specific routes using Supabase Auth as the Identity Provider. It verifies JSON Web Tokens (JWTs) to guard "user-only" endpoints, and documents the flow using Swagger UI.

## Setup Environment Variables

1. Clone the repository.
2. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Fill in your `SUPABASE_URL` and `SUPABASE_KEY` (anon key) from your Supabase project dashboard.

## Running the API

Start the server using the following command:

```bash
npm start
```

The server will listen on `http://localhost:3000`.

## API Reference

| Endpoint | Method | Purpose | Requires Auth | Auth Header |
|----------|--------|---------|---------------|-------------|
| `/auth/signup` | POST | Create a new user account | No | none |
| `/auth/login` | POST | Authenticate & return a JWT | No | none |
| `/auth/logout` | POST | End the user's session | Yes | `Authorization: Bearer <token>` |
| `/public/info` | GET | Read public, open data | No | none |
| `/protected/profile` | GET | Read private profile data | Yes | `Authorization: Bearer <token>` |
| `/protected/dashboard` | GET | Read private dashboard data | Yes | `Authorization: Bearer <token>` |

## Swagger UI Documentation

You can view the interactive documentation at `http://localhost:3000/docs`. The UI includes an **Authorize** padlock to easily test endpoints that require authentication.

## LLM Triage Endpoint (Assignment A17)

Test the new LLM triage endpoint. Ensure you run with `LLM_STUB=1 npm start` during Stage 1.

**Valid request:**
```bash
curl -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '{"text": "I can not log into my account!"}'
```

**Deliberately broken request (missing text):**
```bash
curl -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '{}'
```
