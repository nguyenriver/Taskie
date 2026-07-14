import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Check, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});

  const toggleFaq = (id: number) => {
    setFaqOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const prices = {
    pro: billingPeriod === 'monthly' ? 9 : 87,
    business: billingPeriod === 'monthly' ? 24 : 230,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Pricing Header */}
      <section className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white pt-20 pb-16 md:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
          
          {/* Toggle Switch */}
          <div className="flex justify-center items-center space-x-3 pt-4">
            <span className={`text-sm font-bold ${billingPeriod === 'monthly' ? 'text-white' : 'text-blue-100'}`}>Monthly</span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-12 items-center rounded-full bg-white/30 transition-colors focus:outline-none cursor-pointer"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  billingPeriod === 'yearly' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-white' : 'text-blue-100'}`}>
              Yearly 
              <span className="text-[10px] bg-white text-blue-600 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 md:py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col hover:shadow-md transition">
            <div className="space-y-4 mb-6">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Free</span>
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-slate-900">$0</span>
                <span className="text-slate-500 font-semibold ml-1.5">/ forever</span>
              </div>
              <p className="text-slate-600 text-sm">Perfect for individuals getting started with personal projects.</p>
            </div>
            
            <ul className="space-y-4 flex-grow mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Up to 5 boards</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Basic templates</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Limited storage (100MB)</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Single user only</span>
              </li>
            </ul>

            <Link
              to="/register"
              className="text-center py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-brand-blue rounded-2xl shadow-md p-8 flex flex-col relative hover:shadow-lg transition bg-white scale-105 z-10">
            <div className="absolute -top-3 right-6 bg-brand-blue text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Popular
            </div>
            
            <div className="space-y-4 mb-6">
              <span className="text-xs font-extrabold text-brand-blue uppercase tracking-widest">Pro</span>
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-slate-900">${prices.pro}</span>
                <span className="text-slate-500 font-semibold ml-1.5">/ {billingPeriod === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <p className="text-slate-600 text-sm">For professionals and small teams to boost productivity.</p>
            </div>

            <ul className="space-y-4 flex-grow mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Unlimited boards</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Advanced templates</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>1GB storage</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Up to 5 team members</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>

            <Link
              to="/register"
              className="text-center py-3 bg-brand-blue hover:bg-brand-hover text-white font-bold rounded-lg shadow transition"
            >
              Start 14-day Free Trial
            </Link>
          </div>

          {/* Business Plan */}
          <div className="border border-slate-200 rounded-2xl shadow-sm p-8 flex flex-col hover:shadow-md transition">
            <div className="space-y-4 mb-6">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Business</span>
              <div className="flex items-baseline">
                <span className="text-5xl font-black text-slate-900">${prices.business}</span>
                <span className="text-slate-500 font-semibold ml-1.5">/ {billingPeriod === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <p className="text-slate-600 text-sm">For growing teams that need more power and flexibility.</p>
            </div>

            <ul className="space-y-4 flex-grow mb-8 text-sm text-slate-600">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>10GB storage</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Unlimited team members</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Advanced security & Admin controls</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>24/7 dedicated support</span>
              </li>
            </ul>

            <Link
              to="/contact"
              className="text-center py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-lg transition"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-slate-50 border-y border-slate-200 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center">Compare All Features</h2>
          
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-slate-600">
              <thead>
                <tr className="bg-slate-50 text-slate-800 border-b border-slate-200 text-sm font-bold">
                  <th className="py-4 px-6 w-1/3">Features</th>
                  <th className="py-4 px-6 text-center">Free</th>
                  <th className="py-4 px-6 text-center">Pro</th>
                  <th className="py-4 px-6 text-center">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Boards</td>
                  <td className="py-4 px-6 text-center">5</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Storage</td>
                  <td className="py-4 px-6 text-center">100MB</td>
                  <td className="py-4 px-6 text-center">1GB</td>
                  <td className="py-4 px-6 text-center">10GB</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Team Members</td>
                  <td className="py-4 px-6 text-center">1</td>
                  <td className="py-4 px-6 text-center">5</td>
                  <td className="py-4 px-6 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-semibold text-slate-800">Priority Support</td>
                  <td className="py-4 px-6 text-center">—</td>
                  <td className="py-4 px-6 text-center">✔</td>
                  <td className="py-4 px-6 text-center">24/7 Support</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white px-4">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(1)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Can I upgrade or downgrade my plan?</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen[1] ? 'rotate-180' : ''}`} />
              </button>
              {faqOpen[1] && (
                <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                  Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be applied immediately, with any price difference prorated.
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(2)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>What payment methods do you accept?</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen[2] ? 'rotate-180' : ''}`} />
              </button>
              {faqOpen[2] && (
                <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                  We accept all major credit cards, including Visa, Mastercard, and American Express. We also support PayPal for payment.
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(3)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Is there a free trial available?</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen[3] ? 'rotate-180' : ''}`} />
              </button>
              {faqOpen[3] && (
                <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                  Yes, we offer a 14-day free trial on our Pro plan. No credit card is required to start your trial.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
