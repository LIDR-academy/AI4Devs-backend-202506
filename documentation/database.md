# Documentación de Base de Datos - LTI Talent Tracking System

## 1. Información General

### Tipo de Base de Datos
- **SGBD**: PostgreSQL
- **Versión**: Latest (Docker image)
- **ORM**: Prisma 
- **Versión Prisma**: ^5.x
- **Cliente**: prisma-client-js

### Dependencias Relacionadas
```json
{
  "@prisma/client": "^5.x",
  "prisma": "^5.x",
  "postgres": "latest (Docker)",
  "tsx": "^4.x (para ejecutar seed.ts)"
}
```

### Características Técnicas
- **Soporte de binary targets**: `["native", "debian-openssl-3.0.x"]`
- **Auto-incremento**: Utilizado en todas las claves primarias
- **Restricciones**: Claves únicas en email de candidatos y empleados
- **Relaciones**: Foreign keys con integridad referencial

---

## 2. Configuración por Entornos

### Development
```bash
# Variables de entorno requeridas (.env)
DB_HOST=localhost
DB_PORT=5432
DB_USER=LTIdbUser
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_NAME=LTIdb

# Cadena de conexión
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"

# Comandos de desarrollo
docker compose up -d              # Iniciar BD con Docker
npx prisma generate              # Generar cliente Prisma
npx prisma migrate deploy        # Aplicar migraciones
npx tsx prisma/seed.ts          # Poblar con datos de ejemplo
npx prisma studio               # Interfaz web (http://localhost:5555)
```

### Test
```bash
# Variables de entorno para testing
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb_test"

# Setup para tests
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Production
```bash
# Variables de entorno de producción
DATABASE_URL=${PRODUCTION_DATABASE_URL}

# Comandos de producción
npx prisma generate              # Generar cliente
npx prisma migrate deploy        # Aplicar migraciones
```

### Variables de Entorno Necesarias
| Variable | Descripción | Valor por Defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `DB_HOST` | Host de la base de datos | localhost | ✅ |
| `DB_PORT` | Puerto de PostgreSQL | 5432 | ✅ |
| `DB_USER` | Usuario de la BD | LTIdbUser | ✅ |
| `DB_PASSWORD` | Contraseña del usuario | D1ymf8wyQEGthFR1E9xhCq | ✅ |
| `DB_NAME` | Nombre de la base de datos | LTIdb | ✅ |
| `DATABASE_URL` | URL completa de conexión | postgresql://... | ✅ |

---

## 3. Esquema General

### Resumen de la Base de Datos
- **Total de tablas**: 11
- **Entidades principales**: 5 (Candidate, Company, Position, Application, Interview)
- **Entidades de configuración**: 4 (Education, WorkExperience, Resume, Employee)
- **Entidades de flujo**: 3 (InterviewFlow, InterviewStep, InterviewType)

### Tabla de Entidades de Negocio

| Nombre | Descripción | Categoría |
|--------|-------------|-----------|
| `Candidate` | Información principal de candidatos con datos personales | Gestión de Candidatos |
| `Education` | Historial educativo de los candidatos | Perfil del Candidato |
| `WorkExperience` | Experiencia laboral de los candidatos | Perfil del Candidato |
| `Resume` | Archivos CV y documentos adjuntos | Gestión de Documentos |
| `Company` | Información de empresas/organizaciones | Gestión Organizacional |
| `Employee` | Empleados de las empresas (reclutadores, managers) | Gestión de Usuarios |
| `Position` | Ofertas de trabajo y posiciones abiertas | Gestión de Vacantes |
| `Application` | Aplicaciones de candidatos a posiciones específicas | Proceso de Selección |
| `Interview` | Entrevistas realizadas con calificaciones y notas | Evaluación de Candidatos |
| `InterviewFlow` | Flujos de entrevista configurables por posición | Configuración de Procesos |
| `InterviewStep` | Pasos individuales dentro de un flujo de entrevista | Configuración de Procesos |
| `InterviewType` | Tipos de entrevista (técnica, cultural, etc.) | Configuración de Procesos |

### Métricas del Esquema
- **Relaciones 1:N**: 15 relaciones
- **Campos únicos**: 3 (candidate.email, company.name, employee.email)
- **Campos opcionales**: 12 campos con valores null permitidos
- **Campos con valores por defecto**: 3 (position.status, position.isVisible, employee.isActive)

---

## 4. Vista del Modelo de Datos

```mermaid
erDiagram
    %% Entidades Principales
    Candidate {
        int id PK
        string firstName
        string lastName
        string email UK
        string phone
        string address
    }
    
    Company {
        int id PK
        string name UK
    }
    
    Position {
        int id PK
        int companyId FK
        int interviewFlowId FK
        string title
        string description
        string status
        boolean isVisible
        string location
        string jobDescription
        string requirements
        string responsibilities
        float salaryMin
        float salaryMax
        string employmentType
        string benefits
        string companyDescription
        datetime applicationDeadline
        string contactInfo
    }
    
    Application {
        int id PK
        int positionId FK
        int candidateId FK
        int currentInterviewStep FK
        datetime applicationDate
        string notes
    }
    
    Interview {
        int id PK
        int applicationId FK
        int interviewStepId FK
        int employeeId FK
        datetime interviewDate
        string result
        int score
        string notes
    }
    
    %% Entidades de Perfil del Candidato
    Education {
        int id PK
        int candidateId FK
        string institution
        string title
        datetime startDate
        datetime endDate
    }
    
    WorkExperience {
        int id PK
        int candidateId FK
        string company
        string position
        string description
        datetime startDate
        datetime endDate
    }
    
    Resume {
        int id PK
        int candidateId FK
        string filePath
        string fileType
        datetime uploadDate
    }
    
    %% Entidades de Gestión
    Employee {
        int id PK
        int companyId FK
        string name
        string email UK
        string role
        boolean isActive
    }
    
    %% Entidades de Configuración de Entrevistas
    InterviewFlow {
        int id PK
        string description
    }
    
    InterviewStep {
        int id PK
        int interviewFlowId FK
        int interviewTypeId FK
        string name
        int orderIndex
    }
    
    InterviewType {
        int id PK
        string name
        string description
    }
    
    %% Relaciones Principales
    Candidate ||--o{ Education : "tiene"
    Candidate ||--o{ WorkExperience : "tiene"
    Candidate ||--o{ Resume : "tiene"
    Candidate ||--o{ Application : "aplica"
    
    Company ||--o{ Employee : "emplea"
    Company ||--o{ Position : "publica"
    
    Position ||--o{ Application : "recibe"
    Position }o--|| InterviewFlow : "utiliza"
    
    Application ||--o{ Interview : "genera"
    Application }o--|| InterviewStep : "esta_en"
    
    Interview }o--|| Employee : "realizada_por"
    Interview }o--|| InterviewStep : "corresponde_a"
    
    InterviewFlow ||--o{ InterviewStep : "contiene"
    InterviewFlow ||--o{ Position : "usado_en"
    
    InterviewStep }o--|| InterviewType : "es_de_tipo"
    InterviewStep ||--o{ Application : "procesa"
    InterviewStep ||--o{ Interview : "incluye"
    
    InterviewType ||--o{ InterviewStep : "define"
```

### Explicación de Relaciones Clave

#### Flujo Principal del Proceso de Selección
1. **Candidate** → **Application** → **Position**: Un candidato aplica a una posición
2. **Application** → **InterviewStep**: La aplicación se encuentra en un paso específico del flujo
3. **Application** → **Interview**: Se generan entrevistas para evaluar la aplicación
4. **Interview** → **Employee**: Las entrevistas son conducidas por empleados
5. **Interview** → **InterviewStep**: Cada entrevista corresponde a un paso del flujo

#### Configuración del Sistema
- **InterviewFlow** → **InterviewStep** → **InterviewType**: Define los pasos y tipos de entrevista
- **Position** → **InterviewFlow**: Cada posición utiliza un flujo de entrevista específico
- **Company** → **Position** + **Employee**: Las empresas publican posiciones y tienen empleados

#### Perfil del Candidato
- **Candidate** → **Education** + **WorkExperience** + **Resume**: Información completa del perfil

---

## Notas Técnicas

### Consideraciones de Performance
- **Índices automáticos**: En todas las foreign keys
- **Campos únicos indexados**: email en Candidate y Employee, name en Company
- **Consultas optimizadas**: Uso de includes en Prisma para evitar N+1

### Integridad de Datos
- **Cascada**: Las relaciones mantienen integridad referencial
- **Validaciones**: Tipos de datos estrictos con longitudes definidas
- **Constraints**: Valores únicos donde corresponde

### Escalabilidad
- **Auto-incremento**: Claves primarias enteras para mejor performance
- **Campos opcionales**: Flexibilidad para datos incompletos
- **Configuración modular**: Sistema de flujos de entrevista reutilizable

---

**Última actualización**: 2025-08-13  
**Versión del esquema**: 1.0  
**Estado**: ✅ Producción