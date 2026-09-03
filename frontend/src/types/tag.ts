export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  group?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTagDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  group?: string;
}
