export type Article = {
  id: string;
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  author: string;
  publisher: string;
  year: number | null;
  pages: number | null;
  summary: string;
  category: string;
  cover: string;
  file: string;
  sizeMb: number;
  published: boolean;
  createdAt: string;
};
