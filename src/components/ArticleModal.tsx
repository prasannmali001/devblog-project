import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Clock,
  Eye,
  UserPlus,
  UserCheck,
  CornerDownRight,
  Edit2,
  Trash2,
  Send,
  Check,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { Article } from '../data/articles';
import { CommentItem, UserProfile } from '../data/mockSocialData';

interface ArticleModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: (usernameOrId: string) => void;
  onOpenAuth: () => void;
  currentProfile: UserProfile;
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowingAuthor: boolean;
  onToggleLike: (articleId: string) => void;
  onToggleBookmark: (articleId: string) => void;
  onToggleFollow: (authorId: string, authorName?: string) => void;
  comments: CommentItem[];
  onAddComment: (articleId: string, content: string, parentId?: string | null) => void;
  onEditComment: (articleId: string, commentId: string, newContent: string) => void;
  onDeleteComment: (articleId: string, commentId: string) => void;
  showToast: (msg: string) => void;
  isAuthenticated: boolean;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  onOpenProfile,
  onOpenAuth,
  currentProfile,
  isLiked,
  isBookmarked,
  isFollowingAuthor,
  onToggleLike,
  onToggleBookmark,
  onToggleFollow,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  showToast,
  isAuthenticated,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const commentsSectionRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !article) return null;

  const authorId = article.author_id || article.author.id || article.author.name;
  const isOwnArticle =
    isAuthenticated &&
    (authorId === currentProfile.id ||
      article.author.name.toLowerCase() === currentProfile.full_name.toLowerCase() ||
      article.author.username?.toLowerCase() === currentProfile.username.toLowerCase());

  const totalCommentsCount = comments.reduce(
    (total, c) => total + 1 + (c.replies ? c.replies.length : 0),
    0
  );

  const handleScrollToComments = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showToast('Shared successfully!');
        return;
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Article URL copied to clipboard!');
    } catch {
      showToast('Article URL copied!');
    }
  };

  const handlePostTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      showToast('Please sign in to post a comment');
      return;
    }
    if (!newCommentText.trim()) return;

    onAddComment(article.id, newCommentText);
    setNewCommentText('');
    showToast('Comment posted!');
  };

  const handlePostReply = (parentId: string) => {
    if (!isAuthenticated) {
      onOpenAuth();
      showToast('Please sign in to reply');
      return;
    }
    if (!replyText.trim()) return;

    onAddComment(article.id, replyText, parentId);
    setReplyText('');
    setReplyingToId(null);
    showToast('Reply posted!');
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editingText.trim()) return;
    onEditComment(article.id, commentId, editingText);
    setEditingCommentId(null);
    setEditingText('');
    showToast('Comment updated');
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
    showToast('Code snippet copied to clipboard');
  };

  // Render markdown-like content blocks
  const renderContentBlocks = (rawText: string) => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeBlockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // end code block
          const codeSnippet = codeBuffer.join('\n');
          const currentIndex = codeBlockIndex++;
          elements.push(
            <div
              key={`code-${i}`}
              className="my-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 overflow-hidden shadow-md"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>code snippet</span>
                <button
                  onClick={() => handleCopyCode(codeSnippet, currentIndex)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition"
                >
                  {copiedCodeIndex === currentIndex ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto text-emerald-300 leading-relaxed">
                <code>{codeSnippet}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4
            key={`h3-${i}`}
            className="text-lg font-bold text-slate-900 mt-6 mb-2 tracking-tight"
          >
            {line.replace('### ', '')}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3
            key={`h2-${i}`}
            className="text-xl font-bold text-slate-900 mt-8 mb-3 tracking-tight border-b border-slate-100 pb-2"
          >
            {line.replace('## ', '')}
          </h3>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h2
            key={`h1-${i}`}
            className="text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight"
          >
            {line.replace('# ', '')}
          </h2>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`li-${i}`} className="text-slate-700 text-sm sm:text-base leading-relaxed ml-5 list-disc my-1">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
        elements.push(
          <li key={`oli-${i}`} className="text-slate-700 text-sm sm:text-base leading-relaxed ml-5 list-decimal my-1.5 font-medium">
            {line.replace(/^\d+\.\s+/, '')}
          </li>
        );
      } else if (line.trim().length > 0) {
        elements.push(
          <p
            key={`p-${i}`}
            className="text-slate-700 text-sm sm:text-base leading-relaxed my-3"
          >
            {line}
          </p>
        );
      }
    }

    return elements;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md border border-blue-200">
              {article.category}
            </span>
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              • {article.tag}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
              title="Share article"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
              aria-label="Close article"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="overflow-y-auto flex-1 px-6 sm:px-10 py-8">
          {/* Cover Hero Banner */}
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm bg-slate-100 border border-slate-200">
            <img
              src={article.cover_image || article.thumbnail}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Title */}
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            {article.title}
          </h1>

          {/* Author Header & Follow Action */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-6 border-y border-slate-200">
            <div className="flex items-center gap-3.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenProfile(article.author.username || authorId);
                }}
                className="group flex items-center gap-3 text-left focus:outline-none"
              >
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-600 transition"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {article.author.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    @{article.author.username || 'author'} • {article.author.role || 'Author'}
                  </div>
                </div>
              </button>

              {/* Follow Button (if not own profile) */}
              {!isOwnArticle && (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      onOpenAuth();
                      showToast('Please sign in to follow authors');
                      return;
                    }
                    onToggleFollow(authorId, article.author.name);
                    showToast(
                      isFollowingAuthor
                        ? `Unfollowed @${article.author.username || 'author'}`
                        : `Now following @${article.author.username || 'author'}!`
                    );
                  }}
                  className={`ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    isFollowingAuthor
                      ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 border border-slate-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  {isFollowingAuthor ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Article Metadata Pills */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{article.readTime}</span>
              </span>
              <span>•</span>
              <span>{article.publishedAt}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>{article.views_count || 1} views</span>
              </span>
            </div>
          </div>

          {/* Excerpt Lead Paragraph */}
          <div className="p-4 bg-slate-50 border-l-4 border-blue-600 rounded-r-xl mb-6 text-sm sm:text-base font-medium text-slate-700 italic leading-relaxed">
            "{article.excerpt}"
          </div>

          {/* Render Full Article Content Body */}
          <div className="prose max-w-none text-slate-800">
            {article.content ? (
              renderContentBlocks(article.content)
            ) : (
              <p className="text-slate-700 leading-relaxed">{article.excerpt}</p>
            )}
          </div>

          {/* Author Bio Box */}
          <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Written by {article.author.name}
                </h4>
                <p className="text-xs text-slate-600 max-w-md mt-0.5">
                  {article.author.bio ||
                    `Software engineer and technical writer contributing insights on ${article.category}.`}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenProfile(article.author.username || authorId);
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-600 bg-white border border-slate-300 rounded-lg hover:bg-blue-50 transition"
            >
              View Full Profile
            </button>
          </div>

          {/* --- Nested Comments Section --- */}
          <div ref={commentsSectionRef} className="mt-14 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span>Discussion ({totalCommentsCount})</span>
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostTopComment} className="mb-8">
              <div className="flex items-start gap-3">
                <img
                  src={currentProfile.avatar_url}
                  alt={currentProfile.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder={
                      isAuthenticated
                        ? 'Share your thoughts, ask a technical question, or leave feedback...'
                        : 'Sign in to join this engineering discussion...'
                    }
                    className="w-full p-3 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                <MessageCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No comments yet.</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Be the first to share your thoughts on this publication!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isCommentOwner =
                    isAuthenticated &&
                    (comment.user_id === currentProfile.id ||
                      comment.author.name.toLowerCase() === currentProfile.full_name.toLowerCase());
                  const canDelete = isCommentOwner || isOwnArticle;

                  return (
                    <div
                      key={comment.id}
                      className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3"
                    >
                      {/* Top-level Comment Author & Actions */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenProfile(comment.author.username || comment.user_id);
                            }}
                            className="focus:outline-none"
                          >
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {comment.author.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                @{comment.author.username}
                              </span>
                              {comment.user_id === authorId && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-semibold rounded">
                                  <ShieldCheck className="w-2.5 h-2.5" />
                                  <span>Author</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(comment.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Comment Action Icons */}
                        <div className="flex items-center gap-1.5">
                          {isCommentOwner && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingText(comment.content);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                              title="Edit comment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this comment?')) {
                                  onDeleteComment(article.id, comment.id);
                                  showToast('Comment deleted');
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                              title={
                                isCommentOwner ? 'Delete comment' : 'Moderate/Delete comment'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Comment Content / Edit Mode */}
                      {editingCommentId === comment.id ? (
                        <div className="space-y-2 pt-1">
                          <textarea
                            rows={2}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCommentId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(comment.id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {comment.content}
                        </p>
                      )}

                      {/* Reply Button Trigger */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => {
                            if (replyingToId === comment.id) {
                              setReplyingToId(null);
                            } else {
                              setReplyingToId(comment.id);
                              setReplyText(`@${comment.author.username} `);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>

                      {/* Nested Reply Form */}
                      {replyingToId === comment.id && (
                        <div className="ml-6 pl-3 border-l-2 border-blue-500 pt-2 space-y-2">
                          <textarea
                            rows={2}
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Reply to @${comment.author.username}...`}
                            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setReplyingToId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handlePostReply(comment.id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded"
                            >
                              Send Reply
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Render Nested Replies (1 Level Deep) */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-2.5 ml-5 sm:ml-8 pl-3 border-l-2 border-slate-200 pt-2">
                          {comment.replies.map((reply) => {
                            const isReplyOwner =
                              isAuthenticated &&
                              (reply.user_id === currentProfile.id ||
                                reply.author.name.toLowerCase() ===
                                  currentProfile.full_name.toLowerCase());
                            const canDeleteReply = isReplyOwner || isOwnArticle;

                            return (
                              <div
                                key={reply.id}
                                className="p-3 bg-white border border-slate-200 rounded-lg space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        onClose();
                                        onOpenProfile(reply.author.username || reply.user_id);
                                      }}
                                    >
                                      <img
                                        src={reply.author.avatar}
                                        alt={reply.author.name}
                                        className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                      />
                                    </button>
                                    <span className="text-xs font-bold text-slate-900">
                                      {reply.author.name}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      @{reply.author.username}
                                    </span>
                                    {reply.user_id === authorId && (
                                      <span className="text-[9px] px-1 bg-blue-100 text-blue-800 font-semibold rounded">
                                        Author
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    {isReplyOwner && (
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(reply.id);
                                          setEditingText(reply.content);
                                        }}
                                        className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    )}
                                    {canDeleteReply && (
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Delete this reply?')) {
                                            onDeleteComment(article.id, reply.id);
                                            showToast('Reply deleted');
                                          }
                                        }}
                                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {editingCommentId === reply.id ? (
                                  <div className="space-y-2 pt-1">
                                    <textarea
                                      rows={2}
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none"
                                    />
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2 py-0.5 text-xs text-slate-600"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEdit(reply.id)}
                                        className="px-2.5 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {reply.content}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* --- Sticky Bottom Social Action Bar --- */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-white border-t border-slate-200 shadow-lg sticky bottom-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Like Action */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  onOpenAuth();
                  showToast('Please sign in to like articles');
                  return;
                }
                onToggleLike(article.id);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                isLiked
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-red-600'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform active:scale-125 ${
                  isLiked ? 'fill-red-600 text-red-600' : ''
                }`}
              />
              <span>{article.likes_count || 0}</span>
            </button>

            {/* Comment Count / Scroll Button */}
            <button
              onClick={handleScrollToComments}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition"
            >
              <MessageCircle className="w-4 h-4 text-slate-500" />
              <span>{totalCommentsCount}</span>
            </button>

            {/* Bookmark / Save Action */}
            <button
              onClick={async () => {
                if (!isAuthenticated) {
                  onOpenAuth();
                  showToast('Please sign in to bookmark articles');
                  return;
                }
                onToggleBookmark(article.id);
                showToast(isBookmarked ? 'Removed from saved articles' : 'Saved to your reading list!');
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                isBookmarked
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
              }`}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
              />
              <span className="hidden sm:inline">
                {isBookmarked ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Share Article</span>
          </button>
        </div>
      </div>
    </div>
  );
};
