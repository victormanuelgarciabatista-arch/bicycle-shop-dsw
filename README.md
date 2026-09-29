# Bicycle Shop

A full-stack learning project for managing a bicycle shop through a REST
API and a React user interface.

The project demonstrates how to build a backend API with TypeScript,
Express, Sequelize, and MySQL, and how to connect it to a frontend built
with TypeScript, React, Vite, and Tailwind CSS. The application supports
CRUD operations for bicycles and brands.

## Getting Started

These instructions will help you set up and run the project locally for
development and testing.

### Prerequisites

Make sure the following software is installed:

-   Git
-   Node.js with npm
-   MySQL
-   Postman (recommended for testing the API)

A Node.js version compatible with the installed Vite version is
required.

### Installing

Clone the repository:

``` bash
git clone <REPOSITORY_URL>
cd bicycle-shop-dsw-develop
```

The project contains two applications:

``` text
bicycle-shop-dsw-develop/
├── backend/
├── frontend/
└── README.md
```

### Database setup

Start your MySQL server and create the database:

``` sql
CREATE DATABASE IF NOT EXISTS db_bicycle_shop
CHARACTER SET utf8mb4;
```

The configured MySQL user must have permission to access the database
and create its tables.

### Backend configuration

Create a `.env` file inside the `backend/` directory. You can use
`backend/.env.example` as a reference:

``` dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_bicycle_shop
DB_USER=your-database-username
DB_PASSWORD=your-database-password
```

Replace `DB_USER` and `DB_PASSWORD` with your MySQL credentials.

Install the backend dependencies:

``` bash
cd backend
npm ci
```

Start the backend in development mode:

``` bash
npm run dev
```

The server will run at:

``` text
http://localhost:3000
```

The API base URL is:

``` text
http://localhost:3000/api
```

The root endpoint can also be used to verify that the API is running:

``` http
GET /
```

It returns:

``` json
{
  "message": "API working"
}
```

> **Important:** the current backend uses
> `sequelize.sync({ force: true })`. Every time the backend starts,
> Sequelize recreates the database tables. Existing data can therefore
> be deleted. This setting should be reviewed before using the
> application with persistent or production data.

### Frontend configuration

Create a `.env` file inside the `frontend/` directory. You can use
`frontend/.env.example` as a reference:

``` dotenv
VITE_API_URL=http://localhost:3000/api
```

Install the frontend dependencies:

``` bash
cd frontend
npm ci
```

Start the frontend development server:

``` bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

## API

The backend exposes REST endpoints for bicycles and brands.

### Bicycle endpoints

  -----------------------------------------------------------------------------
  Method                  Endpoint                      Description
  ----------------------- ----------------------------- -----------------------
  `GET`                   `/api/bicycles`               Get all bicycles

  `GET`                   `/api/bicycles/:id`           Get a bicycle by ID

  `GET`                   `/api/bicycles/eagerly/:id`   Get a bicycle by ID
                                                        including its brand

  `POST`                  `/api/bicycles`               Create a bicycle

  `PUT`                   `/api/bicycles/:id`           Update a bicycle

  `DELETE`                `/api/bicycles/:id`           Delete a bicycle
  -----------------------------------------------------------------------------

A bicycle contains the following main fields:

-   `id`
-   `brandId`
-   `model`
-   `description`
-   `price`
-   `stock`
-   `createdAt`
-   `updatedAt`

When creating a bicycle, `brandId`, `model`, and `price` are required by
the controller.

### Brand endpoints

  Method     Endpoint            Description
  ---------- ------------------- -------------------
  `GET`      `/api/brands`       Get all brands
  `GET`      `/api/brands/:id`   Get a brand by ID
  `POST`     `/api/brands`       Create a brand
  `PUT`      `/api/brands/:id`   Update a brand
  `DELETE`   `/api/brands/:id`   Delete a brand

A brand contains:

-   `id`
-   `name`
-   `createdAt`
-   `updatedAt`

The `name` field is required when creating a brand.

## API Request Flow

The following Mermaid diagram shows how requests travel through the
application.

``` mermaid
flowchart LR
    U[User] --> F[React Frontend]
    F -->|HTTP request| API[Express REST API]

    API --> BR[/api/brands]
    API --> BI[/api/bicycles]

    BR --> BC[Brand Controller]
    BI --> BIC[Bicycle Controller]

    BC --> BS[Brand Service]
    BIC --> BIS[Bicycle Service]

    BS --> S[Sequelize ORM]
    BIS --> S

    S --> DB[(MySQL)]

    DB --> S
    S --> BS
    S --> BIS
    BS --> BC
    BIS --> BIC
    BC --> API
    BIC --> API
    API -->|JSON response| F
```

## Bicycle Queries

``` mermaid
flowchart TD
    A[/api/bicycles] --> B{HTTP Method}

    B -->|GET| C[Get all bicycles]
    B -->|POST| D[Create bicycle]

    E[/api/bicycles/:id] --> F{HTTP Method}
    F -->|GET| G[Get bicycle by ID]
    F -->|PUT| H[Update bicycle]
    F -->|DELETE| I[Delete bicycle]

    J[/api/bicycles/eagerly/:id] --> K[Get bicycle with Brand]

    C --> S[Bicycle Service]
    D --> S
    G --> S
    H --> S
    I --> S
    K --> S

    S --> ORM[Sequelize]
    ORM --> DB[(MySQL)]
```

## Brand Queries

``` mermaid
flowchart TD
    A[/api/brands] --> B{HTTP Method}

    B -->|GET| C[Get all brands]
    B -->|POST| D[Create brand]

    E[/api/brands/:id] --> F{HTTP Method}
    F -->|GET| G[Get brand by ID]
    F -->|PUT| H[Update brand]
    F -->|DELETE| I[Delete brand]

    C --> S[Brand Service]
    D --> S
    G --> S
    H --> S
    I --> S

    S --> ORM[Sequelize]
    ORM --> DB[(MySQL)]
```

## Database Model

A brand can have many bicycles, while each bicycle belongs to one brand.

The foreign key is `bicycles.brandId`, which references `brands.id`.
Updates are configured with `CASCADE`, while deletion of a referenced
brand is restricted with `RESTRICT`.

``` mermaid
erDiagram
    BRAND ||--o{ BICYCLE : has

    BRAND {
        INT id PK
        VARCHAR_150 name
        DATE createdAt
        DATE updatedAt
    }

    BICYCLE {
        INT id PK
        INT brandId FK
        VARCHAR_150 model
        TEXT description
        DECIMAL_10_2 price
        INT stock
        DATE createdAt
        DATE updatedAt
    }
```

## Eager Loading Query

The project includes an endpoint that retrieves a bicycle together with
its associated brand.

``` http
GET /api/bicycles/eagerly/:id
```

Internally, Sequelize performs the query using the `Brand` model through
the `brand` association.

``` mermaid
sequenceDiagram
    participant C as Client
    participant R as Bicycle Route
    participant CT as Bicycle Controller
    participant S as Bicycle Service
    participant O as Sequelize
    participant DB as MySQL

    C->>R: GET /api/bicycles/eagerly/:id
    R->>CT: getEagerlyById
    CT->>S: findEagerlyById(id)
    S->>O: findByPk + include Brand
    O->>DB: Query bicycle and associated brand
    DB-->>O: Bicycle + Brand data
    O-->>S: Bicycle model with brand
    S-->>CT: Bicycle with Brand
    CT-->>C: JSON response
```

## Postman

The API can be tested using the existing Postman documentation:

https://documenter.getpostman.com/view/58320211/2sBYB4L76J

The Postman collection can be used to test the available bicycle and
brand endpoints.

## Running the Tests

The project currently does not include an automated test suite or a
`test` script in its package configuration.

API functionality can be tested manually using Postman and the frontend
interface.

The frontend includes a lint command:

``` bash
cd frontend
npm run lint
```

## Deployment

Build the backend:

``` bash
cd backend
npm run build
```

The compiled backend can then be started with:

``` bash
npm start
```

Build the frontend:

``` bash
cd frontend
npm run build
```

The frontend production build can be previewed locally with:

``` bash
npm run preview
```

Before deploying the application, configure the production environment
variables and MySQL connection correctly.

The following backend configuration must also be changed or carefully
reviewed before using persistent production data:

``` typescript
sequelize.sync({ force: true })
```

Using `force: true` recreates the tables when the application starts.

## Built With

### Backend

-   TypeScript
-   Node.js
-   Express 5
-   Sequelize 6
-   MySQL / mysql2
-   CORS
-   dotenv
-   tsx

### Frontend

-   TypeScript
-   React 19
-   Vite
-   Tailwind CSS
-   Oxlint

### Development and API tools

-   Git
-   npm
-   Postman

## Project Structure

The main application structure is organized as follows:

``` text
bicycle-shop-dsw-develop/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── modules/
│   │   │   ├── bicycles/
│   │   │   └── brands/
│   │   ├── routes/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── features/
│   │   │   └── bicycles/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── pages/
│   │   │       ├── services/
│   │   │       └── types/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Contributing

There is currently no separate `CONTRIBUTING.md` file in the project.

A typical contribution workflow is:

1.  Create a new branch from the main development branch.
2.  Make the required changes.
3.  Verify that the backend and frontend run correctly.
4.  Run the available lint checks.
5.  Commit the changes with a clear description.
6.  Open a Pull Request for review.

## Versioning

Git is used for version control.

Repository history and releases, when available, can be used to track
project versions and changes.

## Authors

-   **Victor Manuel Garcia Batista** --- Author and developer.

## Contributors

-   **Tiburcio Cruz Ravelo** --- Contributor.

## License

The backend `package.json` currently declares the **ISC** license.

If the repository is going to be distributed publicly, adding a
dedicated `LICENSE` file is recommended so that the licensing terms are
clearly available at repository level.

## Acknowledgments

-   README structure based on the README template by PurpleBooth.
-   Official documentation for the technologies used in the project.
-   Thanks to everyone who contributed to the development and
    improvement of the project.
