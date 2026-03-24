import { Server } from "socket.io";

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

console.log(`🚀 Real-time service running on port ${PORT}`);

// Track connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

io.on("connection", (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  // User authentication/registration
  socket.on("register", (data: { userId: string; role: string }) => {
    connectedUsers.set(data.userId, socket.id);
    socket.join(`user:${data.userId}`);
    socket.join(`role:${data.role}`);
    console.log(`✅ User registered: ${data.userId} (${data.role})`);
    
    // Send confirmation
    socket.emit("registered", { success: true, socketId: socket.id });
  });

  // ============================================
  // NOTIFICATIONS
  // ============================================

  // Send notification to specific user
  socket.on("send-notification", (data: {
    userId: string;
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      fullMessage?: string;
      relatedId?: string;
      relatedType?: string;
    };
  }) => {
    io.to(`user:${data.userId}`).emit("notification", data.notification);
    console.log(`🔔 Notification sent to user: ${data.userId}`);
  });

  // Broadcast notification to all users
  socket.on("broadcast-notification", (data: {
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
    };
  }) => {
    socket.broadcast.emit("notification", data.notification);
    console.log(`📢 Broadcast notification sent`);
  });

  // ============================================
  // BOOKING EVENTS
  // ============================================

  // Notify when booking is created
  socket.on("booking-created", (data: {
    userId: string;
    booking: {
      id: string;
      bookingId: string;
      type: string;
      status: string;
    };
  }) => {
    // Notify the user
    io.to(`user:${data.userId}`).emit("booking-update", {
      type: "created",
      booking: data.booking,
    });
    
    // Notify staff
    io.to("role:STAFF").to("role:ADMIN").emit("new-booking", data.booking);
    console.log(`🎫 Booking created: ${data.booking.bookingId}`);
  });

  // Notify when booking status changes
  socket.on("booking-status-changed", (data: {
    userId: string;
    bookingId: string;
    status: string;
    message?: string;
  }) => {
    io.to(`user:${data.userId}`).emit("booking-update", {
      type: "status-change",
      bookingId: data.bookingId,
      status: data.status,
      message: data.message,
    });
    console.log(`📋 Booking status changed: ${data.bookingId} → ${data.status}`);
  });

  // ============================================
  // TICKET EVENTS
  // ============================================

  // Notify when ticket is issued
  socket.on("ticket-issued", (data: {
    userId: string;
    ticket: {
      id: string;
      ticketNumber: string;
      bookingId: string;
      type: string;
    };
  }) => {
    io.to(`user:${data.userId}`).emit("ticket-update", {
      type: "issued",
      ticket: data.ticket,
    });
    console.log(`🎟️ Ticket issued: ${data.ticket.ticketNumber}`);
  });

  // Notify when ticket is cancelled
  socket.on("ticket-cancelled", (data: {
    userId: string;
    ticketId: string;
    ticketNumber: string;
  }) => {
    io.to(`user:${data.userId}`).emit("ticket-update", {
      type: "cancelled",
      ticketId: data.ticketId,
      ticketNumber: data.ticketNumber,
    });
    console.log(`❌ Ticket cancelled: ${data.ticketNumber}`);
  });

  // ============================================
  // STAFF EVENTS
  // ============================================

  // Staff dashboard stats update
  socket.on("request-stats", () => {
    // In production, this would fetch from database
    const stats = {
      totalBookings: 0,
      pendingBookings: 0,
      todayRevenue: 0,
      activeUsers: connectedUsers.size,
    };
    socket.emit("stats-update", stats);
  });

  // Notify staff of new contact message
  socket.on("new-contact-message", (data: {
    id: string;
    name: string;
    email: string;
    subject: string;
  }) => {
    io.to("role:STAFF").to("role:ADMIN").emit("contact-message", data);
    console.log(`📩 New contact message from: ${data.email}`);
  });

  // ============================================
  // CHAT/MESSAGING (Future)
  // ============================================

  // Join support chat room
  socket.on("join-support-chat", (data: { userId: string }) => {
    socket.join(`support:${data.userId}`);
    // Notify staff
    io.to("role:STAFF").to("role:ADMIN").emit("support-request", {
      userId: data.userId,
      socketId: socket.id,
    });
    console.log(`💬 Support chat initiated: ${data.userId}`);
  });

  // Send chat message
  socket.on("send-message", (data: {
    from: string;
    to?: string;
    room?: string;
    message: string;
  }) => {
    if (data.room) {
      io.to(data.room).emit("chat-message", {
        from: data.from,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    } else if (data.to) {
      io.to(`user:${data.to}`).emit("chat-message", {
        from: data.from,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // ============================================
  // DISCONNECT
  // ============================================

  socket.on("disconnect", () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`👋 User disconnected: ${userId}`);
        break;
      }
    }
  });
});

// Heartbeat to keep connections alive
setInterval(() => {
  io.emit("heartbeat", { timestamp: new Date().toISOString() });
}, 30000);
