import React, { useState } from 'react';
import { ChefHat, Utensils, Smartphone, Monitor, Sparkles, Bell, Wallet, User, LogOut, RefreshCw } from 'lucide-react';
import { Student, Notification } from '../types';

interface CanteenHeaderProps {
  currentView: 'student' | 'staff' | 'split';
  setView: (view: 'student' | 'staff' | 'split') => void;
  currentUser: Student | null;
  onLogout: () => void;
  onAddBalance: () => void;
  notifications: Notification[];
  onClearNotifications: () => void;
  onResetDatabase: () => void;
}

export default function CanteenHeader({
  currentView,
  setView,
  currentUser,
  onLogout,
  onAddBalance,
  notifications,
  onClearNotifications,
  onResetDatabase,
}: CanteenHeaderProps) {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg leading-tight tracking-tight block sm:inline">
                Smart<span className="text-indigo-400">Canteen</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-mono">PRE-ORDER PLATFORM</span>
            </div>
          </div>

          {/* View Controller (Interactive Toggles) */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700 shadow-inner">
            <button
              onClick={() => setView('student')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentView === 'student'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              id="btn-view-student"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Student Portal</span>
              <span className="md:hidden">Student</span>
            </button>
            <button
              onClick={() => setView('staff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentView === 'staff'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              id="btn-view-staff"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Staff Terminal</span>
              <span className="md:hidden">Staff</span>
            </button>
            <button
              onClick={() => setView('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentView === 'split'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
              id="btn-view-split"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Split Simulator</span>
              <span className="md:hidden">Split</span>
            </button>
          </div>

          {/* Right Section (Wallet, Alerts, User) */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <>
                {/* Virtual Wallet */}
                <div 
                  onClick={onAddBalance}
                  className="hidden sm:flex items-center gap-2 bg-indigo-950/40 border border-indigo-800/60 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-indigo-950/70 transition-all text-indigo-400 group"
                  title="Add prepaid virtual funds"
                  id="wallet-trigger"
                >
                  <Wallet className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-indigo-500 block uppercase font-bold tracking-wider">Wallet</span>
                    <span className="text-sm font-semibold font-mono">₹{currentUser.balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Loyalty Points */}
                <div 
                  className="hidden sm:flex items-center gap-2 bg-amber-950/20 border border-amber-800/40 px-3 py-1.5 rounded-xl text-amber-400"
                  title="Your loyalty points balance (100 pts = ₹80)"
                  id="loyalty-header-display"
                >
                  <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                  <div className="text-left leading-none">
                    <span className="text-[9px] text-amber-500 block uppercase font-bold tracking-wider">Points</span>
                    <span className="text-sm font-semibold font-mono">{currentUser.loyaltyPoints ?? 0} pts</span>
                  </div>
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all relative"
                    id="notifications-bell"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-bounce">
                        {unreadNotifs.length}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden" id="notification-popover">
                      <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <span className="font-semibold text-sm">Notifications</span>
                        <div className="flex gap-2">
                          {notifications.length > 0 && (
                            <button
                              onClick={() => {
                                onClearNotifications();
                                setShowNotifMenu(false);
                              }}
                              className="text-xs text-rose-400 hover:text-rose-300"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            No alerts or updates yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 text-xs transition-colors ${
                                !notif.read ? 'bg-slate-800/40 text-indigo-100' : 'text-slate-400'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium leading-relaxed">{notif.message}</span>
                                <span className="text-[9px] text-slate-500 shrink-0">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Logged in User Display */}
                <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
                  <div className="hidden lg:block text-right">
                    <span className="text-xs font-semibold block text-slate-200">{currentUser.name}</span>
                    <span className="text-[10px] text-slate-500 block">Student</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all"
                    title="Sign Out"
                    id="btn-sign-out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            )}

            {/* General Database reset button */}
            <button
              onClick={onResetDatabase}
              className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 rounded-xl transition-all"
              title="Reset Database to Defaults"
              id="btn-reset-db"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
