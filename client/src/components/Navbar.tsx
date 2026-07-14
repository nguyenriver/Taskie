import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout, LogOut, User as UserIcon, Shield, ChevronDown, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-brand-blue font-bold text-2xl tracking-tight">
              <Layout className="w-7 h-7 text-brand-blue" />
              <span>Taskie</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-brand-blue font-medium transition">
                  Dashboard
                </Link>
                {user.role === 'Admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium transition">
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-sm">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-slate-700 font-medium text-sm max-w-[120px] truncate">
                      {user.fullName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-brand-blue font-medium transition">
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-hover transition shadow-sm"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:text-brand-blue focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              {user.role === 'Admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-hover"
              >
                Sign Up Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
