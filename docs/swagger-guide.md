# SafeBox MX API - Documentación Swagger

## 🚀 Acceso a la Documentación

La documentación interactiva de la API SafeBox MX está disponible en:

- **Producción**: https://api.mysafebox.org/api/documentation
- **Desarrollo**: http://localhost:1337/api/documentation

## 📋 Especificación OpenAPI

La especificación completa en formato JSON está disponible en:

- **Producción**: https://api.mysafebox.org/api/documentation/spec
- **Desarrollo**: http://localhost:1337/api/documentation/spec

## 🔧 Características de la Documentación

### ✅ Funcionalidades Incluidas

- **Interfaz interactiva**: Swagger UI 4.15.5 con diseño personalizado
- **Autenticación JWT**: Soporte completo para Bearer tokens
- **Pruebas en vivo**: Ejecutar requests directamente desde la interfaz
- **Esquemas detallados**: Modelos de datos completos para todos los endpoints
- **Filtros y búsqueda**: Navegación fácil por endpoints
- **Persistencia de autorización**: El token JWT se mantiene entre sesiones
- **Responsive design**: Funciona en dispositivos móviles y desktop

### 🎯 Endpoints Documentados

#### 🔐 Autenticación
- `POST /auth/local/register` - Registrar nuevo usuario
- `POST /auth/local` - Iniciar sesión
- `GET /users/me` - Obtener usuario actual

#### 👤 Gestión de Usuario
- `GET /user/me` - Obtener perfil completo
- `DELETE /user/me` - Eliminar cuenta (soft delete)
- `PUT /user/emergency-pin` - Actualizar PIN de emergencia
- `PUT /user/biometric` - Configurar autenticación biométrica

#### 📄 Documentos
- `GET /documents` - Listar documentos (con filtros)
- `POST /documents` - Subir nuevo documento
- `PUT /documents/{id}` - Actualizar documento
- `DELETE /documents/{id}` - Eliminar documento
- `GET /documents/stats` - Estadísticas de documentos

#### 📁 Categorías de Documentos
- `GET /document-categories` - Listar categorías
- `POST /document-categories` - Crear nueva categoría
- `PUT /document-categories/{id}` - Actualizar categoría
- `DELETE /document-categories/{id}` - Eliminar categoría

#### 👥 Contactos de Emergencia
- `GET /contacts` - Listar contactos
- `POST /contacts` - Crear nuevo contacto
- `PUT /contacts/{id}` - Actualizar contacto
- `DELETE /contacts/{id}` - Eliminar contacto

#### 🚨 Sistema de Emergencia
- `POST /emergency/trigger` - Activar botón de emergencia
- `POST /emergency/notify/{contactId}` - Notificar contacto específico
- `GET /emergency-logs` - Historial de emergencias

#### 📊 Logs y Auditoría
- `GET /auth-logs` - Historial de autenticación
- `GET /emergency-logs` - Historial de emergencias

## 🔑 Autenticación en Swagger

Para probar los endpoints protegidos:

1. **Registrar/Iniciar sesión** usando los endpoints de autenticación
2. **Copiar el JWT token** de la respuesta
3. **Hacer clic en "Authorize"** en la parte superior derecha
4. **Pegar el token** en el campo "bearerAuth" (sin "Bearer ")
5. **Hacer clic en "Authorize"** y luego "Close"

Ahora puedes probar todos los endpoints protegidos.

## 🎨 Personalización Visual

La documentación incluye estilos personalizados:

- **Colores**: Paleta de colores SafeBox MX
- **Tipografía**: Fuentes legibles y profesionales
- **Layout**: Diseño limpio sin elementos innecesarios
- **Branding**: Logo y favicon personalizados

## 🔄 Actualización de la Documentación

La documentación se actualiza automáticamente cuando:

- Se modifican los controladores
- Se agregan nuevas rutas
- Se cambian los esquemas de datos
- Se reconstruye la aplicación (`npm run build`)

## 🛠️ Desarrollo y Mantenimiento

### Archivos Clave

- `src/swagger.ts` - Configuración principal de Swagger
- `src/api/documentation/controllers/documentation.ts` - Controlador de documentación
- `src/api/documentation/routes/documentation.ts` - Rutas de documentación

### Agregar Nuevos Endpoints

Para documentar nuevos endpoints:

1. Agregar la ruta en el objeto `paths` en `src/swagger.ts`
2. Definir esquemas necesarios en `components.schemas`
3. Reconstruir la aplicación
4. Reiniciar el servidor

### Esquemas de Datos

Todos los modelos están definidos en `components.schemas`:

- `User` - Modelo de usuario
- `Document` - Modelo de documento
- `DocumentCategory` - Categoría de documento
- `Contact` - Contacto de emergencia
- `EmergencyLog` - Log de emergencia
- `AuthLog` - Log de autenticación
- `Error` - Modelo de error estándar

## 📚 Recursos Adicionales

- **Postman Collection**: [SafeBox-MX-API.postman_collection.json](../postman/SafeBox-MX-API.postman_collection.json)
- **Repositorio GitHub**: https://github.com/mcquaas/safebox-mx-api
- **Documentación Strapi**: https://docs.strapi.io/
- **OpenAPI 3.0**: https://swagger.io/specification/

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error 401 en endpoints protegidos**
   - Verificar que el token JWT esté configurado correctamente
   - Asegurarse de que el token no haya expirado

2. **Documentación no se actualiza**
   - Reconstruir la aplicación: `npm run build`
   - Reiniciar PM2: `pm2 restart strapi-api`

3. **Esquemas no se muestran correctamente**
   - Verificar la sintaxis en `src/swagger.ts`
   - Revisar los logs de la aplicación

### Logs de Documentación

```bash
# Ver logs de la aplicación
pm2 logs strapi-api

# Verificar estado del servidor
pm2 status

# Probar endpoints manualmente
curl -H "Authorization: Bearer <token>" https://api.mysafebox.org/api/documents
```

## 🔐 Seguridad

- La documentación está disponible públicamente para facilitar el desarrollo
- Los endpoints requieren autenticación JWT
- No se exponen datos sensibles en la documentación
- Los esquemas incluyen validaciones de seguridad

---

**Desarrollado por**: SafeBox MX Team  
**Versión**: 1.0.0  
**Última actualización**: Enero 2025 