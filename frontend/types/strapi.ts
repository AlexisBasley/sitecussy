export interface StrapiMedia {
  id: number;
  url: string;
  name: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  alternativeText?: string | null;
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
