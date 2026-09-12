export interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: 'Web' | 'Python' | 'AI/ML';
  tag: string;
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  thumbnail: string;
}

export const categories = ['All', 'Web', 'Python', 'AI/ML'] as const;

export const articles: Article[] = [
  {
    id: '1',
    title: 'Building Modern Web Applications with React 19 and Vite',
    excerpt:
      'A practical guide to the latest React 19 features including Server Actions, useActionState, and performance optimizations with Vite.',
    category: 'Web',
    tag: 'React',
    readTime: '5 min read',
    publishedAt: 'May 20, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Sarah Jenkins',
      role: 'Frontend Developer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
  },
  {
    id: '2',
    title: 'Clean Architecture and Type Safety in TypeScript Projects',
    excerpt:
      'How to structure enterprise TypeScript codebases using domain-driven design, generic utility types, and strict compilation flags.',
    category: 'Web',
    tag: 'TypeScript',
    readTime: '6 min read',
    publishedAt: 'May 18, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Alex Rivera',
      role: 'Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
  },
  {
    id: '3',
    title: 'High-Performance Asynchronous Programming in Python 3.12',
    excerpt:
      'Mastering asyncio task groups, asynchronous context managers, and non-blocking IO for scalable backend services in Python.',
    category: 'Python',
    tag: 'AsyncIO',
    readTime: '7 min read',
    publishedAt: 'May 15, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Elena Rostova',
      role: 'Backend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
  },
  {
    id: '4',
    title: 'FastAPI in Production: Dependency Injection and Microservices',
    excerpt:
      'An end-to-end tutorial on building lightweight REST APIs with Pydantic v2 validation, automatic OpenAPI specs, and Docker.',
    category: 'Python',
    tag: 'FastAPI',
    readTime: '8 min read',
    publishedAt: 'May 12, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'David Kim',
      role: 'Python Specialist',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    },
  },
  {
    id: '5',
    title: 'Introduction to Retrieval-Augmented Generation (RAG) Systems',
    excerpt:
      'Understand how LLMs connect with vector databases like Pinecone and Chroma to produce accurate, context-grounded responses.',
    category: 'AI/ML',
    tag: 'LLM & RAG',
    readTime: '9 min read',
    publishedAt: 'May 08, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Sophia Patel',
      role: 'Machine Learning Engineer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
  },
  {
    id: '6',
    title: 'Fine-Tuning Open Source LLMs with LoRA and Hugging Face',
    excerpt:
      'A beginner-friendly guide to parameter-efficient fine-tuning (PEFT) on consumer GPUs using PyTorch and the Transformers library.',
    category: 'AI/ML',
    tag: 'PyTorch',
    readTime: '10 min read',
    publishedAt: 'May 04, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    author: {
      name: 'Marcus Chen',
      role: 'AI Researcher',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
  },
];
