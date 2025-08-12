# Historia de Usuario: Listar Posiciones Abiertas

## ID: HU-001
## Título: Como reclutador, quiero ver una lista de posiciones abiertas para poder gestionar las vacantes disponibles

---

## 📋 Descripción de la Funcionalidad

El reclutador necesita visualizar todas las posiciones abiertas (status = "Open" e isVisible = true) en el dashboard principal, junto con la funcionalidad existente de "Añadir Candidato". Esta funcionalidad debe mostrar información relevante de cada posición y permitir acciones básicas como ver detalles, editar o cerrar posiciones.

### **Objetivo de Negocio**
- Mejorar la visibilidad de las posiciones abiertas para los reclutadores
- Facilitar la gestión y seguimiento de vacantes activas
- Optimizar el flujo de trabajo del reclutador

### **Criterios de Aceptación**
- [ ] Se muestran todas las posiciones con status "Active" e isVisible = true
- [ ] Cada posición muestra información esencial (título, empresa, ubicación, estado)
- [ ] Se incluye un botón para añadir candidato (funcionalidad existente)
- [ ] Se puede acceder a los detalles completos de cada posición
- [ ] La lista se actualiza en tiempo real
- [ ] Se implementa paginación para más de 10 posiciones

---

## 🏗️ Arquitectura y Diseño

### **Patrón Arquitectónico**
- **Backend**: Clean Architecture (DDD)
- **Frontend**: Component-Based Architecture
- **Principios**: DRY, Single Responsibility, Separation of Concerns

### **Estructura de Datos**
```typescript
interface Position {
  id: number;
  title: string;
  company: { name: string };
  location: string;
  status: string;
  isVisible: boolean;
  applicationDeadline?: Date;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
}
```

---

## 🔧 Implementación Técnica

### **Backend - Nuevos Endpoints**

#### **GET /positions**
```typescript
// Obtener posiciones abiertas con filtros
GET /api/positions?status=Active&isVisible=true&page=1&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Desarrollador Full Stack",
      "company": { "name": "TechCorp" },
      "location": "Madrid",
      "status": "Active",
      "isVisible": true,
      "applicationDeadline": "2025-02-28T00:00:00Z",
      "employmentType": "Full-time",
      "salaryMin": 35000,
      "salaryMax": 45000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### **GET /positions/:id**
```typescript
// Obtener detalles completos de una posición
GET /api/positions/1
```

### **Archivos a Crear/Modificar**

#### **Backend**
1. **`src/domain/models/Position.ts`** - Modelo de dominio
2. **`src/application/services/positionService.ts`** - Lógica de negocio
3. **`src/presentation/controllers/positionController.ts`** - Controlador
4. **`src/routes/positionRoutes.ts`** - Rutas de la API
5. **`src/application/validator.ts`** - Validaciones

#### **Frontend**
1. **`src/components/PositionList.js`** - Lista de posiciones
2. **`src/components/PositionCard.js`** - Tarjeta individual de posición
3. **`src/services/positionService.js`** - Servicio de API
4. **`src/components/RecruiterDashboard.js`** - Modificar dashboard existente

---

## 📁 Estructura de Archivos Detallada

### **1. Backend - Modelo de Dominio**
```typescript
// src/domain/models/Position.ts
export class Position {
  id?: number;
  title: string;
  companyId: number;
  interviewFlowId: number;
  description: string;
  status: string;
  isVisible: boolean;
  location: string;
  // ... otros campos

  static async findActivePositions(page: number = 1, limit: number = 10) {
    // Implementar lógica de búsqueda con Prisma
  }
}
```

### **2. Backend - Servicio de Aplicación**
```typescript
// src/application/services/positionService.ts
export const getActivePositions = async (page: number, limit: number) => {
  // Lógica de negocio para obtener posiciones activas
  // Implementar paginación y filtros
};
```

### **3. Backend - Controlador**
```typescript
// src/presentation/controllers/positionController.ts
export const getActivePositions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const positions = await getActivePositions(Number(page), Number(limit));
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
```

### **4. Frontend - Componente de Lista**
```typescript
// src/components/PositionList.js
const PositionList = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchPositions();
  }, []);

  return (
    <div className="position-list">
      {positions.map(position => (
        <PositionCard key={position.id} position={position} />
      ))}
    </div>
  );
};
```

---

## 🧪 Testing y Calidad

### **Tests Unitarios Backend**
```typescript
// src/tests/positionService.test.ts
describe('PositionService', () => {
  test('should return active positions with pagination', async () => {
    // Test de paginación
  });
  
  test('should filter by status and visibility', async () => {
    // Test de filtros
  });
});
```

### **Tests de Integración**
```typescript
// src/tests/positionController.test.ts
describe('PositionController', () => {
  test('GET /positions should return 200 with active positions', async () => {
    // Test de endpoint
  });
});
```

### **Tests Frontend**
```typescript
// src/components/__tests__/PositionList.test.js
describe('PositionList', () => {
  test('renders list of positions', () => {
    // Test de renderizado
  });
});
```

---

## 🔒 Requisitos No Funcionales

### **Seguridad**
- [ ] Validación de entrada en todos los endpoints
- [ ] Sanitización de datos para prevenir XSS
- [ ] Rate limiting: máximo 100 requests por minuto por IP
- [ ] Autenticación requerida para endpoints sensibles

### **Rendimiento**
- [ ] **Response Time**: < 200ms para listas de posiciones
- [ ] **Throughput**: Soporte para 1000+ posiciones simultáneas
- [ ] **Caching**: Cache Redis para posiciones frecuentemente consultadas
- [ ] **Paginación**: Máximo 50 posiciones por página

### **Escalabilidad**
- [ ] **Base de Datos**: Índices en campos de filtrado (status, isVisible, companyId)
- [ ] **API**: Implementar cursor-based pagination para grandes volúmenes
- [ ] **Frontend**: Lazy loading para listas extensas

### **Disponibilidad**
- [ ] **Uptime**: 99.9% de disponibilidad
- [ ] **Fallback**: Respuesta offline-friendly para listas de posiciones
- [ ] **Monitoring**: Logs de performance y errores

---

## 📱 UI/UX Especificaciones

### **Layout del Dashboard**
```
┌─────────────────────────────────────────────────────────────┐
│                    LTI Logo                                 │
│                 Dashboard del Reclutador                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ Añadir Candidato│  │      Posiciones Abiertas        │  │
│  │                 │  │                                 │  │
│  │ [Botón]         │  │  ┌─────────────────────────────┐ │  │
│  └─────────────────┘  │  │ Título: Desarrollador FS    │ │  │
│                        │  │ Empresa: TechCorp           │ │  │
│                        │  │ Ubicación: Madrid           │ │  │
│                        │  │ [Ver Detalles] [Editar]     │ │  │
│                        │  └─────────────────────────────┘ │  │
│                        │                                 │  │
│                        │  ┌─────────────────────────────┐ │  │
│                        │  │ Título: UX Designer         │ │  │
│                        │  │ Empresa: DesignStudio       │ │  │
│                        │  │ Ubicación: Barcelona        │ │  │
│                        │  │ [Ver Detalles] [Editar]     │ │  │
│                        │  └─────────────────────────────┘ │  │
│                        │                                 │  │
│                        │  [Página 1] [2] [3] [Siguiente] │  │
│                        └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **Componentes UI**
- **PositionCard**: Tarjeta individual con información esencial
- **PositionList**: Contenedor con paginación
- **PositionFilters**: Filtros por empresa, ubicación, tipo de empleo
- **Pagination**: Navegación entre páginas

---

## 🚀 Criterios de Definición de Terminado (DoD)

### **Funcional**
- [ ] Endpoint GET /positions retorna posiciones activas
- [ ] Frontend muestra lista de posiciones en dashboard
- [ ] Paginación funciona correctamente
- [ ] Filtros aplican correctamente

### **Técnico**
- [ ] Tests unitarios pasan (cobertura > 80%)
- [ ] Tests de integración pasan
- [ ] Código sigue estándares de linting
- [ ] Documentación de API actualizada

### **Calidad**
- [ ] Code review completado
- [ ] Performance testing realizado
- [ ] Security testing completado
- [ ] UX testing con usuarios finales

---

## 📊 Métricas de Éxito

### **Técnicas**
- **Performance**: Response time < 200ms
- **Reliability**: 99.9% uptime
- **Coverage**: > 80% test coverage

### **Negocio**
- **Usabilidad**: Tiempo para listar posiciones < 2 segundos
- **Adopción**: 90% de reclutadores usan la funcionalidad
- **Eficiencia**: Reducción del 30% en tiempo de gestión de posiciones

---

## 🔄 Dependencias y Pre-requisitos

### **Técnicas**
- [ ] Base de datos PostgreSQL funcionando
- [ ] Prisma ORM configurado
- [ ] Frontend React funcionando
- [ ] Sistema de autenticación implementado

### **Negocio**
- [ ] Posiciones existentes en la base de datos
- [ ] Usuarios reclutadores configurados
- [ ] Permisos de acceso definidos

---

*Historia de Usuario generada para el proyecto LTI - Talent Tracking System*
*Versión: 1.0*
*Fecha: 2025*
*Prioridad: Alta*
