import React from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ShieldCheck, Truck, ExternalLink, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cream-100 border-t border-cream-200 text-stone-700 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-cream-200">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur border border-cream-200">
            <div className="p-2.5 rounded-xl bg-clay-100 text-clay-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-yarn-mocha">100% Handcrafted</h4>
              <p className="text-xs text-stone-500">Every single stitch made by master artisans</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur border border-cream-200">
            <div className="p-2.5 rounded-xl bg-sage-100 text-sage-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-yarn-mocha">Eco-Friendly Shipping</h4>
              <p className="text-xs text-stone-500">Plastic-free sustainable gift packaging</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur border border-cream-200">
            <div className="p-2.5 rounded-xl bg-yarn-dustyPink/30 text-clay-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-yarn-mocha">Secure Razorpay Checkout</h4>
              <p className="text-xs text-stone-500">RBI & PCI-DSS 256-bit encrypted payments</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧶</span>
              <span className="font-serif-accent text-xl font-bold text-yarn-mocha">
                Crochet<span className="text-clay-600">Loom</span>
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              We bring cozy handmade beauty into your daily life with artisanal crochet bags, floral bouquets, adorable amigurumi, and heirloom knitwear.
            </p>
            <div className="pt-1">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-clay-700 hover:text-clay-900 bg-white px-3 py-1.5 rounded-xl border border-cream-300"
              >
                <Mail className="w-3.5 h-3.5" /> Contact Artisan Studio
              </Link>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-yarn-mocha mb-3">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?category=bags-purses" className="hover:text-clay-600">
                  👜 Bags & Purses
                </Link>
              </li>
              <li>
                <Link href="/products?category=botanical-flowers" className="hover:text-clay-600">
                  🌸 Flowers & Bouquets
                </Link>
              </li>
              <li>
                <Link href="/products?category=amigurumi-plushies" className="hover:text-clay-600">
                  🧸 Amigurumi Plushies
                </Link>
              </li>
              <li>
                <Link href="/products?category=wearables-clothing" className="hover:text-clay-600">
                  🧶 Cardigans & Wearables
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-decor-living" className="hover:text-clay-600">
                  🛋️ Home Decor & Living
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-yarn-mocha mb-3">
              Customer Care & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="hover:text-clay-600 font-medium">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-clay-600">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-refund" className="hover:text-clay-600">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-clay-600">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-clay-600">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Admin & Account */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-yarn-mocha mb-3">
              Portals & Orders
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-clay-600 font-bold flex items-center gap-1.5 text-clay-700"
                >
                  <span>👑 Admin Portal (Port 3001)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <Link href="/orders" className="hover:text-clay-600">
                  Track My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-clay-600">
                  Account Settings & Addresses
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Legal Bar */}
        <div className="pt-8 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 CrochetLoom Artisan Studio. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Woven with <Heart className="w-3.5 h-3.5 text-clay-500 fill-clay-500" /> for crochet enthusiasts worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};
