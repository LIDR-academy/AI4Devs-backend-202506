# 🚀 Instrucciones de Configuración y Ejecución

## 📋 Pasos Completados ✅

1. **✅ Endpoints implementados**

   - GET /positions/:id/candidates
   - PUT /candidates/:id/stage

2. **✅ Código TypeScript compilado**

   - Sin errores de tipos
   - Prisma Client generado
   - Archivos en directorio `dist/`

3. **✅ Dependencias instaladas**
   - Node modules configurados
   - Prisma configurado

---

## 🔧 Próximos Pasos para Ejecutar

### **1. Iniciar Docker Desktop**

⚠️ **REQUERIDO:** Inicia Docker Desktop manualmente antes de continuar.

### **2. Iniciar Base de Datos PostgreSQL**

```bash
# Desde el directorio raíz del proyecto
docker-compose up -d
```

### **3. Ejecutar Migraciones de Prisma**

```bash
# Desde el directorio backend
cd backend
npx prisma migrate dev
```

### **4. Poblar Base de Datos con Datos de Prueba**

```bash
# Desde el directorio backend
npx ts-node prisma/seed.ts
```

### **5. Iniciar el Servidor**

```bash
# Opción 1: Modo desarrollo (recomendado)
npm run dev

# Opción 2: Modo producción
npm start
```

---

## 🧪 Probar los Endpoints

Una vez que el servidor esté ejecutándose en `http://localhost:3010`:

### **Verificar servidor:**

```bash
curl -X GET "http://localhost:3010/"
```

**Respuesta esperada:** `Hola LTI!`

### **Obtener candidatos de posición 1:**

```bash
curl -X GET "http://localhost:3010/positions/1/candidates"
```

### **Mover candidato a siguiente etapa:**

```bash
curl -X PUT "http://localhost:3010/candidates/1/stage" \
  -H "Content-Type: application/json" \
  -d '{"currentInterviewStep": 3}'
```

---

## 📊 Datos de Prueba Disponibles

### **Posiciones:**

- **ID 1:** Software Engineer
- **ID 2:** Data Scientist

### **Candidatos:**

- **ID 1:** John Doe
- **ID 2:** Jane Smith
- **ID 3:** Carlos García

### **Pasos de Entrevista:**

- **ID 1:** Initial Screening
- **ID 2:** Technical Interview
- **ID 3:** Manager Interview

---

## 🐛 Solución de Problemas

### **Si Docker no funciona:**

1. Asegúrate de que Docker Desktop esté ejecutándose
2. Verifica que el puerto 5432 esté disponible

### **Si Prisma da error:**

```bash
# Regenerar cliente
npx prisma generate

# Resetear base de datos
npx prisma migrate reset
```

### **Si el servidor no inicia:**

1. Verifica que estés en el directorio `backend/`
2. Compila primero: `npm run build`
3. Usa modo desarrollo: `npm run dev`

---

## ✅ Estado Actual

**🎯 Todo listo para ejecutar:**

- ✅ Endpoints implementados
- ✅ Código compilado sin errores
- ✅ Prisma configurado
- ✅ Documentación completa

**🚀 Solo falta:**

- 🔄 Iniciar Docker Desktop
- 🔄 Ejecutar base de datos
- 🔄 Aplicar migraciones
- 🔄 Iniciar servidor

---

¡Los endpoints para el kanban de candidatos están completamente implementados y listos para usar! 🎉
