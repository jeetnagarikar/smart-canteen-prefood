import { MenuItem, Order } from './types';

export const generateMockHistoricalOrders = (): Order[] => {
  const pastDate = (daysAgo: number, timeStr: string): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const [hours, minutes] = timeStr.split(':');
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'order_mock_1',
      studentId: 'student_alice',
      studentName: 'Alice Johnson',
      orderDate: pastDate(1, '12:15'),
      items: [
        { foodId: 'food_1', name: 'Samosa', price: 30, quantity: 2 },
        { foodId: 'food_16', name: 'Water Bottle (500ml)', price: 10, quantity: 1 }
      ],
      totalAmount: 70,
      paymentStatus: 'Paid',
      pickupTime: '12:30 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 5,
      paymentMethod: 'Wallet'
    },
    {
      id: 'order_mock_2',
      studentId: 'student_bob',
      studentName: 'Bob Miller',
      orderDate: pastDate(2, '13:00'),
      items: [
        { foodId: 'food_2', name: 'Idli (2pcs)', price: 60, quantity: 1 },
        { foodId: 'food_17', name: 'Water Bottle (1000ml)', price: 20, quantity: 2 }
      ],
      totalAmount: 100,
      paymentStatus: 'Paid',
      pickupTime: '01:15 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 5,
      paymentMethod: 'UPI'
    },
    {
      id: 'order_mock_3',
      studentId: 'student_alice',
      studentName: 'Alice Johnson',
      orderDate: pastDate(3, '11:45'),
      items: [
        { foodId: 'food_13', name: 'Bread Pakoda (2pcs)', price: 60, quantity: 3 },
        { foodId: 'food_16', name: 'Water Bottle (500ml)', price: 10, quantity: 2 }
      ],
      totalAmount: 200,
      paymentStatus: 'Paid',
      pickupTime: '12:00 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 6,
      paymentMethod: 'Card'
    },
    {
      id: 'order_mock_4',
      studentId: 'student_bob',
      studentName: 'Bob Miller',
      orderDate: pastDate(4, '12:30'),
      items: [
        { foodId: 'food_15', name: 'Maggie', price: 45, quantity: 1 },
        { foodId: 'food_7', name: 'Chocolate Fudge Brownie', price: 200, quantity: 2 }
      ],
      totalAmount: 445,
      paymentStatus: 'Paid',
      pickupTime: '12:45 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 5,
      paymentMethod: 'Wallet'
    },
    {
      id: 'order_mock_5',
      studentId: 'student_alice',
      studentName: 'Alice Johnson',
      orderDate: pastDate(5, '12:05'),
      items: [
        { foodId: 'food_11', name: 'Mendu Vada (2pcs)', price: 70, quantity: 2 },
        { foodId: 'food_17', name: 'Water Bottle (1000ml)', price: 20, quantity: 1 }
      ],
      totalAmount: 160,
      paymentStatus: 'Paid',
      pickupTime: '12:20 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 8,
      paymentMethod: 'Wallet'
    },
    {
      id: 'order_mock_6',
      studentId: 'student_bob',
      studentName: 'Bob Miller',
      orderDate: pastDate(6, '13:10'),
      items: [
        { foodId: 'food_3', name: 'Poha', price: 50, quantity: 2 },
        { foodId: 'food_8', name: 'Fresh Fruit Parfait', price: 240, quantity: 1 }
      ],
      totalAmount: 340,
      paymentStatus: 'Paid',
      pickupTime: '01:25 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 5,
      paymentMethod: 'UPI'
    },
    {
      id: 'order_mock_7',
      studentId: 'student_alice',
      studentName: 'Alice Johnson',
      orderDate: pastDate(7, '12:00'),
      items: [
        { foodId: 'food_11', name: 'Mendu Vada (2pcs)', price: 70, quantity: 1 },
        { foodId: 'food_12', name: 'Upma', price: 55, quantity: 1 }
      ],
      totalAmount: 125,
      paymentStatus: 'Paid',
      pickupTime: '12:15 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 7,
      paymentMethod: 'Card'
    },
    {
      id: 'order_mock_8',
      studentId: 'student_bob',
      studentName: 'Bob Miller',
      orderDate: pastDate(2, '12:40'),
      items: [
        { foodId: 'food_1', name: 'Samosa', price: 30, quantity: 3 },
        { foodId: 'food_12', name: 'Upma', price: 55, quantity: 1 }
      ],
      totalAmount: 145,
      paymentStatus: 'Paid',
      pickupTime: '12:55 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 5,
      paymentMethod: 'Wallet'
    },
    {
      id: 'order_mock_9',
      studentId: 'student_alice',
      studentName: 'Alice Johnson',
      orderDate: pastDate(4, '11:50'),
      items: [
        { foodId: 'food_13', name: 'Bread Pakoda (2pcs)', price: 60, quantity: 2 },
        { foodId: 'food_16', name: 'Water Bottle (500ml)', price: 10, quantity: 2 }
      ],
      totalAmount: 140,
      paymentStatus: 'Paid',
      pickupTime: '12:05 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 6,
      paymentMethod: 'Wallet'
    },
    {
      id: 'order_mock_10',
      studentId: 'student_bob',
      studentName: 'Bob Miller',
      orderDate: pastDate(1, '13:15'),
      items: [
        { foodId: 'food_14', name: 'Aloo Bonda (2pcs)', price: 50, quantity: 1 },
        { foodId: 'food_7', name: 'Chocolate Fudge Brownie', price: 200, quantity: 2 }
      ],
      totalAmount: 450,
      paymentStatus: 'Paid',
      pickupTime: '01:30 PM',
      orderStatus: 'Collected',
      estimatedPrepTimeMinutes: 5,
      paymentMethod: 'UPI'
    }
  ];
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'food_1',
    name: 'Samosa',
    price: 30,
    category: 'Main Course',
    availability: true,
    description: 'Crispy pastry stuffed with spiced potatoes and peas, served with sweet tamarind and spicy mint chutneys.',
    image: '🥟',
    prepTimeMinutes: 5,
    nutrition: { calories: 260, protein: 4, carbs: 32, fat: 13 }
  },
  {
    id: 'food_2',
    name: 'Idli (2pcs)',
    price: 60,
    category: 'Main Course',
    availability: true,
    description: 'Steamed fluffy rice and lentil cakes, served with piping hot sambar and fresh coconut chutney.',
    image: '⚪',
    prepTimeMinutes: 5,
    nutrition: { calories: 180, protein: 5, carbs: 36, fat: 1 }
  },
  {
    id: 'food_3',
    name: 'Poha',
    price: 50,
    category: 'Main Course',
    availability: true,
    description: 'Flattened rice sautéed with onions, peanuts, mustard seeds, turmeric, and curry leaves.',
    image: '🟡',
    prepTimeMinutes: 5,
    nutrition: { calories: 280, protein: 6, carbs: 45, fat: 8 }
  },
  {
    id: 'food_6',
    name: 'Kachori',
    price: 40,
    category: 'Main Course',
    availability: true,
    description: 'Crispy flaky pastry filled with a spiced lentil stuffing, served with sweet and spicy chutneys.',
    image: '🥯',
    prepTimeMinutes: 5,
    nutrition: { calories: 310, protein: 5, carbs: 34, fat: 16 }
  },
  {
    id: 'food_11',
    name: 'Mendu Vada (2pcs)',
    price: 70,
    category: 'Main Course',
    availability: true,
    description: 'Crispy, deep-fried savory lentil donuts served with flavorful sambar and fresh coconut chutney.',
    image: '🍩',
    prepTimeMinutes: 7,
    nutrition: { calories: 290, protein: 7, carbs: 30, fat: 14 }
  },
  {
    id: 'food_12',
    name: 'Upma',
    price: 55,
    category: 'Main Course',
    availability: true,
    description: 'Thick semolina porridge cooked with seasoned vegetables, mustard seeds, and crunchy cashews.',
    image: '🥣',
    prepTimeMinutes: 6,
    nutrition: { calories: 240, protein: 5, carbs: 38, fat: 7 }
  },
  {
    id: 'food_13',
    name: 'Bread Pakoda (2pcs)',
    price: 60,
    category: 'Main Course',
    availability: true,
    description: 'Slices of bread stuffed with spiced potato mash, dipped in chickpea batter and deep-fried until golden.',
    image: '🍞',
    prepTimeMinutes: 6,
    nutrition: { calories: 350, protein: 8, carbs: 42, fat: 16 }
  },
  {
    id: 'food_14',
    name: 'Aloo Bonda (2pcs)',
    price: 50,
    category: 'Main Course',
    availability: true,
    description: 'Deep-fried savory potato fritters coated in a spiced chickpea flour batter.',
    image: '🟡',
    prepTimeMinutes: 5,
    nutrition: { calories: 290, protein: 5, carbs: 30, fat: 15 }
  },
  {
    id: 'food_15',
    name: 'Maggie',
    price: 45,
    category: 'Main Course',
    availability: true,
    description: 'Instant comfort noodles cooked street-style with mixed vegetables and aromatic Maggie tastemaker.',
    image: '🍜',
    prepTimeMinutes: 5,
    nutrition: { calories: 310, protein: 7, carbs: 45, fat: 11 }
  },
  {
    id: 'food_7',
    name: 'Chocolate Fudge Brownie',
    price: 200,
    category: 'Desserts',
    availability: true,
    description: 'Rich, chewy chocolate brownie loaded with chocolate chips and served warm.',
    image: '🍫',
    prepTimeMinutes: 2,
    nutrition: { calories: 320, protein: 4, carbs: 42, fat: 16 }
  },
  {
    id: 'food_8',
    name: 'Fresh Fruit Parfait',
    price: 240,
    category: 'Desserts',
    availability: true,
    description: 'Layers of creamy Greek yogurt, fresh strawberries, blueberries, and crunchy honey oat granola.',
    image: '🍓',
    prepTimeMinutes: 3,
    nutrition: { calories: 240, protein: 10, carbs: 38, fat: 4 }
  },
  {
    id: 'food_18',
    name: 'Chocolate Pastry',
    price: 80,
    category: 'Desserts',
    availability: true,
    description: 'Decadent chocolate sponge layered with rich chocolate ganache and chocolate shavings.',
    image: '🍰',
    prepTimeMinutes: 2,
    nutrition: { calories: 280, protein: 4, carbs: 38, fat: 12 }
  },
  {
    id: 'food_19',
    name: 'Vanilla Ice Cream Cup',
    price: 60,
    category: 'Desserts',
    availability: true,
    description: 'Creamy and smooth classic vanilla bean ice cream served in a cup.',
    image: '🍨',
    prepTimeMinutes: 1,
    nutrition: { calories: 150, protein: 3, carbs: 18, fat: 8 }
  },
  {
    id: 'food_16',
    name: 'Water Bottle (500ml)',
    price: 10,
    category: 'Drinks',
    availability: true,
    description: 'Purified mineral water bottle (500ml) to keep you hydrated.',
    image: '💧',
    prepTimeMinutes: 1,
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  },
  {
    id: 'food_17',
    name: 'Water Bottle (1000ml)',
    price: 20,
    category: 'Drinks',
    availability: true,
    description: 'Purified mineral water bottle (1000ml) to keep you hydrated.',
    image: '💧',
    prepTimeMinutes: 1,
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  }
];
