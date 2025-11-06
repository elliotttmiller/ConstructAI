import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

export interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
    page: string;
  };
  selection?: {
    elementId?: string;
    elementType?: string;
    startOffset?: number;
    endOffset?: number;
  };
}

export interface CollaborativeSession {
  id: string;
  projectId: string;
  users: Map<string, CollaborativeUser>;
  document: Y.Doc;
  provider: WebsocketProvider;
  persistence: IndexeddbPersistence;
}

export interface CollaborativeAnnotation {
  id: string;
  userId: string;
  elementId: string;
  position: { x: number; y: number; z?: number };
  content: string;
  type: 'comment' | 'issue' | 'approval' | 'question';
  status: 'open' | 'resolved' | 'pending';
  createdAt: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  replies: CollaborativeAnnotation[];
}

export interface LiveEdit {
  id: string;
  userId: string;
  elementId: string;
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  applied: boolean;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private sessions: Map<string, CollaborativeSession> = new Map();
  private currentUser?: CollaborativeUser;
  private wsUrl: string;

  private constructor() {
    // Use Supabase realtime or custom WebSocket server
    this.wsUrl = process.env.NEXT_PUBLIC_COLLABORATION_WS_URL ||
                 `wss://${window.location.hostname}/collaboration`;
  }

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  // Initialize collaboration for a project
  async joinProject(
    projectId: string,
    user: Omit<CollaborativeUser, 'isOnline' | 'lastSeen' | 'color'>
  ): Promise<CollaborativeSession> {
    const sessionId = `project_${projectId}`;

    // Set current user with generated color
    this.currentUser = {
      ...user,
      isOnline: true,
      lastSeen: new Date(),
      color: this.generateUserColor(user.id)
    };

    // Check if session already exists
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Create new collaborative session
      const ydoc = new Y.Doc();

      // Set up WebSocket provider for real-time sync
      const provider = new WebsocketProvider(
        this.wsUrl,
        sessionId,
        ydoc,
        {
          connect: true,
          params: {
            userId: user.id,
            projectId: projectId
          }
        }
      );

      // Set up local persistence
      const persistence = new IndexeddbPersistence(sessionId, ydoc);

      session = {
        id: sessionId,
        projectId,
        users: new Map(),
        document: ydoc,
        provider,
        persistence
      };

      this.sessions.set(sessionId, session);
      this.setupSessionHandlers(session);
    }

    // Add current user to session
    session.users.set(user.id, this.currentUser);

    // Broadcast user joined
    this.broadcastUserUpdate(session, this.currentUser);

    return session;
  }

  // Set up real-time event handlers
  private setupSessionHandlers(session: CollaborativeSession) {
    const { document: ydoc, provider } = session;

    // Set up shared data structures
    const users = ydoc.getMap('users');
    const cursors = ydoc.getMap('cursors');
    const annotations = ydoc.getArray('annotations');
    const liveEdits = ydoc.getArray('liveEdits');
    const selections = ydoc.getMap('selections');

    // Handle user awareness (cursors, selections)
    provider.awareness.on('change', (changes: any) => {
      this.handleAwarenessChange(session, changes);
    });

    // Handle document changes
    ydoc.on('update', (update: Uint8Array, origin: any) => {
      this.handleDocumentUpdate(session, update, origin);
    });

    // Handle provider connection status
    provider.on('status', (event: { status: string }) => {
      this.handleConnectionStatus(session, event.status);
    });

    // Handle provider sync
    provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        this.handleSyncComplete(session);
      }
    });
  }

  // Handle cursor and selection changes
  private handleAwarenessChange(session: CollaborativeSession, changes: any) {
    const awareness = session.provider.awareness;

    changes.added.forEach((clientId: number) => {
      const user = awareness.getStates().get(clientId);
      if (user) {
        this.onUserJoined(session, user);
      }
    });

    changes.updated.forEach((clientId: number) => {
      const user = awareness.getStates().get(clientId);
      if (user) {
        this.onUserUpdated(session, user);
      }
    });

    changes.removed.forEach((clientId: number) => {
      this.onUserLeft(session, clientId);
    });
  }

  // Update user cursor position
  updateCursor(sessionId: string, x: number, y: number, page: string) {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return;

    this.currentUser.cursor = { x, y, page };

    // Update awareness state
    session.provider.awareness.setLocalStateField('cursor', {
      x, y, page,
      userId: this.currentUser.id,
      timestamp: Date.now()
    });
  }

  // Update element selection
  updateSelection(
    sessionId: string,
    elementId?: string,
    elementType?: string,
    startOffset?: number,
    endOffset?: number
  ) {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return;

    this.currentUser.selection = { elementId, elementType, startOffset, endOffset };

    // Update awareness state
    session.provider.awareness.setLocalStateField('selection', {
      elementId,
      elementType,
      startOffset,
      endOffset,
      userId: this.currentUser.id,
      timestamp: Date.now()
    });
  }

  // Add collaborative annotation
  addAnnotation(
    sessionId: string,
    annotation: Omit<CollaborativeAnnotation, 'id' | 'userId' | 'createdAt' | 'replies'>
  ): string {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return '';

    const annotationId = `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newAnnotation: CollaborativeAnnotation = {
      ...annotation,
      id: annotationId,
      userId: this.currentUser.id,
      createdAt: new Date(),
      replies: []
    };

    // Add to shared document
    const annotations = session.document.getArray('annotations');
    annotations.push([newAnnotation]);

    return annotationId;
  }

  // Reply to annotation
  replyToAnnotation(
    sessionId: string,
    annotationId: string,
    content: string,
    type: CollaborativeAnnotation['type'] = 'comment'
  ): string {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return '';

    const replyId = `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const reply: CollaborativeAnnotation = {
      id: replyId,
      userId: this.currentUser.id,
      elementId: '', // Will be set by parent
      position: { x: 0, y: 0 },
      content,
      type,
      status: 'open',
      createdAt: new Date(),
      replies: []
    };

    // Add reply to parent annotation
    const annotations = session.document.getArray('annotations');
    const annotationData = annotations.toArray();

    const parentIndex = annotationData.findIndex((a: any) => a.id === annotationId);
    if (parentIndex !== -1) {
      const parent = annotationData[parentIndex] as CollaborativeAnnotation;
      parent.replies.push(reply);

      // Update the annotation in the shared document
      annotations.delete(parentIndex, 1);
      annotations.insert(parentIndex, [parent]);
    }

    return replyId;
  }

  // Resolve annotation
  resolveAnnotation(sessionId: string, annotationId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return false;

    const annotations = session.document.getArray('annotations');
    const annotationData = annotations.toArray();

    const index = annotationData.findIndex((a: any) => a.id === annotationId);
    if (index !== -1) {
      const annotation = annotationData[index] as CollaborativeAnnotation;
      annotation.status = 'resolved';
      annotation.resolvedBy = this.currentUser.id;
      annotation.resolvedAt = new Date();

      // Update the annotation
      annotations.delete(index, 1);
      annotations.insert(index, [annotation]);

      return true;
    }

    return false;
  }

  // Apply live edit
  applyLiveEdit(
    sessionId: string,
    elementId: string,
    property: string,
    newValue: any,
    oldValue?: any
  ): string {
    const session = this.sessions.get(sessionId);
    if (!session || !this.currentUser) return '';

    const editId = `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const liveEdit: LiveEdit = {
      id: editId,
      userId: this.currentUser.id,
      elementId,
      property,
      oldValue: oldValue || null,
      newValue,
      timestamp: new Date(),
      applied: false
    };

    // Add to shared document
    const liveEdits = session.document.getArray('liveEdits');
    liveEdits.push([liveEdit]);

    return editId;
  }

  // Get all users in session
  getSessionUsers(sessionId: string): CollaborativeUser[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return Array.from(session.users.values());
  }

  // Get all annotations for an element
  getElementAnnotations(sessionId: string, elementId: string): CollaborativeAnnotation[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const annotations = session.document.getArray('annotations');
    return annotations.toArray().filter((a: any) => a.elementId === elementId) as CollaborativeAnnotation[];
  }

  // Get live edits history
  getLiveEdits(sessionId: string, elementId?: string): LiveEdit[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    const liveEdits = session.document.getArray('liveEdits');
    const edits = liveEdits.toArray() as LiveEdit[];

    return elementId
      ? edits.filter(edit => edit.elementId === elementId)
      : edits;
  }

  // Event handlers
  private onUserJoined(session: CollaborativeSession, userState: any) {
    if (userState.user) {
      session.users.set(userState.user.id, {
        ...userState.user,
        isOnline: true,
        lastSeen: new Date()
      });

      // Emit user joined event
      this.emitEvent('userJoined', {
        sessionId: session.id,
        user: userState.user
      });
    }
  }

  private onUserUpdated(session: CollaborativeSession, userState: any) {
    if (userState.user) {
      const existingUser = session.users.get(userState.user.id);
      if (existingUser) {
        session.users.set(userState.user.id, {
          ...existingUser,
          ...userState.user,
          cursor: userState.cursor,
          selection: userState.selection,
          lastSeen: new Date()
        });

        // Emit cursor/selection update
        this.emitEvent('userUpdated', {
          sessionId: session.id,
          user: session.users.get(userState.user.id),
          cursor: userState.cursor,
          selection: userState.selection
        });
      }
    }
  }

  private onUserLeft(session: CollaborativeSession, clientId: number) {
    // Find and remove user
    for (const [userId, user] of session.users.entries()) {
      if (user.id === clientId.toString()) {
        user.isOnline = false;
        user.lastSeen = new Date();

        this.emitEvent('userLeft', {
          sessionId: session.id,
          user
        });
        break;
      }
    }
  }

  private handleDocumentUpdate(session: CollaborativeSession, update: Uint8Array, origin: any) {
    // Handle document changes
    this.emitEvent('documentUpdate', {
      sessionId: session.id,
      update,
      origin
    });
  }

  private handleConnectionStatus(session: CollaborativeSession, status: string) {
    this.emitEvent('connectionStatus', {
      sessionId: session.id,
      status
    });
  }

  private handleSyncComplete(session: CollaborativeSession) {
    this.emitEvent('syncComplete', {
      sessionId: session.id
    });
  }

  private broadcastUserUpdate(session: CollaborativeSession, user: CollaborativeUser) {
    session.provider.awareness.setLocalStateField('user', user);
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
      '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
    ];

    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }

  // Event emitter
  private eventListeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Leave project
  leaveProject(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session && this.currentUser) {
      session.users.delete(this.currentUser.id);
      session.provider.awareness.setLocalStateField('user', null);
      session.provider.disconnect();
      session.persistence.destroy();
      this.sessions.delete(sessionId);
    }
  }

  // Get current user
  getCurrentUser(): CollaborativeUser | undefined {
    return this.currentUser;
  }

  // Check if user is in session
  isInSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
}

export default CollaborationService;
