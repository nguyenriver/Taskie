import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { User as UserIcon, Lock, CheckCircle, AlertCircle, Save, ShieldAlert } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  // Profile Update Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Update Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setProfileLoading(true);

    try {
      const response = await api.post<{ success: boolean; message: string; fullName: string }>('/user/profile/update', {
        fullName,
      });
      if (response.success) {
        setProfileSuccess('Profile updated successfully!');
        if (user) {
          updateUser({ ...user, fullName: response.fullName });
        }
      } else {
        setProfileError(response.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.post<{ success: boolean; message: string }>('/user/change-password', {
        currentPassword,
        newPassword,
      });
      if (response.success) {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(response.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Profile Settings</h1>
          <p className="text-slate-500">Manage your personal information and account security</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar profile display */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-3xl mx-auto">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-xl text-slate-800">{user?.fullName}</h2>
              <p className="text-slate-500 text-sm">{user?.email}</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-brand-blue border border-blue-200 rounded-full">
                {user?.role} Account
              </span>
            </div>
          </div>

          {/* Configuration details */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Update Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <UserIcon className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-lg text-slate-800">Account Details</h3>
              </div>

              {profileSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 border border-green-100 text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2 border border-red-100 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="emailRead">Email Address (Cannot Change)</label>
                  <input
                    id="emailRead"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="fullNameInput">Full Name</label>
                  <input
                    id="fullNameInput"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-5 py-2.5 bg-brand-blue text-white rounded-lg hover:bg-brand-hover font-semibold flex items-center gap-2 disabled:opacity-50 transition shadow"
                  >
                    <Save className="w-4 h-4" />
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Update Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Lock className="w-5 h-5 text-brand-blue" />
                <h3 className="font-bold text-lg text-slate-800">Change Password</h3>
              </div>

              {passwordSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 border border-green-100 text-sm font-semibold">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 border border-red-100 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="••••••••"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-2 text-xs text-slate-500">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-slate-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Minimum 8 characters long</li>
                      <li>At least one uppercase and one lowercase letter</li>
                      <li>At least one digit and one special character</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-brand-blue text-white rounded-lg hover:bg-brand-hover font-semibold flex items-center gap-2 disabled:opacity-50 transition shadow"
                  >
                    <Lock className="w-4 h-4" />
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
