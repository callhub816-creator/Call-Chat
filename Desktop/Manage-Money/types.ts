import { LucideIcon } from 'lucide-react';

export interface GuideSection {
  title: string;
  content: string;
}

export interface Guide {
  id: string;
  title: string;
  summary: string;
  iconName: string; // Store icon name to map later
  sections: GuideSection[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  imageUrl: string;
}
