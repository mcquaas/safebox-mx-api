import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger';

export default (config: any, { strapi }: { strapi: any }) => {
  return async (ctx: any, next: any) => {
    if (ctx.path === '/documentation' || ctx.path === '/documentation/') {
      // Redirigir a la documentación con barra final
      ctx.redirect('/documentation/index.html');
      return;
    }
    
    if (ctx.path.startsWith('/documentation/')) {
      // Servir Swagger UI
      const swaggerMiddleware = swaggerUi.setup(swaggerSpec, {
        customCss: `
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title { color: #2c3e50; }
          .swagger-ui .info .description { color: #34495e; }
          .swagger-ui .scheme-container { background: #f8f9fa; }
        `,
        customSiteTitle: 'SafeBox MX API Documentation',
        customfavIcon: '/favicon.png'
      });
      
      // Convertir el middleware de Express a Koa
      const req = ctx.request;
      const res = ctx.response;
      
      // Simular req/res de Express
      const expressReq = {
        ...req,
        method: ctx.method,
        url: ctx.url,
        headers: ctx.headers,
        query: ctx.query
      };
      
      const expressRes = {
        ...res,
        send: (data: any) => {
          ctx.body = data;
        },
        status: (code: number) => {
          ctx.status = code;
          return expressRes;
        },
        setHeader: (name: string, value: string) => {
          ctx.set(name, value);
        },
        end: () => {
          // No-op para Koa
        }
      };
      
      try {
        await new Promise((resolve, reject) => {
          swaggerMiddleware(expressReq as any, expressRes as any, (err?: any) => {
            if (err) reject(err);
            else resolve(undefined);
          });
        });
      } catch (error) {
        strapi.log.error('Error serving Swagger UI:', error);
        ctx.status = 500;
        ctx.body = { error: 'Error serving documentation' };
      }
      
      return;
    }
    
    await next();
  };
}; 