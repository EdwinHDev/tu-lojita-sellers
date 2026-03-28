export interface Subcategory {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Domain entity for Category
 */
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  subcategories?: Subcategory[];
  createdAt: string;
  updatedAt: string;
}
