import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { 
  Users as UsersIcon, Layout,
  UserPlus, ShieldAlert, Plus, Trash2, Edit, AlertCircle, Search 
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'boards' | 'members'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Data lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [boardsList, setBoardsList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);

  // Simple create/edit inputs states
  const [createMode, setCreateMode] = useState(false);
  const [editModeId, setEditModeId] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'users') {
        const data = await api.get<any[]>('/admin/users');
        setUsersList(data);
      } else if (activeTab === 'boards') {
        const [boards, users] = await Promise.all([
          api.get<any[]>('/admin/boards'),
          api.get<any[]>('/admin/users')
        ]);
        setBoardsList(boards);
        setUsersList(users);
      } else if (activeTab === 'members') {
        const data = await api.get<any[]>('/admin/boardmembers');
        setMembersList(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchData();
    }
  }, [activeTab]);

  const handleDelete = async (id1: any, id2?: any) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      let path = '';
      if (activeTab === 'users') path = `/admin/users/delete/${id1}`;
      else if (activeTab === 'boards') path = `/admin/boards/delete/${id1}`;
      else if (activeTab === 'members') path = `/admin/boardmembers/delete/${id1}/${id2}`;

      await api.delete(path);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Deletion failed.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let path = '';
      let payload = {};

      if (activeTab === 'users') {
        path = '/admin/users/add';
        payload = { 
          fullName: formData.fullName, 
          email: formData.email, 
          password: formData.password,
          role: formData.role || 'User',
          verifyKey: formData.verifyKey || ''
        };
      } else if (activeTab === 'boards') {
        path = '/admin/boards/add';
        payload = { boardName: formData.boardName, userID: parseInt(formData.userID) };
      } else if (activeTab === 'members') {
        path = '/admin/boardmembers/add';
        payload = { boardID: parseInt(formData.boardID), userID: parseInt(formData.userID), role: formData.role || 'Viewer' };
      }

      await api.post(path, payload);
      setCreateMode(false);
      setFormData({});
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Creation failed.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let path = '';
      let payload = {};

      if (activeTab === 'users') {
        path = '/admin/users/update';
        payload = { userID: editModeId, field: formData.field, value: formData.value };
      } else if (activeTab === 'boards') {
        await api.put('/admin/boards/update', { boardID: editModeId, boardName: formData.boardName });
        if (parseInt(formData.newOwnerUserID) !== formData.currentOwnerUserID) {
          await api.put('/admin/boards/transfer-owner', {
            boardID: editModeId,
            newOwnerUserID: parseInt(formData.newOwnerUserID)
          });
        }
      } else if (activeTab === 'members') {
        path = '/admin/boardmembers/update-role';
        payload = { boardID: editModeId.boardID, userID: editModeId.userID, role: formData.role };
      }

      if (activeTab !== 'boards') {
        await api.put(path, payload);
      }
      setEditModeId(null);
      setFormData({});
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Update failed.');
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-sm">
            <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-800">Unauthorized Access</h2>
            <p className="text-slate-500 text-sm">
              Only system administrators are allowed to access this management dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter lists based on search query
  const getFilteredList = () => {
    if (activeTab === 'users') {
      return usersList.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    }
    if (activeTab === 'boards') {
      return boardsList.filter(b => b.boardName.toLowerCase().includes(search.toLowerCase()));
    }
    if (activeTab === 'members') {
      return membersList.filter(m => m.role.toLowerCase().includes(search.toLowerCase()));
    }
    return [];
  };

  const filteredData = getFilteredList();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Control Panel</h1>
          <p className="text-slate-500 text-sm">Account, board ownership, and membership administration</p>
        </div>

        {/* Tab Badges */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 scrollbar-thin">
          {[
            { id: 'users', label: 'Users', icon: UsersIcon },
            { id: 'boards', label: 'Boards', icon: Layout },
            { id: 'members', label: 'Board Members', icon: UserPlus },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setCreateMode(false);
                setEditModeId(null);
                setSearch('');
              }}
              className={`px-4 py-2 border-b-2 font-bold text-sm transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute inset-y-0 left-3 my-auto w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>

          {!createMode && !editModeId && (
            <button
              onClick={() => {
                setFormData({});
                setCreateMode(true);
              }}
              className="w-full sm:w-auto bg-brand-blue hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2 border border-red-100 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading details */}
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-200 rounded-lg w-full"></div>
            ))}
          </div>
        ) : createMode ? (
          /* Dynamic Creation Forms */
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 mb-4">Add {activeTab}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              {activeTab === 'users' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Full Name</label>
                    <input type="text" required onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input type="email" required onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <input type="password" required onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Role</label>
                    <select onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm">
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'boards' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Board Name</label>
                    <input type="text" required onChange={e => setFormData({...formData, boardName: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Owner User ID</label>
                    <input type="number" required onChange={e => setFormData({...formData, userID: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                </>
              )}

              {activeTab === 'members' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Board ID</label>
                    <input type="number" required onChange={e => setFormData({...formData, boardID: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">User ID</label>
                    <input type="number" required onChange={e => setFormData({...formData, userID: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Role</label>
                    <select onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm">
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setCreateMode(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold">Add Record</button>
              </div>
            </form>
          </div>
        ) : editModeId ? (
          /* Dynamic Editing Forms */
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <h3 className="font-bold text-lg text-slate-800 border-b border-slate-100 pb-2 mb-4">Edit {activeTab}</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              {activeTab === 'users' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Field to edit</label>
                    <select required onChange={e => setFormData({...formData, field: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm">
                      <option value="">-- Select --</option>
                      <option value="FullName">Full Name</option>
                      <option value="Role">Role</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">New Value</label>
                    <input type="text" required onChange={e => setFormData({...formData, value: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                </>
              )}

              {activeTab === 'boards' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Board Name</label>
                    <input type="text" required value={formData.boardName || ''} onChange={e => setFormData({...formData, boardName: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Board Owner</label>
                    <select required value={formData.newOwnerUserID || ''} onChange={e => setFormData({...formData, newOwnerUserID: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm">
                      {usersList.map(account => (
                        <option key={account.userID} value={account.userID}>
                          {account.fullName} ({account.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500">On transfer, the previous owner remains on the board as an Editor.</p>
                  </div>
                </>
              )}

              {activeTab === 'members' && (
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">New Role</label>
                  <select required onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-sm">
                    <option value="">-- Select --</option>
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setEditModeId(null)} className="px-4 py-2 border rounded-lg text-sm hover:bg-slate-50 font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg text-sm font-semibold font-bold">Update Record</button>
              </div>
            </form>
          </div>
        ) : (
          /* Render Data Tables */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-xs">
                  {activeTab === 'users' && (
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  )}
                  {activeTab === 'boards' && (
                    <tr>
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Owner ID</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  )}
                  {activeTab === 'members' && (
                    <tr>
                      <th className="px-6 py-4">Board ID</th>
                      <th className="px-6 py-4">User ID</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredData.length > 0 ? (
                    filteredData.map((item: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/55 transition">
                        {activeTab === 'users' && (
                          <>
                            <td className="px-6 py-4 font-mono text-slate-400">{item.userID}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{item.fullName}</td>
                            <td className="px-6 py-4">{item.email}</td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                item.role === 'Admin' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-brand-blue border border-blue-100'
                              }`}>
                                {item.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                              <button onClick={() => { setFormData({}); setEditModeId(item.userID); }} className="p-1 text-slate-400 hover:text-brand-blue transition"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(item.userID)} className="p-1 text-slate-400 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </>
                        )}
                        {activeTab === 'boards' && (
                          <>
                            <td className="px-6 py-4 font-mono text-slate-400">{item.boardID}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{item.boardName}</td>
                            <td className="px-6 py-4">{item.userID}</td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                              <button onClick={() => { setFormData({ boardName: item.boardName, currentOwnerUserID: item.userID, newOwnerUserID: item.userID }); setEditModeId(item.boardID); }} className="p-1 text-slate-400 hover:text-brand-blue transition" title="Rename board or transfer ownership"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(item.boardID)} className="p-1 text-slate-400 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </>
                        )}
                        {activeTab === 'members' && (
                          <>
                            <td className="px-6 py-4 font-mono text-slate-400">{item.boardID}</td>
                            <td className="px-6 py-4">{item.userID}</td>
                            <td className="px-6 py-4">
                              <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded">
                                {item.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                              <button onClick={() => { setFormData({}); setEditModeId({ boardID: item.boardID, userID: item.userID }); }} className="p-1 text-slate-400 hover:text-brand-blue transition"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(item.boardID, item.userID)} className="p-1 text-slate-400 hover:text-rose-600 transition"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
