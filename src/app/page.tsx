"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plane,
  MapPin,
  Bell,
  Ticket,
  User,
  Search,
  ArrowRight,
  Star,
  Heart,
  Calendar,
  Users,
  Utensils,
  Hotel,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Check,
  Printer,
  Download,
  X,
  MessageSquare,
  Shield,
  Settings,
  BarChart3,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  Home as HomeIcon,
  Compass,
  Send,
  Paperclip,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  UserPlus,
  Camera,
  Save,
  Gift,
  Crown,
  Sparkles,
  Copy,
  Tag,
  Trash2,
  Target,
  Headset,
  Package,
  Scale,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  XCircle,
  CheckCircle2,
  Car,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Book } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PrintableTicket } from "@/components/booking/PrintableTicket";
import BookingModal from "@/components/booking/BookingModal"
import CurrencySelector from "@/components/CurrencySelector";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useVistaStore,
  type PageType,
  type AdminSection,
  type Destination,
  type Flight,
  type Ticket as TicketType,
  type Notification,
  type Voucher,
  loyaltyTiers,
} from "@/store/vista-store";
import { useAuthStore } from "@/store/auth-store";
import { useRealtime } from "@/hooks/use-realtime";
import AuthModal from "@/components/auth/AuthModal";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// Helper function to format time ago
function formatTimeAgo(timestamp: string | Date | undefined): string {
  if (!timestamp) return "N/A";
  const now = new Date();
  const past = new Date(timestamp);

  if (isNaN(past.getTime())) return "Invalid date";

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return past.toLocaleDateString();
}

// Data
const destinations: Destination[] = [
  {
    id: "dest-bali",
    title: "Bali, Indonesia",
    location: "Indonesia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 120,
    price: 850,
    childPrice: 450,
    duration: "7 Days",
    description:
      "Experience the tropical paradise with ancient temples, stunning beaches, rice terraces, and vibrant culture. Includes accommodation, daily breakfast, airport transfers, and guided tours.",
    tags: ["Best Seller", "Beach"],
    mealPlan: "All Inclusive",
    hasRooms: true,
    maxGroupSize: 15,
    availableDates: ["2024-05-15", "2024-06-20", "2024-07-10"],
    transportOptions: [
      { label: "Road transport", price: 0 },
      { label: "Flight transport", price: 250 },
    ],
    accommodationOptions: [
      { label: "Standard room", priceAdjustment: 0 },
      { label: "Deluxe room", priceAdjustment: 120 },
      { label: "Single room", priceAdjustment: 200 },
    ],
    addOns: [
      { label: "Extra excursions", price: 80 },
      { label: "Boat cruise", price: 50 },
    ],
  },
  {
    id: "dest-alps",
    title: "Swiss Alps",
    location: "Switzerland",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 85,
    price: 1200,
    childPrice: 700,
    duration: "5 Days",
    description:
      "Breathtaking mountain views, world-class skiing, charming alpine villages, and luxury resorts. Perfect for adventure seekers and nature lovers.",
    tags: ["Premium", "Adventure"],
    mealPlan: "Half Board",
    hasRooms: true,
    maxGroupSize: 10,
    availableDates: ["2024-12-05", "2025-01-10", "2025-02-15"],
    transportOptions: [
      { label: "Road transport", price: 0 },
      { label: "Private shuttle", price: 150 },
    ],
    accommodationOptions: [
      { label: "Standard chalet", priceAdjustment: 0 },
      { label: "Premium chalet", priceAdjustment: 350 },
    ],
    addOns: [
      { label: "Ski pass (3 days)", price: 180 },
      { label: "Equipment rental", price: 90 },
    ],
  },
  {
    id: "dest-safari",
    title: "Serengeti Safari",
    location: "Tanzania",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    reviews: 42,
    price: 2400,
    childPrice: 1500,
    duration: "10 Days",
    description:
      "Witness the great migration and encounter the Big Five in their natural habitat. Full board accommodation, expert guides, and all park fees included.",
    tags: ["New", "Safari"],
    mealPlan: "Full Board",
    hasRooms: true,
    maxGroupSize: 8,
    availableDates: ["2024-07-20", "2024-08-15", "2024-09-10"],
    transportOptions: [
      { label: "4x4 Jeep", price: 0 },
      { label: "Light aircraft transfer", price: 400 },
    ],
    accommodationOptions: [
      { label: "Standard tented camp", priceAdjustment: 0 },
      { label: "Luxury safari lodge", priceAdjustment: 500 },
    ],
    addOns: [
      { label: "Hot air balloon safari", price: 450 },
      { label: "Maasai village visit", price: 60 },
    ],
  },
  {
    id: "dest-maldives",
    title: "Maldives",
    location: "Maldives",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviews: 68,
    price: 1850,
    childPrice: 1200,
    duration: "6 Days",
    description:
      "Crystal clear waters, overwater bungalows, pristine white sand beaches. Perfect for honeymoons and romantic getaways.",
    tags: ["Honeymoon", "Luxury"],
    mealPlan: "All Inclusive",
    hasRooms: true,
    maxGroupSize: 12,
    availableDates: ["2024-09-01", "2024-10-15", "2024-11-20"],
    transportOptions: [
      { label: "Speedboat transfer", price: 0 },
      { label: "Seaplane transfer", price: 300 },
    ],
    accommodationOptions: [
      { label: "Standard bungalow", priceAdjustment: 0 },
      { label: "Overwater villa", priceAdjustment: 800 },
    ],
    addOns: [
      { label: "Scuba diving session", price: 150 },
      { label: "Sunset dinner cruise", price: 120 },
    ],
  },
  {
    id: "dest-paris",
    title: "Paris, France",
    location: "France",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 156,
    price: 1450,
    childPrice: 900,
    duration: "5 Days",
    description:
      "The city of love awaits with iconic landmarks, world-class cuisine, art museums, and romantic Seine river cruises.",
    tags: ["Romantic", "Culture"],
    mealPlan: "Bed & Breakfast",
    hasRooms: true,
    maxGroupSize: 20,
    availableDates: ["2024-04-10", "2024-05-15", "2024-06-20"],
    transportOptions: [
      { label: "Self-drive", price: 0 },
      { label: "Private chauffeur", price: 350 },
    ],
    accommodationOptions: [
      { label: "Standard hotel", priceAdjustment: 0 },
      { label: "Boutique hotel", priceAdjustment: 250 },
    ],
    addOns: [
      { label: "Eiffel Tower dinner", price: 200 },
      { label: "Louvre skip-the-line", price: 55 },
    ],
  },
  {
    id: "dest-tokyo",
    title: "Tokyo, Japan",
    location: "Japan",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 94,
    price: 1680,
    childPrice: 1100,
    duration: "8 Days",
    description:
      "Experience the perfect blend of ancient traditions and cutting-edge technology. Temples, sushi, shopping, and cherry blossoms.",
    tags: ["Popular", "Culture"],
    mealPlan: "Half Board",
    hasRooms: true,
    maxGroupSize: 18,
    availableDates: ["2024-03-25", "2024-04-10", "2024-05-05"],
    transportOptions: [
      { label: "Public transport pass", price: 0 },
      { label: "Private car service", price: 500 },
    ],
    accommodationOptions: [
      { label: "Standard room", priceAdjustment: 0 },
      { label: "Ryokan experience", priceAdjustment: 400 },
    ],
    addOns: [
      { label: "Mt. Fuji day trip", price: 150 },
      { label: "Tea ceremony experience", price: 70 },
    ],
  },
];

const localAirports = [
  { code: "LUN", city: "Lusaka" },
  { code: "LVI", city: "Livingstone" },
  { code: "NDLI", city: "Ndola" },
  { code: "KIW", city: "Kitwe" },
  { code: "MNS", city: "Mansa" },
  { code: "SLI", city: "Solwezi" },
];

const internationalAirports = [
  { code: "JNB", city: "Johannesburg" },
  { code: "NBO", city: "Nairobi" },
  { code: "DXB", city: "Dubai" },
  { code: "LHR", city: "London" },
  { code: "DOH", city: "Doha" },
];

const airlines = [
  { name: "Proflight Zambia", code: "P0", color: "emerald", basePrice: 185 },
  { name: "South African Airways", code: "SA", color: "blue", basePrice: 210 },
  { name: "Ethiopian Airlines", code: "ET", color: "orange", basePrice: 195 },
  { name: "Kenya Airways", code: "KQ", color: "red", basePrice: 225 },
];

const popularRoutes = [
  { from: "LUN", fromCity: "Lusaka", to: "LVI", toCity: "Livingstone", price: 185, duration: "2h 30m", stops: 0 },
  { from: "LUN", fromCity: "Lusaka", to: "JNB", toCity: "Johannesburg", price: 320, duration: "2h 45m", stops: 0 },
  { from: "LUN", fromCity: "Lusaka", to: "NBO", toCity: "Nairobi", price: 285, duration: "2h 15m", stops: 0 },
  { from: "LUN", fromCity: "Lusaka", to: "DXB", toCity: "Dubai", price: 650, duration: "8h 30m", stops: 1 },
];

// Navigation Component
export function Navigation() {
  const { currentPage, setPage, tickets, viewedTicketIds, notifications, unreadNotificationCount, markAllNotificationsRead, deleteAllNotifications, markNotificationRead, setAdminSection, markTicketViewed, markAllTicketsViewed, wishlist, addNotification } = useVistaStore();

  // Count unviewed, non-cancelled tickets using persistent viewedTicketIds
  const unviewedTicketsCount = tickets.filter(t => !viewedTicketIds.includes(t.id) && t.status !== "cancelled").length;
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Global Realtime listener
  useRealtime({
    userId: user?.id,
    role: user?.role,
    onNotification: (notification) => {
      // Add notification to the global store
      addNotification(notification as any);
      // Optionally show a toast for high priority ones, or just let the badge update
      toast.info(`New Notification: ${notification.title}`);
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: { label: string; page: PageType }[] = [
    { label: "Home", page: "home" },
    { label: "Flights", page: "flights" },
    { label: "Destinations", page: "destinations" },
    { label: "Contact", page: "contact" },
  ];

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out successfully");
  };

  return (
    <nav
      className={cn(
        "fixed w-full z-50 transition-all duration-300",
        isScrolled
          ? "bg-stone-900/95 backdrop-blur-md shadow-lg"
          : "bg-stone-900/80 backdrop-blur-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage("home")}
            className="text-2xl md:text-3xl font-bold text-white tracking-tighter font-serif italic"
          >
            Vista.
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 text-sm font-medium text-white/90">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={cn(
                  "hover:text-emerald-400 transition-colors",
                  currentPage === item.page && "text-emerald-400"
                )}
              >
                {item.label}
              </button>
            ))}
            {/* Admin link - only show when authenticated */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setPage("admin");
                  if (user?.role === 'ADMIN') setAdminSection("dashboard");
                }}
                className={cn(
                  "hover:text-emerald-400 transition-colors",
                  currentPage === "admin" && "text-emerald-400"
                )}
              >
                Dashboard
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <CurrencySelector />
            {/* Auth-dependent buttons - only show when logged in */}
            {isAuthenticated ? (
              <>
                {/* Quick action icons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage("tickets")}
                    className="relative text-white hover:text-emerald-400 transition-colors p-1 hidden md:block"
                  >
                    <Ticket className="w-5 h-5" />
                    {unviewedTicketsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center animate-pulse text-[10px] md:text-xs">
                        {unviewedTicketsCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative text-white hover:text-emerald-400 transition-colors p-1">
                        <Bell className="w-5 h-5" />
                        {unreadNotificationCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center animate-pulse text-[10px]">
                            {unreadNotificationCount}
                          </span>
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifications</span>
                        {unreadNotificationCount > 0 && (
                          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadNotificationCount} new</span>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length > 0 ? (
                        <>
                          <div className="max-h-72 overflow-y-auto">
                            {notifications.slice(0, 5).map((notification, index) => (
                              <div key={notification.id}>
                                <DropdownMenuItem
                                  className="flex items-start gap-2 py-2.5 px-3 cursor-pointer"
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    markNotificationRead(notification.id);
                                    setPage("admin");
                                    setAdminSection("notifications");
                                  }}
                                >
                                  <div className={cn(
                                    "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                    notification.type === "booking" && "bg-emerald-500",
                                    notification.type === "offer" && "bg-blue-500",
                                    notification.type === "payment" && "bg-amber-500",
                                    notification.type === "system" && "bg-muted/30",
                                    notification.isRead && "opacity-50"
                                  )}></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className={cn("text-sm font-medium truncate", notification.isRead && "text-muted-foreground")}>{notification.title}</span>
                                      {!notification.isRead && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded shrink-0">NEW</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notification.message}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-[11px] text-muted-foreground/70">
                                        {formatTimeAgo(notification.timestamp)}
                                      </span>
                                      <span className="text-[10px] text-emerald-600">Click to view details →</span>
                                    </div>
                                  </div>
                                </DropdownMenuItem>
                                {index < Math.min(notifications.length, 5) - 1 && <DropdownMenuSeparator />}
                              </div>
                            ))}
                          </div>
                          <DropdownMenuSeparator />
                          {/* Action Buttons */}
                          <div className="flex gap-2 p-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAllNotificationsRead();
                                toast.success("All notifications marked as read");
                              }}
                              className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-md transition-colors"
                            >
                              Mark All Read
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAllNotifications();
                                toast.success("All notifications deleted");
                              }}
                              className="flex-1 text-xs bg-red-500 hover:bg-red-600 text-white py-1.5 px-3 rounded-md transition-colors"
                            >
                              Delete All
                            </button>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-center text-emerald-600 font-medium cursor-pointer"
                            onSelect={() => {
                              setPage("admin");
                              setAdminSection("notifications");
                            }}
                          >
                            View All Notifications
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <div className="py-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* User Dropdown with Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-white hover:text-emerald-400 transition-colors py-1 px-2 rounded-full hover:bg-card/10">
                      <Avatar className="w-8 h-8 border-2 border-emerald-500">
                        <AvatarImage src={user?.avatar} alt={user?.firstName} />
                        <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm font-medium">{user?.firstName}</span>
                      <ChevronDown className="w-4 h-4 hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => {
                      setPage("admin");
                      setAdminSection("profile");
                    }}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => {
                      setPage("admin");
                      setAdminSection("settings");
                    }}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => setLoginModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full font-semibold transition-all"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}

            {/* Dashboard Quick Access (Mobile) */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setPage("admin");
                  setAdminSection("dashboard");
                }}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                title="Go to Dashboard"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-1 ml-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop for click-outside closure */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[-1] md:hidden" 
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4"
            >
              <div className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.page}
                    onClick={() => {
                      setPage(item.page);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "text-left text-white/90 hover:text-emerald-400 transition-colors py-2",
                      currentPage === item.page && "text-emerald-400"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                {/* Auth section in mobile menu */}
                {isAuthenticated ? (
                  <div className="pt-2 border-t border-white/20">
                    {/* User info with Avatar */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-9 h-9 border-2 border-emerald-500">
                          <AvatarImage src={user?.avatar} alt={user?.firstName} />
                          <AvatarFallback className="bg-emerald-600 text-white text-xs font-semibold">
                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-white text-sm font-medium">{user?.firstName} {user?.lastName}</span>
                          <p className="text-white/60 text-xs">{user?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm bg-card/10 px-3 py-1.5 rounded-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/20">
                    <Button
                      onClick={() => {
                        setLoginModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </nav>
  );
}

// Hero Section
function HeroSection() {
  const { setPage } = useVistaStore();

  return (
    <header className="relative h-screen flex items-center justify-center text-white pt-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80')`,
        }}
      />
      <div className="relative text-center px-4 max-w-4xl mx-auto z-10">
        <span className="inline-block py-1 px-3 border border-white/30 rounded-full text-xs uppercase tracking-widest mb-6 backdrop-blur-sm">
          Travel & Tours
        </span>
        <h1 className="text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight font-serif">
          Discover the <br />
          <span className="italic text-emerald-300">Unseen</span> World
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
          Curated experiences for the modern explorer. From Zambia to the world.
        </p>
        <div className="flex justify-center space-x-4 flex-wrap gap-4">
          <Button
            onClick={() => setPage("destinations")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold text-lg"
          >
            Explore Destinations
          </Button>
          <Button
            onClick={() => setPage("flights")}
            variant="outline"
            className="bg-card/10 hover:bg-card/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/30"
          >
            Book Flights
          </Button>
          <Button
            onClick={() => setPage("contact")}
            variant="outline"
            className="bg-card/10 hover:bg-card/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg border border-white/30"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </header>
  );
}

// Stats Section
function StatsSection() {
  const stats = [
    { value: "120+", label: "Countries" },
    { value: "5k+", label: "Tours" },
    { value: "10k+", label: "Happy Customers" },
    { value: "24/7", label: "Support" },
  ];

  return (
    <section className="py-12 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div
            key={index}
          >
            <h3 className="text-4xl font-bold text-emerald-600 font-serif">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-500 uppercase tracking-wide mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Featured Destinations
function FeaturedDestinations() {
  const { setPage, setSelectedDestination, convertFromUSD, currency: activeCurrency } = useVistaStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencySymbol = activeCurrency === "USD" ? "$" : activeCurrency === "EUR" ? "€" : activeCurrency === "GBP" ? "£" : activeCurrency === "ZMW" ? "ZK" : "R";
  const featured = destinations.slice(0, 3);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground font-serif">
          Popular Destinations
        </h2>
        <p className="text-gray-500">
          Explore our most booked locations this season.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featured.map((dest, index) => (
          <div
            key={dest.id}
            className="group cursor-pointer"
            onClick={() => {
              setSelectedDestination(dest);
              setPage("destinations");
            }}
          >
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg mb-4">
              <img
                src={dest.image}
                alt={dest.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {dest.title}
                </h3>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {dest.rating} ({dest.reviews} reviews)
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-foreground">
                {!mounted ? `$${dest.price.toLocaleString()}` : (
                  <>
                    {currencySymbol}{convertFromUSD(dest.price).toLocaleString()}
                  </>
                )}
              </span>
              <span className="text-sm text-gray-500">{dest.duration}</span>
              <div>
                <BookingModal
                  type="TOUR"
                  initialData={{
                    ...dest,
                    basePrice: dest.price, 
                    destinationId: dest.id, 
                    hotelName: dest.title,
                    roomType: "Double Standard",
                  }}
                  trigger={<Button variant="outline" className="ml-4">Book Tour</Button>}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Home Page
function HomePage() {
  return (
    <section>
      <HeroSection />
      <StatsSection />
      <FeaturedDestinations />
    </section>
  );
}

// Flights Page
function FlightsPage() {
  const { tripType, setTripType, flightType, setFlightType, convertFromUSD, currency: activeCurrency } = useVistaStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencySymbol = activeCurrency === "USD" ? "$" : activeCurrency === "EUR" ? "€" : activeCurrency === "GBP" ? "£" : activeCurrency === "ZMW" ? "ZK" : "R";
  const { isAuthenticated } = useAuthStore();
  const [fromAirport, setFromAirport] = useState("LUN");
  const [toAirport, setToAirport] = useState("LVI");
  const [departureDate, setDepartureDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [returnDate, setReturnDate] = useState("");
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const airports = flightType === "local" ? localAirports : [...localAirports.slice(0, 2), ...internationalAirports];

  const swapAirports = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const searchFlights = () => {
    if (!fromAirport || !toAirport || !departureDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (fromAirport === toAirport) {
      toast.error("Origin and destination cannot be the same");
      return;
    }

    const flights: Flight[] = airlines.map((airline, index) => ({
      id: `flight-${index}`,
      airline: airline.name,
      code: `${airline.code} ${100 + index}`,
      from: fromAirport,
      to: toAirport,
      fromCity: airports.find((a) => a.code === fromAirport)?.city || "",
      toCity: airports.find((a) => a.code === toAirport)?.city || "",
      departTime: `${(8 + index * 3).toString().padStart(2, "0")}:00`,
      arriveTime: `${(10 + index * 3).toString().padStart(2, "0")}:30`,
      duration: "2h 30m",
      price: airline.basePrice + (flightType === "international" ? 100 : 0),
      stops: 0,
    }));

    setSearchResults(flights);
    setShowResults(true);
    toast.success("Found " + flights.length + " flights");
  };

  const handleBookFlight = (flight: Flight) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to book a flight");
      setAuthModalOpen(true);
      return;
    }
    setSelectedFlight(flight);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingModalOpen(false);
    toast.success("Booking confirmed! Your e-ticket has been sent to your email.");
  };

  return (
    <section className="pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-block mb-2 md:mb-4">
            <Plane className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6 font-serif">
            Book Your Flight
          </h1>
          <p className="text-sm md:text-xl text-emerald-100 max-w-2xl mx-auto">
            Fly local within Zambia or explore international destinations. Best
            prices guaranteed with instant e-ticket delivery.
          </p>
        </div>
      </div>

      {/* Search Box */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-5xl mx-auto -mt-16 relative z-10 border border-border">
          {/* Trip Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-stone-100 rounded-full p-1.5 inline-flex">
              {["oneWay", "roundTrip", "multiCity"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type as typeof tripType)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-semibold transition-all",
                    tripType === type
                      ? "bg-emerald-600 text-white"
                      : "text-stone-600 hover:bg-stone-200"
                  )}
                >
                  {type === "oneWay"
                    ? "One Way"
                    : type === "roundTrip"
                      ? "Round Trip"
                      : "Multi-City"}
                </button>
              ))}
            </div>
          </div>

          {/* Flight Type */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              {["local", "international"].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    value={type}
                    checked={flightType === type}
                    onChange={() => setFlightType(type as typeof flightType)}
                    className="w-4 h-4 text-emerald-600"
                  />
                  <span className="ml-2 text-stone-700 font-medium">
                    {type === "local" ? "🇿🇲 Local (Zambia)" : "🌍 International"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="lg:col-span-1">
              <Label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                From
              </Label>
              <Select value={fromAirport} onValueChange={setFromAirport}>
                <SelectTrigger className="w-full bg-muted/30 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      {airport.code} - {airport.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-1 flex items-end justify-center pb-3">
              <button
                onClick={swapAirports}
                className="w-10 h-10 bg-emerald-100 hover:bg-emerald-200 rounded-full flex items-center justify-center transition-colors"
                title="Swap"
              >
                <ArrowRight className="w-4 h-4 text-emerald-600 rotate-90" />
              </button>
            </div>

            <div className="lg:col-span-1">
              <Label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                To
              </Label>
              <Select value={toAirport} onValueChange={setToAirport}>
                <SelectTrigger className="w-full bg-muted/30 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {airports.map((airport) => (
                    <SelectItem key={airport.code} value={airport.code}>
                      {airport.code} - {airport.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-1">
              <Label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                Departure
              </Label>
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full bg-muted/30 border-gray-200"
              />
            </div>

            <div className="lg:col-span-1">
              <Label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                Passengers
              </Label>
              <Select value={passengers} onValueChange={setPassengers}>
                <SelectTrigger className="w-full bg-muted/30 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Passenger{num > 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {tripType === "roundTrip" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-1">
                <Label className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                  Return Date
                </Label>
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-muted/30 border-gray-200"
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <Checkbox />
                <span className="ml-2 text-sm text-stone-600">
                  Direct flights only
                </span>
              </label>
              <label className="flex items-center">
                <Checkbox />
                <span className="ml-2 text-sm text-stone-600">
                  Include nearby airports
                </span>
              </label>
            </div>
            <Button
              onClick={searchFlights}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/30"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Flights
            </Button>
          </div>
        </div>

        {/* Flight Results */}
        {showResults && (
          <div className="max-w-5xl mx-auto mt-12">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Plane className="w-5 h-5 text-emerald-600" />
                Available Flights
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort by:</span>
                <Select defaultValue="price">
                  <SelectTrigger className="w-40 bg-card border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price (Low to High)</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {searchResults.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Plane className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {flight.airline}
                        </p>
                        <p className="text-sm text-gray-500">{flight.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {flight.departTime}
                        </p>
                        <p className="text-sm text-gray-500">{flight.from}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-400 mb-1">
                          {flight.duration}
                        </p>
                        <div className="w-24 h-0.5 bg-gray-300 relative">
                          <Plane className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Direct</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-foreground">
                          {flight.arriveTime}
                        </p>
                        <p className="text-sm text-gray-500">{flight.to}</p>
                      </div>
                    </div>

                    <div className="text-center lg:text-right">
                      <p className="text-2xl font-bold text-emerald-600">
                        {!mounted ? `$${flight.price.toLocaleString()}` : (
                          <>
                            {currencySymbol}{convertFromUSD(flight.price).toLocaleString()}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-400">per person</p>
                    </div>

                    <BookingModal
                      type="FLIGHT"
                      initialData={{
                        basePrice: flight.price,
                        flightId: flight.id,
                        flightCode: flight.code,
                        fromAirport: flight.from,
                        toAirport: flight.to,
                        fromCity: flight.fromCity,
                        toCity: flight.toCity,
                      }}
                      trigger={
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-semibold">
                          Select
                        </Button>
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Popular Routes */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Popular Routes from Zambia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl shadow-lg p-6 border border-border hover:shadow-xl transition-all cursor-pointer"
                onClick={() => {
                  setFromAirport(route.from);
                  setToAirport(route.to);
                  setDepartureDate(new Date().toISOString().split("T")[0]);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {route.from}
                    </p>
                    <p className="text-sm text-gray-500">{route.fromCity}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600" />
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {route.to}
                    </p>
                    <p className="text-sm text-gray-500">{route.toCity}</p>
                  </div>
                </div>
                <p className="text-emerald-600 font-bold text-lg">
                  {!mounted ? `From $${route.price.toLocaleString()}` : `From ${currencySymbol}${convertFromUSD(route.price).toLocaleString()}`}
                </p>
                <p className="text-sm text-gray-500">
                  {route.duration} • {route.stops === 0 ? "Direct" : "1 Stop"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* inline booking dialog removed — BookingModal is used on cards */}
    </section>
  );
}

// Destinations Page
function DestinationsPage() {
  const { setSelectedDestination, wishlist, toggleWishlist, setWishlist, convertFromUSD, currency: activeCurrency } = useVistaStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencySymbol = activeCurrency === "USD" ? "$" : activeCurrency === "EUR" ? "€" : activeCurrency === "GBP" ? "£" : activeCurrency === "ZMW" ? "ZK" : "R";
  const { isAuthenticated, user } = useAuthStore();
  const [filter, setFilter] = useState("all");
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWishlist = async () => {
        try {
          const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.id)}`);
          const data = await res.json();
          if (data.success && data.wishlist) {
            setWishlist(data.wishlist);
          }
        } catch (err) {
          console.error("Failed to fetch wishlist", err);
        }
      };
      fetchWishlist();
    }
  }, [isAuthenticated, user, setWishlist]);

  const openDestinationModal = (dest: Destination) => {
    setSelectedDest(dest);
    setSelectedDestination(dest);
    setDestinationModalOpen(true);
  };

  const handleToggleWishlist = async (e: React.MouseEvent, dest: Destination) => {
    e.stopPropagation();
    const { isAuthenticated: auth, user: authUser } = useAuthStore.getState();
    if (!auth || !authUser) {
      toast.error("Please sign in to add items to wishlist");
      setAuthModalOpen(true);
      return;
    }

    const isCurrentlyInList = wishlist.some(d => d.id === dest.id);

    try {
      const { user: authUser } = useAuthStore.getState();
      if (isCurrentlyInList) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(authUser!.id)}&destinationId=${encodeURIComponent(dest.id)}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success) {
          toggleWishlist(dest);
          toast.success("Removed from wishlist");
        } else {
          toast.error(data.error || "Failed to remove from wishlist");
        }
      } else {
        // Add to wishlist
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: authUser!.id, destinationId: dest.id }),
        });
        const data = await res.json();
        if (data.success) {
          toggleWishlist(dest);
          toast.success("Added to wishlist");
        } else {
          toast.error(data.error || "Failed to add to wishlist");
        }
      }
    } catch (err) {
      toast.error("Network error updating wishlist");
    }
  };

  const isWishlisted = (id: string) => wishlist.some(d => d.id === id);

  const filteredDestinations =
    filter === "all"
      ? destinations
      : destinations.filter((d) =>
        d.tags.map((t) => t.toLowerCase()).includes(filter.toLowerCase())
      );

  const filters = [
    { label: "All", value: "all" },
    { label: "Adventure", value: "adventure" },
    { label: "Beach", value: "beach" },
    { label: "Culture", value: "culture" },
    { label: "Safari", value: "safari" },
    { label: "Luxury", value: "luxury" },
  ];

  return (
    <section className="pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <div className="inline-block mb-2 md:mb-4">
            <Compass className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6 font-serif">
            Explore Destinations
          </h1>
          <p className="text-sm md:text-xl text-purple-100 max-w-2xl mx-auto">
            Discover amazing tour packages and experiences around the world. From
            adventure to relaxation, we have it all.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="bg-card rounded-2xl shadow-lg p-6 mb-8 border border-border">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    filter === f.value
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-emerald-100"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search destinations..."
                className="w-48 bg-muted/30 border-gray-200"
              />
              <Select>
                <SelectTrigger className="w-36 bg-muted/30 border-gray-200">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="under500">Under $500</SelectItem>
                  <SelectItem value="500-1000">$500 - $1000</SelectItem>
                  <SelectItem value="1000-2000">$1000 - $2000</SelectItem>
                  <SelectItem value="over2000">Over $2000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((dest, index) => (
            <div
              key={dest.id}
              className="group bg-card rounded-3xl shadow-lg overflow-hidden border border-border hover:shadow-xl transition-all cursor-pointer"
              onClick={() => openDestinationModal(dest)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold uppercase">
                    {dest.tags[0]}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  {isAuthenticated && (
                    <button
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                        isWishlisted(dest.id)
                          ? "bg-red-500 text-white"
                          : "bg-card/90 hover:bg-red-500 hover:text-white"
                      )}
                      onClick={(e) => handleToggleWishlist(e, dest)}
                    >
                      <Heart className={cn(
                        "w-4 h-4",
                        isWishlisted(dest.id) && "fill-current"
                      )} />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {dest.title}
                  </h3>
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold ml-1">
                      {dest.rating}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {dest.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-400 text-xs">From</span>
                    <p className="text-2xl font-bold text-emerald-600">
                      {!mounted ? `$${dest.price.toLocaleString()}` : (
                        <>
                          {currencySymbol}{convertFromUSD(dest.price).toLocaleString()}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{dest.duration}</p>
                    <p className="text-xs text-gray-400">{dest.mealPlan}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button className="flex-1 bg-card border border-border text-foreground py-3 rounded-xl font-semibold hover:bg-muted">
                    View Details
                  </Button>
                  <BookingModal
                    type="TOUR"
                    initialData={{ 
                      ...dest,
                      basePrice: dest.price, 
                      destinationId: dest.id, 
                      hotelName: dest.title,
                    }}
                    trigger={<Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold">Book Tour</Button>}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Destination Modal */}
      <Dialog open={destinationModalOpen} onOpenChange={setDestinationModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDest && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedDest.title}</DialogTitle>
              </DialogHeader>
              <div className="relative h-64 -mx-6 -mt-6">
                <img
                  src={selectedDest.image}
                  alt={selectedDest.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground font-serif">
                      {selectedDest.title}
                    </h2>
                    <div className="flex items-center text-yellow-500 mt-2">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="ml-1 font-semibold">
                        {selectedDest.rating}
                      </span>
                      <span className="text-gray-400 ml-2 text-sm">
                        ({selectedDest.reviews} reviews)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">From</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {!mounted ? `$${selectedDest.price.toLocaleString()}` : (
                        <>
                          {currencySymbol}{convertFromUSD(selectedDest.price).toLocaleString()}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600">{selectedDest.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Calendar className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="font-semibold">{selectedDest.duration}</p>
                    <p className="text-xs text-gray-400">Duration</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Users className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="font-semibold">Group</p>
                    <p className="text-xs text-gray-400">Type</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Utensils className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="font-semibold">Meals</p>
                    <p className="text-xs text-gray-400">Included</p>
                  </div>
                  <div className="text-center p-4 bg-muted/30 rounded-xl">
                    <Hotel className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <p className="font-semibold">Hotel</p>
                    <p className="text-xs text-gray-400">4-5 Star</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-stretch gap-3">
                    <BookingModal 
                      type="TOUR"
                      initialData={{
                        ...selectedDest,
                        destinationId: selectedDest.id,
                        title: selectedDest.title,
                        basePrice: selectedDest.price,
                        hotelName: selectedDest.title,
                        roomType: "Double Standard",
                      }}
                      trigger={
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-2xl font-bold text-xl shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.02] transition-all duration-200"
                        >
                          Book Now
                        </Button>
                      }
                    />
                    {isAuthenticated && (
                      <button
                        className={cn(
                          "flex-shrink-0 flex items-center justify-center w-14 rounded-2xl border-2 transition-all duration-200",
                          isWishlisted(selectedDest.id)
                            ? "bg-red-50 border-red-400 text-red-500 shadow-lg shadow-red-200"
                            : "border-stone-200 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50"
                        )}
                        onClick={(e) => handleToggleWishlist(e, selectedDest)}
                        title={isWishlisted(selectedDest.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                      >
                        <Heart className={cn("w-6 h-6", isWishlisted(selectedDest.id) && "fill-current")} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  );
}

// Contact Page
function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Message sent! We'll get back to you within 24 hours.");
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const faqItems = [
    {
      question: "How do I book a tour?",
      answer:
        "You can book directly through our website by selecting your desired tour, choosing your dates, and completing the payment process. You'll receive a confirmation email immediately.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit/debit cards (Visa, MasterCard), PayPal, bank transfers, and mobile money (Airtel Money, MTN Mobile Money) for local Zambian customers.",
    },
    {
      question: "Can I cancel or modify my booking?",
      answer:
        "Yes! You can cancel or modify your booking up to 48 hours before departure for a full refund. Changes within 48 hours may incur a fee. Contact our support team for assistance.",
    },
    {
      question: "Do you provide travel insurance?",
      answer:
        "Yes, we partner with leading insurance providers to offer comprehensive travel insurance. You can add it during checkout or contact us to arrange it separately.",
    },
  ];

  return (
    <section className="pt-20">
      {/* Header */}
      <div className="bg-stone-900 text-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-6 font-serif">
            Get in Touch
          </h1>
          <p className="text-sm md:text-xl text-gray-300 max-w-2xl mx-auto">
            Have questions? We're here to help you plan your perfect journey.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="rounded-3xl shadow-xl p-8 lg:p-12 border-0">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Send us a Message
            </h2>
            <p className="text-gray-500 mb-8">We'll respond within 24 hours</p>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-sm font-semibold text-stone-700 mb-2">
                    First Name *
                  </Label>
                  <Input
                    required
                    className="bg-muted/30 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-stone-700 mb-2">
                    Last Name *
                  </Label>
                  <Input
                    required
                    className="bg-muted/30 border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label className="text-sm font-semibold text-stone-700 mb-2">
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    required
                    className="bg-muted/30 border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-stone-700 mb-2">
                    Phone Number
                  </Label>
                  <Input
                    type="tel"
                    className="bg-muted/30 border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-semibold text-stone-700 mb-2">
                  Subject *
                </Label>
                <Select required>
                  <SelectTrigger className="bg-muted/30 border-gray-200 rounded-xl">
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="booking">Booking Question</SelectItem>
                    <SelectItem value="support">Technical Support</SelectItem>
                    <SelectItem value="partnership">
                      Partnership Opportunity
                    </SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <Label className="text-sm font-semibold text-stone-700 mb-2">
                  Message *
                </Label>
                <Textarea
                  required
                  rows={5}
                  className="bg-muted/30 border-gray-200 rounded-xl resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <Checkbox required />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the{" "}
                    <a href="#" className="text-emerald-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <Card className="rounded-3xl shadow-xl p-8 border-0">
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                Contact Information
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Our Office
                    </h4>
                    <p className="text-gray-600">
                      123 Independence Avenue
                      <br />
                      Lusaka, Zambia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                    <p className="text-gray-600">
                      +260 211 123 456
                      <br />
                      +260 977 123 456 (WhatsApp)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email</h4>
                    <p className="text-gray-600">
                      info@vista-travel.com
                      <br />
                      support@vista-travel.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Business Hours
                    </h4>
                    <p className="text-gray-600">
                      Mon - Fri: 8:00 AM - 6:00 PM
                      <br />
                      Sat: 9:00 AM - 4:00 PM
                      <br />
                      Sun: Closed
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Map */}
            <Card className="rounded-3xl shadow-xl overflow-hidden border-0">
              <div className="h-64 bg-gray-200 relative">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Map"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button className="bg-card text-foreground border border-border hover:bg-emerald-500 hover:text-white rounded-full font-semibold">
                    <MapPin className="w-4 h-4 mr-2" />
                    View on Google Maps
                  </Button>
                </div>
              </div>
            </Card>

            {/* Social Media */}
            <Card className="rounded-3xl shadow-xl p-8 border-0">
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {["facebook", "instagram", "twitter", "linkedin"].map(
                  (social) => (
                    <button
                      key={social}
                      className="w-12 h-12 bg-stone-100 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition-all group"
                    >
                      <MessageSquare className="w-5 h-5 text-stone-600 group-hover:text-white" />
                    </button>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
        <div className="bg-muted/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground font-serif">
            Frequently Asked Questions
          </h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-2xl shadow-lg px-6 border-0"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-emerald-600 py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

// Ticket Detail Modal Component
function TicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onCancel,
  onDelete,
}: {
  ticket: TicketType | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: (id: string, bookingId: string) => void;
  onDelete: (id: string, bookingId: string) => void;
}) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className={cn(
          "p-6 text-white relative",
          ticket.status === "cancelled"
            ? "bg-gradient-to-br from-gray-500 to-gray-600"
            : ticket.type === "flight"
              ? "bg-gradient-to-br from-emerald-600 to-teal-600"
              : "bg-gradient-to-br from-purple-600 to-pink-600"
        )}>
          {ticket.status === "cancelled" && (
            <span className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase">
              Cancelled
            </span>
          )}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-card/20 rounded-xl flex items-center justify-center">
              {ticket.type === "flight" ? (
                <Plane className="w-7 h-7" />
              ) : (
                <Compass className="w-7 h-7" />
              )}
            </div>
            <div>
              <p className="text-white/70 text-sm uppercase">
                {ticket.type === "flight" ? "E-Ticket" : "Tour Voucher"}
              </p>
              <DialogTitle className="text-2xl font-bold text-white">
                {ticket.type === "flight" ? "Flight Confirmation" : "Tour Package"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detailed view of your {ticket.type === "flight" ? "flight ticket" : "tour package"} with booking ID {ticket.bookingId}.
              </DialogDescription>
              <p className="text-white/80">Booking ID: {ticket.bookingId}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {ticket.type === "flight" ? (
            <div className="space-y-6">
              {/* Flight Route */}
              <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{ticket.from}</p>
                  <p className="text-sm text-gray-500">{ticket.fromCity}</p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="w-24 h-0.5 bg-emerald-300"></div>
                    <Plane className="w-5 h-5 text-emerald-500" />
                    <div className="w-24 h-0.5 bg-emerald-300"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">{ticket.to}</p>
                  <p className="text-sm text-gray-500">{ticket.toCity}</p>
                </div>
              </div>

              {/* Flight Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Passenger</p>
                  <p className="font-semibold text-foreground">{ticket.passengerName}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Flight</p>
                  <p className="font-semibold text-foreground">{ticket.flightCode}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
                  <p className="font-semibold text-foreground">{ticket.date}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Time</p>
                  <p className="font-semibold text-foreground">{ticket.time}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Seat</p>
                  <p className="font-semibold text-foreground">{ticket.seat}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Class</p>
                  <p className="font-semibold text-foreground">{ticket.flightClass}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold uppercase",
                    ticket.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                      ticket.status === "pending" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {ticket.status}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total Paid</p>
                  <p className="font-bold text-lg text-emerald-600">${ticket.totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tour Header */}
              <div className="bg-muted/30 rounded-xl p-4">
                <h3 className="text-xl font-bold text-foreground mb-2">{ticket.hotel}</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {ticket.selectedTransport && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100 flex items-center gap-1">
                      <Car className="w-3 h-3" /> {ticket.selectedTransport.label}
                    </span>
                  )}
                  {ticket.selectedAccommodation && (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 flex items-center gap-1">
                      <Hotel className="w-3 h-3" /> {ticket.selectedAccommodation.label}
                    </span>
                  )}
                  <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-md border border-stone-200">
                    {ticket.room}
                  </span>
                </div>
              </div>

              {/* Tour Details Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Traveler</p>
                  <p className="font-semibold text-foreground truncate">{ticket.passengerName}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Tour Date</p>
                  <p className="font-semibold text-foreground">{ticket.date}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                    ticket.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                      ticket.status === "pending" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {ticket.status}
                  </span>
                </div>
                {ticket.selectedAddOns && ticket.selectedAddOns.length > 0 && (
                  <div className="col-span-full bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Optional Add-ons</p>
                    <div className="flex flex-wrap gap-2">
                      {ticket.selectedAddOns.map(a => (
                        <span key={a.label} className="text-xs font-semibold text-stone-700 bg-card border border-stone-200 px-2 py-1 rounded-lg">
                          + {a.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-muted/30 rounded-lg p-3 flex justify-between items-center col-span-full">
                  <div>
                    <p className="text-xs text-gray-500 uppercase mb-1">Total Paid</p>
                    <p className="font-bold text-xl text-emerald-600">${ticket.totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 uppercase font-black">Guests</p>
                    <p className="text-sm font-bold text-foreground">{ticket.guests || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Tour Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Guest</p>
                  <p className="font-semibold text-foreground">{ticket.passengerName}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Guests</p>
                  <p className="font-semibold text-foreground">{ticket.guests}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Check-in</p>
                  <p className="font-semibold text-foreground">{ticket.date}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">Duration</p>
                  <p className="font-semibold text-foreground">{ticket.duration}</p>
                </div>
              </div>

              {/* Included */}
              {ticket.included && ticket.included.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Included</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.included.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Price */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-bold uppercase",
                    ticket.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                      ticket.status === "pending" ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                  )}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total Paid</p>
                  <p className="font-bold text-2xl text-emerald-600">${ticket.totalPaid.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
            <div className="flex flex-1 gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.print()}
                disabled={ticket.status === "cancelled"}
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => toast.success("Download started!")}
                disabled={ticket.status === "cancelled"}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="flex gap-3">
              {ticket.status !== "cancelled" && (
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-50"
                  onClick={() => {
                    onCancel(ticket.id, ticket.bookingId);
                    onClose();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button
                variant="destructive"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  onDelete(ticket.id, ticket.bookingId);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// E-Tickets Page
function TicketsPage() {
  const { tickets, ticketFilter, setTicketFilter, setPage, removeTicket, updateTicketStatus, markTicketViewed, markAllTicketsViewed } = useVistaStore();
  const { isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleCancelTicket = (ticketId: string, bookingId: string) => {
    updateTicketStatus(ticketId, "cancelled");
    toast.success(`Booking ${bookingId} has been cancelled`);
  };

  const handleDeleteTicket = (ticketId: string, bookingId: string) => {
    removeTicket(ticketId);
    toast.success(`Booking ${bookingId} has been deleted`);
  };

  const handleViewTicket = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setDetailModalOpen(true);
    // Mark as viewed when opened
    if (!ticket.isViewed) {
      markTicketViewed(ticket.id);
    }
  };

  // Count unviewed tickets
  const unviewedCount = tickets.filter(t => !t.isViewed && t.status !== "cancelled").length;

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <section className="pt-20 min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Sign In Required</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            Please sign in to view your e-tickets and vouchers.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button
              onClick={() => setPage("home")}
              variant="outline"
              className="px-8 py-3 rounded-full font-semibold"
            >
              Go Home
            </Button>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </section>
    );
  }

  const filteredTickets =
    ticketFilter === "all"
      ? tickets
      : tickets.filter((t) => t.type === ticketFilter);

  return (
    <section className="pt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Ticket className="w-8 h-8 md:w-10 md:h-10" />
                <h1 className="text-2xl md:text-4xl font-bold font-serif">
                  My E-Tickets & Vouchers
                </h1>
              </div>
              <p className="text-blue-100">
                {tickets.length} total tickets · {unviewedCount} new
              </p>
            </div>
            {unviewedCount > 0 && (
              <Button
                variant="outline"
                className="bg-card/10 text-white border-white/30 hover:bg-card/20"
                onClick={() => markAllTicketsViewed()}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark All as Viewed
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Tabs */}
        <div className="flex justify-center mb-6 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
          <div className="bg-card rounded-full p-1 md:p-1.5 shadow-lg inline-flex gap-1 border border-border">
            {[
              { label: "All", value: "all" },
              { label: "Flights", value: "flight", icon: Plane },
              { label: "Tours", value: "tour", icon: Compass },
              { label: "Vouchers", value: "voucher", icon: Ticket },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTicketFilter(tab.value as typeof ticketFilter)}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-semibold transition-all flex items-center gap-1 md:gap-2 whitespace-nowrap",
                  ticketFilter === tab.value
                    ? "bg-emerald-600 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal Tickets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredTickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => handleViewTicket(ticket)}
              className={cn(
                "bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left relative border-border border-2 group",
                ticket.status === "cancelled"
                  ? "border-gray-200 opacity-60"
                  : !ticket.isViewed
                    ? "border-emerald-300 bg-emerald-50/30"
                    : "border-transparent hover:border-emerald-200"
              )}
            >
              {/* New Badge */}
              {!ticket.isViewed && ticket.status !== "cancelled" && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase">
                  New
                </span>
              )}

              {/* Cancelled Badge */}
              {ticket.status === "cancelled" && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-gray-400 text-white text-[10px] font-bold rounded-full uppercase">
                  Cancelled
                </span>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  ticket.status === "cancelled"
                    ? "bg-gray-100"
                    : ticket.type === "flight"
                      ? "bg-emerald-100"
                      : "bg-purple-100"
                )}>
                  {ticket.type === "flight" ? (
                    <Plane className={cn(
                      "w-5 h-5",
                      ticket.status === "cancelled" ? "text-gray-400" : "text-emerald-600"
                    )} />
                  ) : (
                    <Compass className={cn(
                      "w-5 h-5",
                      ticket.status === "cancelled" ? "text-gray-400" : "text-purple-600"
                    )} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={cn(
                      "text-xs uppercase font-medium",
                      ticket.status === "cancelled" ? "text-gray-400" : "text-gray-500"
                    )}>
                      {ticket.type === "flight" ? "Flight" : "Tour"}
                    </p>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-medium",
                      ticket.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                        ticket.status === "pending" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-500"
                    )}>
                      {ticket.status}
                    </span>
                  </div>

                  {/* Flight Highlights */}
                  {ticket.type === "flight" ? (
                    <>
                      <p className="font-semibold text-foreground truncate">
                        {ticket.fromCity} → {ticket.toCity}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.date} · {ticket.time}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground truncate">
                        {ticket.hotel}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ticket.duration}
                      </p>
                    </>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-3" />
              </div>
            </button>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-16">
            <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              No tickets found
            </h3>
            <p className="text-gray-500 mb-6">
              Book a flight or tour to see your e-tickets here
            </p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onCancel={handleCancelTicket}
        onDelete={handleDeleteTicket}
      />
    </section>
  );
}

// Notification Section Component
function NotificationSection() {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    deleteAllNotifications,
    tickets,
    vouchers,
    setAdminSection,
    setAdminSearchQuery,
    setPage
  } = useVistaStore();
  const { user } = useAuthStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read on first click
    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }

    // Toggle expansion
    if (expandedId === notification.id) {
      // Already expanded - navigate to related item
      handleNavigateToRelated(notification);
    } else {
      // Expand to show full details
      setExpandedId(notification.id);
    }
  };

  const handleNavigateToRelated = (notification: typeof notifications[0]) => {
    if (!notification.relatedId || !notification.relatedType) {
      toast.info("No related item found");
      return;
    }

    // Find the related item to verify it exists
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
    
    if (notification.relatedType === "ticket") {
      const ticket = tickets.find(t => t.id === notification.relatedId);
      if (ticket) {
        setAdminSearchQuery(ticket.bookingId);
        if (isAdmin) {
          // Admin flows
          if (ticket.type === "flight") {
            setAdminSection("flight_bookings");
            toast.success(`Opening flight ticket: ${ticket.bookingId}`);
          } else {
            setAdminSection("bookings");
            toast.success(`Opening tour booking: ${ticket.bookingId}`);
          }
        } else {
          // Customer flows
          setPage("admin"); // Profile/Dashboard
          setAdminSection("tickets");
          toast.success(`Opening your ticket: ${ticket.bookingId}`);
        }
      } else {
        toast.error("Ticket not found");
      }
    } else if (notification.relatedType === "voucher") {
      const voucher = vouchers.find(v => v.id === notification.relatedId);
      if (voucher) {
        if (isAdmin) {
          setAdminSection("vouchers");
        } else {
          setPage("admin");
          setAdminSection("vouchers");
        }
        toast.success(`Viewing voucher: ${voucher.code}`);
      } else {
        toast.error("Voucher not found");
      }
    } else if (notification.relatedType === "destination") {
      if (isAdmin) {
        setAdminSection("wishlist");
      } else {
        setPage("admin");
        setAdminSection("wishlist");
      }
      toast.success("Opening wishlist");
    }

    setExpandedId(null);
  };

  const getRelatedItemInfo = (notification: typeof notifications[0]) => {
    if (!notification.relatedId || !notification.relatedType) return null;

    if (notification.relatedType === "ticket") {
      const ticket = tickets.find(t => t.id === notification.relatedId);
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'STAFF';
      return ticket ? { 
        label: isAdmin 
          ? (ticket.type === "flight" ? `View Flight Ticket: ${ticket.bookingId}` : `View Tour Booking: ${ticket.bookingId}`)
          : `View My Ticket: ${ticket.bookingId}`, 
        icon: ticket.type === "flight" ? Plane : Calendar 
      } : null;
    } else if (notification.relatedType === "voucher") {
      const voucher = vouchers.find(v => v.id === notification.relatedId);
      return voucher ? { label: `View Voucher: ${voucher.code}`, icon: Tag } : null;
    } else if (notification.relatedType === "destination") {
      return { label: "View in Wishlist", icon: Heart };
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-foreground">Notifications</h2>
          <p className="text-gray-500 text-sm">{unreadNotificationCount} unread of {notifications.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              markAllNotificationsRead();
              toast.success("All notifications marked as read");
            }}
            variant="outline"
            className="text-sm"
            disabled={unreadNotificationCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button
            onClick={() => {
              deleteAllNotifications();
              toast.success("All notifications deleted");
            }}
            variant="destructive"
            className="text-sm"
            disabled={notifications.length === 0}
          >
            <X className="w-4 h-4 mr-2" />
            Delete All
          </Button>
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isExpanded = expandedId === notification.id;
            const relatedInfo = getRelatedItemInfo(notification);

            return (
              <div
                key={notification.id}
                className={cn(
                  "bg-card rounded-lg shadow-sm border transition-all cursor-pointer",
                  notification.isRead ? "border-gray-200" : "border-emerald-200 bg-emerald-50/50",
                  isExpanded && "ring-2 ring-emerald-400"
                )}
              >
                <div
                  className="p-3"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        notification.type === "booking" && "bg-emerald-500",
                        notification.type === "offer" && "bg-blue-500",
                        notification.type === "payment" && "bg-amber-500",
                        notification.type === "system" && "bg-muted/30"
                      )}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className={cn(
                            "font-medium text-sm truncate",
                            notification.isRead ? "text-gray-700" : "text-foreground"
                          )}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full uppercase font-bold shrink-0">
                              New
                            </span>
                          )}
                          <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full shrink-0",
                            notification.type === "booking" && "bg-emerald-100 text-emerald-700",
                            notification.type === "offer" && "bg-blue-100 text-blue-700",
                            notification.type === "payment" && "bg-amber-100 text-amber-700",
                            notification.type === "system" && "bg-gray-100 text-gray-700"
                          )}>
                            {notification.type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">{notification.message}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">{formatTimeAgo(notification.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!notification.isRead && (
                        <Button
                          onClick={() => {
                            markNotificationRead(notification.id);
                            toast.success("Marked as read");
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          deleteNotification(notification.id);
                          if (expandedId === notification.id) setExpandedId(null);
                          toast.success("Notification deleted");
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <X className="w-3.5 h-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && notification.fullMessage && (
                  <div className="px-3 pb-3 pt-0">
                    <div className="ml-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-gray-700 text-sm leading-relaxed">{notification.fullMessage}</p>

                      {/* Navigate to related item button */}
                      {relatedInfo && (
                        <button
                          onClick={() => handleNavigateToRelated(notification)}
                          className="mt-3 flex items-center gap-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                          {relatedInfo.label}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-muted/30 rounded-xl p-12 text-center border border-border">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications</h3>
          <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
        </div>
      )}
    </div>
  );
}

// Profile Section Component
function ProfileSection() {
  const { user, updateProfile, updateAvatar, isLoading, refreshUser, getLoyaltyInfo } = useAuthStore();
  const loyaltyInfo = getLoyaltyInfo();
  
  const [formData, setFormData] = useState(() => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  }));
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast("Image size too large", { description: "Image size must be less than 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setAvatarPreview(dataUrl);
      setIsSaving(true);
      const result = await updateAvatar(dataUrl);
      setIsSaving(false);
      if (result.success) {
        toast("Success", { description: "Profile picture updated!" });
      } else {
        toast("Failed", { description: result.error || "Failed to update profile picture" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const result = await updateProfile(formData);
    setIsSaving(false);
    if (result.success) {
      toast("Success", { description: "Profile updated successfully!" });
      setIsEditing(false);
    } else {
      toast("Failed", { description: result.error || "Failed to update profile" });
    }
  };

  if (!user) return null;

  return (
    <div className="w-full text-left space-y-8 pb-16 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="mb-0">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">My Profile</h1>
        <p className="text-stone-500 font-medium text-sm">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Profile Summary */}
        <Card className="lg:col-span-4 rounded-3xl border border-border shadow-sm bg-card overflow-hidden p-8 flex flex-col items-center text-center">
          <div className="relative group/avatar mb-6">
            <Avatar className="w-40 h-40 border-0 shadow-lg relative">
              <AvatarImage src={avatarPreview || undefined} alt={user.firstName} className="object-cover" />
              <AvatarFallback className="bg-stone-100 text-stone-400 text-4xl font-light">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload-final"
              className="absolute bottom-1 right-1 w-9 h-9 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors z-20 border-4 border-white"
            >
              <Camera className="w-4 h-4" />
            </label>
            <input
              id="avatar-upload-final"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1 mb-6">
            <h3 className="text-2xl font-bold text-foreground leading-none">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-stone-400 font-medium text-sm">{user.email}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200/30">
              {loyaltyInfo.currentTier.name} Member
            </div>
            <div className="px-3 py-1 bg-card text-stone-500 text-[10px] font-bold rounded-md border border-stone-200">
              Since {new Date(loyaltyInfo.memberSince || user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </Card>

        {/* Right Card: Personal Information */}
        <Card className="lg:col-span-8 rounded-3xl border border-border shadow-sm bg-card overflow-hidden">
          <CardHeader className="p-8 pb-4 border-0 flex flex-row items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 text-foreground font-bold text-xs hover:opacity-70 transition-opacity"
            >
              {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground">First Name</Label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="h-11 rounded-lg border-stone-200 bg-card focus-visible:ring-emerald-500 text-sm font-medium px-4 shadow-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-foreground opacity-0 md:block hidden">Last Name</Label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="h-11 rounded-lg border-stone-200 bg-card focus-visible:ring-emerald-500 text-sm font-medium px-4 shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Email</Label>
                  <Input
                    name="email"
                    value={formData.email}
                    disabled
                    className="h-11 rounded-lg border-stone-200 bg-muted/30 text-sm font-medium text-stone-400 cursor-not-allowed px-4 shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-foreground">Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="h-11 rounded-lg border-stone-200 bg-card focus-visible:ring-emerald-500 text-sm font-medium px-4 shadow-none"
                    placeholder="+260 977 123 456"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 bg-emerald-600 text-white px-6 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 animate-in fade-in duration-500">
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-foreground">Full Name</p>
                  <div className="h-11 rounded-lg border border-border/50 bg-card flex items-center px-4 text-sm font-medium text-stone-500 shadow-none">
                    {user.firstName} {user.lastName}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-foreground">Email</p>
                  <div className="h-11 rounded-lg border border-border/50 bg-card flex items-center px-4 text-sm font-medium text-stone-500 shadow-none">
                    {user.email}
                  </div>
                </div>
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <p className="text-xs font-bold text-foreground">Phone</p>
                  <div className="h-11 rounded-lg border border-border/50 bg-card flex items-center px-4 text-sm font-medium text-stone-500 shadow-none">
                    {user.phone || '+260 977 123 456'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Card: Loyalty Status */}
        <Card className="lg:col-span-12 rounded-3xl border border-border shadow-sm bg-card overflow-hidden p-8">
          <div className="flex items-center gap-2 mb-8">
            <Gift className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-foreground">Loyalty Status</h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-amber-500/20 shrink-0">
              {loyaltyInfo.currentPoints}
            </div>
            
            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-foreground leading-tight">{loyaltyInfo.currentTier.name} Member</h4>
                <p className="text-xs font-medium text-stone-400">
                  {loyaltyInfo.nextTier 
                    ? `${loyaltyInfo.pointsToNextTier} points to ${loyaltyInfo.nextTier.name}`
                    : 'Maximum Tier Reached'}
                </p>
              </div>
              
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)]" 
                  style={{ 
                    width: loyaltyInfo.nextTier 
                      ? `${Math.max(5, ((loyaltyInfo.currentPoints - loyaltyInfo.currentTier.minPoints) / (loyaltyInfo.nextTier.minPoints - loyaltyInfo.currentTier.minPoints)) * 100)}%` 
                      : '100%' 
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Wishlist Section Component
function WishlistSection() {
  const { wishlist, removeFromWishlist, clearWishlist, setPage, getCurrencySymbol, convertFromUSD, currency: activeCurrency } = useVistaStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencySymbol = activeCurrency === "USD" ? "$" : activeCurrency === "EUR" ? "€" : activeCurrency === "GBP" ? "£" : activeCurrency === "ZMW" ? "ZK" : "R";
  const { user } = useAuthStore();

  const handleRemove = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.id)}&destinationId=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        removeFromWishlist(id);
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.error || "Failed to remove from wishlist");
      }
    } catch (err) {
      toast.error("Network error removing from wishlist");
    }
  };

  const handleClear = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.id)}&clearAll=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        clearWishlist();
        toast.success("Wishlist cleared");
      } else {
        toast.error(data.error || "Failed to clear wishlist");
      }
    } catch (err) {
      toast.error("Network error clearing wishlist");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-foreground">My Wishlist</h2>
          <p className="text-gray-500 text-sm">{wishlist.length} saved destinations</p>
        </div>
        {wishlist.length > 0 && (
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleClear}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map((dest) => (
            <div
              key={dest.id}
              className="bg-card rounded-xl shadow-sm overflow-hidden border border-border hover:shadow-md transition-all group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => handleRemove(dest.id)}
                    className="w-8 h-8 bg-card/90 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-full text-[10px] font-bold uppercase">
                    {dest.tags[0]}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground truncate">{dest.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{dest.location}</p>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{dest.rating}</span>
                  <span className="text-xs text-gray-400">({dest.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-emerald-600">
                    {!mounted ? `$${dest.price.toLocaleString()}` : (
                      <>
                        {currencySymbol}{convertFromUSD(dest.price).toLocaleString()}
                      </>
                    )}
                  </p>
                  <span className="text-xs text-gray-500">{dest.duration}</span>
                </div>
                <BookingModal
                  type="TOUR"
                  initialData={{ 
                    ...dest,
                    basePrice: dest.price, 
                    destinationId: dest.id, 
                    hotelName: dest.title,
                    roomType: "Double Standard",
                  }}
                  trigger={
                    <Button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
                      Book Now
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 md:p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-6">Save destinations you love by clicking the heart icon</p>
          <Button
            onClick={() => setPage("destinations")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Compass className="w-4 h-4 mr-2" />
            Explore Destinations
          </Button>
        </div>
      )}
    </div>
  );
}

// Settings Editor (admin only)
function SettingsEditor() {
  const { user } = useAuthStore();
  const [terms, setTerms] = useState('');
  const [privacy, setPrivacy] = useState('');
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supportNumber, setSupportNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const tRes = await fetch('/api/system-settings?key=terms_of_service');
        const tJson = await tRes.json();
        if (tJson.success && tJson.setting) setTerms(tJson.setting.value || '');

        const pRes = await fetch('/api/system-settings?key=privacy_policy');
        const pJson = await pRes.json();
        if (pJson.success && pJson.setting) setPrivacy(pJson.setting.value || '');
        const sRes = await fetch('/api/system-settings?key=site_name');
        const sJson = await sRes.json();
        if (sJson.success && sJson.setting) setSiteName(sJson.setting.value || '');

        const eRes = await fetch('/api/system-settings?key=contact_email');
        const eJson = await eRes.json();
        if (eJson.success && eJson.setting) setContactEmail(eJson.setting.value || '');

        const pPhoneRes = await fetch('/api/system-settings?key=contact_phone');
        const pPhoneJson = await pPhoneRes.json();
        if (pPhoneJson.success && pPhoneJson.setting) setContactPhone(pPhoneJson.setting.value || '');

        const sNumRes = await fetch('/api/system-settings?key=support_number');
        const sNumJson = await sNumRes.json();
        if (sNumJson.success && sNumJson.setting) setSupportNumber(sNumJson.setting.value || '');

        const aRes = await fetch('/api/system-settings?key=contact_address');
        const aJson = await aRes.json();
        if (aJson.success && aJson.setting) setAddress(aJson.setting.value || '');
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
    load();
  }, []);

  const saveSetting = async (key: string, value: string) => {
    if (!user) return toast.error('You must be signed in as admin');
    setLoading(true);
    try {
      const res = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, key, value }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Saved');
      } else {
        toast.error(json.error || 'Save failed');
      }
    } catch (e) {
      console.error(e);
      toast.error('Save failed');
    }
    setLoading(false);
  };

  if (!user || user.role !== 'ADMIN') {
    return <p className="text-sm text-gray-500">Only administrators can edit system settings.</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Terms of Service</h3>
        </CardHeader>
        <CardContent>
          <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={10} />
          <div className="flex justify-end mt-3">
            <Button onClick={() => saveSetting('terms_of_service', terms)} disabled={loading}>
              Save Terms
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Privacy Policy</h3>
        </CardHeader>
        <CardContent>
          <Textarea value={privacy} onChange={(e) => setPrivacy(e.target.value)} rows={10} />
          <div className="flex justify-end mt-3">
            <Button onClick={() => saveSetting('privacy_policy', privacy)} disabled={loading}>
              Save Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Website Contact Details</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Site Name</Label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Contact Email</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Contact Phone</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Support Number</Label>
              <Input value={supportNumber} onChange={(e) => setSupportNumber(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm">Address</Label>
              <Textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={async () => {
              await saveSetting('site_name', siteName);
              await saveSetting('contact_email', contactEmail);
              await saveSetting('contact_phone', contactPhone);
              await saveSetting('support_number', supportNumber);
              await saveSetting('contact_address', address);
            }} disabled={loading}>
              Save Contact Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Section Component
function AnalyticsSection() {
  const [timeRange, setTimeRange] = useState("This Month");

  const kpis = [
    {
      label: "Total Revenue",
      value: "$89,450",
      change: "+12.5%",
      positive: true,
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Avg. Order Value",
      value: "$718",
      change: "+8.2%",
      positive: true,
      icon: CreditCard,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Conversion Rate",
      value: "3.2%",
      change: "-0.5%",
      positive: false,
      icon: ArrowUpRight,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Repeat Customers",
      value: "45%",
      change: "+5.1%",
      positive: true,
      icon: Users,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
    },
  ];

  const revenueData = [
    { name: 'Jul', value: 65000 },
    { name: 'Aug', value: 72000 },
    { name: 'Sep', value: 68000 },
    { name: 'Oct', value: 85000 },
    { name: 'Nov', value: 78000 },
    { name: 'Dec', value: 92000 },
    { name: 'Jan', value: 89450 },
  ];

  const statusData = [
    { name: 'Confirmed', value: 850, color: '#10B981' },
    { name: 'Pending', value: 120, color: '#F59E0B' },
    { name: 'Processing', value: 45, color: '#3B82F6' },
    { name: 'Cancelled', value: 32, color: '#EF4444' },
  ];

  const demographicData = [
    { name: 'Adults', value: 65, color: '#10B981' },
    { name: 'Seniors', value: 20, color: '#3B82F6' },
    { name: 'Children', value: 10, color: '#F59E0B' },
    { name: 'Students', value: 5, color: '#6366F1' },
  ];

  const topDestinations = [
    { name: 'Bali Adventure', bookings: 156, revenue: '$124,800', rank: 1 },
    { name: 'Serengeti Safari', bookings: 132, revenue: '$316,800', rank: 2 },
    { name: 'Maldives Getaway', bookings: 98, revenue: '$181,300', rank: 3 },
  ];

  const recentActivity = [
    { type: 'booking', title: 'New booking', subtitle: 'Bali Adventure - Sarah J.', time: '2 min ago', icon: Calendar, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { type: 'payment', title: 'Payment received', subtitle: '$1,250 from Michael B.', time: '15 min ago', icon: CreditCard, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { type: 'review', title: 'Review submitted', subtitle: '5 stars for Serengeti', time: '1 hour ago', icon: Star, iconBg: 'bg-amber-100', iconColor: 'text-amber-500' },
    { type: 'cancel', title: 'Booking cancelled', subtitle: 'Trip to Dubai - John D.', time: '2 hours ago', icon: XCircle, iconBg: 'bg-red-100', iconColor: 'text-red-500' },
  ];

  return (
    <div className="w-full text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground">Analytics</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">Detailed insights and performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border border-border rounded-xl px-4 py-2.5 text-sm text-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
        >
          {["Today", "This Week", "This Month", "This Quarter", "This Year"].map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-card rounded-2xl md:rounded-[20px] shadow-sm ring-1 ring-border p-5 md:p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.iconBg)}>
                <kpi.icon className={cn("w-5 h-5", kpi.iconColor)} />
              </div>
              <span className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full",
                kpi.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
              )}>
                {kpi.change}
              </span>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-border p-6 md:p-8 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Revenue Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-border p-6 md:p-8 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Booking Status Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                />
                <Tooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Destinations */}
        <div className="bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-border p-6 md:p-8 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Destinations</h3>
          <div className="space-y-6">
            {topDestinations.map((dest, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    {dest.rank}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{dest.name}</p>
                    <p className="text-xs text-gray-500">{dest.bookings} bookings</p>
                  </div>
                </div>
                <p className="font-bold text-emerald-600">{dest.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Demographics */}
        <div className="bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-border p-6 md:p-8 flex flex-col border border-border">
          <h3 className="text-lg font-bold text-foreground mb-2">Customer Demographics</h3>
          <div className="flex-1 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demographicData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demographicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {demographicData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-gray-500 font-medium">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-border p-6 md:p-8 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex shrink-0 items-center justify-center", act.iconBg)}>
                  <act.icon className={cn("w-5 h-5", act.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-foreground text-sm truncate">{act.title}</p>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">{act.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{act.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// Messages Section Component (Contact Inquiries)
function MessagesSection() {
  const { contactMessages } = useVistaStore();
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  return (
    <div className="w-full text-left h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground">Inquiries</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">General messages from the contact form</p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
          {contactMessages.length} Messages
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Messages List */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {contactMessages.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-3xl border border-border/50 text-gray-400 text-sm">
              No messages yet
            </div>
          ) : contactMessages.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMsg(m)}
              className={cn(
                "p-5 rounded-3xl text-left transition-all border flex flex-col gap-3 group",
                selectedMsg?.id === m.id
                  ? "bg-stone-900 border-stone-900 text-white shadow-xl shadow-stone-100"
                  : "bg-card border-border text-foreground hover:border-accent hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                  selectedMsg?.id === m.id ? "bg-card/10" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                )}>
                  <Mail className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base line-clamp-1">{m.subject}</h4>
                <p className={cn(
                  "text-xs mt-1 line-clamp-1 opacity-70",
                  selectedMsg?.id === m.id ? "text-white/70" : "text-gray-500"
                )}>
                  From: {m.firstName} {m.lastName}
                </p>
              </div>

              <div className={cn(
                "text-[10px] font-bold opacity-50",
                selectedMsg?.id === m.id ? "text-white/50" : "text-gray-400"
              )}>
                {m.timestamp ? new Date(m.timestamp).toLocaleDateString() : 'N/A'}
              </div>
            </button>
          ))}
        </div>

        {/* Message Content */}
        <div className="flex-1 bg-card rounded-[32px] border border-border shadow-sm flex flex-col overflow-hidden">
          {!selectedMsg ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <Mail className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Select a message</h3>
              <p className="text-gray-500 max-w-xs">View the full content of customer inquiries here.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-8 md:p-10 border-b border-border bg-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground font-bold text-xl">
                      {selectedMsg.firstName[0]}{selectedMsg.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{selectedMsg.subject}</h3>
                      <p className="text-muted-foreground font-medium">
                        {selectedMsg.firstName} {selectedMsg.lastName} &lt;{selectedMsg.email}&gt;
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-1">Received On</p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedMsg.timestamp ? new Date(selectedMsg.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-8 md:p-10 overflow-y-auto custom-scrollbar bg-background/50">
                <div className="max-w-3xl">
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-6">Message Content</p>
                  <div className="bg-card p-8 rounded-[32px] ring-1 ring-border shadow-sm text-foreground leading-relaxed text-lg whitespace-pre-wrap">
                    {selectedMsg.message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Customers Section Component
function CustomersSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "edit" | "view">("view");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    isActive: true,
    isVerified: false,
    avatar: "",
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users?role=CLIENT");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.users);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleAddClick = () => {
    setModalType("add");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      isActive: true,
      isVerified: false,
      avatar: "",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (customer: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalType("edit");
    setSelectedCustomer(customer);
    setFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      isActive: customer.isActive ?? true,
      isVerified: customer.isVerified ?? false,
      avatar: customer.avatar || "",
    });
    setIsModalOpen(true);
  };

  const handleViewClick = (customer: any) => {
    setModalType("view");
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Customer deleted successfully");
        loadCustomers();
        if (selectedCustomer?.id === id) setIsModalOpen(false);
      } else {
        toast.error(data.error || "Failed to delete customer");
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = modalType === "add" ? "/api/users" : `/api/users/${selectedCustomer.id}`;
    const method = modalType === "add" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "CLIENT", // Ensure they remain clients
          password: modalType === "add" ? "welcome123" : undefined, // Default password for new users
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Customer ${modalType === "add" ? "added" : "updated"} successfully`);
        setIsModalOpen(false);
        loadCustomers();
      } else {
        toast.error(data.error || `Failed to ${modalType} customer`);
      }
    } catch (err) {
      console.error(`Error ${modalType}ing customer:`, err);
      toast.error("An error occurred");
    }
  };

  const filteredCustomers = customers.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 px-1">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground">Customers</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">Manage your customer database</p>
        </div>
        <div className="flex gap-4">
          <Input 
            placeholder="Search customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <button
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95 whitespace-nowrap"
            onClick={handleAddClick}
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      <div className="bg-card rounded-[32px] shadow-sm ring-1 ring-border overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Customer</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Email</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Bookings</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Total Spent</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">No customers found.</td>
                </tr>
              ) : filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleViewClick(customer)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-50 bg-stone-100 flex items-center justify-center">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt={customer.firstName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <span className="font-bold text-foreground text-base">{customer.firstName} {customer.lastName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-500 font-medium">{customer.email}</td>
                  <td className="px-8 py-5 text-center text-stone-600 font-bold">{customer.bookingsCount}</td>
                  <td className="px-8 py-5 text-center text-foreground font-bold">${customer.totalSpent.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      customer.isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500"
                    )}>
                      {customer.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        onClick={(e) => { e.stopPropagation(); handleViewClick(customer); }}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        onClick={(e) => handleEditClick(customer, e)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        onClick={(e) => handleDeleteClick(customer.id, e)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl bg-card rounded-[32px] border border-border shadow-2xl p-0 overflow-hidden">
          <div className="p-8 md:p-12">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground">
                {modalType === "add" ? "Add New Customer" : modalType === "edit" ? "Edit Customer" : "Customer Details"}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                {modalType === "add" ? "Create a new client profile in the database" : modalType === "edit" ? "Modify existing client information" : "Full profile overview"}
              </DialogDescription>
            </DialogHeader>

            {modalType === "view" && selectedCustomer ? (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-50 bg-stone-100 flex items-center justify-center">
                    {selectedCustomer.avatar ? (
                      <img src={selectedCustomer.avatar} alt={selectedCustomer.firstName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                       {selectedCustomer.firstName} {selectedCustomer.lastName}
                       {selectedCustomer.isVerified && <Check className="w-5 h-5 text-blue-500 bg-blue-50 rounded-full p-0.5" />}
                    </h3>
                    <p className="text-gray-500 font-medium">{selectedCustomer.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        selectedCustomer.isActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"
                      )}>
                        {selectedCustomer.isActive ? "Active Account" : "Inactive Account"}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600">
                        Client ID: {selectedCustomer.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-6 rounded-3xl">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Bookings</p>
                    <p className="text-2xl font-bold text-foreground">{selectedCustomer.bookingsCount}</p>
                  </div>
                  <div className="bg-muted/30 p-6 rounded-3xl">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-emerald-600">${selectedCustomer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                    onClick={(e) => handleDeleteClick(selectedCustomer.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                  <div className="flex gap-3">
                    {!selectedCustomer.isVerified && (
                      <button
                        className="px-6 py-3 bg-blue-50 text-blue-600 rounded-2xl text-sm font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
                        onClick={async () => {
                           try {
                             const res = await fetch(`/api/users/${selectedCustomer.id}`, {
                               method: "PATCH",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ isVerified: true })
                             });
                             if (res.ok) {
                               toast.success("User verified successfully");
                               loadCustomers();
                               setIsModalOpen(false);
                             } else {
                               toast.error("Failed to verify user");
                             }
                           } catch (e) {
                             toast.error("An error occurred");
                           }
                        }}
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Verify Client
                      </button>
                    )}
                    <button
                      className="px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl text-sm font-bold hover:bg-stone-200 transition-all"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Close
                    </button>
                    <button
                      className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                      onClick={() => handleEditClick(selectedCustomer)}
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-stone-700 ml-1">First Name</Label>
                    <Input
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="e.g. Sarah"
                      className="h-12 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-stone-700 ml-1">Last Name</Label>
                    <Input
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="e.g. Jenkins"
                      className="h-12 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-stone-700 ml-1">Email Address</Label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah@example.com"
                    className="h-12 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-stone-700 ml-1">Phone Number (Optional)</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+260..."
                    className="h-12 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-stone-700 ml-1">Avatar URL (Optional)</Label>
                  <Input
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                    className="h-12 rounded-xl border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
                  />
                  <Label htmlFor="isActive" className="text-sm font-bold text-stone-700 cursor-pointer">
                    Account is Active
                  </Label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6">
                  <button
                    type="button"
                    className="px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl text-sm font-bold hover:bg-stone-200 transition-all"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    {modalType === "add" ? "Create Customer" : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// Support Tickets Section Component
function SupportTicketsSection() {
  const { user } = useAuthStore();
  const { setUnreadSupportTicketCount, addNotification, markNotificationsReadByRelatedId } = useVistaStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadTickets = async () => {
    try {
      const res = await fetch(`/api/support-tickets?role=${user?.role}&userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
        const openCount = data.tickets.filter((t: any) => t.status !== "RESOLVED" && t.status !== "CLOSED").length;
        setUnreadSupportTicketCount(openCount);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const { sendChatMessage } = useRealtime({
    userId: user?.id,
    role: user?.role,
    onChatMessage: (msg) => {
      // If the message belongs to the current open ticket
      if (ticketDetails && (msg as any).ticketId === ticketDetails.id) {
        setTicketDetails((prev: any) => ({
          ...prev,
          messages: [...prev.messages, msg]
        }));
      } else {
        // Just reload the list to show new message snippets
        loadTickets();
      }
    }
  });

  const loadTicketDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/support-tickets/${id}?userId=${user?.id}`);
      const data = await res.json();
      if (data.success) {
        setTicketDetails(data.ticket);
        // Reload ticket list to update unread badges
        loadTickets();
        // Clear associated notifications
        markNotificationsReadByRelatedId(id);
      }
    } catch (err) {
      console.error("Failed to load ticket details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [user]);

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [ticketDetails?.messages]);

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reply.trim() || !ticketDetails || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/support-tickets/${ticketDetails.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user?.id,
          message: reply,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTicketDetails((prev: any) => ({
          ...prev,
          messages: [...prev.messages, data.message],
        }));
        setReply("");

        // Emit via socket
        sendChatMessage({
          room: ticketDetails.id,
          message: reply,
          ticketId: ticketDetails.id
        });
        loadTickets(); // Refresh snippet in list
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (!ticketDetails) return;
    try {
      const res = await fetch(`/api/support-tickets/${ticketDetails.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ticket resolved");
        loadTickets();
        setTicketDetails((prev: any) => ({ ...prev, status: "RESOLVED" }));
      }
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
    }
  };

  const openTicketsCount = tickets.filter(t => t.status !== "RESOLVED" && t.status !== "CLOSED").length;

  return (
    <div className="w-full text-left h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground">Support Tickets</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">Manage customer support conversations</p>
        </div>
        <div className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest">
          {openTicketsCount} Open
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Ticket List (Left) */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-card rounded-3xl border border-border">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-3xl border border-border/50 text-gray-400 text-sm">
              No tickets found
            </div>
          ) : tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTicketId(t.id)}
              className={cn(
                "p-5 rounded-3xl text-left transition-all border flex flex-col gap-3 group relative overflow-hidden",
                selectedTicketId === t.id
                  ? "bg-stone-900 border-stone-800 text-white shadow-xl shadow-stone-900/20"
                  : "bg-card border-border text-foreground hover:border-accent hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                  selectedTicketId === t.id ? "bg-card/10" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                )}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                  t.status === "OPEN" ? "bg-orange-100 text-orange-600" :
                    t.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-600" :
                      "bg-emerald-100 text-emerald-600"
                )}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-base line-clamp-1">{t.subject}</h4>
                <p className={cn(
                  "text-xs mt-1 line-clamp-1 opacity-70",
                  selectedTicketId === t.id ? "text-white/70" : "text-gray-500"
                )}>
                  {t.messages?.[0]?.message || "No messages"}
                </p>
              </div>

              <div className={cn(
                "text-[10px] font-bold opacity-50",
                selectedTicketId === t.id ? "text-white/50" : "text-gray-400"
              )}>
                {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'N/A'} at {t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </div>
            </button>
          ))}
        </div>

        {/* Chat Window (Right) */}
        <div className="flex-1 bg-card rounded-[32px] border border-border shadow-sm flex flex-col overflow-hidden">
          {!selectedTicketId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <Headset className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Select a ticket to manage</h3>
              <p className="text-gray-500 max-w-xs">Select a conversation from the left to view details and reply to the customer.</p>
            </div>
          ) : detailsLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : ticketDetails ? (
            <>
              {/* Chat Header */}
              <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between bg-card z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center">
                    {ticketDetails.user.avatar ? (
                      <img src={ticketDetails.user.avatar} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-stone-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{ticketDetails.subject}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 font-medium">Ticket ID: {ticketDetails.ticketId} • Status: </span>
                      <span className={cn(
                        "text-xs font-bold",
                        ticketDetails.status === "OPEN" ? "text-orange-600" : "text-emerald-600"
                      )}>
                        {ticketDetails.status}
                      </span>
                    </div>
                  </div>
                </div>
                {ticketDetails.status !== "RESOLVED" && (
                  <button
                    onClick={handleResolve}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-all border border-emerald-100/50"
                  >
                    <Check className="w-4 h-4" />
                    Resolve
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-muted/30/30"
              >
                {ticketDetails.messages.map((m: any, idx: number) => {
                  const isStaff = m.sender.role === 'ADMIN' || m.sender.role === 'STAFF';
                  return (
                    <div
                      key={m.id || idx}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isStaff ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 md:p-5 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-sm transition-all",
                        isStaff
                          ? "bg-stone-900 text-white shadow-stone-200"
                          : "bg-card text-foreground border border-border/50 shadow-gray-100"
                      )}>
                        {m.message}
                      </div>

                      <div className="flex items-center gap-2 mt-2 px-1">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          isStaff ? "text-stone-400" : "text-gray-400"
                        )}>
                          {isStaff ? 'Staff' : m.sender.firstName} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isStaff && <Check className="w-3 h-3 text-emerald-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-4 md:p-6 bg-card border-t border-gray-50 z-10">
                <form
                  onSubmit={handleSendReply}
                  className="flex gap-3 bg-muted/50 p-2 rounded-2xl border border-border/50 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all"
                >
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={ticketDetails.status === "RESOLVED" ? "This ticket consists of a resolved conversation..." : "Type your reply to the customer..."}
                    disabled={ticketDetails.status === "RESOLVED" || isSending}
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-sm placeholder:text-gray-400 font-medium text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim() || ticketDetails.status === "RESOLVED" || isSending}
                    className="p-3 md:px-6 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-emerald-100 active:scale-95 disabled:active:scale-100"
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 md:mr-2" />}
                    <span className="hidden md:inline font-bold">Send Reply</span>
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Bookings Management Section Component
function BookingsSection({ type, userId: explicitUserId }: { type?: "FLIGHT" | "TOUR", userId?: string }) {
  const { adminSearchQuery, setAdminSearchQuery, setAdminSection } = useVistaStore();
  const [searchQuery, setSearchQuery] = useState(adminSearchQuery || "");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifyBookingStatusChanged } = useRealtime();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const targetUserId = explicitUserId || "ALL";
      const endpoint = type ? `/api/bookings?userId=${encodeURIComponent(targetUserId)}&type=${type}` : `/api/bookings?userId=${encodeURIComponent(targetUserId)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [type]);

  useEffect(() => {
    if (adminSearchQuery) {
      setSearchQuery(adminSearchQuery);
      // Clear after applying to avoid search staying forever
      // setAdminSearchQuery(""); 
    }
  }, [adminSearchQuery]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (adminSearchQuery) setAdminSearchQuery(""); // Clear global search if user starts typing
  };

  const handleUpdateStatus = async (bookingId: string, status: string, userId: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status, userId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Booking marked as ${status.toLowerCase()}`);
        loadBookings();
        
        // Notify the client in real-time
        notifyBookingStatusChanged(bookingId, status, `Your booking has been ${status.toLowerCase()}`);
      } else {
        toast.error(data.error || "Failed to update booking status");
      }
    } catch (err) {
      console.error("Error updating booking:", err);
      toast.error("An error occurred adding the update");
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.type && b.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 px-1">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground">
            {type === "FLIGHT" ? "Flight Bookings" : type === "TOUR" ? "Tour Package Bookings" : "Bookings Management"}
          </h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            {type === "FLIGHT" ? "Manage specific flight reservations" : type === "TOUR" ? "Manage destination tour reservations" : "Manage global flight and tour reservations"}
          </p>
        </div>
        <div className="flex gap-4">
          <Input 
            placeholder="Search booking ID..." 
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-card rounded-[32px] shadow-sm ring-1 ring-border overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Booking Ref</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Type</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Details</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Amount</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-gray-400">No bookings found.</td>
                </tr>
              ) : filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="group hover:bg-muted/50 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-foreground text-sm">{booking.bookingId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        booking.type === "FLIGHT" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                      )}>
                        {booking.type}
                      </span>
                  </td>
                  <td className="px-8 py-5">
                     {booking.type === "FLIGHT" ? (
                        <div>
                          <p className="font-bold text-foreground text-sm">{booking.fromCity} → {booking.toCity}</p>
                          <p className="text-gray-500 text-xs">Passengers: {booking.passengers}</p>
                        </div>
                     ) : (
                        <div>
                          <p className="font-bold text-foreground text-sm">{booking.hotelName}</p>
                          <p className="text-gray-500 text-xs">Guests: {booking.guests}</p>
                        </div>
                     )}
                  </td>
                  <td className="px-8 py-5 text-center text-foreground font-bold">${booking.totalAmount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      booking.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-600" :
                      booking.status === "PENDING" ? "bg-orange-50 text-orange-600" :
                      "bg-gray-100 text-gray-500"
                    )}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status === "CONFIRMED" && (
                        <button
                          title="View Ticket"
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          onClick={() => {
                            setAdminSection("tickets");
                          }}
                        >
                          <Ticket className="w-5 h-5" />
                        </button>
                      )}
                      {booking.status === "PENDING" && (
                        <button
                          title="Confirm Booking"
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          onClick={() => handleUpdateStatus(booking.id, "CONFIRMED", booking.userId)}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                         <button
                           title="Cancel Booking"
                           className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                           onClick={() => {
                              if (confirm("Cancel this booking?")) {
                                handleUpdateStatus(booking.id, "CANCELLED", booking.userId);
                              }
                           }}
                         >
                           <X className="w-5 h-5" />
                         </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Destinations/Inventory Management Section Component
function DestinationsSection() {
  const { getCurrencySymbol, convertFromUSD, currency: activeCurrency } = useVistaStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencySymbol = activeCurrency === "USD" ? "$" : activeCurrency === "EUR" ? "€" : activeCurrency === "GBP" ? "£" : activeCurrency === "ZMW" ? "ZK" : "R";
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    price: 0,
    childPrice: 0,
    duration: "",
    image: "",
    description: "",
    mealPlan: "",
    tags: [] as string[],
    isActive: true,
    maxGroupSize: 10,
    availableDates: [] as string[],
    transportOptions: [] as { label: string; price: number }[],
    accommodationOptions: [] as { label: string; priceAdjustment: number }[],
    addOns: [] as { label: string; price: number }[]
  });

  const loadDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/destinations?active=false"); // Get all including inactive
      const data = await res.json();
      if (data.success) {
        setDestinations(data.destinations);
      }
    } catch (err) {
      console.error("Failed to load destinations:", err);
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  const handleOpenModal = (dest: any = null) => {
    if (dest) {
      setEditingDest(dest);
      setFormData({
        title: dest.title,
        location: dest.location,
        price: dest.price,
        childPrice: dest.childPrice || 0,
        duration: dest.duration,
        image: dest.image,
        description: dest.description,
        mealPlan: dest.mealPlan || "",
        tags: dest.tags || [],
        isActive: dest.isActive,
        maxGroupSize: dest.maxGroupSize || 10,
        availableDates: dest.availableDates || [],
        transportOptions: dest.transportOptions || [],
        accommodationOptions: dest.accommodationOptions || [],
        addOns: dest.addOns || []
      });
    } else {
      setEditingDest(null);
      setFormData({
        title: "",
        location: "",
        price: 0,
        childPrice: 0,
        duration: "",
        image: "",
        description: "",
        mealPlan: "All Inclusive",
        tags: [],
        isActive: true,
        maxGroupSize: 10,
        availableDates: [],
        transportOptions: [],
        accommodationOptions: [],
        addOns: []
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Destination deleted");
        loadDestinations();
      }
    } catch (err) {
      toast.error("Failed to delete destination");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, image: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    
    try {
      const method = editingDest ? "PATCH" : "POST";
      const url = editingDest ? `/api/destinations/${editingDest.id}` : "/api/destinations";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (res.ok && result.success) {
        toast.success(`Destination ${editingDest ? "updated" : "created"} successfully`);
        setIsModalOpen(false);
        await loadDestinations();
      } else {
        const errorMsg = result.error || "Failed to save destination";
        toast.error(errorMsg);
        console.error("Submission failed:", result);
      }
    } catch (err) {
      console.error("Form submission error:", err);
      toast.error("A network error occurred while saving");
    }
  };

  return (
    <div className="w-full text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 px-1">
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-foreground">Destination Inventory</h2>
          <p className="text-gray-500 text-sm md:text-base mt-1">Manage tours, packages and global offerings</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : destinations.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-[32px] border border-border/50 text-gray-400">
            No destinations in inventory.
          </div>
        ) : destinations.map((dest) => (
          <div key={dest.id} className="bg-card rounded-[32px] border border-border/50 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-300">
            <div className="relative h-48">
              <img src={dest.image} alt={dest.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleOpenModal(dest)}
                  className="p-2 bg-card/90 backdrop-blur-sm rounded-xl text-foreground shadow-sm hover:bg-card transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(dest.id)}
                  className="p-2 bg-card/90 backdrop-blur-sm rounded-xl text-red-600 shadow-sm hover:bg-card transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {!dest.isActive && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  Inactive
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-foreground text-lg line-clamp-1">{dest.title}</h3>
                  <p className="text-gray-500 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {dest.location}
                  </p>
                </div>
                <p className="text-emerald-600 font-bold text-lg">
                  {!mounted ? `$${dest.price.toLocaleString()}` : (
                    <>
                      {currencySymbol}{convertFromUSD(dest.price).toLocaleString()}
                    </>
                  )}
                </p>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">{dest.description}</p>
              <div className="flex items-center justify-between text-xs text-stone-400 font-bold uppercase tracking-widest border-t border-gray-50 pt-4">
                <span>{dest.duration}</span>
                <span>{dest.mealPlan}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[32px] border-none p-0">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {editingDest ? "Edit Destination" : "Add New Destination"}
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Update the information for this travel package.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Package Title</Label>
                  <Input 
                    id="title" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    required 
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Adult Price ($)</Label>
                  <Input 
                    type="number"
                    id="price" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} 
                    required 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childPrice">Child Price ($)</Label>
                  <Input 
                    type="number"
                    id="childPrice" 
                    value={formData.childPrice} 
                    onChange={e => setFormData({...formData, childPrice: parseInt(e.target.value) || 0})} 
                    required 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGroupSize">Max Group</Label>
                  <Input 
                    type="number"
                    id="maxGroupSize" 
                    value={formData.maxGroupSize} 
                    onChange={e => setFormData({...formData, maxGroupSize: parseInt(e.target.value) || 1})} 
                    required 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input 
                    id="duration" 
                    value={formData.duration} 
                    placeholder="e.g. 7 Days"
                    onChange={e => setFormData({...formData, duration: e.target.value})} 
                    required 
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Dynamic Options Sections */}
              <div className="space-y-6 bg-muted/30 p-6 rounded-[24px]">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-600" />
                  Transport Options
                </h3>
                <div className="space-y-3">
                  {formData.transportOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input 
                        placeholder="Option label" 
                        value={opt.label} 
                        onChange={e => {
                          const newOpts = [...formData.transportOptions];
                          newOpts[i].label = e.target.value;
                          setFormData({...formData, transportOptions: newOpts});
                        }}
                        className="rounded-xl bg-card"
                      />
                      <Input 
                        type="number" 
                        placeholder="Price" 
                        value={opt.price} 
                        onChange={e => {
                          const newOpts = [...formData.transportOptions];
                          newOpts[i].price = parseInt(e.target.value) || 0;
                          setFormData({...formData, transportOptions: newOpts});
                        }}
                        className="rounded-xl bg-card w-24"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          const newOpts = formData.transportOptions.filter((_, idx) => idx !== i);
                          setFormData({...formData, transportOptions: newOpts});
                        }}
                        className="text-red-500 hover:text-red-700 h-10 w-10 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData({...formData, transportOptions: [...formData.transportOptions, { label: "", price: 0 }]})}
                    className="w-full rounded-xl border-dashed border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transport Option
                  </Button>
                </div>
              </div>

              <div className="space-y-6 bg-muted/30 p-6 rounded-[24px]">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-emerald-600" />
                  Accommodation Options
                </h3>
                <div className="space-y-3">
                  {formData.accommodationOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input 
                        placeholder="Room type" 
                        value={opt.label} 
                        onChange={e => {
                          const newOpts = [...formData.accommodationOptions];
                          newOpts[i].label = e.target.value;
                          setFormData({...formData, accommodationOptions: newOpts});
                        }}
                        className="rounded-xl bg-card"
                      />
                      <Input 
                        type="number" 
                        placeholder="+/- Price" 
                        value={opt.priceAdjustment} 
                        onChange={e => {
                          const newOpts = [...formData.accommodationOptions];
                          newOpts[i].priceAdjustment = parseInt(e.target.value) || 0;
                          setFormData({...formData, accommodationOptions: newOpts});
                        }}
                        className="rounded-xl bg-card w-24"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          const newOpts = formData.accommodationOptions.filter((_, idx) => idx !== i);
                          setFormData({...formData, accommodationOptions: newOpts});
                        }}
                        className="text-red-500 hover:text-red-700 h-10 w-10 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData({...formData, accommodationOptions: [...formData.accommodationOptions, { label: "", priceAdjustment: 0 }]})}
                    className="w-full rounded-xl border-dashed border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room Type
                  </Button>
                </div>
              </div>

              <div className="space-y-6 bg-muted/30 p-6 rounded-[24px]">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Optional Add-ons
                </h3>
                <div className="space-y-3">
                  {formData.addOns.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input 
                        placeholder="Add-on name" 
                        value={opt.label} 
                        onChange={e => {
                          const newOpts = [...formData.addOns];
                          newOpts[i].label = e.target.value;
                          setFormData({...formData, addOns: newOpts});
                        }}
                        className="rounded-xl bg-card"
                      />
                      <Input 
                        type="number" 
                        placeholder="Price" 
                        value={opt.price} 
                        onChange={e => {
                          const newOpts = [...formData.addOns];
                          newOpts[i].price = parseInt(e.target.value) || 0;
                          setFormData({...formData, addOns: newOpts});
                        }}
                        className="rounded-xl bg-card w-24"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => {
                          const newOpts = formData.addOns.filter((_, idx) => idx !== i);
                          setFormData({...formData, addOns: newOpts});
                        }}
                        className="text-red-500 hover:text-red-700 h-10 w-10 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData({...formData, addOns: [...formData.addOns, { label: "", price: 0 }]})}
                    className="w-full rounded-xl border-dashed border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mealPlan">Meal Plan</Label>
                  <Select 
                    value={formData.mealPlan} 
                    onValueChange={val => setFormData({...formData, mealPlan: val})}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select meal plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Room Only">Room Only</SelectItem>
                      <SelectItem value="Bed & Breakfast">Bed & Breakfast</SelectItem>
                      <SelectItem value="Half Board">Half Board</SelectItem>
                      <SelectItem value="Full Board">Full Board</SelectItem>
                      <SelectItem value="All Inclusive">All Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input 
                    id="tags" 
                    placeholder="e.g. Beach, Adventure, Family"
                    value={formData.tags.join(', ')} 
                    onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} 
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Dates (JSON array or comma separated)</Label>
                <Input 
                  placeholder="e.g. 2024-05-15, 2024-06-20" 
                  value={formData.availableDates.join(', ')} 
                  onChange={e => setFormData({...formData, availableDates: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})} 
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="image">Package Image</Label>
                  <label className="text-xs font-bold text-emerald-600 cursor-pointer hover:underline flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    Upload from computer
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                
                {formData.image && (
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden group border border-border/50">
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <Input 
                  id="image" 
                  placeholder="Or paste image URL here..."
                  value={formData.image} 
                  onChange={e => setFormData({...formData, image: e.target.value})} 
                  required 
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required 
                  rows={4}
                  className="rounded-xl resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  id="isActive" 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">Show in public listings</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-xl font-bold shadow-lg shadow-emerald-100"
                >
                  {editingDest ? "Update Package" : "Create Package"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Reviews Section Component
function ReviewsSection() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED">("ALL");

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Review ${status.toLowerCase()} successfully`);
        loadReviews();
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        loadReviews();
      }
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filter === "ALL") return true;
    return r.status === filter;
  });

  const stats = {
    average: reviews.length ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0,
    total: reviews.length,
    pending: reviews.filter(r => r.status === "PENDING").length,
    fiveStars: reviews.length ? Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100) : 0
  };

  return (
    <div className="w-full text-left">
      <div className="mb-8">
        <h2 className="text-xl md:text-3xl font-bold text-foreground">Customer Reviews</h2>
        <p className="text-gray-500 text-sm md:text-base mt-1">Manage and moderate customer reviews</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { label: "Average Rating", value: stats.average, sub: "stars", icon: Star, color: "text-amber-500" },
          { label: "Total Reviews", value: stats.total, sub: "reviews", icon: MessageSquare, color: "text-emerald-600" },
          { label: "Pending Approval", value: stats.pending, sub: "requires action", icon: Clock, color: "text-amber-600" },
          { label: "5-Star Reviews", value: `${stats.fiveStars}%`, sub: "satisfaction", icon: Crown, color: "text-indigo-600" }
        ].map((s, i) => (
          <div key={i} className="bg-card p-6 rounded-[24px] border border-border/50 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-muted/30 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground leading-none">{s.value}</p>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">{s.label}</p>
            {s.label === "Average Rating" && (
              <div className="flex gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-3 h-3 ${star <= Number(stats.average) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} 
                    />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-card rounded-[32px] border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold text-foreground text-lg">All Reviews</h3>
          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl w-fit">
            {(["ALL", "PENDING", "APPROVED"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-gray-500 hover:text-foreground"
                }`}
              >
                {f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              No reviews found matching the filter.
            </div>
          ) : filteredReviews.map((r) => (
            <div 
              key={r.id} 
              className={`p-6 rounded-[24px] border ${
                r.status === "PENDING" 
                  ? "bg-amber-50/30 border-amber-100" 
                  : "bg-card border-border/50"
              } transition-all relative group`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarImage src={r.user.avatar} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                      {r.user.firstName[0]}{r.user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="mb-2">
                        <p className="font-bold text-foreground">{r.user.firstName} {r.user.lastName}</p>
                        <p className="text-xs text-gray-400 font-medium">
                          {r.destination?.title || "General Feedback"}
                        </p>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} 
                            />
                        ))}
                      </div>
                      <h4 className="font-bold text-foreground text-base">{r.title}</h4>
                    </div>
                    {r.status === "PENDING" && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {r.content}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-xs">
                      {new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2">
                      {r.status === "PENDING" && (
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 h-9 px-4"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </Button>
                      )}
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Booking Calendar Section Component
function CalendarSection() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [bookings, setBookings] = useState<any[]>([]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings`);
      const data = await res.json();
      if (data?.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings for calendar:", error);
    }
  }, []);

  useEffect(() => {
    const load = async () => { await fetchBookings(); };
    load();
  }, [fetchBookings]);

  // Re-fetch on any booking WebSocket event
  useRealtime({
    userId: user?.id,
    role: user?.role,
    onBookingUpdate: () => { fetchBookings(); },
  });

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(1);
  };
  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(1);
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Filter to the viewed month
  const monthBookings = bookings.filter(b => {
    const d = new Date(b.createdAt);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  // Per-day booking counts for calendar dots
  const dayBookingCounts = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const count = monthBookings.filter(b => new Date(b.createdAt).getDate() === day).length;
    return { day, bookings: count };
  }).filter(d => d.bookings > 0);

  // Selected day bookings for side panel
  const selectedDayBookings = monthBookings
    .filter(b => new Date(b.createdAt).getDate() === selectedDate)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(b => ({
      time: new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customer: `Booking #${b.bookingId}`,
      detail: b.type === "FLIGHT" ? "Flight Reservation" : "Tour Package",
      status: (b.status || "PENDING").toLowerCase(),
    }));

  // Weekly overview — week containing selectedDate
  const selectedFullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
  const dow = selectedFullDate.getDay() === 0 ? 6 : selectedFullDate.getDay() - 1;
  const startOfWeek = new Date(selectedFullDate);
  startOfWeek.setDate(selectedFullDate.getDate() - dow);

  const weeklyStats = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
    const cur = new Date(startOfWeek);
    cur.setDate(startOfWeek.getDate() + idx);
    const count = bookings.filter(b => {
      const d = new Date(b.createdAt);
      return d.getDate() === cur.getDate() && d.getMonth() === cur.getMonth() && d.getFullYear() === cur.getFullYear();
    }).length;
    const maxBookings = 5;
    return { day: dayName, count, fill: Math.min((count / maxBookings) * 100, 100), dateRef: cur.getDate() };
  });

  return (
    <div className="w-full text-left">
      <div className="mb-6 md:mb-8 text-left">
        <h2 className="text-xl md:text-3xl font-bold text-foreground">Booking Calendar</h2>
        <p className="text-gray-500 text-sm md:text-base mt-2">View and manage bookings by date</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start mb-6">
        {/* Calendar Card */}
        <div className="flex-1 bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-gray-100 w-full overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg md:text-xl font-bold text-foreground">
                {currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200" onClick={prevMonth}>
                  <ChevronLeft className="w-5 h-5 text-stone-600" />
                </Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-gray-200" onClick={nextMonth}>
                  <ChevronRight className="w-5 h-5 text-stone-600" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-400">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {/* Leading empty slots */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-[4/3] md:h-[100px]" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const hasBookings = dayBookingCounts.find(d => d.day === day);
                const isSelected = day === selectedDate;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "flex flex-col relative p-2 md:p-3 aspect-[4/3] md:h-[100px] rounded-xl transition-all cursor-pointer border-2",
                      isSelected ? "border-emerald-200 bg-card shadow-sm ring-1 ring-emerald-50" : "border-transparent hover:bg-muted/30",
                      hasBookings && !isSelected ? "bg-muted/30/50" : ""
                    )}
                  >
                    <span className={cn("text-sm md:text-base font-semibold", isSelected ? "text-emerald-700" : "text-stone-700")}>
                      {day}
                    </span>
                    {hasBookings && (
                      <div className="mt-auto hidden sm:block">
                        <div className="flex gap-1 mb-1.5 flex-wrap">
                          {Array.from({ length: Math.min(hasBookings.bookings, 4) }).map((_, i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          ))}
                        </div>
                        <p className="text-[10px] md:text-xs text-emerald-600 font-medium">
                          {hasBookings.bookings} booking{hasBookings.bookings > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    {hasBookings && (
                      <div className="mt-auto block sm:hidden">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mb-1" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Day's Bookings Panel */}
        <div className="w-full lg:w-[380px] shrink-0 bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-bold text-foreground">Day&apos;s Bookings</h3>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate)
                .toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {selectedDayBookings.length > 0 ? selectedDayBookings.map((b, i) => (
                <div key={i} className="bg-[#fafaf9] rounded-2xl p-4 md:p-5 border border-transparent hover:border-emerald-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[13px] font-semibold text-emerald-600">{b.time}</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold tracking-wider",
                      b.status === 'confirmed' ? "bg-emerald-100/60 text-emerald-700" : "bg-amber-100/60 text-amber-700"
                    )}>
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-foreground text-[14px] md:text-[15px]">{b.customer}</h4>
                  <p className="text-xs font-medium text-gray-500 mt-1.5">{b.detail}</p>
                </div>
              )) : (
                <div className="text-center py-10 bg-muted/30 rounded-xl border border-dashed border-gray-200">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">No bookings on this day.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Overview Panel */}
      <div className="w-full bg-card rounded-2xl md:rounded-[24px] shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-6">Weekly Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
            {weeklyStats.map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "bg-[#fafaf9] rounded-2xl p-4 flex flex-col items-center justify-between border transition-colors aspect-[4/5] min-w-[100px]",
                  stat.dateRef === selectedDate ? "border-emerald-300 ring-1 ring-emerald-50" : "border-transparent hover:border-emerald-100"
                )}
              >
                <div className="text-center w-full">
                  <p className="text-sm font-semibold text-foreground mb-2">{stat.day}</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-600 leading-none">{stat.count}</p>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-1">bookings</p>
                </div>
                <div className="w-full h-16 md:h-20 bg-gray-200/60 rounded-xl relative overflow-hidden mt-4">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-emerald-500 rounded-lg transition-all duration-500"
                    style={{ height: `${stat.fill}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Legal Documents Section Component
function LegalSection() {
  const { legalDocuments, updateLegalSection, saveLegalDocuments } = useVistaStore();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  // Local state for editing before save
  const [privacyPolicy, setPrivacyPolicy] = useState(legalDocuments.privacyPolicy);
  const [termsOfService, setTermsOfService] = useState(legalDocuments.termsOfService);

  // Update local state when global state changes (e.g. on mount or sync)
  useEffect(() => {
    setPrivacyPolicy(legalDocuments.privacyPolicy);
    setTermsOfService(legalDocuments.termsOfService);
  }, [legalDocuments]);

  const currentSections = activeTab === 'privacy' ? privacyPolicy : termsOfService;
  const setCurrentSections = activeTab === 'privacy' ? setPrivacyPolicy : setTermsOfService;

  const addSection = () => {
    setCurrentSections([...currentSections, { title: '', content: '' }]);
  };

  const removeSection = (index: number) => {
    setCurrentSections(currentSections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: 'title' | 'content', value: string) => {
    const newSections = [...currentSections];
    newSections[index] = { ...newSections[index], [field]: value };
    setCurrentSections(newSections);
  };

  const { user } = useAuthStore();

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in to save legal documents");
      return;
    }
    
    try {
      await saveLegalDocuments(activeTab, currentSections, user.id);
      toast.success(`${activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} saved successfully!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save legal documents";
      toast.error(message);
    }
  };

  return (
    <div className="w-full text-left">
      <div className="mb-8 px-1">
        <h2 className="text-xl md:text-3xl font-bold text-foreground">Legal Documents</h2>
        <p className="text-gray-500 text-sm md:text-base mt-1">Manage Privacy Policy and Terms of Service content</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-gray-100 rounded-2xl mb-10 mx-1">
        <button
          onClick={() => setActiveTab('privacy')}
          className={cn(
            "px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
            activeTab === 'privacy'
              ? "bg-card text-foreground shadow-md"
              : "text-gray-500 hover:text-foreground"
          )}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={cn(
            "px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
            activeTab === 'terms'
              ? "bg-card text-foreground shadow-md"
              : "text-gray-500 hover:text-foreground"
          )}
        >
          Terms of Service
        </button>
      </div>

      <div className="bg-card rounded-[32px] shadow-sm ring-1 ring-gray-100 p-8 md:p-10 border border-gray-50">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-xl font-bold text-foreground">
            {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} Sections
          </h3>
          <button
            onClick={addSection}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        <div className="space-y-6">
          {currentSections.map((section, index) => (
            <div key={index} className="p-6 md:p-8 bg-muted/50 rounded-[28px] relative border border-border/50 group transition-all hover:bg-card hover:shadow-xl hover:shadow-gray-100/50 hover:border-emerald-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-gray-400">Section {index + 1}</span>
                <button
                  onClick={() => removeSection(index)}
                  className="p-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-stone-700 px-0.5">Section Title</label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-foreground"
                    placeholder="Enter title"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-stone-700 px-0.5">Content</label>
                  <textarea
                    rows={4}
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    className="w-full px-4 py-3 bg-card border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium text-foreground leading-relaxed resize-none"
                    placeholder="Enter content"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
            onClick={handleSave}
          >
            Save {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Admin Sidebar Items
const adminSidebarItems = [
  { id: "dashboard", label: "Overview", icon: BarChart3, count: null },
  { id: "notifications", label: "Notifications", icon: Bell, count: "dynamic" },
  { id: "analytics", label: "Analytics", icon: Target, count: null },
  { id: "calendar", label: "Calendar", icon: Calendar, count: null },
  { id: "bookings", label: "Bookings", icon: Calendar, count: 12 },
  { id: "flight_bookings", label: "Flight Bookings", icon: Plane, count: null },
  { id: "messages", label: "Messages", icon: MessageSquare, count: "messages" },
  { id: "support_tickets", label: "Support Tickets", icon: Headset, count: "support" },
  { id: "customers", label: "Customers", icon: Users, count: null },
  { id: "reviews", label: "Reviews", icon: Star, count: null },
  { id: "tours_packages", label: "Tours & Packages", icon: Package, count: null },
  { id: "legal_documents", label: "Legal Documents", icon: Scale, count: null },
  { id: "vouchers", label: "Vouchers", icon: Gift, count: null },
  { id: "settings", label: "Settings", icon: Settings, count: null },
];

// Vouchers Management Section
function VouchersSection() {
  const { vouchers, addVoucher, updateVoucherStatus, removeVoucher } = useVistaStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 200,
    validUntil: "",
    applicableTo: "all" as "flights" | "tours" | "all",
    applicableToUser: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVoucher: Voucher = {
      id: "v" + Date.now(),
      ...formData,
      validFrom: new Date().toISOString(),
      status: "active",
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    addVoucher(newVoucher);
    setIsModalOpen(false);
    toast.success("Voucher created successfully!");
    setFormData({
      code: "",
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minPurchase: 0,
      maxDiscount: 200,
      validUntil: "",
      applicableTo: "all",
      applicableToUser: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Voucher Management
            <span className="flex items-center justify-center bg-amber-100 text-amber-700 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black">
              Internal Tools
            </span>
          </h2>
          <p className="text-gray-500 font-medium">Create and manage discount codes for Vista customers.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 text-white hover:bg-stone-800 rounded-2xl px-6 py-3 shadow-xl transition-all active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate New Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.map((voucher) => (
          <Card key={voucher.id} className={cn(
            "rounded-[32px] border-none shadow-xl transition-all hover:shadow-2xl overflow-hidden relative group",
            voucher.status === "expired" ? "opacity-60 saturate-50" : "bg-card"
          )}>
            {voucher.applicableToUser && (
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200">
                  <User className="w-3 h-3" />
                  Targeted
                </div>
              </div>
            )}
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg",
                  voucher.applicableTo === "flights" ? "bg-emerald-50 text-emerald-600" : 
                  voucher.applicableTo === "tours" ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-600"
                )}>
                  <Tag className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{voucher.title}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400 mt-1">{voucher.applicableTo} ONLY</p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <code className="text-xl font-black text-emerald-600 font-mono tracking-tighter tracking-widest">
                    {voucher.code}
                  </code>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discount</p>
                    <p className="text-2xl font-black text-foreground">
                      {voucher.discountType === "percentage" ? `${voucher.discountValue}%` : `$${voucher.discountValue}`}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{voucher.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Min Purchase</p>
                  <p className="text-sm font-bold text-foreground">${voucher.minPurchase}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Expires</p>
                  <p className="text-sm font-bold text-foreground">{new Date(voucher.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateVoucherStatus(voucher.id, voucher.status === "active" ? "expired" : "active")}
                  className={cn(
                    "flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    voucher.status === "active" ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100"
                  )}
                >
                  {voucher.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button 
                  onClick={() => removeVoucher(voucher.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Voucher Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[40px] shadow-2xl">
          <DialogHeader className="p-8 md:p-12 bg-stone-900 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-white mb-2">Generate Voucher</DialogTitle>
            <DialogDescription className="text-stone-400 font-medium text-lg leading-relaxed">
              Define the campaign parameters and discount rules for this new voucher code.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 md:p-12 bg-card">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Voucher Code</Label>
                  <Input 
                    placeholder="e.g. SUMMER2024" 
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="h-14 rounded-2xl border-border/50 bg-muted/30/50 font-black text-foreground uppercase"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Applies To</Label>
                  <select 
                    value={formData.applicableTo}
                    onChange={e => setFormData({...formData, applicableTo: e.target.value as any})}
                    className="w-full h-14 rounded-2xl border-border/50 bg-muted/30/50 px-4 font-bold text-foreground focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="all">All Services</option>
                    <option value="flights">Flights Only</option>
                    <option value="tours">Tours Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Campaign Title</Label>
                <Input 
                  placeholder="e.g. Early Bird Summer Discount" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="h-14 rounded-2xl border-border/50 bg-muted/30/50 font-bold text-foreground"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Rules & Conditions</Label>
                <textarea 
                  placeholder="Describe the offer and any restrictions..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full h-24 rounded-2xl border-border/50 bg-muted/30/50 px-4 py-3 font-medium text-foreground focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Discount Type</Label>
                   <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50">
                     <button
                       type="button"
                       onClick={() => setFormData({...formData, discountType: 'percentage'})}
                       className={cn("flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.discountType === 'percentage' ? "bg-card shadow-sm text-foreground" : "text-stone-400")}
                     >
                       Percentage
                     </button>
                     <button
                       type="button"
                       onClick={() => setFormData({...formData, discountType: 'fixed'})}
                       className={cn("flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", formData.discountType === 'fixed' ? "bg-card shadow-sm text-foreground" : "text-stone-400")}
                     >
                       Fixed Amount
                     </button>
                   </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">
                    Value {formData.discountType === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input 
                    type="number" 
                    value={formData.discountValue} 
                    onChange={e => setFormData({...formData, discountValue: parseInt(e.target.value) || 0})}
                    className="h-14 rounded-2xl border-border/50 bg-muted/30/50 font-black text-foreground text-center text-xl"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Min Purchase ($)</Label>
                  <Input 
                    type="number" 
                    value={formData.minPurchase} 
                    onChange={e => setFormData({...formData, minPurchase: parseInt(e.target.value) || 0})}
                    className="h-14 rounded-2xl border-border/50 bg-muted/30/50 font-black text-foreground"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-stone-500 ml-1">Target User ID (Optional)</Label>
                  <Input 
                    placeholder="Empty for all users"
                    value={formData.applicableToUser} 
                    onChange={e => setFormData({...formData, applicableToUser: e.target.value})}
                    className="h-14 rounded-2xl border-border/50 bg-muted/30/50 font-medium text-foreground"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-16 bg-stone-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-2xl shadow-stone-100 active:scale-95"
                >
                  Confirm & Initialize Campaign
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Admin Sidebar Content Component
function AdminSidebarContent({
  onClose,
  activeSection,
  onSectionChange
}: {
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const { unreadNotificationCount, wishlist, unreadSupportTicketCount, contactMessages } = useVistaStore();

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold font-serif italic">Vista.</h2>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1 md:space-y-2">
          {adminSidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all text-sm md:text-base",
                activeSection === item.id
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : "text-white/70 hover:bg-stone-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.count === "dynamic" ? (
                unreadNotificationCount > 0 && (
                  <span className="ml-auto bg-emerald-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {unreadNotificationCount}
                  </span>
                )
              ) : item.count === "wishlist" ? (
                wishlist.length > 0 && (
                  <span className="ml-auto bg-pink-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {wishlist.length}
                  </span>
                )
              ) : item.count === "support" ? (
                unreadSupportTicketCount > 0 && (
                  <span className="ml-auto bg-orange-500 text-xs px-2 py-0.5 md:py-1 rounded-full animate-pulse">
                    {unreadSupportTicketCount}
                  </span>
                )
              ) : item.count === "messages" ? (
                contactMessages.length > 0 && (
                  <span className="ml-auto bg-blue-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {contactMessages.length}
                  </span>
                )
              ) : item.count && (
                <span className="ml-auto bg-emerald-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div >


    </>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { adminSection, setAdminSection, tickets, contactMessages, setPage, notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead, deleteNotification, deleteAllNotifications, vouchers, setWishlist } = useVistaStore();
  const { isAuthenticated, user, getLoyaltyInfo } = useAuthStore();
  const loyaltyInfo = getLoyaltyInfo();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [adminSection]);

  // Fetch wishlist for admin
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchWishlist = async () => {
        try {
          const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(user.id)}`);
          const data = await res.json();
          if (data.success && data.wishlist) {
            setWishlist(data.wishlist);
          }
        } catch (err) {
          console.error("Failed to fetch wishlist", err);
        }
      };
      fetchWishlist();
    }
  }, [isAuthenticated, user, setWishlist]);
  const activeVouchers = vouchers.filter(v => v.status === "active");

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <section className="pt-20 min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-gray-500 mb-8 max-w-md">
            You must be signed in to access the admin dashboard. Please sign in to continue.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-semibold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button
              onClick={() => setPage("home")}
              variant="outline"
              className="px-8 py-3 rounded-full font-semibold"
            >
              Go Home
            </Button>
          </div>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </section>
    );
  }

  const stats = [
    {
      title: "Total Bookings",
      value: "1,247",
      icon: Calendar,
      color: "emerald",
      change: "+12%",
      changeType: "up",
    },
    {
      title: "Revenue",
      value: "$89,450",
      icon: DollarSign,
      color: "blue",
      change: "+8.5%",
      changeType: "up",
    },
    {
      title: "Customers",
      value: "3,892",
      icon: Users,
      color: "purple",
      change: "+15%",
      changeType: "up",
    },
    {
      title: "E-Tickets Issued",
      value: "856",
      icon: Ticket,
      color: "orange",
      change: "+22%",
      changeType: "up",
    },
  ];

  const recentBookings = [
    { id: "#BK-2024-001", customer: "Sarah Jenkins", type: "Bali Tour", date: "Jan 15, 2024", amount: "$1,250", status: "confirmed" },
    { id: "#BK-2024-002", customer: "Michael Brown", type: "LUN→LVI Flight", date: "Jan 16, 2024", amount: "$185", status: "pending" },
    { id: "#BK-2024-003", customer: "Emily Wilson", type: "Swiss Alps", date: "Jan 17, 2024", amount: "$3,600", status: "confirmed" },
    { id: "#BK-2024-004", customer: "John Doe", type: "LUN→JNB Flight", date: "Jan 18, 2024", amount: "$320", status: "confirmed" },
  ];

  return (
    <section className="pt-16 md:pt-20">
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-white overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <AdminSidebarContent
            onClose={() => setSidebarOpen(false)}
            activeSection={adminSection}
            onSectionChange={(id) => setAdminSection(id as typeof adminSection)}
          />
        </aside>

        {/* Desktop Sidebar */}
        <aside className={cn(
          "w-64 bg-stone-900 text-white fixed h-full overflow-y-auto hidden lg:block transition-transform duration-300",
          !desktopSidebarOpen && "-translate-x-full"
        )}>
          <AdminSidebarContent
            onClose={() => setDesktopSidebarOpen(false)}
            activeSection={adminSection}
            onSectionChange={(id) => setAdminSection(id as typeof adminSection)}
          />
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 bg-background p-4 md:p-6 lg:p-8 overflow-x-hidden transition-all duration-300",
          desktopSidebarOpen && "lg:ml-64"
        )}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between mb-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-card shadow-md hover:bg-muted/30"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground font-serif italic">Vista.</h2>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Desktop Toggle Button */}
          <div className="hidden lg:flex items-center gap-3 mb-4">
            <button
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="p-2 rounded-lg bg-card shadow-md hover:bg-muted/30 transition-colors flex items-center gap-2"
              title={desktopSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {desktopSidebarOpen ? (
                <>
                  <X className="w-4 h-4 text-stone-700" />
                  <span className="text-xs text-stone-600 hidden xl:inline">Close Menu</span>
                </>
              ) : (
                <>
                  <Menu className="w-4 h-4 text-stone-700" />
                  <span className="text-xs text-stone-600 hidden xl:inline">Open Menu</span>
                </>
              )}
            </button>
          </div>

          {adminSection === "dashboard" && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-8">
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-foreground">Overview</h1>
                  <p className="text-gray-500 text-xs md:text-base">
                    Welcome back! Here's what's happening today.
                  </p>
                </div>
                <div className="w-full sm:w-auto">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search..."
                      className="pl-10 w-full sm:w-48 bg-card border-gray-200"
                    />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                  >
                    <Card className="rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-0">
                      <CardContent className="p-3 md:p-6">
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                          <div>
                            <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">
                              {stat.title}
                            </p>
                            <h3 className="text-lg md:text-3xl font-bold text-foreground">
                              {stat.value}
                            </h3>
                          </div>
                          <div
                            className={cn(
                              "w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center",
                              stat.color === "emerald" && "bg-emerald-100",
                              stat.color === "blue" && "bg-blue-100",
                              stat.color === "purple" && "bg-purple-100",
                              stat.color === "orange" && "bg-orange-100"
                            )}
                          >
                            <stat.icon
                              className={cn(
                                "w-4 h-4 md:w-6 md:h-6",
                                stat.color === "emerald" && "text-emerald-600",
                                stat.color === "blue" && "text-blue-600",
                                stat.color === "purple" && "text-purple-600",
                                stat.color === "orange" && "text-orange-600"
                              )}
                            />
                          </div>
                        </div>
                        <div className="flex items-center text-xs md:text-sm">
                          <span
                            className={cn(
                              "font-semibold flex items-center",
                              stat.changeType === "up"
                                ? "text-emerald-600"
                                : "text-red-600"
                            )}
                          >
                            {stat.changeType === "up" ? (
                              <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1" />
                            )}
                            {stat.change}
                          </span>
                          <span className="text-gray-400 ml-1 md:ml-2 text-[10px] md:text-sm">vs last month</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>

              {/* Recent Bookings Table */}
              <Card className="rounded-xl md:rounded-2xl shadow-lg border-0">
                <CardHeader className="p-4 md:p-6 border-b border-border/50 flex justify-between items-center">
                  <h3 className="text-base md:text-lg font-bold text-foreground">
                    Recent Bookings
                  </h3>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700 font-semibold text-xs md:text-sm"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase">
                            Booking ID
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase">
                            Customer
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">
                            Type
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">
                            Date
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentBookings.map((booking, index) => (
                          <tr
                            key={index}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium text-foreground">
                              {booking.id}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600">
                              {booking.customer}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden sm:table-cell">
                              {booking.type}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                              {booking.date}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-semibold text-foreground">
                              {booking.amount}
                            </td>
                            <td className="px-4 md:px-6 py-3 md:py-4">
                              <span
                                className={cn(
                                  "px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold",
                                  booking.status === "confirmed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-orange-100 text-orange-700"
                                )}
                              >
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Voucher Panel & Loyalty Rewards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                {/* Active Vouchers Panel */}
                <Card className="rounded-xl md:rounded-2xl shadow-lg border-0">
                  <CardHeader className="p-4 md:p-6 border-b border-border/50 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Gift className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-foreground">
                          Active Vouchers
                        </h3>
                        <p className="text-xs text-gray-500">{activeVouchers.length} vouchers available</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {activeVouchers.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {activeVouchers.map((voucher) => (
                          <div
                            key={voucher.id}
                            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 md:p-4 border border-amber-100 hover:border-amber-200 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-foreground text-sm md:text-base truncate">{voucher.title}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{voucher.description}</p>
                              </div>
                              <span className={cn(
                                "ml-2 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold flex-shrink-0",
                                voucher.applicableTo === "flights" && "bg-sky-100 text-sky-700",
                                voucher.applicableTo === "tours" && "bg-emerald-100 text-emerald-700",
                                voucher.applicableTo === "all" && "bg-purple-100 text-purple-700"
                              )}>
                                {voucher.applicableTo}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-2">
                                <code className="bg-card px-2 py-1 rounded-md text-xs md:text-sm font-mono font-bold text-amber-700 border border-amber-200">
                                  {voucher.code}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(voucher.code);
                                    toast.success("Code copied!");
                                  }}
                                >
                                  <Copy className="w-3 h-3 text-gray-500" />
                                </Button>
                              </div>
                              <span className="text-lg md:text-xl font-bold text-amber-600">
                                {voucher.discountType === "percentage" ? `${voucher.discountValue}%` : `$${voucher.discountValue}`}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-[10px] md:text-xs text-gray-500">
                              <span>Min. purchase: ${voucher.minPurchase}</span>
                              <span>Expires: {voucher.validUntil ? new Date(voucher.validUntil).toLocaleDateString() : 'N/A'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No active vouchers</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Loyalty Rewards Panel */}
                <Card className="rounded-xl md:rounded-2xl shadow-lg border-0">
                  <CardHeader className="p-4 md:p-6 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-foreground">
                          Loyalty Rewards
                        </h3>
                        <p className="text-xs text-gray-500">Member since {loyaltyInfo?.memberSince ? new Date(loyaltyInfo.memberSince).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    {/* Current Tier Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-2xl md:text-3xl shadow-lg"
                          style={{ backgroundColor: loyaltyInfo.currentTier.color + '20' }}
                        >
                          {loyaltyInfo.currentTier.icon}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">Current Tier</p>
                          <p className="text-lg md:text-xl font-bold text-foreground">{loyaltyInfo.currentTier.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Points</p>
                        <p className="text-2xl md:text-3xl font-bold text-purple-600">{loyaltyInfo.currentPoints.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Progress to Next Tier */}
                    {loyaltyInfo.nextTier && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{loyaltyInfo.currentTier.name}</span>
                          <span>{loyaltyInfo.pointsToNextTier} pts to {loyaltyInfo.nextTier.name}</span>
                          <span>{loyaltyInfo.nextTier.name}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, ((loyaltyInfo.currentPoints - loyaltyInfo.currentTier.minPoints) /
                                (loyaltyInfo.nextTier.minPoints - loyaltyInfo.currentTier.minPoints)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Points Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4">
                      <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
                        <p className="text-lg md:text-xl font-bold text-emerald-600">{loyaltyInfo.pointsPerDollar}x</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Points per $</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
                        <p className="text-lg md:text-xl font-bold text-blue-600">{loyaltyInfo.totalEarned.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Total Earned</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-2 md:p-3 text-center">
                        <p className="text-lg md:text-xl font-bold text-amber-600">{loyaltyInfo.totalRedeemed.toLocaleString()}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">Redeemed</p>
                      </div>
                    </div>

                    {/* Tier Benefits */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {loyaltyInfo.currentTier.name} Benefits
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {loyaltyInfo.currentTier.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] md:text-xs rounded-full border border-purple-100"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {adminSection !== "dashboard" && (
            <div className="text-center py-6 md:py-16">
              {adminSection === "bookings" && (
                <div className="text-left py-0 w-full xl:max-w-7xl">
                  <BookingsSection type="TOUR" userId={user?.id} />
                </div>
              )}
              {adminSection === "messages" && (
                <div className="text-left py-0 w-full">
                  <MessagesSection />
                </div>
              )}
              {adminSection === "tickets" && (
                <>
                  <Ticket className="w-10 h-10 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                    E-Tickets Management
                  </h2>
                  <p className="text-gray-500 text-sm md:text-base">Generate and manage e-tickets</p>
                </>
              )}
              {adminSection === "analytics" && (
                <div className="text-left py-0 w-full">
                  <AnalyticsSection />
                </div>
              )}
              {adminSection === "calendar" && (
                <div className="text-left py-0 w-full xl:max-w-7xl">
                  <CalendarSection />
                </div>
              )}
              {adminSection === "flight_bookings" && (
                <div className="text-left py-0 w-full xl:max-w-7xl">
                  <BookingsSection type="FLIGHT" userId={user?.id} />
                </div>
              )}
              {adminSection === "support_tickets" && (
                <div className="text-left py-0 w-full">
                  <SupportTicketsSection />
                </div>
              )}
              {adminSection === "customers" && (
                <div className="text-left py-0 w-full">
                  <CustomersSection />
                </div>
              )}
              {adminSection === "reviews" && (
                <ReviewsSection />
              )}
              {adminSection === "tours_packages" && (
                <DestinationsSection />
              )}
              {adminSection === "legal_documents" && (
                <div className="text-left py-0 w-full">
                  <LegalSection />
                </div>
              )}
              {adminSection === "notifications" && (
                <NotificationSection />
              )}
              {adminSection === "profile" && (
                <ProfileSection />
              )}
              {adminSection === "wishlist" && (
                <WishlistSection />
              )}
              {adminSection === "settings" && (
                <>
                  <Settings className="w-10 h-10 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                  <h2 className="text-lg md:text-2xl font-bold text-foreground mb-1 md:mb-2">
                    Settings
                  </h2>
                  <p className="text-gray-500 text-sm md:text-base">Configure system settings</p>
                  <div className="mt-6 max-w-3xl mx-auto">
                    <SettingsEditor />
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

// ── Customer Settings Section ────────────────────────────────
function CustomerSettingsSection() {
  const { user, logout } = useAuthStore()
  const { 
    currency, setCurrency, 
    theme, setTheme,
    language, setLanguage,
    notifBooking, setNotifBooking,
    notifPromo, setNotifPromo,
    notifPrice, setNotifPrice,
    notifReminder, setNotifReminder,
    twoFAEnabled, setTwoFAEnabled
  } = useVistaStore()

  // Simplified Toggle for local use
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
        checked ? "bg-emerald-600" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform",
        checked ? "translate-x-5" : "translate-x-0.5"
      )} />
    </button>
  )

  // Use next-themes for actual switching
  const { setTheme: setNextTheme, theme: currentTheme } = useTheme()

  // Change password modal
  const [showPwModal, setShowPwModal] = useState(false)
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwLoading, setPwLoading] = useState(false)

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPw !== confirmPw) {
      toast("Passwords don't match", { description: "New password and confirmation must match." })
      return
    }
    if (newPw.length < 8) {
      toast("Password too short", { description: "Password must be at least 8 characters." })
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (data.success) {
        toast("Password changed!", { description: "Your password has been updated successfully." })
        setShowPwModal(false)
        setCurrentPw(""); setNewPw(""); setConfirmPw("")
      } else {
        toast("Failed", { description: data.error || "Could not update password." })
      }
    } catch {
      toast("Error", { description: "Network error. Please try again." })
    } finally {
      setPwLoading(false)
    }
  }

  function handleDataExport() {
    if (!user) return
    const data = {
      exported: new Date().toISOString(),
      profile: { id: user.id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role },
      note: "Full booking history available in your dashboard under Bookings & Tickets.",
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vista-data-export-${user.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast("Export ready", { description: "Your data has been downloaded." })
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${user?.id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast("Account deleted", { description: "Your account has been permanently removed." })
        logout()
      } else {
        toast("Failed", { description: data.error || "Could not delete account." })
      }
    } catch {
      toast("Error", { description: "Network error. Please try again." })
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your preferences and account options.</p>
      </div>

      {/* Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-foreground">Preferences</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Display Currency</p>
              <p className="text-xs text-gray-400">Prices will be shown in your selected currency.</p>
            </div>
            <select
              value={currency}
              onChange={(e) => { 
                setCurrency(e.target.value as any); 
                toast("Currency updated", { description: `Now showing prices in ${e.target.value}.` }) 
              }}
              className="bg-muted/30 border rounded-lg px-3 py-2 text-sm font-medium"
            >
              <option value="USD">🇺🇸 USD — US Dollar</option>
              <option value="EUR">🇪🇺 EUR — Euro</option>
              <option value="GBP">🇬🇧 GBP — British Pound</option>
              <option value="ZMW">🇿🇲 ZMW — Zambian Kwacha</option>
              <option value="ZAR">🇿🇦 ZAR — South African Rand</option>
            </select>
          </div>
          <hr className="border-border/50" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme Preference</p>
              <p className="text-xs text-gray-400">Switch between light and dark mode.</p>
            </div>
            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => { setTheme("light"); setNextTheme("light"); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  theme === "light" ? "bg-card text-emerald-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Light
              </button>
              <button
                onClick={() => { setTheme("dark"); setNextTheme("dark"); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                  theme === "dark" ? "bg-stone-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                Dark
              </button>
            </div>
          </div>
          <hr className="border-border/50" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Language</p>
              <p className="text-xs text-gray-400">Interface and communication language.</p>
            </div>
            <select
              value={language}
              className="bg-muted/30 border rounded-lg px-3 py-2 text-sm font-medium"
              onChange={(e) => {
                setLanguage(e.target.value);
                toast("Language updated");
              }}
            >
              <option value="en">🌐 English</option>
              <option value="fr">🌐 Français</option>
              <option value="es">🌐 Español</option>
              <option value="pt">🌐 Português</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-foreground">Notifications</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Booking confirmations", desc: "Receive confirmations when you book.", checked: notifBooking, fn: () => setNotifBooking(!notifBooking) },
            { label: "Promotional offers", desc: "Deals, discounts and new destinations.", checked: notifPromo, fn: () => setNotifPromo(!notifPromo) },
            { label: "Price drop alerts", desc: "Alert when a wishlist destination price drops.", checked: notifPrice, fn: () => setNotifPrice(!notifPrice) },
            { label: "Travel reminders", desc: "Reminders before your upcoming trips.", checked: notifReminder, fn: () => setNotifReminder(!notifReminder) },
          ].map(({ label, desc, checked, fn }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground text-sm">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Toggle checked={checked} onChange={fn} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-foreground">Privacy &amp; Security</h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Two-Factor Authentication</p>
              <p className="text-xs text-gray-400">{twoFAEnabled ? "2FA is active on your account." : "Add an extra layer of security."}</p>
            </div>
            <Button
              variant={twoFAEnabled ? "default" : "outline"}
              size="sm"
              className={cn(
                "text-xs transition-all",
                twoFAEnabled ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 shadow-lg" : ""
              )}
              onClick={() => { 
                setTwoFAEnabled(!twoFAEnabled); 
                toast(twoFAEnabled ? "2FA disabled" : "2FA enabled", { 
                  description: twoFAEnabled ? "Two-factor auth has been turned off." : "Your account is now protected with 2FA." 
                }) 
              }}
            >
              {twoFAEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
          <hr className="border-border/50" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Change Password</p>
              <p className="text-xs text-gray-400">Update your login password regularly.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => setShowPwModal(true)}>
              <Lock className="w-3 h-3" /> Change
            </Button>
          </div>
          <hr className="border-border/50" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Active Sessions</p>
              <p className="text-xs text-gray-400">You are currently signed in on this device.</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-600 font-semibold px-2.5 py-1 rounded-full">1 device</span>
          </div>
          <hr className="border-border/50" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Data Export</p>
              <p className="text-xs text-gray-400">Download all your personal data and booking history.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={handleDataExport}>
              <Download className="w-3 h-3" /> Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0">
            <Headset className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">Need help?</p>
            <p className="text-xs text-gray-500">Our support team is available 24/7.</p>
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shrink-0"
            onClick={() => window.open("mailto:support@vistatravel.com?subject=Support Request", "_blank")}
          >
            <Mail className="w-3 h-3 mr-1" /> Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-red-600">Danger Zone</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-foreground text-sm">Delete Account</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently remove your account and all data. This cannot be undone.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs border-red-200 text-red-500 hover:bg-red-50 shrink-0"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Change Password Dialog ── */}
      <Dialog open={showPwModal} onOpenChange={setShowPwModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 8 characters" required minLength={8} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Repeat new password" required />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowPwModal(false)}>Cancel</Button>
              <Button type="submit" disabled={pwLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                {pwLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Saving…</> : "Save Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Account Confirmation Dialog ── */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Account</DialogTitle>
            <DialogDescription>
              This action is <strong>permanent and irreversible</strong>. All your bookings, tickets, and personal data will be erased.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              ⚠️ You are about to permanently delete <strong>{user?.email}</strong>. This cannot be undone.
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Type <span className="font-mono font-bold">DELETE</span> to confirm</Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono border-red-200 focus:border-red-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText("") }}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteConfirmText !== "DELETE" || deleteLoading}
                onClick={handleDeleteAccount}
              >
                {deleteLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-1" />Deleting…</> : "Delete My Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Client Sidebar Items
const clientSidebarItems: { id: AdminSection; label: string; icon: any; count: string | null }[] = [
  { id: "dashboard", label: "Overview", icon: BarChart3, count: null },
  { id: "bookings", label: "Bookings", icon: Calendar, count: null },
  { id: "tickets", label: "E-Tickets", icon: Ticket, count: "tickets" },
  { id: "notifications", label: "Notifications", icon: Bell, count: "notifications" },
  { id: "wishlist", label: "Wishlist", icon: Heart, count: "wishlist" },
  { id: "profile", label: "Profile", icon: User, count: null },
  { id: "settings", label: "Settings", icon: Settings, count: null },
];

// Client Sidebar Content Component
function ClientSidebarContent({
  onClose,
  activeSection,
  onSectionChange,
  ticketsCount,
  wishlistCount,
  notificationCount,
}: {
  onClose: () => void;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  ticketsCount: number;
  wishlistCount: number;
  notificationCount: number;
}) {
  const { user } = useAuthStore();

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold font-serif italic">Vista.</h2>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1 md:space-y-2">
          {clientSidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                onClose();
              }}
              className={cn(
                "w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all text-sm md:text-base",
                activeSection === item.id
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
                  : "text-white/70 hover:bg-stone-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.count === "tickets" ? (
                ticketsCount > 0 && (
                  <span className="ml-auto bg-emerald-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {ticketsCount}
                  </span>
                )
              ) : item.count === "wishlist" ? (
                wishlistCount > 0 && (
                  <span className="ml-auto bg-pink-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {wishlistCount}
                  </span>
                )
              ) : item.count === "notifications" ? (
                notificationCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-xs px-2 py-0.5 md:py-1 rounded-full">
                    {notificationCount}
                  </span>
                )
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 md:p-6 border-t border-stone-800">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400 truncate">Traveler</p>
          </div>
        </div>
      </div>
    </>
  );
}

// User Dashboard (for non-admin authenticated users)
function UserDashboard() {
  const { setPage, vouchers, setWishlist, adminSection, setAdminSection, adminSearchQuery, setAdminSearchQuery, setTickets, unreadNotificationCount } = useVistaStore();
  const { isAuthenticated, user, getLoyaltyInfo } = useAuthStore();
  const loyaltyInfo = getLoyaltyInfo();
  const activeVouchers = vouchers.filter(v => v.status === "active" && (!v.applicableToUser || v.applicableToUser === user?.id));
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalFlights, setTotalFlights] = useState(0);
  const [totalTours, setTotalTours] = useState(0);
  const [totalETickets, setTotalETickets] = useState(0);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ticketsCount, setTicketsCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchCounts = async () => {
      try {
        const userId = user.id;

        // Fetch bookings for user
        const res = await fetch(`/api/bookings?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (data?.success) {
          const userBookings = data.bookings || [];
          setBookings(userBookings);
          setTotalBookings(userBookings.length);
          setTotalFlights(userBookings.filter((b: any) => b.type === 'FLIGHT').length);
          setTotalTours(userBookings.filter((b: any) => b.type === 'TOUR').length);
        }

        // Fetch tickets for user
        const tRes = await fetch(`/api/tickets?userId=${encodeURIComponent(userId)}`);
        const tData = await tRes.json();
        if (tData?.success) {
          const tc = (tData.tickets || []).length;
          setTotalETickets(tc);
          setTicketsCount(tc);
          if (tData.tickets) setTickets(tData.tickets);
        }

        // Fetch wishlist count (best-effort)
        try {
          const wRes = await fetch(`/api/wishlist?userId=${encodeURIComponent(userId)}`);
          const wData = await wRes.json();
          const wl = wData?.items || wData?.wishlist || wData?.wishlistItems || [];
          setWishlist(wl);
          setWishlistCount(wl.length);
        } catch (e) {
          // ignore wishlist errors
        }
      } catch (e) {
        console.error('Error fetching dashboard counts', e);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [isAuthenticated, user]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [adminSection]);

  if (!isAuthenticated || !user) {
    return (
      <section className="pt-20 min-h-screen flex items-center justify-center bg-muted/30">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">My Account</h1>
          <p className="text-gray-500">Please sign in to view your account dashboard.</p>
          <div className="mt-6">
            <Button onClick={() => setPage('home')} variant="outline">Go Home</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-16 md:pt-20">
      <div className="flex min-h-screen">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 text-white overflow-y-auto transform transition-transform duration-300 ease-in-out lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <ClientSidebarContent
            onClose={() => setSidebarOpen(false)}
            activeSection={adminSection}
            onSectionChange={setAdminSection}
            ticketsCount={ticketsCount}
            wishlistCount={wishlistCount}
            notificationCount={unreadNotificationCount}
          />
        </aside>

        {/* Sidebar (desktop only) */}
        <aside className="w-64 bg-stone-900 text-white fixed h-full z-30 overflow-y-auto hidden lg:block">
          <ClientSidebarContent
            onClose={() => { }}
            activeSection={adminSection}
            onSectionChange={setAdminSection}
            ticketsCount={ticketsCount}
            wishlistCount={wishlistCount}
            notificationCount={unreadNotificationCount}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-background p-4 md:p-6 lg:p-8 lg:ml-64">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-card shadow-md hover:bg-muted/30">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-lg font-bold text-foreground font-serif italic">Vista.</h2>
            <div className="w-9" />
          </div>

          {adminSection === 'dashboard' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-foreground">Overview</h1>
                  <p className="text-gray-500 text-sm">Account overview and your recent activity.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="rounded-xl">
                  <CardContent>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                    <h3 className="text-2xl font-bold">{loading ? '—' : totalBookings}</h3>
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent>
                    <p className="text-xs text-gray-500">Total Flights</p>
                    <h3 className="text-2xl font-bold">{loading ? '—' : totalFlights}</h3>
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent>
                    <p className="text-xs text-gray-500">Total Tours</p>
                    <h3 className="text-2xl font-bold">{loading ? '—' : totalTours}</h3>
                  </CardContent>
                </Card>
                <Card className="rounded-xl">
                  <CardContent>
                    <p className="text-xs text-gray-500">Total E-Tickets</p>
                    <h3 className="text-2xl font-bold">{loading ? '—' : totalETickets}</h3>
                  </CardContent>
                </Card>
              </div>
                <Card className="rounded-2xl border-border/50 shadow-sm mb-6">
                  <CardHeader className="p-6 border-b border-stone-50">
                    <h3 className="text-lg font-bold text-foreground">Recent Bookings</h3>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loading ? (
                      <p className="text-sm text-gray-500">Loading...</p>
                    ) : bookings.length === 0 ? (
                      <p className="text-sm text-gray-500">You have no bookings yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {bookings.slice(0, 5).map((b: any) => (
                          <div key={b.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs",
                                b.type === 'FLIGHT' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                              )}>
                                {b.type === 'FLIGHT' ? '✈️' : b.type === 'TOUR' ? '🏞️' : '🏨'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground">{b.bookingId}</p>
                                <p className="text-xs text-stone-400 font-medium">
                                  {b.type} • {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-foreground">{b.totalAmount ? `$${b.totalAmount}` : '—'}</p>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-tighter",
                                b.status === 'CONFIRMED' ? "text-emerald-500" : "text-amber-500"
                              )}>
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              {/* Reward Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Active Vouchers Card */}
                <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden flex flex-col">
                  <CardHeader className="p-6 border-b border-stone-50 flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Active Vouchers</h3>
                      <p className="text-xs text-stone-400 font-medium">{activeVouchers.length} vouchers available</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4 flex-1">
                    {activeVouchers.map((voucher) => (
                      <div key={voucher.id} className="relative group">
                        <div className="flex bg-amber-50/40 rounded-2xl border border-amber-100/50 overflow-hidden">
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-foreground">{voucher.title}</h4>
                                <p className="text-xs text-stone-500 mt-1 leading-relaxed">{voucher.description}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-sky-100 text-sky-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                {voucher.applicableTo}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-card border border-amber-200 rounded-lg text-xs font-bold text-amber-600 flex items-center gap-2">
                                  {voucher.code}
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(voucher.code);
                                      toast.success("Code copied to clipboard!");
                                    }}
                                    className="hover:text-amber-800 transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xl font-black text-amber-600">
                                  {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `$${voucher.discountValue}`}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-200/20">
                              <p className="text-[10px] text-stone-400 font-medium">Min. purchase: ${voucher.minPurchase}</p>
                              <p className="text-[10px] text-stone-400 font-medium text-right">Expires: {new Date(voucher.validUntil).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className={cn(
                            "w-1.5 h-full",
                            voucher.applicableTo === 'flights' ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Loyalty Rewards Card */}
                <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="p-6 border-b border-stone-50 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Loyalty Rewards</h3>
                        <p className="text-xs text-stone-400 font-medium">Member since {new Date(loyaltyInfo.memberSince || user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Tier Info */}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-3xl shadow-sm">
                          {loyaltyInfo.currentTier.id === 'gold' ? '🥇' : loyaltyInfo.currentTier.id === 'silver' ? '🥈' : '🥉'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Current Tier</p>
                          <h4 className="text-2xl font-black text-foreground tracking-tight">{loyaltyInfo.currentTier.name}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-400 mb-1">Points</p>
                        <p className="text-4xl font-black text-indigo-600 tracking-tighter">{loyaltyInfo.currentPoints.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-stone-400 uppercase tracking-widest">
                        <span>{loyaltyInfo.currentTier.name}</span>
                        <span className="text-foreground">{loyaltyInfo.nextTier ? `${loyaltyInfo.pointsToNextTier.toLocaleString()} pts to ${loyaltyInfo.nextTier.name}` : 'Max Tier'}</span>
                        <span>{loyaltyInfo.nextTier?.name || ''}</span>
                      </div>
                      <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden p-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)] transition-all duration-1000"
                          style={{ 
                            width: loyaltyInfo.nextTier 
                              ? `${Math.max(5, ((loyaltyInfo.currentPoints - loyaltyInfo.currentTier.minPoints) / (loyaltyInfo.nextTier.minPoints - loyaltyInfo.currentTier.minPoints)) * 100)}%` 
                              : '100%' 
                          }}
                        />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/30/50 rounded-2xl p-4 border border-border/50/50 text-center">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Multiplier</p>
                        <p className="text-lg font-black text-emerald-600">{loyaltyInfo.pointsPerDollar}x</p>
                        <p className="text-[8px] font-bold text-stone-400 mt-0.5">Points per $</p>
                      </div>
                      <div className="bg-muted/30/50 rounded-2xl p-4 border border-border/50/50 text-center">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Earnings</p>
                        <p className="text-lg font-black text-indigo-600">{loyaltyInfo.totalEarned.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-stone-400 mt-0.5">Total Earned</p>
                      </div>
                      <div className="bg-muted/30/50 rounded-2xl p-4 border border-border/50/50 text-center">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Rewards</p>
                        <p className="text-lg font-black text-foreground">{loyaltyInfo.totalRedeemed.toLocaleString()}</p>
                        <p className="text-[8px] font-bold text-stone-400 mt-0.5">Redeemed</p>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h5 className="text-xs font-black text-foreground uppercase tracking-widest">{loyaltyInfo.currentTier.name} Benefits</h5>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {loyaltyInfo.currentTier.benefits.map((benefit, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100/50">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </>
          )}

          {adminSection === 'bookings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
                {adminSearchQuery && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setAdminSearchQuery("")}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filter: {adminSearchQuery}
                  </Button>
                )}
              </div>
              <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      Loading bookings...
                    </div>
                  ) : (bookings.filter(b => !adminSearchQuery || b.bookingId.toLowerCase().includes(adminSearchQuery.toLowerCase()))).length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-stone-400" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">No bookings found</h3>
                      <p className="text-gray-500 mt-1">
                        {adminSearchQuery ? `No booking matching "${adminSearchQuery}"` : "You haven't made any bookings yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-50">
                      {bookings
                        .filter(b => !adminSearchQuery || b.bookingId.toLowerCase().includes(adminSearchQuery.toLowerCase()))
                        .map((b: any) => (
                        <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30/50 transition-colors gap-4">
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm bg-card border border-border/50",
                              b.type === 'FLIGHT' ? "text-blue-600" : "text-emerald-600"
                            )}>
                              {b.type === 'FLIGHT' ? '✈️' : '🏞️'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-bold text-foreground">{b.bookingId}</p>
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                                  b.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                )}>
                                  {b.status}
                                </span>
                              </div>
                              <p className="text-sm text-stone-500 font-medium">
                                {b.type === 'FLIGHT' ? `${b.fromCity} → ${b.toCity}` : b.hotelName}
                              </p>
                              <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-tighter font-bold">
                                {new Date(b.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1">
                            <p className="text-lg font-black text-foreground">${b.totalAmount}</p>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-xl border border-border/50">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {adminSection === 'tickets' && (
            <div className="w-full xl:max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">My E-Tickets</h1>
                  <p className="text-gray-500 text-sm font-medium">Manage and download your digital travel documents.</p>
                </div>
                {adminSearchQuery && (
                   <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setAdminSearchQuery("")}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filter
                  </Button>
                )}
              </div>
              <CustomerTicketsView initialSearch={adminSearchQuery} />
            </div>
          )}

          {adminSection === 'wishlist' && (
            <WishlistSection />
          )}

          {adminSection === 'notifications' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                <p className="text-gray-500 text-sm">Stay updated with your travel bookings and offers.</p>
              </div>
              <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border/50">
                <NotificationSection />
              </div>
            </div>
          )}

          {adminSection === 'profile' && (
            <ProfileSection />
          )}

          {adminSection === 'settings' && (
            <CustomerSettingsSection />
          )}
        </main>
      </div>
    </section>
  );
}


// ── Customer Tickets View ────────────────────────────────────
function CustomerTicketsView({ initialSearch = "" }: { initialSearch?: string }) {
  const { tickets } = useVistaStore();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const filteredTickets = tickets.filter(t => 
    !search || 
    t.bookingId?.toLowerCase().includes(search.toLowerCase()) ||
    t.passengerName?.toLowerCase().includes(search.toLowerCase())
  );

  const printableRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<any>(null);

  const handleDownloadPDF = async (ticket: any) => {
    setActiveTicket(ticket);
    setDownloading(ticket.id);
    
    // Give state time to update and render the hidden ticket
    setTimeout(async () => {
      if (!printableRef.current) {
        setDownloading(null);
        setActiveTicket(null);
        return;
      }
      
      try {
        const canvas = await html2canvas(printableRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: 600,
          logging: false, // Set to true if still debugging
          onclone: (clonedDoc) => {
             // Optional: Ensure images are loaded in the clone
             const images = clonedDoc.getElementsByTagName('img');
             return Promise.all(Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
             }));
          }
        });
        
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width / 2, canvas.height / 2],
        });
        
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
        pdf.save(`Vista-Ticket-${ticket.bookingId}.pdf`);
        toast("Success", { description: "Your PDF e-ticket has been saved." });
      } catch (error) {
        console.error("PDF generation error:", error);
        toast("Error", { description: "Failed to generate PDF. Please try again." });
      } finally {
        setDownloading(null);
        setActiveTicket(null);
      }
    }, 500); // Increased timeout to 500ms
  };

  return (
    <div className="space-y-6">
      {/* Hidden printable ticket for capture */}
      <div className="fixed -left-[1000px] top-0 pointer-events-none">
        {activeTicket && (
          <PrintableTicket 
            ref={printableRef}
            data={{
              bookingId: activeTicket.bookingId,
              ticketNumber: activeTicket.ticketNumber || `VT-${activeTicket.bookingId?.slice(0, 4).toUpperCase()}`,
              passengerName: activeTicket.passengerName,
              type: activeTicket.type === 'flight' ? 'FLIGHT' : 'TOUR',
              title: activeTicket.type === 'flight' ? `${activeTicket.fromCity} to ${activeTicket.toCity}` : activeTicket.hotel,
              date: activeTicket.date,
              guests: activeTicket.type === 'flight' ? '1 Adult' : 'Included',
              total: activeTicket.price || 'Included',
              currency: 'USD',
              status: activeTicket.status || 'Confirmed'
            }}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search tickets by ID or passenger..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card border-border/50 rounded-2xl shadow-sm focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-2xl px-6 border-border/50 bg-card shadow-sm hover:bg-muted/30">
            <BarChart3 className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="h-12 rounded-2xl px-6 border-border/50 bg-card shadow-sm hover:bg-muted/30">
            <Printer className="w-4 h-4 mr-2" />
            Print All
          </Button>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <Card className="rounded-[32px] border-dashed border-2 border-border/50 bg-muted/30/50">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border/50">
               <Ticket className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No tickets found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {search 
                ? `We couldn't find any tickets matching "${search}". Try a different search term.` 
                : "You don't have any active e-tickets yet. Once your bookings are confirmed, they will appear here."}
            </p>
            {search && (
              <Button 
                variant="link" 
                onClick={() => setSearch("")}
                className="text-emerald-600 font-bold mt-4"
              >
                Clear search filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all overflow-hidden group">
              <div className={cn(
                "h-2",
                ticket.type === 'flight' ? "bg-blue-500" : "bg-emerald-500"
              )} />
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                    ticket.type === 'flight' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {ticket.type === 'flight' ? <Plane className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                  </div>
                  <div className="text-right">
                    <span className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest",
                      ticket.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      {ticket.status}
                    </span>
                    <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-tighter">#{ticket.bookingId}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg font-black text-foreground leading-tight mb-1">
                    {ticket.type === 'flight' ? `${ticket.fromCity} to ${ticket.toCity}` : ticket.hotel}
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">Passenger: {ticket.passengerName}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-stone-50">
                   <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-400">Date & Time</span>
                      <span className="text-foreground font-bold">{ticket.date} • {ticket.time || 'All Day'}</span>
                   </div>
                   {ticket.type === 'flight' && (
                     <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400">Flight / Seat</span>
                        <span className="text-foreground font-bold">{ticket.flightCode} • {ticket.seat}</span>
                     </div>
                   )}
                   {ticket.type === 'tour' && (
                     <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400">Room Type</span>
                        <span className="text-foreground font-bold">{ticket.room}</span>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                   <Button 
                     className="rounded-xl h-11 bg-stone-900 text-white hover:bg-stone-800 font-bold text-xs"
                     onClick={() => handleDownloadPDF(ticket)}
                     disabled={downloading === ticket.id}
                   >
                      {downloading === ticket.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 mr-2" />
                      )}
                      Download PDF
                   </Button>
                   <Button variant="outline" className="rounded-xl h-11 border-border/50 hover:bg-muted/30 font-bold text-xs">
                      <Eye className="w-3.5 h-3.5 mr-2" />
                      View
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Footer Component
export function Footer() {
  const { setPage } = useVistaStore();
  const [siteName, setSiteName] = useState('Vista Travel');
  const [contactEmail, setContactEmail] = useState('info@vista-travel.com');
  const [contactPhone, setContactPhone] = useState('+260 211 123 456');
  const [address, setAddress] = useState('123 Independence Avenue, Lusaka, Zambia');

  useEffect(() => {
    async function load() {
      try {
        const s = await fetch('/api/system-settings?key=site_name').then(r => r.json());
        if (s.success && s.setting) setSiteName(s.setting.value);
        const e = await fetch('/api/system-settings?key=contact_email').then(r => r.json());
        if (e.success && e.setting) setContactEmail(e.setting.value);
        const p = await fetch('/api/system-settings?key=contact_phone').then(r => r.json());
        if (p.success && p.setting) setContactPhone(p.setting.value);
        const a = await fetch('/api/system-settings?key=contact_address').then(r => r.json());
        if (a.success && a.setting) setAddress(a.setting.value);
      } catch (err) {
        console.error('Failed to load footer settings', err);
      }
    }
    load();
  }, []);

  return (
    <footer className="bg-stone-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold font-serif italic mb-4">Vista.</h3>
            <p className="text-gray-400 text-sm">
              Curated experiences for the modern explorer. From Zambia to the world.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button onClick={() => setPage("home")} className="hover:text-emerald-400 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => setPage("flights")} className="hover:text-emerald-400 transition-colors">
                  Flights
                </button>
              </li>
              <li>
                <button onClick={() => setPage("destinations")} className="hover:text-emerald-400 transition-colors">
                  Destinations
                </button>
              </li>
              <li>
                <button onClick={() => setPage("contact")} className="hover:text-emerald-400 transition-colors">
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <button onClick={() => setPage("terms")} className="hover:text-emerald-400 transition-colors text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => setPage("privacy")} className="hover:text-emerald-400 transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>{address}</li>
              <li>{contactPhone}</li>
              <li>{contactEmail}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Terms Page
// Terms Page
function TermsPageInApp() {
  const { legalDocuments } = useVistaStore();
  const sections = legalDocuments.termsOfService;

  return (
    <main className="pt-20 md:pt-24 min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-10 text-foreground tracking-tight">Terms of Service</h1>
        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="bg-card rounded-[32px] p-8 md:p-12 shadow-sm border border-border/50 transition-all hover:shadow-md">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="text-center py-20 bg-card rounded-[32px] border border-border/50">
              <p className="text-gray-400 font-medium text-lg">Terms of Service content coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Privacy Page
function PrivacyPageInApp() {
  const { legalDocuments } = useVistaStore();
  const sections = legalDocuments.privacyPolicy;

  return (
    <main className="pt-20 md:pt-24 min-h-screen bg-muted/30">
      <div className="max-w-4xl mx-auto py-16 px-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-10 text-foreground tracking-tight">Privacy Policy</h1>
        <div className="space-y-10">
          {sections.map((section, i) => (
            <div key={i} className="bg-card rounded-[32px] p-8 md:p-12 shadow-sm border border-border/50 transition-all hover:shadow-md">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-sm font-bold">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                {section.content}
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="text-center py-20 bg-card rounded-[32px] border border-border/50">
              <p className="text-gray-400 font-medium text-lg">Privacy Policy content coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Main App
export default function Home() {
  const { currentPage, fetchLegalDocuments } = useVistaStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchLegalDocuments();
  }, [fetchLegalDocuments]);

  // Simple page rendering without complex animations
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage key="home" />;
      case "flights":
        return <FlightsPage key="flights" />;
      case "destinations":
        return <DestinationsPage key="destinations" />;
      case "contact":
        return <ContactPage key="contact" />;
      case "tickets":
        return <TicketsPage key="tickets" />;
      case "terms":
        return <TermsPageInApp key="terms" />;
      case "privacy":
        return <PrivacyPageInApp key="privacy" />;
      case "admin":
        // If authenticated admin -> show AdminDashboard; otherwise show user dashboard
        if (isAuthenticated && user && user.role === 'ADMIN') {
          return <AdminDashboard key="admin" />;
        }
        return <UserDashboard key="user-dashboard" />;
      default:
        return <HomePage key="home" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex-1">
        {renderPage()}
      </main>

    </div>
  );
}
