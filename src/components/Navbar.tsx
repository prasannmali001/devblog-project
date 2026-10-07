import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Edit3,
  User,
  Menu,
  X,
  LogOut,
  Sparkles,
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  BarChart2,
  CheckCheck,
  ChevronDown,
} from 'lucide-react';
import { AuthMode } from './AuthModal';
import { NotificationItem, UserProfile } from '../data/mockSocialData';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: string | null;
  currentProfile: UserProfile;
  notifications: NotificationItem[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
  onOpenAuth: (mode?: AuthMode) => void;
  onOpenWrite: () => void;
  onOpenProfile: (usernameOrId: string) => void;
  onOpenAnalytics: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  currentUser,
  currentProfile,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  onNotificationClick,
  onOpenAuth,
  onOpenWrite,
  onOpenProfile,
  onOpenAnalytics,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-3.5 h-3.5 text-purple-600" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo & Main Navigation */}
          <div className="flex items-center gap-6">
            <a href="#home" className="flex items-center gap-2.5 text-slate-900 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-slate-900">
                  DevBlog
                </span>
                <span className="text-[10px] font-semibold text-blue-600 -mt-1 hidden sm:block">
                  Social Publishing Platform
                </span>
              </div>
            </a>

            {/* Desktop Navigation Link */}
            <a
              href="#articles"
              className="hidden md:inline-block text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              Explore Articles
            </a>
          </div>

          {/* Enhanced Search Input */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search articles, topics, content, or @authors..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Write Button */}
            <button
              onClick={onOpenWrite}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-blue-300 transition shadow-sm"
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Write</span>
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                aria-label="View notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-slide-up">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Notifications
                      </h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllNotificationsAsRead}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onMarkNotificationAsRead(notif.id);
                            onNotificationClick(notif);
                            setNotificationsOpen(false);
                          }}
                          className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="relative shrink-0 mt-0.5">
                            <img
                              src={notif.actor.avatar}
                              alt={notif.actor.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-full shadow-sm">
                              {getNotifIcon(notif.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-800 leading-snug">
                              <strong className="font-bold text-slate-900">
                                {notif.actor.name}
                              </strong>{' '}
                              {notif.type === 'like' && (
                                <span>liked your article <em>"{notif.article_title}"</em></span>
                              )}
                              {notif.type === 'comment' && (
                                <span>commented on <em>"{notif.article_title}"</em></span>
                              )}
                              {notif.type === 'follow' && (
                                <span>started following your engineering updates.</span>
                              )}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {notif.created_at}
                            </span>
                          </div>

                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Auth State & User Menu */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
                >
                  <img
                    src={currentProfile.avatar_url}
                    alt={currentProfile.full_name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {currentProfile.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-slide-up">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentProfile.full_name}
                      </p>
                      <p className="text-[11px] text-blue-600 font-medium">
                        @{currentProfile.username}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenProfile(currentProfile.username);
                      }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>My Public Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenAnalytics();
                      }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition"
                    >
                      <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Writer Analytics Studio</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenWrite();
                      }}
                      className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Publish New Article</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Platform</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-1">
            {/* Mobile Notification Button */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-slate-200 py-3 space-y-2 animate-fade-in">
            <a
              href="#articles"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Explore Articles
            </a>

            {currentUser ? (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 rounded-lg">
                  <img
                    src={currentProfile.avatar_url}
                    alt={currentProfile.full_name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {currentProfile.full_name}
                    </div>
                    <div className="text-[10px] text-blue-600">
                      @{currentProfile.username}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      onOpenProfile(currentProfile.username);
                      setMobileOpen(false);
                    }}
                    className="py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenAnalytics();
                      setMobileOpen(false);
                    }}
                    className="py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
                  >
                    <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Analytics</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    onOpenWrite();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Write Article</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    onOpenWrite();
                    setMobileOpen(false);
                  }}
                  className="w-full py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Write Article</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onOpenAuth('signin');
                      setMobileOpen(false);
                    }}
                    className="w-1/2 py-2 text-xs font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('register');
                      setMobileOpen(false);
                    }}
                    className="w-1/2 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Join Platform
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </nav>
  );
};
