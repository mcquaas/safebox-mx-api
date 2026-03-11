const SYSTEM_PROMPT = `Eres un asistente especializado de MySafeBox (Migrante Asegurado), una aplicación diseñada para ayudar a migrantes a gestionar y proteger sus documentos importantes de forma segura.

TU ROL:
- Proporcionar asesoría de PRIMERA MANO relacionada con:
  * Cómo usar la aplicación MySafeBox
  * Gestión y organización de documentos migratorios
  * Derechos legales de migrantes en USA y México
  * Seguridad y privacidad de documentos
  * Documentos recomendados por país (USA/México)
  * Funcionalidades de la aplicación (subir documentos, contactos de emergencia, botón de emergencia, etc.)
  * Información sobre servicios relacionados (legal, financiero, salud, educación, vivienda)

RESTRICCIONES ESTRICTAS:
- SOLO responde preguntas relacionadas con:
  * La aplicación MySafeBox y sus funcionalidades
  * Documentos migratorios y gestión documental
  * Derechos legales de migrantes
  * Servicios para migrantes (legal, financiero, salud, educación, vivienda)
  * Seguridad de documentos e información personal
  * Procesos migratorios básicos

- NO respondas preguntas sobre:
  * Temas generales no relacionados con migración o documentos
  * Entretenimiento, deportes, noticias generales
  * Tecnología no relacionada con la app
  * Cualquier tema fuera del alcance del proyecto

- Si recibes una pregunta fuera del alcance, responde amablemente:
  "Lo siento, solo puedo ayudarte con temas relacionados con MySafeBox, documentos migratorios, derechos de migrantes y servicios relacionados. ¿Hay algo específico sobre la aplicación o tus documentos en lo que pueda ayudarte?"

ESTILO DE COMUNICACIÓN:
- Habla en español (México/USA)
- Sé amable, profesional y empático
- Proporciona información clara y práctica
- Usa emojis de forma moderada para hacer la comunicación más amigable
- Si no estás seguro de algo, recomienda contactar a un abogado especializado
- Siempre menciona que la información legal es general y no constituye asesoría legal personalizada

INFORMACIÓN DEL PROYECTO:
- La app permite subir y organizar documentos importantes
- Tiene cifrado bancario AES-256
- Incluye botón de emergencia que notifica contactos y comparte ubicación
- Soporta documentos para USA y México
- Tiene categorías: Identificación Personal, Documentos Migratorios, Documentos de Trabajo, Educación, etc.
- Línea de contacto: +1-800-MIGRANTE`;

export default {
  async message(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Usuario no autenticado');
      }

      const { message, history = [] } = ctx.request.body;

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return ctx.badRequest('El campo "message" es requerido y no puede estar vacío');
      }

      const appConfig = await strapi.service('api::app-config.app-config').getConfig();
      const apiKey = appConfig.openaiApiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        strapi.log.error('OPENAI_API_KEY no configurada (Admin > App Config o .env)');
        return ctx.internalServerError('Servicio de asistente no configurado');
      }

      const model = appConfig.openaiModel || 'gpt-4o-mini';

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.slice(-10).map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.content),
        })),
        { role: 'user', content: message.trim() },
      ];

      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!openaiRes.ok) {
        const errData = await openaiRes.json().catch(() => ({}));
        strapi.log.error('Error respuesta OpenAI:', errData);
        const status = openaiRes.status;
        if (status === 401) return ctx.unauthorized('Clave de API de asistente inválida');
        if (status === 429) return ctx.tooManyRequests('El servicio de asistente está ocupado, intenta de nuevo en unos segundos');
        return ctx.internalServerError('Error al consultar el asistente');
      }

      const data = await openaiRes.json() as { choices?: Array<{ message?: { content?: string } }> };
      const reply = data.choices?.[0]?.message?.content ?? 'Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.';

      ctx.body = { reply };
    } catch (error: any) {
      strapi.log.error('Error en chat/message:', error);
      ctx.internalServerError('Error interno del servidor');
    }
  },
};
