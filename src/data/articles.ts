export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Web' | 'Python' | 'AI/ML';
  tag: string;
  readTime: string;
  publishedAt: string;
  thumbnail: string;
  cover_image?: string;
  author_id?: string;
  author: {
    id?: string;
    name: string;
    username: string;
    role?: string;
    avatar: string;
    bio?: string;
    location?: string;
    website?: string;
  };
  views_count: number;
  likes_count: number;
  comments_count: number;
}

export const categories = ['All', 'Web', 'Python', 'AI/ML'] as const;

export const articles: Article[] = [
  {
    id: '1',
    title: 'Building Modern Web Applications with React 19 and Vite',
    excerpt:
      'A practical guide to the latest React 19 features including Server Actions, useActionState, useOptimistic, and lightning-fast Vite tooling.',
    category: 'Web',
    tag: 'React 19',
    readTime: '5 min read',
    publishedAt: 'May 20, 2026',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&auto=format&fit=crop&q=80',
    author_id: 'user-sarah',
    author: {
      id: 'user-sarah',
      name: 'Sarah Jenkins',
      username: 'sarah_j',
      role: 'Staff Frontend Engineer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      bio: 'Staff Frontend Architect passionate about React compiler, micro-frontends, and web performance optimization.',
      location: 'San Francisco, CA',
      website: 'https://sarahjenkins.dev',
    },
    views_count: 1420,
    likes_count: 89,
    comments_count: 14,
    content: `## The Evolution of React in 2026

React 19 introduces significant architectural enhancements that streamline frontend engineering. With native support for asynchronous transitions, the new \`useActionState\` hook, and automatic compiler-level memoization, boilerplate that used to plague complex state management is now a thing of the past.

### Key Innovations in React 19

1. **Native Async Action Handling**:
Form submissions and mutations no longer require manual \`isSubmitting\` or \`error\` states. React handles pending states natively using \`useActionState\` and \`useFormStatus\`.

2. **Optimistic UI with \`useOptimistic\`**:
Providing instant visual feedback to users before network confirmation creates the perception of zero latency.

\`\`\`tsx
import { useOptimistic, useState } from 'react';

function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    likes,
    (state, update: number) => state + update
  );

  async function handleLike() {
    setOptimisticLikes(1);
    await api.postLike();
    setLikes(prev => prev + 1);
  }

  return <button onClick={handleLike}>❤️ {optimisticLikes}</button>;
}
\`\`\`

3. **Vite 6 Fast HMR**:
Pairing React 19 with Vite’s Rollup-based native ESM hot module replacement guarantees sub-50ms reload times during active local development.

### Practical Engineering Takeaways

- Minimize dependency on bulky external state managers when React Actions suffice.
- Leverage standard HTML5 forms with progressive enhancement for bulletproof resilience.
- Measure Core Web Vitals (LCP, INP, CLS) before and after optimizing bundling trees.`,
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
    cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
    author_id: 'user-alex',
    author: {
      id: 'user-alex',
      name: 'Alex Rivera',
      username: 'alex_rivera',
      role: 'Principal Software Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      bio: 'TypeScript specialist and domain-driven design advocate. Writing scalable services for modern cloud infrastructure.',
      location: 'Austin, TX',
      website: 'https://alexrivera.tech',
    },
    views_count: 980,
    likes_count: 62,
    comments_count: 8,
    content: `## Why Type Safety is the Bedrock of Modern Systems

As applications scale from single-developer prototypes to cross-functional engineering teams, runtime guarantees become indispensable. Clean Architecture combined with TypeScript’s advanced type system forms a formidable barrier against logic errors and regressions.

### Layer Separation in Practice

Clean architecture advocates for the dependency inversion principle: high-level business rules must never depend on low-level infrastructure details.

\`\`\`
┌────────────────────────────────────────┐
│             Domain Entities            │  ← Pure TypeScript types & business invariants
├────────────────────────────────────────┤
│             Use Cases / Services       │  ← Application workflows & ports
├────────────────────────────────────────┤
│         Adapters / Repositories        │  ← Supabase, REST APIs, LocalStorage
└────────────────────────────────────────┘
\`\`\`

### Type-Safe Utility Implementations

Using discriminated unions and branded types prevents primitive obsession:

\`\`\`ts
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type UserId = string & { readonly __brand: unique symbol };

export function createUserId(id: string): UserId {
  if (!id || id.length < 5) throw new Error("Invalid User ID");
  return id as UserId;
}
\`\`\`

### Summary

Adopting strict compiler flags (\`noImplicitAny\`, \`strictNullChecks\`, \`exactOptionalPropertyTypes\`) catches up to 40% of runtime exceptions during compile phase, drastically reducing production incidents.`,
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
    cover_image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    author_id: 'user-elena',
    author: {
      id: 'user-elena',
      name: 'Elena Rostova',
      username: 'elena_r',
      role: 'Lead Backend Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      bio: 'Distributed systems architect. Specializes in Python concurrency, event streaming, and low-latency APIs.',
      location: 'Berlin, Germany',
      website: 'https://rostova.dev',
    },
    views_count: 2150,
    likes_count: 145,
    comments_count: 19,
    content: `## Demystifying Concurrency in Python 3.12+

Python 3.12 made revolutionary progress in asyncio performance and ergonomic structured concurrency. With \`asyncio.TaskGroup\` becoming standard practice, dangling coroutines and untracked cancellations are finally solved cleanly.

### Structured Concurrency with TaskGroup

Prior to Python 3.11/3.12, orchestrating multiple concurrent coroutines required \`asyncio.gather\`, which could lead to resource leaks if one task failed while others continued running in the background.

\`\`\`python
import asyncio
import httpx

async def fetch_metrics(service_name: str, url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url, timeout=5.0)
        return {service_name: response.json()}

async def main():
    results = {}
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(fetch_metrics("auth", "https://api.internal/auth/health"))
        t2 = tg.create_task(fetch_metrics("db", "https://api.internal/db/health"))
        t3 = tg.create_task(fetch_metrics("cache", "https://api.internal/cache/health"))

    print("All tasks completed safely:", t1.result(), t2.result(), t3.result())

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

### Key Performance Benefits

- **Zero Orphaned Tasks**: If one request fails with a connection error, all other sibling tasks in the \`TaskGroup\` are automatically cancelled.
- **Exception Groups**: All raised exceptions are aggregated into an \`ExceptionGroup\`, allowing granular \`except* \` pattern matching.
- **UVLoop Acceleration**: Under high loads, plugging in \`uvloop\` yields up to 2.5x higher request throughput.`,
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
    cover_image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop&q=80',
    author_id: 'user-david',
    author: {
      id: 'user-david',
      name: 'David Kim',
      username: 'david_kim',
      role: 'Cloud Solutions Architect',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      bio: 'Cloud architect building high-throughput microservices using FastAPI, Kubernetes, and PostgreSQL.',
      location: 'Seattle, WA',
      website: 'https://davidkim.cloud',
    },
    views_count: 1780,
    likes_count: 110,
    comments_count: 12,
    content: `## Production-Ready FastAPI Microservices

FastAPI has emerged as the premier framework for building enterprise-grade Python services. When powered by Pydantic v2’s Rust-based validation core, FastAPI handles thousands of JSON serialization requests per second with negligible CPU overhead.

### Architectural Blueprint

1. **Dependency Injection for Database & Security**:
Avoid global database sessions. Leverage FastAPI's \`Depends\` system to inject transactional database contexts and verify JWT tokens cleanly.

\`\`\`python
from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(title="DevBlog Service API", version="2.0.0")

class ArticleCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=120)
    category: str
    content: str

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = verify_jwt(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user

@app.post("/articles", status_code=status.HTTP_201_CREATED)
async def create_article(payload: ArticleCreate, user = Depends(get_current_user)):
    return {"message": "Created", "author": user.username, "article": payload}
\`\`\`

2. **Docker Multi-Stage Build**:
Keep production container images below 120MB by stripping build tools in a multi-stage Dockerfile.

3. **OpenTelemetry & Structured Logging**:
Inject trace IDs in every incoming request header for instant observability in distributed clusters.`,
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
    cover_image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    author_id: 'user-sophia',
    author: {
      id: 'user-sophia',
      name: 'Sophia Patel',
      username: 'sophia_ai',
      role: 'Machine Learning Research Engineer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      bio: 'AI researcher focusing on enterprise retrieval systems, dense embeddings, and hallucination reduction.',
      location: 'Boston, MA',
      website: 'https://sophiapatel.ai',
    },
    views_count: 3410,
    likes_count: 230,
    comments_count: 31,
    content: `## Transforming Raw Documents into Intelligent Knowledge Retrieval

Retrieval-Augmented Generation (RAG) bridges the gap between static foundational Large Language Models and dynamic, proprietary enterprise data. By indexing documents into high-dimensional vector embeddings, models can cite real facts with zero hallucinations.

### The 4-Stage RAG Pipeline

1. **Chunking & Preprocessing**:
Partition technical documents into semantically coherent chunks (e.g. 512 tokens with 50-token overlap).

2. **Dense Vector Embeddings**:
Generate embeddings using state-of-the-art embedding models (\`text-embedding-3-large\` or open-source \`BGE-M3\`).

3. **Hybrid Search (Dense + Sparse BM25)**:
Combining cosine similarity with keyword search (BM25) ensures both semantic meaning and exact keyword hits (such as API identifiers) are retrieved accurately.

4. **Re-ranking with Cross-Encoders**:
Feed top 20 retrieved candidates through a cross-encoder model to distill the top 3 most relevant passages before prompting the LLM.

\`\`\`python
# Example RAG Prompt Construction
prompt = f"""
You are an expert engineering assistant. Use ONLY the verified context below to answer the user query:

--- CONTEXT ---
{retrieved_context_passages}

--- QUESTION ---
{user_query}
"""
\`\`\`

### Production Takeaways

- Always evaluate retrieval recall using metrics like MRR (Mean Reciprocal Rank) and NDCG.
- Add citation footnotes in the UI so readers can verify claims against source documentation.`,
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
    cover_image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    author_id: 'user-marcus',
    author: {
      id: 'user-marcus',
      name: 'Marcus Chen',
      username: 'marcus_c',
      role: 'Deep Learning Scientist',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      bio: 'Deep learning researcher specializing in parameter-efficient tuning, quantization (QLoRA), and open-source models.',
      location: 'Toronto, Canada',
      website: 'https://marcuschen.dev',
    },
    views_count: 2890,
    likes_count: 198,
    comments_count: 25,
    content: `## Low-Rank Adaptation (LoRA) Explained

Traditional full-parameter fine-tuning of 8B+ parameter models demands hundreds of gigabytes of VRAM. Low-Rank Adaptation (LoRA) freezes the original model weights and injects trainable rank decomposition matrices into each transformer layer, reducing trainable parameters by over 99%.

### Mathematics Behind Rank Decomposition

Instead of updating the full weight matrix $W_0 \\in \\mathbb{R}^{d \\times k}$, LoRA decomposes the update $\\Delta W$ into two low-rank matrices $B \\in \\mathbb{R}^{d \\times r}$ and $A \\in \\mathbb{R}^{r \\times k}$ where $r \\ll \\min(d, k)$:

$$W = W_0 + \\frac{\\alpha}{r} (B \\times A)$$

### Practical Fine-Tuning Script with PEFT

\`\`\`python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model
import torch

model_id = "meta-llama/Llama-3.1-8B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)

model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM"
)

peft_model = get_peft_model(model, lora_config)
peft_model.print_trainable_parameters()
# Trainable params: ~0.15% of total weights!
\`\`\`

### Advantages of QLoRA

- Enables fine-tuning 8B parameter models on a single 16GB or 24GB GPU.
- Trained LoRA adapters weigh only 20-50MB, making model switching instantaneous in production server clusters.`,
  },
];
