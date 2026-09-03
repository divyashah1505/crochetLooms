'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { tagService } from '../../services/tag.service';
import { ProductGrid } from '../../components/customer/ProductGrid';
import { TagNav } from '../../components/common/TagNav';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Tag } from '../../types/tag';
import { Filter, X, ArrowUpDown, Search, Sparkles, FolderTree, ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const currentCategory = searchParams.get('category') || '';
  const currentTag = searchParams.get('tag') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = (searchParams.get('sort') as any) || 'newest';
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedTag, setSelectedTag] = useState(currentTag);
  const [sortOption, setSortOption] = useState(currentSort);
  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    categoryService.getCategories().then((cats) => setCategories(cats || []));
    tagService.getTags().then((tList) => setTags(tList || []));
  }, []);

  useEffect(() => {
    setSelectedCategory(currentCategory);
    setSelectedTag(currentTag);
    setSearchInput(currentSearch);
    setSortOption(currentSort);

    setIsLoading(true);
    productService
      .getProducts({
        category: currentCategory || undefined,
        tag: currentTag || undefined,
        search: currentSearch || undefined,
        sort: currentSort,
        limit: 24,
      })
      .then((res) => {
        setProducts(res.items || []);
        setTotal(res.meta?.total || 0);
      })
      .catch((err) => console.error('Failed to fetch products:', err))
      .finally(() => setIsLoading(false));
  }, [currentCategory, currentTag, currentSearch, currentSort]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setSearchInput('');
    setSortOption('newest');
    router.push('/products');
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentTag || currentSearch || currentSort !== 'newest',
  );

  // Find active category object (could be parent or subcategory)
  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);
  const parentCategoryObj = activeCategoryObj?.parentId
    ? categories.find((c) => c.id === activeCategoryObj.parentId)
    : activeCategoryObj;

  const relevantSubcategories = parentCategoryObj
    ? categories.filter((c) => c.parentId === parentCategoryObj.id)
    : [];

  const parentCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="min-h-screen pb-20">
      {/* Top Banner */}
      <div className="bg-cream-100/80 border-b border-cream-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-yarn-mocha tracking-tight">
            {parentCategoryObj ? parentCategoryObj.name : 'Handmade Crochet Creations'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            {parentCategoryObj?.description ||
              'Browse our entire catalogue of hand-crocheted masterpieces. Filter by category, subcategory, or Tag Master aesthetic.'}
          </p>
        </div>
      </div>

      {/* Subcategory Pill Bar (When browsing a Parent Category or viewing Subcategories) */}
      {relevantSubcategories.length > 0 && (
        <div className="bg-white border-b border-cream-200 py-3 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-yarn-mocha uppercase tracking-wider flex-shrink-0 mr-1">
              Subcategories:
            </span>
            <button
              onClick={() => updateFilters({ category: parentCategoryObj?.slug || null })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                currentCategory === parentCategoryObj?.slug
                  ? 'bg-clay-600 text-white shadow-xs'
                  : 'bg-cream-100 text-stone-700 hover:bg-cream-200'
              }`}
            >
              All {parentCategoryObj?.name}
            </button>
            {relevantSubcategories.map((sub) => {
              const isSelected = currentCategory === sub.slug;
              return (
                <button
                  key={sub.id}
                  onClick={() => updateFilters({ category: sub.slug })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all ${
                    isSelected
                      ? 'bg-clay-600 text-white shadow-xs'
                      : 'bg-cream-100 text-stone-700 hover:bg-cream-200'
                  }`}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tag Navigation Bar for Instant Filtering */}
      <TagNav
        selectedTag={currentTag}
        onSelectTag={(slug) => updateFilters({ tag: slug })}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                <h3 className="text-sm font-bold text-yarn-mocha flex items-center gap-2">
                  <Filter className="w-4 h-4 text-clay-600" /> Categories
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] font-semibold text-clay-600 hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Hierarchical Categories & Subcategories */}
              <div className="space-y-3">
                <button
                  onClick={() => updateFilters({ category: null })}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    !currentCategory
                      ? 'bg-clay-600 text-white shadow-xs'
                      : 'text-stone-700 hover:bg-cream-100'
                  }`}
                >
                  ✨ All Collections
                </button>

                <div className="space-y-2 pt-1">
                  {parentCategories.map((parent) => {
                    const subcats = categories.filter((c) => c.parentId === parent.id);
                    const isParentSelected =
                      currentCategory === parent.slug ||
                      subcats.some((s) => s.slug === currentCategory);

                    return (
                      <div key={parent.id} className="space-y-1">
                        <button
                          onClick={() => updateFilters({ category: parent.slug })}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                            currentCategory === parent.slug
                              ? 'bg-clay-50 text-clay-700 font-extrabold'
                              : 'text-stone-800 hover:bg-cream-100'
                          }`}
                        >
                          <span>📁 {parent.name}</span>
                          <span className="text-[10px] text-stone-400">({subcats.length})</span>
                        </button>

                        {/* Nested Subcategories List */}
                        {subcats.length > 0 && (
                          <div className="pl-4 space-y-0.5 border-l-2 border-cream-200 ml-3">
                            {subcats.map((sub) => {
                              const isSubSelected = currentCategory === sub.slug;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => updateFilters({ category: sub.slug })}
                                  className={`w-full text-left px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                    isSubSelected
                                      ? 'bg-clay-600 text-white font-bold'
                                      : 'text-stone-600 hover:text-clay-600 hover:bg-cream-50'
                                  }`}
                                >
                                  └─ {sub.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tag Master Filter */}
              <div className="pt-4 border-t border-cream-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yarn-mocha mb-2.5">
                  Filter by Tag
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const isSelected = currentTag === tag.slug;
                    return (
                      <button
                        key={tag.id}
                        onClick={() => updateFilters({ tag: isSelected ? null : tag.slug })}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                          isSelected
                            ? 'bg-clay-600 text-white shadow-xs'
                            : 'bg-cream-100 text-stone-700 hover:bg-cream-200'
                        }`}
                      >
                        {tag.icon || '🏷️'} {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Listing Main Area */}
          <main className="flex-1 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-cream-200 shadow-xs">
              <div className="text-xs text-stone-600">
                Showing <strong className="text-yarn-mocha">{total}</strong> handcrafted pieces
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 hidden sm:inline">Sort:</span>
                  <select
                    value={currentSort}
                    onChange={(e) => updateFilters({ sort: e.target.value })}
                    className="text-xs font-semibold text-yarn-mocha bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-clay-500"
                  >
                    <option value="newest">✨ Newest Arrivals</option>
                    <option value="featured">⭐ Featured First</option>
                    <option value="price_asc">💰 Price: Low to High</option>
                    <option value="price_desc">💎 Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filter Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-400">Active filters:</span>
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-clay-100 text-clay-800 border border-clay-300">
                    Category: {activeCategoryObj?.name || currentCategory}
                    <button onClick={() => updateFilters({ category: null })} className="hover:text-red-500 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {currentTag && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    Tag: {currentTag}
                    <button onClick={() => updateFilters({ tag: null })} className="hover:text-red-500 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {currentSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cream-200 text-yarn-mocha border border-cream-300">
                    Search: "{currentSearch}"
                    <button onClick={() => updateFilters({ search: null })} className="hover:text-red-500 ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-clay-600 hover:underline font-semibold"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid */}
            <ProductGrid products={products} isLoading={isLoading} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
