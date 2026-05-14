'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatCurrency';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, updateUser } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('🔌 Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (connected && user?._id) {
      socketRef.current?.emit('joinPersonal', { userId: user._id });
    }
  }, [connected, user?._id]);

  useEffect(() => {
    if (!socketRef.current || !user) return;
    
    const handleWalletUpdate = ({ newBalance }) => {
      updateUser({ ...user, walletBalance: newBalance });
      // Only show toast if it's an increase (refund)
      if (newBalance > user.walletBalance) {
        toast.success(`Outbid Refund! Wallet balance is now ${formatCurrency(newBalance, user.currency)}`, { icon: '💰' });
      }
    };

    socketRef.current.on('walletUpdated', handleWalletUpdate);
    return () => socketRef.current.off('walletUpdated', handleWalletUpdate);
  }, [user, updateUser]);

  const joinAuction = (auctionId) => {
    socketRef.current?.emit('joinAuction', { auctionId, userId: user?._id });
  };

  const leaveAuction = (auctionId) => {
    socketRef.current?.emit('leaveAuction', { auctionId });
  };

  const placeBid = (auctionId, amount) => {
    socketRef.current?.emit('placeBid', { auctionId, userId: user?._id, amount });
  };

  const onEvent = (event, handler) => {
    socketRef.current?.on(event, handler);
    return () => socketRef.current?.off(event, handler);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, joinAuction, leaveAuction, placeBid, onEvent }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
