# Library Management System — Backend

Spring Boot 3 REST API for a library/inventory management system: catalog
browsing, JWT-secured borrow/return flow, scheduled overdue-fine accrual,
and an admin reporting module.

## Stack

- Java 17, Spring Boot 3.2
- Spring Data JPA + PostgreSQL (H2 profile available for zero-setup local runs)
- Spring Security + JWT (stateless)
- Spring Scheduler for the nightly overdue sweep
- OpenCSV for report exports
- springdoc-openapi for Swagger UI
- JUnit 5, Mockito, Testcontainers

## Running locally

**Option A — no database install needed (H2 in-memory):**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

**Option B — PostgreSQL:**
```bash
createdb library_db
export DB_URL=jdbc:postgresql://localhost:5432/library_db
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
mvn spring-boot:run
```

The app seeds an admin account on first boot:
`admin@library.com` / `admin123`

Swagger UI: `http://localhost:8080/swagger-ui.html`

## Known limitation

`GET /api/reports/monthly-fines` uses a native `to_char(...)` call in its
JPQL query to group fines by month, which is Postgres-specific. It works
fine against the default Postgres profile but will throw at runtime under
the H2 profile. Every other endpoint works on both. If you need the H2
profile to support it too, swap that query to a portable alternative
(e.g. group by `YEAR(r.returnDate)`/`MONTH(r.returnDate)` instead of a
formatted string).

## Running tests

```bash
mvn test
```

`ConcurrentBorrowIntegrationTest` spins up a real Postgres container via
Testcontainers (needs Docker running locally) and fires two simultaneous
borrow requests at the last copy of a book to prove the optimistic-locking
strategy actually prevents an oversell — not just that the code compiles.

## Deploying

Render or Railway both work well for a Spring Boot + Postgres app:

1. Push this `backend/` folder as its own repo (or point the platform at the subdirectory).
2. Provision a managed Postgres instance; copy its connection details.
3. Set env vars: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `PORT`.
4. Build command: `mvn clean package -DskipTests`
5. Start command: `java -jar target/library-management-system-1.0.0.jar`

## Talking points for interviews

- **Optimistic locking, not pessimistic**: `Book.version` + `@Lock(OPTIMISTIC)`
  means concurrent borrow requests don't block each other with row locks —
  they proceed independently and only one commits; the loser gets a clean
  409 to retry. Cheaper than `SELECT ... FOR UPDATE` under low contention,
  which is the realistic case for a library.
- **Transactional boundaries**: `borrowBook` and `returnBook` are each a
  single `@Transactional` unit spanning the book-copy update and the
  borrow-record write, so a failure partway through never leaves the book's
  copy count out of sync with the borrow ledger.
- **Stateless JWT auth**: no server-side session store, so the API scales
  horizontally without sticky sessions.
- **Scheduled job vs. on-demand calculation**: fines could be computed
  lazily on every read, but the nightly sweep keeps `status=OVERDUE`
  queryable directly in reports without recomputing it per-request.
