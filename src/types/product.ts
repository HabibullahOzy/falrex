export interface ProductImage {
  url: string;
  public_id: string;
  _id: string;
}

export interface ProductVideo {
  url: string;
  public_id: string;
}

export interface Variation {
  color: string;
  size: string;
  sku: string;
  stock: string;
  _id: string;
}

export interface Product {
  _id: string;
  nameEng: string;
  nameLocal?: string;
  brand?: string;
  modelNumber?: string;
  sku?: string;
  slug?: string;
  category?: string;
  subcategory?: string;
  subSubcategory?: string;
  hsCode?: string;
  price?: number;
  currency?: string;
  discount?: number;
  moq?: string;
  stock?: number;
  sampleAvailable?: string;
  supplierName?: string;
  supplierUid?: string;
  countryOfOrigin?: string;
  supplierYears?: string;
  certifications?: string;
  factoryLocation?: string;
  productionCapacity?: string;
  incoterms?: string;
  shippingMethod?: string;
  leadTime?: string;
  portOfLoading?: string;
  shippingNotes?: string;
  specifications?: Record<string, Record<string, string>>;
  packagingDetails?: string;
  sellingUnit?: string;
  grossWeight?: string;
  cartonSize?: string;
  variations?: Variation[];
  tags?: string[];
  shortDescription?: string;
  description?: string;
  images?: ProductImage[];
  video?: ProductVideo | null;
}