export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
  user_id?: string;
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
  purchaseDate?: Date | string;
  order?: number;
  user_id?: string;
  created_at?: string;
  list_id: string; 
}

export interface Comment {
  id: string;
  text: string;
  item_id: string;
  user_id: string;
  created_at: string;
}

export interface PriceEntry {
  price: number;
  date: Date;
  store?: string;
}

// NOVO TIPO: Um item simplificado para uso em modelos.
export interface TemplateItem {
  name: string;
  quantity: number;
  categoryId?: string;
}

export interface ListTemplate {
  id: string;
  name: string;
  items: TemplateItem[]; // ATUALIZADO: Usa o novo tipo TemplateItem.
  description?: string;
  categoryBudgets?: { categoryId: string; budget: number }[];
}

export interface ShoppingList {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  members?: ListMember[];
}

export interface ListMember {
  list_id: string;
  user_id: string;
  role: 'owner' | 'member';
  user_profile?: {
    email?: string;
    raw_user_meta_data?: {
      name?: string;
      avatar_url?: string;
    }
  }
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