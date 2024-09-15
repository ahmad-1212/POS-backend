export interface ProductDto {
  name: string;
  category: string;
  cost: number;
  price: number;
  ingredients: {
    ingredient: string;
    quantity: number;
  }[];
}

export interface UpdateProductDto {
  name?: string;
  category?: string;
  cost?: number;
  price?: number;
  ingredients?: {
    ingredient: string;
    quantity: number;
  }[];
}
