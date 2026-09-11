import { Injectable, Logger } from '@nestjs/common';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor() {
    this.checkConfig();
  }

  private checkConfig() {
    const hasTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER;
    const hasCloudApi = process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID;
    const hasCustomApi = process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN;

    if (hasTwilio) {
      this.logger.log('📱 WhatsApp Service configured with Twilio WhatsApp API.');
    } else if (hasCloudApi) {
      this.logger.log('📱 WhatsApp Service configured with Meta WhatsApp Cloud API.');
    } else if (hasCustomApi) {
      this.logger.log('📱 WhatsApp Service configured with Custom/UltraMsg WhatsApp REST API.');
    } else {
      this.logger.log('ℹ️ WhatsApp API credentials not set in .env. Order confirmation messages will be simulated with wa.me quick links.');
    }
  }

  /**
   * Normalizes phone number to international E.164 without leading plus for wa.me / APIs
   * Default fallback to India (+91) for 10-digit mobile numbers
   */
  normalizePhoneNumber(rawPhone?: string): string | null {
    if (!rawPhone) return null;
    let digits = rawPhone.replace(/\D/g, '');
    if (!digits) return null;

    // Handle leading zeros (e.g., 09876543210 -> 9876543210)
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // Default 10-digit Indian numbers to country code 91
    if (digits.length === 10) {
      digits = '91' + digits;
    }

    return digits;
  }

  /**
   * Generates formatted WhatsApp confirmation message for the Customer
   */
  generateCustomerMessage(order: Order): string {
    const customerName = order.customer?.name || 'Customer';
    const items = order.items || [];
    
    let itemsText = items
      .map(
        (item, index) =>
          `  ${index + 1}. *${item.productName}* x${item.quantity} - ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}`,
      )
      .join('\n');

    if (!itemsText) {
      itemsText = '  • Handmade Crochet Craft Item';
    }

    const address = order.address;
    const addressText = address
      ? `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.postalCode}`
      : 'Delivery address on record';

    return `🧶 *CROCHETLOOM HANDCRAFTS*
━━━━━━━━━━━━━━━━━━━━
✨ *Order Confirmed!*

Dear *${customerName}*,
Thank you for your order! Our artisans have received your order and begun handcrafting your pieces with care.

📦 *Order Number:* #${order.orderNumber}
📅 *Date:* ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
💰 *Total Amount:* ₹${Number(order.totalAmount).toLocaleString('en-IN')} (Paid Online)

🛍️ *Items in Your Order:*
${itemsText}

📍 *Shipping Delivery Address:*
${addressText}

🚚 *Next Steps:*
We will carefully inspect, pack, and ship your handmade creation. You will receive tracking details once dispatched.

Need any help? Just reply directly to this chat!
_Thank you for choosing handmade._ 🌸`;
  }

  /**
   * Generates formatted WhatsApp alert message for the Admin
   */
  generateAdminMessage(order: Order): string {
    const customerName = order.customer?.name || 'Guest';
    const customerEmail = order.customer?.email || 'N/A';
    const customerPhone = order.address?.phone || order.customer?.phone || 'N/A';
    const items = order.items || [];
    
    const itemsText = items
      .map(
        (item, index) =>
          `  ${index + 1}. *${item.productName}* (Qty: ${item.quantity}) - ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}`,
      )
      .join('\n');

    const address = order.address;
    const addressText = address
      ? `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.postalCode} (Ph: ${address.phone})`
      : 'N/A';

    return `🔔 *NEW ORDER ALERT - CROCHETLOOM*
━━━━━━━━━━━━━━━━━━━━
🎉 A new order has been confirmed!

• *Order:* #${order.orderNumber}
• *Value:* ₹${Number(order.totalAmount).toLocaleString('en-IN')}
• *Payment ID:* ${order.payment?.razorpayPaymentId || 'Online Payment'}

👤 *Customer Details:*
• *Name:* ${customerName}
• *Phone:* ${customerPhone}
• *Email:* ${customerEmail}

🛍️ *Ordered Products (${items.length} items):*
${itemsText}

📍 *Delivery Address:*
${addressText}

Open Admin Dashboard to manage fulfillment:
${process.env.ADMIN_URL || 'http://localhost:3001'}/dashboard/orders`;
  }

  /**
   * Create direct WhatsApp Click-to-Chat URL
   */
  createWaLink(phone: string, message: string): string {
    const cleanPhone = this.normalizePhoneNumber(phone) || '';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Main dispatch method called when an order is confirmed
   */
  async sendOrderConfirmationWhatsApp(order: Order): Promise<void> {
    const customerPhoneRaw = order.address?.phone || order.customer?.phone;
    const customerPhone = this.normalizePhoneNumber(customerPhoneRaw);
    const adminPhoneRaw = process.env.ADMIN_WHATSAPP_PHONE || process.env.ADMIN_PHONE;
    const adminPhone = this.normalizePhoneNumber(adminPhoneRaw);

    const customerMessage = this.generateCustomerMessage(order);
    const adminMessage = this.generateAdminMessage(order);

    this.logger.log(`🚀 Dispatching WhatsApp Notifications for Order #${order.orderNumber}...`);

    // 1. Send to Customer
    if (customerPhone) {
      await this.sendMessage(customerPhone, customerMessage, 'Customer');
    } else {
      this.logger.warn(`⚠️ No phone number available for customer on Order #${order.orderNumber}. WhatsApp message skipped.`);
    }

    // 2. Send to Admin
    if (adminPhone) {
      await this.sendMessage(adminPhone, adminMessage, 'Admin');
    } else {
      this.logger.log('ℹ️ ADMIN_WHATSAPP_PHONE not configured in backend/.env. Simulated admin WhatsApp logged.');
    }
  }

  /**
   * Sends or simulates message delivery across configured providers
   */
  private async sendMessage(recipientPhone: string, message: string, recipientType: 'Customer' | 'Admin'): Promise<void> {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER; // e.g. "whatsapp:+14155238886"

    const cloudToken = process.env.WHATSAPP_CLOUD_TOKEN;
    const cloudPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const customApiUrl = process.env.WHATSAPP_API_URL;
    const customApiToken = process.env.WHATSAPP_API_TOKEN;

    // --- Provider 1: Twilio WhatsApp ---
    if (twilioAccountSid && twilioAuthToken && twilioFrom) {
      try {
        const toFormatted = recipientPhone.startsWith('+') ? `whatsapp:${recipientPhone}` : `whatsapp:+${recipientPhone}`;
        const fromFormatted = twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`;

        const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('From', fromFormatted);
        params.append('To', toFormatted);
        params.append('Body', message);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        if (response.ok) {
          this.logger.log(`✅ [Twilio] WhatsApp message successfully sent to ${recipientType} (+${recipientPhone})`);
          return;
        } else {
          const errData = await response.text();
          this.logger.error(`❌ [Twilio] WhatsApp failed to send to ${recipientType}: ${errData}`);
        }
      } catch (err: any) {
        this.logger.error(`❌ [Twilio] Error sending WhatsApp message: ${err.message}`);
      }
    }

    // --- Provider 2: Meta WhatsApp Cloud API ---
    if (cloudToken && cloudPhoneNumberId) {
      try {
        const url = `https://graph.facebook.com/v20.0/${cloudPhoneNumberId}/messages`;
        const payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: { preview_url: true, body: message },
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cloudToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          this.logger.log(`✅ [WhatsApp Cloud API] Message successfully sent to ${recipientType} (+${recipientPhone})`);
          return;
        } else {
          const errData = await response.text();
          this.logger.error(`❌ [WhatsApp Cloud API] Failed to send: ${errData}`);
        }
      } catch (err: any) {
        this.logger.error(`❌ [WhatsApp Cloud API] Error sending message: ${err.message}`);
      }
    }

    // --- Provider 3: UltraMsg / Custom REST API ---
    if (customApiUrl && customApiToken) {
      try {
        const response = await fetch(customApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: customApiToken,
            to: `+${recipientPhone}`,
            body: message,
          }),
        });

        if (response.ok) {
          this.logger.log(`✅ [WhatsApp Gateway] Message successfully sent to ${recipientType} (+${recipientPhone})`);
          return;
        } else {
          const errData = await response.text();
          this.logger.error(`❌ [WhatsApp Gateway] Failed to send: ${errData}`);
        }
      } catch (err: any) {
        this.logger.error(`❌ [WhatsApp Gateway] Error: ${err.message}`);
      }
    }

    // --- Provider 4: Simulated Mode (Log to Console + Click-to-Chat Link) ---
    const waLink = this.createWaLink(recipientPhone, message);
    this.logger.log(`\n================== [SIMULATED WHATSAPP TO ${recipientType.toUpperCase()}] ==================
To: +${recipientPhone}
Direct WhatsApp Click-to-Chat Link:
👉 ${waLink}

Message Preview:
${message}
(To send live WhatsApp messages automatically, configure TWILIO_ACCOUNT_SID or WHATSAPP_CLOUD_TOKEN in backend/.env)
========================================================================================\n`);
  }
}
