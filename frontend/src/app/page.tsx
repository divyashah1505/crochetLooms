'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Heart, ShieldCheck, Truck, Star, Award, MessageCircle } from 'lucide-react';
import { useChatStore } from '../store/chat.store';
import { TagNav } from '../components/common/TagNav';
import { ProductGrid } from '../components/customer/ProductGrid';
import { Button } from '../components/common/Button';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { Product } from '../types/product';
import { Category } from '../types/category';
export default function HomePage() {
  const { openChat } = useChatStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 8, sort: 'featured' }),
      categoryService.getCategories(),
    ])
      .then(([prodRes, catList]) => {
        setFeaturedProducts(prodRes.items || []);
        setCategories(catList || []);
      })
      .catch((err) => console.error('Failed to load home page content:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-cream-100/80 via-cream-50/50 to-cream-50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-clay-100 border border-clay-200 text-clay-700 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-clay-500" />
                <span>Handcrafted with 100% Organic Cotton Yarn</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-yarn-mocha tracking-tight leading-[1.15]">
                Artisanal Crochet, <br className="hidden sm:inline" />
                <span className="text-artisan-gradient font-serif-accent italic font-normal">
                  Lovingly Stitched
                </span>{' '}
                for You
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Discover bespoke crochet daisy bags, everlasting floral bouquets, cozy granny-square cardigans, and heartwarming amigurumi plushies made to cherish for a lifetime.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/products">
                  <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Explore All Creations
                  </Button>
                </Link>
                <Link href="/products?tag=flower">
                  <Button variant="secondary" size="lg">
                    🌸 Floral Bouquets
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={openChat}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-cream-100 text-yarn-mocha border border-cream-300 font-semibold text-sm transition-all shadow-cozy hover:scale-105 active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-clay-600" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-cream-200/80 max-w-lg mx-auto lg:mx-0 text-stone-600 text-xs">
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-yarn-mocha">5,000+</span>
                  <span className="text-stone-500">Hours Hand-Crocheted</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-yarn-mocha">100%</span>
                  <span className="text-stone-500">Pure Organic Cotton</span>
                </div>
                <div className="flex flex-col items-center lg:items-start">
                  <span className="text-xl font-extrabold text-yarn-mocha">4.9/5</span>
                  <span className="text-stone-500">Artisan Rating ★</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-cream-200 group">
                <img
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80"
                  alt="Handmade Crochet Sunflower Purse"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Badge 1 */}
                <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-cream-200 flex items-center gap-2.5 animate-bounce">
                  <span className="text-xl">🌸</span>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-clay-600">Bestseller</p>
                    <p className="text-xs font-bold text-yarn-mocha">Daisy Shoulder Purse</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute bottom-4 right-4 p-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border border-cream-200 flex items-center gap-2.5">
                  <Award className="w-5 h-5 text-yarn-honey" />
                  <div className="text-left">
                    <p className="text-xs font-bold text-yarn-mocha">Master Handcrafted</p>
                    <p className="text-[10px] text-stone-500">40+ hours per piece</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Tag Master Navigation Bar (Interactive Filter) */}
      <TagNav />

      {/* 3. Featured Creations Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-clay-600 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Masterpieces
            </div>
            <h2 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
              Featured Creations
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-clay-700 hover:text-clay-900 flex items-center gap-1"
          >
            Browse Full Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </section>

      {/* 4. Browse by Category */}
      <section className="py-16 bg-cream-100/60 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
              Curated Collections
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Explore our handmade collections tailored for gifting, self-expression, and home warmth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-cream-200"
              >
                <img
                  src={
                    cat.imageUrl ||
                    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="text-lg font-bold group-hover:text-yarn-dustyPink transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-cream-200 line-clamp-2 mt-1">
                    {cat.description}
                  </p>
                  <span className="text-[11px] font-bold text-yarn-honey flex items-center gap-1 mt-3">
                    Shop Collection &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Artisan Craft Story */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80"
              alt="Artisan hand knitting yarn"
              className="rounded-3xl shadow-xl border-4 border-white w-full aspect-4/3 object-cover"
            />
            <div className="absolute -bottom-6 -right-6 p-5 rounded-2xl bg-white shadow-xl border border-cream-200 max-w-xs hidden sm:block">
              <div className="flex items-center gap-2 text-yarn-honey mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs font-semibold text-yarn-mocha">
                "The daisy cardigan is soft, breathtaking, and arrived wrapped like a gift from heaven!"
              </p>
              <p className="text-[10px] text-stone-400 mt-1">— Clara S., London</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-clay-600">
              <Heart className="w-3.5 h-3.5 fill-clay-600" /> The Slow Craft Movement
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-yarn-mocha tracking-tight">
              In a world of mass production, we celebrate every single loop.
            </h2>

            <p className="text-sm text-stone-600 leading-relaxed">
              Every crochet piece in our studio begins with responsibly sourced natural cotton and alpaca wool yarn. Our craftswomen take hours to hand-stitch each item, creating one-of-a-kind textures that machine knitting can never replicate.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-cream-200">
                <h4 className="text-sm font-bold text-yarn-mocha mb-1">Plastic-Free</h4>
                <p className="text-xs text-stone-500">100% biodegradable yarns and packaging.</p>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-cream-200">
                <h4 className="text-sm font-bold text-yarn-mocha mb-1">Custom Stitches</h4>
                <p className="text-xs text-stone-500">Bespoke color palettes and made-to-order sizing.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/products?tag=cardigan">
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Explore Wearables & Cardigans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. In-Page AI Chat Assistant Feature Section */}
      <section className="py-12 bg-gradient-to-r from-clay-50 via-cream-100 to-clay-100 border-t border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-clay-200/80 shadow-cozy flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-clay-500 to-yarn-dustyPink text-white flex items-center justify-center text-3xl shadow-lg shrink-0">
                🧶
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-clay-100 text-clay-700 text-[11px] font-bold">
                  <Sparkles className="w-3 h-3 text-clay-600" />
                  <span>Artisanal AI Shopping Assistant</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-yarn-mocha">
                  Have questions about custom crochet creations?
                </h3>
                <p className="text-sm text-stone-600 max-w-xl">
                  Chat with our smart assistant right here on this page without opening any new tabs. Ask about materials, bespoke orders, gift suggestions, and order statuses.
                </p>
              </div>
            </div>
            <button
              onClick={openChat}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-clay-600 hover:bg-clay-700 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Open Chatbot Popup</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
