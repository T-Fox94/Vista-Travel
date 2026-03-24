import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLoyaltyTier, getNextTier, type LoyaltyTier } from "./vista-store";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
  loyaltyPoints?: number;
  totalEarned?: number;
  totalRedeemed?: number;
  memberSince?: string;
}

export interface LoyaltyRewardsInfo {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier;
  pointsToNextTier: number;
  pointsPerDollar: number;
  memberSince: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  updateAvatar: (avatarDataUrl: string) => Promise<{ success: boolean; error?: string }>;
  getLoyaltyInfo: () => LoyaltyRewardsInfo;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  phone?: string;
  password: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (identifier: string, password: string) => {
        set({ isLoading: true });

        try {
          // Send either email or username depending on identifier format
          const payload: any = { action: 'login', password };
          if (identifier.includes && identifier.includes('@')) payload.email = identifier;
          else payload.username = identifier;

          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: data.user,
              isAuthenticated: true,
              isLoading: false
            });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: data.error || "Login failed" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Connection error. Please try again." };
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });

        try {
          const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'register', ...data }),
          });

          const result = await response.json();

          if (result.success) {
            set({
              user: result.user,
              isAuthenticated: true,
              isLoading: false
            });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: result.error || "Registration failed" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Connection error. Please try again." };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true });

        // Simulate API call (password reset not implemented yet)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        set({ isLoading: false });
        return { success: true };
      },

      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true });

        const currentUser = get().user;
        if (!currentUser) {
          set({ isLoading: false });
          return { success: false, error: "User not found" };
        }

        try {
          const response = await fetch('/api/auth', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, ...data }),
          });

          const result = await response.json();

          if (result.success) {
            set({ user: result.user, isLoading: false });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: result.error || "Update failed" };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: "Connection error. Please try again." };
        }
      },

      updateAvatar: async (avatarDataUrl: string) => {
        const currentUser = get().user;
        if (!currentUser) {
          return { success: false, error: "User not found" };
        }

        try {
          const response = await fetch('/api/auth', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, avatar: avatarDataUrl }),
          });

          const result = await response.json();

          if (result.success) {
            set({ user: result.user });
            return { success: true };
          }

          return { success: false, error: result.error || "Update failed" };
        } catch (error) {
          return { success: false, error: "Connection error. Please try again." };
        }
      },

      refreshUser: async () => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          const response = await fetch(`/api/auth?userId=${currentUser.id}`);
          const result = await response.json();

          if (result.success) {
            set({ user: result.user });
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },

      getLoyaltyInfo: () => {
        const currentUser = get().user;
        if (!currentUser) {
          return {
            currentPoints: 0,
            totalEarned: 0,
            totalRedeemed: 0,
            currentTier: getLoyaltyTier(0),
            nextTier: getNextTier(0),
            pointsToNextTier: 1000,
            pointsPerDollar: 10,
            memberSince: new Date().toISOString(),
          };
        }

        const loyaltyPoints = currentUser.loyaltyPoints ?? 0;
        const totalEarned = currentUser.totalEarned ?? 0;
        const totalRedeemed = currentUser.totalRedeemed ?? 0;
        const memberSince = currentUser.memberSince ?? currentUser.createdAt ?? new Date().toISOString();

        const currentTier = getLoyaltyTier(loyaltyPoints);
        const nextTier = getNextTier(loyaltyPoints);
        const pointsToNextTier = nextTier ? nextTier.minPoints - loyaltyPoints : 0;

        return {
          currentPoints: loyaltyPoints,
          totalEarned,
          totalRedeemed,
          currentTier,
          nextTier,
          pointsToNextTier,
          pointsPerDollar: 10,
          memberSince,
        };
      },
    }),
    {
      name: "vista-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
