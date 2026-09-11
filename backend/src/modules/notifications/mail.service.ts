import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.logger.log(`📧 SMTP Transporter initialized successfully (${host}:${port})`);
      } catch (err: any) {
        this.logger.warn(`⚠️ Failed to initialize SMTP Transporter: ${err.message}`);
      }
    } else {
      this.logger.log('ℹ️ SMTP credentials not fully provided in .env (SMTP_HOST, SMTP_USER, SMTP_PASS). Order confirmation notifications will be logged to console.');
    }
  }

  /**
   * Send order confirmation messages to both Customer and Admin
   */
  async sendOrderConfirmationNotifications(order: Order): Promise<void> {
    const customer = order.customer;
    const customerEmail = customer?.email;
    const adminEmail =
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      'admin@crochetloom.com';

    this.logger.log(`🚀 Dispatching Order Confirmation for #${order.orderNumber} to Customer (${customerEmail}) & Admin (${adminEmail})`);

    // 1. Send confirmation email to Customer
    if (customerEmail) {
      await this.sendCustomerConfirmation(order, customerEmail);
    }

    // 2. Send new order alert email to Admin
    if (adminEmail) {
      await this.sendAdminAlert(order, adminEmail);
    }
  }

  private async sendCustomerConfirmation(order: Order, customerEmail: string): Promise<void> {
    const from = process.env.MAIL_FROM || `\"CrochetLoom Handcrafts\" <${process.env.SMTP_USER || 'orders@crochetloom.com'}>`;
    const subject = `🧶 Order Confirmed! #${order.orderNumber} - Thank You for Shopping with CrochetLoom`;
    const html = this.generateCustomerEmailHtml(order);

    if (!this.transporter) {
      this.logger.log(`\n================== [SIMULATED CUSTOMER EMAIL] ==================
To: ${customerEmail}
Subject: ${subject}
Order Number: ${order.orderNumber}
Total Amount: ₹${order.totalAmount}
Items Count: ${order.items?.length || 0}
(To send real emails, set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env)
=================================================================\n`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: customerEmail,
        subject,
        html,
      });
      this.logger.log(`✅ Order confirmation email successfully sent to customer: ${customerEmail}`);
    } catch (err: any) {
      this.logger.error(`❌ Failed to send confirmation email to customer (${customerEmail}): ${err.message}`);
    }
  }

  private async sendAdminAlert(order: Order, adminEmail: string): Promise<void> {
    const from = process.env.MAIL_FROM || `\"CrochetLoom Alerts\" <${process.env.SMTP_USER || 'alerts@crochetloom.com'}>`;
    const customerName = order.customer?.name || 'Valued Customer';
    const subject = `🎉 New Order Received! #${order.orderNumber} - ₹${order.totalAmount} (${customerName})`;
    const html = this.generateAdminEmailHtml(order);

    if (!this.transporter) {
      this.logger.log(`\n================== [SIMULATED ADMIN ALERT EMAIL] ==================
To: ${adminEmail}
Subject: ${subject}
Customer: ${customerName} (${order.customer?.email || 'N/A'}, Phone: ${order.customer?.phone || order.address?.phone || 'N/A'})
Total Amount: ₹${order.totalAmount}
Order ID: ${order.id}
(To send real emails, set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env)
===================================================================\n`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: adminEmail,
        subject,
        html,
      });
      this.logger.log(`✅ New order alert email successfully sent to admin: ${adminEmail}`);
    } catch (err: any) {
      this.logger.error(`❌ Failed to send alert email to admin (${adminEmail}): ${err.message}`);
    }
  }

  private generateCustomerEmailHtml(order: Order): string {
    const customerName = order.customer?.name || 'Artisan Crochet Lover';
    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #f1ece4;">
          <td style="padding: 12px 8px; vertical-align: middle;">
            ${item.productImage ? `<img src="${item.productImage}" alt="${item.productName}" style="width: 54px; height: 54px; object-fit: cover; border-radius: 10px; border: 1px solid #e8dfd3; display: inline-block; vertical-align: middle; margin-right: 12px;" />` : ''}
            <span style="font-weight: 600; color: #382823; font-size: 13px;">${item.productName}</span>
          </td>
          <td style="padding: 12px 8px; text-align: center; color: #57463f; font-size: 13px;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; text-align: right; color: #c45b41; font-weight: 700; font-size: 13px;">
            ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}
          </td>
        </tr>`,
      )
      .join('');

    const address = order.address;
    const addressHtml = address
      ? `
        <p style="margin: 4px 0; font-size: 13px; color: #57463f;"><strong>${address.fullName}</strong> (${address.phone})</p>
        <p style="margin: 4px 0; font-size: 13px; color: #6b5a53;">${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #6b5a53;">${address.city}, ${address.state} - ${address.postalCode}</p>`
      : '<p style="margin: 4px 0; font-size: 13px; color: #6b5a53;">Standard Delivery</p>';

    const paymentInfo = order.payment?.razorpayPaymentId
      ? `Payment ID: <code style="background: #f1ece4; padding: 2px 6px; border-radius: 6px;">${order.payment.razorpayPaymentId}</code> (Paid Online via Razorpay)`
      : 'Payment Status: Confirmed';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Order Confirmation #${order.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #ede5da; box-shadow: 0 10px 25px rgba(0,0,0,0.03);">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #c45b41 0%, #db8068 100%); padding: 32px 28px; text-align: center; color: #ffffff;">
            <div style="font-size: 32px; margin-bottom: 8px;">🧶</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">CrochetLoom</h1>
            <p style="margin: 6px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.9;">Artisanal Handcrafts</p>
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding: 32px 28px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="display: inline-block; background-color: #ebf5ee; color: #2e6b47; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">✓ Order Confirmed</span>
              <h2 style="color: #382823; font-size: 20px; margin: 12px 0 6px;">Thank You, ${customerName}!</h2>
              <p style="color: #6b5a53; font-size: 14px; margin: 0;">We have received your order and our artisan craftswomen have begun lovingly preparing your handmade creations.</p>
            </div>

            <!-- Order Details Card -->
            <div style="background-color: #fbf9f6; border: 1px solid #f1ece4; border-radius: 16px; padding: 16px; margin-bottom: 24px;">
              <table width="100%" style="font-size: 13px; color: #57463f;">
                <tr>
                  <td><strong>Order Number:</strong></td>
                  <td style="text-align: right; font-weight: 700; color: #c45b41;">#${order.orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding-top: 6px;"><strong>Date:</strong></td>
                  <td style="padding-top: 6px; text-align: right;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding-top: 6px;" colspan="2">${paymentInfo}</td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <h3 style="color: #382823; font-size: 15px; margin: 0 0 12px; border-bottom: 2px solid #f1ece4; padding-bottom: 8px;">Your Items</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
              <thead>
                <tr style="font-size: 11px; text-transform: uppercase; color: #8e7a71; letter-spacing: 0.5px;">
                  <th style="text-align: left; padding-bottom: 8px;">Product</th>
                  <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <!-- Summary Totals -->
            <table width="100%" style="font-size: 14px; color: #57463f; margin-bottom: 24px; border-top: 1px solid #f1ece4; padding-top: 12px;">
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right; font-weight: 600;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="padding-top: 6px;">Shipping</td>
                <td style="padding-top: 6px; text-align: right; font-weight: 700; color: #2e6b47; text-transform: uppercase; font-size: 12px;">Free</td>
              </tr>
              <tr style="font-size: 18px; color: #382823; font-weight: 800;">
                <td style="padding-top: 12px; border-top: 2px solid #f1ece4;">Grand Total</td>
                <td style="padding-top: 12px; border-top: 2px solid #f1ece4; text-align: right; color: #c45b41;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
              </tr>
            </table>

            <!-- Delivery Address Card -->
            <div style="background-color: #fbf9f6; border: 1px solid #f1ece4; border-radius: 16px; padding: 16px;">
              <h4 style="margin: 0 0 8px; font-size: 14px; color: #382823;">📦 Shipping & Delivery Address</h4>
              ${addressHtml}
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f4eee6; padding: 24px 28px; text-align: center; color: #7d6b63; font-size: 12px; border-top: 1px solid #ebe2d6;">
            <p style="margin: 0 0 6px; font-weight: 600; color: #4a3a33;">Handcrafted with 100% pure organic cotton & heirloom love.</p>
            <p style="margin: 0;">Need help with your order? Reach us anytime at <a href="mailto:${process.env.ADMIN_EMAIL || 'support@crochetloom.com'}" style="color: #c45b41; text-decoration: none; font-weight: 600;">${process.env.ADMIN_EMAIL || 'support@crochetloom.com'}</a></p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
  }

  private generateAdminEmailHtml(order: Order): string {
    const customer = order.customer;
    const address = order.address;
    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px 6px;"><strong>${item.productName}</strong></td>
          <td style="padding: 10px 6px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 6px; text-align: right; font-weight: 700; color: #c45b41;">₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}</td>
        </tr>`,
      )
      .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: sans-serif; background-color: #f6f6f6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #e0e0e0;">
        <div style="background: #c45b41; color: white; padding: 14px 20px; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18px;">🎉 New Confirmed Order #${order.orderNumber}</h2>
        </div>

        <p style="font-size: 15px;"><strong>Customer:</strong> ${customer?.name || 'N/A'} (&lt;${customer?.email || 'N/A'}&gt;)</p>
        <p style="font-size: 15px;"><strong>Customer Phone:</strong> ${customer?.phone || address?.phone || 'N/A'}</p>
        <p style="font-size: 15px;"><strong>Total Amount:</strong> <span style="font-size: 20px; font-weight: bold; color: #c45b41;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</span></p>
        <p style="font-size: 14px;"><strong>Payment ID:</strong> <code>${order.payment?.razorpayPaymentId || 'N/A'}</code></p>
        
        <h4 style="margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Items Ordered:</h4>
        <table width="100%" style="font-size: 13px;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="text-align: left; padding: 6px;">Product</th>
              <th style="text-align: center; padding: 6px;">Qty</th>
              <th style="text-align: right; padding: 6px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <h4 style="margin: 20px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 6px;">Shipping Address:</h4>
        <div style="background: #fafafa; padding: 12px; border-radius: 8px; font-size: 13px;">
          <p style="margin: 2px 0;"><strong>${address?.fullName || customer?.name || ''}</strong></p>
          <p style="margin: 2px 0;">Phone: ${address?.phone || customer?.phone || 'N/A'}</p>
          <p style="margin: 2px 0;">${address?.addressLine1 || ''} ${address?.addressLine2 || ''}</p>
          <p style="margin: 2px 0;">${address?.city || ''}, ${address?.state || ''} - ${address?.postalCode || ''}</p>
        </div>

        <div style="margin-top: 24px; text-align: center;">
          <a href="http://localhost:3001/dashboard/orders" style="display: inline-block; background: #c45b41; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">View in Admin Portal &rarr;</a>
        </div>
      </div>
    </body>
    </html>
    `;
  }
}
