import React, { useState, useMemo } from 'react';
import { 
  Search, ShoppingCart, Clock, Check, X, CreditCard, ChevronRight,
  ArrowRight, Shield, Bell, CheckCircle2, History, User, Lock, 
  Phone, Mail, Plus, Minus, Info, AlertCircle, Sparkles, TrendingUp,
  Utensils, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem, Student, Order, OrderItem, FoodCategory, PaymentStatus, OrderStatus, Notification } from '../types';

interface StudentPortalProps {
  menuItems: MenuItem[];
  currentUser: Student | null;
  setCurrentUser: (student: Student | null) => void;
  registeredStudents: Student[];
  setRegisteredStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  orders: Order[];
  onPlaceOrder: (
    items: OrderItem[],
    total: number,
    pickupTime: string,
    method: 'Wallet' | 'UPI' | 'Card',
    discountApplied?: number,
    pointsEarned?: number,
    pointsRedeemed?: number
  ) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  notifications: Notification[];
}

export default function StudentPortal({
  menuItems,
  currentUser,
  setCurrentUser,
  registeredStudents,
  setRegisteredStudents,
  orders,
  onPlaceOrder,
  onUpdateOrderStatus,
  notifications,
}: StudentPortalProps) {
  // Authentication states
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FoodCategory | 'All'>('All');
  const [sortByPrice, setSortByPrice] = useState<'none' | 'asc' | 'desc'>('none');

  // Cart States
  const [cart, setCart] = useState<{
    cartItemId: string;
    menuItem: MenuItem;
    quantity: number;
    customization: {
      size: 'Small' | 'Medium' | 'Large';
      addOns: { name: string; price: number }[];
      dietaryNotes: string;
    };
    totalUnitPrice: number;
  }[]>([]);
  const [showCartPanel, setShowCartPanel] = useState(false);
  const [pickupTimeOption, setPickupTimeOption] = useState<'next' | 'custom'>('next');
  const [customPickupTime, setCustomPickupTime] = useState('12:15');

  // Food Customization Dialog States
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customSize, setCustomSize] = useState<'Small' | 'Medium' | 'Large'>('Medium');
  const [customAddOns, setCustomAddOns] = useState<{ name: string; price: number }[]>([]);
  const [customDietaryNotes, setCustomDietaryNotes] = useState('');

  // Checkout / Payment Gateway States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Wallet' | 'UPI' | 'Card'>('Wallet');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form');
  const [cardNo, setCardNo] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [upiId, setUpiId] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Track active tab
  const [activeTab, setActiveTab] = useState<'menu' | 'tracking' | 'history'>('menu');

  // Computed Values
  const cartCount = useMemo(() => cart.reduce((acc, curr) => acc + curr.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, curr) => acc + curr.totalUnitPrice * curr.quantity, 0), [cart]);

  // Handle Demo Fast Login
  const handleDemoLogin = (role: 'alice' | 'bob') => {
    const demoEmail = role === 'alice' ? 'alice@school.edu' : 'bob@school.edu';
    const found = registeredStudents.find(s => s.email === demoEmail);
    if (found) {
      setCurrentUser(found);
      setAuthError('');
      setActiveTab('menu');
    }
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in all fields.');
      return;
    }
    const found = registeredStudents.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setAuthError('');
      setActiveTab('menu');
    } else {
      setAuthError('Student account not found. Try registering or use a Quick Demo profile.');
    }
  };

  // Registration handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      setAuthError('Please fill in all fields.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    const exists = registeredStudents.some(s => s.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setAuthError('Email already registered.');
      return;
    }

    const newStudent: Student = {
      id: `student_${Date.now()}`,
      name,
      email,
      phone,
      balance: 4000.00, // Generous ₹4000 pre-paid start funds!
      loyaltyPoints: 100 // Welcome loyalty reward points!
    };

    setRegisteredStudents(prev => [...prev, newStudent]);
    setCurrentUser(newStudent);
    setAuthError('');
    setActiveTab('menu');
  };

  // Menu items filtering & sorting
  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortByPrice === 'asc') return a.price - b.price;
        if (sortByPrice === 'desc') return b.price - a.price;
        return 0;
      });
  }, [menuItems, searchQuery, activeCategory, sortByPrice]);

  // Category specific add-ons configuration
  const getAddOnsForCategory = (category: FoodCategory) => {
    switch (category) {
      case 'Main Course':
        return [
          { name: 'Extra Butter / Ghee', price: 15 },
          { name: 'Extra Sambar & Chutney', price: 10 },
          { name: 'Grated Cheese', price: 20 },
          { name: 'No Onions / Garlic', price: 0 },
          { name: 'Extra Spicy Masala', price: 5 }
        ];
      case 'Drinks':
        return [
          { name: 'Extra Ice', price: 0 },
          { name: 'Less Sugar', price: 0 },
          { name: 'Whipped Cream', price: 15 },
          { name: 'Oat Milk Substitute', price: 25 }
        ];
      case 'Desserts':
        return [
          { name: 'Vanilla Ice Cream Scoop', price: 30 },
          { name: 'Chocolate Drizzle', price: 10 },
          { name: 'Extra Nuts', price: 15 },
          { name: 'Sugar-Free Option', price: 0 }
        ];
      default:
        return [];
    }
  };

  // Cart and Customization operations
  const openCustomization = (item: MenuItem) => {
    if (!item.availability) return;

    setCustomizingItem(item);
    setCustomAddOns([]);
    setCustomDietaryNotes('');
  };

  const confirmCustomization = () => {
    if (!customizingItem) return;

    const basePrice = customizingItem.price;
    const addOnTotal = customAddOns.reduce((sum, current) => sum + current.price, 0);
    const finalUnitPrice = basePrice + addOnTotal;

    setCart(prev => {
      const isSameAddOns = (a: { name: string; price: number }[], b: { name: string; price: number }[]) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].map(x => x.name).sort();
        const sortedB = [...b].map(x => x.name).sort();
        return sortedA.every((val, index) => val === sortedB[index]);
      };

      const existing = prev.find(i => 
        i.menuItem.id === customizingItem.id &&
        isSameAddOns(i.customization.addOns, customAddOns) &&
        i.customization.dietaryNotes === customDietaryNotes
      );

      if (existing) {
        return prev.map(i => i.cartItemId === existing.cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      }

      const newCartItemId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      return [...prev, {
        cartItemId: newCartItemId,
        menuItem: customizingItem,
        quantity: 1,
        customization: {
          size: 'Medium',
          addOns: customAddOns,
          dietaryNotes: customDietaryNotes
        },
        totalUnitPrice: finalUnitPrice
      }];
    });

    setCustomizingItem(null);

    // After adding item, automatically open payment modal
    setCheckoutError('');
    setPointsToRedeem(0);
    setPaymentStep('form');
    setShowPaymentModal(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const adjustQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.cartItemId === cartItemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : i;
        }
        return i;
      }).filter(i => i.quantity > 0);
    });
  };

  // Checkout start
  const initiateCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError('');
    setPointsToRedeem(0);
    setPaymentStep('form');
    setShowPaymentModal(true);
  };

  // Secure payment process submission
  const handlePayment = async () => {
    if (!currentUser) return;

    const discountApplied = (pointsToRedeem / 100) * 80;
    const finalTotal = Math.max(0, cartTotal - discountApplied);
    const pointsEarned = Math.round(finalTotal / 8);

    // Balance check
    if (paymentMethod === 'Wallet' && currentUser.balance < finalTotal) {
      setCheckoutError(`Insufficient funds in prepaid wallet. You need ₹${(finalTotal - currentUser.balance).toFixed(2)} more. Click 'Add Balance' at top!`);
      return;
    }

    // Input checks
    if (paymentMethod === 'Card') {
      if (!cardNo || !cardExpiry || !cardCVV) {
        setCheckoutError('Please enter valid credit card details.');
        return;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId) {
        setCheckoutError('Please enter a valid UPI address (e.g. name@upi).');
        return;
      }
    }

    setCheckoutError('');
    setPaymentStep('processing');

    // Simulate standard pre-order kitchen queue lag
    setTimeout(() => {
      try {
        const estimatedTimeStr = pickupTimeOption === 'next' 
          ? calculateEstimatedTime()
          : formatCustomTime(customPickupTime);

        // Map cart items
        const orderItems: OrderItem[] = cart.map(i => ({
          foodId: i.menuItem.id,
          name: i.menuItem.name,
          price: i.totalUnitPrice,
          quantity: i.quantity,
          customization: {
            size: i.customization.size,
            addOns: i.customization.addOns.map(a => a.price > 0 ? `${a.name} (+₹${a.price})` : a.name),
            dietaryNotes: i.customization.dietaryNotes || undefined
          }
        }));

        // Trigger parent state update
        onPlaceOrder(orderItems, finalTotal, estimatedTimeStr, paymentMethod, discountApplied, pointsEarned, pointsToRedeem);

        // Update student balance and loyalty points
        const updatedUser = {
          ...currentUser,
          balance: paymentMethod === 'Wallet' ? currentUser.balance - finalTotal : currentUser.balance,
          loyaltyPoints: currentUser.loyaltyPoints + pointsEarned - pointsToRedeem
        };
        setCurrentUser(updatedUser);
        // Sync with the list of students
        setRegisteredStudents(prev => prev.map(s => s.id === currentUser.id ? updatedUser : s));

        setPaymentStep('success');
        setCart([]); // Clear cart
      } catch (err) {
        setPaymentStep('error');
      }
    }, 2000);
  };

  // Dynamic calculated pickup estimation
  const calculateEstimatedTime = () => {
    const basePrep = cart.reduce((max, item) => Math.max(max, item.menuItem.prepTimeMinutes), 0);
    const queueMultiplier = orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length;
    const finalMinutes = basePrep + (queueMultiplier * 2);
    
    const now = new Date();
    now.setMinutes(now.getMinutes() + finalMinutes);
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCustomTime = (timeStr: string) => {
    const [hrs, mins] = timeStr.split(':');
    const hour = parseInt(hrs, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${mins} ${ampm}`;
  };

  // Filter student-specific orders
  const studentOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter(o => o.studentId === currentUser.id);
  }, [orders, currentUser]);

  const activeOrders = useMemo(() => {
    return studentOrders.filter(o => o.orderStatus !== 'Collected' && o.orderStatus !== 'Cancelled');
  }, [studentOrders]);

  const historicalOrders = useMemo(() => {
    return studentOrders.filter(o => o.orderStatus === 'Collected' || o.orderStatus === 'Cancelled');
  }, [studentOrders]);

  // Auth screen
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] p-4 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8"
        >
          {/* Headline */}
          <div className="text-center mb-6">
            <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Student Hub
            </span>
            <h2 className="text-2xl font-extrabold text-slate-950 mt-2">
              {authMode === 'login' ? 'Welcome Back!' : 'Create Student Account'}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Order meals online in advance and skip the canteen queue.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Actual Auth Form */}
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800"
                    placeholder="Enter full name"
                    id="reg-name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">School Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800"
                  placeholder="student@school.edu"
                  id="auth-email"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800"
                    placeholder="+1 (555) 019-2834"
                    id="reg-phone"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800"
                  placeholder="••••••••"
                  id="auth-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              id="auth-submit-btn"
            >
              <span>{authMode === 'login' ? 'Sign In Securely' : 'Register Account'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="mt-5 text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
              id="auth-toggle-mode"
            >
              {authMode === 'login' 
                ? "Don't have an account? Register here" 
                : "Already registered? Sign in instead"}
            </button>
          </div>

          {/* Demo Speed Accounts */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">
              Fast Track Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('alice')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-800 p-2.5 rounded-xl text-[11px] font-semibold text-left transition-all flex items-center justify-between group"
                id="demo-student-alice"
              >
                <div>
                  <span className="block font-bold">Alice Johnson</span>
                  <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 font-mono">Student A</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </button>
              <button
                onClick={() => handleDemoLogin('bob')}
                className="bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-700 hover:text-indigo-800 p-2.5 rounded-xl text-[11px] font-semibold text-left transition-all flex items-center justify-between group"
                id="demo-student-bob"
              >
                <div>
                  <span className="block font-bold">Bob Miller</span>
                  <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 font-mono">Student B</span>
                </div>
                <ChevronRight className="h-3 w-3 opacity-60" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Tab Navigation Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'menu' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-menu"
          >
            <Utensils className="h-4 w-4 text-indigo-500" />
            Order Daily Menu
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'tracking' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-tracking"
          >
            <Clock className="h-4 w-4 text-amber-500" />
            Active Trackers
            {activeOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center">
                {activeOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'bg-white text-slate-950 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-history"
          >
            <History className="h-4 w-4 text-slate-500" />
            My Order History
          </button>
        </div>

        {/* Action Button: Floating Cart indicator */}
        <button
          onClick={() => setShowCartPanel(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md hover:shadow-lg transition-all group cursor-pointer"
          id="btn-cart-indicator"
        >
          <ShoppingCart className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>My Cart ({cartCount})</span>
          <span className="bg-slate-950/15 px-1.5 py-0.5 rounded text-[10px] font-mono">₹{cartTotal.toFixed(2)}</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <div className="min-h-[500px]">
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Sidebar Filters */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Browse Categories</h3>
                <div className="flex flex-col gap-1">
                  {(['All', 'Main Course', 'Drinks', 'Desserts'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                        activeCategory === cat
                          ? 'bg-indigo-50 text-indigo-800 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                      id={`filter-cat-${cat.toLowerCase().replace(' ', '-')}`}
                    >
                      <span>{cat}</span>
                      <ChevronRight className={`h-3 w-3 ${activeCategory === cat ? 'text-indigo-600' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting Filters */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-3">Sort by Price</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSortByPrice('none')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-center ${
                      sortByPrice === 'none' 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => setSortByPrice('asc')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-center ${
                      sortByPrice === 'asc' 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Low-High
                  </button>
                  <button
                    onClick={() => setSortByPrice('desc')}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all text-center ${
                      sortByPrice === 'desc' 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    High-Low
                  </button>
                </div>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Search topbar */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search yummy items, meals, or keywords (e.g. Pasta, Matcha, wings...)"
                  className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm text-slate-800"
                  id="menu-search-bar"
                />
              </div>

              {/* Items Render */}
              {filteredMenuItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                  <div className="text-4xl mb-2">🍽️</div>
                  <h4 className="font-bold text-slate-800 text-sm">No items found matching criteria</h4>
                  <p className="text-slate-400 text-xs mt-1">Try another keyword or select a different category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredMenuItems.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      className={`bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full ${
                        !item.availability ? 'opacity-65' : ''
                      }`}
                    >
                      {/* Emoji header area */}
                      <div className="p-4 bg-slate-50 flex items-center justify-between border-b border-slate-100">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex gap-1">
                          <span className="text-[10px] bg-slate-200/65 text-slate-700 px-2 py-0.5 rounded-full font-semibold font-mono">
                            {item.prepTimeMinutes} mins
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            item.availability 
                              ? 'bg-indigo-50 text-indigo-700' 
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {item.availability ? 'Available' : 'Sold Out'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">{item.category}</span>
                          <h4 className="font-bold text-slate-900 text-sm mt-1 leading-tight">{item.name}</h4>
                          <p className="text-slate-500 text-xs mt-1 line-clamp-3 leading-relaxed">{item.description}</p>

                          {/* Nutritional Info Block */}
                          {item.nutrition && (
                            <div className="mt-3 p-2 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <div className="text-center flex-1 border-r border-slate-100">
                                <span className="block text-[8px] text-slate-400 uppercase font-semibold leading-none">Calories</span>
                                <span className="font-bold text-slate-800 text-[10px] mt-0.5 block">{item.nutrition.calories} kcal</span>
                              </div>
                              <div className="text-center flex-1 border-r border-slate-100">
                                <span className="block text-[8px] text-slate-400 uppercase font-semibold leading-none">Protein</span>
                                <span className="font-bold text-indigo-700 text-[10px] mt-0.5 block">{item.nutrition.protein}g</span>
                              </div>
                              <div className="text-center flex-1 border-r border-slate-100">
                                <span className="block text-[8px] text-slate-400 uppercase font-semibold leading-none">Carbs</span>
                                <span className="font-bold text-amber-600 text-[10px] mt-0.5 block">{item.nutrition.carbs}g</span>
                              </div>
                              <div className="text-center flex-1">
                                <span className="block text-[8px] text-slate-400 uppercase font-semibold leading-none">Fat</span>
                                <span className="font-bold text-rose-600 text-[10px] mt-0.5 block">{item.nutrition.fat}g</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 text-sm">₹{item.price.toFixed(2)}</span>
                          <button
                            disabled={!item.availability}
                            onClick={() => openCustomization(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                              item.availability 
                                ? 'bg-slate-900 hover:bg-slate-800 text-white hover:scale-105 active:scale-95 shadow-sm font-semibold'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                            id={`add-to-cart-${item.id}`}
                          >
                            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                            + Pre-Order
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ACTIVE ORDER TRACKERS TAB */}
        {activeTab === 'tracking' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="font-extrabold text-slate-950 text-lg">Active Live Trackers</h3>
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="text-4xl mb-2">⏳</div>
                <h4 className="font-bold text-slate-800 text-sm">No active orders right now</h4>
                <p className="text-slate-400 text-xs mt-1">Ready to grab lunch? Head to the daily menu to place an order.</p>
                <button
                  onClick={() => setActiveTab('menu')}
                  className="mt-4 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {activeOrders.map((order) => {
                  // Determine stepper status index
                  const statusSteps: OrderStatus[] = ['Pending', 'Preparing', 'Ready for Pickup', 'Collected'];
                  const currentIndex = statusSteps.indexOf(order.orderStatus);

                  return (
                    <motion.div
                      layout
                      key={order.id}
                      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
                    >
                      {/* Order Header info */}
                      <div className="p-4 bg-slate-900 text-white flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-300">ORDER #{order.id.slice(-6).toUpperCase()}</span>
                            <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                              {order.paymentMethod}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Placed on {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Est. Ready Time</span>
                          <span className="font-mono text-sm font-bold text-indigo-400 flex items-center gap-1 justify-end">
                            <Clock className="h-3.5 w-3.5" />
                            {order.pickupTime}
                          </span>
                        </div>
                      </div>

                      {/* Stepper Status Tracker */}
                      <div className="p-6 border-b border-slate-50">
                        <div className="relative flex justify-between">
                          {/* Progress Line */}
                          <div className="absolute top-[18px] left-[10%] right-[10%] h-1 bg-slate-100 z-0">
                            <div 
                              className="h-full bg-indigo-600 transition-all duration-500" 
                              style={{ width: `${(currentIndex / 2) * 100}%` }}
                            />
                          </div>

                          {/* Steps */}
                          {[
                            { label: 'Pending', icon: '📝', desc: 'Kitchen queue' },
                            { label: 'Preparing', icon: '🍳', desc: 'Chef preparing' },
                            { label: 'Ready for Pickup', icon: '🔔', desc: 'Counter collection' }
                          ].map((step, idx) => {
                            const isCompleted = idx < currentIndex;
                            const isActive = idx === currentIndex;
                            return (
                              <div key={step.label} className="flex flex-col items-center z-10 w-[30%]">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-base transition-all ${
                                  isCompleted 
                                    ? 'bg-indigo-600 text-white scale-100' 
                                    : isActive 
                                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-md ring-4 ring-amber-100' 
                                      : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
                                </div>
                                <span className={`text-[11px] font-bold mt-2 text-center ${
                                  isActive ? 'text-amber-500 font-extrabold' : isCompleted ? 'text-indigo-600' : 'text-slate-400'
                                }`}>
                                  {step.label}
                                </span>
                                <span className="text-[9px] text-slate-400 text-center mt-0.5">{step.desc}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Items Ordered Table */}
                      <div className="p-5 bg-slate-50/50">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Item Details</span>
                        <div className="divide-y divide-slate-100">
                          {order.items.map((it, idx) => (
                            <div key={`${it.foodId}_${idx}`} className="py-2.5 flex flex-col gap-1 border-b border-slate-100 last:border-0 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.5 rounded font-mono text-[10px]">
                                    x{it.quantity}
                                  </span>
                                  <span className="font-semibold text-slate-800">{it.name}</span>
                                </div>
                                <span className="font-mono text-slate-600 font-medium">₹{(it.price * it.quantity).toFixed(2)}</span>
                              </div>
                              {it.customization && (
                                <div className="pl-8 flex flex-col gap-0.5 text-[10px] text-slate-500">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-bold text-[9px]">
                                      Size: {it.customization.size}
                                    </span>
                                    {it.customization.addOns && it.customization.addOns.length > 0 && (
                                      <span className="text-slate-600">
                                        • Add-ons: {it.customization.addOns.join(', ')}
                                      </span>
                                    )}
                                  </div>
                                  {it.customization.dietaryNotes && (
                                    <span className="text-amber-700 font-medium italic">
                                      Note: "{it.customization.dietaryNotes}"
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                          {order.pointsRedeemed ? (
                            <div className="flex justify-between items-center text-slate-500 text-[11px]">
                              <span>Loyalty Points Redeemed:</span>
                              <span className="font-mono text-amber-600">-{order.pointsRedeemed} pts (-₹{order.discountApplied?.toFixed(2)})</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700">Total Charged</span>
                            <span className="font-mono font-bold text-slate-950">₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                          {order.pointsEarned ? (
                            <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold font-mono justify-end">
                              <Sparkles className="h-3 w-3" />
                              <span>Earned +{order.pointsEarned} loyalty points</span>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Dynamic CTA Footer based on Status */}
                      <div className="p-4 bg-white border-t border-slate-50 flex justify-between items-center">
                        {order.orderStatus === 'Ready for Pickup' ? (
                          <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 bg-indigo-50 p-3 rounded-2xl border border-indigo-100 pulse-ready">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
                              <div className="text-left">
                                <span className="block text-xs font-bold text-indigo-800">Your meal is ready at Pickup Counter #1!</span>
                                <span className="block text-[10px] text-indigo-600">Please present your Order Ticket ID on arrival.</span>
                              </div>
                            </div>
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'Collected')}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md cursor-pointer whitespace-nowrap"
                              id={`btn-collect-${order.id}`}
                            >
                              Confirm Collection
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Info className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>Kitchen staff is preparing your order. Keep this tab open for live status alerts.</span>
                          </div>
                        )}
                      </div>

                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ORDER HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="font-extrabold text-slate-950 text-lg">My Order History</h3>
            {historicalOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="text-4xl mb-2">📜</div>
                <h4 className="font-bold text-slate-800 text-sm">No historical orders found</h4>
                <p className="text-slate-400 text-xs mt-1">Your fully collected or cancelled pre-orders will be listed here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historicalOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">ORDER #{order.id.slice(-6).toUpperCase()}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          order.orderStatus === 'Collected' 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex-grow border-l border-slate-100 pl-4 max-w-sm hidden md:block">
                      <p className="text-xs text-slate-600 truncate" title={order.items.map(i => {
                        const sizePart = i.customization ? ` [${i.customization.size}]` : '';
                        const addonsPart = i.customization?.addOns && i.customization.addOns.length > 0 ? ` (${i.customization.addOns.join(', ')})` : '';
                        const notesPart = i.customization?.dietaryNotes ? ` *${i.customization.dietaryNotes}*` : '';
                        return `${i.name} (x${i.quantity})${sizePart}${addonsPart}${notesPart}`;
                      }).join(', ')}>
                        {order.items.map(i => {
                          const sizePart = i.customization ? ` [${i.customization.size}]` : '';
                          return `${i.name} (x${i.quantity})${sizePart}`;
                        }).join(', ')}
                      </p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="font-mono font-bold text-slate-900 block">₹{order.totalAmount.toFixed(2)}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">{order.paymentMethod === 'Wallet' ? 'Wallet Paid' : 'Card/UPI Paid'}</span>
                      <div className="flex flex-col gap-1 items-end">
                        {order.pointsEarned ? (
                          <span className="text-[8px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold font-mono">+{order.pointsEarned} pts</span>
                        ) : null}
                        {order.pointsRedeemed ? (
                          <span className="text-[8px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full font-bold font-mono">-{order.pointsRedeemed} pts</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SHOPPING CART OVERLAY PANEL */}
      <AnimatePresence>
        {showCartPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={() => setShowCartPanel(false)} />
            
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-screen max-w-md bg-white flex flex-col justify-between shadow-2xl h-full border-l border-slate-100"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-indigo-600" />
                    <span className="font-bold text-slate-900 text-sm">Review Pre-Order</span>
                  </div>
                  <button
                    onClick={() => setShowCartPanel(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Items list */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <span className="text-4xl mb-2">🛒</span>
                      <h4 className="font-bold text-slate-800 text-xs">Your shopping cart is empty</h4>
                      <p className="text-slate-400 text-[11px] mt-1">Browse our delicious canteen menu to add snacks!</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartItemId} className="flex gap-3 border-b border-slate-100 pb-3" id={`cart-item-${item.cartItemId}`}>
                        <div className="text-2xl bg-slate-50 h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                          {item.menuItem.image}
                        </div>
                        <div className="flex-grow min-w-0">
                          <h5 className="font-bold text-slate-800 text-xs truncate">{item.menuItem.name}</h5>
                          <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wide font-medium">{item.menuItem.category}</p>
                          
                          {/* Customization Details Rendering */}
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.customization.addOns.map(add => (
                              <span key={add.name} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[8px] font-bold">
                                + {add.name}
                              </span>
                            ))}
                            {item.customization.dietaryNotes && (
                              <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded text-[8px] font-bold italic truncate max-w-[120px]" title={item.customization.dietaryNotes}>
                                📝 {item.customization.dietaryNotes}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <span className="font-mono text-xs font-bold text-slate-900">₹{(item.totalUnitPrice * item.quantity).toFixed(2)}</span>
                            
                            {/* Quantity Adjusters */}
                            <div className="flex items-center gap-2 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                              <button
                                onClick={() => adjustQuantity(item.cartItemId, -1)}
                                className="p-1 hover:bg-white text-slate-600 rounded"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 font-mono w-4 text-center">{item.quantity}</span>
                              <button
                                onClick={() => adjustQuantity(item.cartItemId, 1)}
                                className="p-1 hover:bg-white text-slate-600 rounded"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded self-start"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Pickup Time Config and Checkout Section */}
                {cart.length > 0 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                    {/* Choose Pickup Time */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Estimated Pickup Time</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPickupTimeOption('next')}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            pickupTimeOption === 'next'
                              ? 'bg-white border-indigo-500 text-indigo-800 font-bold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="block text-[11px]">Next Available</span>
                          <span className="block text-[9px] text-slate-400 font-mono mt-0.5">Approx. 10-15 mins</span>
                        </button>
                        <button
                          onClick={() => setPickupTimeOption('custom')}
                          className={`p-2 rounded-xl text-left border transition-all ${
                            pickupTimeOption === 'custom'
                              ? 'bg-white border-indigo-500 text-indigo-800 font-bold shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="block text-[11px]">Select Custom Time</span>
                          <input
                            type="time"
                            value={customPickupTime}
                            onChange={(e) => setCustomPickupTime(e.target.value)}
                            disabled={pickupTimeOption !== 'custom'}
                            className="block text-[10px] text-slate-700 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 mt-1 font-mono outline-none focus:border-indigo-500 disabled:opacity-50"
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-200/60 pt-3 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Items Total</span>
                        <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Convenience & Tax</span>
                        <span className="font-mono">FREE</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold text-sm border-t border-slate-200 pt-1.5">
                        <span>Order Total</span>
                        <span className="font-mono text-indigo-600">₹{cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={initiateCheckout}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                      id="btn-drawer-checkout"
                    >
                      <span>Proceed to Secure Payment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SECURE ONLINE PAYMENT MODAL GATEWAY */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="payment-gateway-modal">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative z-10"
            >
              {/* Processing Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">SECURE PRE-ORDER CHECKOUT</span>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Steps views */}
              <div className="p-6">
                {checkoutError && (
                  <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs rounded-xl flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{checkoutError}</span>
                  </div>
                )}

                {/* FORM STEP */}
                {paymentStep === 'form' && (
                  <div className="space-y-4">
                    {/* Display Amount */}
                    <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100 space-y-1">
                      {pointsToRedeem > 0 ? (
                        <>
                          <div className="flex justify-between items-center px-4 text-xs text-slate-500">
                            <span>Cart Subtotal:</span>
                            <span className="font-semibold font-mono">₹{cartTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center px-4 text-xs text-amber-600 font-bold">
                            <span>Loyalty Discount (-{pointsToRedeem} pts):</span>
                            <span className="font-mono">-₹{((pointsToRedeem / 100) * 80).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-slate-200/60 my-1 pt-1 flex justify-between items-center px-4">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Final Amount Due</span>
                            <span className="text-xl font-extrabold text-slate-900 font-mono">₹{Math.max(0, cartTotal - ((pointsToRedeem / 100) * 80)).toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Payment Amount Due</span>
                          <span className="text-2xl font-extrabold text-slate-900 font-mono">₹{cartTotal.toFixed(2)}</span>
                        </>
                      )}
                      
                      <div className="text-[9px] text-indigo-600 font-bold font-mono pt-1">
                        ✨ You'll earn {Math.round(Math.max(0, cartTotal - ((pointsToRedeem / 100) * 80)) / 8)} loyalty points from this purchase!
                      </div>
                    </div>

                    {/* Loyalty Points Redemption Selector */}
                    {currentUser && currentUser.loyaltyPoints >= 100 && (
                      <div className="bg-amber-50/50 rounded-2xl p-3.5 border border-amber-200/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                            <span>Redeem Loyalty Points</span>
                          </div>
                          <span className="font-mono text-[10px] font-bold text-amber-600">Balance: {currentUser.loyaltyPoints} pts</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">Redeem points in blocks of 100 for instant discounts (100 points = ₹80.00 off).</p>
                        
                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => setPointsToRedeem(0)}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                              pointsToRedeem === 0
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            No Discount
                          </button>
                          {[100, 250, 500].map(pts => {
                            const discountVal = (pts / 100) * 80;
                            const isEligible = currentUser.loyaltyPoints >= pts && cartTotal >= discountVal;
                            return (
                              <button
                                key={pts}
                                type="button"
                                disabled={!isEligible}
                                onClick={() => setPointsToRedeem(pts)}
                                className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex flex-col items-center justify-center ${
                                  pointsToRedeem === pts
                                    ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                                    : isEligible
                                      ? 'bg-white border-amber-200 text-amber-700 hover:bg-amber-50/50'
                                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                                  }`}
                                title={!isEligible ? (cartTotal < discountVal ? "Discount exceeds total" : "Insufficient points") : ""}
                              >
                                <span>-{pts} pts</span>
                                <span className="text-[8px] font-mono opacity-90">-₹{discountVal.toFixed(2)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Method Selector Tabs */}
                    <div>
                      <span className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Select Payment Method</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setPaymentMethod('Wallet')}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            paymentMethod === 'Wallet'
                              ? 'bg-slate-900 border-slate-900 text-white shadow'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          id="pay-method-wallet"
                        >
                          <Wallet className="h-4 w-4" />
                          <span className="text-[10px] font-bold leading-none">Wallet</span>
                          <span className="text-[8px] opacity-80">₹{currentUser.balance.toFixed(2)}</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('UPI')}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            paymentMethod === 'UPI'
                              ? 'bg-slate-900 border-slate-900 text-white shadow'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          id="pay-method-upi"
                        >
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span className="text-[10px] font-bold leading-none">UPI App</span>
                          <span className="text-[8px] opacity-80">Instant QR</span>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('Card')}
                          className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            paymentMethod === 'Card'
                              ? 'bg-slate-900 border-slate-900 text-white shadow'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          id="pay-method-card"
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="text-[10px] font-bold leading-none">Credit Card</span>
                          <span className="text-[8px] opacity-80">Visa/MC</span>
                        </button>
                      </div>
                    </div>

                    {/* Method Fields */}
                    {paymentMethod === 'Wallet' && (
                      <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-2.5">
                        <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div className="text-left text-xs text-indigo-800">
                          <span className="block font-bold">Fast-Deduction Wallet</span>
                          <p className="mt-0.5 leading-relaxed">The meal cost will be subtracted from your school lunch prepaid account instantly. Secure, offline-ready!</p>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'UPI' && (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Enter your UPI VPA Address</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="studentname@okaxis"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs focus:ring-2 focus:ring-slate-950/10 outline-none text-slate-800"
                            id="pay-upi-id"
                          />
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/50 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 font-medium">Or pay using canteen terminal QR code</span>
                          <div className="bg-slate-200 px-2 py-1 rounded text-[9px] font-bold font-mono">GENERATE QR</div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Card Number</label>
                          <input
                            type="text"
                            maxLength={19}
                            value={cardNo}
                            onChange={(e) => setCardNo(e.target.value)}
                            placeholder="4111 2222 3333 4444"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs focus:ring-2 focus:ring-slate-950/10 outline-none text-slate-800"
                            id="pay-card-number"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Expiry Date</label>
                            <input
                              type="text"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              placeholder="MM/YY"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs focus:ring-2 focus:ring-slate-950/10 outline-none text-slate-800"
                              id="pay-card-expiry"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">CVV</label>
                            <input
                              type="password"
                              maxLength={3}
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value)}
                              placeholder="•••"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs focus:ring-2 focus:ring-slate-950/10 outline-none text-slate-800"
                              id="pay-card-cvv"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Pay Button */}
                    <button
                      onClick={handlePayment}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                      id="btn-submit-payment"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Authorize Secure Order for ₹{(Math.max(0, cartTotal - ((pointsToRedeem / 100) * 80))).toFixed(2)}</span>
                    </button>
                  </div>
                )}

                {/* PROCESSING STEP */}
                {paymentStep === 'processing' && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
                    <h4 className="font-bold text-slate-800 text-sm">Processing Transaction</h4>
                    <p className="text-slate-400 text-xs mt-1">Interfacing with secure bank router nodes...</p>
                  </div>
                )}

                {/* SUCCESS STEP */}
                {paymentStep === 'success' && (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="h-14 w-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl mb-4 animate-bounce">
                      <Check className="h-8 w-8 stroke-[3]" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-base">Payment & Pre-Order Successful!</h4>
                    <p className="text-slate-500 text-xs mt-1 px-4">
                      The canteen kitchen staff received your order ticket. It is now registered in the queue.
                    </p>
                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => {
                          setShowPaymentModal(false);
                          setActiveTab('tracking');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer"
                        id="btn-view-tracker-success"
                      >
                        Track Order Status
                      </button>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOD ITEM CUSTOMIZATION DIALOG (Add-ons & Special Requests only - No Small/Large size options) */}
      <AnimatePresence>
        {customizingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left" id="customization-modal">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setCustomizingItem(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative z-10 flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{customizingItem.image}</span>
                  <div className="text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Customize Options</span>
                    <h4 className="text-sm font-extrabold truncate max-w-[240px]">{customizingItem.name}</h4>
                  </div>
                </div>
                <button
                  onClick={() => setCustomizingItem(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Customization Form */}
              {(() => {
                const addOnsList = getAddOnsForCategory(customizingItem.category);
                
                return (
                  <>
                    <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                      {/* ADD-ONS & EXTRAS checklist */}
                      {addOnsList.length > 0 && (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                            1. Select Add-ons & Extras
                          </label>
                          <p className="text-[11px] text-slate-500">Pick any extra ingredients or specific prep modifications.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {addOnsList.map((addon) => {
                              const isSelected = customAddOns.some(a => a.name === addon.name);
                              return (
                                <button
                                  key={addon.name}
                                  onClick={() => {
                                    if (isSelected) {
                                      setCustomAddOns(prev => prev.filter(a => a.name !== addon.name));
                                    } else {
                                      setCustomAddOns(prev => [...prev, addon]);
                                    }
                                  }}
                                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                                    isSelected
                                      ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 font-bold ring-2 ring-emerald-600/10'
                                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                                  }`}
                                >
                                  <span className="text-xs truncate">{addon.name}</span>
                                  <span className="text-[10px] font-mono font-semibold text-slate-500 shrink-0">
                                    {addon.price > 0 ? `+₹${addon.price}` : 'Free'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* DIETARY NOTES / SPECIAL REQUESTS */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {addOnsList.length > 0 ? '2. Special Requests & Notes' : 'Special Requests & Notes'}
                        </label>
                        <p className="text-[11px] text-slate-500">
                          Specify allergies, spicy preference, or special kitchen instructions.
                        </p>
                        <input
                          type="text"
                          value={customDietaryNotes}
                          onChange={(e) => setCustomDietaryNotes(e.target.value)}
                          placeholder="e.g. Extra spicy, less oil, no onion, cold"
                          className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all font-medium text-slate-800"
                          maxLength={80}
                        />
                      </div>
                    </div>

                    {/* Footer Summary / Add button */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">Total Unit Price</span>
                        <span className="text-lg font-extrabold font-mono text-slate-900">
                          ₹{(customizingItem.price + customAddOns.reduce((sum, current) => sum + current.price, 0)).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={confirmCustomization}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                      >
                        <span>Add to Pre-Order</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
