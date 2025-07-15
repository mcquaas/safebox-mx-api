import { swaggerSpec } from '../../../swagger';

export default {
  async index(ctx: any) {
    ctx.type = 'text/html';
    ctx.body = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SafeBox MX API Documentation</title>
    <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
    <link rel="icon" type="image/png" href="/favicon.png" sizes="32x32" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .swagger-ui .topbar {
            display: none;
        }
        .swagger-ui .info .title {
            color: #2c3e50;
            font-size: 36px;
            font-weight: 700;
        }
        .swagger-ui .info .description {
            color: #34495e;
            font-size: 16px;
            line-height: 1.6;
        }
        .swagger-ui .scheme-container {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .swagger-ui .info .title::after {
            content: " v1.0.0";
            background: #e74c3c;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            margin-left: 15px;
            vertical-align: middle;
        }
        .swagger-ui .info {
            margin: 50px 0;
        }
        .swagger-ui .info .contact {
            margin-top: 20px;
            padding: 15px;
            background: #e8f5e8;
            border-radius: 8px;
            border-left: 4px solid #27ae60;
        }
        .swagger-ui .info .license {
            margin-top: 10px;
            padding: 10px;
            background: #f0f8ff;
            border-radius: 8px;
            border-left: 4px solid #3498db;
        }
        .swagger-ui .auth-wrapper {
            margin-top: 20px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
        }
        .swagger-ui .btn.authorize {
            background: #27ae60;
            border-color: #27ae60;
        }
        .swagger-ui .btn.authorize:hover {
            background: #219a52;
            border-color: #219a52;
        }
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 18px;
            color: #2c3e50;
        }
        .loading::after {
            content: "Cargando documentación...";
        }
    </style>
</head>
<body>
    <div id="swagger-ui">
        <div class="loading"></div>
    </div>
    <script src="/swagger-ui/swagger-ui-bundle.js"></script>
    <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            try {
                const ui = SwaggerUIBundle({
                    url: '/api/documentation/spec',
                    dom_id: '#swagger-ui',
                    deepLinking: true,
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    plugins: [
                        SwaggerUIBundle.plugins.DownloadUrl
                    ],
                    layout: "StandaloneLayout",
                    validatorUrl: null,
                    docExpansion: "none",
                    operationsSorter: "alpha",
                    tagsSorter: "alpha",
                    defaultModelExpandDepth: 2,
                    defaultModelsExpandDepth: 1,
                    displayRequestDuration: true,
                    tryItOutEnabled: true,
                    filter: true,
                    persistAuthorization: true,
                    showExtensions: true,
                    showCommonExtensions: true,
                    requestInterceptor: function(request) {
                        // Agregar headers personalizados si es necesario
                        request.headers['X-Requested-With'] = 'SwaggerUI';
                        return request;
                    },
                    responseInterceptor: function(response) {
                        // Manejar respuestas si es necesario
                        return response;
                    }
                });
                
                // Personalizar la interfaz después de cargar
                setTimeout(function() {
                    // Agregar información adicional
                    const infoSection = document.querySelector('.info');
                    if (infoSection) {
                        const contactInfo = document.createElement('div');
                        contactInfo.className = 'contact';
                        contactInfo.innerHTML = '<strong>Contacto:</strong> SafeBox MX Team - soporte@mysafebox.org';
                        infoSection.appendChild(contactInfo);
                        
                        const licenseInfo = document.createElement('div');
                        licenseInfo.className = 'license';
                        licenseInfo.innerHTML = '<strong>Licencia:</strong> MIT - <a href="https://opensource.org/licenses/MIT" target="_blank">Ver licencia</a>';
                        infoSection.appendChild(licenseInfo);
                    }
                    
                    // Agregar información de autenticación
                    const authWrapper = document.querySelector('.auth-wrapper');
                    if (authWrapper) {
                        const authInfo = document.createElement('div');
                        authInfo.innerHTML = '<strong>💡 Tip:</strong> Para probar los endpoints protegidos, primero registra/inicia sesión, copia el JWT token y haz clic en "Authorize".';
                        authWrapper.appendChild(authInfo);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('Error loading Swagger UI:', error);
                document.getElementById('swagger-ui').innerHTML = 
                    '<div style="text-align: center; padding: 50px; color: #e74c3c;">' +
                    '<h2>Error al cargar la documentación</h2>' +
                    '<p>Por favor, recarga la página o contacta al administrador.</p>' +
                    '<p><strong>Error:</strong> ' + error.message + '</p>' +
                    '</div>';
            }
        };
    </script>
</body>
</html>
    `;
  },

  async spec(ctx: any) {
    ctx.type = 'application/json';
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    ctx.body = swaggerSpec;
  }
}; 