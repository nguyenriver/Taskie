import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Board } from '../types';
import { Navbar } from '../components/Navbar';
import { Plus, Search, ClipboardList, Clock, Calendar, Users, Sparkles, X } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'owned' | 'shared'>('all');
  
  // Board creation modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchBoards = async () => {
    try {
      const data = await api.get<{ success: boolean; ownedBoards: Board[]; sharedBoards: Board[] }>('/board/list');
      setBoards([...data.ownedBoards, ...data.sharedBoards]);
    } catch (err: any) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    setModalError(null);
    setModalLoading(true);

    try {
      const response = await api.post<{ success: boolean; message: string; board: Board }>('/board/create', {
        boardName: newBoardName,
      });
      if (response.success && response.board) {
        setBoards([...boards, response.board]);
        setNewBoardName('');
        setModalOpen(false);
        navigate(`/board/${response.board.boardID}`);
      } else {
        setModalError(response.message || 'Failed to create board.');
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to create board.');
    } finally {
      setModalLoading(false);
    }
  };

  // Filtering and Sorting logic
  const filteredAndSortedBoards = () => {
    let result = [...boards];

    // Filter by type
    if (filterType === 'owned') {
      result = result.filter(b => b.userID === user?.userID);
    } else if (filterType === 'shared') {
      result = result.filter(b => b.userID !== user?.userID);
    } // 'recent' and 'all' handled similarly locally for mock filter, or we can filter by dates

    // Search query
    if (search.trim()) {
      result = result.filter(b => b.boardName.toLowerCase().includes(search.toLowerCase()));
    }

    // Sort logic
    if (sortBy === 'alpha') {
      result.sort((a, b) => a.boardName.localeCompare(b.boardName));
    } else if (sortBy === 'created') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // default: most recently active / ID descending
      result.sort((a, b) => b.boardID - a.boardID);
    }

    return result;
  };

  const processedBoards = filteredAndSortedBoards();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        {user && (
          <div className="relative bg-gradient-to-r from-brand-blue to-blue-700 rounded-2xl p-6 md:p-8 text-white shadow-lg overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome back, {user.fullName}!</h2>
                <p className="text-blue-100 text-sm">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="self-start md:self-auto bg-white text-brand-blue hover:bg-slate-50 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow"
            >
              <Plus className="w-5 h-5" />
              Create New Board
            </button>
          </div>
        )}

        {/* Sorting & Search Options */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold text-slate-800">My Boards</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute inset-y-0 left-3 my-auto w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search boards"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            {/* Sort Select */}
            <div className="relative bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <span className="text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-slate-700 font-semibold focus:outline-none focus:ring-0"
              >
                <option value="recent">Most Active</option>
                <option value="alpha">A-Z Alphabetical</option>
                <option value="created">Date Created</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filterType === 'all'
                ? 'bg-blue-50 text-brand-blue border-brand-blue'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Boards
          </button>
          <button
            onClick={() => setFilterType('recent')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filterType === 'recent'
                ? 'bg-blue-50 text-brand-blue border-brand-blue'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Recent</span>
          </button>
          <button
            onClick={() => setFilterType('owned')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filterType === 'owned'
                ? 'bg-blue-50 text-brand-blue border-brand-blue'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Owned by Me
          </button>
          <button
            onClick={() => setFilterType('shared')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition ${
              filterType === 'shared'
                ? 'bg-blue-50 text-brand-blue border-brand-blue'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Shared</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-36 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        ) : processedBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {processedBoards.map((board) => (
              <Link
                key={board.boardID}
                to={`/board/${board.boardID}`}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group flex flex-col justify-between h-36"
              >
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-800 group-hover:text-brand-blue transition line-clamp-1">
                    {board.boardName}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-50">
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    board.userID === user?.userID ? 'bg-blue-50 text-brand-blue' : 'bg-purple-50 text-purple-700'
                  }`}>
                    {board.userID === user?.userID ? 'Owner' : 'Member'}
                  </span>
                  <span className="text-slate-400 group-hover:translate-x-1 transition duration-300">→</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-brand-blue">
              <ClipboardList className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No boards found</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Create your first board to start organizing lists and cards with your team.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-hover transition shadow-md"
            >
              Create Your First Board
            </button>
          </div>
        )}
      </main>

      {/* Board Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Create New Board</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700" htmlFor="boardName">Board Name</label>
                <input
                  id="boardName"
                  type="text"
                  required
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="e.g. Marketing Campaign, Dev Roadmap"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-hover font-semibold disabled:opacity-50"
                >
                  {modalLoading ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
