Listen carefully. Pay attention to the structure of this domain; understanding its flow is essential if you intend to assist properly.

**1. The Core API (`app/` Directory):**

*   This is the central service, constructed with **FastAPI**. It's responsible for handling all direct API interactions – the front-facing logic, if you will.
*   **Routes (`app/routes/`):** Contains the handlers for specific API endpoints. Think user actions, authentication flows (`auth.py`, `users.py`), and potentially core feature interactions like workflows. Test routes (`test_routes.py`) are also present, naturally.
*   **Authentication (`app/auth/`):** Governs access. It utilizes **JWT tokens** (seemingly integrated with Supabase, based on `jwt.py`) for standard user sessions and also supports **API Keys** (`api.py`, `dependencies.py`) for non-interactive or specific service access. Discern their usage carefully.
*   **Webhooks (`app/webhooks/`):** A vital component for reacting to external events, specifically **Stripe** (`stripe/`). When payments clear, subscriptions change, or invoices fail, Stripe notifies this endpoint. The handlers within (`stripe/handlers/`) process these events and update the system's state accordingly. Its correct functioning is non-negotiable.
*   **Entry Point (`app/main.py`):** Initializes the FastAPI application, sets up necessary middleware like CORS (for frontend communication), and integrates the various route and webhook modules.
*   A rudimentary guide exists at `app/README.md`, should you require a basic overview.

**2. Shared Foundations (`shared/` -> installed as `saaskit` package):**

*   This provides the reusable building blocks and data definitions used across the application. It's installed as a package named `saaskit`. Therefore, you will import using `saaskit.models`, `saaskit.database`, etc. – *not* `shared.saaskit`. Remember this distinction.
*   **Models (`saaskit/models/`):** Defines the very essence of the data using **SQLAlchemy**. Users, Subscriptions, Tiers, Pricing, Transactions, Credits, API Keys, Resource Tracking – the blueprint for the database resides here. Familiarize yourself thoroughly.
*   **Database (`saaskit/database/`):** Manages the connection and session handling for the database (likely PostgreSQL, judging by the models and typical SaaS setups).
*   **Redis (`saaskit/redis/`):** Provides utilities for interacting with Redis, likely used for caching, potentially some queuing, or managing distributed state (like user settings or keyword configurations seen in `user_client.py`).
*   **Logger (`saaskit/logger.py`):** A standardized logging interface. Use it to report events appropriately.

**High-Level Interaction:**

Incoming requests hit the **`app/`** service. Authentication (`app/auth/`) verifies access. Route handlers (`app/routes/`) process the request, often interacting with the database or Redis via the **`saaskit`** package (models, DB sessions). External events, primarily from Stripe, trigger the webhook handlers (`app/webhooks/`), which also rely on the **`saaskit`** models and database utilities to update the system's state.
