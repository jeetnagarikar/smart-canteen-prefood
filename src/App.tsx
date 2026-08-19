import React, { useState, useEffect } from 'react';
import { INITIAL_MENU_ITEMS, generateMockHistoricalOrders } from './data';
import { MenuItem, Student, Order, OrderItem, OrderStatus, Notification } from './types';
import CanteenHeader from './components/CanteenHeader';
import StudentPortal from './components/StudentPortal';
import StaffPortal from './components/StaffPortal';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, IndianRupee, Wallet, RefreshCw, Sparkles, Smartphone, Monitor, X } from 'lucide-react';

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student_alice',
    name: 'Alice Johnson',
    email: 'alice@school.edu',
    phone: '555-019-2834',
    balance: 3400.00,
    loyaltyPoints: 350
  },
  {
    id: 'student_bob',
    name: 'Bob Miller',
    email: 'bob@school.edu',
    phone: '555-012-9842',
    balance: 1120.00,
    loyaltyPoints: 120
  }
];

export default function App() {
  // Portal View Mode
  const [view, setView] = useState<'student' | 'staff' | 'split'>('split');

  // Core Lifted Database States (Synced to localStorage)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [registeredStudents, setRegisteredStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Simulation Banners (Simulated Push Notifications)
  const [activePushNotification, setActivePushNotification] = useState<{
    id: string;
    message: string;
    status?: OrderStatus;
  } | null>(null);

  // Load from LocalStorage or fallback to initials
  useEffect(() => {
    try {
      const savedMenu = localStorage.getItem('sc_menu_items');
      const savedStudents = localStorage.getItem('sc_students');
      const savedOrders = localStorage.getItem('sc_orders');
      const savedNotifs = localStorage.getItem('sc_notifications');
      const savedUser = localStorage.getItem('sc_current_user');

      if (savedMenu) {
        const parsedMenu = JSON.parse(savedMenu);
        const hasOldItems = parsedMenu.some((item: any) => item.name === 'Classic Double Cheeseburger' || item.name === 'Grilled Chicken Rice Bowl');
        const hasNewItems = parsedMenu.some((item: any) => item.name === 'Samosa' || item.name === 'Idli (2pcs)');
        const hasSnacks = parsedMenu.some((item: any) => item.category === 'Snacks');
        const hasWaterBottles = parsedMenu.some((item: any) => item.name === 'Water Bottle (500ml)');
        const hasOldDrinks = parsedMenu.some((item: any) => item.name === 'Iced Matcha Green Tea Latte' || item.name === 'Fresh Squeezed Orange Juice');
        const hasNewDesserts = parsedMenu.some((item: any) => item.name === 'Chocolate Pastry' || item.name === 'Vanilla Ice Cream Cup');
        
        if (hasOldItems || !hasNewItems || hasSnacks || !hasWaterBottles || hasOldDrinks || !hasNewDesserts) {
          // Auto-migrate menu and historical orders to the newly requested Indian menu without snacks & old drinks, and with new desserts
          setMenuItems(INITIAL_MENU_ITEMS);
          setOrders(generateMockHistoricalOrders());
          localStorage.setItem('sc_menu_items', JSON.stringify(INITIAL_MENU_ITEMS));
          localStorage.setItem('sc_orders', JSON.stringify(generateMockHistoricalOrders()));
        } else {
          setMenuItems(parsedMenu);
        }
      } else {
        setMenuItems(INITIAL_MENU_ITEMS);
      }

      if (savedStudents) setRegisteredStudents(JSON.parse(savedStudents));
      else setRegisteredStudents(INITIAL_STUDENTS);

      if (savedOrders) setOrders(JSON.parse(savedOrders));
      else setOrders(generateMockHistoricalOrders());

      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      else setNotifications([]);

      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      else setCurrentUser(INITIAL_STUDENTS[0]); // Auto-login Alice for instant play!
    } catch (e) {
      console.error("Local storage sync error", e);
    }
  }, []);

  // Save states to LocalStorage on changes
  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('sc_menu_items', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  useEffect(() => {
    if (registeredStudents.length > 0) {
      localStorage.setItem('sc_students', JSON.stringify(registeredStudents));
    }
  }, [registeredStudents]);

  useEffect(() => {
    localStorage.setItem('sc_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sc_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sc_current_user');
    }
  }, [currentUser]);

  // RESET DATABASE function
  const handleResetDatabase = () => {
    if (window.confirm("Are you sure you want to restore original canteen menus and reset order histories?")) {
      localStorage.clear();
      setMenuItems(INITIAL_MENU_ITEMS);
      setRegisteredStudents(INITIAL_STUDENTS);
      setOrders(generateMockHistoricalOrders());
      setNotifications([]);
      setCurrentUser(INITIAL_STUDENTS[0]);
      setView('split');
      alert("Smart Canteen Database restored successfully!");
    }
  };

  // Add virtual pre-paid money to wallet
  const handleAddBalance = () => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      balance: currentUser.balance + 1500.00
    };
    setCurrentUser(updatedUser);
    setRegisteredStudents(prev => prev.map(s => s.id === currentUser.id ? updatedUser : s));

    // Log Notification
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      message: `+₹1500.00 virtual funds loaded securely to your school canteen wallet!`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'success'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Student Places Order
  const handlePlaceOrder = (
    items: OrderItem[],
    total: number,
    pickupTime: string,
    paymentMethod: 'Wallet' | 'UPI' | 'Card',
    discountApplied: number = 0,
    pointsEarned: number = 0,
    pointsRedeemed: number = 0
  ) => {
    if (!currentUser) return;

    const newOrder: Order = {
      id: `order_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      orderDate: new Date().toISOString(),
      items,
      totalAmount: total,
      discountApplied,
      pointsEarned,
      pointsRedeemed,
      paymentStatus: 'Paid',
      pickupTime,
      orderStatus: 'Pending',
      estimatedPrepTimeMinutes: items.reduce((max, i) => {
        const matchingFood = menuItems.find(f => f.id === i.foodId);
        return Math.max(max, matchingFood ? matchingFood.prepTimeMinutes : 10);
      }, 10),
      paymentMethod
    };

    setOrders(prev => [newOrder, ...prev]);

    // Send order notifications
    const earnedMessage = pointsEarned > 0 ? ` Earned ${pointsEarned} loyalty points!` : '';
    const redeemedMessage = pointsRedeemed > 0 ? ` Redeemed ${pointsRedeemed} points (-₹${discountApplied.toFixed(2)} off).` : '';
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      message: `Pre-order confirmed! Est. pickup: ${pickupTime}.${earnedMessage}${redeemedMessage}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'info'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Staff updates order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const orderShortId = order.id.slice(-4);
        const timestamp = new Date().toISOString();

        // Trigger notifications for every status change
        if (newStatus === 'Preparing') {
          setActivePushNotification({
            id: order.id,
            status: newStatus,
            message: `👨‍🍳 Hey ${order.studentName}! Kitchen started preparing your order #${orderShortId}!`
          });

          const notif: Notification = {
            id: `notif_${Date.now()}`,
            message: `Order #${orderShortId} is now PREPARING in the kitchen.`,
            timestamp,
            read: false,
            type: 'info'
          };
          setNotifications(prev => [notif, ...prev]);
        } else if (newStatus === 'Ready for Pickup') {
          setActivePushNotification({
            id: order.id,
            status: newStatus,
            message: `🔔 Hey ${order.studentName}! Your order #${orderShortId} is READY for pickup at Counter #1!`
          });

          const readyNotif: Notification = {
            id: `notif_${Date.now()}`,
            message: `Your food order #${orderShortId} is ready for pickup! Collect it from Counter #1 now.`,
            timestamp,
            read: false,
            type: 'success'
          };
          setNotifications(prev => [readyNotif, ...prev]);
        } else if (newStatus === 'Collected') {
          setActivePushNotification({
            id: order.id,
            status: newStatus,
            message: `✅ Order #${orderShortId} collected! Thank you for ordering, ${order.studentName}!`
          });

          const collectedNotif: Notification = {
            id: `notif_${Date.now()}`,
            message: `Order #${orderShortId} marked as collected. Enjoy your meal!`,
            timestamp,
            read: false,
            type: 'success'
          };
          setNotifications(prev => [collectedNotif, ...prev]);
        } else if (newStatus === 'Cancelled') {
          setActivePushNotification({
            id: order.id,
            status: newStatus,
            message: `❌ Order #${orderShortId} was cancelled.`
          });

          const cancelNotif: Notification = {
            id: `notif_${Date.now()}`,
            message: `Order #${orderShortId} was cancelled.`,
            timestamp,
            read: false,
            type: 'alert'
          };
          setNotifications(prev => [cancelNotif, ...prev]);
        }

        return {
          ...order,
          orderStatus: newStatus
        };
      }
      return order;
    }));
  };

  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between">
      
      {/* Universal Sticky Header */}
      <CanteenHeader
        currentView={view}
        setView={setView}
        currentUser={currentUser}
        onLogout={() => setCurrentUser(null)}
        onAddBalance={handleAddBalance}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        onResetDatabase={handleResetDatabase}
      />

      {/* SIMULATED PUSH NOTIFICATION ALERTS OVERLAY */}
      <AnimatePresence>
        {activePushNotification && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full" id="push-notification-banner">
            <motion.div
              initial={{ transform: 'translateY(100px)', opacity: 0 }}
              animate={{ translateY: 0, opacity: 1 }}
              exit={{ transform: 'translateY(100px)', opacity: 0 }}
              className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-indigo-500 flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="bg-indigo-600 text-white p-2 rounded-xl">
                  <Bell className="h-5 w-5 animate-swing" />
                </div>
                <div className="flex-grow">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block font-mono">Canteen Push Alert</span>
                  <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-100">{activePushNotification.message}</p>
                </div>
                <button
                  onClick={() => setActivePushNotification(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-800 pt-2">
                {activePushNotification.status === 'Ready for Pickup' ? (
                  <button
                    onClick={() => {
                      handleUpdateOrderStatus(activePushNotification.id, 'Collected');
                      setActivePushNotification(null);
                      setView('student');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg"
                  >
                    I got my meal!
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActivePushNotification(null);
                      setView('student');
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg"
                  >
                    View Status
                  </button>
                )}
                <button
                  onClick={() => setActivePushNotification(null)}
                  className="bg-slate-800 text-slate-300 font-semibold text-[10px] px-3 py-1.5 rounded-lg hover:bg-slate-700"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MAIN VIEW CONTROLLER GRID */}
      <main className="flex-grow">
        {/* VIEW 1: STUDENT VIEW ONLY */}
        {view === 'student' && (
          <div className="max-w-md mx-auto py-6">
            <div className="bg-white rounded-[40px] border-[12px] border-slate-900 shadow-2xl overflow-hidden min-h-[780px] relative">
              {/* Phone Status bar */}
              <div className="bg-slate-900 text-white h-7 px-6 flex items-center justify-between text-[10px] font-mono select-none">
                <span>9:41 AM</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-indigo-400">Live Connected</span>
                  <span>🔋 99%</span>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[750px]">
                <StudentPortal
                  menuItems={menuItems}
                  currentUser={currentUser}
                  setCurrentUser={setCurrentUser}
                  registeredStudents={registeredStudents}
                  setRegisteredStudents={setRegisteredStudents}
                  orders={orders}
                  onPlaceOrder={handlePlaceOrder}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  notifications={notifications}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: STAFF VIEW ONLY */}
        {view === 'staff' && (
          <StaffPortal
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {/* VIEW 3: SPLIT simulator SCREEN */}
        {view === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 items-start">
            
            {/* Left Mobile Student Simulator */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-slate-400" />
                  Student Mobile Interface
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-700 font-mono font-bold px-2.5 py-0.5 rounded-full">
                  Interactive Simulator
                </span>
              </div>
              
               {/* Phone Chassis Container */}
              <div className="bg-white rounded-[40px] border-[12px] border-slate-900 shadow-2xl overflow-hidden min-h-[720px] relative">
                {/* Phone Top Notch Status bar */}
                <div className="bg-slate-900 text-white h-8 px-6 flex items-center justify-between text-[10px] font-mono select-none">
                  <span>11:50 AM</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-400 font-bold">SIM ACTIVE</span>
                    <span>🔋 100%</span>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[690px]">
                  <StudentPortal
                    menuItems={menuItems}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    registeredStudents={registeredStudents}
                    setRegisteredStudents={setRegisteredStudents}
                    orders={orders}
                    onPlaceOrder={handlePlaceOrder}
                    onUpdateOrderStatus={handleUpdateOrderStatus}
                    notifications={notifications}
                  />
                </div>
              </div>
            </div>

            {/* Right Canteen Staff Terminal Simulator */}
            <div className="lg:col-span-7 space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 px-2">
                <Monitor className="h-4 w-4 text-slate-400" />
                Kitchen Counter Monitor
              </span>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl min-h-[750px] shadow-sm">
                <StaffPortal
                  menuItems={menuItems}
                  setMenuItems={setMenuItems}
                  orders={orders}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                />
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 border-t border-slate-800 text-center text-xs font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Smart Canteen Pre-Order System © 2026</span>
          <div className="flex gap-4">
            <span>Database Sync: <span className="text-indigo-400">Connected</span></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
