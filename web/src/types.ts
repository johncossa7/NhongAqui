export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type SellerProfile = {
  display_name: string;
  bio: string;
  rating_average: string;
  rating_count: number;
  products_sold: number;
  verified: boolean;
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
  account_type: string;
  verification_status: string;
  avatar?: string | null;
  seller_profile?: SellerProfile;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  parent: number | null;
  children: Category[];
};

export type ProductImage = {
  id: number;
  image: string;
  position: number;
  is_primary: boolean;
  moderation_status: string;
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
};

export type Favorite = {
  id: number;
  product: Pick<Product, "id" | "title" | "slug" | "price" | "city" | "status"> & {
    primary_image: string | null;
  };
  created_at: string;
};

export type Conversation = {
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
  buyer: User;
  seller: User;
  messages: Message[];
  last_message_at: string | null;
};

export type Message = {
  id: number;
  sender: User;
  content: string;
  read_at: string | null;
  created_at: string;
};
