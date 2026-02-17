// src/socket.ts
import { io, Socket } from 'socket.io-client';
import type { Die } from './types/types';


const backendUrl =
  import.meta.env.VITE_BACKEND_URL;

// Shape of a "session update" message from the server
export interface SessionUpdatePayload {
  sessionId: string;
  message: string;
  from: string;      // socket.id of the sender
  timestamp: string; // ISO timestamp from the server
}

// All events the SERVER can send to the CLIENT
interface ServerToClientEvents {
  joinedSession: (sessionId: string) => void;
  sessionUpdate: (payload: SessionUpdatePayload) => void;

}

// All events the CLIENT can send TO the SERVER
interface ClientToServerEvents {
  joinSession: (sessionId: string) => void;
  testSession: (data: { sessionId: string,name: string }) => void;
  sendMessage: (payload: { sessionId: string; message: string, name: string }) => void;
  sendRoll: (payload: {sessionId:string; dies: Die[],modifierChunk:{}, name: string}) => void;
  sendInitiative: (payload: {sessionId:string; name: string}) => void;


}


export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  backendUrl,
  {
    autoConnect: true,
  }
);