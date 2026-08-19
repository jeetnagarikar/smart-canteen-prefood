import React, { useState, useMemo } from 'react';
import { 
  ChefHat, TrendingUp, IndianRupee, ListOrdered, Utensils, Edit2, 
  Plus, Check, X, ToggleLeft, ToggleRight, AlertTriangle, Play, CheckSquare, Sparkles, Filter
} from 'lucide-react';
import { MenuItem, Order, OrderStatus, FoodCategory } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-2xl text-xs space-y-1 text-left">
        <p className="font-extrabold text-slate-100">{data.name}</p>
        <p className="text-[10px] font-bold text-slate-400">Category: <span className="text-indigo-400 font-extrabold">{data.category}</span></p>
        <div className="flex items-center gap-4 pt-1.5 font-mono text-[11px] border-t border-slate-800 mt-1.5">
          <span>Quantity: <strong className="text-white font-extrabold">{data.quantity}</strong></span>
          <span>Revenue: <strong className="text-emerald-400 font-extrabold">₹{data.amount.toFixed(2)}</strong></span>
        </div>
      </div>
    );
  }
  return null;
};

interface StaffPortalProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function StaffPortal({
  menuItems,
  setMenuItems,
  orders,
  onUpdateOrderStatus,
}: StaffPortalProps) {
  // Tabs: "Kitchen Queue", "Menu Management", "Canteen Analytics"
  const [activeTab, setActiveTab] = useState<'kitchen' | 'menu' | 'analytics'>('kitchen');

  // Filter orders in Kitchen Queue
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'All_Active'>('All_Active');

  // New Menu Item Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<FoodCategory>('Main Course');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemEmoji, setNewItemEmoji] = useState('🍔');
  const [newItemPrepTime, setNewItemPrepTime] = useState('10');
  const [newItemCalories, setNewItemCalories] = useState('');
  const [newItemProtein, setNewItemProtein] = useState('');
  const [newItemCarbs, setNewItemCarbs] = useState('');
  const [newItemFat, setNewItemFat] = useState('');
  const [newItemError, setNewItemError] = useState('');

  // Editing existing menu item states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editAvailability, setEditAvailability] = useState(true);

  // Compute Active/Completed orders for kitchen view
  const activeOrders = useMemo(() => {
    return orders.filter(o => o.orderStatus !== 'Collected' && o.orderStatus !== 'Cancelled');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'All_Active') {
      return activeOrders;
    }
    return activeOrders.filter(o => o.orderStatus === orderFilter);
  }, [activeOrders, orderFilter]);

  // Compute Analytics Dashboard
  const analytics = useMemo(() => {
    const completedOrders = orders.filter(o => o.orderStatus === 'Collected');
    const totalSales = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Calculate popular food items counts
    const popularity: { [key: string]: { name: string; count: number; category: string } } = {};
    orders.forEach(o => {
      if (o.orderStatus !== 'Cancelled') {
        o.items.forEach(it => {
          if (!popularity[it.foodId]) {
            popularity[it.foodId] = { name: it.name, count: 0, category: '' };
          }
          popularity[it.foodId].count += it.quantity;
        });
      }
    });

    // Sort popular items
    const popularItemsList = Object.keys(popularity)
      .map(key => ({
        id: key,
        name: popularity[key].name,
        count: popularity[key].count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    return {
      totalSales,
      completedCount: completedOrders.length,
      pendingCount: orders.filter(o => o.orderStatus === 'Pending').length,
      preparingCount: orders.filter(o => o.orderStatus === 'Preparing').length,
      popularItems: popularItemsList
    };
  }, [orders]);

  // Compute popular items ordered over the last 7 days for the Recharts bar chart
  const last7DaysPopularityData = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const popularity: { 
      [key: string]: { 
        name: string; 
        quantity: number; 
        amount: number; 
        category: FoodCategory; 
        image: string;
      } 
    } = {};

    orders.forEach(o => {
      if (o.orderStatus !== 'Cancelled') {
        const orderDate = new Date(o.orderDate);
        if (orderDate >= sevenDaysAgo) {
          o.items.forEach(it => {
            if (!popularity[it.foodId]) {
              const menuItem = menuItems.find(m => m.id === it.foodId);
              popularity[it.foodId] = {
                name: it.name,
                quantity: 0,
                amount: 0,
                category: menuItem ? menuItem.category : 'Main Course',
                image: menuItem ? menuItem.image : '🍔'
              };
            }
            popularity[it.foodId].quantity += it.quantity;
            popularity[it.foodId].amount += it.price * it.quantity;
          });
        }
      }
    });

    return Object.keys(popularity)
      .map(key => ({
        id: key,
        name: popularity[key].name,
        shortName: `${popularity[key].image} ${popularity[key].name.split(' (')[0]}`,
        quantity: popularity[key].quantity,
        amount: popularity[key].amount,
        category: popularity[key].category
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }, [orders, menuItems]);

  // Handle adding new food item to Canteen menu
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice || !newItemDesc) {
      setNewItemError('Please fill in all details.');
      return;
    }
    const parsedPrice = parseFloat(newItemPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setNewItemError('Price must be a valid positive decimal number.');
      return;
    }
    const parsedPrepTime = parseInt(newItemPrepTime, 10);
    if (isNaN(parsedPrepTime) || parsedPrepTime <= 0) {
      setNewItemError('Preparation time must be a positive integer.');
      return;
    }

    const newItem: MenuItem = {
      id: `food_${Date.now()}`,
      name: newItemName,
      price: parsedPrice,
      category: newItemCategory,
      availability: true,
      description: newItemDesc,
      image: newItemEmoji,
      prepTimeMinutes: parsedPrepTime,
      nutrition: {
        calories: parseInt(newItemCalories, 10) || 300,
        protein: parseInt(newItemProtein, 10) || 12,
        carbs: parseInt(newItemCarbs, 10) || 35,
        fat: parseInt(newItemFat, 10) || 10,
      }
    };

    setMenuItems(prev => [...prev, newItem]);
    setShowAddModal(false);
    
    // Reset Form fields
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
    setNewItemEmoji('🍔');
    setNewItemPrepTime('10');
    setNewItemCalories('');
    setNewItemProtein('');
    setNewItemCarbs('');
    setNewItemFat('');
    setNewItemError('');
  };

  // Toggle item availability
  const toggleItemAvailability = (id: string) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, availability: !item.availability };
      }
      return item;
    }));
  };

  // Start editing a menu item price
  const startEditItemPrice = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditPrice(item.price.toString());
    setEditAvailability(item.availability);
  };

  // Save changes to menu item
  const saveItemEdit = (id: string) => {
    const parsedPrice = parseFloat(editPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          price: parsedPrice,
          availability: editAvailability
        };
      }
      return item;
    }));
    setEditingItemId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'kitchen' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-staff-kitchen"
          >
            <ChefHat className="h-4 w-4" />
            Kitchen Monitor
            {orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length > 0 && (
              <span className="bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                {orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length} NEW
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'menu' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-staff-menu"
          >
            <Utensils className="h-4 w-4" />
            Menu Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-staff-analytics"
          >
            <TrendingUp className="h-4 w-4" />
            Canteen Analytics
          </button>
        </div>

        {activeTab === 'menu' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
            id="btn-add-food-item"
          >
            <Plus className="h-4 w-4" />
            Add New Dish
          </button>
        )}
      </div>

      {/* PORTALS RENDERING */}

      {/* 1. KITCHEN ACTIVE QUEUE */}
      {activeTab === 'kitchen' && (
        <div className="space-y-4">
          
          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap bg-slate-50 p-2 rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filter Tickets:
            </span>
            <div className="flex gap-1">
              {(['All_Active', 'Pending', 'Preparing', 'Ready for Pickup'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    orderFilter === filter
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/50'
                  }`}
                  id={`kitchen-filter-${filter}`}
                >
                  {filter === 'All_Active' ? 'All Active Queue' : filter}
                </button>
              ))}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
              <div className="text-4xl mb-2">💤</div>
              <h4 className="font-bold text-slate-800 text-sm">No orders in this queue</h4>
              <p className="text-slate-400 text-xs mt-1">When students pre-order food, tickets appear here in real time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                // Background & borders based on ticket urgency
                const cardColors = order.orderStatus === 'Pending' 
                  ? 'border-l-4 border-l-rose-500 ring-1 ring-slate-100' 
                  : order.orderStatus === 'Preparing' 
                    ? 'border-l-4 border-l-amber-500' 
                    : 'border-l-4 border-l-indigo-500 bg-indigo-50/20';

                return (
                  <div 
                    key={order.id} 
                    className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between ${cardColors}`}
                    id={`ticket-${order.id}`}
                  >
                    
                    {/* Top ticket header */}
                    <div className="p-4 border-b border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-800">
                              TICKET #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              order.orderStatus === 'Pending' 
                                ? 'bg-rose-50 text-rose-700' 
                                : order.orderStatus === 'Preparing' 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : 'bg-indigo-50 text-indigo-700'
                            }`}>
                              {order.orderStatus}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1 font-medium">
                            Student: <strong className="text-slate-800 font-semibold">{order.studentName}</strong>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-semibold block uppercase">Pickup Time</span>
                          <span className="font-mono font-extrabold text-slate-900 text-xs text-indigo-600 block">{order.pickupTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="p-4 flex-grow space-y-2 bg-slate-50/50">
                      <div className="divide-y divide-slate-100">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="py-2 flex flex-col gap-1 border-b border-slate-100 last:border-0 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="bg-slate-200 text-slate-800 font-bold px-1.5 py-0.2 rounded font-mono text-[10px]">
                                  x{it.quantity}
                                </span>
                                <span className="font-semibold text-slate-800">{it.name}</span>
                              </div>
                            </div>
                            {it.customization && (
                              <div className="pl-8 flex flex-col gap-0.5 text-[10px] text-slate-500">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-bold text-[9px]">
                                    Size: {it.customization.size}
                                  </span>
                                  {it.customization.addOns && it.customization.addOns.length > 0 && (
                                    <span className="text-slate-600 font-medium">
                                      • Add-ons: {it.customization.addOns.join(', ')}
                                    </span>
                                  )}
                                </div>
                                {it.customization.dietaryNotes && (
                                  <span className="text-amber-700 font-bold italic flex items-center gap-1 mt-0.5">
                                    ⚠️ Allergy/Dietary Note: "{it.customization.dietaryNotes}"
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Action Drawer Buttons */}
                    <div className="p-4 border-t border-slate-100 bg-white">
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-bold uppercase">Payment Status</span>
                          <span className="text-[11px] text-indigo-600 font-bold flex items-center gap-1 font-mono">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            PAID (₹{order.totalAmount.toFixed(2)})
                          </span>
                        </div>

                        {order.orderStatus === 'Pending' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            id={`btn-start-prep-${order.id}`}
                          >
                            <Play className="h-3.5 w-3.5 stroke-[2.5]" />
                            Start Prep
                          </button>
                        )}

                        {order.orderStatus === 'Preparing' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Ready for Pickup')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            id={`btn-ready-pickup-${order.id}`}
                          >
                            <CheckSquare className="h-3.5 w-3.5 stroke-[2.5]" />
                            Mark Ready
                          </button>
                        )}

                        {order.orderStatus === 'Ready for Pickup' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'Collected')}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                            id={`btn-collected-${order.id}`}
                          >
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                            Complete Collect
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Dish Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Est. Prep Time</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {menuItems.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <tr key={item.id} className={`${!item.availability ? 'bg-slate-50/50' : 'bg-white'}`}>
                    {/* Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl bg-slate-100 p-1.5 rounded-lg shrink-0 border border-slate-200/50">{item.image}</span>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-1">{item.description}</span>
                        </div>
                      </div>
                    </td>

                    {/* Cat */}
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-bold text-[10px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4 font-mono font-bold text-slate-800">
                      {isEditing ? (
                        <div className="relative max-w-[80px]">
                          <span className="absolute left-2 top-2 text-slate-400">₹</span>
                          <input
                            type="text"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-5 pr-1 outline-none font-bold font-mono text-xs focus:border-slate-800 text-slate-800"
                            id={`edit-price-input-${item.id}`}
                          />
                        </div>
                      ) : (
                        <span>₹{item.price.toFixed(2)}</span>
                      )}
                    </td>

                    {/* Prep Time */}
                    <td className="p-4 text-slate-500 font-mono text-xs">{item.prepTimeMinutes} mins</td>

                    {/* Avail */}
                    <td className="p-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editAvailability}
                            onChange={(e) => setEditAvailability(e.target.checked)}
                            className="rounded accent-indigo-600 h-4 w-4"
                            id={`edit-avail-chk-${item.id}`}
                          />
                          <span className="text-[10px] text-slate-700 font-semibold">Available</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleItemAvailability(item.id)}
                          className="flex items-center gap-1.5 text-left focus:outline-none"
                          title="Click to toggle availability quickly"
                        >
                          {item.availability ? (
                            <>
                              <ToggleRight className="h-6 w-6 text-indigo-600" />
                              <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">In Stock</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-6 w-6 text-slate-400" />
                              <span className="text-[10px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">Sold Out</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => saveItemEdit(item.id)}
                            className="bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-indigo-700 cursor-pointer"
                            id={`btn-save-edit-${item.id}`}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="bg-slate-100 text-slate-600 font-bold text-[10px] px-2.5 py-1.5 rounded-lg hover:bg-slate-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditItemPrice(item)}
                          className="text-slate-500 hover:text-slate-800 p-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
                          id={`btn-edit-item-${item.id}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. CANTEEN ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Bento-grid Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Today's Revenue</span>
                <span className="text-2xl font-extrabold font-mono mt-1 block text-indigo-400">₹{analytics.totalSales.toFixed(2)}</span>
                <span className="text-[9px] text-slate-500 block mt-1">Compiled from collected pre-orders</span>
              </div>
              <div className="bg-indigo-950 text-indigo-400 p-3 rounded-xl">
                <IndianRupee className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed Pickups</span>
                <span className="text-2xl font-extrabold font-mono mt-1 block text-slate-900">{analytics.completedCount}</span>
                <span className="text-[9px] text-indigo-600 block mt-1">100% collection rate</span>
              </div>
              <div className="bg-slate-100 text-slate-700 p-3 rounded-xl">
                <Check className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Currently Cooking</span>
                <span className="text-2xl font-extrabold font-mono mt-1 block text-amber-500">{analytics.preparingCount}</span>
                <span className="text-[9px] text-slate-400 block mt-1">Preparing in progress</span>
              </div>
              <div className="bg-amber-50 text-amber-500 p-3 rounded-xl">
                <ChefHat className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Kitchen Tickets</span>
                <span className="text-2xl font-extrabold font-mono mt-1 block text-rose-500">{analytics.pendingCount}</span>
                <span className="text-[9px] text-rose-400 block mt-1">Awaiting kitchen staff start</span>
              </div>
              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl">
                <ListOrdered className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* Recharts Bar Chart of most popular items ordered over the last 7 days */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider inline-flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="h-3 w-3" />
                  Live Canteen Sales
                </span>
                <h4 className="font-extrabold text-slate-900 text-base">Popularity of Canteen Dishes (Last 7 Days)</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Analysis of total quantity ordered by dish category and individual item counts</p>
              </div>
              {/* Category Legend */}
              <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#6366f1]" /> Main Course
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#06b6d4]" /> Drinks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#ec4899]" /> Desserts
                </span>
              </div>
            </div>

            {last7DaysPopularityData.length === 0 ? (
              <div className="h-[280px] flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                <Utensils className="h-10 w-10 text-slate-300 mb-2 animate-bounce" />
                <p className="font-bold text-slate-500">No sales data recorded in the last 7 days.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">New orders placed by students will show up here in real-time!</p>
              </div>
            ) : (
              <div className="h-[320px] w-full" id="popularity-recharts-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={last7DaysPopularityData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                    <Bar 
                      dataKey="quantity" 
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    >
                      {last7DaysPopularityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.category === 'Main Course' ? '#6366f1' :
                            entry.category === 'Drinks' ? '#06b6d4' :
                            entry.category === 'Desserts' ? '#ec4899' : '#6366f1'
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Popular Items & Preparation Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top items Sold Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900 text-sm">Top Pre-Ordered Dishes</h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">Best Sellers</span>
              </div>
              {analytics.popularItems.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No food data recorded yet. Place student orders first.
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.popularItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="h-7 w-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-600 font-mono">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">{item.name}</span>
                      </div>
                      <span className="bg-indigo-50 text-indigo-800 font-bold font-mono text-[11px] px-2.5 py-0.5 rounded-full">
                        {item.count} orders
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preparation Efficiency Stats */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-4">Canteen Efficiency Insights</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Pre-Order Queue Load</span>
                      <span className="font-mono text-indigo-600">Optimal (92%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Average Kitchen Response</span>
                      <span className="font-mono text-slate-700">6.4 mins</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[45%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Student Collection Compliance</span>
                      <span className="font-mono text-indigo-600">98% Collected</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full w-[98%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 text-indigo-800 p-3 rounded-xl mt-4 text-[11px] leading-relaxed flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Canteen queues are down by <strong>35%</strong> on days with active pre-orders. Keep dish ingredients ready 15 mins before break begins.
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DISH ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="add-dish-modal">
          <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-w-md w-full relative z-10">
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Add New Food Item</span>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddItem} className="p-6 space-y-4">
              {newItemError && (
                <div className="p-3 bg-rose-50 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{newItemError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Classic Margherita Pizza"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 text-xs focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-semibold"
                  id="add-item-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="text"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="350"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 text-xs focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-mono"
                    id="add-item-price"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as FoodCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-semibold"
                    id="add-item-category"
                  >
                    <option value="Main Course">Main Course</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    required
                    value={newItemEmoji}
                    onChange={(e) => setNewItemEmoji(e.target.value)}
                    placeholder="🍕"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 text-xs text-center focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 text-lg"
                    id="add-item-emoji"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrepTime}
                    onChange={(e) => setNewItemPrepTime(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-3 text-xs focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-mono"
                    id="add-item-preptime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dish Description</label>
                <textarea
                  required
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Fresh hand-stretched pizza dough with premium tomatoes, buffalo mozzarella, and fresh sweet basil leaves."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800"
                  id="add-item-desc"
                />
              </div>

              {/* Nutritional Information Inputs */}
              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nutritional Information (Optional)</span>
                <div className="grid grid-cols-4 gap-1.5">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Calories (kcal)</label>
                    <input
                      type="number"
                      value={newItemCalories}
                      onChange={(e) => setNewItemCalories(e.target.value)}
                      placeholder="350"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-mono"
                      id="add-item-calories"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Protein (g)</label>
                    <input
                      type="number"
                      value={newItemProtein}
                      onChange={(e) => setNewItemProtein(e.target.value)}
                      placeholder="12"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-mono"
                      id="add-item-protein"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Carbs (g)</label>
                    <input
                      type="number"
                      value={newItemCarbs}
                      onChange={(e) => setNewItemCarbs(e.target.value)}
                      placeholder="45"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-mono"
                      id="add-item-carbs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Fat (g)</label>
                    <input
                      type="number"
                      value={newItemFat}
                      onChange={(e) => setNewItemFat(e.target.value)}
                      placeholder="8"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-2 text-[10px] focus:ring-2 focus:ring-slate-900/10 outline-none text-slate-800 font-mono"
                      id="add-item-fat"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow cursor-pointer mt-2"
                id="btn-add-item-submit"
              >
                Add dish to Canteen Menu
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
