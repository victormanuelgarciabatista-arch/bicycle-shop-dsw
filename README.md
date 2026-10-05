# Bicycle Shop

A full-stack learning project for managing a bicycle shop through a REST API and a React user interface.

The backend is built with TypeScript, Node.js, Express, Sequelize, and MySQL. The frontend is built with TypeScript, React, Vite, and Tailwind CSS. The project provides CRUD operations for **bicycles**, **brands**, **bicycle technical details**, **customers**, and **orders**, as well as queries that use Sequelize associations (eager loading), such as a bicycle with its brand, bicycles filtered by frame material, and customers searched by name together with their orders.

## Table of Contents

- [Getting Started](#getting-started)
- [API](#api)
- [API Request Flow](#api-request-flow)
- [Queries by Resource](#queries-by-resource)
- [Database Model](#database-model)
- [Eager Loading Queries](#eager-loading-queries)
- [Example Requests](#example-requests)
- [Postman](#postman)
- [Known Issues](#known-issues)
- [Running the Tests](#running-the-tests)
- [Deployment](#deployment)
- [Built With](#built-with)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Versioning](#versioning)
- [Authors](#authors)
- [Contributors](#contributors)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Getting Started

These instructions will help you set up and run the project locally for development and testing.

### Prerequisites

Make sure the following software is installed:

- Git
- Node.js with npm
- MySQL
- Postman (recommended for testing the API)

A Node.js version compatible with the installed Vite version is required.

### Installing

Clone the repository and enter the project directory:

```bash
git clone <REPOSITORY_URL>
cd bicycle-shop-dsw-entrega-4
```

The project contains two applications:

```text
bicycle-shop-dsw-entrega-4/
├── backend/
├── frontend/
└── README.md
```

### Database setup

Start MySQL and create the database:

```sql
CREATE DATABASE IF NOT EXISTS db_bicycle_shop
CHARACTER SET utf8mb4;
```

The configured MySQL user must have permission to access the database and create its tables. The tables (`brands`, `bicycles`, `bicycle_details`, `Customers`, and `orders`) are created automatically by Sequelize when the backend starts.

### Backend configuration

Create a `.env` file inside `backend/`. Use `backend/.env.example` as a reference:

```dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_bicycle_shop
DB_USER=your-database-username
DB_PASSWORD=your-database-password
```

Replace `DB_USER` and `DB_PASSWORD` with your MySQL credentials.

> **Note:** if a variable is missing, `backend/src/config/env.ts` falls back to default values (`PORT=3000`, `DB_HOST=localhost`, `DB_PORT=3306`, `DB_USER=root`, an empty password, and `DB_NAME=dsw_products`). The default database name is **not** the same as the one in `.env.example`, so always define `DB_NAME` explicitly.

Install the backend dependencies:

```bash
cd backend
npm ci
```

Start the backend in development mode:

```bash
npm run dev
```

The server runs by default at:

```text
http://localhost:3000
```

The API base URL is:

```text
http://localhost:3000/api
```

The root endpoint can be used to verify that the API is running:

```http
GET /
```

Response:

```json
{
  "message": "API working"
}
```

> **Important:** the current backend uses `sequelize.sync({ force: true })`. Every time the backend starts, Sequelize drops and recreates the database tables, so existing data is deleted. This setting should be reviewed before using persistent or production data.

### Frontend configuration

Create a `.env` file inside `frontend/`. Use `frontend/.env.example` as a reference:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

Install the frontend dependencies:

```bash
cd frontend
npm ci
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

> **Note:** the frontend currently only contains the bicycle listing and management screen. Brands, bicycle details, customers, and orders are available through the API only. See [Known Issues](#known-issues) for the current frontend/backend mismatch.

## API

The backend exposes REST endpoints for bicycles, brands, bicycle details, customers, and orders. All of them are served under the `/api` prefix.

```mermaid
flowchart LR
    API["Express REST API<br/>/api"]

    API --> R1["/api/bicycles"]
    API --> R2["/api/brands"]
    API --> R3["/api/bicycle-details"]
    API --> R4["/api/customers"]
    API --> R5["/api/orders"]

    classDef root fill:#e0e7ff,stroke:#4338ca,color:#1e1b4b
    classDef res fill:#f3f4f6,stroke:#6b7280,color:#111827
    class API root
    class R1,R2,R3,R4,R5 res
```

In the endpoint diagrams below, each box is one endpoint (one row of the former tables). Colors indicate the HTTP method:

- Green: `GET`
- Blue: `POST`
- Amber: `PUT`
- Red: `DELETE`

### Bicycle endpoints

```mermaid
flowchart LR
    subgraph BICYCLES["Bicycle endpoints"]
        direction TB
        B1["<b>GET</b> /api/bicycles<br/><i>Get all bicycles</i>"]:::get
        B2["<b>GET</b> /api/bicycles/:id<br/><i>Get a bicycle by ID</i>"]:::get
        B3["<b>GET</b> /api/bicycles/eagerly/:id<br/><i>Get a bicycle by ID including its brand</i>"]:::get
        B4["<b>GET</b> /api/bicycles/eagerly/frame-material/:frameMaterial<br/><i>Get bicycles whose detail matches a frame material</i>"]:::get
        B5["<b>POST</b> /api/bicycles<br/><i>Create a bicycle</i>"]:::post
        B6["<b>PUT</b> /api/bicycles/:id<br/><i>Update a bicycle</i>"]:::put
        B7["<b>DELETE</b> /api/bicycles/:id<br/><i>Delete a bicycle</i>"]:::del
        B1 ~~~ B2 ~~~ B3 ~~~ B4 ~~~ B5 ~~~ B6 ~~~ B7
    end

    classDef get fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef post fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef put fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef del fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

A bicycle contains the following fields:

- `id`
- `brandId`
- `model`
- `description`
- `price`
- `stock`
- `createdAt`
- `updatedAt`

When creating a bicycle, `brandId`, `model`, and `price` are required by the controller. `stock` defaults to `0` at model level when it is not supplied.

### Brand endpoints

```mermaid
flowchart LR
    subgraph BRANDS["Brand endpoints"]
        direction TB
        R1["<b>GET</b> /api/brands<br/><i>Get all brands</i>"]:::get
        R2["<b>GET</b> /api/brands/:id<br/><i>Get a brand by ID</i>"]:::get
        R3["<b>POST</b> /api/brands<br/><i>Create a brand</i>"]:::post
        R4["<b>PUT</b> /api/brands/:id<br/><i>Update a brand</i>"]:::put
        R5["<b>DELETE</b> /api/brands/:id<br/><i>Delete a brand</i>"]:::del
        R1 ~~~ R2 ~~~ R3 ~~~ R4 ~~~ R5
    end

    classDef get fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef post fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef put fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef del fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

A brand contains:

- `id`
- `name`
- `createdAt`
- `updatedAt`

The `name` field is required when creating a brand.

A brand that still has bicycles cannot be deleted (`ON DELETE RESTRICT`); the request fails until its bicycles are removed or moved to another brand.

### Bicycle detail endpoints

```mermaid
flowchart LR
    subgraph DETAILS["Bicycle detail endpoints"]
        direction TB
        D1["<b>GET</b> /api/bicycle-details<br/><i>Get all bicycle details</i>"]:::get
        D2["<b>GET</b> /api/bicycle-details/:id<br/><i>Get a bicycle detail by ID</i>"]:::get
        D3["<b>GET</b> /api/bicycle-details/eagerly/:id<br/><i>Eager-loading endpoint currently present in the backend</i>"]:::get
        D4["<b>POST</b> /api/bicycle-details<br/><i>Create a bicycle detail</i>"]:::post
        D5["<b>PUT</b> /api/bicycle-details/:id<br/><i>Update a bicycle detail</i>"]:::put
        D6["<b>DELETE</b> /api/bicycle-details/:id<br/><i>Delete a bicycle detail</i>"]:::del
        D1 ~~~ D2 ~~~ D3 ~~~ D4 ~~~ D5 ~~~ D6
    end

    classDef get fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef post fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef put fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef del fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

A bicycle detail contains:

- `id`
- `bicycleId`
- `frameMaterial`
- `wheelSize`
- `weight`
- `suspension`
- `createdAt`
- `updatedAt`

The accepted `frameMaterial` values are:

- `Aluminum`
- `Carbon`
- `Steel`
- `Titanium`

When creating a bicycle detail, `bicycleId`, `frameMaterial`, `wheelSize`, and `weight` are required by the controller. `suspension` is optional.

The `bicycleId` field is unique, enforcing one technical-detail record per bicycle.

> **Implementation note:** `/api/bicycle-details/eagerly/:id` exists in the current routes, but its service currently includes `BicycleDetail` itself using the alias `bicycleDetail`. The defined association is instead `BicycleDetail.belongsTo(Bicycle, { as: "bicycle" })`. The endpoint should therefore be reviewed before relying on its eager-loading response.

### Customer endpoints

```mermaid
flowchart LR
    subgraph CUSTOMERS["Customer endpoints"]
        direction TB
        C1["<b>GET</b> /api/customers<br/><i>Get all customers</i>"]:::get
        C2["<b>GET</b> /api/customers/:name_search/orders<br/><i>Search customers by name and include their orders</i>"]:::get
        C3["<b>GET</b> /api/customers/:id<br/><i>Get a customer by ID</i>"]:::get
        C4["<b>POST</b> /api/customers<br/><i>Create a customer</i>"]:::post
        C5["<b>PUT</b> /api/customers/:id<br/><i>Update a customer</i>"]:::put
        C6["<b>DELETE</b> /api/customers/:id<br/><i>Delete a customer</i>"]:::del
        C1 ~~~ C2 ~~~ C3 ~~~ C4 ~~~ C5 ~~~ C6
    end

    classDef get fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef post fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef put fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef del fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

A customer contains:

- `id`
- `name`
- `email`
- `createdAt`
- `updatedAt`

When creating a customer, `name` and `email` are required by the controller. The `email` field is unique.

`GET /api/customers/:name_search/orders` performs a partial, `LIKE`-based search on the customer name (for example, `jua` matches `Juan`). It uses an inner join, so **only customers that have at least one order are returned**, each with an `orders` array.

Deleting a customer also deletes all of their orders (`ON DELETE CASCADE`).

### Order endpoints

```mermaid
flowchart LR
    subgraph ORDERS["Order endpoints"]
        direction TB
        O1["<b>GET</b> /api/orders<br/><i>Get all orders</i>"]:::get
        O2["<b>GET</b> /api/orders/customers/:id<br/><i>Get the orders of a customer, newest first</i>"]:::get
        O3["<b>GET</b> /api/orders/:id<br/><i>Get an order by ID</i>"]:::get
        O4["<b>POST</b> /api/orders<br/><i>Create an order</i>"]:::post
        O5["<b>PUT</b> /api/orders/:id<br/><i>Update an order</i>"]:::put
        O6["<b>DELETE</b> /api/orders/:id<br/><i>Delete an order</i>"]:::del
        O1 ~~~ O2 ~~~ O3 ~~~ O4 ~~~ O5 ~~~ O6
    end

    classDef get fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef post fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef put fill:#fef3c7,stroke:#d97706,color:#78350f
    classDef del fill:#fee2e2,stroke:#dc2626,color:#7f1d1d
```

An order contains:

- `id`
- `customerId`
- `orderDate`
- `status`
- `createdAt`
- `updatedAt`

The accepted `status` values are:

- `pending`
- `paid`
- `shipped`
- `cancelled`

When creating an order, `customerId`, `orderDate`, and `status` are required by the controller. Although the model defines defaults (`orderDate` = current date and `status` = `pending`), the controller currently rejects requests that omit them.

`GET /api/orders/customers/:id` returns the orders of one customer sorted by `orderDate` in descending order, and includes the customer's `id`, `name`, and `email`.

> **Note:** orders are not yet linked to bicycles. An order only stores its customer, date, and status; there are no order lines.

## API Request Flow

```mermaid
flowchart LR
    U[User] --> F[React Frontend]
    F -->|HTTP request| API[Express REST API]

    API --> BR["/api/brands"]
    API --> BI["/api/bicycles"]
    API --> BD["/api/bicycle-details"]
    API --> CU["/api/customers"]
    API --> OR["/api/orders"]

    BR --> BC[Brand Controller]
    BI --> BIC[Bicycle Controller]
    BD --> BDC[Bicycle Detail Controller]
    CU --> CC[Customer Controller]
    OR --> OC[Order Controller]

    BC --> BS[Brand Service]
    BIC --> BIS[Bicycle Service]
    BDC --> BDS[Bicycle Detail Service]
    CC --> CS[Customer Service]
    OC --> OS[Order Service]

    BS --> ORM[Sequelize ORM]
    BIS --> ORM
    BDS --> ORM
    CS --> ORM
    OS --> ORM
    ORM --> DB[(MySQL)]

    DB --> ORM
    ORM --> API
    API -->|JSON response| F
```

Requests that do not match any route receive a `404` response (`Ruta no encontrada`), and unhandled errors are caught by the error middleware, which returns a `500` response (`Error interno del servidor`).

## Queries by Resource

### Bicycle Queries

```mermaid
flowchart TD
    A["/api/bicycles"] --> B{HTTP Method}
    B -->|GET| C[Get all bicycles]
    B -->|POST| D[Create bicycle]

    E["/api/bicycles/:id"] --> F{HTTP Method}
    F -->|GET| G[Get bicycle by ID]
    F -->|PUT| H[Update bicycle]
    F -->|DELETE| I[Delete bicycle]

    J["/api/bicycles/eagerly/:id"] --> K[Get bicycle with Brand]
    L["/api/bicycles/eagerly/frame-material/:frameMaterial"] --> M[Filter bicycles by BicycleDetail frameMaterial]

    C --> S[Bicycle Service]
    D --> S
    G --> S
    H --> S
    I --> S
    K --> S
    M --> S

    S --> ORM[Sequelize]
    ORM --> DB[(MySQL)]
```

### Brand Queries

```mermaid
flowchart TD
    A["/api/brands"] --> B{HTTP Method}
    B -->|GET| C[Get all brands]
    B -->|POST| D[Create brand]

    E["/api/brands/:id"] --> F{HTTP Method}
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

### Bicycle Detail Queries

```mermaid
flowchart TD
    A["/api/bicycle-details"] --> B{HTTP Method}
    B -->|GET| C[Get all bicycle details]
    B -->|POST| D[Create bicycle detail]

    E["/api/bicycle-details/:id"] --> F{HTTP Method}
    F -->|GET| G[Get bicycle detail by ID]
    F -->|PUT| H[Update bicycle detail]
    F -->|DELETE| I[Delete bicycle detail]

    J["/api/bicycle-details/eagerly/:id"] --> K[Eager-loading endpoint present in current code]

    C --> S[Bicycle Detail Service]
    D --> S
    G --> S
    H --> S
    I --> S
    K --> S

    S --> ORM[Sequelize]
    ORM --> DB[(MySQL)]
```

### Customer Queries

```mermaid
flowchart TD
    A["/api/customers"] --> B{HTTP Method}
    B -->|GET| C[Get all customers]
    B -->|POST| D[Create customer]

    E["/api/customers/:id"] --> F{HTTP Method}
    F -->|GET| G[Get customer by ID]
    F -->|PUT| H[Update customer]
    F -->|DELETE| I[Delete customer]

    J["/api/customers/:name_search/orders"] --> K[Search customers by name with their Orders]

    C --> S[Customer Service]
    D --> S
    G --> S
    H --> S
    I --> S
    K --> S

    S --> ORM[Sequelize]
    ORM --> DB[(MySQL)]
```

### Order Queries

```mermaid
flowchart TD
    A["/api/orders"] --> B{HTTP Method}
    B -->|GET| C[Get all orders]
    B -->|POST| D[Create order]

    E["/api/orders/:id"] --> F{HTTP Method}
    F -->|GET| G[Get order by ID]
    F -->|PUT| H[Update order]
    F -->|DELETE| I[Delete order]

    J["/api/orders/customers/:id"] --> K[Get orders of a customer with Customer data]

    C --> S[Order Service]
    D --> S
    G --> S
    H --> S
    I --> S
    K --> S

    S --> ORM[Sequelize]
    ORM --> DB[(MySQL)]
```

## Database Model

The current Sequelize associations define:

- One `Brand` can have many `Bicycle` records.
- Each `Bicycle` belongs to one `Brand`.
- One `Bicycle` can have one `BicycleDetail`.
- Each `BicycleDetail` belongs to one `Bicycle`.
- One `Customer` can have many `Order` records.
- Each `Order` belongs to one `Customer`.

Referential actions of the generated foreign keys:

- `bicycles.brandId` → `brands.id`: `ON UPDATE CASCADE`, `ON DELETE RESTRICT`.
- `bicycle_details.bicycleId` → `bicycles.id`: `ON UPDATE CASCADE`, `ON DELETE CASCADE`.
- `orders.customerId` → `Customers.id`: `ON UPDATE CASCADE`, `ON DELETE CASCADE`.

```mermaid
erDiagram
    BRAND ||--o{ BICYCLE : "has (delete RESTRICT)"
    BICYCLE ||--o| BICYCLE_DETAIL : "has (delete CASCADE)"
    CUSTOMER ||--o{ ORDERS : "places (delete CASCADE)"

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

    BICYCLE_DETAIL {
        INT id PK
        INT bicycleId FK, UK
        ENUM frameMaterial
        DECIMAL_4_1 wheelSize
        DECIMAL_5_2 weight
        VARCHAR_80 suspension
        DATE createdAt
        DATE updatedAt
    }

    CUSTOMER {
        INT id PK
        VARCHAR_150 name
        VARCHAR_160 email UK
        DATE createdAt
        DATE updatedAt
    }

    ORDERS {
        INT id PK
        INT customerId FK
        DATE orderDate
        ENUM status
        DATE createdAt
        DATE updatedAt
    }
```

> **Table names:** the MySQL tables are `brands`, `bicycles`, `bicycle_details`, `orders`, and `Customers`. The customers table is the only one with a capitalized name. On case-sensitive systems (for example, MySQL on Linux), always write it as `Customers` in manual SQL queries.

## Eager Loading Queries

### Bicycle with its brand

The project can retrieve a bicycle together with its associated brand:

```http
GET /api/bicycles/eagerly/:id
```

```mermaid
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
    S->>O: Bicycle.findByPk + include Brand as brand
    O->>DB: Query bicycle and associated brand
    DB-->>O: Bicycle + Brand data
    O-->>S: Bicycle with brand
    S-->>CT: Result
    CT-->>C: JSON response
```

### Bicycles filtered by frame material

The project also performs an eager-loading query against `BicycleDetail` and filters the joined detail by `frameMaterial`:

```http
GET /api/bicycles/eagerly/frame-material/:frameMaterial
```

For example:

```http
GET /api/bicycles/eagerly/frame-material/Carbon
```

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Bicycle Route
    participant CT as Bicycle Controller
    participant S as Bicycle Service
    participant O as Sequelize
    participant DB as MySQL

    C->>R: GET /api/bicycles/eagerly/frame-material/Carbon
    R->>CT: getAllEagerlyByFrameMaterial
    CT->>S: findAllEagerlyByFrameMaterial("Carbon")
    S->>O: Bicycle.findAll + include detail + where frameMaterial
    O->>DB: Query bicycles joined with bicycle_details
    DB-->>O: Matching bicycles and details
    O-->>S: Filtered bicycle list
    S-->>CT: Result
    CT-->>C: JSON response
```

### Customers searched by name with their orders

The project can search customers by a partial name and return them together with their orders:

```http
GET /api/customers/:name_search/orders
```

For example:

```http
GET /api/customers/jua/orders
```

Because the include uses `required: true`, customers without orders are not part of the result.

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Customer Route
    participant CT as Customer Controller
    participant S as Customer Service
    participant O as Sequelize
    participant DB as MySQL

    C->>R: GET /api/customers/jua/orders
    R->>CT: getCustomersWithOrdersByNameSearch
    CT->>S: findCustomersWithOrdersByNameSearch("jua")
    S->>O: Customer.findAll + where name LIKE %jua% + include Order as orders (required)
    O->>DB: Query customers INNER JOIN orders
    DB-->>O: Matching customers and their orders
    O-->>S: Customers with orders
    S-->>CT: Result
    CT-->>C: JSON response
```

### Orders of a customer

The project can retrieve all the orders of a customer, including basic customer data:

```http
GET /api/orders/customers/:id
```

For example:

```http
GET /api/orders/customers/1
```

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Order Route
    participant CT as Order Controller
    participant S as Order Service
    participant O as Sequelize
    participant DB as MySQL

    C->>R: GET /api/orders/customers/1
    R->>CT: getByCustomerId
    CT->>S: findByCustomerId(1)
    S->>O: Order.findAll + where customerId + include Customer as customer + order by orderDate DESC
    O->>DB: Query orders joined with Customers
    DB-->>O: Orders + customer id, name and email
    O-->>S: Order list
    S-->>CT: Result
    CT-->>C: JSON response
```

## Example Requests

Create a brand (it must exist before creating bicycles):

```http
POST /api/brands
Content-Type: application/json

{
  "name": "bh"
}
```

Create a bicycle:

```http
POST /api/bicycles
Content-Type: application/json

{
  "brandId": 1,
  "model": "Sky",
  "description": "Great for any occasion",
  "price": 189.99,
  "stock": 10
}
```

Create a bicycle detail:

```http
POST /api/bicycle-details
Content-Type: application/json

{
  "bicycleId": 1,
  "frameMaterial": "Steel",
  "wheelSize": 29,
  "weight": 4,
  "suspension": "Front"
}
```

Create a customer:

```http
POST /api/customers
Content-Type: application/json

{
  "name": "Juan",
  "email": "juan@gmail.com"
}
```

Create an order for that customer:

```http
POST /api/orders
Content-Type: application/json

{
  "customerId": 1,
  "orderDate": "2026-10-01T18:50:00.000Z",
  "status": "pending"
}
```

## Postman

The API can be tested using the existing Postman documentation:

https://documenter.getpostman.com/view/58320211/2sBYB4L76J

The Postman documentation can be used alongside the endpoint reference in this README to test the API.

The repository also includes the request collection in `backend/docs/`:

- `bicycle-shop-in-the-classroom.postman_collection.json`: Postman collection that can be imported directly into Postman.
- `bicycle-shop-in-the-classroom/`: the same requests as an OpenCollection folder of YAML files, grouped by `bicycles`, `bicyclesDetails`, `brands`, `customers`, and `orders`.

## Known Issues

These points were found while reviewing the current code. They do not prevent the API from starting, but they should be reviewed before using the project beyond local development:

- **Data loss on startup:** `sequelize.sync({ force: true })` drops and recreates all tables every time the backend starts.
- **Frontend and backend are out of sync:** the frontend sends and displays a text field named `brand`, while the backend expects `brandId` and returns bicycles without the brand name. Creating or editing a bicycle from the UI is rejected by the API (`brandId` is required), and the list cannot show the brand until the frontend uses `brandId` or the API includes the brand in the response.
- **Broken eager-loading endpoint:** `GET /api/bicycle-details/eagerly/:id` includes the wrong model/alias (see the implementation note in [Bicycle detail endpoints](#bicycle-detail-endpoints)).
- **Typo in an error response:** `GET /api/bicycles/eagerly/:id` returns `{ "messsage": "Bicycle not found" }` (three `s`) instead of `message` when the bicycle does not exist.
- **Generic database errors:** a duplicate customer email, deleting a brand that still has bicycles, or creating a record with a non-existent foreign key is not handled specifically; the error middleware answers with a generic `500` response instead of a `400`/`409`.
- **Weak validation on bicycle details:** the controller requires `frameMaterial`, `wheelSize`, and `weight`, but those columns are nullable at database level.
- **Mixed languages in API messages:** most messages are in English, while the validation message for bicycles and the `404`/`500` middleware messages are in Spanish.
- **Orders without items:** an order cannot yet reference any bicycle.

## Running the Tests

The project currently does not include an automated test suite or a `test` script in its package configuration.

API functionality can be tested manually using Postman and the frontend interface.

The frontend includes a lint command:

```bash
cd frontend
npm run lint
```

## Deployment

Build the backend:

```bash
cd backend
npm run build
```

Start the compiled backend:

```bash
npm start
```

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the frontend production build locally:

```bash
npm run preview
```

Before deploying, configure the production environment variables and MySQL connection correctly.

The following backend configuration must also be reviewed before using persistent production data:

```typescript
sequelize.sync({ force: true })
```

Using `force: true` recreates the tables when the application starts.

## Built With

### Backend

- TypeScript
- Node.js
- Express 5
- Sequelize 6
- MySQL / mysql2
- CORS
- dotenv
- tsx

### Frontend

- TypeScript
- React 19
- Vite 8
- Tailwind CSS 4
- Oxlint

### Development and API tools

- Git
- npm
- Postman
- Mermaid (diagrams in this README)

## Project Structure

```text
bicycle-shop-dsw-entrega-4/
│
├── backend/
│   ├── docs/
│   │   ├── bicycle-shop-in-the-classroom/
│   │   └── bicycle-shop-in-the-classroom.postman_collection.json
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── models/
│   │   │   └── associations.ts
│   │   ├── modules/
│   │   │   ├── bicycle-details/
│   │   │   ├── bicycles/
│   │   │   ├── brands/
│   │   │   ├── customers/
│   │   │   └── orders/
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

Each backend module (`bicycle-details`, `bicycles`, `brands`, `customers`, and `orders`) follows the same layered structure:

```text
<module>/
├── <name>.model.ts        # Sequelize model
├── <name>.service.ts      # Database queries
├── <name>.controller.ts   # Validation and HTTP responses
└── <name>.routes.ts       # Express routes
```

## Contributing

There is currently no separate `CONTRIBUTING.md` file in the project.

A typical contribution workflow is:

1. Create a new branch from the main development branch.
2. Make the required changes.
3. Verify that the backend and frontend run correctly.
4. Run the available lint checks.
5. Commit the changes with a clear description.
6. Open a Pull Request for review.

## Versioning

Git is used for version control.

Repository history and releases, when available, can be used to track project versions and changes.

## Authors

- **Victor Manuel Garcia Batista** — Author and developer.

## Contributors

- **Tiburcio Cruz Ravelo** — Contributor and Teacher.

## License

The backend `package.json` currently declares the **ISC** license.

If the repository is distributed publicly, adding a dedicated `LICENSE` file is recommended so the licensing terms are clearly available at repository level.

## Acknowledgments

- README structure based on the README template by PurpleBooth.
- Official documentation for the technologies used in the project.
- Thanks to everyone who contributed to the development and improvement of the project.
