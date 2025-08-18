# 🏢 LTI - Sistema de Gestión de Candidatos

## 📋 **Propósito de Negocio**

### **¿Qué es LTI?**
LTI (Learning Technology Interoperability) es un sistema integral de gestión de candidatos y procesos de selección diseñado para optimizar el reclutamiento y la gestión de talento humano. El sistema permite a las empresas gestionar de manera eficiente todo el ciclo de vida del proceso de selección, desde la publicación de posiciones hasta la contratación final.

### **Objetivos del Negocio**
- **Centralización**: Unificar todos los procesos de reclutamiento en una sola plataforma
- **Eficiencia**: Reducir el tiempo de contratación mediante automatización de procesos
- **Trazabilidad**: Mantener un registro completo del progreso de cada candidato
- **Escalabilidad**: Soportar el crecimiento de la organización y volumen de candidatos
- **Experiencia**: Mejorar la experiencia tanto de reclutadores como de candidatos

### **Funcionalidades Principales**
- 👥 **Gestión de Candidatos**: Registro, seguimiento y evaluación de candidatos
- 💼 **Gestión de Posiciones**: Creación y administración de vacantes laborales
- 📋 **Flujos de Entrevistas**: Definición de procesos de selección personalizados
- 🏢 **Multi-empresa**: Soporte para múltiples organizaciones
- 📊 **Reportes y Analytics**: Métricas de desempeño del proceso de reclutamiento
- 📁 **Gestión Documental**: Almacenamiento de CVs y documentos relevantes

---

## 📁 **Estructura de Carpetas**

```
LTI-System/
├── 📂 backend/                          # Aplicación Backend (Node.js + Express)
│   ├── 📂 src/
│   │   ├── 🌐 presentation/            # Capa de Presentación
│   │   │   └── 📂 controllers/         # Controladores HTTP
│   │   │       ├── candidateController.ts
│   │   │       └── positionController.ts
│   │   ├── 🏢 application/             # Capa de Aplicación
│   │   │   └── 📂 services/            # Servicios de Negocio
│   │   │       ├── candidateService.ts
│   │   │       ├── positionService.ts
│   │   │       └── fileUploadService.ts
│   │   ├── 🏛️ domain/                  # Capa de Dominio
│   │   │   └── 📂 models/              # Modelos y DTOs
│   │   │       ├── Application.ts
│   │   │       └── ApplicationStage.ts
│   │   ├── 🛣️ routes/                  # Definición de Rutas
│   │   │   ├── candidateRoutes.ts
│   │   │   └── positionRoutes.ts
│   │   ├── 🧪 tests/                   # Pruebas Automatizadas
│   │   │   ├── 📂 integration/         # Tests de Integración
│   │   │   ├── candidateStageController.test.ts
│   │   │   └── candidateStageService.test.ts
│   │   └── index.ts                    # Punto de entrada principal
│   ├── 📂 prisma/                      # Configuración de Base de Datos
│   │   ├── schema.prisma              # Schema de Prisma
│   │   └── seed.ts                    # Datos de prueba
│   ├── 📂 dist/                       # Código compilado (generado)
│   ├── package.json                   # Dependencias del backend
│   └── tsconfig.json                  # Configuración TypeScript
├── 📂 frontend/                        # Aplicación Frontend (React)
│   ├── 📂 src/
│   │   ├── 📂 components/             # Componentes React
│   │   ├── 📂 pages/                  # Páginas principales
│   │   ├── 📂 hooks/                  # Hooks personalizados
│   │   ├── 📂 services/               # Servicios API
│   │   ├── 📂 utils/                  # Utilidades
│   │   └── App.tsx                    # Componente principal
│   ├── 📂 public/                     # Archivos estáticos
│   ├── package.json                  # Dependencias del frontend
│   └── tsconfig.json                 # Configuración TypeScript
├── 📂 documentation/                   # Documentación del Proyecto
│   ├── user-stories.md               # Historias de Usuario
│   ├── user-stories-2.md             # Historias de Usuario (Parte 2)
│   ├── execution-plan.md             # Plan de Ejecución
│   └── structure.md                  # Este documento
├── docker-compose.yml                 # Configuración de Docker
└── README.md                         # Documentación principal
```

---

## 🛠️ **Tecnologías Utilizadas**

### **Backend Stack**
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **Node.js** | 18+ | Runtime de JavaScript del servidor |
| **Express.js** | 4.x | Framework web para Node.js |
| **TypeScript** | 5.x | Lenguaje tipado sobre JavaScript |
| **Prisma** | 5.x | ORM moderno para TypeScript |
| **PostgreSQL** | 15+ | Base de datos relacional principal |
| **Jest** | 29.x | Framework de testing |
| **Supertest** | 6.x | Testing de APIs HTTP |
| **CORS** | 2.x | Manejo de políticas de origen cruzado |
| **dotenv** | 16.x | Gestión de variables de entorno |

### **Frontend Stack**
| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| **React** | 18+ | Librería para interfaces de usuario |
| **TypeScript** | 5.x | Lenguaje tipado |
| **Vite** | 4.x | Herramienta de build y desarrollo |
| **React Router** | 6.x | Enrutamiento del lado del cliente |
| **Axios** | 1.x | Cliente HTTP para APIs |
| **Styled Components** | 6.x | CSS-in-JS para estilos |

### **Infraestructura y DevOps**
| Tecnología | Propósito |
|-----------|-----------|
| **Docker** | Containerización de servicios |
| **Docker Compose** | Orquestación de contenedores |
| **Git** | Control de versiones |
| **npm** | Gestión de paquetes |

---

## 🏗️ **Arquitectura del Sistema**

### **Arquitectura General**
```mermaid
graph TB
    subgraph "Cliente"
        UI[React Frontend<br/>Puerto 3000]
    end
    
    subgraph "Servidor"
        API[Express API<br/>Puerto 3010]
        subgraph "Capas del Backend"
            CTRL[Controllers<br/>Capa Presentación]
            SERV[Services<br/>Capa Aplicación]
            DOM[Models<br/>Capa Dominio]
        end
    end
    
    subgraph "Datos"
        DB[(PostgreSQL<br/>Puerto 5432)]
        PRISMA[Prisma ORM]
    end
    
    UI -->|HTTP/REST| API
    API --> CTRL
    CTRL --> SERV
    SERV --> DOM
    SERV --> PRISMA
    PRISMA --> DB
```

### **Arquitectura del Backend - Patrón por Capas**

#### **🌐 Capa de Presentación (Presentation Layer)**
- **Responsabilidad**: Manejo de requests HTTP, validación de entrada, formato de respuestas
- **Componentes**: Controllers
- **Tecnologías**: Express.js, middleware de validación

#### **🏢 Capa de Aplicación (Application Layer)**
- **Responsabilidad**: Lógica de negocio, orquestación de operaciones, transacciones
- **Componentes**: Services
- **Tecnologías**: TypeScript, Prisma Client

#### **🏛️ Capa de Dominio (Domain Layer)**
- **Responsabilidad**: Modelos de datos, DTOs, interfaces
- **Componentes**: Models, Types, Interfaces
- **Tecnologías**: TypeScript

#### **📊 Capa de Infraestructura (Infrastructure Layer)**
- **Responsabilidad**: Acceso a datos, servicios externos
- **Componentes**: Prisma ORM, Database
- **Tecnologías**: PostgreSQL, Prisma

### **Modelo de Datos Principal**

```mermaid
erDiagram
    Company ||--o{ Position : "tiene"
    Company ||--o{ Employee : "emplea"
    Position ||--o{ Application : "recibe"
    Position ||--|| InterviewFlow : "sigue"
    Candidate ||--o{ Application : "aplica"
    Application ||--|| InterviewStep : "está_en"
    Application ||--o{ Interview : "tiene"
    InterviewFlow ||--o{ InterviewStep : "contiene"
    InterviewStep ||--o{ Interview : "utiliza"
    Employee ||--o{ Interview : "conduce"
    Candidate ||--o{ Education : "tiene"
    Candidate ||--o{ WorkExperience : "posee"
    Candidate ||--|| Resume : "adjunta"
    
    Company {
        int id PK
        string name
        string website
        datetime createdAt
    }
    
    Position {
        int id PK
        string title
        text description
        int companyId FK
        int interviewFlowId FK
        datetime createdAt
    }
    
    Candidate {
        int id PK
        string firstName
        string lastName
        string email
        string phone
        datetime createdAt
    }
    
    Application {
        int id PK
        int candidateId FK
        int positionId FK
        int currentInterviewStep FK
        text notes
        datetime applicationDate
    }
    
    Interview {
        int id PK
        int applicationId FK
        int interviewStepId FK
        int interviewerId FK
        int score
        text feedback
        datetime scheduledAt
    }
```

### **Arquitectura del Frontend**

#### **Patrón de Componentes React**
```
📂 src/
├── 🧩 components/
│   ├── common/           # Componentes reutilizables
│   ├── forms/            # Formularios específicos
│   └── layout/           # Componentes de diseño
├── 📄 pages/
│   ├── candidates/       # Páginas de candidatos
│   ├── positions/        # Páginas de posiciones
│   └── dashboard/        # Panel principal
├── 🔧 hooks/
│   ├── useApi.ts         # Hook para llamadas API
│   └── useAuth.ts        # Hook de autenticación
└── 🌐 services/
    └── api.ts            # Cliente API centralizado
```

---

## 🚀 **Guía de Instalación y Configuración**

### **Prerrequisitos del Sistema**
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Docker** >= 20.0.0
- **Docker Compose** >= 2.0.0
- **Git** >= 2.0.0

### **1. Clonación del Repositorio**
```bash
# Clonar el repositorio
git clone <repository-url>
cd AI4Devs-backend-202506

# Verificar la estructura
ls -la
```

### **2. Configuración de Variables de Entorno**
```bash
# Crear archivo de variables de entorno (opcional)
touch .env

# Configurar variables si es necesario
echo "NODE_ENV=development" >> .env
echo "DATABASE_URL=postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb" >> .env
```

### **3. Configuración de Base de Datos**

#### **Iniciar PostgreSQL con Docker**
```bash
# Levantar PostgreSQL usando Docker Compose
docker-compose up -d

# Verificar que el contenedor esté ejecutándose
docker ps

# Ver logs de la base de datos (opcional)
docker-compose logs db
```

#### **Configuración de Prisma**
```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Generar el cliente de Prisma
npx prisma generate

# Aplicar migraciones a la base de datos
npx prisma db push

# Verificar conexión a la base de datos
npx prisma db pull
```

#### **Poblar Base de Datos con Datos de Prueba**
```bash
# Ejecutar script de seed (opcional)
npx prisma db seed

# O usar el script de Node.js alternativo
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');
  // Los datos se crearán según necesidad
  await prisma.\$disconnect();
}

seed().catch(console.error);
"
```

### **4. Configuración del Backend**

```bash
# Asegurarse de estar en el directorio backend
cd backend

# Instalar todas las dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar servidor en modo desarrollo
npm run dev

# O iniciar servidor en modo producción
npm start
```

#### **Verificación del Backend**
```bash
# Verificar que el servidor esté ejecutándose
curl http://localhost:3010

# Probar endpoint de candidatos
curl http://localhost:3010/candidates

# Probar endpoint de posiciones
curl http://localhost:3010/positions/1/candidates
```

### **5. Configuración del Frontend**

```bash
# Navegar al directorio frontend
cd ../frontend

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Iniciar servidor de desarrollo
npm run dev

# O iniciar servidor en modo producción
npm start
```

#### **Verificación del Frontend**
```bash
# El frontend estará disponible en:
# http://localhost:3000

# Verificar en el navegador
open http://localhost:3000
```

### **6. Ejecución de Pruebas**

#### **Tests del Backend**
```bash
cd backend

# Ejecutar todos los tests
npm test

# Ejecutar tests específicos
npm test -- --testPathPattern=candidateStage

# Ejecutar tests con coverage
npm run test:coverage
```

#### **Tests del Frontend**
```bash
cd frontend

# Ejecutar tests del frontend
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

### **7. Verificación Final del Sistema**

#### **Checklist de Verificación**
- [ ] ✅ PostgreSQL ejecutándose en puerto 5432
- [ ] ✅ Backend ejecutándose en puerto 3010
- [ ] ✅ Frontend ejecutándose en puerto 3000
- [ ] ✅ Base de datos conectada y migrada
- [ ] ✅ APIs respondiendo correctamente
- [ ] ✅ Frontend cargando sin errores
- [ ] ✅ Tests pasando exitosamente

#### **Comandos de Verificación Rápida**
```bash
# Verificar servicios Docker
docker-compose ps

# Verificar procesos Node.js
ps aux | grep node

# Verificar conectividad de red
netstat -tulpn | grep -E "(3000|3010|5432)"

# Test completo del sistema
curl -X GET http://localhost:3010/positions/1/candidates
curl -X PUT http://localhost:3010/candidates/1/stage \
  -H "Content-Type: application/json" \
  -d '{"newStage": "Technical Interview", "notes": "Test"}'
```

---

## 🔧 **Comandos de Desarrollo Frecuentes**

### **Gestión de Base de Datos**
```bash
# Reiniciar base de datos
docker-compose restart db

# Limpiar y recrear base de datos
docker-compose down -v
docker-compose up -d
npx prisma db push

# Acceder a la consola de PostgreSQL
docker exec -it <container_id> psql -U LTIdbUser -d LTIdb
```

### **Desarrollo Backend**
```bash
# Modo desarrollo con hot reload
npm run dev

# Linting y formateo
npm run lint
npm run format

# Compilación para producción
npm run build:prod
```

### **Desarrollo Frontend**
```bash
# Desarrollo con hot reload
npm run dev

# Preview de build de producción
npm run preview

# Análisis de bundle
npm run analyze
```

---

## 📊 **Monitoreo y Logging**

### **Logs del Sistema**
- **Backend**: Logs en consola y archivos (configurar según necesidad)
- **Frontend**: Logs en DevTools del navegador
- **Base de Datos**: Logs de Docker disponibles via `docker-compose logs db`

### **Métricas de Rendimiento**
- **API Response Time**: Medido en controllers
- **Database Query Performance**: Monitoreado via Prisma
- **Frontend Load Time**: Medido con herramientas de desarrollo

---

## 🛡️ **Consideraciones de Seguridad**

### **Backend Security**
- Validación exhaustiva de entrada en controllers
- Sanitización de datos antes de queries
- Manejo seguro de errores (no exposición de stack traces)
- CORS configurado para frontend específico

### **Database Security**
- Credenciales en variables de entorno
- Conexiones encriptadas (en producción)
- Principio de menor privilegio para usuarios DB

### **Frontend Security**
- Sanitización de input del usuario
- Validación client-side como primera línea de defensa
- HTTPS en producción

---

## 📈 **Escalabilidad y Performance**

### **Optimizaciones Implementadas**
- **Database**: Indices en campos de búsqueda frecuente
- **API**: Respuestas cacheables donde sea apropiado
- **Frontend**: Code splitting y lazy loading
- **Queries**: Uso eficiente de Prisma includes para evitar N+1

### **Consideraciones Futuras**
- **Horizontal Scaling**: Load balancers para múltiples instancias
- **Database Scaling**: Read replicas para consultas pesadas
- **Caching**: Redis para sesiones y datos frecuentes
- **CDN**: Para assets estáticos del frontend

---

*Documentación generada por el equipo de arquitectura LTI - v1.0*
