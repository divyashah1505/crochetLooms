import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | CrochetLoom Artisanal',
  description: 'Privacy policy and data protection practices for CrochetLoom customers.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-600 hover:text-clay-800 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-200 shadow-sm space-y-8">
        <div className="border-b border-cream-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sage-700">
            <ShieldCheck className="w-4 h-4" /> Data Protection & Trust
          </div>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight font-serif-accent">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone-400">Last updated: September 2026</p>
        </div>

        <div className="prose prose-stone text-xs leading-relaxed space-y-6 text-stone-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, place an order, or contact customer support. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Contact details: Name, email address, phone number.</li>
              <li>Delivery details: Shipping address, postal code, recipient name.</li>
              <li>Order history and communication records.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">2. Payment Security</h2>
            <p>
              All payment transactions are processed through <strong>Razorpay</strong>, an RBI-authorized, PCI-DSS Level 1 compliant payment processor. CrochetLoom does not store, process, or view your sensitive credit card numbers, CVVs, or bank passwords.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">3. How We Use Your Information</h2>
            <p>
              Your data is exclusively utilized to process your handcrafted orders, dispatch shipments via courier partners, provide order tracking updates via SMS/Email, and assist with support queries. We never sell or lease customer information to third-party advertisers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">4. Cookies and Analytics</h2>
            <p>
              We use functional session cookies to store cart items and preserve customer sign-in sessions for seamless navigation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">5. Contact Our Privacy Officer</h2>
            <p>
              If you have any questions or wish to request data deletion, contact us at <a href="mailto:privacy@crochetloom.com" className="text-clay-600 underline">privacy@crochetloom.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
