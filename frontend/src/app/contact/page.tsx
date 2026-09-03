'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Send, Sparkles, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen py-16">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-clay-100 text-clay-700">
          <Sparkles className="w-3.5 h-3.5 text-clay-600" /> We’d Love to Hear from You
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-yarn-mocha tracking-tight font-serif-accent">
          Contact Our Artisan Studio
        </h1>
        <p className="text-sm text-stone-600 max-w-xl mx-auto">
          Have a custom crochet inquiry, bulk gift order, or need help with a purchase? Reach out to our handcrafted studio team.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-yarn-mocha">Studio Information</h2>

              <div className="space-y-5 text-xs text-stone-600">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-clay-50 text-clay-700 rounded-2xl border border-clay-200">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-yarn-mocha text-sm">Customer Support Email</p>
                    <p className="text-stone-500">support@crochetloom.com</p>
                    <p className="text-[11px] text-stone-400">Average response within 12-24 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-clay-50 text-clay-700 rounded-2xl border border-clay-200">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-yarn-mocha text-sm">Phone / WhatsApp Assistance</p>
                    <p className="text-stone-500">+91 98765 43210</p>
                    <p className="text-[11px] text-stone-400">Monday - Saturday (10:00 AM - 7:00 PM IST)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-clay-50 text-clay-700 rounded-2xl border border-clay-200">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-yarn-mocha text-sm">Handcraft Workshop Studio</p>
                    <p className="text-stone-500">CrochetLoom Artisan Studio, Gujarat, India - 380015</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-clay-50 text-clay-700 rounded-2xl border border-clay-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-yarn-mocha text-sm">Operating Hours</p>
                    <p className="text-stone-500">Mon - Sat: 9:00 AM - 7:00 PM IST</p>
                    <p className="text-[11px] text-stone-400">Sunday: Closed (Artisans Rest Day)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="p-6 rounded-3xl bg-sage-50 border border-sage-200 text-xs text-sage-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <MessageCircle className="w-4 h-4 text-sage-700" /> Quick Custom Order Support
              </div>
              <p className="text-stone-600">
                Want a custom color palette or specific dimensions? Send us a reference photo via email or support portal.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-sm">
              {isSubmitted ? (
                <div className="text-center py-12 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-yarn-mocha">Message Sent Successfully!</h3>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Thank you for reaching out, <strong>{name}</strong>. Our artisan care team will review your message and respond to <strong>{email}</strong> shortly.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="secondary" size="sm">
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-xl font-bold text-yarn-mocha mb-2">Send Us a Message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Your Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Diya Shah"
                        className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="diya@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Inquiry Subject *</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Custom Bridal Bouquet or Order Inquiry"
                        className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-yarn-mocha uppercase mb-1">Your Message *</label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your custom design ideas, required colors, or questions..."
                      className="w-full px-3.5 py-2.5 text-xs bg-cream-50 border border-cream-300 rounded-xl focus:ring-2 focus:ring-clay-500 focus:outline-none"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full font-bold" isLoading={isLoading} leftIcon={<Send className="w-4 h-4" />}>
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
