export interface User {
  userID: number;
  email: string;
  fullName: string;
  role: string;
}

export interface Board {
  boardID: number;
  userID: number;
  boardName: string;
  createdAt: string;
}

export interface List {
  listID: number;
  boardID: number;
  listName: string;
  position: number;
  cards?: Card[];
}

export interface Card {
  cardID: number;
  listID: number;
  cardName: string;
  description?: string;
  dueDate?: string;
  status: 'To Do' | 'In Progress' | 'Done';
  position: number;
  createdAt: string;
}

export interface Comment {
  commentID: number;
  cardID: number;
  userID: number;
  content: string;
  createdAt: string;
  user?: User;
}

export interface BoardMember {
  boardID: number;
  userID: number;
  role: 'Owner' | 'Editor' | 'Viewer';
  user?: User;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
