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
  assigned_to_user_id?: string;
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
  budget?: number; // ✅ NOVO CAMPO DE ORÇAMENTO
  members?: ListMember[];
  is_favorited: boolean;
}

export interface ListMember {
  list_id: string;
  user_id: string;
  role: 'owner' | 'member';
  user_profile?: {
    id?: string;
    email?: string;
    name?: string;
  }
}

export interface Notification {
  id: string;
  user_id: string; // ID de quem recebe a notificação
  list_id: string;
  item_id?: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar_url?: string;
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