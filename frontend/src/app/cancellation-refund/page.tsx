import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Cancellation and Refund Policy | CrochetLoom Artisanal',
  description: 'Guidelines on cancellations, exchanges, and refund processing on CrochetLoom.',
};

export default function CancellationRefundPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-600 hover:text-clay-800 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-200 shadow-sm space-y-8">
        <div className="border-b border-cream-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-clay-700">
            <RotateCcw className="w-4 h-4" /> Returns & Guarantee
          </div>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight font-serif-accent">
            Cancellation & Refund Policy
          </h1>
          <p className="text-xs text-stone-400">Last updated: September 2026</p>
        </div>

        <div className="prose prose-stone text-xs leading-relaxed space-y-6 text-stone-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">1. Order Cancellations</h2>
            <p>
              You can cancel an order within <strong>12 hours of placement</strong> or before the item has been dispatched by contacting our support team at <a href="mailto:support@crochetloom.com" className="text-clay-600 underline">support@crochetloom.com</a>. Once dispatched, an order cannot be cancelled in transit.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">2. Returns and Replacements</h2>
            <p>
              Due to the artisanal, hygiene, and custom-knitted nature of handmade apparel, hair accessories, and toys, returns are accepted in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Item received in damaged condition during transit.</li>
              <li>Incorrect product or size delivered compared to your order.</li>
            </ul>
            <p className="text-stone-600">
              Please notify us within <strong>48 hours of delivery</strong> with an unboxing photo/video of the parcel. We will arrange a free reverse pickup and immediate replacement.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">3. Refund Processing Timelines</h2>
            <p>
              Upon receiving the returned item or cancellation approval, refunds are credited directly back to your original payment method (Bank Account, UPI, or Card via Razorpay) within <strong>5 to 7 business days</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">4. Contact For Return Queries</h2>
            <p>
              For return requests or refund status inquiries, please email us at <a href="mailto:refunds@crochetloom.com" className="text-clay-600 underline">refunds@crochetloom.com</a> or message us on WhatsApp at <strong>+91 98765 43210</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
