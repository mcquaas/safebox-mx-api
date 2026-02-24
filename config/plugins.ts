export default () => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: process.env.EMAIL_SMTP_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT || 587),
        secure: process.env.EMAIL_SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_SMTP_USER,
          pass: process.env.EMAIL_SMTP_PASS,
        },
      },
      settings: {
        defaultFrom: process.env.EMAIL_FROM || 'noreply@mysafebox.org',
        defaultReplyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM || 'soporte@mysafebox.org',
      },
    },
  },
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
          email: 'soporte@mysafebox.org',
          url: 'https://mysafebox.org'
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
