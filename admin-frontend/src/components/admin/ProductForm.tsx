'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '../../types/product';
import { Category } from '../../types/category';
import { Tag } from '../../types/tag';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { tagService } from '../../services/tag.service';
import { uploadService } from '../../services/upload.service';
import { Button } from '../common/Button';
import {
  Plus,
  Trash2,
  Upload,
  Sparkles,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const MASTER_GROUPS = [
  'Product Type',
  'Occasion',
  'Style',
  'Recipient',
  'Special Features',
];

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [price, setPrice] = useState<number | string>(initialProduct?.price ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState<number | string>(
    initialProduct?.compareAtPrice ?? '',
  );
  const [stock, setStock] = useState<number | string>(initialProduct?.stock ?? 10);

  // Category & Subcategory State
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<string>('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

  // Artisanal Detailed Specs
  const [materials, setMaterials] = useState(initialProduct?.materials || '');
  const [dimensions, setDimensions] = useState(initialProduct?.dimensions || '');
  const [careInstructions, setCareInstructions] = useState(
    initialProduct?.careInstructions || 'Gentle hand wash in cold water, dry flat in shade',
  );
  const [craftingTime, setCraftingTime] = useState(
    initialProduct?.craftingTime || 'Handcrafted in 4-6 hours',
  );
  const [weight, setWeight] = useState(initialProduct?.weight || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialProduct?.tags?.map((t) => t.id) || [],
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialProduct?.images && initialProduct.images.length > 0
      ? initialProduct.images.map((img) => img.imageUrl)
      : [''],
  );
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured || false);
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      const all = cats || [];
      setCategories(all);

      if (initialProduct?.categoryId) {
        const matchingCat = all.find((c) => c.id === initialProduct.categoryId);
        if (matchingCat) {
          if (matchingCat.parentId) {
            setSelectedParentCategoryId(matchingCat.parentId);
            setSelectedSubcategoryId(matchingCat.id);
          } else {
            setSelectedParentCategoryId(matchingCat.id);
            setSelectedSubcategoryId('');
          }
        }
      } else {
        const root = all.find((c) => !c.parentId);
        if (root) {
          setSelectedParentCategoryId(root.id);
        }
      }
    });

    tagService.getTags().then((tList) => {
      setTags(tList || []);
    });
  }, [initialProduct]);

  useEffect(() => {
    setName(initialProduct?.name || '');
    setSlug(initialProduct?.slug || '');
    setDescription(initialProduct?.description || '');
    setPrice(initialProduct?.price ?? '');
    setCompareAtPrice(initialProduct?.compareAtPrice ?? '');
    setStock(initialProduct?.stock ?? 10);
    setMaterials(initialProduct?.materials || '');
    setDimensions(initialProduct?.dimensions || '');
    setCareInstructions(
      initialProduct?.careInstructions || 'Gentle hand wash in cold water, dry flat in shade',
    );
    setCraftingTime(initialProduct?.craftingTime || 'Handcrafted in 4-6 hours');
    setWeight(initialProduct?.weight || '');
    setSku(initialProduct?.sku || '');
    setSelectedTagIds(initialProduct?.tags?.map((t) => t.id) || []);
    setImageUrls(
      initialProduct?.images && initialProduct.images.length > 0
        ? initialProduct.images.map((img) => img.imageUrl)
        : [''],
    );
    setIsFeatured(initialProduct?.isFeatured || false);
    setIsActive(initialProduct?.isActive ?? true);
    setError(null);
    setUploadSuccessMessage(null);
  }, [initialProduct]);

  const parentCategories = categories.filter((c) => !c.parentId);
  const currentSubcategories = categories.filter((c) => c.parentId === selectedParentCategoryId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);
    setUploadSuccessMessage(null);

    try {
      const uploaded = await uploadService.uploadMultiple(files);
      const newUrls = (uploaded || [])
        .map((item: any) => item?.url || item?.imageUrl || (typeof item === 'string' ? item : ''))
        .filter((url: string) => typeof url === 'string' && url.trim().length > 0);

      const filteredExisting = imageUrls.filter(
        (url) => typeof url === 'string' && url.trim().length > 0,
      );

      const combined = [...filteredExisting, ...newUrls];
      setImageUrls(combined.length > 0 ? combined : ['']);
      setUploadSuccessMessage(`Successfully uploaded ${newUrls.length} photo(s)!`);
    } catch (err: any) {
      setError(
        err.message || 'Image upload failed. You can also paste image URLs directly in the inputs.',
      );
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value || '';
    setImageUrls(updated);
  };

  const handleRemoveImageUrl = (index: number) => {
    const updated = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updated.length > 0 ? updated : ['']);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategoryId = selectedSubcategoryId || selectedParentCategoryId;

    if (!name.trim() || !description.trim() || price === '' || !finalCategoryId) {
      setError('Please fill in all required fields (Name, Description, Price, Category)');
      return;
    }

    setIsLoading(true);
    setError(null);

    const validImages = (imageUrls || [])
      .filter((url) => typeof url === 'string' && url.trim().length > 0)
      .map((url, idx) => ({ imageUrl: url.trim(), displayOrder: idx }));

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      price: Number(price),
      compareAtPrice: compareAtPrice !== '' ? Number(compareAtPrice) : undefined,
      stock: Number(stock || 0),
      categoryId: finalCategoryId,
      tagIds: selectedTagIds,
      images: validImages,
      isFeatured,
      isActive,
      materials: materials.trim() || undefined,
      dimensions: dimensions.trim() || undefined,
      careInstructions: careInstructions.trim() || undefined,
      craftingTime: craftingTime.trim() || undefined,
      weight: weight.trim() || undefined,
      sku: sku.trim() || undefined,
    };

    try {
      if (initialProduct) {
        await productService.updateProduct(initialProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  // Group tags by Master Tag Group
  const tagsByGroup = MASTER_GROUPS.reduce((acc, grp) => {
    acc[grp] = tags.filter((t) => (t.group || 'Product Type') === grp);
    return acc;
  }, {} as Record<string, Tag[]>);

  const otherTags = tags.filter((t) => !MASTER_GROUPS.includes(t.group || ''));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-1">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* 1. Basic Information */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-clay-700 pb-1 border-b border-cream-200 flex items-center gap-1.5">
          <span>1.</span> Basic Product Information
        </h4>

        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Product Title *
          </label>
          <input
            type="text"
            value={name ?? ''}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daisy Crossbody Granny Square Purse"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            required
          />
        </div>

        {/* Category & Subcategory Dynamic Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream-50/70 p-4 rounded-2xl border border-cream-200">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              📁 Primary Category *
            </label>
            <select
              value={selectedParentCategoryId}
              onChange={(e) => {
                setSelectedParentCategoryId(e.target.value);
                setSelectedSubcategoryId('');
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
              required
            >
              <option value="">Select Category</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              🏷️ Subcategory (Optional)
            </label>
            <select
              value={selectedSubcategoryId}
              onChange={(e) => setSelectedSubcategoryId(e.target.value)}
              disabled={!selectedParentCategoryId || currentSubcategories.length === 0}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none disabled:opacity-50 disabled:bg-stone-100"
            >
              <option value="">
                {currentSubcategories.length === 0
                  ? 'No subcategories available'
                  : 'All in this category (or pick subcategory)'}
              </option>
              {currentSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  └─ {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Artisanal Story & Description *
          </label>
          <textarea
            rows={3}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Artisan crafting story, stitch details, organic yarn inspiration..."
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* 2. Pricing & Stock Inventory */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-clay-700 pb-1 border-b border-cream-200 flex items-center gap-1.5">
          <span>2.</span> Pricing & Stock Inventory
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Selling Price (₹) *
            </label>
            <input
              type="number"
              value={price ?? ''}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1299"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none font-bold text-clay-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Original Price (₹) (Discount)
            </label>
            <input
              type="number"
              value={compareAtPrice ?? ''}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="1599"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              Available Stock Quantity *
            </label>
            <div className="relative">
              <input
                type="number"
                value={stock ?? ''}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none font-bold"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400 font-semibold">
                Units
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Artisanal Specifications & Crafting Details */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-clay-700 pb-1 border-b border-cream-200 flex items-center gap-1.5">
          <span>3.</span> Artisanal Specifications & Crafting Details
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              🧶 Yarn & Materials
            </label>
            <input
              type="text"
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="e.g. 100% Organic Milk Cotton, Brass Hardware"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              📏 Dimensions / Size
            </label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 25cm (H) x 20cm (W), Strap: 100cm"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              ⏱️ Crafting Time
            </label>
            <input
              type="text"
              value={craftingTime}
              onChange={(e) => setCraftingTime(e.target.value)}
              placeholder="e.g. Hand-knitted in 4-6 hours"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
              ⚖️ Weight / SKU
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 250g"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
              />
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. CR-001"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            🧼 Care Instructions
          </label>
          <input
            type="text"
            value={careInstructions}
            onChange={(e) => setCareInstructions(e.target.value)}
            placeholder="e.g. Gentle hand wash in cold water, dry flat in shade, do not bleach"
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 4. Tag Master 5 Dimension Categorized Selector */}
      <div className="space-y-3 bg-cream-50/70 p-4 rounded-2xl border border-cream-200">
        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider">
            🏷️ Tag Master Taxonomy (5 Dimensions)
          </label>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Select matching tags across Product Type, Occasion, Style, Recipient, and Features:
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {MASTER_GROUPS.map((groupName) => {
            const groupTags = tagsByGroup[groupName] || [];
            if (groupTags.length === 0) return null;

            return (
              <div key={groupName} className="space-y-1.5">
                <span className="text-[11px] font-bold text-clay-700 uppercase tracking-wider">
                  {groupName}:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {groupTags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-clay-600 text-white shadow-xs scale-105'
                            : 'bg-white text-stone-700 hover:bg-cream-200 border border-cream-300'
                        }`}
                      >
                        <span>{tag.icon || '🏷️'}</span>
                        <span>{tag.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Image Upload & Photo Gallery Preview */}
      <div className="space-y-3 bg-cream-50/70 p-4 rounded-2xl border border-cream-200">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold text-yarn-mocha uppercase tracking-wider">
              Product Photos & Gallery
            </label>
            <p className="text-[11px] text-stone-500">Upload photos directly or enter image URLs:</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-white bg-clay-600 hover:bg-clay-700 px-3.5 py-2 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer transition-colors shadow-xs">
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{isUploading ? 'Uploading...' : 'Upload Photos'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-xs text-clay-700 hover:text-clay-900 px-3 py-2 bg-white border border-cream-300 rounded-xl flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Add URL
            </button>
          </div>
        </div>

        {uploadSuccessMessage && (
          <p className="text-xs text-sage-700 font-bold flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> {uploadSuccessMessage}
          </p>
        )}

        {/* Live Visual Previews of Uploaded Images */}
        {imageUrls.filter((url) => typeof url === 'string' && url.trim().length > 0).length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2">
            {imageUrls
              .filter((url) => typeof url === 'string' && url.trim().length > 0)
              .map((url, idx) => (
                <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-clay-300 shadow-xs bg-white">
                  <img
                    src={url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(imageUrls.indexOf(url))}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-clay-700/90 text-white text-[9px] font-bold text-center py-0.5">
                      Primary
                    </span>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* URL Inputs */}
        <div className="space-y-2 pt-1">
          {imageUrls.map((url, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="url"
                value={url ?? ''}
                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                placeholder="https://images.unsplash.com/... or uploaded photo link"
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImageUrl(idx)}
                  className="p-2 text-stone-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visibility Checkboxes */}
      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-yarn-mocha cursor-pointer">
          <input
            type="checkbox"
            checked={!!isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded text-clay-600 focus:ring-clay-500"
          />
          <span>⭐ Highlight as Featured</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold text-yarn-mocha cursor-pointer">
          <input
            type="checkbox"
            checked={!!isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded text-clay-600 focus:ring-clay-500"
          />
          <span>Active in Store</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialProduct ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};
