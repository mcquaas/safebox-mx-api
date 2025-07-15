# 📮 SafeBox MX API - Postman Collection

Esta colección de Postman proporciona una suite completa de pruebas para la API de SafeBox MX.

## 📁 Archivos Incluidos

- `SafeBox-MX-API.postman_collection.json` - Colección completa con todos los endpoints
- `SafeBox-MX-API.postman_environment.json` - Variables de entorno predefinidas
- `README.md` - Esta documentación

## 🚀 Instalación Rápida

### Opción 1: Importar desde GitHub
1. Abrir Postman
2. Clic en "Import" → "Link"
3. Pegar: `https://raw.githubusercontent.com/mcquaas/safebox-mx-api/master/postman/SafeBox-MX-API.postman_collection.json`
4. Importar el entorno: `https://raw.githubusercontent.com/mcquaas/safebox-mx-api/master/postman/SafeBox-MX-API.postman_environment.json`

### Opción 2: Importar archivos locales
1. Descargar los archivos `.json` de este directorio
2. En Postman: Import → File → Seleccionar ambos archivos
3. Seleccionar el entorno "SafeBox MX API Environment"

## ⚙️ Configuración

### Variables de Entorno
La colección usa las siguientes variables que se configuran automáticamente:

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `base_url` | URL base de la API | `https://api.mysafebox.org` |
| `jwt_token` | Token JWT (se configura automáticamente) | `""` |
| `user_id` | ID del usuario autenticado | `""` |
| `contact_id` | ID del contacto para pruebas | `""` |
| `document_id` | ID del documento para pruebas | `""` |
| `category_id` | ID de categoría para pruebas | `""` |
| `log_id` | ID de log para pruebas | `""` |

### Configuración Automática
- El token JWT se configura automáticamente al hacer login
- Los IDs se guardan automáticamente al crear recursos
- Tests globales verifican tiempos de respuesta y códigos de estado

## 📋 Colecciones Disponibles

### 🔐 Authentication
- **Register User** - Registrar nuevo usuario
- **Login User** - Iniciar sesión (configura JWT automáticamente)
- **Get Current User** - Obtener información del usuario actual

### 👤 User Management
- **Get User Profile** - Perfil completo del usuario
- **Update Emergency PIN** - Actualizar PIN de emergencia
- **Configure Biometric Auth** - Configurar autenticación biométrica
- **Delete Account** - Eliminar cuenta (soft delete)

### 📁 Document Categories
- **Get All Categories** - Listar todas las categorías
- **Create Custom Category** - Crear categoría personalizada
- **Update Category** - Actualizar categoría
- **Delete Category** - Eliminar categoría

### 📄 Documents
- **Get All Documents** - Listar todos los documentos
- **Get Documents by Category** - Filtrar por categoría
- **Search Documents** - Buscar por título
- **Get Emergency Documents** - Documentos de emergencia
- **Upload Document** - Subir nuevo documento
- **Update Document** - Actualizar metadatos
- **Delete Document** - Eliminar documento
- **Get Document Statistics** - Estadísticas por categoría

### 👥 Contacts
- **Get All Contacts** - Listar contactos
- **Create Contact** - Crear contacto de emergencia
- **Update Contact** - Actualizar información
- **Delete Contact** - Eliminar contacto

### 🚨 Emergency System
- **Trigger Emergency** - Activar emergencia
- **Notify Specific Contact** - Notificar contacto específico

### 📊 Logs
- **Get Emergency Logs** - Historial de emergencias
- **Get Auth Logs** - Logs de autenticación

## 🔄 Flujo de Pruebas Recomendado

### 1. Autenticación
```
1. Register User (o usar Login User si ya existe)
2. Login User → Configura JWT automáticamente
3. Get Current User → Verificar autenticación
```

### 2. Configuración de Perfil
```
1. Get User Profile
2. Update Emergency PIN
3. Configure Biometric Auth
```

### 3. Gestión de Categorías
```
1. Get All Categories → Ver categorías del sistema
2. Create Custom Category → Crear categoría personalizada
3. Update Category → Modificar categoría
```

### 4. Gestión de Contactos
```
1. Create Contact → Crear contacto de emergencia
2. Get All Contacts → Listar contactos
3. Update Contact → Actualizar información
```

### 5. Gestión de Documentos
```
1. Upload Document → Subir documento
2. Get All Documents → Listar documentos
3. Get Documents by Category → Filtrar por categoría
4. Search Documents → Buscar por título
5. Update Document → Actualizar metadatos
6. Get Document Statistics → Ver estadísticas
```

### 6. Sistema de Emergencia
```
1. Trigger Emergency → Activar emergencia
2. Get Emergency Logs → Ver historial
3. Notify Specific Contact → Notificación manual
```

## 🧪 Tests Automáticos

Cada request incluye tests automáticos que verifican:

### Tests Globales (todos los endpoints)
- ✅ Código de estado exitoso (200, 201, 204)
- ✅ Tiempo de respuesta < 2000ms
- ✅ Presencia de Content-Type header

### Tests Específicos
- ✅ Estructura de respuesta correcta
- ✅ Configuración automática de variables
- ✅ Validación de datos de respuesta

## 🔧 Personalización

### Cambiar URL Base
Para usar con entorno local:
```json
{
  "key": "base_url",
  "value": "http://localhost:1337"
}
```

### Agregar Headers Personalizados
Modificar en Collection → Authorization o en requests individuales:
```json
{
  "key": "Custom-Header",
  "value": "valor-personalizado"
}
```

## 📝 Ejemplos de Uso

### Subir Documento
```javascript
// En el body (form-data):
{
  "title": "Acta de Nacimiento",
  "description": "Documento oficial",
  "category": "1",
  "emergencyOnly": "true",
  "file": [archivo seleccionado]
}
```

### Activar Emergencia
```javascript
// En el body (JSON):
{
  "location": "Ciudad de México, México",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "emergencyPin": "1234"
}
```

### Crear Contacto
```javascript
// En el body (JSON):
{
  "data": {
    "fullName": "María González",
    "phone": "+1-555-0123",
    "email": "maria@example.com",
    "relationship": "Esposa",
    "canReceiveEmergencyAlert": true,
    "canViewSharedDocs": false
  }
}
```

## 🐛 Troubleshooting

### Problemas Comunes

**401 Unauthorized**
- Verificar que el JWT token esté configurado
- Ejecutar "Login User" para obtener nuevo token

**404 Not Found**
- Verificar que la URL base esté correcta
- Verificar que el servidor esté funcionando

**500 Internal Server Error**
- Verificar logs del servidor
- Verificar que la base de datos esté disponible

### Verificar Configuración
```bash
# Verificar servidor
curl -I https://api.mysafebox.org

# Verificar autenticación
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" https://api.mysafebox.org/api/users/me
```

## 📞 Soporte

Para problemas con la colección de Postman:
- 🐛 [Reportar bug](https://github.com/mcquaas/safebox-mx-api/issues)
- 📧 Email: soporte@mysafebox.org
- 📚 [Documentación completa](https://github.com/mcquaas/safebox-mx-api)

---

**¡Happy Testing!** 🚀 