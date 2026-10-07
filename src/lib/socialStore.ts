import { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { Article, articles as initialArticles } from '../data/articles';
import {
  UserProfile,
  CommentItem,
  NotificationItem,
  initialProfiles,
  initialComments,
  initialNotifications,
} from '../data/mockSocialData';

const STORAGE_KEYS = {
  LIKES: 'devblog_likes_v1',
  BOOKMARKS: 'devblog_bookmarks_v1',
  FOLLOWS: 'devblog_follows_v1',
  COMMENTS: 'devblog_comments_v1',
  PROFILES: 'devblog_profiles_v1',
  NOTIFICATIONS: 'devblog_notifications_v1',
  ARTICLES: 'devblog_custom_articles_v1',
  VIEWED_PREFIX: 'devblog_viewed_article_',
};

function getStoredJson<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStoredJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

export function useSocialPlatform(authUser: SupabaseUser | null) {
  // 1. Articles State
  const [articlesList, setArticlesList] = useState<Article[]>(() => {
    const custom = getStoredJson<Article[]>(STORAGE_KEYS.ARTICLES, []);
    const merged = [...custom, ...initialArticles];
    // deduplicate by id
    const uniqueMap = new Map<string, Article>();
    merged.forEach((a) => uniqueMap.set(a.id, a));
    return Array.from(uniqueMap.values());
  });

  // 2. Profiles Cache
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>(() => {
    return getStoredJson<Record<string, UserProfile>>(STORAGE_KEYS.PROFILES, initialProfiles);
  });

  // 3. Social Interaction Sets
  const [likedArticles, setLikedArticles] = useState<Set<string>>(() => {
    const saved = getStoredJson<string[]>(STORAGE_KEYS.LIKES, ['1']);
    return new Set(saved);
  });

  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(() => {
    const saved = getStoredJson<string[]>(STORAGE_KEYS.BOOKMARKS, ['2', '5']);
    return new Set(saved);
  });

  const [followingUsers, setFollowingUsers] = useState<Set<string>>(() => {
    const saved = getStoredJson<string[]>(STORAGE_KEYS.FOLLOWS, ['user-sarah']);
    return new Set(saved);
  });

  // 4. Comments State
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>(() => {
    return getStoredJson<Record<string, CommentItem[]>>(STORAGE_KEYS.COMMENTS, initialComments);
  });

  // 5. Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return getStoredJson<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  });

  // Current logged in user profile
  const currentProfile: UserProfile = authUser
    ? profiles[authUser.id] || {
        id: authUser.id,
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.username ||
          authUser.email?.split('@')[0] ||
          'Developer',
        username:
          authUser.user_metadata?.username ||
          authUser.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9_]/g, '') ||
          'developer',
        avatar_url:
          authUser.user_metadata?.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        cover_url:
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        bio: 'Software engineer and active contributor on DevBlog.',
        location: 'San Francisco, CA',
        website: 'https://github.com',
        created_at: authUser.created_at || new Date().toISOString(),
        followersCount: 12,
        followingCount: followingUsers.size,
        articlesCount: 0,
        totalLikes: 0,
      }
    : {
        id: 'guest',
        full_name: 'Guest Reader',
        username: 'guest',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        bio: 'Guest explorer on DevBlog platform.',
        location: 'Global',
        website: 'https://devblog.io',
        created_at: new Date().toISOString(),
        followersCount: 0,
        followingCount: 0,
        articlesCount: 0,
        totalLikes: 0,
      };

  // Sync to localStorage
  useEffect(() => {
    setStoredJson(STORAGE_KEYS.LIKES, Array.from(likedArticles));
  }, [likedArticles]);

  useEffect(() => {
    setStoredJson(STORAGE_KEYS.BOOKMARKS, Array.from(bookmarkedArticles));
  }, [bookmarkedArticles]);

  useEffect(() => {
    setStoredJson(STORAGE_KEYS.FOLLOWS, Array.from(followingUsers));
  }, [followingUsers]);

  useEffect(() => {
    setStoredJson(STORAGE_KEYS.COMMENTS, commentsMap);
  }, [commentsMap]);

  useEffect(() => {
    setStoredJson(STORAGE_KEYS.PROFILES, profiles);
  }, [profiles]);

  useEffect(() => {
    setStoredJson(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }, [notifications]);

  useEffect(() => {
    const customArticles = articlesList.filter(
      (a) => !initialArticles.some((init) => init.id === a.id)
    );
    setStoredJson(STORAGE_KEYS.ARTICLES, customArticles);
  }, [articlesList]);

  // Sync Supabase data when connected
  useEffect(() => {
    if (!isSupabaseConfigured || !authUser) return;

    // Fetch user bookmarks from Supabase
    supabase
      .from('bookmarks')
      .select('article_id')
      .eq('user_id', authUser.id)
      .then(({ data }) => {
        if (data) {
          const ids = new Set(data.map((b) => b.article_id));
          setBookmarkedArticles((prev) => new Set([...prev, ...ids]));
        }
      });

    // Fetch user likes from Supabase
    supabase
      .from('article_likes')
      .select('article_id')
      .eq('user_id', authUser.id)
      .then(({ data }) => {
        if (data) {
          const ids = new Set(data.map((l) => l.article_id));
          setLikedArticles((prev) => new Set([...prev, ...ids]));
        }
      });

    // Fetch user follows from Supabase
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', authUser.id)
      .then(({ data }) => {
        if (data) {
          const ids = new Set(data.map((f) => f.following_id));
          setFollowingUsers((prev) => new Set([...prev, ...ids]));
        }
      });

    // Fetch profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfiles((prev) => ({
            ...prev,
            [data.id]: {
              id: data.id,
              full_name: data.full_name || authUser.email?.split('@')[0] || 'Developer',
              username: data.username || 'developer',
              avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
              cover_url: data.cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
              bio: data.bio || 'Software engineer and active writer on DevBlog.',
              location: data.location || 'San Francisco, CA',
              website: data.website || 'https://devblog.io',
              created_at: data.created_at || new Date().toISOString(),
              followersCount: 18,
              followingCount: followingUsers.size,
              articlesCount: 0,
              totalLikes: 0,
            },
          }));
        }
      });
  }, [authUser]);

  // Calculate live comment count for articles
  const getArticleCommentsCount = useCallback(
    (articleId: string) => {
      const list = commentsMap[articleId] || [];
      let total = list.length;
      list.forEach((c) => {
        if (c.replies) total += c.replies.length;
      });
      return total;
    },
    [commentsMap]
  );

  // 1. Like / Unlike Toggle
  const toggleLike = useCallback(
    async (articleId: string) => {
      const isLiked = likedArticles.has(articleId);
      const newSet = new Set(likedArticles);

      if (isLiked) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      setLikedArticles(newSet);

      // Optimistically update article likes count
      setArticlesList((prev) =>
        prev.map((a) => {
          if (a.id === articleId) {
            return {
              ...a,
              likes_count: Math.max(0, (a.likes_count || 0) + (isLiked ? -1 : 1)),
            };
          }
          return a;
        })
      );

      // Trigger notification if newly liked
      if (!isLiked) {
        const article = articlesList.find((a) => a.id === articleId);
        if (article) {
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            recipient_id: article.author_id || article.author.id || 'system',
            actor_id: currentProfile.id,
            actor: {
              name: currentProfile.full_name,
              username: currentProfile.username,
              avatar: currentProfile.avatar_url,
            },
            type: 'like',
            article_id: article.id,
            article_title: article.title,
            read: false,
            created_at: 'Just now',
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      }

      // Supabase sync
      if (isSupabaseConfigured && authUser) {
        if (isLiked) {
          await supabase
            .from('article_likes')
            .delete()
            .match({ user_id: authUser.id, article_id: articleId });
        } else {
          await supabase
            .from('article_likes')
            .insert([{ user_id: authUser.id, article_id: articleId }]);
        }
      }
    },
    [likedArticles, articlesList, currentProfile, authUser]
  );

  // 2. Bookmark / Save Toggle
  const toggleBookmark = useCallback(
    async (articleId: string) => {
      const isBookmarked = bookmarkedArticles.has(articleId);
      const newSet = new Set(bookmarkedArticles);

      if (isBookmarked) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      setBookmarkedArticles(newSet);

      if (isSupabaseConfigured && authUser) {
        if (isBookmarked) {
          await supabase
            .from('bookmarks')
            .delete()
            .match({ user_id: authUser.id, article_id: articleId });
        } else {
          await supabase
            .from('bookmarks')
            .insert([{ user_id: authUser.id, article_id: articleId }]);
        }
      }

      return !isBookmarked;
    },
    [bookmarkedArticles, authUser]
  );

  // 3. Follow / Unfollow Toggle
  const toggleFollow = useCallback(
    async (targetUserId: string, _targetAuthorName?: string) => {
      if (targetUserId === currentProfile.id || targetUserId === authUser?.id) return;

      const isFollowing = followingUsers.has(targetUserId);
      const newSet = new Set(followingUsers);

      if (isFollowing) {
        newSet.delete(targetUserId);
      } else {
        newSet.add(targetUserId);
      }
      setFollowingUsers(newSet);

      // Update target profile followersCount
      setProfiles((prev) => {
        const target = prev[targetUserId];
        if (!target) return prev;
        return {
          ...prev,
          [targetUserId]: {
            ...target,
            followersCount: Math.max(0, target.followersCount + (isFollowing ? -1 : 1)),
          },
        };
      });

      // Send notification if newly followed
      if (!isFollowing) {
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          recipient_id: targetUserId,
          actor_id: currentProfile.id,
          actor: {
            name: currentProfile.full_name,
            username: currentProfile.username,
            avatar: currentProfile.avatar_url,
          },
          type: 'follow',
          read: false,
          created_at: 'Just now',
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }

      // Supabase sync
      if (isSupabaseConfigured && authUser) {
        if (isFollowing) {
          await supabase
            .from('follows')
            .delete()
            .match({ follower_id: authUser.id, following_id: targetUserId });
        } else {
          await supabase
            .from('follows')
            .insert([{ follower_id: authUser.id, following_id: targetUserId }]);
        }
      }
    },
    [followingUsers, currentProfile, authUser]
  );

  // 4. View Tracking (Increment once per session per article)
  const trackArticleView = useCallback(
    (articleId: string) => {
      const sessionKey = `${STORAGE_KEYS.VIEWED_PREFIX}${articleId}`;
      if (sessionStorage.getItem(sessionKey)) {
        return; // already counted in this browser session
      }

      sessionStorage.setItem(sessionKey, 'true');

      setArticlesList((prev) =>
        prev.map((a) => {
          if (a.id === articleId) {
            return {
              ...a,
              views_count: (a.views_count || 0) + 1,
            };
          }
          return a;
        })
      );

      // Supabase RPC or update if configured
      if (isSupabaseConfigured) {
        supabase.rpc('increment_article_views', { target_article_id: articleId }).then(({ error }) => {
          if (error) {
            // fallback standard update
            supabase
              .from('articles')
              .select('views_count')
              .eq('id', articleId)
              .single()
              .then(({ data }) => {
                if (data) {
                  supabase
                    .from('articles')
                    .update({ views_count: (data.views_count || 0) + 1 })
                    .eq('id', articleId);
                }
              });
          }
        });
      }
    },
    []
  );

  // 5. Add Comment
  const addComment = useCallback(
    (articleId: string, content: string, parentId?: string | null) => {
      if (!content.trim()) return;

      const newComment: CommentItem = {
        id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        article_id: articleId,
        user_id: currentProfile.id,
        parent_id: parentId || null,
        content: content.trim(),
        created_at: new Date().toISOString(),
        author: {
          id: currentProfile.id,
          name: currentProfile.full_name,
          username: currentProfile.username,
          avatar: currentProfile.avatar_url,
        },
        replies: [],
      };

      setCommentsMap((prev) => {
        const articleComments = prev[articleId] || [];

        if (parentId) {
          // Add as nested reply to parent
          return {
            ...prev,
            [articleId]: articleComments.map((c) => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: [...(c.replies || []), newComment],
                };
              }
              return c;
            }),
          };
        } else {
          // Top level comment
          return {
            ...prev,
            [articleId]: [newComment, ...articleComments],
          };
        }
      });

      // Update article comments count in list
      setArticlesList((prev) =>
        prev.map((a) => {
          if (a.id === articleId) {
            return {
              ...a,
              comments_count: (a.comments_count || 0) + 1,
            };
          }
          return a;
        })
      );

      // Trigger notification for author
      const article = articlesList.find((a) => a.id === articleId);
      if (article) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}`,
          recipient_id: article.author_id || article.author.id || 'author',
          actor_id: currentProfile.id,
          actor: {
            name: currentProfile.full_name,
            username: currentProfile.username,
            avatar: currentProfile.avatar_url,
          },
          type: 'comment',
          article_id: article.id,
          article_title: article.title,
          read: false,
          created_at: 'Just now',
        };
        setNotifications((prev) => [notif, ...prev]);
      }

      // Supabase sync
      if (isSupabaseConfigured && authUser) {
        supabase
          .from('comments')
          .insert([
            {
              article_id: articleId,
              user_id: authUser.id,
              parent_id: parentId || null,
              content: content.trim(),
            },
          ])
          .then();
      }
    },
    [currentProfile, articlesList, authUser]
  );

  // 6. Edit Comment
  const editComment = useCallback(
    (articleId: string, commentId: string, newContent: string) => {
      if (!newContent.trim()) return;

      setCommentsMap((prev) => {
        const list = prev[articleId] || [];
        return {
          ...prev,
          [articleId]: list.map((c) => {
            if (c.id === commentId) {
              return { ...c, content: newContent.trim() };
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, content: newContent.trim() } : r
                ),
              };
            }
            return c;
          }),
        };
      });

      if (isSupabaseConfigured && authUser) {
        supabase
          .from('comments')
          .update({ content: newContent.trim() })
          .eq('id', commentId)
          .then();
      }
    },
    [authUser]
  );

  // 7. Delete Comment (User or Article author moderation)
  const deleteComment = useCallback(
    (articleId: string, commentId: string) => {
      setCommentsMap((prev) => {
        const list = prev[articleId] || [];
        // Check if top-level
        const filteredTop = list.filter((c) => c.id !== commentId);
        // Also filter nested replies
        const updated = filteredTop.map((c) => {
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.filter((r) => r.id !== commentId),
            };
          }
          return c;
        });

        return {
          ...prev,
          [articleId]: updated,
        };
      });

      setArticlesList((prev) =>
        prev.map((a) => {
          if (a.id === articleId) {
            return {
              ...a,
              comments_count: Math.max(0, (a.comments_count || 1) - 1),
            };
          }
          return a;
        })
      );

      if (isSupabaseConfigured && authUser) {
        supabase.from('comments').delete().eq('id', commentId).then();
      }
    },
    [authUser]
  );

  // 8. Update User Profile
  const updateProfile = useCallback(
    async (updated: Partial<UserProfile>) => {
      const targetId = authUser?.id || currentProfile.id;
      const merged: UserProfile = {
        ...currentProfile,
        ...updated,
        id: targetId,
      };

      setProfiles((prev) => ({
        ...prev,
        [targetId]: merged,
      }));

      // Update articles authored by this user
      setArticlesList((prev) =>
        prev.map((a) => {
          if (a.author_id === targetId || a.author.id === targetId) {
            return {
              ...a,
              author: {
                ...a.author,
                name: merged.full_name,
                username: merged.username,
                avatar: merged.avatar_url,
                bio: merged.bio,
                location: merged.location,
                website: merged.website,
              },
            };
          }
          return a;
        })
      );

      if (isSupabaseConfigured && authUser) {
        await supabase
          .from('profiles')
          .update({
            full_name: merged.full_name,
            username: merged.username,
            avatar_url: merged.avatar_url,
            cover_url: merged.cover_url,
            bio: merged.bio,
            location: merged.location,
            website: merged.website,
          })
          .eq('id', authUser.id);
      }
    },
    [authUser, currentProfile]
  );

  // 9. Mark Notifications
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // 10. Get User Profile Helper
  const getProfileByUsernameOrId = useCallback(
    (identifier: string): UserProfile => {
      // Check by ID
      if (profiles[identifier]) return profiles[identifier];

      // Check by username
      const cleanUsername = identifier.replace(/^@/, '').toLowerCase();
      const byUser = Object.values(profiles).find(
        (p) => p.username?.toLowerCase() === cleanUsername
      );
      if (byUser) return byUser;

      // Check in articles author list
      const authorMatch = articlesList.find(
        (a) =>
          a.author.username?.toLowerCase() === cleanUsername ||
          a.author.id === identifier ||
          a.author_id === identifier ||
          a.author.name.toLowerCase() === cleanUsername
      );

      if (authorMatch) {
        return {
          id: authorMatch.author_id || authorMatch.author.id || identifier,
          full_name: authorMatch.author.name,
          username: authorMatch.author.username || cleanUsername,
          avatar_url: authorMatch.author.avatar,
          cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
          bio: authorMatch.author.bio || `Staff writer on DevBlog specializing in ${authorMatch.category}.`,
          location: authorMatch.author.location || 'San Francisco, CA',
          website: authorMatch.author.website || 'https://devblog.io',
          created_at: '2025-06-01T00:00:00.000Z',
          followersCount: 340,
          followingCount: 120,
          articlesCount: articlesList.filter(
            (a) =>
              a.author.name === authorMatch.author.name ||
              a.author.username === authorMatch.author.username
          ).length,
          totalLikes: 750,
        };
      }

      // Default fallback
      return {
        id: identifier,
        full_name: identifier.startsWith('user-') ? identifier.replace('user-', '') : identifier,
        username: cleanUsername,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        bio: 'Tech enthusiast and contributor to DevBlog.',
        location: 'Earth',
        website: 'https://devblog.io',
        created_at: new Date().toISOString(),
        followersCount: 45,
        followingCount: 20,
        articlesCount: 1,
        totalLikes: 100,
      };
    },
    [profiles, articlesList]
  );

  // 11. Calculate Author Analytics
  const getAuthorAnalytics = useCallback(
    (authorIdOrName: string) => {
      const authorArticles = articlesList.filter(
        (a) =>
          a.author_id === authorIdOrName ||
          a.author.id === authorIdOrName ||
          a.author.name.toLowerCase() === authorIdOrName.toLowerCase() ||
          a.author.username?.toLowerCase() === authorIdOrName.toLowerCase()
      );

      const totalArticles = authorArticles.length;
      const totalViews = authorArticles.reduce((sum, a) => sum + (a.views_count || 0), 0);
      const totalLikes = authorArticles.reduce((sum, a) => sum + (a.likes_count || 0), 0);
      const totalComments = authorArticles.reduce(
        (sum, a) => sum + getArticleCommentsCount(a.id),
        0
      );

      const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0;
      const avgLikesPerArticle = totalArticles > 0 ? Math.round(totalLikes / totalArticles) : 0;
      const engagementRate =
        totalViews > 0 ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(1) : '0.0';

      return {
        totalArticles,
        totalViews,
        totalLikes,
        totalComments,
        avgViewsPerArticle,
        avgLikesPerArticle,
        engagementRate,
        articles: authorArticles,
      };
    },
    [articlesList, getArticleCommentsCount]
  );

  return {
    articlesList,
    setArticlesList,
    profiles,
    currentProfile,
    likedArticles,
    bookmarkedArticles,
    followingUsers,
    commentsMap,
    notifications,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    trackArticleView,
    addComment,
    editComment,
    deleteComment,
    updateProfile,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getArticleCommentsCount,
    getProfileByUsernameOrId,
    getAuthorAnalytics,
  };
}
