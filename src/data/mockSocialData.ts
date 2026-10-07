export interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  location: string;
  website: string;
  created_at: string;
  followersCount: number;
  followingCount: number;
  articlesCount: number;
  totalLikes: number;
}

export interface CommentItem {
  id: string;
  article_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  replies?: CommentItem[];
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  actor_id: string;
  actor: {
    name: string;
    username: string;
    avatar: string;
  };
  type: 'like' | 'comment' | 'follow';
  article_id?: string | null;
  article_title?: string;
  read: boolean;
  created_at: string;
}

export const initialProfiles: Record<string, UserProfile> = {
  'user-sarah': {
    id: 'user-sarah',
    full_name: 'Sarah Jenkins',
    username: 'sarah_j',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Staff Frontend Architect passionate about React compiler, micro-frontends, and web performance optimization.',
    location: 'San Francisco, CA',
    website: 'https://sarahjenkins.dev',
    created_at: '2025-08-14T09:00:00.000Z',
    followersCount: 384,
    followingCount: 142,
    articlesCount: 6,
    totalLikes: 890,
  },
  'user-alex': {
    id: 'user-alex',
    full_name: 'Alex Rivera',
    username: 'alex_rivera',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    bio: 'TypeScript specialist and domain-driven design advocate. Writing scalable services for modern cloud infrastructure.',
    location: 'Austin, TX',
    website: 'https://alexrivera.tech',
    created_at: '2025-09-02T11:30:00.000Z',
    followersCount: 512,
    followingCount: 89,
    articlesCount: 4,
    totalLikes: 620,
  },
  'user-elena': {
    id: 'user-elena',
    full_name: 'Elena Rostova',
    username: 'elena_r',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    bio: 'Distributed systems architect. Specializes in Python concurrency, event streaming, and low-latency APIs.',
    location: 'Berlin, Germany',
    website: 'https://rostova.dev',
    created_at: '2025-06-20T14:15:00.000Z',
    followersCount: 820,
    followingCount: 210,
    articlesCount: 8,
    totalLikes: 2150,
  },
  'user-david': {
    id: 'user-david',
    full_name: 'David Kim',
    username: 'david_kim',
    avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop&q=80',
    bio: 'Cloud architect building high-throughput microservices using FastAPI, Kubernetes, and PostgreSQL.',
    location: 'Seattle, WA',
    website: 'https://davidkim.cloud',
    created_at: '2025-10-10T16:45:00.000Z',
    followersCount: 290,
    followingCount: 95,
    articlesCount: 3,
    totalLikes: 580,
  },
  'user-sophia': {
    id: 'user-sophia',
    full_name: 'Sophia Patel',
    username: 'sophia_ai',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    bio: 'AI researcher focusing on enterprise retrieval systems, dense embeddings, and hallucination reduction.',
    location: 'Boston, MA',
    website: 'https://sophiapatel.ai',
    created_at: '2025-05-18T08:20:00.000Z',
    followersCount: 1450,
    followingCount: 340,
    articlesCount: 11,
    totalLikes: 3410,
  },
  'user-marcus': {
    id: 'user-marcus',
    full_name: 'Marcus Chen',
    username: 'marcus_c',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    bio: 'Deep learning researcher specializing in parameter-efficient tuning, quantization (QLoRA), and open-source models.',
    location: 'Toronto, Canada',
    website: 'https://marcuschen.dev',
    created_at: '2025-07-04T12:00:00.000Z',
    followersCount: 960,
    followingCount: 180,
    articlesCount: 7,
    totalLikes: 2890,
  },
};

export const initialComments: Record<string, CommentItem[]> = {
  '1': [
    {
      id: 'c1-1',
      article_id: '1',
      user_id: 'user-alex',
      content: 'The section on useOptimistic hook is super clear! We recently migrated our feedback forms to it and the UX feels instant.',
      created_at: '2026-05-20T10:30:00.000Z',
      author: {
        id: 'user-alex',
        name: 'Alex Rivera',
        username: 'alex_rivera',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      },
      replies: [
        {
          id: 'c1-1-r1',
          article_id: '1',
          user_id: 'user-sarah',
          parent_id: 'c1-1',
          content: 'Thanks Alex! Combining useOptimistic with server actions really simplifies rollbacks when an endpoint fails.',
          created_at: '2026-05-20T11:15:00.000Z',
          author: {
            id: 'user-sarah',
            name: 'Sarah Jenkins',
            username: 'sarah_j',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          },
        },
      ],
    },
    {
      id: 'c1-2',
      article_id: '1',
      user_id: 'user-david',
      content: 'How does Vite 6 handle SSR streaming components compared to Next.js App Router?',
      created_at: '2026-05-20T14:00:00.000Z',
      author: {
        id: 'user-david',
        name: 'David Kim',
        username: 'david_kim',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      },
      replies: [],
    },
  ],
  '5': [
    {
      id: 'c5-1',
      article_id: '5',
      user_id: 'user-marcus',
      content: 'Hybrid search with cross-encoder re-ranking makes a huge difference in precision for technical documentation. Great explanation!',
      created_at: '2026-05-09T09:20:00.000Z',
      author: {
        id: 'user-marcus',
        name: 'Marcus Chen',
        username: 'marcus_c',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      },
      replies: [
        {
          id: 'c5-1-r1',
          article_id: '5',
          user_id: 'user-sophia',
          parent_id: 'c5-1',
          content: 'Glad you found it helpful Marcus! Cross-encoders reduce false positives by over 35% in our benchmarks.',
          created_at: '2026-05-09T10:05:00.000Z',
          author: {
            id: 'user-sophia',
            name: 'Sophia Patel',
            username: 'sophia_ai',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
          },
        },
      ],
    },
  ],
};

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    recipient_id: 'current-user',
    actor_id: 'user-sarah',
    actor: {
      name: 'Sarah Jenkins',
      username: 'sarah_j',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    },
    type: 'like',
    article_id: '1',
    article_title: 'Building Modern Web Applications with React 19 and Vite',
    read: false,
    created_at: '15m ago',
  },
  {
    id: 'notif-2',
    recipient_id: 'current-user',
    actor_id: 'user-alex',
    actor: {
      name: 'Alex Rivera',
      username: 'alex_rivera',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    },
    type: 'follow',
    read: false,
    created_at: '1h ago',
  },
  {
    id: 'notif-3',
    recipient_id: 'current-user',
    actor_id: 'user-sophia',
    actor: {
      name: 'Sophia Patel',
      username: 'sophia_ai',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    },
    type: 'comment',
    article_id: '5',
    article_title: 'Introduction to Retrieval-Augmented Generation (RAG) Systems',
    read: true,
    created_at: 'Yesterday',
  },
];
