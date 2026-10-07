import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ArticleGrid } from './components/ArticleGrid';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { AuthModal, AuthMode } from './components/AuthModal';
import { WriteModal } from './components/WriteModal';
import { ArticleModal } from './components/ArticleModal';
import { ProfileModal } from './components/ProfileModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { Article } from './data/articles';
import { NotificationItem, UserProfile } from './data/mockSocialData';
import { supabase, isSupabaseConfigured, mapDbArticleToArticle, DbArticle } from './lib/supabase';
import { useSocialPlatform } from './lib/socialStore';
import { User as SupabaseUser } from '@supabase/supabase-js';

export const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Social Platform Hook
  const {
    articlesList,
    setArticlesList,
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
  } = useSocialPlatform(authUser);

  // Active Modals & Views State
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<AuthMode>('signin');
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  const showToast = useCallback(
    (message: string) => {
      if (toastTimer) {
        window.clearTimeout(toastTimer);
      }
      setToastMessage(message);
      const timer = window.setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      setToastTimer(timer);
    },
    [toastTimer]
  );

  const handleCloseToast = () => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    setToastMessage(null);
  };

  const getDisplayName = (user: SupabaseUser | null): string => {
    if (!user) return 'Developer';
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.username ||
      user.email?.split('@')[0] ||
      'Developer'
    );
  };

  // 1. Supabase Articles & Session Loader
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        setCurrentUser(getDisplayName(session.user));
      }
    });

    // Listen to Auth State Changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        setCurrentUser(getDisplayName(session.user));
      } else {
        setAuthUser(null);
        setCurrentUser(null);
      }
    });

    // Fetch live articles from Supabase
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from('articles')
          .select('*, profiles(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const mappedArticles = data.map((item) => mapDbArticleToArticle(item as DbArticle));
          setArticlesList((prev) => {
            // merge with custom local articles
            const existingIds = new Set(mappedArticles.map((m) => m.id));
            const remaining = prev.filter((p) => !existingIds.has(p.id));
            return [...mappedArticles, ...remaining];
          });
        }
      } catch (err) {
        console.warn('Supabase fetch articles notice:', err);
      }
    };

    fetchArticles();

    // Realtime channel
    const channel = supabase
      .channel('public:articles')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'articles' },
        (payload) => {
          const newArt = mapDbArticleToArticle(payload.new as DbArticle);
          setArticlesList((prev) => {
            if (prev.some((a) => a.id === newArt.id)) return prev;
            return [newArt, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      authSubscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  // Auth Modal Triggers
  const handleOpenAuth = (mode: AuthMode = 'signin', notice?: string | null) => {
    setAuthNoticeMessage(notice || null);
    setAuthInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userName: string, authenticatedUser: SupabaseUser | null) => {
    setAuthUser(authenticatedUser);
    setCurrentUser(userName);
    setIsAuthModalOpen(false);
    setAuthNoticeMessage(null);
    showToast(`Signed in successfully as ${userName}`);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error:', err);
      }
    }
    setAuthUser(null);
    setCurrentUser(null);
    showToast('Logged out successfully');
  };

  // Write Article Gatekeeper
  const handleOpenWrite = () => {
    if (!authUser && isSupabaseConfigured) {
      const notice = 'Please sign in or create an account to publish an article.';
      setAuthNoticeMessage(notice);
      setAuthInitialMode('signin');
      setIsAuthModalOpen(true);
      showToast(notice);
      return;
    }
    setAuthNoticeMessage(null);
    setIsWriteModalOpen(true);
  };

  const handlePublishArticle = (newArticle: Article) => {
    setArticlesList((prev) => {
      if (prev.some((a) => a.id === newArticle.id)) return prev;
      return [newArticle, ...prev];
    });
    setIsWriteModalOpen(false);
    showToast('Article published successfully!');
  };

  // Article Reader View Trigger
  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    trackArticleView(article.id);
  };

  // Profile Modal Trigger
  const handleOpenProfile = (usernameOrId: string) => {
    const userProf = getProfileByUsernameOrId(usernameOrId);
    setSelectedProfile(userProf);
  };

  // Notification Click Navigation
  const handleNotificationClick = (notif: NotificationItem) => {
    if (notif.article_id) {
      const art = articlesList.find((a) => a.id === notif.article_id);
      if (art) {
        handleOpenArticle(art);
        return;
      }
    }
    if (notif.actor.username || notif.actor_id) {
      handleOpenProfile(notif.actor.username || notif.actor_id);
    }
  };

  // Compute articles for currently viewed profile
  const selectedProfileArticles = selectedProfile
    ? articlesList.filter(
        (a) =>
          a.author_id === selectedProfile.id ||
          a.author.id === selectedProfile.id ||
          a.author.username?.toLowerCase() === selectedProfile.username?.toLowerCase() ||
          a.author.name.toLowerCase() === selectedProfile.full_name.toLowerCase()
      )
    : [];

  const bookmarkedArticlesList = articlesList.filter((a) => bookmarkedArticles.has(a.id));

  const authorAnalytics = getAuthorAnalytics(currentProfile.id);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentUser={currentUser}
        currentProfile={currentProfile}
        notifications={notifications}
        onMarkNotificationAsRead={markNotificationAsRead}
        onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        onNotificationClick={handleNotificationClick}
        onOpenAuth={(mode) => handleOpenAuth(mode, null)}
        onOpenWrite={handleOpenWrite}
        onOpenProfile={handleOpenProfile}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <Hero
          onOpenWrite={handleOpenWrite}
          onActionClick={(action) => showToast(action)}
        />

        {/* 3. 3-Column Article Grid with Category Filters & Social Actions */}
        <ArticleGrid
          articles={articlesList}
          searchQuery={searchQuery}
          onOpenArticle={handleOpenArticle}
          onOpenProfile={handleOpenProfile}
          likedArticles={likedArticles}
          bookmarkedArticles={bookmarkedArticles}
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
          getArticleCommentsCount={getArticleCommentsCount}
          onOpenAuth={() => handleOpenAuth('signin')}
          showToast={showToast}
          isAuthenticated={Boolean(currentUser || !isSupabaseConfigured)}
        />
      </main>

      {/* 4. Footer */}
      <Footer
        onActionClick={(action) => showToast(action)}
        onOpenWrite={handleOpenWrite}
      />

      {/* --- MODALS --- */}

      {/* 5. Article Detail View & Social Bar & Nested Comments Modal */}
      <ArticleModal
        article={selectedArticle}
        isOpen={Boolean(selectedArticle)}
        onClose={() => setSelectedArticle(null)}
        onOpenProfile={handleOpenProfile}
        onOpenAuth={() => handleOpenAuth('signin')}
        currentProfile={currentProfile}
        isLiked={selectedArticle ? likedArticles.has(selectedArticle.id) : false}
        isBookmarked={selectedArticle ? bookmarkedArticles.has(selectedArticle.id) : false}
        isFollowingAuthor={
          selectedArticle
            ? followingUsers.has(
                selectedArticle.author_id ||
                  selectedArticle.author.id ||
                  selectedArticle.author.name
              )
            : false
        }
        onToggleLike={toggleLike}
        onToggleBookmark={toggleBookmark}
        onToggleFollow={toggleFollow}
        comments={selectedArticle ? commentsMap[selectedArticle.id] || [] : []}
        onAddComment={addComment}
        onEditComment={editComment}
        onDeleteComment={deleteComment}
        showToast={showToast}
        isAuthenticated={Boolean(currentUser || !isSupabaseConfigured)}
      />

      {/* 6. Public User Profile Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          isOpen={Boolean(selectedProfile)}
          onClose={() => setSelectedProfile(null)}
          isOwnProfile={
            selectedProfile.id === currentProfile.id ||
            selectedProfile.username.toLowerCase() === currentProfile.username.toLowerCase()
          }
          isFollowing={followingUsers.has(selectedProfile.id)}
          onToggleFollow={toggleFollow}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
          onOpenAnalytics={() => setIsAnalyticsOpen(true)}
          userArticles={selectedProfileArticles}
          bookmarkedArticlesList={bookmarkedArticlesList}
          onOpenArticle={handleOpenArticle}
          onRemoveBookmark={toggleBookmark}
          onOpenAuth={() => handleOpenAuth('signin')}
          showToast={showToast}
          isAuthenticated={Boolean(currentUser || !isSupabaseConfigured)}
        />
      )}

      {/* 7. Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={currentProfile}
        onSave={updateProfile}
        showToast={showToast}
      />

      {/* 8. Writer Analytics Dashboard Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        currentProfile={currentProfile}
        analyticsData={authorAnalytics}
        getArticleCommentsCount={getArticleCommentsCount}
        onOpenArticle={handleOpenArticle}
        onOpenWrite={handleOpenWrite}
      />

      {/* 9. Interactive Write & Publish Modal (Refined: No manual read time, locked author) */}
      <WriteModal
        isOpen={isWriteModalOpen}
        currentUser={authUser}
        currentProfile={currentProfile}
        onClose={() => setIsWriteModalOpen(false)}
        onPublish={handlePublishArticle}
        onError={(err) => showToast(err)}
      />

      {/* 10. Interactive Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authInitialMode}
        noticeMessage={authNoticeMessage}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthNoticeMessage(null);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* 11. Notification Toast */}
      <Toast message={toastMessage} onClose={handleCloseToast} />
    </div>
  );
};

export default App;
