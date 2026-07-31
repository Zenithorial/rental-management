# Rental Management Backend

## Instructions for running the application

### Prerequisites

- Node.js
- Docker & Docker Compose
- npm

### Installation

```bash
npm install
```

### Start PostgreSQL

```bash
docker compose up -d
```

### Configure environment

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:9005/rental_management?schema=public"
JWT_SECRET=<your_secret>
```

### Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### Start the application

```bash
npm run start:dev
```

---

## Database setup instructions

- PostgreSQL is run using Docker Compose.
- Prisma ORM is used for database access.
- Run `npx prisma db push` to create/update the schema.

---

## Assumptions and Design Decisions

- The system has three user roles: ADMIN, OWNER, and MANAGER
- Each property has one owner and one assigned manager
- A rental unit belongs to exactly one property
- 'PUT' endpoints were used for updates
- The project follows NestJS's modular architecture

### Modules

UsersModule,
PrismaModule,
AuthModule,
PropertiesModule,
UnitsModule,
TenantsModule

### Authentication and authorization

- JWT Authentication
- Role-based authorization using Guards
- Only the admin is able to create users

### Roles

- Admin - Manages everything
- Owner - Can only manage their own properties
- Manager - Can only manage properties assigned to them

### Relationships

- One Owner = Many Properties
- One Manager = Many Assigned Properties
- One Property = Many Rental Units
- One Rental Unit = Many Tenants

---

## Available API Endpoints

### Authentication and users

- POST `/auth/login` -Authenticate and receive JWT
- GET `/users` -Fetch users (Admin only)
- GET `/users/me` -Fetch own user
- GET `/users/:id` -Fetch user by id
- POST `/users` -Creates new user
- PUT `/users/edit` -Edits user's own properties
- PUT `/users/:id` -Edits any user's properties (Admin only)
- DELETE `/users/:id` -Deletes a user (Admin only)

### Properties

- GET `/properties` -Gets all properties handled by the user
- GET `/properties/:id` -Gets property by id (only if the property is handled by the user)
- POST `/properties` -Create property (Admin and owner)
- PUT `/properties/:id` -Update property
- PUT `/properties/:id/transfer-ownership` -Transfer property ownership (Admin only)
- PUT `/properties/:id/transfer-management` -Transfer property management (Admin and owner)
- DELETE `/properties/:id` -Delete property (Admin and owner)

### Units

- GET `/units` -List units under property handled by user
- GET `/units/:id` -Get unit by id (only if property is handled by the user)
- POST `/units` -Create new unit in a property
- PUT `/units/:id` -Updates a unit
- DELETE `/units/:id` -Delete unit (Admin and owner)

### Tenants

- GET `/tenants` -List tenants under property handled by user
- GET `/tenants/:id` -Get tenant by id (only if property is handled by the user)
- POST `/tenants` -Add tenant (Sets units to OCCUPIED)
- PUT `/tenants/:id` -Update tenant
- DELETE `/tenants/:id` -Remove tenant

---

## Known Limitations

- Lease agreements are not implemented
- Payment management is not implemented
- Maintenance requests are not implemented
- Unit occupancy is simplified by assigning tenants directly to rental units

---

## Improvements with more time

- Implement lease agreements
- Implement payment tracking
- Support multiple managers per property
- Improve validation and error handling
- Add automated tests
- Add Swagger or OpenAPI documentation
- Better infrastructure

---

## AI Usage

- AI Tools Used: Gemini & ChatGPT

- How AI Assisted: Helped structure REST routes, generated initial Prisma service logic, and taught me things as a beginner.

2 AI Suggestions Modified or Rejected:

- Rejected Deep Route Nesting: AI suggested nested routes like POST /properties/:propertyId/units/:unitId/tenants. I rejected this in favor of shallow routes (POST /tenants passing unitId in the body) for cleaner URLs.

- Supporting Multiple Managers per Property: AI suggested using a many-to-many relationship so multiple managers could manage a single property. I simplified the design by assigning only one managerId per property to reduce complexity, and due to time constraints.

Verification Process: Inspected all generated code, compiled and tested endpoints via API clients (Postman), and verified database state changes directly using Prisma Studio.
