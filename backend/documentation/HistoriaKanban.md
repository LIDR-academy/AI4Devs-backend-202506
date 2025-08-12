````markdown
# Historia de Usuario: Tablero Kanban de Candidatos por Posición

## ID: HU-002
## Título: Como reclutador, quiero ver un tablero Kanban de candidatos cuando haga clic en "Detalle" de una posición, para visualizar el progreso de cada candidato a través de las etapas de entrevista definidas

---

## 📋 Descripción de la Funcionalidad

El reclutador necesita visualizar el estado actual de todos los candidatos aplicados a una posición específica en formato de tablero Kanban. Cada columna representa una etapa del proceso de entrevista (InterviewStep) y cada candidato aparece como una tarjeta en la columna correspondiente a su última entrevista realizada, mostrando su nombre y score promedio con estrellas.

### **Objetivo de Negocio**
- Proporcionar una vista visual del pipeline de candidatos por posición
- Facilitar el seguimiento del progreso de candidatos en el proceso de selección
- Mejorar la toma de decisiones del reclutador con información de scores consolidada
- Optimizar la gestión del flujo de entrevistas

### **Criterios de Aceptación**

#### **Funcionalidad Principal**
- [ ] Se accede al Kanban desde un botón "Detalle" en cada PositionCard
- [ ] Las columnas del Kanban se generan dinámicamente basadas en los InterviewStep de la posición
- [ ] La primera columna siempre es "Aplicación" para candidatos sin entrevistas
- [ ] Cada candidato aparece solo en la columna de su última entrevista (InterviewStepId más reciente)
- [ ] Los candidatos muestran: Nombre completo y score promedio en estrellas
- [ ] Los scores van de 0 a 5, mostrando decimales con estrellas semi-rellenas

#### **Validaciones y Errores**
- [ ] Si la posición no tiene InterviewFlowId, mostrar error: "Esta posición no tiene definidas etapas"
- [ ] Si no existen InterviewStep para el InterviewFlow, mostrar el mismo error
- [ ] Los candidatos sin scores muestran 0 estrellas (ninguna rellena)

#### **Navegación**
- [ ] El Kanban abre en una nueva página: `/positions/:id/kanban`
- [ ] Incluye botón de regreso a la lista de posiciones
- [ ] Muestra el título de la posición en el header

---

## 🏗️ Arquitectura y Diseño

### **Patrón Arquitectónico**
- **Backend**: Clean Architecture (DDD)
- **Frontend**: Component-Based Architecture con React
- **Principios**: DRY, Single Responsibility, Separation of Concerns

### **Estructura de Datos**

#### **Respuesta del API Kanban**
```typescript
interface KanbanData {
  position: {
    id: number;
    title: string;
    company: { name: string };
  };
  columns: KanbanColumn[];
  error?: string;
}

interface KanbanColumn {
  id: number | 'application';
  name: string;
  orderIndex: number;
  candidates: KanbanCandidate[];
}

interface KanbanCandidate {
  applicationId: number;
  candidateId: number;
  firstName: string;
  lastName: string;
  averageScore: number; // 0-5 con decimales
  lastInterviewDate?: Date;
}
```

#### **Relaciones de Base de Datos**
```
Position → InterviewFlow → InterviewStep (columnas)
Position → Application → Candidate (candidatos)
Application → Interview → score (para promedios)
```

---

## 🔧 Implementación Técnica

### **Backend - Nuevos Endpoints**

#### **GET /positions/:id/kanban**
```typescript
// Obtener datos completos del Kanban para una posición
GET /api/positions/1/kanban
```

**Response Exitosa:**
```json
{
  "success": true,
  "data": {
    "position": {
      "id": 1,
      "title": "Desarrollador Full Stack",
      "company": { "name": "TechCorp" }
    },
    "columns": [
      {
        "id": "application",
        "name": "Aplicación",
        "orderIndex": 0,
        "candidates": [
          {
            "applicationId": 1,
            "candidateId": 1,
            "firstName": "Juan",
            "lastName": "Pérez",
            "averageScore": 0,
            "lastInterviewDate": null
          }
        ]
      },
      {
        "id": 1,
        "name": "Entrevista Técnica",
        "orderIndex": 1,
        "candidates": [
          {
            "applicationId": 2,
            "candidateId": 2,
            "firstName": "María",
            "lastName": "García",
            "averageScore": 4.5,
            "lastInterviewDate": "2025-08-10T10:00:00Z"
          }
        ]
      },
      {
        "id": 2,
        "name": "Entrevista RRHH",
        "orderIndex": 2,
        "candidates": [
          {
            "applicationId": 3,
            "candidateId": 3,
            "firstName": "Carlos",
            "lastName": "López",
            "averageScore": 3.8,
            "lastInterviewDate": "2025-08-11T14:30:00Z"
          }
        ]
      }
    ]
  }
}
```

**Response de Error:**
```json
{
  "success": false,
  "error": "Esta posición no tiene definidas etapas",
  "message": "La posición no tiene un InterviewFlow configurado o no tiene InterviewSteps asociados"
}
```

### **Archivos a Crear/Modificar**

#### **Backend**
1. **`src/application/services/kanbanService.ts`** - Lógica de negocio del Kanban
2. **`src/presentation/controllers/kanbanController.ts`** - Controlador de endpoints
3. **`src/routes/kanbanRoutes.ts`** - Rutas específicas del Kanban
4. **`src/domain/models/Position.ts`** - Extender con método `getKanbanData()`
5. **`src/domain/models/InterviewStep.ts`** - Extender con `findByInterviewFlow()`
6. **`src/domain/models/Application.ts`** - Extender con métodos de scores

#### **Frontend**
1. **`src/pages/KanbanPage.js`** - Página principal del Kanban
2. **`src/components/KanbanBoard.js`** - Componente del tablero completo
3. **`src/components/KanbanColumn.js`** - Columna individual del Kanban
4. **`src/components/CandidateCard.js`** - Tarjeta de candidato
5. **`src/components/StarRating.js`** - Componente de estrellas con decimales
6. **`src/services/kanbanService.js`** - Cliente API del Kanban
7. **`src/components/PositionCard.js`** - Modificar para agregar botón "Detalle"
8. **`src/styles/kanban.css`** - Estilos específicos del Kanban

---

## 📁 Estructura de Archivos Detallada

### **1. Backend - Servicio de Aplicación**
```typescript
// src/application/services/kanbanService.ts
export interface KanbanData {
  position: {
    id: number;
    title: string;
    company: { name: string };
  };
  columns: KanbanColumn[];
}

export const getKanbanData = async (positionId: number): Promise<KanbanData> => {
  // 1. Validar que la posición existe y tiene InterviewFlow
  // 2. Obtener InterviewSteps ordenados por orderIndex
  // 3. Obtener todas las Applications de la posición
  // 4. Calcular scores promedio por Application
  // 5. Ubicar candidatos en columnas según última entrevista
  // 6. Crear columna "Aplicación" para candidatos sin entrevistas
};

export const calculateAverageScore = async (applicationId: number): Promise<number> => {
  // Calcular promedio de scores de todas las entrevistas de una aplicación
};

export const validateInterviewFlow = async (positionId: number): Promise<boolean> => {
  // Validar que la posición tiene InterviewFlow e InterviewSteps
};
```

### **2. Backend - Controlador**
```typescript
// src/presentation/controllers/kanbanController.ts
export const getPositionKanban = async (req: Request, res: Response) => {
  try {
    const positionId = parseInt(req.params.id);
    
    // Validar ID
    if (isNaN(positionId) || positionId < 1) {
      return res.status(400).json({
        success: false,
        error: 'ID de posición inválido'
      });
    }

    // Validar que la posición tiene etapas definidas
    const hasValidFlow = await validateInterviewFlow(positionId);
    if (!hasValidFlow) {
      return res.status(400).json({
        success: false,
        error: 'Esta posición no tiene definidas etapas'
      });
    }

    // Obtener datos del Kanban
    const kanbanData = await getKanbanData(positionId);
    
    res.status(200).json({
      success: true,
      data: kanbanData
    });

  } catch (error) {
    console.error('Error en getPositionKanban:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
```

### **3. Frontend - Página Principal**
```typescript
// src/pages/KanbanPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import { getKanbanData } from '../services/kanbanService';

const KanbanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [kanbanData, setKanbanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKanbanData();
  }, [id]);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const data = await getKanbanData(id);
      setKanbanData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando tablero...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="kanban-page">
      <header className="kanban-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Volver a Posiciones
        </button>
        <h1>{kanbanData.position.title}</h1>
        <p>{kanbanData.position.company.name}</p>
      </header>
      
      <KanbanBoard columns={kanbanData.columns} />
    </div>
  );
};

export default KanbanPage;
```

### **4. Frontend - Componente Kanban Board**
```typescript
// src/components/KanbanBoard.js
import React from 'react';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ columns }) => {
  return (
    <div className="kanban-board">
      {columns.map(column => (
        <KanbanColumn 
          key={column.id} 
          column={column} 
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
```

### **5. Frontend - Componente Columna**
```typescript
// src/components/KanbanColumn.js
import React from 'react';
import CandidateCard from './CandidateCard';

const KanbanColumn = ({ column }) => {
  return (
    <div className="kanban-column">
      <div className="column-header">
        <h3>{column.name}</h3>
        <span className="candidate-count">{column.candidates.length}</span>
      </div>
      
      <div className="column-content">
        {column.candidates.map(candidate => (
          <CandidateCard 
            key={candidate.applicationId} 
            candidate={candidate} 
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
```

### **6. Frontend - Tarjeta de Candidato**
```typescript
// src/components/CandidateCard.js
import React from 'react';
import StarRating from './StarRating';

const CandidateCard = ({ candidate }) => {
  return (
    <div className="candidate-card">
      <div className="candidate-name">
        {candidate.firstName} {candidate.lastName}
      </div>
      
      <div className="candidate-score">
        <StarRating score={candidate.averageScore} />
        <span className="score-text">
          {candidate.averageScore.toFixed(1)}
        </span>
      </div>
      
      {candidate.lastInterviewDate && (
        <div className="last-interview">
          Última entrevista: {new Date(candidate.lastInterviewDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
```

### **7. Frontend - Componente de Estrellas**
```typescript
// src/components/StarRating.js
import React from 'react';

const StarRating = ({ score, maxStars = 5 }) => {
  const renderStar = (index) => {
    const starValue = index + 1;
    let starClass = 'star';
    
    if (score >= starValue) {
      starClass += ' star-full';
    } else if (score >= starValue - 0.5) {
      starClass += ' star-half';
    } else {
      starClass += ' star-empty';
    }
    
    return (
      <span key={index} className={starClass}>
        ★
      </span>
    );
  };

  return (
    <div className="star-rating">
      {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
    </div>
  );
};

export default StarRating;
```

---

## 🧪 Testing y Calidad

### **Tests Unitarios Backend**
```typescript
// src/tests/kanbanService.test.ts
describe('KanbanService', () => {
  test('should return kanban data with correct columns', async () => {
    // Test de estructura de datos
  });
  
  test('should calculate average scores correctly', async () => {
    // Test de cálculo de promedios
  });
  
  test('should place candidates in correct columns', async () => {
    // Test de ubicación de candidatos
  });
  
  test('should handle positions without interview flow', async () => {
    // Test de validación de errores
  });
});
```

### **Tests de Integración Backend**
```typescript
// src/tests/kanbanController.test.ts
describe('KanbanController', () => {
  test('GET /positions/:id/kanban should return 200 with valid data', async () => {
    // Test de endpoint exitoso
  });
  
  test('GET /positions/:id/kanban should return 400 for position without flow', async () => {
    // Test de manejo de errores
  });
});
```

### **Tests Frontend**
```typescript
// src/components/__tests__/KanbanBoard.test.js
describe('KanbanBoard', () => {
  test('renders columns correctly', () => {
    // Test de renderizado de columnas
  });
  
  test('displays candidates in correct columns', () => {
    // Test de ubicación de candidatos
  });
});

// src/components/__tests__/StarRating.test.js
describe('StarRating', () => {
  test('renders correct number of filled stars', () => {
    // Test de estrellas completas
  });
  
  test('renders half stars for decimal scores', () => {
    // Test de estrellas semi-rellenas
  });
});
```

---

## 🔒 Requisitos No Funcionales

### **Seguridad**
- [ ] Validación de positionId en el endpoint
- [ ] Verificación de permisos del reclutador para ver la posición
- [ ] Sanitización de datos de candidatos para prevenir XSS
- [ ] Rate limiting: máximo 50 requests por minuto para endpoints de Kanban

### **Rendimiento**
- [ ] **Response Time**: < 500ms para obtener datos del Kanban
- [ ] **Throughput**: Soporte para posiciones con hasta 200 candidatos
- [ ] **Optimización**: Una sola consulta SQL con JOINs para obtener todos los datos
- [ ] **Caching**: Cache de 5 minutos para datos del Kanban por posición

### **Escalabilidad**
- [ ] **Base de Datos**: Índices en (positionId, candidateId, applicationId)
- [ ] **Frontend**: Virtualización para listas de candidatos > 50
- [ ] **API**: Paginación opcional para candidatos si exceden límite

### **Disponibilidad**
- [ ] **Uptime**: 99.9% de disponibilidad
- [ ] **Fallback**: Mensaje de error claro cuando fallan los datos
- [ ] **Monitoring**: Logs de performance específicos para queries del Kanban

---

## 📱 UI/UX Especificaciones

### **Layout del Kanban**
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  ← Volver a Posiciones    Desarrollador Full Stack - TechCorp                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ Aplicación  │  │ Entrevista  │  │ Entrevista  │  │ Entrevista  │               │
│  │     (2)     │  │ Técnica (3) │  │ RRHH   (1)  │  │ Final  (0)  │               │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤  ├─────────────┤               │
│  │┌───────────┐│  │┌───────────┐│  │┌───────────┐│  │             │               │
│  ││Juan Pérez ││  ││María García││  ││Carlos López││  │             │               │
│  ││☆☆☆☆☆     ││  ││★★★★★     ││  ││★★★★☆     ││  │             │               │
│  ││0.0        ││  ││4.5        ││  ││3.8        ││  │             │               │
│  │└───────────┘│  │└───────────┘│  │└───────────┘│  │             │               │
│  │┌───────────┐│  │┌───────────┐│  │             │  │             │               │
│  ││Ana Torres ││  ││Luis Martín││  │             │  │             │               │
│  ││☆☆☆☆☆     ││  ││★★★☆☆     ││  │             │  │             │               │
│  ││0.0        ││  ││3.2        ││  │             │  │             │               │
│  │└───────────┘│  │└───────────┘│  │             │  │             │               │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### **Componentes UI Detallados**

#### **KanbanColumn**
- **Header**: Nombre de la etapa + contador de candidatos
- **Content**: Lista vertical de CandidateCard
- **Styling**: Bordes redondeados, sombra sutil, color de fondo diferenciado

#### **CandidateCard**
- **Layout**: Nombre arriba, estrellas + score numérico abajo
- **Estrellas**: ★ (rellena), ☆ (vacía), ⭐ (semi-rellena para decimales)
- **Hover**: Efecto de elevación y border destacado
- **Color**: Score > 4 (verde), 2-4 (amarillo), < 2 (rojo)

#### **StarRating**
- **Precisión**: Mostrar hasta 1 decimal
- **Semi-relleno**: Para scores como 3.5, mostrar 3 estrellas llenas + 1 media
- **Accesibilidad**: Alt text con score numérico

---

## 🚀 Criterios de Definición de Terminado (DoD)

### **Funcional**
- [ ] Endpoint GET /positions/:id/kanban funciona correctamente
- [ ] Frontend muestra Kanban con columnas dinámicas
- [ ] Candidatos aparecen en columnas correctas según última entrevista
- [ ] Scores promedio se calculan correctamente
- [ ] Estrellas muestran decimales con semi-relleno
- [ ] Manejo de errores para posiciones sin etapas definidas
- [ ] Navegación desde PositionCard funciona

### **Técnico**
- [ ] Tests unitarios pasan (cobertura > 80%)
- [ ] Tests de integración pasan
- [ ] Código sigue estándares de linting
- [ ] Queries SQL optimizadas (< 500ms)
- [ ] Responsive design funciona en móvil y desktop

### **Calidad**
- [ ] Code review completado
- [ ] Performance testing realizado (< 500ms response time)
- [ ] UX testing con usuarios finales
- [ ] Documentación de API actualizada

---

## 📊 Métricas de Éxito

### **Técnicas**
- **Performance**: Response time < 500ms para Kanban con 50 candidatos
- **Reliability**: 99.9% uptime para endpoints de Kanban
- **Coverage**: > 80% test coverage para nuevos componentes

### **Negocio**
- **Usabilidad**: Tiempo para entender estado de candidatos < 10 segundos
- **Adopción**: 85% de reclutadores usan vista de Kanban semanalmente
- **Eficiencia**: Reducción del 40% en tiempo para revisar pipeline de candidatos

### **UX**
- **Carga**: Kanban se carga completamente en < 3 segundos
- **Interacción**: 0 errores de usabilidad en testing con 5 usuarios
- **Comprensión**: 100% de usuarios entienden el sistema de estrellas

---

## 🔄 Dependencias y Pre-requisitos

### **Técnicas**
- [ ] Historia HU-001 (Listar Posiciones) completada
- [ ] Base de datos con datos de prueba:
  - Posiciones con InterviewFlow configurado
  - InterviewSteps asociados a InterviewFlow
  - Applications con candidatos
  - Interviews con scores de 1-5
- [ ] React Router configurado
- [ ] Sistema de navegación funcionando

### **Negocio**
- [ ] Definición clara de etapas de entrevista por tipo de posición
- [ ] Criterios de scoring establecidos (1-5)
- [ ] Flujo de candidatos en diferentes etapas para testing

### **Datos de Prueba Necesarios**
```sql
-- Posición con InterviewFlow
-- InterviewFlow con 3-4 InterviewSteps
-- 10-15 Applications para la posición
-- 20-30 Interviews con scores variados
-- Candidatos en diferentes etapas del proceso
```

---

## 🎨 Referencias de Diseño

### **Inspiración Visual**
- **Trello**: Layout de columnas y tarjetas
- **Jira**: Sistema de estados y transiciones
- **GitHub Projects**: Minimalismo y claridad

### **Paleta de Colores**
- **Columnas**: Fondos suaves (#f8f9fa, #e9ecef)
- **Tarjetas**: Blanco con bordes sutiles
- **Estrellas**: Dorado (#ffd700) para rellenas, gris (#ccc) para vacías
- **Scores**: Verde (#28a745) alto, amarillo (#ffc107) medio, rojo (#dc3545) bajo

---

*Historia de Usuario generada para el proyecto LTI - Talent Tracking System*
*Versión: 1.0*
*Fecha: Agosto 2025*
*Prioridad: Alta*
*Dependencias: HU-001 (Listar Posiciones Abiertas)*

````
