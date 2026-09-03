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
import { Plus, Trash2, Upload, Sparkles, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

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
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId || '');
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

  // Sync state when initialProduct changes
  useEffect(() => {
    setName(initialProduct?.name || '');
    setSlug(initialProduct?.slug || '');
    setDescription(initialProduct?.description || '');
    setPrice(initialProduct?.price ?? '');
    setCompareAtPrice(initialProduct?.compareAtPrice ?? '');
    setStock(initialProduct?.stock ?? 10);
    setCategoryId(initialProduct?.categoryId || '');
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

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats || []);
      if (!categoryId && cats && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    });

    tagService.getTags().then((tList) => {
      setTags(tList || []);
    });
  }, []);

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
      // Reset input value
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
    if (!name.trim() || !description.trim() || price === '' || !categoryId) {
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
      categoryId,
      tagIds: selectedTagIds,
      images: validImages,
      isFeatured,
      isActive,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Product Name *
          </label>
          <input
            type="text"
            value={name ?? ''}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Daisy Crossbody Purse"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Category *
          </label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Price (₹) *
          </label>
          <input
            type="number"
            value={price ?? ''}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1299"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Original Price (₹)
          </label>
          <input
            type="number"
            value={compareAtPrice ?? ''}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            placeholder="1599 (for discount)"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
            Stock Quantity *
          </label>
          <input
            type="number"
            value={stock ?? ''}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Tag Master Multi-Select */}
      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Select Tags (From Tag Master)
        </label>
        <p className="text-[11px] text-stone-500 mb-2">
          Click tags to assign them to this product (e.g. flower, purse, amigurumi):
        </p>
        <div className="flex flex-wrap gap-2 p-3 bg-cream-100/60 rounded-xl border border-cream-200 max-h-32 overflow-y-auto">
          {tags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            return (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
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

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-yarn-mocha uppercase tracking-wider mb-1.5">
          Description *
        </label>
        <textarea
          rows={3}
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Artisan crafting details, organic yarn type, dimensions..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
          required
        />
      </div>

      {/* Image Upload & Photo Gallery Preview */}
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
