
export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  price?: number;
  addedBy?: string;
  comments?: Comment[];
  categoryId?: string;
  purchaseDate?: Date;
  priceHistory?: PriceEntry[];
  assignedTo?: string;
  claimedBy?: string;
  group?: string;
  order?: number;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface PriceEntry {
  price: number;
  date: Date;
  store?: string;
}

export interface ListTemplate {
  id: string;
  name: string;
  items: Omit<ListItem, 'id' | 'purchased' | 'price' | 'purchaseDate'>[];
  description?: string;
  categoryBudgets?: { categoryId: string; budget: number }[];
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
  budget: number;
  categoryBudgets: { categoryId: string; budget: number }[];
  createdAt: Date;
  updatedAt: Date;
  members?: ListMember[];
  isShared?: boolean;
}

export interface ListMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface Notification {
  id: string;
  type: 'item_added' | 'item_purchased' | 'item_commented' | 'member_added';
  message: string;
  listId: string;
  itemId?: string;
  timestamp: Date;
  read: boolean;
}

export interface DiscountCoupon {
  id: string;
  title: string;
  description: string;
  category?: string;
  expiryDate?: Date;
  code?: string;
  discountPercentage?: number;
}
