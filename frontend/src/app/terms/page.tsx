import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Shield } from 'lucide-react';

export const metadata = {
  title: 'Terms and Conditions | CrochetLoom Artisanal',
  description: 'Terms of Service and conditions for purchasing handmade crochet products on CrochetLoom.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-600 hover:text-clay-800 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-200 shadow-sm space-y-8">
        <div className="border-b border-cream-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-clay-700">
            <FileText className="w-4 h-4" /> Legal & Terms
          </div>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight font-serif-accent">
            Terms & Conditions
          </h1>
          <p className="text-xs text-stone-400">Last updated: September 2026</p>
        </div>

        <div className="prose prose-stone text-xs leading-relaxed space-y-6 text-stone-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">1. Handcrafted Nature of Products</h2>
            <p>
              Welcome to <strong>CrochetLoom</strong>. Every product listed on our platform is 100% handmade and hand-stitched by skilled artisans. As each creation is unique, minor variations in stitching tension, dimensions (±1-2 cm), or yarn dye-lot shades compared to digital display photos are hallmarks of genuine handcraft and are not considered defects.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">2. Pricing and Payments</h2>
            <p>
              All prices listed on CrochetLoom are in Indian National Rupees (INR ₹) inclusive of all applicable taxes. We accept payments securely through our authorized payment gateway partner, <strong>Razorpay</strong>, supporting UPI, Credit/Debit Cards, NetBanking, and authorized digital wallets.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">3. Order Acceptance and Fulfillment</h2>
            <p>
              Upon placing an order and completing payment verification, you will receive an official order confirmation with a unique Order Number. In-stock products are prepared and dispatched within 1-2 business days. Custom-made orders require an additional crafting time of 3-5 business days before dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">4. User Account & Security</h2>
            <p>
              When creating an account or placing orders, you agree to provide accurate and complete delivery contact details. You are responsible for maintaining the confidentiality of your account credentials.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">5. Intellectual Property</h2>
            <p>
              All product photography, patterns, brand designs, logos, and descriptions published on CrochetLoom are the exclusive intellectual property of CrochetLoom Studio and may not be reproduced without written consent.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">6. Contact Information</h2>
            <p>
              For questions concerning our Terms & Conditions, please contact us at <a href="mailto:support@crochetloom.com" className="text-clay-600 underline">support@crochetloom.com</a> or visit our <Link href="/contact" className="text-clay-600 underline">Contact Us</Link> page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
