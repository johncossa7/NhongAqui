export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type User = {
  id: number;
  email?: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone?: string;
  province: string;
  city: string;
  neighborhood: string;
  account_type?: string;
  verification_status: string;
  is_blocked?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  seller_profile?: {
    display_name: string;
    bio: string;
    rating_average: string;
    rating_count: number;
    verified: boolean;
  };
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: number;
  image: string;
  position: number;
  is_primary: boolean;
  moderation_status?: string;
  moderation_reason?: string;
};

export type Product = {
  id: number;
  seller: User;
  category: number;
  category_detail?: Category;
  title: string;
  slug: string;
  description: string;
  price: string;
  negotiable: boolean;
  condition: string;
  province: string;
  city: string;
  neighborhood: string;
  status: string;
  featured: boolean;
  views_count: number;
  images: ProductImage[];
  is_favorited: boolean;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    price: string;
    city: string;
    status: string;
    primary_image: string | null;
  };
};

export type Conversation = {
  id: number;
  product: {
    id: number;
    title: string;
    slug: string;
    price: string;
    city: string;
    primary_image: string | null;
  };
  buyer: User;
  seller: User;
  messages: Message[];
  unread_count: number;
  last_message_at: string | null;
};

export type Message = {
  id: number;
  sender: User;
  content: string;
  read_at: string | null;
  created_at: string;
};

export type Notification = {
  id: number;
  kind: "system" | "new_message" | "product_reserved" | "product_sold";
  title: string;
  body: string;
  target_url: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type VerificationRequest = {
  id: number;
  full_name: string;
  phone: string;
  nuit: string;
  document_type: string;
  document_number: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  rejection_reason: string;
};

export type Review = {
  id: number;
  reviewer: User;
  product: Favorite["product"];
  rating: number;
  comment: string;
  created_at: string;
};
