export type MessStatus = 'OPEN' | 'CLOSED';
export type DishAvailability = 'Available' | 'Few Left' | 'Finished' | 'Availability Not Confirmed';
export type DishCategory =
  | 'Main Item'
  | 'Sweet'
  | 'Juice'
  | 'Pickle'
  | 'Fruit'
  | 'Common Rice'
  | 'Special Rice'
  | 'Salad'
  | 'Dry Vegetable'
  | 'Dal'
  | 'Steam Rice'
  | 'Chapati Preparation'
  | 'Curd'
  | 'Rasam/Sambar'
  | 'Dessert'
  | 'Beverage'
  | 'Snack'
  | 'Flavoured Rice'
  | 'Accompaniment'
  | 'Other';

export type MealType = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';

export interface Counter {
  name: string;
  type: 'North Indian' | 'South Indian' | 'Vegetarian';
}

export interface MessData {
  id: number;
  name: string;
  status: MessStatus;
  waitMinutes: number | null;
  queueCount: number;
  openCounters: number;
  totalCounters: number;
  lastUpdated: string;
  dataFresh: 'Fresh' | 'Stale' | 'Unavailable';
  image: string;
}

export interface Dish {
  id: string;
  name: string;
  image: string;
  isVeg: boolean | null;
  category: DishCategory;
  availability: DishAvailability;
}

export interface Meal {
  type: MealType;
  timing: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  icon: 'Sunrise' | 'Sun' | 'Coffee' | 'Moon';
  dishes: Dish[];
}

export interface DayMenu {
  date: string;
  meals: Meal[];
}

export const CAMPUS_LOCATION = 'SRM University — AP Campus, Neerukonda';

export const CAMPUS_IMAGE =
  'https://images.pexels.com/photos/39323513/pexels-photo-39323513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

export const MESS_TIMINGS = [
  { type: 'Breakfast' as MealType, time: '7:00 AM – 9:00 AM', startHour: 7, startMinute: 0, endHour: 9, endMinute: 0, icon: 'Sunrise' as const },
  { type: 'Lunch' as MealType, time: '12:00 PM – 2:00 PM', startHour: 12, startMinute: 0, endHour: 14, endMinute: 0, icon: 'Sun' as const },
  { type: 'Snacks' as MealType, time: '4:30 PM – 5:45 PM', startHour: 16, startMinute: 30, endHour: 17, endMinute: 45, icon: 'Coffee' as const },
  { type: 'Dinner' as MealType, time: '7:00 PM – 9:00 PM', startHour: 19, startMinute: 0, endHour: 21, endMinute: 0, icon: 'Moon' as const },
];

export const MESS_COUNTERS: Counter[] = [
  { name: 'Counter 1', type: 'North Indian' },
  { name: 'Counter 2', type: 'South Indian' },
  { name: 'Counter 3', type: 'South Indian' },
  { name: 'Counter 4', type: 'Vegetarian' },
];

export const DEMO_MESSES: MessData[] = [
  {
    id: 1,
    name: 'Mess 1',
    status: 'OPEN',
    waitMinutes: 5,
    queueCount: 8,
    openCounters: 3,
    totalCounters: 4,
    lastUpdated: '2 min ago',
    dataFresh: 'Fresh',
    image:
      'https://images.pexels.com/photos/35532821/pexels-photo-35532821.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 2,
    name: 'Mess 2',
    status: 'CLOSED',
    waitMinutes: null,
    queueCount: 0,
    openCounters: 0,
    totalCounters: 4,
    lastUpdated: 'Unavailable',
    dataFresh: 'Unavailable',
    image:
      'https://images.pexels.com/photos/11923047/pexels-photo-11923047.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
  {
    id: 3,
    name: 'Mess 3',
    status: 'OPEN',
    waitMinutes: 12,
    queueCount: 20,
    openCounters: 2,
    totalCounters: 4,
    lastUpdated: '1 min ago',
    dataFresh: 'Fresh',
    image:
      'https://images.pexels.com/photos/37142278/pexels-photo-37142278.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  },
];

// Cinematic dark food photography URLs from Pexels
const IMG = {
  idli: 'https://images.pexels.com/photos/20422128/pexels-photo-20422128.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  dosa: 'https://images.pexels.com/photos/20422133/pexels-photo-20422133.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  chai: 'https://images.pexels.com/photos/34704515/pexels-photo-34704515.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  fruit: 'https://images.pexels.com/photos/38143327/pexels-photo-38143327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  samosa: 'https://images.pexels.com/photos/28075291/pexels-photo-28075291.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  pickle: 'https://images.pexels.com/photos/13724203/pexels-photo-13724203.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  thali: 'https://images.pexels.com/photos/39323513/pexels-photo-39323513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  curryRice: 'https://images.pexels.com/photos/37485643/pexels-photo-37485643.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  chapatiMeal: 'https://images.pexels.com/photos/20408457/pexels-photo-20408457.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  dal: 'https://images.pexels.com/photos/28674708/pexels-photo-28674708.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  dalRice: 'https://images.pexels.com/photos/28674557/pexels-photo-28674557.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  chapati: 'https://images.pexels.com/photos/36388556/pexels-photo-36388556.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  paratha: 'https://images.pexels.com/photos/20446407/pexels-photo-20446407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  salad: 'https://images.pexels.com/photos/38431259/pexels-photo-38431259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  sambar: 'https://images.pexels.com/photos/38192678/pexels-photo-38192678.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  curd: 'https://images.pexels.com/photos/6808666/pexels-photo-6808666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  dryVeg: 'https://images.pexels.com/photos/35532821/pexels-photo-35532821.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  biryani: 'https://images.pexels.com/photos/12669168/pexels-photo-12669168.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  friedRice: 'https://images.pexels.com/photos/8215776/pexels-photo-8215776.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  gulabJamun: 'https://images.pexels.com/photos/37294501/pexels-photo-37294501.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  kheer: 'https://images.pexels.com/photos/33430555/pexels-photo-33430555.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  rotiCurry: 'https://images.pexels.com/photos/7364662/pexels-photo-7364662.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  thali2: 'https://images.pexels.com/photos/37420999/pexels-photo-37420999.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  dessert: 'https://images.pexels.com/photos/39851728/pexels-photo-39851728.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  curryPlate: 'https://images.pexels.com/photos/37142278/pexels-photo-37142278.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

// Helper to create dish objects
function dish(id: string, name: string, image: string, isVeg: boolean | null, category: DishCategory, availability: DishAvailability): Dish {
  return { id, name, image, isVeg, category, availability };
}

// Sample menu for a day — clearly demo data, not the actual campus menu
function createSampleMenu(): Meal[] {
  return [
    {
      type: 'Breakfast',
      timing: '7:00 AM – 9:00 AM',
      startHour: 7, startMinute: 0, endHour: 9, endMinute: 0,
      icon: 'Sunrise',
      dishes: [
        dish('b1', 'Idli with Sambar', IMG.idli, true, 'Main Item', 'Available'),
        dish('b2', 'Masala Dosa', IMG.dosa, true, 'Main Item', 'Few Left'),
        dish('b3', 'Masala Chai', IMG.chai, true, 'Beverage', 'Available'),
        dish('b4', 'Fresh Fruit Platter', IMG.fruit, true, 'Fruit', 'Available'),
        dish('b5', 'Aloo Paratha', IMG.paratha, true, 'Chapati Preparation', 'Finished'),
      ],
    },
    {
      type: 'Lunch',
      timing: '12:00 PM – 2:00 PM',
      startHour: 12, startMinute: 0, endHour: 14, endMinute: 0,
      icon: 'Sun',
      dishes: [
        dish('l1', 'Steamed Rice', IMG.dalRice, true, 'Common Rice', 'Available'),
        dish('l2', 'Dal Tadka', IMG.dal, true, 'Dal', 'Available'),
        dish('l3', 'Vegetable Curry', IMG.dryVeg, true, 'Dry Vegetable', 'Few Left'),
        dish('l4', 'Chapati', IMG.chapati, true, 'Chapati Preparation', 'Available'),
        dish('l5', 'Sambar', IMG.sambar, true, 'Rasam/Sambar', 'Available'),
        dish('l6', 'Curd Rice', IMG.curd, true, 'Curd', 'Available'),
        dish('l7', 'Fresh Salad', IMG.salad, true, 'Salad', 'Available'),
        dish('l8', 'Mango Pickle', IMG.pickle, true, 'Pickle', 'Availability Not Confirmed'),
      ],
    },
    {
      type: 'Snacks',
      timing: '4:30 PM – 5:45 PM',
      startHour: 16, startMinute: 30, endHour: 17, endMinute: 45,
      icon: 'Coffee',
      dishes: [
        dish('s1', 'Samosa with Chutney', IMG.samosa, true, 'Snack', 'Available'),
        dish('s2', 'Masala Chai', IMG.chai, true, 'Beverage', 'Few Left'),
        dish('s3', 'Fresh Fruit', IMG.fruit, true, 'Fruit', 'Available'),
        dish('s4', 'Vegetable Biryani', IMG.biryani, true, 'Flavoured Rice', 'Finished'),
      ],
    },
    {
      type: 'Dinner',
      timing: '7:00 PM – 9:00 PM',
      startHour: 19, startMinute: 0, endHour: 21, endMinute: 0,
      icon: 'Moon',
      dishes: [
        dish('d1', 'Chickpea Curry with Roti', IMG.rotiCurry, true, 'Main Item', 'Available'),
        dish('d2', 'Steamed Rice', IMG.dalRice, true, 'Common Rice', 'Available'),
        dish('d3', 'Dal Tadka', IMG.dal, true, 'Dal', 'Available'),
        dish('d4', 'Chapati', IMG.chapati, true, 'Chapati Preparation', 'Available'),
        dish('d5', 'Dry Vegetable Sabzi', IMG.dryVeg, true, 'Dry Vegetable', 'Availability Not Confirmed'),
        dish('d6', 'Curd Rice', IMG.curd, true, 'Curd', 'Few Left'),
        dish('d7', 'Gulab Jamun', IMG.gulabJamun, true, 'Sweet', 'Available'),
        dish('d8', 'Mango Pickle', IMG.pickle, true, 'Pickle', 'Available'),
      ],
    },
  ];
}

// Generate menus for the current week (Mon–Sun) with the current day having a full menu
// and all other days also having sample menus for demo purposes
export function getWeekMenus(): DayMenu[] {
  const menus: DayMenu[] = [];
  const today = getIndiaDate();

  // Find the Monday of the current week
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
  const monday = new Date(today);
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = formatDateISO(date);
    const isToday = formatDateISO(date) === formatDateISO(today);

    // All days get a sample menu for demo; in production, only published dates would have menus
    menus.push({
      date: dateStr,
      meals: createSampleMenu(),
    });

    // Mark today's menu with a flag for display
    if (isToday) {
      // Today's menu is the same sample; in production this would be published by managers
    }
  }

  return menus;
}

// Date utilities — all in Asia/Kolkata timezone
export function getIndiaDate(): Date {
  const now = new Date();
  // Convert to India time (UTC+5:30)
  const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  return indiaTime;
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

export function getWeekdayName(date: Date): string {
  return date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'Asia/Kolkata' });
}

// Check if a meal window is currently active in India time
export function getActiveMealIndex(): number {
  const now = getIndiaDate();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < MESS_TIMINGS.length; i++) {
    const t = MESS_TIMINGS[i];
    const start = t.startHour * 60 + t.startMinute;
    const end = t.endHour * 60 + t.endMinute;
    if (currentMinutes >= start && currentMinutes <= end) {
      return i;
    }
  }
  return -1;
}

// Parse an ISO date string (YYYY-MM-DD) back to a Date
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const IMAGES = IMG;
