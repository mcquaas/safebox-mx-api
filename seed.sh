#!/bin/bash

# SafeBox MX - Script de Seeding
# Genera datos de ejemplo para desarrollo y demostración

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
API_URL="https://api.mysafebox.org/api"
# API_URL="http://localhost:1337/api"  # Para desarrollo local

# Variables globales
JWT_TOKEN=""
USER_ID=""

# Función para mostrar mensajes
print_message() {
    echo -e "${GREEN}[SEED]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para hacer requests HTTP
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local content_type=${4:-"application/json"}
    
    if [ -n "$data" ]; then
        if [ "$content_type" = "multipart/form-data" ]; then
            curl -s -X $method \
                -H "Authorization: Bearer $JWT_TOKEN" \
                $data \
                "$API_URL$endpoint"
        else
            curl -s -X $method \
                -H "Content-Type: $content_type" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                -d "$data" \
                "$API_URL$endpoint"
        fi
    else
        curl -s -X $method \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "$API_URL$endpoint"
    fi
}

# Función para registrar usuario de ejemplo
register_user() {
    print_message "Registrando usuario de ejemplo..."
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "username": "demo_user",
            "email": "demo@safebox.mx",
            "password": "SafeBox123!",
            "firstName": "Juan Carlos",
            "lastName": "González",
            "phone": "+52-555-0123"
        }' \
        "$API_URL/auth/local/register")
    
    JWT_TOKEN=$(echo $response | jq -r '.jwt // empty')
    USER_ID=$(echo $response | jq -r '.user.id // empty')
    
    if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
        print_warning "Usuario ya existe, intentando login..."
        login_user
    else
        print_message "Usuario registrado exitosamente. ID: $USER_ID"
    fi
}

# Función para hacer login
login_user() {
    print_message "Iniciando sesión..."
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "identifier": "demo@safebox.mx",
            "password": "SafeBox123!"
        }' \
        "$API_URL/auth/local")
    
    JWT_TOKEN=$(echo $response | jq -r '.jwt // empty')
    USER_ID=$(echo $response | jq -r '.user.id // empty')
    
    if [ -z "$JWT_TOKEN" ] || [ "$JWT_TOKEN" = "null" ]; then
        print_error "Error al iniciar sesión"
        exit 1
    else
        print_message "Sesión iniciada exitosamente. ID: $USER_ID"
    fi
}

# Función para configurar PIN de emergencia
setup_emergency_pin() {
    print_message "Configurando PIN de emergencia..."
    
    local response=$(make_request "PUT" "/user/emergency-pin" '{
        "emergencyPin": "1234"
    }')
    
    print_info "PIN de emergencia configurado: 1234"
}

# Función para crear contactos de emergencia
create_contacts() {
    print_message "Creando contactos de emergencia..."
    
    # Contacto 1: María González (Esposa)
    local contact1=$(make_request "POST" "/contacts" '{
        "fullName": "María González",
        "phone": "+1-555-0123",
        "email": "maria.gonzalez@email.com",
        "relationship": "Esposa",
        "canReceiveEmergencyAlert": true,
        "canViewSharedDocs": true
    }')
    
    print_info "Contacto creado: María González (Esposa)"
    
    # Contacto 2: Lic. Rodríguez (Abogado)
    local contact2=$(make_request "POST" "/contacts" '{
        "fullName": "Lic. Rodríguez",
        "phone": "+1-555-0456",
        "email": "lic.rodriguez@bufete.com",
        "relationship": "Abogado",
        "canReceiveEmergencyAlert": true,
        "canViewSharedDocs": true
    }')
    
    print_info "Contacto creado: Lic. Rodríguez (Abogado)"
    
    # Contacto 3: Dr. Martínez (Médico)
    local contact3=$(make_request "POST" "/contacts" '{
        "fullName": "Dr. Martínez",
        "phone": "+1-555-0789",
        "email": "dr.martinez@hospital.com",
        "relationship": "Médico",
        "canReceiveEmergencyAlert": false,
        "canViewSharedDocs": true
    }')
    
    print_info "Contacto creado: Dr. Martínez (Médico)"
    
    # Contacto 4: Ana García (Hermana)
    local contact4=$(make_request "POST" "/contacts" '{
        "fullName": "Ana García",
        "phone": "+52-555-0321",
        "email": "ana.garcia@email.com",
        "relationship": "Hermana",
        "canReceiveEmergencyAlert": true,
        "canViewSharedDocs": false
    }')
    
    print_info "Contacto creado: Ana García (Hermana)"
}

# Función para obtener categorías
get_categories() {
    print_message "Obteniendo categorías disponibles..."
    
    local response=$(make_request "GET" "/document-categories")
    echo $response | jq -r '.data[] | "\(.id):\(.name)"' > /tmp/categories.txt
    
    print_info "Categorías disponibles:"
    cat /tmp/categories.txt
}

# Función para crear documentos de ejemplo
create_documents() {
    print_message "Creando documentos de ejemplo..."
    
    # Obtener IDs de categorías
    get_categories
    
    local id_categoria=$(grep "Identificación" /tmp/categories.txt | cut -d: -f1)
    local legal_categoria=$(grep "Legal" /tmp/categories.txt | cut -d: -f1)
    local medico_categoria=$(grep "Médico" /tmp/categories.txt | cut -d: -f1)
    local contactos_categoria=$(grep "Contactos" /tmp/categories.txt | cut -d: -f1)
    
    # Crear archivos de ejemplo temporales
    create_sample_files
    
    # Documento 1: Identificación Oficial
    print_info "Creando documento: Identificación Oficial"
    local doc1=$(make_request "POST" "/documents" \
        "-F title='Identificación Oficial' \
         -F description='Cédula de identidad oficial vigente' \
         -F category=$id_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=false \
         -F file=@/tmp/identificacion.pdf" \
        "multipart/form-data")
    
    # Documento 2: Acta de Nacimiento
    print_info "Creando documento: Acta de Nacimiento"
    local doc2=$(make_request "POST" "/documents" \
        "-F title='Acta de Nacimiento' \
         -F description='Acta de nacimiento certificada' \
         -F category=$legal_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=false \
         -F file=@/tmp/acta_nacimiento.pdf" \
        "multipart/form-data")
    
    # Documento 3: Permiso de Trabajo
    print_info "Creando documento: Permiso de Trabajo"
    local doc3=$(make_request "POST" "/documents" \
        "-F title='Permiso de Trabajo' \
         -F description='Autorización de trabajo vigente' \
         -F category=$legal_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=true \
         -F file=@/tmp/permiso_trabajo.pdf" \
        "multipart/form-data")
    
    # Documento 4: Contacto Abogado
    print_info "Creando documento: Contacto Abogado"
    local doc4=$(make_request "POST" "/documents" \
        "-F title='Contacto Abogado' \
         -F description='Información de contacto del abogado de confianza' \
         -F category=$contactos_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=false \
         -F file=@/tmp/contacto_abogado.pdf" \
        "multipart/form-data")
    
    # Documento 5: Seguro Médico
    print_info "Creando documento: Seguro Médico"
    local doc5=$(make_request "POST" "/documents" \
        "-F title='Seguro Médico' \
         -F description='Póliza de seguro médico vigente' \
         -F category=$medico_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=true \
         -F file=@/tmp/seguro_medico.pdf" \
        "multipart/form-data")
    
    # Documento 6: Historial Médico
    print_info "Creando documento: Historial Médico"
    local doc6=$(make_request "POST" "/documents" \
        "-F title='Historial Médico' \
         -F description='Historial médico y alergias importantes' \
         -F category=$medico_categoria \
         -F visibleToContacts=false \
         -F emergencyOnly=true \
         -F file=@/tmp/historial_medico.pdf" \
        "multipart/form-data")
    
    # Documento 7: Pasaporte
    print_info "Creando documento: Pasaporte"
    local doc7=$(make_request "POST" "/documents" \
        "-F title='Pasaporte' \
         -F description='Pasaporte vigente para viajes internacionales' \
         -F category=$id_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=false \
         -F file=@/tmp/pasaporte.pdf" \
        "multipart/form-data")
    
    # Documento 8: Visa de Trabajo
    print_info "Creando documento: Visa de Trabajo"
    local doc8=$(make_request "POST" "/documents" \
        "-F title='Visa de Trabajo' \
         -F description='Visa de trabajo para Estados Unidos' \
         -F category=$legal_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=true \
         -F file=@/tmp/visa_trabajo.pdf" \
        "multipart/form-data")
    
    # Documento 9: Testamento
    print_info "Creando documento: Testamento"
    local doc9=$(make_request "POST" "/documents" \
        "-F title='Testamento' \
         -F description='Testamento legal actualizado' \
         -F category=$legal_categoria \
         -F visibleToContacts=false \
         -F emergencyOnly=true \
         -F file=@/tmp/testamento.pdf" \
        "multipart/form-data")
    
    # Documento 10: Contactos de Emergencia
    print_info "Creando documento: Lista de Contactos de Emergencia"
    local doc10=$(make_request "POST" "/documents" \
        "-F title='Lista de Contactos de Emergencia' \
         -F description='Lista completa de contactos importantes' \
         -F category=$contactos_categoria \
         -F visibleToContacts=true \
         -F emergencyOnly=true \
         -F file=@/tmp/contactos_emergencia.pdf" \
        "multipart/form-data")
    
    # Limpiar archivos temporales
    cleanup_sample_files
}

# Función para crear archivos de ejemplo
create_sample_files() {
    print_info "Creando archivos de ejemplo..."
    
    # Crear PDFs de ejemplo usando texto plano
    echo "IDENTIFICACIÓN OFICIAL
    
Nombre: Juan Carlos González
Número: 123456789
Fecha de Nacimiento: 15/03/1985
Lugar de Nacimiento: Ciudad de México
Vigencia: 2030

Este es un documento de ejemplo para SafeBox MX." > /tmp/identificacion.txt
    
    echo "ACTA DE NACIMIENTO
    
Nombre: Juan Carlos González
Fecha: 15 de Marzo de 1985
Lugar: Ciudad de México, México
Padre: Carlos González
Madre: María López
Registro: 12345

Este es un documento de ejemplo para SafeBox MX." > /tmp/acta_nacimiento.txt
    
    echo "PERMISO DE TRABAJO
    
Nombre: Juan Carlos González
Número de Permiso: W123456789
Empleador: Tech Company Inc.
Vigencia: 2025-12-31
Tipo: H-1B

Este es un documento de ejemplo para SafeBox MX." > /tmp/permiso_trabajo.txt
    
    echo "CONTACTO ABOGADO
    
Nombre: Lic. Rodríguez
Bufete: Rodríguez & Asociados
Teléfono: +1-555-0456
Email: lic.rodriguez@bufete.com
Especialidad: Inmigración
Disponibilidad: 24/7

Este es un documento de ejemplo para SafeBox MX." > /tmp/contacto_abogado.txt
    
    echo "SEGURO MÉDICO
    
Asegurado: Juan Carlos González
Póliza: SM123456789
Aseguradora: Health Insurance Co.
Vigencia: 2025-12-31
Cobertura: Completa

Este es un documento de ejemplo para SafeBox MX." > /tmp/seguro_medico.txt
    
    echo "HISTORIAL MÉDICO
    
Paciente: Juan Carlos González
Tipo de Sangre: O+
Alergias: Penicilina
Condiciones: Ninguna
Médico: Dr. Martínez
Última Revisión: 2024-01-15

Este es un documento de ejemplo para SafeBox MX." > /tmp/historial_medico.txt
    
    echo "PASAPORTE
    
Nombre: Juan Carlos González
Número: P123456789
País: México
Fecha de Emisión: 2020-01-15
Fecha de Expiración: 2030-01-15

Este es un documento de ejemplo para SafeBox MX." > /tmp/pasaporte.txt
    
    echo "VISA DE TRABAJO
    
Nombre: Juan Carlos González
Número: V123456789
Tipo: H-1B
País: Estados Unidos
Vigencia: 2025-12-31

Este es un documento de ejemplo para SafeBox MX." > /tmp/visa_trabajo.txt
    
    echo "TESTAMENTO
    
Testador: Juan Carlos González
Fecha: 2024-01-01
Beneficiarios: María González (Esposa)
Albacea: Lic. Rodríguez
Notario: Público No. 123

Este es un documento de ejemplo para SafeBox MX." > /tmp/testamento.txt
    
    echo "CONTACTOS DE EMERGENCIA
    
1. María González (Esposa)
   Teléfono: +1-555-0123
   Email: maria.gonzalez@email.com
   
2. Lic. Rodríguez (Abogado)
   Teléfono: +1-555-0456
   Email: lic.rodriguez@bufete.com
   
3. Dr. Martínez (Médico)
   Teléfono: +1-555-0789
   Email: dr.martinez@hospital.com

Este es un documento de ejemplo para SafeBox MX." > /tmp/contactos_emergencia.txt
    
    # Convertir archivos de texto a PDF usando pandoc o crear archivos simples
    for file in /tmp/*.txt; do
        base=$(basename "$file" .txt)
        cp "$file" "/tmp/${base}.pdf"
    done
}

# Función para limpiar archivos temporales
cleanup_sample_files() {
    print_info "Limpiando archivos temporales..."
    rm -f /tmp/*.txt /tmp/*.pdf /tmp/categories.txt
}

# Función para mostrar estadísticas
show_statistics() {
    print_message "Obteniendo estadísticas..."
    
    local stats=$(make_request "GET" "/documents/stats")
    
    echo ""
    print_info "=== ESTADÍSTICAS DE SEEDING ==="
    echo $stats | jq -r '
        "Total de documentos: \(.totalDocuments)",
        "Total de categorías: \(.totalCategories)",
        "Documentos de emergencia: \(.emergencyDocuments)",
        "Documentos compartidos: \(.sharedDocuments)"
    '
    
    echo ""
    print_info "Documentos por categoría:"
    echo $stats | jq -r '.documentsByCategory[] | "  \(.category): \(.count)"'
    
    echo ""
    print_info "=== CONTACTOS CREADOS ==="
    local contacts=$(make_request "GET" "/contacts")
    echo $contacts | jq -r '.data[] | "  \(.fullName) (\(.relationship)) - \(.phone)"'
}

# Función para mostrar información de acceso
show_access_info() {
    echo ""
    print_message "=== INFORMACIÓN DE ACCESO ==="
    echo ""
    print_info "Usuario de prueba creado:"
    echo "  Email: demo@safebox.mx"
    echo "  Password: SafeBox123!"
    echo "  PIN de Emergencia: 1234"
    echo ""
    print_info "URLs importantes:"
    echo "  API: $API_URL"
    echo "  Documentación: $API_URL/documentation"
    echo "  Frontend: https://mysafebox.org"
    echo ""
    print_info "JWT Token (válido por 30 días):"
    echo "  $JWT_TOKEN"
    echo ""
}

# Función principal
main() {
    echo ""
    print_message "=== SAFEBOX MX - SCRIPT DE SEEDING ==="
    echo ""
    
    # Verificar dependencias
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq no está instalado. Instálalo con: sudo apt-get install jq"
        exit 1
    fi
    
    print_info "Usando API URL: $API_URL"
    echo ""
    
    # Ejecutar seeding
    register_user
    setup_emergency_pin
    create_contacts
    create_documents
    
    echo ""
    show_statistics
    show_access_info
    
    print_message "¡Seeding completado exitosamente!"
    print_warning "Recuerda: Este es un usuario de DEMOSTRACIÓN. No uses datos reales."
    echo ""
}

# Función de ayuda
show_help() {
    echo "SafeBox MX - Script de Seeding"
    echo ""
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help     Mostrar esta ayuda"
    echo "  -l, --local    Usar API local (localhost:1337)"
    echo "  -p, --prod     Usar API de producción (default)"
    echo ""
    echo "Ejemplos:"
    echo "  $0              # Usar API de producción"
    echo "  $0 --local      # Usar API local"
    echo ""
}

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--local)
            API_URL="http://localhost:1337/api"
            shift
            ;;
        -p|--prod)
            API_URL="https://api.mysafebox.org/api"
            shift
            ;;
        *)
            print_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Ejecutar función principal
main 