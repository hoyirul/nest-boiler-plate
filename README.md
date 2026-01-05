# Nest Boiler Plate
> A boilerplate project for building scalable and maintainable server-side applications using NestJS framework.

## Pre-Requisites
Before running this project, make sure you have the following installed:

- Node.js v18 or higher
  Required to run the NestJS application.
- npm v8 or higher
  Used as the package manager.
- Database
  One of the supported databases:
  - PostgreSQL (recommended)
  - MySQL
  - SQLite
  Used together with Drizzle ORM.
  NestJS CLI (optional)
  Helpful for development and code generation.
  `npm install -g @nestjs/cli`
- Redis (optional)
  Required only if caching, queues, or session management is enabled.
- Plop (optional)
  Used for code generation with Neptune CLI.
  `npm install -g plop`

## Technologies Used
- [NestJS](https://nestjs.com/)
- [Drizzle ORM](https://drizzle.team/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL/MySQL/SQLite](https://www.postgresql.org/, https://www.mysql.com/, https://www.sqlite.org/)
- [Redis](https://redis.io/) (optional)

## Project Structure
```
src
├── core
│   ├── config          # Global configuration
│   └── db
│       ├── schema      # Database schemas (Drizzle)
│       ├── check.db.ts # DB connection checker
│       ├── seed.db.ts  # Seeder database
│       ├── db-registry.ts
│       └── index.ts
│
├── modules
│   └── v1
│       ├── auth
│       ├── department
│       ├── division
│       ├── example
│       │   ├── controllers
│       │   ├── domains
│       │   │   ├── example.dto.ts
│       │   │   ├── example.entity.ts
│       │   │   └── example.types.ts
│       │   ├── repositories
│       │   ├── usecases
│       │   │   └── example.usecase.ts
│       │   └── example.module.ts
│       ├── permission
│       ├── position
│       ├── role
│       └── user
│
└── shared               # Shared utilities/helpers
    ├── constants
    ├── decorators
    ├── exceptions
    ├── filters
    ├── guards
    ├── interceptors
    └── utils
```

## Instalation
1. Clone the repository:
   ```bash
    git clone <repository_url>
    cd nest-boiler-plate
    cp .env.example .env
    npm run neptune:generate # Generate APP KEY and JWT_SECRET
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory and configure the necessary environment variables as per your setup.
4. Run database migrations:
   ```bash 
   npm run db:migrate # Make sure to have your database running and configured in the .env file
   npm run db:seed # (optional) Seed the database with initial data
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

## Usage
- The server will be running at `http://localhost:3000` by default.
- You can access the API endpoints as defined in the modules.

## Additional Scripts
- `npm run storage:link`: Create symbolic link for storage folder.
- `npm run db:seed`: Seed the database with initial data.
- `npm run db:check`: Check the database connection.
- `npm run db:generate`: Generate Drizzle schema.
- `npm run db:pull`: Pull database schema changes.
- `npm run db:push`: Push database schema changes.
- `npm run neptune:generate`: Generate application keys and secrets.
- `npm run neptune:module`: Generate a new module using Neptune CLI.

## Neptune
> Neptune is a CLI tool to help you generate boilerplate code for your NestJS application.

- Make some module using Neptune:
  ```bash
    npm run neptune:module

    API version: v1
    Module name: example
    Module type (types: mst_, trx_, rel_, log_): mst_
    Fields (format: name:type:isNullable:isUnique) [id:uuid:false:true]: name:string:100, attachment:string:255
    Do you want to generate CRUD API? (y/n): y
  ```
- This will generate a new module named `example` with the specified fields and CRUD API endpoints.
- Schema will generate on `src/core/db/schema/example.schema.ts`.
- Module will generate on `src/modules/v1/example/`.
- Repository, Entity, DTO, and Usecase files will be created automatically.
- Before hit the endpoints, make sure to run the migrations to create the necessary tables in the database.
- Migrate the database:
  ```bash
    npm run db:generate
    npm run db:pull
    npm run db:push
  ```
  Table will create based on the schema file.
- Then you shuld be registry the module on `src/modules/v1/v1.module.ts`.
  ``typescript
  import { ExampleModule } from '@/modules/v1/example/example.module';

  @Module({
    imports: [
      ExampleModule,
      ...
    ],
  })
  export class V1Module {}
  ```
- Last, you should be add the lang on `src/shared/lang/id.json` or `src/shared/lang/en.json`.
  ```json
  {
    "api": {
      "modules": {
        "example": {
          "fetched": "Data example berhasil diambil",
          "created": "Example berhasil dibuat",
          "updated": "Example berhasil diperbarui",
          "deleted": "Example berhasil dihapus",
          "restored": "Example berhasil dipulihkan",
          "not_found": "Example tidak ditemukan",
          "already_exists": "Example dengan nama tersebut sudah ada",
          "validation": {
            "example": {
              "exists": "Example sudah ada"
            },
            "name": {
              "required": "Nama wajib diisi",
              "max_length": "Nama maksimal 100 karakter"
            },
            "attachment": {
              "required": "Lampiran wajib diisi",
              "invalid_type": "Tipe lampiran tidak valid",
              "max_size": "Ukuran lampiran maksimal 2MB"
            }
          }
        }
      }
    }
  }
  ```
- Now you can access the CRUD API endpoints for the `example` module.
  GET `/api/v1/examples`
  POST `/api/v1/examples`
  GET `/api/v1/examples/:id`
  PATCH `/api/v1/examples/:id`
  DELETE `/api/v1/examples/:id`
  POST `/api/v1/examples/:id/restore`

  With Bearer token authentication if enabled.
  And add headers `Accept-Language: id` or `en` for localization.


## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.