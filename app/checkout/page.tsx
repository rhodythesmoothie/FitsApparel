'use client';

import { Button } from '@heroui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/modal';
import { useEffect, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { computeShippingFee } from '@/lib/shipping';
import type { Order } from '@/types';

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  country: string;
};

type PaymentMethod = 'gcash' | 'cod' | 'card';

type PaymentInfo = {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

const PAYMENT_METHODS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: 'gcash',
    label: 'GCash',
    description: 'Send payment to 09395221808',
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your parcel arrives',
  },
  {
    value: 'card',
    label: 'Card',
    description: 'Visa, Mastercard, debit, or credit card',
  },
];

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCart();
  const { user, role } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [orderSubtotal, setOrderSubtotal] = useState(0);
  const [orderShippingCost, setOrderShippingCost] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isGcashQrOpen, setIsGcashQrOpen] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    country: 'Philippines',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (role === 'admin') {
      router.replace('/admin');
    }
  }, [role, router]);

  useEffect(() => {
    if (user?.email) {
      setShippingAddress((prev) => ({
        ...prev,
        email: prev.email || user.email || '',
      }));
    }
  }, [user?.email]);

  const totalPrice = getTotalPrice();
  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );
  const shippingQuote = useMemo(
    () => computeShippingFee(shippingAddress.city, shippingAddress.province, totalQuantity),
    [shippingAddress.city, shippingAddress.province, totalQuantity],
  );
  const hasShippingDestination = Boolean(
    shippingAddress.city.trim() && shippingAddress.province.trim(),
  );
  const shippingCost = shippingQuote.fee;
  const displayedShippingCost = hasShippingDestination ? shippingCost : 0;
  const finalTotal = totalPrice + displayedShippingCost;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl py-16 text-center md:py-24">
        <p className="text-black/70">Loading...</p>
      </div>
    );
  }

  if (role === 'admin') {
    return null;
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="mx-auto max-w-4xl py-16 md:py-24">
        <div className="rounded-2xl border border-black/10 bg-white p-8">
          <h1 className="text-3xl font-semibold text-black">Checkout</h1>
          <p className="mt-6 text-lg text-black/70">Your cart is empty.</p>
          <NextLink
            className="mt-8 inline-block border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
            href="/shop"
          >
            CONTINUE SHOPPING
          </NextLink>
        </div>
      </div>
    );
  }

  const validateShippingAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!shippingAddress.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) newErrors.email = 'Invalid email format';
    if (!shippingAddress.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{11}$/.test(shippingAddress.phone)) newErrors.phone = 'Phone number must be exactly 11 digits';
    if (!shippingAddress.address.trim()) newErrors.address = 'Address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.province.trim()) newErrors.province = 'Province is required';
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'Zip code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePaymentInfo = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    } else if (paymentMethod === 'card') {
      if (!paymentInfo.cardName.trim()) {
        newErrors.cardName = 'Cardholder name is required';
      }
      if (!paymentInfo.cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Card number must be 16 digits';
      }
      if (!paymentInfo.expiryDate.trim()) {
        newErrors.expiryDate = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        newErrors.expiryDate = 'Format should be MM/YY';
      }
      if (!paymentInfo.cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
        newErrors.cvv = 'CVV must be 3-4 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingAddress()) {
      setErrors({});
      setStep('payment');
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);

    if (method === 'gcash') {
      setIsGcashQrOpen(true);
    }
  };

  const handlePhoneChange = (value: string) => {
    setShippingAddress({
      ...shippingAddress,
      phone: value.replace(/\D/g, '').slice(0, 11),
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePaymentInfo()) return;
    if (!paymentMethod) return;

    setErrors({});
    setError(null);
    setLoading(true);

    try {
      if (!db) {
        throw new Error('Firebase is not configured. Add your Firebase values to .env.local before placing orders.');
      }

      // Create order object
      const orderNum = `FIT-${Date.now()}`;
      const order: Omit<Order, 'orderId'> = {
        userId: user?.uid || '',
        userEmail: user?.email || shippingAddress.email,
        items: items.map(item => ({
          slug: item.slug,
          name: item.name,
          price: Number.parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0,
          size: item.size,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          street: shippingAddress.address,
          city: shippingAddress.city,
          province: shippingAddress.province,
          postalCode: shippingAddress.zipCode,
        },
        paymentMethod,
        packaging: shippingQuote.packaging,
        shippingZone: shippingQuote.zone,
        shippingCost,
        subtotal: totalPrice,
        total: finalTotal,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save order to Firestore
      const ordersCollection = collection(db, 'orders');
      await addDoc(ordersCollection, {
        ...order,
        orderId: orderNum,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setOrderNumber(orderNum);
      setOrderSubtotal(totalPrice);
      setOrderShippingCost(shippingCost);
      setOrderTotal(finalTotal);
      clearCart();
      setStep('confirmation');
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCart = () => {
    router.push('/cart');
  };

  if (step === 'confirmation') {
    if (error) {
      return (
        <div className="mx-auto max-w-4xl py-16 md:py-24">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>

            <h1 className="text-3xl font-semibold text-red-900">Order Failed</h1>
            <p className="mt-4 text-lg text-red-800">{error}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button className="inline-block border border-red-600 px-6 py-3 text-sm font-medium tracking-[0.2em] text-red-600 transition-colors hover:bg-red-600 hover:text-white" onClick={() => { setError(null); setStep('payment'); }}>
                BACK TO PAYMENT
              </button>
              <NextLink className="inline-block border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white" href="/shop">
                CONTINUE SHOPPING
              </NextLink>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-4xl py-16 md:py-24">
        <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold text-black">Order Confirmed!</h1>
          <p className="mt-4 text-lg text-black/70">Thank you for your purchase. Your order is pending admin approval.</p>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900"><strong>Order Status:</strong> Your order is being reviewed by our admin team. You will receive an email notification once it's approved.</p>
          </div>

          <div className="mt-8 rounded-lg border border-black/10 bg-black/5 p-6">
            <p className="text-sm text-black/70">Order Number</p>
            <p className="mt-2 font-mono text-2xl font-semibold text-black">{orderNumber}</p>
          </div>

          <div className="mt-8 space-y-3 text-left">
            <p className="text-sm font-medium text-black/70">
              <strong className="text-black">Shipping to:</strong>
            </p>
            <p className="text-black">
              {shippingAddress.fullName}
              <br />
              {shippingAddress.address}
              <br />
              {shippingAddress.city}, {shippingAddress.province} {shippingAddress.zipCode}
              <br />
              {shippingAddress.country}
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-black/10 bg-black/5 p-6 text-left">
            <p className="flex justify-between text-black">
              <span>Subtotal:</span>
              <span>₱{orderSubtotal.toFixed(2)}</span>
            </p>
            <p className="mt-2 flex justify-between text-black">
              <span>Shipping:</span>
              <span>₱{orderShippingCost.toFixed(2)}</span>
            </p>
            <p className="mt-2 flex justify-between text-black">
              <span>Payment Method:</span>
              <span className="capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod ? paymentMethod.toUpperCase() : ''}</span>
            </p>
            <p className="mt-4 border-t border-black/10 pt-4 flex justify-between text-lg font-semibold text-black">
              <span>Total:</span>
              <span>₱{orderTotal.toFixed(2)}</span>
            </p>
          </div>

          {paymentMethod === 'gcash' && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
              <p className="text-sm font-semibold text-blue-900">GCash Payment</p>
              <p className="mt-1 text-sm text-blue-900">Send payment to <strong>09395221808</strong>.</p>
            </div>
          )}

          <p className="mt-8 text-sm text-black/70">
            A confirmation email has been sent to <strong>{shippingAddress.email}</strong>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <NextLink className="inline-block border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white" href="/shop">
              CONTINUE SHOPPING
            </NextLink>
            <NextLink className="inline-block border border-black px-6 py-3 text-sm font-medium tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white" href="/profile">
              VIEW ORDERS
            </NextLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="mx-auto max-w-6xl py-8 md:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-black">Checkout</h1>
        <div className="mt-4 flex items-center gap-2 text-sm text-black/70">
          <button className={`${step === 'shipping' ? 'bg-black text-white' : 'bg-black/10 text-black'} h-8 w-8 rounded-full font-semibold`} type="button">1</button>
          <span className={step === 'shipping' ? 'font-semibold text-black' : 'text-black/70'}>Shipping</span>
          <div className="flex-1 border-t border-black/10" />
          <button className={`${step === 'payment' ? 'bg-black text-white' : 'bg-black/10 text-black'} h-8 w-8 rounded-full font-semibold`} type="button">2</button>
          <span className={step === 'payment' ? 'font-semibold text-black' : 'text-black/70'}>Payment</span>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <form onSubmit={handleShippingSubmit}>
              <div className="rounded-2xl border border-black/10 bg-white p-8">
                <h2 className="text-xl font-semibold text-black">Shipping Address</h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black">Full Name *</label>
                    <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.fullName ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })} placeholder="Juan Dela Cruz" type="text" value={shippingAddress.fullName} />
                    {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black">Email *</label>
                    <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.email ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })} placeholder="juan@example.com" type="email" value={shippingAddress.email} />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black">Phone Number *</label>
                    <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.phone ? 'border-red-500' : 'border-black/10'}`} inputMode="numeric" maxLength={11} onChange={(e) => handlePhoneChange(e.target.value)} pattern="[0-9]{11}" placeholder="09123456789" type="tel" value={shippingAddress.phone} />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black">Street Address *</label>
                    <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.address ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })} placeholder="123 Main Street" type="text" value={shippingAddress.address} />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black">City *</label>
                      <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.city ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })} placeholder="Manila" type="text" value={shippingAddress.city} />
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black">Province *</label>
                      <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.province ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })} placeholder="Metro Manila" type="text" value={shippingAddress.province} />
                      {errors.province && <p className="mt-1 text-sm text-red-600">{errors.province}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black">Zip Code *</label>
                      <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.zipCode ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })} placeholder="1000" type="text" value={shippingAddress.zipCode} />
                      {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black">Country</label>
                      <input className="mt-2 w-full border border-black/10 bg-black/5 px-4 py-2 text-black" disabled type="text" value={shippingAddress.country} />
                    </div>
                  </div>

                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button className="flex-1 border border-black px-6 py-3 text-sm font-medium tracking-[0.1em] text-black transition-colors hover:bg-black hover:text-white sm:tracking-[0.2em]" onClick={handleBackToCart} type="button">BACK TO CART</button>
                  <button className="flex-1 bg-black px-6 py-3 text-sm font-medium tracking-[0.1em] text-white transition-opacity hover:opacity-90 sm:tracking-[0.2em]" type="submit">CONTINUE TO PAYMENT</button>
                </div>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePaymentSubmit}>
              <div className="rounded-2xl border border-black/10 bg-white p-8">
                <h2 className="text-xl font-semibold text-black">Payment Method</h2>

                {error ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                    {error}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-3">
                  {PAYMENT_METHODS.map((option) => (
                    <button key={option.value} type="button" onClick={() => handlePaymentMethodSelect(option.value)} className={`rounded-xl border px-4 py-3 text-left transition-colors ${paymentMethod === option.value ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-black hover:border-black'}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold">{option.label}</p>
                          <p className={`text-sm ${paymentMethod === option.value ? 'text-white/80' : 'text-black/60'}`}>{option.description}</p>
                        </div>
                        {option.value === 'gcash' && paymentMethod === 'gcash' ? <span className="text-sm font-medium">09395221808</span> : null}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.paymentMethod && <p className="mt-2 text-sm text-red-600">{errors.paymentMethod}</p>}

                {paymentMethod === 'gcash' && (
                  <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm text-blue-900"><strong>GCash:</strong> Send payment to <strong>09395221808</strong>.</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-900"><strong>Cash on Delivery:</strong> Pay the rider when your order arrives.</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black">Cardholder Name *</label>
                      <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.cardName ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })} placeholder="Juan Dela Cruz" type="text" value={paymentInfo.cardName} />
                      {errors.cardName && <p className="mt-1 text-sm text-red-600">{errors.cardName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black">Card Number *</label>
                      <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.cardNumber ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => { let value = e.target.value.replace(/\D/g, ''); value = value.replace(/(\d{4})/g, '$1 ').trim(); setPaymentInfo({ ...paymentInfo, cardNumber: value }); }} placeholder="4111 1111 1111 1111" type="text" value={paymentInfo.cardNumber} />
                      {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black">Expiry Date *</label>
                        <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.expiryDate ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => { let value = e.target.value.replace(/\D/g, ''); if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2, 4); setPaymentInfo({ ...paymentInfo, expiryDate: value }); }} placeholder="MM/YY" type="text" value={paymentInfo.expiryDate} />
                        {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-black">CVV *</label>
                        <input className={`mt-2 w-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black ${errors.cvv ? 'border-red-500' : 'border-black/10'}`} onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) })} placeholder="123" type="text" value={paymentInfo.cvv} />
                        {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-sm text-yellow-900"><strong>Demo Mode:</strong> Use test card 4111 1111 1111 1111 with any expiry and CVV for testing.</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button className="flex-1 border border-black px-6 py-3 text-sm font-medium tracking-[0.1em] text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50 sm:tracking-[0.2em]" disabled={loading} onClick={() => setStep('shipping')} type="button">BACK</button>
                  <button className="flex-1 bg-black px-6 py-3 text-sm font-medium tracking-[0.1em] text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:tracking-[0.2em]" disabled={loading} type="submit">{loading ? 'PROCESSING...' : 'PLACE ORDER'}</button>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-black/10 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-black">Order Summary</h2>

            <div className="mt-6 space-y-3 border-t border-black/10 pt-6">
              {items.map((item) => (
                <div key={`${item.slug}-${item.size}`} className="text-sm text-black/70">
                  <div className="flex justify-between">
                    <span>{item.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                  <div className="text-xs text-black/50">Size: {item.size}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-black/10 pt-6">
              <div className="flex justify-between text-black">
                <span>Subtotal</span>
                <span>₱{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black">
                <span>Shipping Fee</span>
                <span className={hasShippingDestination ? 'text-black' : 'text-sm text-black/55'}>
                  {hasShippingDestination
                    ? `₱${shippingCost.toFixed(2)}`
                    : 'Enter Shipping address'}
                </span>
              </div>
              <div className="flex justify-between text-black">
                <span>Total</span>
                <span>₱{finalTotal.toFixed(2)}</span>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
    <Modal
      isOpen={isGcashQrOpen}
      placement="center"
      radius="sm"
      size="md"
      onOpenChange={setIsGcashQrOpen}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-black">
              GCash QR Code
              <span className="text-sm font-normal text-black/60">
                Send payment to 09395221808
              </span>
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-center rounded-xl border border-black/10 bg-white p-3">
                <img
                  alt="GCash payment QR code"
                  className="max-h-[70vh] w-full max-w-sm object-contain"
                  src="/marcogcash.jpg"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                className="bg-black px-5 font-semibold text-white"
                radius="sm"
                onPress={onClose}
              >
                Done
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    </>
  );
}
