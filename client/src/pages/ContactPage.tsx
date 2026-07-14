import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faLinkedinIn, faInstagram } from '@fortawesome/free-brands-svg-icons';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 py-16 text-white text-center px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Get in Touch</h1>
          <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto leading-relaxed">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full flex flex-col md:flex-row gap-12">
        {/* Contact Form */}
        <div className="md:w-7/12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-800">Send Us a Message</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">Your Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</label>
              <input
                type="text"
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                placeholder="Product Question, Feedback, Support Request"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
              <textarea
                id="message"
                required
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                placeholder="Write your message here..."
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="md:w-5/12 bg-slate-100/80 border border-slate-200 rounded-2xl p-8 space-y-8">
          <h2 className="text-2xl font-extrabold text-slate-800">Contact Information</h2>

          <div className="space-y-6">
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Our Office</h3>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">
                  96 Dinh Cong Lane<br />
                  Hoang Mai, Hanoi<br />
                  Vietnam
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Phone</h3>
                <p className="mt-1 text-slate-600 text-sm">+84 868 710 827</p>
                <p className="text-xs text-slate-400 mt-0.5">Monday-Friday, 9AM-6PM PST</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-100 text-blue-600">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Email</h3>
                <p className="mt-1 text-slate-600 text-sm">support@taskie.com</p>
                <p className="text-slate-600 text-sm">info@taskie.com</p>
              </div>
            </div>

            {/* Socials */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-md font-bold text-slate-800">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-600 transition">
                  <FontAwesomeIcon icon={faFacebookF} className="text-xl" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-400 transition">
                  <FontAwesomeIcon icon={faTwitter} className="text-xl" />
                </a>
                <a href="#" className="text-slate-400 hover:text-blue-700 transition">
                  <FontAwesomeIcon icon={faLinkedinIn} className="text-xl" />
                </a>
                <a href="#" className="text-slate-400 hover:text-pink-600 transition">
                  <FontAwesomeIcon icon={faInstagram} className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full h-96 border-y border-slate-200">
        <iframe
          title="google-maps"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.180183770134!2d105.8386396!3d20.9854132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac5d62bb843f%3A0x4fdcd2db95d302b6!2zOTYgUC4gxJDhu4tuaCBDw7RuZywgUGjGsMahbmcgTGnhu4d0LCBUaGFuaCBYdcOibiwgSMOgIE7hu5lp!5e0!3m2!1sen!2s!4v1744382832577!5m2!1sen!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
        />
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 w-full space-y-12">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center">Frequently Asked Questions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-slate-800">What is Taskie?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Taskie is a collaborative task management platform that helps teams organize, track, and prioritize their work in a flexible, visual way.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Is there a free plan available?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Yes! Taskie offers a free plan that includes unlimited boards, basic task management, and collaboration with up to 5 team members.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Do you offer customer support?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Absolutely. Our support team is available via email and chat to help you with any questions or issues you might have.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-lg font-bold text-slate-800">Can I import data from other tools?</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Yes, Taskie supports importing data from popular task management tools like Trello, Asana, and Monday.com to make your transition seamless.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
