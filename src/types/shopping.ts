
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
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ListItem[];
  budget: number;
  categoryBudgets: { categoryId: string; budget: number }[];
  createdAt: Date;
  updatedAt: Date;
}
