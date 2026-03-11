import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::emergency-log.emergency-log', ({ strapi }) => ({
  /**
   * Whether to simulate delivery (log only, no real SMS/email). Uses App Config or env.
   */
  async isDemoSimulatedDeliveryEnabled(): Promise<boolean> {
    const config = await strapi.service('api::app-config.app-config').getConfig();
    return config.emergencyDemoSimulateDelivery;
  },

  /**
   * Notificar a un contacto de emergencia
   */
  async notifyContact(contact: any, user: any, documents: any[] = [], locationData: any = {}, customMessage = '') {
    try {
      const { location, latitude, longitude } = locationData;

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

      if (contact.phone) {
        await this.sendSMS(contact.phone, message);
      }

      if (contact.email) {
        await this.sendEmail(contact.email, `🚨 Emergencia - ${user.firstName} ${user.lastName}`, message, documents);
      }

      strapi.log.info(`Contacto de emergencia notificado: ${contact.fullName} (${contact.phone})`);
    } catch (error) {
      strapi.log.error('Error al notificar contacto:', error);
      throw error;
    }
  },

  async sendSMS(phone: string, message: string) {
    try {
      const config = await strapi.service('api::app-config.app-config').getConfig();
      if (config.emergencyDemoSimulateDelivery) {
        strapi.log.info(`[DEMO] SMS simulado a ${phone}: ${message.substring(0, 80)}...`);
        return;
      }

      const sid = config.twilioSid || process.env.TWILIO_SID;
      const token = config.twilioToken || process.env.TWILIO_TOKEN;
      const from = config.twilioPhone || process.env.TWILIO_PHONE;

      if (!sid || !token || !from) {
        strapi.log.warn('Twilio no configurado (Admin > App Config o .env: TWILIO_SID, TWILIO_TOKEN, TWILIO_PHONE) - omitiendo SMS');
        return;
      }

      const body = message.length > 320 ? message.substring(0, 317) + '...' : message;

      const twilio = require('twilio');
      const client = twilio(sid, token);

      await client.messages.create({ body, from, to: phone });

      strapi.log.info(`SMS enviado via Twilio a ${phone}`);
    } catch (error) {
      strapi.log.error('Error enviando SMS via Twilio:', error);
      throw error;
    }
  },

  async sendEmail(email: string, subject: string, message: string, documents: any[] = []) {
    try {
      const config = await strapi.service('api::app-config.app-config').getConfig();
      if (config.emergencyDemoSimulateDelivery) {
        strapi.log.info(`[DEMO] Email simulado a ${email}: ${subject}`);
        return;
      }

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
        documents.forEach((doc: any) => {
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

      await strapi.plugins['email'].services.email.send({
        to: email,
        subject,
        text: message,
        html,
      });

      strapi.log.info(`Email enviado a ${email}`);
    } catch (error) {
      strapi.log.error('Error enviando email:', error);
      throw error;
    }
  },

  async generateEmergencyAccessLink(user: any, documents: any[]) {
    try {
      const token = strapi.plugins['users-permissions'].services.jwt.issue({
        id: user.id,
        emergency: true,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
      });

      return `https://api.mysafebox.org/emergency-access?token=${token}`;
    } catch (error) {
      strapi.log.error('Error generando enlace de emergencia:', error);
      throw error;
    }
  },
}));
