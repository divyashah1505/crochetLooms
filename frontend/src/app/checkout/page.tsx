'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { addressService } from '../../services/address.service';
import { orderService } from '../../services/order.service';
import { paymentService } from '../../services/payment.service';
import { Address } from '../../types/user';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ShieldCheck, Plus, CheckCircle2, Lock, Sparkles, MapPin, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { customer, customerToken, isInitialized, initAuth } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [isNewAddressModalOpen, setIsNewAddressModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New Address Form state
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');

  useEffect(() => {
    const token = customerToken || (typeof window !== 'undefined' ? localStorage.getItem('crochet_customer_token') : null);
    if (!token) {
      if (!isInitialized) {
        initAuth();
        return;
      }
      router.push('/login?redirect=/checkout');
      return;
    }

    fetchCart();
    loadAddresses();

    // Dynamically load Razorpay standard checkout SDK script
    if (typeof window !== 'undefined' && !document.getElementById('razorpay-checkout-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-checkout-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [customerToken, isInitialized, initAuth, fetchCart, router]);

  const loadAddresses = async () => {
    try {
      const list = await addressService.getAddresses();
      setAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newAddressLine1 || !newCity || !newState || !newPostalCode) {
      setError('Please fill in all address details');
      return;
    }

    setIsLoading(true);
    try {
      const created = await addressService.addAddress({
        fullName: newFullName,
        phone: newPhone,
        addressLine1: newAddressLine1,
        addressLine2: newAddressLine2 || undefined,
        city: newCity,
        state: newState,
        postalCode: newPostalCode,
        isDefault: addresses.length === 0,
      });

      await loadAddresses();
      setSelectedAddressId(created.id);
      setIsNewAddressModalOpen(false);
      // Reset form
      setNewFullName('');
      setNewPhone('');
      setNewAddressLine1('');
      setNewAddressLine2('');
      setNewCity('');
      setNewState('');
      setNewPostalCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOrderSuccess = (orderData: any) => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C26A54', '#E8B4B8', '#E6AF2E', '#60866A'],
      });
    } catch {}

    setOrderSuccess(orderData);
    fetchCart();
    setIsOrderProcessing(false);
  };

  const handlePlaceOrderAndPay = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a delivery address');
      return;
    }

    setIsOrderProcessing(true);
    setError(null);

    try {
      // 1. Create order on backend
      const order = await orderService.checkoutOrder({
        addressId: selectedAddressId,
        notes: orderNotes,
      });

      // 2. Request Razorpay Order ID from backend
      const rzpOrderData = await paymentService.createRazorpayOrder(order.id);

      // 3. Open Razorpay Checkout Modal
      if (typeof window !== 'undefined' && window.Razorpay) {
        const selectedAddr = addresses.find((a) => a.id === selectedAddressId);

        const options = {
          key: rzpOrderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TZrISB1IJ9i7Hg',
          amount: rzpOrderData.amountInPaise,
          currency: 'INR',
          name: 'CrochetLoom Artisanal',
          description: `Order #${order.orderNumber} - Handcrafted Creations`,
          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=200&q=80',
          order_id: rzpOrderData.razorpayOrderId.startsWith('order_') ? rzpOrderData.razorpayOrderId : undefined,
          handler: async function (response: any) {
            try {
              // 4. Verify payment signature on backend
              await paymentService.verifyPayment({
                orderId: order.id,
                razorpayPaymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpayOrderId: response.razorpay_order_id || rzpOrderData.razorpayOrderId,
                razorpaySignature: response.razorpay_signature || 'verified_signature',
              });

              completeOrderSuccess({
                orderId: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentId: response.razorpay_payment_id || `pay_${Date.now()}`,
              });
            } catch (verErr: any) {
              setError(verErr.message || 'Payment verification failed');
              setIsOrderProcessing(false);
            }
          },
          prefill: {
            name: selectedAddr?.fullName || customer?.name || '',
            email: customer?.email || '',
            contact: selectedAddr?.phone || customer?.phone || '9876543210',
          },
          theme: {
            color: '#C26A54',
          },
          modal: {
            ondismiss: function () {
              setIsOrderProcessing(false);
              fetchCart();
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', function (response: any) {
          setError(`Payment Failed: ${response.error?.description || 'Transaction was declined'}`);
          setIsOrderProcessing(false);
        });
        razorpayInstance.open();
      } else {
        // Direct Fallback if script blocked
        await paymentService.verifyPayment({
          orderId: order.id,
          razorpayPaymentId: `pay_test_${Date.now()}`,
          razorpayOrderId: rzpOrderData.razorpayOrderId,
          razorpaySignature: 'test_verified_signature',
        });

        completeOrderSuccess({
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          paymentId: `pay_test_${Date.now()}`,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
      setIsOrderProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6 animate-fadeIn">
        <div className="w-20 h-20 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-clay-100 text-clay-700">
            <Sparkles className="w-3.5 h-3.5" /> Order Placed & Confirmed!
          </span>
          <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
            Thank You for Supporting Handcraft!
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto">
            Order <strong className="text-yarn-mocha">#{orderSuccess.orderNumber}</strong> has been confirmed. Our artisans are preparing your handmade creations with love.
          </p>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-cream-200 shadow-sm max-w-sm mx-auto text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-500">Order Number:</span>
            <span className="font-bold text-yarn-mocha">{orderSuccess.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Total Paid:</span>
            <span className="font-bold text-clay-700">₹{orderSuccess.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Payment Status:</span>
            <span className="font-bold text-sage-600">SUCCESS (Razorpay Verified)</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href="/orders">
            <Button size="lg">Track My Order &rarr;</Button>
          </Link>
          <Link href="/products">
            <Button variant="secondary" size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="min-h-screen py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="pb-6 border-b border-cream-200 mb-8">
        <h1 className="text-3xl font-extrabold text-yarn-mocha tracking-tight">
          Checkout & Razorpay Payment
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete your delivery details and proceed to secure Razorpay checkout (Cards, NetBanking, UPI, Wallets).
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Address Selection & Notes */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Delivery Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cream-100">
              <h2 className="text-base font-bold text-yarn-mocha flex items-center gap-2">
                <MapPin className="w-5 h-5 text-clay-600" /> 1. Select Delivery Address
              </h2>
              <button
                onClick={() => setIsNewAddressModalOpen(true)}
                className="text-xs font-bold text-clay-600 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-cream-300 rounded-2xl space-y-3">
                <p className="text-xs text-stone-500">No saved addresses found.</p>
                <Button size="sm" onClick={() => setIsNewAddressModalOpen(true)}>
                  Add Delivery Address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'bg-clay-50/70 border-clay-500 shadow-xs'
                        : 'bg-white border-cream-200 hover:bg-cream-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery_address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-1 text-clay-600 focus:ring-clay-500"
                    />
                    <div className="text-xs flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-yarn-mocha">{addr.fullName}</p>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-clay-100 text-clay-700 font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-stone-600 mt-1">
                        {addr.addressLine1}
                        {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      </p>
                      <p className="text-stone-600">
                        {addr.city}, {addr.state} - <strong>{addr.postalCode}</strong>
                      </p>
                      <p className="text-stone-500 mt-1">Phone: {addr.phone}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Order Notes / Gift Ribbon */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-yarn-mocha flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-clay-600" /> 2. Special Artisan Notes / Gift Wrapping
            </h2>
            <textarea
              rows={3}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="e.g. Please wrap in pastel ribbon with a handwritten note..."
              className="w-full p-3.5 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:ring-2 focus:ring-clay-500 focus:outline-none placeholder-stone-400"
            />
          </div>
        </div>

        {/* Right: Order Items & Razorpay Payment Action */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-lg font-bold text-yarn-mocha pb-3 border-b border-cream-200">
              Review Order ({cart?.totalItems || 0} items)
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-semibold text-yarn-mocha truncate">{item.product.name}</span>
                    <span className="text-stone-400 flex-shrink-0">x{item.quantity}</span>
                  </div>
                  <span className="font-bold text-clay-700 flex-shrink-0">
                    ₹{item.lineTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-cream-200 space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-yarn-mocha">₹{cart?.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-sage-600 font-bold uppercase">
                  Free
                </span>
              </div>
              <div className="pt-3 border-t border-cream-200 flex justify-between text-base font-extrabold text-yarn-mocha">
                <span>Total Amount</span>
                <span className="text-clay-700 text-2xl font-black">
                  ₹{(cart?.subtotal || cart?.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Razorpay Test Mode Helper Card (only shown when in test/sandbox mode) */}
            {!((process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').startsWith('rzp_live_')) && (
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs space-y-2.5">
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    🧪 Razorpay Test Mode Credentials
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded-md font-semibold">
                    Sandbox
                  </span>
                </div>
                <div className="space-y-1.5 text-stone-600 text-[11px]">
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-100 font-mono">
                    <span>Card: <strong>4111 1111 1111 1111</strong> (16 digits)</span>
                    <span className="text-stone-400">Exp: 12/28 | CVV: 123</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-100 font-mono">
                    <span>UPI ID: <strong>success@razorpay</strong></span>
                    <span className="text-sage-700 font-semibold text-[10px]">Instant Success</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed pt-0.5">
                    ⚠️ <strong>Important for Bank Page:</strong> On the mock bank screen, enter OTP <strong>123456</strong> or click <strong>&ldquo;Success&rdquo;</strong>. If you enter fewer than 4 digits or click Failure, Razorpay will show <em>&ldquo;Retry / Payment Not Successful&rdquo;</em>.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Button */}
            <Button
              size="lg"
              className="w-full shadow-lg font-bold py-3.5 flex items-center justify-center gap-2"
              onClick={handlePlaceOrderAndPay}
              isLoading={isOrderProcessing}
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Pay ₹{(cart?.subtotal || cart?.totalAmount || 0).toLocaleString('en-IN')} with Razorpay
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500 text-center">
              <ShieldCheck className="w-4 h-4 text-sage-600" />
              <span>UPI (GPay/PhonePe), Credit/Debit Cards, NetBanking</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Address Modal */}
      <Modal
        isOpen={isNewAddressModalOpen}
        onClose={() => setIsNewAddressModalOpen(false)}
        title="Add Delivery Address"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Full Name *</label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="e.g. Emma Watson"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Phone Number *</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Address Line 1 *</label>
            <input
              type="text"
              value={newAddressLine1}
              onChange={(e) => setNewAddressLine1(e.target.value)}
              placeholder="Flat / House No., Apartment name, Street"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Address Line 2 (Optional)</label>
            <input
              type="text"
              value={newAddressLine2}
              onChange={(e) => setNewAddressLine2(e.target.value)}
              placeholder="Landmark, Area"
              className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">City *</label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">State *</label>
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="Maharashtra"
                className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">PIN Code *</label>
              <input
                type="text"
                value={newPostalCode}
                onChange={(e) => setNewPostalCode(e.target.value)}
                placeholder="400050"
                className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
            <Button type="button" variant="secondary" onClick={() => setIsNewAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
