#!/bin/bash

# SafeBox MX - Script de Seeding
# Genera datos de demostración para el sistema SafeBox MX

# Configuración
API_URL="${API_URL:-https://api.mysafebox.org/api}"
DEMO_EMAIL="demo@safebox.mx"
DEMO_PASSWORD="SafeBox123!"
DEMO_USERNAME="demo"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables globales
JWT_TOKEN=""
USER_ID=""

# Función para imprimir mensajes con color
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[SEED]${NC} $message"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar dependencias
check_dependencies() {
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado. Por favor instálalo: sudo apt-get install curl"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_error "jq no está instalado. Por favor instálalo: sudo apt-get install jq"
        exit 1
    fi
}

# Función para hacer requests HTTP con manejo de errores
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local headers=$4
    
    local response
    if [ -n "$headers" ]; then
        response=$(eval "curl -s -X '$method' '$url' -H 'Content-Type: application/json' $headers -d '$data'")
    else
        response=$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$data")
    fi
    
    echo "$response"
}

# Función para registrar/obtener usuario
setup_user() {
    print_message $BLUE "Configurando usuario de demostración..."
    
    # Obtener token JWT fresco
    local login_response=$(make_request "POST" "$API_URL/auth/local" "{\"identifier\": \"$DEMO_EMAIL\", \"password\": \"$DEMO_PASSWORD\"}")
    
    if echo "$login_response" | jq -e '.jwt' > /dev/null 2>&1; then
        print_success "Login exitoso, obteniendo token fresco"
        JWT_TOKEN=$(echo "$login_response" | jq -r '.jwt')
        USER_ID=$(echo "$login_response" | jq -r '.user.id')
        print_info "Token obtenido para usuario ID: $USER_ID"
    else
        print_error "Error al obtener token: $(echo "$login_response" | jq -r '.error.message // "Error desconocido"')"
        exit 1
    fi
}

# Función para obtener categorías de documentos
get_document_categories() {
    print_message $BLUE "Configurando categorías de documentos..."
    
    # Usar IDs conocidos de las categorías existentes
    IDENTIFICACION_ID="1"
    LEGAL_ID="2"
    MEDICO_ID="3"
    CONTACTOS_ID="4"
    
    print_success "Categorías configuradas: Identificación($IDENTIFICACION_ID), Legal($LEGAL_ID), Médico($MEDICO_ID), Contactos($CONTACTOS_ID)"
}

# Función para crear contactos de emergencia
create_contacts() {
    print_message $BLUE "Creando contactos de emergencia..."
    
    local contacts=(
        '{"fullName": "María González", "relationship": "Esposa", "phone": "+1-555-0123", "email": "maria.gonzalez@email.com", "canReceiveEmergencyAlert": true, "canViewSharedDocs": true}'
        '{"fullName": "Lic. Rodríguez", "relationship": "Abogado", "phone": "+1-555-0456", "email": "lic.rodriguez@legal.com", "canReceiveEmergencyAlert": true, "canViewSharedDocs": true}'
        '{"fullName": "Dr. Martínez", "relationship": "Médico", "phone": "+1-555-0789", "email": "dr.martinez@hospital.com", "canReceiveEmergencyAlert": false, "canViewSharedDocs": true}'
        '{"fullName": "Ana García", "relationship": "Hermana", "phone": "+52-555-0321", "email": "ana.garcia@email.com", "canReceiveEmergencyAlert": true, "canViewSharedDocs": false}'
    )
    
    local created_count=0
    for contact_data in "${contacts[@]}"; do
        local response=$(make_request "POST" "$API_URL/contacts" "$contact_data" "-H \"Authorization: Bearer $JWT_TOKEN\"")
        
        if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
            local contact_name=$(echo "$contact_data" | jq -r '.fullName')
            print_success "Contacto creado: $contact_name"
            ((created_count++))
        else
            local contact_name=$(echo "$contact_data" | jq -r '.fullName')
            print_warning "Error creando contacto $contact_name: $(echo "$response" | jq -r '.error.message // "Error desconocido"')"
        fi
    done
    
    print_success "Contactos creados: $created_count/4"
}

# Función para crear un archivo temporal con contenido
create_temp_file() {
    local filename=$1
    local content=$2
    
    echo "$content" > "/tmp/$filename"
    echo "/tmp/$filename"
}

# Función para subir un documento
upload_document() {
    local title=$1
    local description=$2
    local category_id=$3
    local filename=$4
    local content=$5
    local is_emergency=$6
    
    # Crear archivo temporal
    local temp_file=$(create_temp_file "$filename" "$content")
    
    # Crear documento directamente con multipart/form-data
    local doc_response=$(curl -s -X POST "$API_URL/documents" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -F "title=$title" \
        -F "description=$description" \
        -F "category=$category_id" \
        -F "emergencyOnly=$is_emergency" \
        -F "visibleToContacts=$is_emergency" \
        -F "file=@$temp_file")
    
    if echo "$doc_response" | jq -e '.data' > /dev/null 2>&1; then
        print_success "Documento creado: $title"
    else
        print_warning "Error creando documento $title: $(echo "$doc_response" | jq -r '.error.message // "Error desconocido"')"
    fi
    
    # Limpiar archivo temporal
    rm -f "$temp_file"
}

# Función para crear documentos de demostración
create_documents() {
    print_message $BLUE "Creando documentos de demostración..."
    
    # Documentos de Identificación
    if [ -n "$IDENTIFICACION_ID" ]; then
        upload_document "Identificación Oficial" "Credencial para votar o INE" "$IDENTIFICACION_ID" "identificacion_oficial.pdf" "IDENTIFICACIÓN OFICIAL\n\nNombre: Juan Carlos González\nFecha de nacimiento: 15 de mayo de 1985\nClave de elector: GNZLJC85051512H100\nVigencia: 2030" true
        
        upload_document "Pasaporte" "Pasaporte mexicano vigente" "$IDENTIFICACION_ID" "pasaporte.pdf" "PASAPORTE\n\nTipo: P\nCódigo del país: MEX\nNúmero de pasaporte: G12345678\nApellidos: GONZÁLEZ\nNombres: JUAN CARLOS\nFecha de nacimiento: 15 MAY 1985\nLugar de nacimiento: CIUDAD DE MÉXICO\nFecha de expedición: 20 ENE 2020\nFecha de vencimiento: 19 ENE 2030" true
        
        upload_document "Licencia de Conducir" "Licencia de conducir vigente" "$IDENTIFICACION_ID" "licencia_conducir.pdf" "LICENCIA DE CONDUCIR\n\nNombre: Juan Carlos González\nFecha de nacimiento: 15/05/1985\nTipo: A\nVigencia: 2026\nFolio: LC123456789" false
    fi
    
    # Documentos Legales
    if [ -n "$LEGAL_ID" ]; then
        upload_document "Acta de Nacimiento" "Acta de nacimiento certificada" "$LEGAL_ID" "acta_nacimiento.pdf" "ACTA DE NACIMIENTO\n\nNombre: Juan Carlos González\nFecha de nacimiento: 15 de mayo de 1985\nLugar: Ciudad de México, México\nPadre: Carlos González\nMadre: María López\nRegistro Civil: 001\nFolio: 123456" true
        
        upload_document "Permiso de Trabajo" "Permiso de trabajo en Estados Unidos" "$LEGAL_ID" "permiso_trabajo.pdf" "EMPLOYMENT AUTHORIZATION DOCUMENT\n\nName: GONZALEZ, JUAN CARLOS\nDate of Birth: 05/15/1985\nCountry of Birth: MEXICO\nCard Number: MSC1234567890\nCategory: C09\nValid from: 01/15/2024\nCard expires: 01/14/2026" true
        
        upload_document "Visa de Trabajo" "Visa H-1B para Estados Unidos" "$LEGAL_ID" "visa_trabajo.pdf" "VISA DE TRABAJO H-1B\n\nNombre: Juan Carlos González\nPasaporte: G12345678\nEmpleador: Tech Company Inc.\nFecha de inicio: 01/02/2024\nFecha de vencimiento: 01/01/2027\nEstatus: Aprobado" true
        
        upload_document "Testamento" "Testamento y disposiciones finales" "$LEGAL_ID" "testamento.pdf" "TESTAMENTO\n\nYo, Juan Carlos González, en pleno uso de mis facultades mentales, declaro:\n\n1. Beneficiarios principales: María González (esposa)\n2. Beneficiarios secundarios: Ana García (hermana)\n3. Disposiciones especiales para documentos digitales\n4. Instrucciones para acceso de emergencia\n\nFecha: 15 de enero de 2024\nNotario: Lic. Rodríguez" true
        
        upload_document "Poder Notarial" "Poder para representación legal" "$LEGAL_ID" "poder_notarial.pdf" "PODER NOTARIAL\n\nOtorgo poder amplio y suficiente a:\nMaria González\nPara que en mi nombre y representación pueda:\n- Realizar trámites bancarios\n- Firmar documentos legales\n- Representarme ante autoridades\n\nFecha: 10 de marzo de 2024\nNotario: Lic. Rodríguez" false
    fi
    
    # Documentos Médicos
    if [ -n "$MEDICO_ID" ]; then
        upload_document "Seguro Médico" "Póliza de seguro médico vigente" "$MEDICO_ID" "seguro_medico.pdf" "PÓLIZA DE SEGURO MÉDICO\n\nAsegurado: Juan Carlos González\nNúmero de póliza: SM-789456123\nVigencia: 01/01/2024 - 31/12/2024\nCobertura: Internacional\nDeducible: $500 USD\nAseguradora: SafeHealth Insurance\nContacto emergencia: +1-800-HEALTH" true
        
        upload_document "Historial Médico" "Resumen de historial médico" "$MEDICO_ID" "historial_medico.pdf" "HISTORIAL MÉDICO\n\nPaciente: Juan Carlos González\nFecha de nacimiento: 15/05/1985\nTipo de sangre: O+\nAlergias: Penicilina\nMedicamentos actuales: Ninguno\nCondiciones crónicas: Ninguna\nContacto médico: Dr. Martínez\nTeléfono: +1-555-0789\nÚltima revisión: 15/03/2024" true
    fi
    
    # Documentos de Contactos
    if [ -n "$CONTACTOS_ID" ]; then
        upload_document "Contacto Abogado" "Información de contacto legal" "$CONTACTOS_ID" "contacto_abogado.pdf" "CONTACTO LEGAL\n\nNombre: Lic. Rodríguez\nEspecialidad: Derecho Migratorio\nTeléfono: +1-555-0456\nEmail: lic.rodriguez@legal.com\nDirección: 123 Legal Ave, Houston, TX\nHorario: Lunes a Viernes 9:00-17:00\nEmergencias: +1-555-0456 ext. 911" true
        
        upload_document "Lista de Contactos de Emergencia" "Lista completa de contactos importantes" "$CONTACTOS_ID" "lista_contactos.pdf" "CONTACTOS DE EMERGENCIA\n\n1. María González (Esposa)\n   Tel: +1-555-0123\n   Email: maria.gonzalez@email.com\n\n2. Lic. Rodríguez (Abogado)\n   Tel: +1-555-0456\n   Email: lic.rodriguez@legal.com\n\n3. Dr. Martínez (Médico)\n   Tel: +1-555-0789\n   Email: dr.martinez@hospital.com\n\n4. Ana García (Hermana)\n   Tel: +52-555-0321\n   Email: ana.garcia@email.com" true
    fi
    
    print_success "Documentos creados exitosamente"
}

# Función para mostrar estadísticas finales
show_statistics() {
    print_message $GREEN "=== ESTADÍSTICAS FINALES ==="
    
    # Obtener estadísticas de documentos por categoría
    local doc_response=$(make_request "GET" "$API_URL/documents" "" "-H \"Authorization: Bearer $JWT_TOKEN\"")
    local contact_response=$(make_request "GET" "$API_URL/contacts" "" "-H \"Authorization: Bearer $JWT_TOKEN\"")
    
    if echo "$doc_response" | jq -e '.data' > /dev/null 2>&1; then
        local total_docs=$(echo "$doc_response" | jq '.data | length')
        local identificacion_count=$(echo "$doc_response" | jq "[.data[] | select(.category.name == \"Identificación\")] | length")
        local legal_count=$(echo "$doc_response" | jq "[.data[] | select(.category.name == \"Legal\")] | length")
        local medico_count=$(echo "$doc_response" | jq "[.data[] | select(.category.name == \"Médico\")] | length")
        local contactos_count=$(echo "$doc_response" | jq "[.data[] | select(.category.name == \"Contactos\")] | length")
        
        print_info "Documentos por categoría:"
        print_info "  - Identificación: $identificacion_count"
        print_info "  - Legal: $legal_count"
        print_info "  - Médico: $medico_count"
        print_info "  - Contactos: $contactos_count"
        print_info "  - Total: $total_docs"
    fi
    
    if echo "$contact_response" | jq -e '.data' > /dev/null 2>&1; then
        local total_contacts=$(echo "$contact_response" | jq '.data | length')
        print_info "Contactos de emergencia: $total_contacts"
    fi
    
    print_message $GREEN "=== DATOS DE ACCESO ==="
    print_info "Email: $DEMO_EMAIL"
    print_info "Contraseña: $DEMO_PASSWORD"
    print_info "API URL: $API_URL"
    
    print_message $GREEN "=== SEEDING COMPLETADO ==="
    print_success "¡Datos de demostración creados exitosamente!"
    print_info "Puedes acceder al sistema con las credenciales mostradas arriba."
}

# Función principal
main() {
    print_message $BLUE "=== SAFEBOX MX - SCRIPT DE SEEDING ==="
    echo
    
    print_info "Usando API URL: $API_URL"
    echo
    
    # Verificar dependencias
    check_dependencies
    
    # Configurar usuario
    setup_user
    
    # Obtener categorías
    get_document_categories
    
    # Crear contactos
    create_contacts
    
    # Crear documentos
    create_documents
    
    # Mostrar estadísticas
    show_statistics
}

# Ejecutar script principal
main "$@" 