import React from 'react';
import { Navbar } from '../components/Navbar';
import { Lightbulb, Handshake, Rocket, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-800 to-slate-950 py-20 text-white text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 text-white pointer-events-none">
          <Sparkles className="w-96 h-96" />
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Our Story</h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Building the simplest way for teams to capture, organize, and track their work.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl font-extrabold text-slate-900">Our Mission</h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            At Taskie, we believe that great teamwork starts with organization and clarity. Our mission is to
            help teams of all sizes manage their projects with a simple, flexible tool that adapts to how you work, 
            not the other way around.
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            Founded with a vision for friction-free workspace organization, we've already helped thousands of teams streamline their workflows, improve communication, and achieve their goals faster than ever before.
          </p>
        </div>
        <div className="md:w-1/2">
          {/* Illustrative team box */}
          <div className="w-full h-80 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center text-white p-8 text-center relative overflow-hidden">
            <div className="absolute -left-10 -bottom-10 opacity-15 text-white">
              <Heart className="w-48 h-48" />
            </div>
            <div className="space-y-4 relative z-10">
              <span className="text-5xl">🤝</span>
              <h3 className="text-2xl font-bold">Collaborate Seamlessly</h3>
              <p className="text-blue-100 text-sm max-w-sm">
                No complex charts, no setup friction. Just clean boards and absolute focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full bg-slate-100/80 border-y border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center">Our Core Values</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100 text-blue-600">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Simplicity</h3>
              <p className="text-slate-600 leading-relaxed">
                We believe in creating tools that are intuitive and easy to use. No unnecessary complexity or steep learning curves.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-emerald-100 text-emerald-600">
                <Handshake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Collaboration</h3>
              <p className="text-slate-600 leading-relaxed">
                Great things happen when people work together. We design our features to make teamwork seamless and effective.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-4 hover:shadow-md transition">
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-purple-100 text-purple-600">
                <Rocket className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Innovation</h3>
              <p className="text-slate-600 leading-relaxed">
                We constantly explore new ideas to improve how teams work. We're never satisfied with the status quo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full space-y-12">
        <h2 className="text-3xl font-extrabold text-slate-900 text-center">Meet Our Team</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Member 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4 hover:shadow-md transition">
            <div className="w-24 h-24 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center mx-auto text-3xl font-bold border-2 border-slate-100">
              HQ
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Nguyen Quang Ha</h3>
              <p className="text-slate-500 text-sm">Co-Founder & CEO</p>
            </div>
          </div>

          {/* Member 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4 hover:shadow-md transition">
            <div className="w-24 h-24 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-3xl font-bold border-2 border-slate-100">
              MS
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Ma Thi Su</h3>
              <p className="text-slate-500 text-sm">Head of Design</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-brand-blue py-16 text-white text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold">Ready to Transform Your Workflow?</h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of teams already using Taskie to collaborate more effectively.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-brand-blue font-bold rounded-lg hover:bg-slate-50 transition shadow-lg hover:shadow-xl"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
};
