# Set Up the Rails API

## Overview

Initialize the Rails backend for the chess learning app. This is the foundation everything else is built on — getting it right matters.

- A Rails 7 API-only app backed by PostgreSQL
- Runs on port 3001 locally to avoid conflicts with the Next.js platform
- Includes a health check endpoint to verify the server is alive

## What you should build

- A new Rails app in API mode (`rails new chess-learning --api -d postgresql`)
- PostgreSQL configured and database created (`rails db:create`)
- A `/health` endpoint that returns `{ "status": "ok" }` with a 200 status
- The app boots without errors (`rails server`)

## Constraints

- Do not add any models or migrations yet — that comes in the next phase
- The health check should live in its own controller, not ApplicationController
- Use `config/database.yml` with environment variables for the database URL (not hardcoded credentials)
