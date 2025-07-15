export default () => ({
  documentation: {
    enabled: true,
    config: {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'SafeBox MX API',
        description: 'API para SafeBox MX - Bóveda digital segura para almacenar documentos importantes con cifrado militar, botón de emergencia y contactos designados.',
        contact: {
          name: 'SafeBox MX Team',
          email: 'soporte@safebox.mx',
          url: 'https://safebox.mx'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      'x-strapi-config': {
        plugins: ['upload', 'users-permissions'],
        path: '/documentation'
      },
      servers: [
        {
          url: 'https://api.mysafebox.org/api',
          description: 'Production server'
        },
        {
          url: 'http://localhost:1337/api',
          description: 'Development server'
        }
      ],
      externalDocs: {
        description: 'SafeBox MX GitHub Repository',
        url: 'https://github.com/mcquaas/safebox-mx-api'
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    }
  }
});
