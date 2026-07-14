import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Users, BarChart3, ArrowRight, Star } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Announcement Banner */}
      <div className="w-full py-3 bg-gradient-to-r from-blue-100 to-blue-200 flex flex-col md:flex-row justify-center items-center text-[#091E42] gap-2 font-medium shadow-sm">
        <span className="text-center md:text-left px-4 text-sm">
          Accelerate your teams' work with Taskie now available for all Premium and Enterprise!
        </span>
        <a href="#" className="text-blue-600 hover:text-blue-700 underline text-sm font-semibold transition">
          Learn more
        </a>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-slate-100 px-4 py-16 md:py-24 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-3/5 text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
              Capture, organize, and tackle your{' '}
              <span className="text-brand-blue relative inline-block">
                to-dos
                <svg className="absolute w-full h-3 -bottom-2 left-0 text-blue-200" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>{' '}
              from anywhere.
            </h1>

            <p className="text-lg text-slate-600 md:pr-12">
              Stay organized and efficient with Inbox, Boards, and Cards. Every to-do, idea,
              or responsibility—no matter how small—finds its place.
            </p>

            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="px-6 py-3.5 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-hover transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
              >
                {user ? 'Go to Dashboard' : 'Get Started'}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 transition shadow-sm flex items-center justify-center"
              >
                Learn More
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-2/5 flex justify-center">
            {/* Visual Illustrative Hero Card */}
            <div className="relative w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-slate-100 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-400"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-400"></span>
                  <span className="w-3.5 h-3.5 rounded-full bg-green-400"></span>
                </div>
                <span className="text-xs font-bold text-slate-400 tracking-wider">PROJECT KANBAN</span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-blue"></span>
                    <span className="text-sm font-semibold text-slate-700">Design landing page</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">To Do</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="text-sm font-semibold text-slate-700">Refactor DB scheme</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 font-bold rounded">In Progress</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-sm font-semibold text-slate-700">Integrate secure JWT</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 font-bold rounded">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Why teams love Taskie</h2>
            <p className="text-slate-600 text-lg">
              Manage projects, allocate tasks, and build collaboration dashboards without the complex bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <CheckSquare className="w-6 h-6 text-brand-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Simple Task Management</h3>
              <p className="text-slate-600">
                Create, organize, and complete tasks with an intuitive interface that keeps everything in one place.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Team Collaboration</h3>
              <p className="text-slate-600">
                Share boards with Owner, Editor, or Viewer roles, and keep discussions active with threaded comments.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition duration-300">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Drag & Drop Flow</h3>
              <p className="text-slate-600">
                Easily organize cards between lists and rearrange list column positions dynamically to track process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-md border border-slate-200 flex flex-col items-center text-center space-y-6">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-slate-800 italic leading-relaxed">
              "Taskie has completely transformed how our team manages projects. The intuitive design and
              powerful features have increased our productivity by 40%."
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center text-lg">
                D
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-900">Daniel William Sooman</h4>
                <p className="text-slate-500 text-sm">Product Manager at DaniDev</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Partners Logos */}
      <section className="py-16 bg-white flex-grow">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-center text-slate-400 font-bold text-sm tracking-wider uppercase mb-10">
            Trusted by leading companies worldwide
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50">
            <span className="text-2xl font-bold text-slate-600 tracking-tight">MICROSOFT</span>
            <span className="text-2xl font-bold text-slate-600 tracking-tight">GOOGLE</span>
            <span className="text-2xl font-bold text-slate-600 tracking-tight">META</span>
            <span className="text-2xl font-bold text-slate-600 tracking-tight">NETFLIX</span>
            <span className="text-2xl font-bold text-slate-600 tracking-tight">AMAZON</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 text-center space-y-4">
          <p className="text-sm font-semibold">© 2026 Taskie Inc. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-xs font-semibold">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
