# SafeBox MX - API Backend

## 🔐 Descripción

SafeBox MX es una bóveda digital segura que permite a los usuarios almacenar, organizar y compartir documentos importantes de forma segura y accesible desde cualquier lugar. Diseñado especialmente para personas con vínculos entre México y EE.UU., ofrece cifrado de nivel militar, botón de emergencia y contactos designados.

## 🚀 Características Principales

### 🔒 Seguridad
- **Cifrado de nivel militar** para todos los documentos
- **PIN de emergencia** configurable
- **Autenticación biométrica** (configurable)
- **Soft delete** para cuentas de usuario
- **Registro de eventos** de autenticación

### 📂 Gestión de Documentos
- **Subida y clasificación** de documentos
- **Categorización flexible** (sistema y personalizadas)
- **Búsqueda avanzada** por título y categoría
- **Visibilidad controlada** (normal, contactos, emergencia)
- **Preview y descarga** segura

### 🚨 Sistema de Emergencia
- **Botón de emergencia** con notificación automática
- **Contactos de emergencia** con diferentes permisos
- **Compartir documentos** automáticamente en emergencias
- **Notificaciones SMS/Email** con ubicación GPS
- **Logs de activación** para auditoría

### 👥 Gestión de Contactos
- **Contactos de emergencia** con roles específicos
- **Permisos granulares** (alertas, documentos)
- **Notificación manual** a contactos específicos

## 🛠️ Tecnologías

- **Backend**: Strapi V5 (Node.js, TypeScript)
- **Base de datos**: SQLite (desarrollo) / PostgreSQL (producción)
- **Autenticación**: JWT + Users & Permissions plugin
- **Documentación**: Swagger UI + OpenAPI 3.0
- **Deployment**: PM2 + Nginx + Let's Encrypt SSL
- **Notificaciones**: Email (Strapi) + SMS (Twilio - por implementar)

## 📊 Modelos de Datos

### 1. User (Extensión del modelo base)
```typescript
{
  firstName: string
  lastName: string
  email: email
  phone: string
  emergencyPin: string (cifrado)
  biometricEnabled: boolean
  deletedAt: datetime (soft-delete)
  // Relaciones
  contacts: Contact[]
  documents: Document[]
  documentCategories: DocumentCategory[]
}
```

### 2. Document
```typescript
{
  title: string
  description: text
  file: media
  uploadedAt: datetime
  visibleToContacts: boolean
  emergencyOnly: boolean
  // Relaciones
  category: DocumentCategory
  owner: User
}
```

### 3. DocumentCategory
```typescript
{
  name: string
  icon: string
  systemCategory: boolean
  // Relaciones
  owner: User (si es personalizada)
  documents: Document[]
}
```

### 4. Contact
```typescript
{
  fullName: string
  phone: string
  email: email
  relationship: string
  canReceiveEmergencyAlert: boolean
  canViewSharedDocs: boolean
  // Relaciones
  owner: User
}
```

### 5. EmergencyLog
```typescript
{
  triggeredAt: datetime
  location: string
  latitude: decimal
  longitude: decimal
  // Relaciones
  user: User
  contactNotified: Contact
  documentsShared: Document[]
}
```

### 6. AuthLog
```typescript
{
  method: enum (pin, biometric, password)
  success: boolean
  timestamp: datetime
  ipAddress: string
  userAgent: string
  // Relaciones
  user: User
}
```

## 🔗 API Endpoints

### 🚨 Emergencia
- `POST /api/emergency/trigger` - Activar emergencia
- `POST /api/emergency/notify/:contactId` - Notificar contacto manualmente

### 📄 Documentos
- `GET /api/documents` - Listar documentos (con filtros)
- `POST /api/documents` - Subir documento
- `PUT /api/documents/:id` - Actualizar documento
- `DELETE /api/documents/:id` - Eliminar documento
- `GET /api/documents/stats` - Estadísticas de documentos

### 👤 Usuario
- `GET /api/user/me` - Obtener perfil
- `DELETE /api/user/me` - Eliminar cuenta (soft delete)
- `PUT /api/user/emergency-pin` - Actualizar PIN de emergencia
- `PUT /api/user/biometric` - Configurar autenticación biométrica

### 📞 Contactos
- `GET /api/contacts` - Listar contactos
- `POST /api/contacts` - Crear contacto
- `PUT /api/contacts/:id` - Actualizar contacto
- `DELETE /api/contacts/:id` - Eliminar contacto

### 📁 Categorías
- `GET /api/document-categories` - Listar categorías
- `POST /api/document-categories` - Crear categoría personalizada

## 🚀 Instalación y Deployment

### Requisitos
- Node.js 18+ 
- npm 6+
- PM2 (para producción)
- Nginx (para reverse proxy)

### Desarrollo
```bash
# Instalar dependencias
npm install

# Generar tipos TypeScript
npm run strapi ts:generate-types

# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en producción
npm start
```

### Producción (PM2 + Nginx)
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar con PM2
pm2 start ecosystem.config.js

# Configurar inicio automático
pm2 startup
pm2 save

# Configurar Nginx (ver configuración en /etc/nginx/sites-available/)
sudo systemctl enable nginx
sudo systemctl start nginx

# SSL con Let's Encrypt
sudo certbot --nginx -d tu-dominio.com
```

## 📝 Variables de Entorno

```bash
# Servidor
HOST=0.0.0.0
PORT=1337
NODE_ENV=production

# Seguridad (CAMBIAR EN PRODUCCIÓN)
APP_KEYS=clave1,clave2,clave3,clave4
API_TOKEN_SALT=tu_salt_aqui
ADMIN_JWT_SECRET=tu_secret_aqui
TRANSFER_TOKEN_SALT=tu_salt_aqui
JWT_SECRET=tu_jwt_secret_aqui

# Base de datos (SQLite por defecto)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Email (configurar según proveedor)
EMAIL_PROVIDER=sendmail
EMAIL_FROM=noreply@mysafebox.org

# SMS (Twilio - opcional)
TWILIO_SID=tu_twilio_sid
TWILIO_TOKEN=tu_twilio_token
TWILIO_PHONE=+1234567890
```

## 📚 Documentación API

### 🔗 Swagger UI
La documentación interactiva está disponible en:
- **Producción**: https://api.mysafebox.org/api/documentation
- **Desarrollo**: http://localhost:1337/api/documentation

### 📋 Especificación OpenAPI
- **JSON**: https://api.mysafebox.org/api/documentation/spec
- **Postman Collection**: [SafeBox-MX-API.postman_collection.json](postman/SafeBox-MX-API.postman_collection.json)

### 🎯 Endpoints Principales
- **Autenticación**: `/auth/local/register`, `/auth/local`
- **Usuario**: `/user/me`, `/user/emergency-pin`, `/user/biometric`
- **Documentos**: `/documents`, `/documents/stats`
- **Categorías**: `/document-categories`
- **Contactos**: `/contacts`
- **Emergencia**: `/emergency/trigger`, `/emergency/notify/{id}`
- **Logs**: `/auth-logs`, `/emergency-logs`

## 🔐 Seguridad

### Implementado
- ✅ Autenticación JWT
- ✅ Autorización por roles
- ✅ Validación de entrada
- ✅ Headers de seguridad (Nginx)
- ✅ SSL/TLS (Let's Encrypt)
- ✅ Soft delete de usuarios
- ✅ Logs de autenticación
- ✅ Documentación Swagger

### Por Implementar
- ⏳ Cifrado de archivos
- ⏳ Cifrado de PIN de emergencia
- ⏳ Rate limiting
- ⏳ Auditoría completa
- ⏳ Backup automático

## 📮 Testing con Postman

Incluye una colección completa de Postman para testing y documentación de la API.

### 🚀 Importar Colección
```bash
# Importar desde GitHub (recomendado)
1. Abrir Postman → Import → Link
2. Pegar: https://raw.githubusercontent.com/mcquaas/safebox-mx-api/master/postman/SafeBox-MX-API.postman_collection.json
3. Importar entorno: https://raw.githubusercontent.com/mcquaas/safebox-mx-api/master/postman/SafeBox-MX-API.postman_environment.json
```

### 📋 Colecciones Incluidas
- **🔐 Authentication** - Registro y login de usuarios
- **👤 User Management** - Gestión de perfil y configuración
- **📁 Document Categories** - Categorías del sistema y personalizadas
- **📄 Documents** - CRUD completo con filtros y búsqueda
- **👥 Contacts** - Gestión de contactos de emergencia
- **🚨 Emergency System** - Activación y notificaciones
- **📊 Logs** - Historial de emergencias y autenticación

### ✨ Características
- ✅ **Tests automáticos** en cada request
- ✅ **Variables de entorno** configuradas automáticamente
- ✅ **JWT token** se configura automáticamente al login
- ✅ **Documentación completa** con ejemplos
- ✅ **Flujo de pruebas** recomendado

Ver documentación completa en [`/postman/README.md`](./postman/README.md)

## 📱 Integración Frontend

Este backend está diseñado para trabajar con aplicaciones frontend (React, Vue, Angular) y móviles (React Native, Flutter). Proporciona una API RESTful completa con autenticación JWT.

### Ejemplo de uso
```javascript
// Activar emergencia
const response = await fetch('/api/emergency/trigger', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    location: 'Ciudad de México',
    latitude: 19.4326,
    longitude: -99.1332,
    emergencyPin: '1234'
  })
});
```

## 📁 Estructura del Proyecto

```
safebox-mx-api/
├── 📁 config/              # Configuración de Strapi
├── 📁 src/
│   ├── 📁 api/             # Content types y controladores
│   │   ├── 📁 document/    # Gestión de documentos
│   │   ├── 📁 contact/     # Contactos de emergencia
│   │   ├── 📁 emergency/   # Sistema de emergencia
│   │   └── 📁 ...
│   ├── 📁 extensions/      # Extensiones de plugins
│   └── 📁 middlewares/     # Middlewares personalizados
├── 📁 postman/             # Colección de Postman
│   ├── 📄 SafeBox-MX-API.postman_collection.json
│   ├── 📄 SafeBox-MX-API.postman_environment.json
│   └── 📄 README.md
├── 📁 types/               # Tipos TypeScript generados
├── 📄 ecosystem.config.js  # Configuración PM2
├── 📄 check-status.sh      # Script de verificación
└── 📄 README.md
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Email: soporte@mysafebox.org
- Issues: [GitHub Issues](https://github.com/tu-usuario/safebox-mx-api/issues)

---

**SafeBox MX** - Tu bóveda digital segura 🔐
