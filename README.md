# LTI - Talent Tracking System | EN

This project is a full-stack application with a React frontend and an Express backend using Prisma as an ORM. The frontend is started with Create React App, and the backend is written in TypeScript.

## ✨ New Feature: Kanban Board System

The system now includes a comprehensive **Kanban Board** for visualizing candidate progress through interview stages:

### 🎯 Key Features
- **Dynamic Columns**: Automatically generated based on interview flow configuration
- **Real-time Candidate Tracking**: Visual representation of candidates in each interview stage
- **Smart Candidate Placement**: Candidates are positioned based on their last completed interview
- **Score Visualization**: Star rating system (1-5 stars) with color-coded indicators
- **Responsive Design**: Optimized layout with 4 columns per row
- **Interactive Navigation**: Direct access from positions list with intelligent routing

### 🏗️ Kanban Architecture
- **Backend API Endpoints**:
  - `GET /api/positions/:id/kanban` - Retrieve Kanban data for a position
  - `GET /api/kanban/statistics` - Get overall Kanban statistics
  - `GET /api/kanban/health` - Health check endpoint
  - `GET /api/interview-steps` - Get all available interview steps

- **Frontend Components**:
  - `KanbanBoard.js` - Main board container with navigation and statistics
  - `KanbanColumn.js` - Individual column with candidates and metadata
  - `CandidateCard.js` - Candidate information card with scores
  - `StarRating.js` - Interactive star rating component

### 📊 Column Structure
1. **Revisión** - Initial application review (candidates without interviews)
2. **Initial Screening** - First interview stage
3. **Technical Interview** - Technical assessment stage  
4. **Manager Interview** - Final management review stage

### 🎨 Visual Design
- **Color-coded Performance**: Green (high scores), Yellow (medium), Red (low scores)
- **Compact Layout**: Optimized spacing for maximum information density
- **Dark Theme Support**: Professional dark background with high contrast
- **Responsive Grid**: Adapts to different screen sizes while maintaining 4-column layout

### 🚀 Quick Start
```bash
# Access Kanban from positions list
http://localhost:3000/positions
# Click "Ver Kanban" button for any active position

# Or direct access
http://localhost:3000/kanban/1  # Replace 1 with position ID
```

## Explanation of Directories and Files

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`: The entry point for the backend server.
    - `application/`: Contains the application logic.
    - `domain/`: Contains the business logic.
    - `infrastructure/`: Contains code that communicates with the database.
    - `presentation/`: Contains code related to the presentation layer (such as controllers).
    - `routes/`: Contains the route definitions for the API.
    - `tests/`: Contains test files.
  - `prisma/`: Contains the Prisma schema file for ORM.
  - `tsconfig.json`: TypeScript configuration file.
- `frontend/`: Contains the client-side code written in React."
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `.env`: Contains the environment variables.
- `docker-compose.yml`: Contains the Docker Compose configuration to manage your application's services.
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend

The frontend is a React application, and its main files are located in the src directory. The public directory contains static assets, and the build directory contains the production build of the application.

### Backend

The backend is an Express application written in TypeScript. The src directory contains the source code, divided into several subdirectories:

- `application`: Contains the application logic.
- `domain`: Contains the domain models.
- `infrastructure`: Contains code related to the infrastructure.
- `presentation`: Contains code related to the presentation layer.
- `routes`: Contains the application routes.
- `tests`: Contains the application tests.

The `prisma` directory contains the Prisma schema.

## First steps

To get started with this project, follow these steps:

1. Clone the repository.
2. Install the dependencies for the frontend and backend:

```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Build the backend server:
```
cd backend
npm run build
````
4. Start the backend server:
```
cd backend
npm start
```
5. In a new terminal window, build the frontend server:
```
cd frontend
npm run build
```
6. Start the frontend server:
```
cd frontend
npm start
```

The backend server will be running at http://localhost:3010 and the frontend will be available at http://localhost:3000.

## Docker and PostgreSQL

This project uses Docker to run a PostgreSQL database. Here's how to set it up:

Install Docker on your machine if you haven't done so already. You can download it from here.
Navigate to the root directory of the project in your terminal.
Run the following command to start the Docker container:

```
docker-compose up -d
```
This will start a PostgreSQL database in a Docker container. The -d flag runs the container in detached mode, which means it runs in the background.

To access the PostgreSQL database, you can use any PostgreSQL client with the following connection details:

- Host: localhost
- Port: 5432
- User: postgres
- Password: password
- Database: mydatabase
  
Please replace User, Password, and Database with the actual username, password, and database name specified in your .env file.

To stop the Docker container, run the following command:

```
docker-compose down
```
To generate the database using Prisma, follow these steps:

1. Make sure that the .env file in the root directory of the backend contains the DATABASE_URL variable with the correct connection string to your PostgreSQL database. If it doesn’t work, try replacing the full URL directly in schema.prisma, in the url variable.

2. Open a terminal and navigate to the backend directory where the schema.prisma and seed.ts files are located.

3. Run the following commands to generate the Prisma structure, apply migrations to your database, and populate it with sample data:

```
npx prisma generate
npx prisma migrate dev
ts-node seed.ts
```

Once you have completed all the steps, you should be able to save new candidates, both via web and via API, view them in the database, and retrieve them using GET by ID.

```
POST http://localhost:3010/candidates
{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```

--------------------------------------------

# LTI - Sistema de Seguimiento de Talento | ES

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Prisma como un ORM. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## ✨ Nueva Funcionalidad: Sistema Kanban

El sistema ahora incluye un **Tablero Kanban** completo para visualizar el progreso de candidatos a través de las etapas de entrevista:

### 🎯 Características Principales
- **Columnas Dinámicas**: Generadas automáticamente basadas en la configuración del flujo de entrevistas
- **Seguimiento en Tiempo Real**: Representación visual de candidatos en cada etapa de entrevista
- **Ubicación Inteligente**: Los candidatos se posicionan según su última entrevista completada
- **Visualización de Puntuaciones**: Sistema de estrellas (1-5) con indicadores codificados por color
- **Diseño Responsivo**: Layout optimizado con 4 columnas por fila
- **Navegación Interactiva**: Acceso directo desde la lista de posiciones con enrutamiento inteligente

### 🏗️ Arquitectura Kanban
- **Endpoints de API Backend**:
  - `GET /api/positions/:id/kanban` - Obtener datos del Kanban para una posición
  - `GET /api/kanban/statistics` - Obtener estadísticas generales del Kanban
  - `GET /api/kanban/health` - Endpoint de verificación de salud
  - `GET /api/interview-steps` - Obtener todas las etapas de entrevista disponibles

- **Componentes Frontend**:
  - `KanbanBoard.js` - Contenedor principal del tablero con navegación y estadísticas
  - `KanbanColumn.js` - Columna individual con candidatos y metadatos
  - `CandidateCard.js` - Tarjeta de información del candidato con puntuaciones
  - `StarRating.js` - Componente interactivo de calificación por estrellas

### 📊 Estructura de Columnas
1. **Revisión** - Revisión inicial de aplicación (candidatos sin entrevistas)
2. **Initial Screening** - Primera etapa de entrevista
3. **Technical Interview** - Etapa de evaluación técnica
4. **Manager Interview** - Revisión final de gestión

### 🎨 Diseño Visual
- **Rendimiento Codificado por Color**: Verde (puntuaciones altas), Amarillo (medio), Rojo (bajas)
- **Layout Compacto**: Espaciado optimizado para máxima densidad de información
- **Soporte Tema Oscuro**: Fondo oscuro profesional con alto contraste
- **Grid Responsivo**: Se adapta a diferentes tamaños de pantalla manteniendo layout de 4 columnas

### 🚀 Inicio Rápido
```bash
# Acceder al Kanban desde la lista de posiciones
http://localhost:3000/positions
# Hacer clic en el botón "Ver Kanban" para cualquier posición activa

# O acceso directo
http://localhost:3000/kanban/1  # Reemplazar 1 con el ID de la posición
```

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
    - `application/`: Contiene la lógica de aplicación.
    - `domain/`: Contiene la lógica de negocio.
    - `infrastructure/`: Contiene código que se comunica con la base de datos.
    - `presentation/`: Contiene código relacionado con la capa de presentación (como controladores).
    - `routes/`: Contiene las definiciones de rutas para la API.
    - `tests/`: Contiene archivos de prueba.
  - `prisma/`: Contiene el archivo de esquema de Prisma para ORM.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `.env`: Contiene las variables de entorno.
- `docker-compose.yml`: Contiene la configuración de Docker Compose para gestionar los servicios de tu aplicación.
- `README.md`: Este archivo, contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript. El directorio `src` contiene el código fuente, dividido en varios subdirectorios:

- `application`: Contiene la lógica de aplicación.
- `domain`: Contiene los modelos de dominio.
- `infrastructure`: Contiene código relacionado con la infraestructura.
- `presentation`: Contiene código relacionado con la capa de presentación.
- `routes`: Contiene las rutas de la aplicación.
- `tests`: Contiene las pruebas de la aplicación.

El directorio `prisma` contiene el esquema de Prisma.

## Primeros Pasos

Para comenzar con este proyecto, sigue estos pasos:

1. Clona el repositorio.
2. Instala las dependencias para el frontend y el backend:
```sh
cd frontend
npm install

cd ../backend
npm install
```
3. Construye el servidor backend:
```
cd backend
npm run build
````
4. Inicia el servidor backend:
```
cd backend
npm start
```
5. En una nueva ventana de terminal, construye el servidor frontend:
```
cd frontend
npm run build
```
6. Inicia el servidor frontend:
```
cd frontend
npm start
```

El servidor backend estará corriendo en http://localhost:3010 y el frontend estará disponible en http://localhost:3000.

## Docker y PostgreSQL

Este proyecto usa Docker para ejecutar una base de datos PostgreSQL. Así es cómo ponerlo en marcha:

Instala Docker en tu máquina si aún no lo has hecho. Puedes descargarlo desde aquí.
Navega al directorio raíz del proyecto en tu terminal.
Ejecuta el siguiente comando para iniciar el contenedor Docker:
```
docker-compose up -d
```
Esto iniciará una base de datos PostgreSQL en un contenedor Docker. La bandera -d corre el contenedor en modo separado, lo que significa que se ejecuta en segundo plano.

Para acceder a la base de datos PostgreSQL, puedes usar cualquier cliente PostgreSQL con los siguientes detalles de conexión:
 - Host: localhost
 - Port: 5432
 - User: postgres
 - Password: password
 - Database: mydatabase

Por favor, reemplaza User, Password y Database con el usuario, la contraseña y el nombre de la base de datos reales especificados en tu archivo .env.

Para detener el contenedor Docker, ejecuta el siguiente comando:
```
docker-compose down
```

Para generar la base de datos utilizando Prisma, sigue estos pasos:

1. Asegúrate de que el archivo `.env` en el directorio raíz del backend contenga la variable `DATABASE_URL` con la cadena de conexión correcta a tu base de datos PostgreSQL. Si no te funciona, prueba a reemplazar la URL completa directamente en `schema.prisma`, en la variable `url`.

2. Abre una terminal y navega al directorio del backend donde se encuentra el archivo `schema.prisma` y `seed.ts`.

3. Ejecuta los siguientes comandos para generar la estructura de prisma, las migraciones a tu base de datos y poblarla con datos de ejemplo:
```
npx prisma generate
npx prisma migrate dev
ts-node seed.ts
```

Una vez has dado todos los pasos, deberías poder guardar nuevos candidatos, tanto via web, como via API, verlos en la base de datos y obtenerlos mediante GET por id.

## 🧪 Pruebas del Sistema Kanban

El sistema incluye un conjunto completo de pruebas para garantizar la funcionalidad:

### Backend Tests
```bash
cd backend
npm test
```

**Pruebas Disponibles:**
- ✅ `kanbanService.test.ts` - Pruebas unitarias del servicio Kanban
- ✅ `kanbanController.test.ts` - Pruebas del controlador de API
- ✅ `kanbanRoutes.test.ts` - Pruebas de integración de rutas
- ✅ `Position.test.ts` - Pruebas del modelo de posición con Kanban
- ✅ `positionService.test.ts` - Pruebas del servicio de posiciones

**Cobertura de Pruebas:**
- Validación de datos de entrada
- Manejo de errores y casos edge
- Integración con base de datos
- Respuestas de API correctas
- Lógica de negocio del Kanban

### Debugging Scripts
```bash
# Verificar datos de etapas de entrevista
node debug-interview-steps.js

# Probar estructura de API Kanban
node test-kanban-api.js
```

## 📈 Métricas de Implementación

**Total de Archivos Modificados/Creados:** 15+
**Líneas de Código:** 2000+
**Componentes React:** 4 nuevos
**API Endpoints:** 4 nuevos
**Pruebas Implementadas:** 5 archivos de test

**Tiempo de Desarrollo:** ~6 horas de implementación sistemática
**Arquitectura:** Clean Architecture con separación de responsabilidades
**Patrón de Diseño:** Domain-Driven Design (DDD)

```
POST http://localhost:3010/candidates
{
    "firstName": "Albert",
    "lastName": "Saelices",
    "email": "albert.saelices@gmail.com",
    "phone": "656874937",
    "address": "Calle Sant Dalmir 2, 5ºB. Barcelona",
    "educations": [
        {
            "institution": "UC3M",
            "title": "Computer Science",
            "startDate": "2006-12-31",
            "endDate": "2010-12-26"
        }
    ],
    "workExperiences": [
        {
            "company": "Coca Cola",
            "position": "SWE",
            "description": "",
            "startDate": "2011-01-13",
            "endDate": "2013-01-17"
        }
    ],
    "cv": {
        "filePath": "uploads/1715760936750-cv.pdf",
        "fileType": "application/pdf"
    }
}
```

