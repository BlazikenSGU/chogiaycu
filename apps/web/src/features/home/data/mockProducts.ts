
export type MockProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: number;
  condition: number;
  rating: number;
  sold: number;
};

export const mockProducts: MockProduct[] = [
  {
    id: 'nike-01',
    name: "Nike Air Force 1 '07",
    brand: 'Nike',
    price: 850000,
    image: '/images/products/nike-vapor-17-1.jpg',
    size: 42,
    condition: 95,
    rating: 4.8,
    sold: 128,
  },
  {
    id: 'nike-02',
    name: 'Nike Dunk Low Panda',
    brand: 'Nike',
    price: 1250000,
    image: '/images/products/nike-vapor-17-2.jpg',
    size: 41,
    condition: 90,
    rating: 4.7,
    sold: 96,
  },
  {
    id: 'nike-03',
    name: 'Air Jordan 1 Low',
    brand: 'Nike',
    price: 1450000,
    image: '/images/products/nike-vapor-17-1.jpg',
    size: 43,
    condition: 92,
    rating: 4.9,
    sold: 75,
  },
  {
    id: 'nike-04',
    name: 'Nike Air Max 90',
    brand: 'Nike',
    price: 990000,
    image: '/images/products/nike-air-max-90.webp',
    size: 40,
    condition: 88,
    rating: 4.6,
    sold: 84,
  },
  {
    id: 'nike-05',
    name: 'Nike Blazer Mid 77',
    brand: 'Nike',
    price: 790000,
    image: '/images/products/nike-blazer-mid.webp',
    size: 42,
    condition: 93,
    rating: 4.8,
    sold: 64,
  },
  {
    id: 'nike-06',
    name: 'Nike Air Max 97',
    brand: 'Nike',
    price: 1190000,
    image: '/images/products/nike-air-max-97.webp',
    size: 41,
    condition: 89,
    rating: 4.7,
    sold: 53,
  },
];
