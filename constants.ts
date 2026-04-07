
import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // MOMOS
  { id: 'momo-1', name: 'Veg Steam Momo', price: 100, category: 'MOMOS', isVeg: true, image: 'https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?q=80&w=300&auto=format&fit=crop' },
  { id: 'momo-2', name: 'Veg Fry Momo', price: 120, category: 'MOMOS', isVeg: true, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=300&auto=format&fit=crop' },
  { id: 'momo-3', name: 'Veg Chilli Momo', price: 150, category: 'MOMOS', isVeg: true, image: 'https://images.unsplash.com/photo-1626776876729-babd0f2a583a?q=80&w=300&auto=format&fit=crop' },

  // NOODLES
  { id: 'nd-1', name: 'Veg Noodles', price: 100, category: 'NOODLES', isVeg: true, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=300&auto=format&fit=crop' },
  { id: 'nd-2', name: 'Veg Paneer Noodles', price: 140, category: 'NOODLES', isVeg: true, image: 'https://images.unsplash.com/photo-1606333543664-9f799738f658?q=80&w=300&auto=format&fit=crop' },
  { id: 'nd-3', name: 'Veg Hakka Noodles', price: 140, category: 'NOODLES', isVeg: true, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=300&auto=format&fit=crop' },
  { id: 'nd-5', name: 'Chicken Noodles', price: 140, category: 'NOODLES', isVeg: false, image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=300&auto=format&fit=crop' },
  { id: 'nd-7', name: 'Egg Chicken Noodles', price: 160, category: 'NOODLES', isVeg: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=300&auto=format&fit=crop' },
  { id: 'nd-8', name: 'Mix Noodles', price: 250, category: 'NOODLES', isVeg: false, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?q=80&w=300&auto=format&fit=crop' },

  // PAW BHAJI
  { id: 'pb-1', name: 'Paw Bhaji', price: 120, category: 'PAW BHAJI', isVeg: true, image: 'https://images.unsplash.com/photo-1626132646529-500637532537?q=80&w=300&auto=format&fit=crop' },
  { id: 'pb-2', name: 'Cheese Paw Bhaji', price: 150, category: 'PAW BHAJI', isVeg: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=300&auto=format&fit=crop' },

  // DOSA
  { id: 'ds-1', name: 'Plain Dosa', price: 80, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=300&auto=format&fit=crop' },
  { id: 'ds-2', name: 'Masala Dosa', price: 120, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=300&auto=format&fit=crop' },
  { id: 'ds-4', name: 'Paneer Butter Masala Dosa', price: 160, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?q=80&w=300&auto=format&fit=crop' },
  { id: 'ds-6', name: 'Cheese Masala Dosa', price: 160, category: 'DOSA', isVeg: true, image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=300&auto=format&fit=crop' },

  // SOUP
  { id: 'sp-1', name: 'Hot Tomato Soup', price: 120, category: 'SOUP', isVeg: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=300&auto=format&fit=crop' },
  { id: 'sp-5', name: 'Chicken Soup', price: 120, category: 'SOUP', isVeg: false, image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=300&auto=format&fit=crop' },

  // VEG STARTER
  { id: 'vst-1', name: 'Veg Pakora', price: 120, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1601050638917-3f048add4927?q=80&w=300&auto=format&fit=crop' },
  { id: 'vst-3', name: 'French Fry', price: 120, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300&auto=format&fit=crop' },
  { id: 'vst-6', name: 'Paneer Pakora', price: 160, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300&auto=format&fit=crop' },
  { id: 'vst-10', name: 'Mushroom Dry Fry', price: 240, category: 'VEG STARTER', isVeg: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=300&auto=format&fit=crop' },

  // MAIN COURSE VEG
  { id: 'mcv-4', name: 'Mix Veg', price: 200, category: 'MAIN COURSE (VEG)', isVeg: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=300&auto=format&fit=crop' },
  { id: 'mcv-7', name: 'Paneer Butter Masala', price: 220, category: 'MAIN COURSE (VEG)', isVeg: true, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=300&auto=format&fit=crop' },
  { id: 'mcv-21', name: 'Shahi Paneer', price: 260, category: 'MAIN COURSE (VEG)', isVeg: true, image: 'https://images.unsplash.com/photo-1601050638917-3f048add4927?q=80&w=300&auto=format&fit=crop' },

  // NON VEG STARTER
  { id: 'nvst-5', name: 'Chicken Pakora', price: 180, category: 'NON VEG STARTER', isVeg: false, image: 'https://images.unsplash.com/photo-1614398751058-eb2e0bf63e51?q=80&w=300&auto=format&fit=crop' },
  { id: 'nvst-7', name: 'Chicken Lolipop Full (8pc)', price: 320, category: 'NON VEG STARTER', isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300&auto=format&fit=crop' },
  { id: 'nvst-11', name: 'Fish Finger Full (8pc)', price: 300, category: 'NON VEG STARTER', isVeg: false, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=300&auto=format&fit=crop' },

  // CHICKEN MAINS
  { id: 'mcc-2', name: 'Chicken Curry', price: 220, category: 'MAIN COURSE CHICKEN', isVeg: false, image: 'https://images.unsplash.com/photo-1603894584134-f1c2baee290a?q=80&w=300&auto=format&fit=crop' },
  { id: 'mcc-21', name: 'Chicken Tikka Masala', price: 360, category: 'MAIN COURSE CHICKEN', isVeg: false, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=300&auto=format&fit=crop' },
  { id: 'mcc-23', name: 'Chicken Butter Masala (Full)', price: 700, category: 'MAIN COURSE CHICKEN', isVeg: false, image: 'https://images.unsplash.com/photo-1603894584134-f1c2baee290a?q=80&w=300&auto=format&fit=crop' },

  // ROTI
  { id: 'rot-1', name: 'Tandoori Roti', price: 20, category: 'ROTI', isVeg: true, image: 'https://images.unsplash.com/photo-1533777324545-e0162727fc90?q=80&w=300&auto=format&fit=crop' },
  { id: 'rot-4', name: 'Butter Naan', price: 50, category: 'ROTI', isVeg: true, image: 'https://images.unsplash.com/photo-1601050638917-3f048add4927?q=80&w=300&auto=format&fit=crop' },
  { id: 'rot-13', name: 'Butter Garlic Naan', price: 80, category: 'ROTI', isVeg: true, image: 'https://images.unsplash.com/photo-1533777324545-e0162727fc90?q=80&w=300&auto=format&fit=crop' },

  // BIRYANI
  { id: 'bir-1', name: 'Veg Biryani', price: 200, category: 'BIRYANI', isVeg: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=300&auto=format&fit=crop' },
  { id: 'bir-3', name: 'Chicken Biryani', price: 220, category: 'BIRYANI', isVeg: false, image: 'https://images.unsplash.com/photo-1642821336069-121b289d044c?q=80&w=300&auto=format&fit=crop' },
  { id: 'bir-6', name: 'Mutton Biryani', price: 280, category: 'BIRYANI', isVeg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=300&auto=format&fit=crop' },

  // BEVERAGES
  { id: 'bev-3', name: 'Cold Drinks', price: 30, category: 'BEVERAGES & SHAKES', isVeg: true, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300&auto=format&fit=crop' },
  { id: 'bev-5', name: 'Tea', price: 40, category: 'BEVERAGES & SHAKES', isVeg: true, image: 'https://images.unsplash.com/photo-1544787210-2213d84ad960?q=80&w=300&auto=format&fit=crop' },
  { id: 'bev-11', name: 'Cold Coffee', price: 110, category: 'BEVERAGES & SHAKES', isVeg: true, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=300&auto=format&fit=crop' },

  // DESERT
  { id: 'des-1', name: 'Vanila Ice Cream', price: 75, category: 'DESERT', isVeg: true, image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=300&auto=format&fit=crop' },
  { id: 'des-3', name: 'Chocolate Ice Cream', price: 75, category: 'DESERT', isVeg: true, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=300&auto=format&fit=crop' },
];



// Change these values to 0 as gst bill is inclusive
export const TAX_RATE = 0; 
export const SERVICE_CHARGE = 0;
