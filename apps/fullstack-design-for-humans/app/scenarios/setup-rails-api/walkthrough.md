# Set Up the Rails API — Walkthrough

## How to Approach This

### The Core Insight

Setting up a project correctly at the start prevents a class of bugs that are painful to diagnose later: misconfigured databases, hardcoded credentials committed to git, dependencies that don't match the environment you'll deploy to. The setup phase is boring but it's also the highest-leverage moment — decisions made here ripple through everything else.

### The Mental Model

Think of a Rails app as a restaurant kitchen before opening day. The `rails new` command installs the equipment and arranges the stations. PostgreSQL is the walk-in fridge — it holds the ingredients. The `database.yml` is the label on the fridge that tells the kitchen staff where it is and how to open it. If the label is wrong (hardcoded credentials, wrong host), nothing works — but you won't know that until you try to cook.

API mode strips out the dining room (views, assets, sessions) and keeps just the kitchen. That's what you want here: no front-of-house, just the backend machinery.

### How to Decompose This

Before running a single command, ask yourself:
1. What is this app's identity? (name, database adapter, API vs full stack)
2. How will the database connect? (environment variables, not hardcoded strings)
3. How will I verify it's working once it's running? (a health endpoint, not just "no errors")

## Building the Setup

### Step 1: Generate the app

`rails new` has flags you need to get right from the start. `--api` removes the view layer. `-d postgresql` sets PostgreSQL as the database adapter instead of SQLite.

Running it with the wrong flags means undoing generated files — easier to get it right now.

> **What you're learning:** The `--api` flag tells Rails to skip middleware that only makes sense for browser-based apps (sessions, cookies, flash). Your app will be leaner and the generated code won't include things you'll never use.

### Step 2: Configure the database with environment variables

Open `config/database.yml`. By default, Rails generates a config that uses `<%= ENV['DATABASE_URL'] %>` for production but `<%= ENV['..._DATABASE_PASSWORD'] %>` for development. Simplify this: use `url: <%= ENV['DATABASE_URL'] %>` for all environments and provide a sensible default for local development.

> **What you're learning:** Credentials should never be in source code. `database.yml` is committed to git. If you put your local password in it, you're one `git push` away from leaking it. Environment variables keep secrets out of the codebase.

### Step 3: Create the database and verify the connection

`rails db:create` uses `database.yml` to create the databases. If it fails, the error tells you exactly what's wrong: missing env var, wrong host, PostgreSQL not running. Fix the error before moving on.

> **What you're learning:** Failing early and noisily is a feature. A database error here surfaces before you've written any code that depends on it.

### Step 4: Add a health endpoint

Create a `HealthController` with a single `show` action that renders `{ status: 'ok' }`. Wire it to `GET /health` in `config/routes.rb`.

This endpoint serves two purposes: it verifies the server is running, and later it becomes the first thing Render checks when deploying.

> **What you're learning:** A thin controller that delegates nothing is fine for a health check. Not every controller needs a model.

:::evaluator
You've set up the Rails API. Before checking your work: what does `--api` actually remove from a standard Rails app, and why does that matter for a backend that only serves JSON?
:::
