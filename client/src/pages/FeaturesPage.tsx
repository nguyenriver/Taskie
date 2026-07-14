import React from 'react';
import { Navbar } from '../components/Navbar';
import { Layout, Users, CheckSquare, Star, Search, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-20 text-white text-center px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Powerful Features, Simple Interface</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Everything you need to organize your work and boost your team's productivity.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-blue-100 text-blue-600">
              <Layout className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Flexible Boards</h3>
            <p className="text-slate-600 leading-relaxed">
              Create and customize boards for any project. Organize your tasks your way with a simple, intuitive interface.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-green-100 text-green-600">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Team Collaboration</h3>
            <p className="text-slate-600 leading-relaxed">
              Share boards with team members and assign different roles. Work together in real-time to complete projects faster.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-purple-100 text-purple-600">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Task Management</h3>
            <p className="text-slate-600 leading-relaxed">
              Create, assign, and track tasks effortlessly. Mark tasks as complete and keep everyone updated on progress.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-amber-100 text-amber-600">
              <Star className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Favorites & Recents</h3>
            <p className="text-slate-600 leading-relaxed">
              Star important boards and quickly access recently viewed boards for fast navigation between projects.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-rose-100 text-rose-600">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Powerful Search</h3>
            <p className="text-slate-600 leading-relaxed">
              Find boards, tasks and team members instantly with our smart search functionality. Save time and stay organized.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-indigo-100 text-indigo-600">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Role-Based Access</h3>
            <p className="text-slate-600 leading-relaxed">
              Secure your work with customizable permissions. Assign owner, editor, or viewer roles to control what team members can do.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="w-full bg-slate-100/80 border-t border-slate-200 py-20 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-extrabold text-slate-900">What Our Users Say</h2>
          
          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm max-w-2xl mx-auto space-y-6">
            <p className="text-slate-600 italic text-lg leading-relaxed">
              "Taskie has transformed how our team collaborates on projects. The intuitive interface makes it easy for everyone to stay on the same page."
            </p>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg mb-2 shadow">
                DL
              </div>
              <h4 className="font-bold text-slate-850">Dung Le</h4>
              <p className="text-sm text-slate-500">Product Manager at Google</p>
            </div>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow transition"
          >
            Contact Us to Learn More
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
