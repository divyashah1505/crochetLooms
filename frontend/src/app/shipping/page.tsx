import React from 'react';
import Link from 'next/link';
import { Truck, ArrowLeft, PackageCheck, Clock } from 'lucide-react';

export const metadata = {
  title: 'Shipping and Delivery Policy | CrochetLoom Artisanal',
  description: 'Shipping timelines, delivery rates, and courier dispatch guidelines for CrochetLoom.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-600 hover:text-clay-800 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-cream-200 shadow-sm space-y-8">
        <div className="border-b border-cream-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-clay-700">
            <Truck className="w-4 h-4" /> Fulfillment & Logistics
          </div>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight font-serif-accent">
            Shipping & Delivery Policy
          </h1>
          <p className="text-xs text-stone-400">Last updated: September 2026</p>
        </div>

        <div className="prose prose-stone text-xs leading-relaxed space-y-6 text-stone-700">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">1. Processing & Crafting Time</h2>
            <p>
              Because every creation is artisanal and hand-knitted with organic cotton yarn:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li><strong>In-Stock Items</strong>: Dispatched within <strong>24 to 48 hours</strong> of order verification.</li>
              <li><strong>Made-to-Order & Custom Designs</strong>: Require <strong>3 to 5 business days</strong> of handcrafted production before dispatch.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">2. Shipping Rates Across India</h2>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li><strong>Free Standard Delivery</strong>: On all orders of <strong>₹1,000 or above</strong>.</li>
              <li><strong>Standard Shipping Fee</strong>: ₹50 flat rate for orders below ₹1,000.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">3. Estimated Delivery Timeline</h2>
            <p>
              Once dispatched, deliveries across India usually reach destinations in:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Metro Cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Ahmedabad): <strong>3 to 5 business days</strong>.</li>
              <li>Rest of India: <strong>5 to 7 business days</strong>.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-yarn-mocha uppercase tracking-wider">4. Tracking Your Shipment</h2>
            <p>
              As soon as your parcel is dispatched, you will receive a tracking link via email and SMS. You can also view live fulfillment status directly inside your <Link href="/orders" className="text-clay-600 underline font-semibold">My Orders</Link> dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
