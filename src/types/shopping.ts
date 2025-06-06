
export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
  user_id?: string; // Adicionar para consistência com o DB
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  price?: number;
  addedBy?: string;
  comments?: Comment[]; // Opcional, já que vamos buscar separadamente
  categoryId?: string;
  purchaseDate?: Date | string; // Datas do Supabase vêm como string
  order?: number;
  // Campos do DB que não precisamos sempre no front-end
  user_id?: string;
  created_at?: string;
}

// CORREÇÃO PRINCIPAL AQUI
export interface Comment {
  id: string;
  text: string;
  item_id: string; // Adicionar para referência
  user_id: string; // Adicionar para referência
  created_at: string; // Mudar de 'timestamp' para 'created_at' e de Date para string
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
