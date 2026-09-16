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
  verification_status: string;
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
  is_primary: boolean;
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
};

export type Message = {
  id: number;
  sender: User;
  content: string;
  created_at: string;
};
