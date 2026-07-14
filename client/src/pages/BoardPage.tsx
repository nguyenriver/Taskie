import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import type { List, Card, Comment, BoardMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, UserPlus, Trash, X, Calendar, 
  Send, MessageSquare, Clock, AlignLeft, AlertCircle
} from 'lucide-react';

export const BoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const boardId = parseInt(id || '0');

  // Board details
  const [boardName, setBoardName] = useState('');
  const [userRole, setUserRole] = useState<'Owner' | 'Editor' | 'Viewer'>('Viewer');
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New List / Card forms
  const [newListOpen, setNewListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newCardOpenListId, setNewCardOpenListId] = useState<number | null>(null);
  const [newCardName, setNewCardName] = useState('');

  // Selected Card Details Modal
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [cardDesc, setCardDesc] = useState('');
  const [cardDueDate, setCardDueDate] = useState('');
  const [cardStatus, setCardStatus] = useState<Card['status']>('To Do');
  const [cardName, setCardName] = useState('');
  
  // Sharing Modal
  const [shareOpen, setShareOpen] = useState(false);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Editor' | 'Viewer'>('Viewer');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Drag states
  const [draggedListIndex, setDraggedListIndex] = useState<number | null>(null);
  const [draggedCardInfo, setDraggedCardInfo] = useState<{ cardId: number; sourceListId: number } | null>(null);

  const fetchBoardDetails = async () => {
    try {
      const response = await api.get<{
        success: boolean;
        boardName: string;
        userRole: 'Owner' | 'Editor' | 'Viewer';
        boardDetails: { lists: List[] };
      }>(`/board/${boardId}`);
      
      setBoardName(response.boardName);
      setUserRole(response.userRole);
      
      // Sort lists by position and cards by position
      const sortedLists = (response.boardDetails.lists || []).sort((a, b) => a.position - b.position);
      sortedLists.forEach(list => {
        if (list.cards) {
          list.cards.sort((a, b) => a.position - b.position);
        }
      });
      setLists(sortedLists);
    } catch (err: any) {
      setError(err.message || 'Failed to load board details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (boardId) {
      fetchBoardDetails();
    }
  }, [boardId]);

  // Rename Board
  const handleRenameBoard = async (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const newName = (e.target as HTMLInputElement).value.trim();
    if (!newName || newName === boardName || userRole === 'Viewer') return;

    try {
      await api.put('/board/update-name', { boardId, boardName: newName });
      setBoardName(newName);
    } catch (err) {
      console.error('Failed to update board name');
    }
  };

  // Delete Board
  const handleDeleteBoard = async () => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;
    try {
      await api.delete(`/board/delete/${boardId}`);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to delete board.');
    }
  };

  // Add List
  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || userRole === 'Viewer') return;

    try {
      const response = await api.post<{ success: boolean; list: List }>('/list/add', {
        listName: newListName,
        boardId: boardId
      });
      
      if (response.success && response.list) {
        setLists([...lists, { ...response.list, cards: [] }]);
        setNewListName('');
        setNewListOpen(false);
      }
    } catch (err) {
      console.error('Failed to create list');
    }
  };

  // Delete List
  const handleDeleteList = async (listId: number) => {
    if (!window.confirm('Delete this list and all its cards?')) return;
    try {
      await api.delete(`/list/delete/${listId}`);
      setLists(lists.filter(l => l.listID !== listId));
    } catch (err) {
      console.error('Failed to delete list');
    }
  };

  // Add Card
  const handleAddCard = async (listId: number) => {
    if (!newCardName.trim() || userRole === 'Viewer') return;

    try {
      const response = await api.post<{ success: boolean; card: Card }>('/card/add', {
        cardName: newCardName,
        listID: listId,
        status: 'To Do'
      });
      
      if (response.success && response.card) {
        setLists(lists.map(list => {
          if (list.listID === listId) {
            return {
              ...list,
              cards: [...(list.cards || []), response.card]
            };
          }
          return list;
        }));
        setNewCardName('');
        setNewCardOpenListId(null);
      }
    } catch (err) {
      console.error('Failed to add card');
    }
  };

  // Fetch comments and card details when card clicked
  const handleOpenCard = async (card: Card) => {
    setActiveCard(card);
    setCardName(card.cardName);
    setCardDesc(card.description || '');
    setCardDueDate(card.dueDate ? card.dueDate.split('T')[0] : '');
    setCardStatus(card.status);

    try {
      // Get Comments
      const response = await api.get<{ success: boolean; comments: Comment[] }>(`/card/${card.cardID}/comments`);
      setComments(response.comments || []);
    } catch (err) {
      console.error('Failed to load card comments');
    }
  };

  // Update Card Details
  const handleSaveCard = async () => {
    if (!activeCard || userRole === 'Viewer') return;

    try {
      // Save Title/Description/DueDate/Status
      const response = await api.put<{ success: boolean; card: Card }>('/card/update', {
        cardID: activeCard.cardID,
        cardName: cardName,
        description: cardDesc,
        dueDate: cardDueDate ? `${cardDueDate}T12:00:00` : null,
        status: cardStatus
      });

      if (response.success && response.card) {
        setLists(lists.map(list => {
          if (list.listID === activeCard.listID) {
            return {
              ...list,
              cards: (list.cards || []).map(c => c.cardID === activeCard.cardID ? response.card : c)
            };
          }
          return list;
        }));
        setActiveCard(response.card);
      }
    } catch (err) {
      console.error('Failed to save card');
    }
  };

  // Delete Card
  const handleDeleteCard = async () => {
    if (!activeCard || !window.confirm('Delete this card?')) return;

    try {
      await api.delete(`/card/delete/${activeCard.cardID}`);
      setLists(lists.map(list => {
        if (list.listID === activeCard.listID) {
          return {
            ...list,
            cards: (list.cards || []).filter(c => c.cardID !== activeCard.cardID)
          };
        }
        return list;
      }));
      setActiveCard(null);
    } catch (err) {
      console.error('Failed to delete card');
    }
  };

  // Post Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeCard) return;

    try {
      const response = await api.post<{ success: boolean; comment: Comment }>(`/card/${activeCard.cardID}/comments/add`, {
        content: newComment
      });
      if (response.success && response.comment) {
        // Inject current user metadata for display
        if (user) {
          response.comment.user = {
            userID: user.userID,
            email: user.email,
            fullName: user.fullName,
            role: user.role
          };
        }
        setComments([response.comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to create comment');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/card/comments/delete/${commentId}`);
      setComments(comments.filter(c => c.commentID !== commentId));
    } catch (err) {
      console.error('Failed to delete comment');
    }
  };

  // Fetch Board Members for Share Modal
  const openShare = async () => {
    setShareOpen(true);
    setInviteError(null);
    try {
      const response = await api.get<{ success: boolean; members: BoardMember[] }>(`/boardmember/board/${boardId}`);
      setMembers(response.members || []);
    } catch (err) {
      console.error('Failed to load board members');
    }
  };

  // Invite Board Member
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteError(null);

    try {
      const response = await api.post<{ success: boolean; message: string; member: BoardMember }>('/boardmember/invite', {
        boardId: boardId,
        email: inviteEmail,
        role: inviteRole
      });

      if (response.success && response.member) {
        setMembers([...members, response.member]);
        setInviteEmail('');
      } else {
        setInviteError(response.message || 'Invitation failed.');
      }
    } catch (err: any) {
      setInviteError(err.message || 'Failed to invite user.');
    }
  };

  // Remove Board Member
  const handleRemoveMember = async (targetUserId: number) => {
    if (!window.confirm('Remove this member from the board?')) return;
    try {
      await api.delete(`/boardmember/remove/${boardId}/${targetUserId}`);
      setMembers(members.filter(m => m.userID !== targetUserId));
    } catch (err) {
      console.error('Failed to remove member');
    }
  };

  // Custom HTML5 Drag & Drop: LISTS
  const handleListDragStart = (e: React.DragEvent, index: number) => {
    if (userRole === 'Viewer') return;
    setDraggedListIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleListDrop = async (_e: React.DragEvent, targetIndex: number) => {
    if (draggedListIndex === null || draggedListIndex === targetIndex || userRole === 'Viewer') return;

    const updatedLists = [...lists];
    const [draggedList] = updatedLists.splice(draggedListIndex, 1);
    updatedLists.splice(targetIndex, 0, draggedList);

    // Update positions locally
    const reordered = updatedLists.map((list, idx) => ({
      ...list,
      position: idx + 1
    }));
    setLists(reordered);
    setDraggedListIndex(null);

    // Call API to persist reorder positions
    try {
      await api.put('/list/update-positions', reordered.map(l => ({ listID: l.listID, position: l.position })));
    } catch (err) {
      console.error('Failed to save list order');
    }
  };

  // Custom HTML5 Drag & Drop: CARDS
  const handleCardDragStart = (e: React.DragEvent, cardId: number, sourceListId: number) => {
    if (userRole === 'Viewer') return;
    setDraggedCardInfo({ cardId, sourceListId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDrop = async (e: React.DragEvent, targetListId: number) => {
    e.preventDefault();
    if (!draggedCardInfo || userRole === 'Viewer') return;

    const { cardId, sourceListId } = draggedCardInfo;

    // Find the dragged card object
    const sourceList = lists.find(l => l.listID === sourceListId);
    const cardObj = sourceList?.cards?.find(c => c.cardID === cardId);

    if (!cardObj) return;

    // If dropped in the same list, do nothing or we can sort (simplifying to move list)
    if (sourceListId === targetListId) {
      setDraggedCardInfo(null);
      return;
    }

    // Move between lists
    const updatedLists = lists.map(list => {
      if (list.listID === sourceListId) {
        return {
          ...list,
          cards: (list.cards || []).filter(c => c.cardID !== cardId)
        };
      }
      if (list.listID === targetListId) {
        const targetCards = [...(list.cards || [])];
        // Insert card at the end of the new list
        const updatedCard = { ...cardObj, listID: targetListId, position: targetCards.length + 1 };
        return {
          ...list,
          cards: [...targetCards, updatedCard]
        };
      }
      return list;
    });

    setLists(updatedLists);
    setDraggedCardInfo(null);

    // Call API to persist list re-assignment
    try {
      await api.put('/card/move', {
        cardID: cardId,
        listID: targetListId
      });
    } catch (err) {
      console.error('Failed to move card in database');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-500 overflow-hidden">
      <Navbar />

      {/* Board Header Actions */}
      <header className="bg-black/25 w-full h-14 flex items-center px-6 text-white justify-between z-10">
        <div className="flex items-center gap-4">
          <input
            id="boardNameInput"
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            onBlur={handleRenameBoard}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            disabled={userRole === 'Viewer'}
            className="font-bold text-lg px-2.5 py-1 bg-transparent hover:bg-white/10 focus:bg-white focus:text-slate-800 rounded-md focus:outline-none transition w-44 sm:w-auto"
          />

          <span className="text-xs font-bold px-2.5 py-1 bg-white/20 rounded-full select-none">
            {userRole}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openShare}
            className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 font-bold text-sm rounded-lg flex items-center gap-1.5 transition"
          >
            <UserPlus className="w-4 h-4" />
            Share
          </button>

          {userRole === 'Owner' && (
            <button
              onClick={handleDeleteBoard}
              className="p-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg transition"
              title="Delete Board"
            >
              <Trash className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 font-semibold text-center text-sm border-b border-red-100 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Board Column Canvas */}
      <main className="flex-grow flex gap-4 overflow-x-auto py-4 px-6 items-start scrollbar-thin select-none">
        {loading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-72 h-80 bg-white/20 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <>
            {lists.map((list, listIndex) => (
              <div
                key={list.listID}
                draggable={userRole !== 'Viewer'}
                onDragStart={(e) => handleListDragStart(e, listIndex)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (draggedListIndex !== null) {
                    handleListDrop(e, listIndex);
                  } else if (draggedCardInfo) {
                    handleCardDrop(e, list.listID);
                  }
                }}
                className="w-72 shrink-0 bg-slate-100 rounded-2xl border border-slate-200/60 p-4 flex flex-col max-h-[calc(100vh-180px)] shadow-lg"
              >
                {/* List Header */}
                <div className="flex items-center justify-between pb-3">
                  <h4 className="font-extrabold text-slate-800 text-sm">{list.listName}</h4>
                  {userRole !== 'Viewer' && (
                    <button
                      onClick={() => handleDeleteList(list.listID)}
                      className="text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Cards Container */}
                <div className="flex-grow overflow-y-auto space-y-2.5 pb-2 scrollbar-thin">
                  {(list.cards || []).map((card) => (
                    <div
                      key={card.cardID}
                      draggable={userRole !== 'Viewer'}
                      onDragStart={(e) => handleCardDragStart(e, card.cardID, list.listID)}
                      onClick={() => handleOpenCard(card)}
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-blue-400 transition duration-300 cursor-pointer space-y-2.5"
                    >
                      <span className="font-semibold text-slate-800 text-sm block leading-snug">
                        {card.cardName}
                      </span>
                      
                      {/* Card Badges */}
                      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-50 text-slate-400">
                        <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          card.status === 'Done' ? 'bg-green-50 text-green-700' :
                          card.status === 'In Progress' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {card.status}
                        </span>

                        {card.dueDate && (
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Card Footer */}
                {userRole !== 'Viewer' && (
                  <div className="pt-2">
                    {newCardOpenListId === list.listID ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={newCardName}
                          onChange={(e) => setNewCardName(e.target.value)}
                          placeholder="Enter a title for this card"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddCard(list.listID)}
                        />
                        <div className="flex gap-2 text-xs">
                          <button
                            onClick={() => handleAddCard(list.listID)}
                            className="px-3 py-1.5 bg-brand-blue text-white font-bold rounded-lg"
                          >
                            Add Card
                          </button>
                          <button
                            onClick={() => setNewCardOpenListId(null)}
                            className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setNewCardName('');
                          setNewCardOpenListId(list.listID);
                        }}
                        className="w-full py-1.5 text-slate-500 hover:text-brand-blue hover:bg-slate-200 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 transition"
                      >
                        <Plus className="w-4 h-4" />
                        Add a Card
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add New List Button */}
            {userRole !== 'Viewer' && (
              <div className="w-72 shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-3 border border-white/20 text-white">
                {newListOpen ? (
                  <form onSubmit={handleAddList} className="space-y-2">
                    <input
                      type="text"
                      required
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      placeholder="Enter list title..."
                      className="w-full px-3 py-2 bg-white text-slate-800 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="px-3.5 py-1.5 bg-brand-blue hover:bg-brand-hover text-white font-bold text-xs rounded-lg transition">
                        Add List
                      </button>
                      <button type="button" onClick={() => setNewListOpen(false)} className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-lg transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setNewListName('');
                      setNewListOpen(true);
                    }}
                    className="w-full py-2 bg-transparent hover:bg-white/10 font-bold text-sm rounded-lg flex items-center justify-center gap-1 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add another list
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 📋 Card Detail Modal */}
      {activeCard && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                onBlur={handleSaveCard}
                disabled={userRole === 'Viewer'}
                className="font-bold text-xl text-slate-800 bg-transparent hover:bg-slate-100 focus:bg-white border-none focus:ring-2 focus:ring-brand-blue rounded px-2 py-0.5 focus:outline-none w-5/6"
              />
              <button onClick={() => setActiveCard(null)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 scrollbar-thin">
              {/* Left Column: Description & Comments */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <AlignLeft className="w-4 h-4 text-slate-400" />
                    Description
                  </h4>
                  <textarea
                    value={cardDesc}
                    onChange={(e) => setCardDesc(e.target.value)}
                    onBlur={handleSaveCard}
                    disabled={userRole === 'Viewer'}
                    placeholder="Add a more detailed description..."
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[100px] transition"
                  />
                </div>

                {/* Comment Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Discussion
                  </h4>

                  {userRole !== 'Viewer' && (
                    <form onSubmit={handleAddComment} className="flex items-center gap-2">
                      <input
                        type="text"
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-grow px-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      />
                      <button type="submit" className="p-2 bg-brand-blue hover:bg-brand-hover text-white rounded-xl transition shadow">
                        <Send className="w-4.5 h-4.5" />
                      </button>
                    </form>
                  )}

                  <div className="space-y-3 pt-2">
                    {comments.map((comment) => (
                      <div key={comment.commentID} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-sm">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            {comment.user?.fullName || 'Collaborator'}
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-normal">{comment.content}</p>
                        
                        {(userRole === 'Owner' || comment.userID === user?.userID) && (
                          <div className="text-right">
                            <button
                              onClick={() => handleDeleteComment(comment.commentID)}
                              className="text-[10px] font-bold text-rose-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Settings & Actions */}
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Status</label>
                  <select
                    value={cardStatus}
                    onChange={(e) => {
                      setCardStatus(e.target.value as any);
                      // Save immediately
                      setTimeout(() => {
                        const btn = document.getElementById('saveCardBtn');
                        if (btn) btn.click();
                      }, 50);
                    }}
                    disabled={userRole === 'Viewer'}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-semibold focus:outline-none"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Due Date</label>
                  <input
                    type="date"
                    value={cardDueDate}
                    onChange={(e) => {
                      setCardDueDate(e.target.value);
                      setTimeout(() => {
                        const btn = document.getElementById('saveCardBtn');
                        if (btn) btn.click();
                      }, 50);
                    }}
                    disabled={userRole === 'Viewer'}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <button
                  id="saveCardBtn"
                  onClick={handleSaveCard}
                  className="hidden"
                />

                {userRole !== 'Viewer' && (
                  <div className="pt-6 border-t border-slate-100">
                    <button
                      onClick={handleDeleteCard}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Trash className="w-4 h-4" />
                      Delete Card
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👥 Share Board Modal */}
      {shareOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Board Members</h3>
              <button onClick={() => setShareOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-semibold">
                {inviteError}
              </div>
            )}

            {userRole !== 'Viewer' && (
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Invite User by Email</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborator@example.com"
                    className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="text-slate-400 font-semibold">Role:</span>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="px-2.5 py-1 border rounded bg-slate-50 focus:outline-none"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-hover text-sm font-bold transition shadow"
                  >
                    Invite User
                  </button>
                </div>
              </form>
            )}

            {/* Members List */}
            <div className="pt-4 border-t border-slate-100 space-y-3 max-h-[250px] overflow-y-auto scrollbar-thin">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Members</h4>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.userID} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-xs">
                        {member.user?.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 leading-snug">{member.user?.fullName}</span>
                        <span className="text-[10px] text-slate-400 leading-none">{member.user?.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        member.role === 'Owner' ? 'bg-blue-100 text-blue-700' :
                        member.role === 'Editor' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {member.role}
                      </span>
                      {userRole === 'Owner' && member.role !== 'Owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.userID)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Remove Member"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
