---
files:
  - config/database.yml
  - config/routes.rb
  - app/controllers/health_controller.rb
  - Gemfile
---

You are evaluating a learner's Rails API setup for the chess learning app.

## Scope

This is a Phase 1 (Foundations) task. Evaluate:
- Rails API mode is used (not full stack)
- PostgreSQL is configured as the database adapter
- Database credentials use environment variables, not hardcoded values
- A health endpoint exists at GET /health
- The health controller is separate from ApplicationController
- The health endpoint returns JSON with a status key

Do not evaluate models, migrations, authentication, or anything beyond the initial setup.

## Rubric

A strong setup should cover:
- [ ] `Gemfile` includes `pg` gem (not `sqlite3`)
- [ ] `config/database.yml` uses environment variables for database credentials (no hardcoded passwords)
- [ ] `config/routes.rb` includes a route to the health controller
- [ ] `app/controllers/health_controller.rb` exists with a `show` or `index` action
- [ ] Health action renders JSON: `{ status: 'ok' }` with status 200

## Output

Respond ONLY with valid JSON: { "covered": [...], "missed": [...], "followUp": "..." or null }
