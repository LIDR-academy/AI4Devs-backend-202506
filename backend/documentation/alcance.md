# LTI - Talent Tracking System | Documentación de Alcance

## 1. Propósito del Negocio LTI

**LTI (Learning Technologies International)** es un sistema integral de gestión de talento y reclutamiento (ATS - Applicant Tracking System) diseñado para optimizar el proceso completo de selección de personal. El sistema está enfocado en:

### Objetivos Principales:
- **Gestión de Candidatos**: Administración completa de perfiles de candidatos, incluyendo información personal, educativa y laboral
- **Gestión de Posiciones**: Control de vacantes y requisitos de cada puesto
- **Flujo de Entrevistas**: Automatización del proceso de selección con pasos configurables
- **Gestión de Aplicaciones**: Seguimiento del estado de cada candidatura
- **Almacenamiento de CVs**: Sistema de archivos para currículums y documentos relacionados

### Beneficios del Negocio:
- **Eficiencia Operativa**: Reducción del tiempo de contratación
- **Trazabilidad**: Seguimiento completo del proceso de selección
- **Calidad de Selección**: Evaluación estructurada de candidatos
- **Escalabilidad**: Sistema adaptable al crecimiento de la organización

---

## 2. Estructura de Carpetas

```
AI4Devs-backend-202506/
├── backend/                          # Servidor backend principal
│   ├── src/                         # Código fuente del backend
│   │   ├── application/             # Lógica de aplicación
│   │   │   └── services/           # Servicios de negocio
│   │   │       ├── candidateService.ts
│   │   │       └── fileUploadService.ts
│   │   ├── domain/                  # Modelos de dominio y lógica de negocio
│   │   │   └── models/             # Entidades del dominio
│   │   │       ├── Application.ts
│   │   │       ├── Candidate.ts
│   │   │       ├── Company.ts
│   │   │       ├── Education.ts
│   │   │       ├── Employee.ts
│   │   │       ├── Interview.ts
│   │   │       ├── InterviewFlow.ts
│   │   │       ├── InterviewStep.ts
│   │   │       ├── InterviewType.ts
│   │   │       ├── Position.ts
│   │   │       ├── Resume.ts
│   │   │       └── WorkExperience.ts
│   │   ├── presentation/            # Capa de presentación
│   │   │   └── controllers/        # Controladores de la API
│   │   │       └── candidateController.ts
│   │   ├── routes/                  # Definición de rutas de la API
│   │   │   └── candidateRoutes.ts
│   │   └── index.ts                 # Punto de entrada del servidor
│   ├── prisma/                      # Configuración de base de datos
│   │   ├── migrations/             # Migraciones de base de datos
│   │   ├── schema.prisma           # Esquema de base de datos
│   │   └── seed.ts                 # Datos de prueba
│   ├── documentation/               # Documentación del proyecto
│   │   └── alcance.md              # Este archivo
│   ├── package.json                 # Dependencias del backend
│   └── tsconfig.json               # Configuración de TypeScript
├── frontend/                        # Aplicación cliente React
│   ├── src/                        # Código fuente del frontend
│   │   ├── components/             # Componentes React
│   │   │   ├── AddCandidateForm.js
│   │   │   ├── FileUploader.js
│   │   │   └── RecruiterDashboard.js
│   │   ├── services/               # Servicios de comunicación con API
│   │   │   └── candidateService.js
│   │   ├── assets/                 # Recursos estáticos
│   │   │   └── lti-logo.png
│   │   ├── App.tsx                 # Componente principal
│   │   └── index.tsx               # Punto de entrada del frontend
│   ├── public/                     # Archivos públicos
│   ├── package.json                # Dependencias del frontend
│   └── tsconfig.json              # Configuración de TypeScript
├── docker-compose.yml              # Configuración de contenedores Docker
├── package.json                    # Dependencias del proyecto raíz
└── README.md                       # Documentación general del proyecto
```

---

## 3. Arquitectura de Backend y Frontend

### 3.1 Arquitectura del Backend

#### **Patrón Arquitectónico: Clean Architecture (Arquitectura Limpia)**

El backend implementa una arquitectura en capas siguiendo los principios de Clean Architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Controllers   │  │     Routes      │  │ Middleware  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     Services    │  │   Validators    │  │ Use Cases   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     Models      │  │   Entities      │  │ Business    │ │
│  │                 │  │                 │  │  Logic      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     Prisma      │  │   Database      │  │   File      │ │
│  │      ORM        │  │   (PostgreSQL)  │  │  Storage    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### **Componentes del Backend:**

1. **Capa de Presentación (Presentation Layer)**
   - **Controllers**: Manejan las peticiones HTTP y respuestas
   - **Routes**: Definen los endpoints de la API REST
   - **Middleware**: CORS, logging, autenticación

2. **Capa de Aplicación (Application Layer)**
   - **Services**: Lógica de negocio y coordinación entre capas
   - **Validators**: Validación de datos de entrada
   - **File Upload Service**: Manejo de archivos y CVs

3. **Capa de Dominio (Domain Layer)**
   - **Models**: Entidades de negocio (Candidate, Position, Interview, etc.)
   - **Business Logic**: Reglas de negocio encapsuladas en los modelos

4. **Capa de Infraestructura (Infrastructure Layer)**
   - **Prisma ORM**: Acceso a base de datos PostgreSQL
   - **Database**: Almacenamiento persistente de datos
   - **File Storage**: Almacenamiento de documentos

#### **Tecnologías del Backend:**
- **Runtime**: Node.js con TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Base de Datos**: PostgreSQL
- **Validación**: Validadores personalizados
- **Testing**: Jest
- **Documentación**: Swagger/OpenAPI

### 3.2 Arquitectura del Frontend

#### **Patrón Arquitectónico: Component-Based Architecture**

El frontend utiliza React con una arquitectura basada en componentes:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Components    │  │      Pages      │  │   Layouts   │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  API Services   │  │  State Mgmt     │  │   Utils     │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     ASSETS LAYER                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     Images      │  │      Icons      │  │   Styles    │ │
│  │                 │  │                 │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### **Componentes del Frontend:**

1. **Capa de Presentación (Presentation Layer)**
   - **Components**: Componentes reutilizables de React
   - **Pages**: Vistas principales de la aplicación
   - **Layouts**: Estructuras de página comunes

2. **Capa de Servicios (Service Layer)**
   - **API Services**: Comunicación con el backend
   - **State Management**: Gestión del estado de la aplicación
   - **Utilities**: Funciones auxiliares

3. **Capa de Recursos (Assets Layer)**
   - **Images**: Logos e imágenes de la aplicación
   - **Icons**: Iconografía del sistema
   - **Styles**: Hojas de estilo CSS

#### **Tecnologías del Frontend:**
- **Framework**: React 18 con TypeScript
- **UI Library**: React Bootstrap
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API nativa
- **Styling**: CSS + Bootstrap 5
- **Build Tool**: Create React App
- **Testing**: Jest + Testing Library

### 3.3 Comunicación Backend-Frontend

#### **API REST Endpoints:**
- **Base URL**: `http://localhost:3010`
- **CORS**: Configurado para permitir comunicación desde `http://localhost:3000`
- **Endpoints principales**:
  - `GET /candidates` - Listar candidatos
  - `POST /candidates` - Crear candidato
  - `GET /candidates/:id` - Obtener candidato específico
  - `PUT /candidates/:id` - Actualizar candidato
  - `DELETE /candidates/:id` - Eliminar candidato
  - `POST /upload` - Subir archivos

#### **Formato de Datos:**
- **Request/Response**: JSON
- **File Upload**: Multipart/form-data
- **Error Handling**: Respuestas HTTP estándar con mensajes de error

### 3.4 Base de Datos

#### **Esquema Principal:**
- **Candidates**: Información de candidatos
- **Positions**: Puestos vacantes
- **Applications**: Candidaturas a posiciones
- **Interviews**: Entrevistas programadas
- **InterviewFlow**: Flujos de entrevista
- **Companies**: Empresas cliente
- **Employees**: Empleados de la empresa

#### **Relaciones Clave:**
- Un candidato puede tener múltiples aplicaciones
- Una posición puede recibir múltiples candidaturas
- Cada aplicación sigue un flujo de entrevista específico
- Los candidatos pueden tener múltiples CVs y experiencias

### 3.5 Despliegue y DevOps

#### **Entorno de Desarrollo:**
- **Backend**: Puerto 3010
- **Frontend**: Puerto 3000
- **Base de Datos**: Puerto 5435 (PostgreSQL)
- **Docker**: Contenedores para base de datos

#### **Scripts de Desarrollo:**
- **Backend**: `npm run dev` (desarrollo), `npm start` (producción)
- **Frontend**: `npm start` (desarrollo), `npm run build` (producción)
- **Base de Datos**: `docker-compose up -d`

---

## 4. Consideraciones Técnicas

### 4.1 Escalabilidad
- Arquitectura modular que permite escalar componentes independientemente
- Base de datos PostgreSQL para manejo de grandes volúmenes de datos
- API REST stateless para escalabilidad horizontal

### 4.2 Mantenibilidad
- Código TypeScript para mayor robustez y autocompletado
- Separación clara de responsabilidades por capas
- Documentación de API con Swagger
- Tests unitarios con Jest

### 4.3 Seguridad
- Validación de datos en backend y frontend
- CORS configurado para orígenes específicos
- Manejo seguro de archivos subidos
- Validación de tipos con TypeScript

---

*Documento generado para el proyecto LTI - Talent Tracking System*
*Versión: 1.0*
*Fecha: 2025*
