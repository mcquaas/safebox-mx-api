import { factories } from '@strapi/strapi';

export type AppConfig = {
  twilioSid: string;
  twilioToken: string;
  twilioPhone: string;
  twilioTestTo: string;
  openaiApiKey: string;
  openaiModel: string;
  emergencyDemoSimulateDelivery: boolean;
  emergencyDemoNotifyAllContacts: boolean;
};

export default factories.createCoreService('api::app-config.app-config', ({ strapi }) => ({
  /**
   * Get merged config: admin (single type) values with fallback to env.
   * Use this everywhere instead of reading process.env for these keys.
   */
  async getConfig(): Promise<AppConfig> {
    let doc: any = null;
    try {
      const list = await strapi.entityService.findMany('api::app-config.app-config', { limit: 1 });
      doc = Array.isArray(list) ? list[0] : list;
    } catch (_) {
      // Content type might not be in DB yet
    }

    return {
      twilioSid: (doc?.twilioSid?.trim() || process.env.TWILIO_SID || '').trim(),
      twilioToken: (doc?.twilioToken?.trim() || process.env.TWILIO_TOKEN || '').trim(),
      twilioPhone: (doc?.twilioPhone?.trim() || process.env.TWILIO_PHONE || '').trim(),
      twilioTestTo: (doc?.twilioTestTo?.trim() || process.env.TWILIO_TEST_TO || '').trim(),
      openaiApiKey: (doc?.openaiApiKey?.trim() || process.env.OPENAI_API_KEY || '').trim(),
      openaiModel: (doc?.openaiModel?.trim() || process.env.OPENAI_MODEL || 'gpt-4o-mini').trim() || 'gpt-4o-mini',
      emergencyDemoSimulateDelivery:
        doc?.emergencyDemoSimulateDelivery === true || process.env.EMERGENCY_DEMO_SIMULATE_DELIVERY === 'true',
      emergencyDemoNotifyAllContacts:
        doc?.emergencyDemoNotifyAllContacts === true || process.env.EMERGENCY_DEMO_NOTIFY_ALL_CONTACTS === 'true',
    };
  },
}));
