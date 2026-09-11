'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/auth.store';
import { addressService } from '../../services/address.service';
import { authService } from '../../services/auth.service';
import { Address } from '../../types/user';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { User, MapPin, Plus, Trash2, CheckCircle, ShieldCheck, Phone, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { customer, customerToken, isInitialized, initAuth, logoutCustomer, updateCustomerData } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Profile modal & form state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    const token = customerToken || (typeof window !== 'undefined' ? localStorage.getItem('crochet_customer_token') : null);
    if (!token) {
      if (!isInitialized) {
        initAuth();
        return;
      }
      router.push('/login?redirect=/profile');
      return;
    }
    loadAddresses();
  }, [customerToken, isInitialized, initAuth, router]);

  const loadAddresses = async () => {
    try {
      const list = await addressService.getAddresses();
      setAddresses(list);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await addressService.addAddress({
        fullName,
        phone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city,
        state,
        postalCode,
        isDefault: addresses.length === 0,
      });
      await loadAddresses();
      setIsModalOpen(false);
      setFullName('');
      setPhone('');
      setAddressLine1('');
      setAddressLine2('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await addressService.deleteAddress(id);
      loadAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    await addressService.setDefaultAddress(id);
    loadAddresses();
  };

  const handleOpenEditProfile = () => {
    setEditName(customer?.name || '');
    setEditPhone(customer?.phone || '');
    setProfileMsg(null);
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMsg(null);

    const cleanPhone = editPhone.replace(/\D/g, '');
    if (editPhone.trim() && cleanPhone.length < 10) {
      setProfileMsg({ type: 'error', text: 'Please enter a valid 10-digit mobile phone number.' });
      setIsUpdatingProfile(false);
      return;
    }

    try {
      const res = await authService.updateCustomerProfile({
        name: editName.trim() || undefined,
        phone: editPhone.trim() || undefined,
      });
      updateCustomerData(res.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditProfileOpen(false);
      }, 900);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="min-h-screen py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-cream-200 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
            Account & Profile
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Manage your personal details and saved delivery addresses.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={logoutCustomer}>
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Customer Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4 text-center">
            {customer?.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.name}
                className="w-20 h-20 rounded-full mx-auto border-2 border-clay-300 object-cover shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-clay-100 text-clay-700 font-bold flex items-center justify-center text-2xl mx-auto border-2 border-clay-300 shadow-sm">
                {customer?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-yarn-mocha">{customer?.name}</h3>
              <p className="text-xs text-stone-500">{customer?.email}</p>
              {customer?.phone ? (
                <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600 mt-1">
                  <Phone className="w-3.5 h-3.5 text-clay-600" />
                  <span>{customer.phone}</span>
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block mt-1">
                  ⚠️ No contact number added
                </p>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenEditProfile}
              className="w-full text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile & Contact
            </Button>

            <div className="pt-3 border-t border-cream-100 text-left text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sage-600" />
                <span>Verified Customer Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address Book */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-yarn-mocha flex items-center gap-2">
              <MapPin className="w-5 h-5 text-clay-600" /> Saved Delivery Addresses
            </h2>
            <Button size="sm" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Address
            </Button>
          </div>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-5 bg-white rounded-2xl border border-cream-200 shadow-xs flex justify-between items-start gap-4"
              >
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yarn-mocha text-sm">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-clay-100 text-clay-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600">
                    {addr.addressLine1}
                    {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                  </p>
                  <p className="text-stone-600">
                    {addr.city}, {addr.state} - {addr.postalCode}
                  </p>
                  <p className="text-stone-500 font-medium">Phone: {addr.phone}</p>
                </div>

                <div className="flex items-center gap-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs font-semibold text-clay-600 hover:underline"
                    >
                      Make Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-stone-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Emma Watson"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Address Line 1 *</label>
            <input
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House/Flat No., Building, Street"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Address Line 2</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Area, Landmark"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">State *</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">PIN Code *</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="400050"
                className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Profile & Contact Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile & Contact Details"
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileMsg && (
            <div
              className={`p-3 text-xs rounded-2xl font-medium ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Full Name *</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Emma Watson"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Email (Account ID)</label>
            <input
              type="email"
              value={customer?.email || ''}
              disabled
              className="w-full px-3 py-2 text-xs bg-cream-100 text-stone-500 border border-cream-200 rounded-xl cursor-not-allowed"
            />
            <p className="text-[10px] text-stone-400 mt-1">Email is linked to your account authentication and cannot be changed.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">
              Contact / WhatsApp Phone Number *
            </label>
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="+91 9876543210 (10 digits)"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
              required
            />
            <p className="text-[10px] text-stone-400 mt-1">Used for order confirmation messages and delivery coordination.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button type="button" variant="secondary" onClick={() => setIsEditProfileOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdatingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
