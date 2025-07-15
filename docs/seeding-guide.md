# SafeBox MX - Guía de Seeding

## 🌱 Descripción

El script `seed.sh` genera datos de ejemplo para la aplicación SafeBox MX, creando un usuario de demostración con documentos, contactos y configuraciones realistas basadas en el frontend mostrado.

## 📋 Prerrequisitos

### Dependencias del Sistema
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install curl jq

# CentOS/RHEL
sudo yum install curl jq

# macOS
brew install curl jq
```

### Verificar Instalación
```bash
curl --version
jq --version
```

## 🚀 Uso del Script

### Sintaxis Básica
```bash
# Usar API de producción (default)
./seed.sh

# Usar API local para desarrollo
./seed.sh --local

# Mostrar ayuda
./seed.sh --help
```

### Opciones Disponibles
- `-h, --help`: Mostrar ayuda
- `-l, --local`: Usar API local (http://localhost:1337/api)
- `-p, --prod`: Usar API de producción (https://api.mysafebox.org/api)

## 🎯 Datos Generados

### 👤 Usuario de Demostración
```
Email: demo@safebox.mx
Password: SafeBox123!
Nombre: Juan Carlos González
Teléfono: +52-555-0123
PIN de Emergencia: 1234
```

### 👥 Contactos de Emergencia (4 contactos)

1. **María González** (Esposa)
   - Teléfono: +1-555-0123
   - Email: maria.gonzalez@email.com
   - Alertas de emergencia: ✅
   - Ver documentos compartidos: ✅

2. **Lic. Rodríguez** (Abogado)
   - Teléfono: +1-555-0456
   - Email: lic.rodriguez@bufete.com
   - Alertas de emergencia: ✅
   - Ver documentos compartidos: ✅

3. **Dr. Martínez** (Médico)
   - Teléfono: +1-555-0789
   - Email: dr.martinez@hospital.com
   - Alertas de emergencia: ❌
   - Ver documentos compartidos: ✅

4. **Ana García** (Hermana)
   - Teléfono: +52-555-0321
   - Email: ana.garcia@email.com
   - Alertas de emergencia: ✅
   - Ver documentos compartidos: ❌

### 📄 Documentos Generados (10 documentos)

#### 🆔 Identificación (3 documentos)
- **Identificación Oficial** - Visible a contactos
- **Pasaporte** - Visible a contactos

#### ⚖️ Legal (5 documentos)
- **Acta de Nacimiento** - Visible a contactos
- **Permiso de Trabajo** - Solo emergencia
- **Visa de Trabajo** - Solo emergencia
- **Testamento** - Solo emergencia (privado)

#### 🏥 Médico (2 documentos)
- **Seguro Médico** - Solo emergencia
- **Historial Médico** - Solo emergencia (privado)

#### 👥 Contactos (2 documentos)
- **Contacto Abogado** - Visible a contactos
- **Lista de Contactos de Emergencia** - Solo emergencia

### 📊 Distribución por Categorías
- Identificación: 3 documentos
- Legal: 5 documentos
- Médico: 2 documentos
- Contactos: 4 documentos

## 🔄 Proceso de Ejecución

### 1. Verificación de Dependencias
El script verifica que `curl` y `jq` estén instalados.

### 2. Registro/Login de Usuario
- Intenta registrar usuario `demo@safebox.mx`
- Si ya existe, hace login automáticamente
- Obtiene JWT token para autenticación

### 3. Configuración Inicial
- Configura PIN de emergencia (1234)
- Obtiene categorías de documentos existentes

### 4. Creación de Contactos
- Crea 4 contactos de emergencia con diferentes permisos
- Configura relaciones y permisos específicos

### 5. Generación de Documentos
- Crea archivos temporales con contenido de ejemplo
- Sube 10 documentos a diferentes categorías
- Configura visibilidad y permisos de emergencia

### 6. Limpieza y Estadísticas
- Elimina archivos temporales
- Muestra estadísticas de datos creados
- Proporciona información de acceso

## 📈 Ejemplo de Salida

```bash
$ ./seed.sh

=== SAFEBOX MX - SCRIPT DE SEEDING ===

[INFO] Usando API URL: https://api.mysafebox.org/api

[SEED] Registrando usuario de ejemplo...
[SEED] Usuario registrado exitosamente. ID: 123
[SEED] Configurando PIN de emergencia...
[INFO] PIN de emergencia configurado: 1234
[SEED] Creando contactos de emergencia...
[INFO] Contacto creado: María González (Esposa)
[INFO] Contacto creado: Lic. Rodríguez (Abogado)
[INFO] Contacto creado: Dr. Martínez (Médico)
[INFO] Contacto creado: Ana García (Hermana)
[SEED] Creando documentos de ejemplo...
[SEED] Obteniendo categorías disponibles...
[INFO] Categorías disponibles:
1:Identificación
2:Legal
3:Médico
4:Contactos
[INFO] Creando archivos de ejemplo...
[INFO] Creando documento: Identificación Oficial
[INFO] Creando documento: Acta de Nacimiento
[INFO] Creando documento: Permiso de Trabajo
[INFO] Creando documento: Contacto Abogado
[INFO] Creando documento: Seguro Médico
[INFO] Creando documento: Historial Médico
[INFO] Creando documento: Pasaporte
[INFO] Creando documento: Visa de Trabajo
[INFO] Creando documento: Testamento
[INFO] Creando documento: Lista de Contactos de Emergencia
[INFO] Limpiando archivos temporales...

[SEED] Obteniendo estadísticas...

[INFO] === ESTADÍSTICAS DE SEEDING ===
Total de documentos: 10
Total de categorías: 4
Documentos de emergencia: 6
Documentos compartidos: 7

[INFO] Documentos por categoría:
  Identificación: 3
  Legal: 5
  Médico: 2
  Contactos: 4

[INFO] === CONTACTOS CREADOS ===
  María González (Esposa) - +1-555-0123
  Lic. Rodríguez (Abogado) - +1-555-0456
  Dr. Martínez (Médico) - +1-555-0789
  Ana García (Hermana) - +52-555-0321

[SEED] === INFORMACIÓN DE ACCESO ===

[INFO] Usuario de prueba creado:
  Email: demo@safebox.mx
  Password: SafeBox123!
  PIN de Emergencia: 1234

[INFO] URLs importantes:
  API: https://api.mysafebox.org/api
  Documentación: https://api.mysafebox.org/api/documentation
  Frontend: https://mysafebox.org

[INFO] JWT Token (válido por 30 días):
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

[SEED] ¡Seeding completado exitosamente!
[WARNING] Recuerda: Este es un usuario de DEMOSTRACIÓN. No uses datos reales.
```

## 🛠️ Desarrollo y Personalización

### Modificar Datos de Usuario
Edita la función `register_user()` en `seed.sh`:
```bash
register_user() {
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "username": "tu_usuario",
            "email": "tu@email.com",
            "password": "TuPassword123!",
            "firstName": "Tu Nombre",
            "lastName": "Tu Apellido",
            "phone": "+52-555-XXXX"
        }' \
        "$API_URL/auth/local/register")
    # ...
}
```

### Agregar Más Contactos
Modifica la función `create_contacts()`:
```bash
create_contacts() {
    # Contactos existentes...
    
    # Nuevo contacto
    local contact5=$(make_request "POST" "/contacts" '{
        "fullName": "Nuevo Contacto",
        "phone": "+1-555-XXXX",
        "email": "nuevo@email.com",
        "relationship": "Relación",
        "canReceiveEmergencyAlert": true,
        "canViewSharedDocs": true
    }')
    
    print_info "Contacto creado: Nuevo Contacto"
}
```

### Personalizar Documentos
Edita la función `create_sample_files()` para modificar el contenido de los documentos o agregar nuevos tipos.

## 🔧 Solución de Problemas

### Error: "curl no está instalado"
```bash
# Ubuntu/Debian
sudo apt-get install curl

# CentOS/RHEL
sudo yum install curl
```

### Error: "jq no está instalado"
```bash
# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

### Error: "Error al iniciar sesión"
- Verifica que la API esté funcionando
- Confirma la URL de la API
- Revisa los logs del servidor

### Error: "Usuario ya existe"
El script automáticamente intenta hacer login si el usuario ya existe.

### Error de Permisos
```bash
chmod +x seed.sh
```

## 🔐 Seguridad

### ⚠️ Advertencias Importantes
- **NO uses datos reales** en el script de seeding
- Este usuario es solo para **DEMOSTRACIÓN**
- Los archivos generados son **FICTICIOS**
- El PIN de emergencia es **PÚBLICO** (1234)

### 🛡️ Mejores Prácticas
- Ejecuta solo en entornos de desarrollo/testing
- Elimina datos de prueba antes de producción
- No compartas el JWT token generado
- Usa credenciales únicas para cada entorno

## 📚 Recursos Adicionales

- **API Documentation**: https://api.mysafebox.org/api/documentation
- **Postman Collection**: [SafeBox-MX-API.postman_collection.json](../postman/SafeBox-MX-API.postman_collection.json)
- **Frontend Demo**: https://mysafebox.org
- **GitHub Repository**: https://github.com/mcquaas/safebox-mx-api

## 🤝 Contribución

Para contribuir al script de seeding:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Modifica `seed.sh` según sea necesario
4. Prueba con `./seed.sh --local`
5. Actualiza esta documentación
6. Envía un Pull Request

---

**Desarrollado por**: SafeBox MX Team  
**Versión**: 1.0.0  
**Última actualización**: Enero 2025 