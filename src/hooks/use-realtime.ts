"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";

// WebSocket server URL (uses gateway with XTransformPort)
const SOCKET_URL = "/";
const SOCKET_PORT = 3003;

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  fullMessage?: string;
  relatedId?: string;
  relatedType?: string;
}

interface BookingUpdate {
  type: string;
  booking?: {
    id: string;
    bookingId: string;
    type: string;
    status: string;
  };
  bookingId?: string;
  status?: string;
  message?: string;
}

interface TicketUpdate {
  type: string;
  ticket?: {
    id: string;
    ticketNumber: string;
    bookingId: string;
    type: string;
  };
  ticketId?: string;
  ticketNumber?: string;
}

interface UseRealtimeOptions {
  userId?: string;
  role?: string;
  onNotification?: (notification: Notification) => void;
  onBookingUpdate?: (update: BookingUpdate) => void;
  onTicketUpdate?: (update: TicketUpdate) => void;
  onStatsUpdate?: (stats: any) => void;
  onChatMessage?: (message: { from: string; message: string; timestamp: string }) => void;
}

export function useRealtime({
  userId,
  role,
  onNotification,
  onBookingUpdate,
  onTicketUpdate,
  onStatsUpdate,
  onChatMessage,
}: UseRealtimeOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    // Connect via gateway with XTransformPort
    socketRef.current = io(`${SOCKET_URL}?XTransformPort=${SOCKET_PORT}`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on("connect", () => {
      console.log("🔌 Connected to real-time service");
      setIsConnected(true);
      setConnectionError(null);

      // Register user
      socket.emit("register", { userId, role: role || "CLIENT" });
    });

    socket.on("disconnect", () => {
      console.log("🔌 Disconnected from real-time service");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionError(error.message);
    });

    socket.on("registered", (data) => {
      console.log("✅ Registered with real-time service:", data.socketId);
    });

    socket.on("heartbeat", (data) => {
      // Keep alive
    });

    // Notification events
    socket.on("notification", (notification: Notification) => {
      console.log("🔔 Notification received:", notification);
      onNotification?.(notification);
    });

    // Booking events
    socket.on("booking-update", (update: BookingUpdate) => {
      console.log("📋 Booking update:", update);
      onBookingUpdate?.(update);
    });

    socket.on("new-booking", (booking: any) => {
      console.log("🎫 New booking (staff):", booking);
      onBookingUpdate?.({ type: "new-booking", booking });
    });

    // Ticket events
    socket.on("ticket-update", (update: TicketUpdate) => {
      console.log("🎟️ Ticket update:", update);
      onTicketUpdate?.(update);
    });

    // Stats events
    socket.on("stats-update", (stats: any) => {
      console.log("📊 Stats update:", stats);
      onStatsUpdate?.(stats);
    });

    // Chat events
    socket.on("chat-message", (message: any) => {
      console.log("💬 Chat message:", message);
      onChatMessage?.(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, role]);

  // Send notification to a user
  const sendNotification = useCallback((targetUserId: string, notification: Notification) => {
    socketRef.current?.emit("send-notification", { userId: targetUserId, notification });
  }, []);

  // Broadcast notification to all
  const broadcastNotification = useCallback((notification: Omit<Notification, "id">) => {
    socketRef.current?.emit("broadcast-notification", { notification });
  }, []);

  // Notify booking created
  const notifyBookingCreated = useCallback((booking: any) => {
    socketRef.current?.emit("booking-created", { userId, booking });
  }, [userId]);

  // Notify booking status change
  const notifyBookingStatusChanged = useCallback((bookingId: string, status: string, message?: string) => {
    socketRef.current?.emit("booking-status-changed", { userId, bookingId, status, message });
  }, [userId]);

  // Notify ticket issued
  const notifyTicketIssued = useCallback((ticket: any) => {
    socketRef.current?.emit("ticket-issued", { userId, ticket });
  }, [userId]);

  // Notify ticket cancelled
  const notifyTicketCancelled = useCallback((ticketId: string, ticketNumber: string) => {
    socketRef.current?.emit("ticket-cancelled", { userId, ticketId, ticketNumber });
  }, [userId]);

  // Notify new contact message (for staff)
  const notifyNewContactMessage = useCallback((message: any) => {
    socketRef.current?.emit("new-contact-message", message);
  }, []);

  // Request stats update
  const requestStats = useCallback(() => {
    socketRef.current?.emit("request-stats");
  }, []);

  // Join support chat
  const joinSupportChat = useCallback(() => {
    socketRef.current?.emit("join-support-chat", { userId });
  }, [userId]);

  // Send chat message
  const sendChatMessage = useCallback((params: { to?: string, room?: string, message: string, ticketId?: string }) => {
    socketRef.current?.emit("send-message", { from: userId, ...params });
  }, [userId]);

  return {
    isConnected,
    connectionError,
    sendNotification,
    broadcastNotification,
    notifyBookingCreated,
    notifyBookingStatusChanged,
    notifyTicketIssued,
    notifyTicketCancelled,
    notifyNewContactMessage,
    requestStats,
    joinSupportChat,
    sendChatMessage,
  };
}
