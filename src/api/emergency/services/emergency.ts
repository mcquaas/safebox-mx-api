import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::emergency-log.emergency-log', ({ strapi }) => ({
  /**
   * Notificar a un contacto de emergencia
   */
  async notifyContact(contact: any, user: any, documents: any[] = [], locationData: any = {}, customMessage = '') {
    try {
      const { location, latitude, longitude } = locationData;
      
      // Construir mensaje de emergencia
      let message = customMessage || `🚨 EMERGENCIA - ${user.firstName} ${user.lastName}`;
      
      if (location) {
        message += `\n📍 Ubicación: ${location}`;
      }
      
      if (latitude && longitude) {
        message += `\n🗺️ Coordenadas: ${latitude}, ${longitude}`;
        message += `\n🔗 Ver en mapa: https://maps.google.com/?q=${latitude},${longitude}`;
      }
      
      if (documents.length > 0) {
        message += `\n📄 Documentos compartidos: ${documents.length}`;
        message += `\n🔗 Acceder: https://api.mysafebox.org/emergency-access`;
      }
      
      message += `\n\n⚠️ Este es un mensaje automático de SafeBox MX`;

      // Enviar SMS (implementar con servicio como Twilio)
      if (contact.phone) {
        await (this as any).sendSMS(contact.phone, message);
      }

      // Enviar email
      if (contact.email) {
        await (this as any).sendEmail(contact.email, `🚨 Emergencia - ${user.firstName} ${user.lastName}`, message, documents);
      }

      // Log de notificación
      strapi.log.info(`Contacto de emergencia notificado: ${contact.fullName} (${contact.phone})`);

    } catch (error) {
      strapi.log.error('Error al notificar contacto:', error);
      throw error;
    }
  },

  /**
   * Enviar SMS
   */
  async sendSMS(phone, message) {
    try {
      // Implementar integración con Twilio o similar
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      
      // await client.messages.create({
      //   body: message,
      //   from: process.env.TWILIO_PHONE,
      //   to: phone
      // });

      strapi.log.info(`SMS enviado a ${phone}: ${message.substring(0, 50)}...`);
    } catch (error) {
      strapi.log.error('Error enviando SMS:', error);
      throw error;
    }
  },

  /**
   * Enviar email
   */
  async sendEmail(email, subject, message, documents = []) {
    try {
      // Construir HTML del email
      let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1>🚨 EMERGENCIA - SafeBox MX</h1>
          </div>
          <div style="padding: 20px;">
            <pre style="white-space: pre-wrap; font-family: inherit;">${message}</pre>
      `;

      if (documents.length > 0) {
        html += `
          <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <h3>📄 Documentos Compartidos:</h3>
            <ul>
        `;
        
        documents.forEach(doc => {
          html += `<li>${doc.title} (${doc.category?.name || 'Sin categoría'})</li>`;
        });
        
        html += `
            </ul>
          </div>
        `;
      }

      html += `
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #666;">
            <small>Este mensaje fue enviado automáticamente por SafeBox MX</small>
          </div>
        </div>
      `;

      // Enviar email usando el plugin de email de Strapi
      await strapi.plugins['email'].services.email.send({
        to: email,
        subject: subject,
        html: html
      });

      strapi.log.info(`Email enviado a ${email}`);
    } catch (error) {
      strapi.log.error('Error enviando email:', error);
      throw error;
    }
  },

  /**
   * Generar enlace de acceso de emergencia
   */
  async generateEmergencyAccessLink(user, documents) {
    try {
      // Generar token temporal para acceso de emergencia
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        emergency: true,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
      });

      return `https://api.mysafebox.org/emergency-access?token=${token}`;
    } catch (error) {
      strapi.log.error('Error generando enlace de emergencia:', error);
      throw error;
    }
  }
})); 