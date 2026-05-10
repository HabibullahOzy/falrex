"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReactionType = "like" | "love" | "haha" | "sad" | "angry" | null;

interface Comment {
  id: number;
  author: string;
  avatar: string;
  role: string;
  text: string;
  time: string;
  likes: number;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: string;
  company: string;
  time: string;
  content: string;
  image?: string;
  tags: string[];
  reactions: Record<string, number>;
  userReaction: ReactionType;
  comments: Comment[];
  shares: number;
  showComments: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const REACTIONS = [
  { type: "like" as ReactionType, emoji: "👍", label: "Like", color: "#0a66c2" },
  { type: "love" as ReactionType, emoji: "❤️", label: "Love", color: "#df704d" },
  { type: "haha" as ReactionType, emoji: "😄", label: "Haha", color: "#f5c75d" },
  { type: "sad" as ReactionType, emoji: "😢", label: "Sad", color: "#f5c75d" },
  { type: "angry" as ReactionType, emoji: "😡", label: "Angry", color: "#e05b43" },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4",
    role: "Chief Strategy Officer",
    company: "Nexus Ventures",
    time: "2h",
    content:
      "The future of B2B SaaS isn't just about features — it's about creating ecosystems. After 10 years in enterprise software, here's what I've learned about building products that companies can't live without:\n\n🔑 Focus on workflow integration, not standalone tools\n📊 Data portability builds trust AND reduces churn\n🤝 Community-led growth outperforms traditional sales by 3x\n\nThe companies winning in 2025 aren't selling software. They're selling transformation. What's your take?",
    tags: ["SaaS", "B2B", "ProductStrategy", "Leadership"],
    reactions: { like: 847, love: 234, haha: 12, sad: 5, angry: 3 },
    userReaction: null,
    shares: 156,
    comments: [
      {
        id: 1,
        author: "Marcus Webb",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=c0aede",
        role: "VP of Product at TechCorp",
        text: "Spot on, Sarah! The ecosystem play is exactly what differentiates Slack from every other messaging tool. Integration depth = switching costs.",
        time: "1h",
        likes: 42,
      },
      {
        id: 2,
        author: "Priya Nair",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc",
        role: "Founder @ GrowthOS",
        text: "Community-led growth stat is fascinating. We saw similar results — our community members have 40% lower CAC and 2x LTV.",
        time: "45m",
        likes: 28,
      },
    ],
    showComments: false,
  },
  {
    id: 2,
    author: "James Okoro",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=d1f4cc",
    role: "CEO & Co-founder",
    company: "Meridian AI",
    time: "5h",
    content:
      "We just closed our Series B — $42M to reshape how enterprises use AI for decision-making.\n\nHonest reflection: The hardest part wasn't the fundraise. It was staying focused on customer problems while VCs pushed us toward 'AI-washing' our pitch.\n\nWe kept it simple: We help CFOs reduce forecasting errors by 60%. No buzzwords. Just outcomes.\n\nThank you to our 200+ enterprise customers who believed in us before the hype. This round is for you. 🚀",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    tags: ["SeriesB", "AIStartup", "Fundraising", "FinTech"],
    reactions: { like: 2341, love: 891, haha: 23, sad: 8, angry: 2 },
    userReaction: null,
    shares: 412,
    comments: [
      {
        id: 1,
        author: "Linda Zhao",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linda&backgroundColor=ffdfbf",
        role: "Partner at Sequoia",
        text: "Congratulations James! Your focus on measurable outcomes is exactly why Meridian stood out. Excited for what's next.",
        time: "4h",
        likes: 156,
      },
    ],
    showComments: false,
  },
  {
    id: 3,
    author: "Elena Rodriguez",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena&backgroundColor=ffd5dc",
    role: "Head of Marketing",
    company: "Orbit Digital",
    time: "1d",
    content:
      "Unpopular opinion: Most content marketing strategies are broken because they optimize for impressions, not influence.\n\n3 shifts that 10x'd our pipeline in 6 months:\n\n1️⃣ We stopped writing for search engines and started writing for our ICP's Monday morning problems\n2️⃣ Replaced vanity metrics (views, likes) with downstream revenue attribution\n3️⃣ Built a 'content flywheel' — every asset feeds the next\n\nResult: 340% increase in qualified leads, 0% increase in ad spend.\n\nMarketing isn't about being seen. It's about being remembered when it matters.",
    tags: ["ContentMarketing", "B2BMarketing", "GrowthStrategy"],
    reactions: { like: 1203, love: 445, haha: 67, sad: 14, angry: 89 },
    userReaction: null,
    shares: 287,
    comments: [
      {
        id: 1,
        author: "Tom Bradley",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom&backgroundColor=b6e3f4",
        role: "CMO at Scale.io",
        text: "The 'ICP Monday morning problems' framing is gold. We restructured our entire content calendar around this and saw engagement double within 30 days.",
        time: "20h",
        likes: 87,
      },
      {
        id: 2,
        author: "Aisha Patel",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha&backgroundColor=c0aede",
        role: "Content Director",
        text: "Revenue attribution for content is so underrated. Most teams still live and die by engagement metrics. How are you attributing revenue to specific content pieces?",
        time: "18h",
        likes: 63,
      },
    ],
    showComments: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function totalReactions(reactions: Record<string, number>) {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

function topReactions(reactions: Record<string, number>) {
  return Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find((r) => r.type === type)!);
}

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

// ─── Components ───────────────────────────────────────────────────────────────

function Avatar({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  return (
    <div
      className="avatar-ring"
      style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}
    >
      <img src={src} alt={alt} width={size} height={size} style={{ display: "block" }} />
    </div>
  );
}

function ReactionPicker({
  onSelect,
  visible,
}: {
  onSelect: (r: ReactionType) => void;
  visible: boolean;
}) {
  return (
    <div className={`reaction-picker ${visible ? "visible" : ""}`}>
      {REACTIONS.map((r) => (
        <button
          key={r.type}
          className="reaction-btn"
          title={r.label}
          onClick={() => onSelect(r.type)}
        >
          <span className="reaction-emoji">{r.emoji}</span>
          <span className="reaction-label">{r.label}</span>
        </button>
      ))}
    </div>
  );
}

function PostCard({ post, onUpdate }: { post: Post; onUpdate: (p: Post) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [shareToast, setShareToast] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  const pickerRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close picker on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleReact(type: ReactionType) {
    const updated = { ...post };
    if (post.userReaction === type) {
      // toggle off
      updated.reactions = { ...post.reactions, [type!]: Math.max(0, post.reactions[type!] - 1) };
      updated.userReaction = null;
    } else {
      if (post.userReaction) {
        updated.reactions = {
          ...post.reactions,
          [post.userReaction]: Math.max(0, post.reactions[post.userReaction] - 1),
        };
      }
      updated.reactions = { ...updated.reactions, [type!]: (updated.reactions[type!] || 0) + 1 };
      updated.userReaction = type;
    }
    setShowPicker(false);
    onUpdate(updated);
  }

  function handleLikeClick() {
    if (post.userReaction === "like") {
      handleReact("like");
    } else if (!post.userReaction) {
      handleReact("like");
    } else {
      setShowPicker((v) => !v);
    }
  }

  function handleShare() {
    const updated = { ...post, shares: post.shares + 1 };
    onUpdate(updated);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  }

  function submitComment() {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now(),
      author: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4",
      role: "Business Professional",
      text: newComment.trim(),
      time: "Just now",
      likes: 0,
    };
    onUpdate({ ...post, comments: [...post.comments, comment] });
    setNewComment("");
  }

  function toggleCommentLike(cid: number) {
    setCommentLikes((prev) => ({ ...prev, [cid]: !prev[cid] }));
  }

  const activeReaction = post.userReaction
    ? REACTIONS.find((r) => r.type === post.userReaction)
    : null;

  return (
    <article className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar src={post.avatar} alt={post.author} size={52} />
        <div className="post-meta">
          <div className="post-author">{post.author}</div>
          <div className="post-role">
            {post.role} · <span className="post-company">{post.company}</span>
          </div>
          <div className="post-time">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
            </svg>
            {post.time} ago
          </div>
        </div>
        <button className="follow-btn">+ Follow</button>
      </div>

      {/* Content */}
      <div className="post-content">
        <ExpandableText text={post.content} />
      </div>

      {/* Image */}
      {post.image && (
        <div className="post-image-wrap">
          <img src={post.image} alt="Post" className="post-image" />
        </div>
      )}

      {/* Tags */}
      <div className="post-tags">
        {post.tags.map((tag) => (
          <span key={tag} className="tag">
            #{tag}
          </span>
        ))}
      </div>

      {/* Reaction summary */}
      <div className="reaction-summary">
        <div className="reaction-emojis">
          {topReactions(post.reactions).map((r) => (
            <span key={r.type} className="summary-emoji" title={r.label}>
              {r.emoji}
            </span>
          ))}
          <span className="reaction-count">{formatCount(totalReactions(post.reactions))}</span>
        </div>
        <div className="summary-right">
          <span
            className="comment-count-link"
            onClick={() => onUpdate({ ...post, showComments: !post.showComments })}
          >
            {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
          </span>
          <span className="share-count">{formatCount(post.shares)} shares</span>
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar">
        <div className="action-wrap" ref={pickerRef}>
          <ReactionPicker visible={showPicker} onSelect={handleReact} />
          <button
            className={`action-btn ${post.userReaction ? "reacted" : ""}`}
            style={activeReaction ? { color: activeReaction.color } : {}}
            onClick={handleLikeClick}
            onMouseEnter={() => setShowPicker(true)}
          >
            <span className="action-icon">
              {activeReaction ? activeReaction.emoji : "👍"}
            </span>
            <span>{activeReaction ? activeReaction.label : "Like"}</span>
          </button>
        </div>

        <button
          className="action-btn"
          onClick={() => onUpdate({ ...post, showComments: !post.showComments })}
        >
          <span className="action-icon">💬</span>
          <span>Comment</span>
        </button>

        <button className="action-btn" onClick={handleShare}>
          <span className="action-icon">🔁</span>
          <span>Repost</span>
        </button>

        <button className="action-btn">
          <span className="action-icon">📤</span>
          <span>Send</span>
        </button>

        {shareToast && <div className="share-toast">Reposted!</div>}
      </div>

      {/* Comments section */}
      {post.showComments && (
        <div className="comments-section">
          {/* Comment input */}
          <div className="comment-input-row">
            <Avatar
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
              alt="You"
              size={36}
            />
            <div className="comment-input-wrap">
              <textarea
                className="comment-textarea"
                placeholder="Add a comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                rows={1}
              />
              {newComment && (
                <button className="comment-submit" onClick={submitComment}>
                  Post
                </button>
              )}
            </div>
          </div>

          {/* Comment list */}
          <div className="comment-list">
            {post.comments.map((c) => (
              <div key={c.id} className="comment-item">
                <Avatar src={c.avatar} alt={c.author} size={36} />
                <div className="comment-body">
                  <div className="comment-bubble">
                    <div className="comment-author">{c.author}</div>
                    <div className="comment-role">{c.role}</div>
                    <div className="comment-text">{c.text}</div>
                  </div>
                  <div className="comment-actions">
                    <button
                      className={`comment-like-btn ${commentLikes[c.id] ? "liked" : ""}`}
                      onClick={() => toggleCommentLike(c.id)}
                    >
                      {commentLikes[c.id] ? "👍 Liked" : "Like"}{" "}
                      {c.likes + (commentLikes[c.id] ? 1 : 0) > 0 &&
                        `· ${c.likes + (commentLikes[c.id] ? 1 : 0)}`}
                    </button>
                    <button className="comment-reply-btn">Reply</button>
                    <span className="comment-time">{c.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 220;
  const needsTrunc = text.length > limit;

  const display = needsTrunc && !expanded ? text.slice(0, limit) + "…" : text;

  return (
    <p style={{ whiteSpace: "pre-line", margin: 0, lineHeight: 1.6 }}>
      {display}
      {needsTrunc && (
        <button className="see-more-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? " see less" : " see more"}
        </button>
      )}
    </p>
  );
}

function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Profile card */}
      <div className="sidebar-card profile-card">
        <div className="profile-banner" />
        <div className="profile-avatar-wrap">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
            alt="Profile"
            className="profile-avatar"
          />
        </div>
        <div className="profile-info">
          <div className="profile-name">Alex Johnson</div>
          <div className="profile-title">Business Development Lead</div>
          <div className="profile-company">TechForward Inc.</div>
        </div>
        <div className="profile-stats">
          <div className="stat">
            <div className="stat-num">847</div>
            <div className="stat-label">Connections</div>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <div className="stat-num">3.2K</div>
            <div className="stat-label">Post views</div>
          </div>
        </div>
        <button className="premium-btn">Try Premium free</button>
      </div>

      {/* Trending topics */}
      <div className="sidebar-card">
        <h3 className="sidebar-title">Trending in Business</h3>
        {[
          { tag: "AIStrategy", posts: "12,403 posts" },
          { tag: "FutureOfWork", posts: "8,721 posts" },
          { tag: "StartupFunding", posts: "6,118 posts" },
          { tag: "LeadershipTips", posts: "5,240 posts" },
          { tag: "ProductLaunch", posts: "4,890 posts" },
        ].map((t) => (
          <div key={t.tag} className="trending-item">
            <div className="trending-tag">#{t.tag}</div>
            <div className="trending-count">{t.posts}</div>
          </div>
        ))}
      </div>

      {/* People to follow */}
      <div className="sidebar-card">
        <h3 className="sidebar-title">People you may know</h3>
        {[
          {
            name: "Diana Fox",
            role: "CMO at Pulse",
            seed: "diana",
            bg: "ffd5dc",
          },
          {
            name: "Raj Mehta",
            role: "Founder, BuildCo",
            seed: "raj",
            bg: "c0aede",
          },
          {
            name: "Sophie Turner",
            role: "VC Partner",
            seed: "sophie",
            bg: "d1f4cc",
          },
        ].map((p) => (
          <div key={p.name} className="people-item">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.seed}&backgroundColor=${p.bg}`}
              alt={p.name}
              className="people-avatar"
            />
            <div className="people-info">
              <div className="people-name">{p.name}</div>
              <div className="people-role">{p.role}</div>
            </div>
            <button className="connect-btn">Connect</button>
          </div>
        ))}
      </div>
    </aside>
  );
}

function RightPanel() {
  return (
    <div className="right-panel">
      <div className="sidebar-card">
        <h3 className="sidebar-title">Featured Jobs</h3>
        {[
          {
            title: "Head of Growth",
            company: "Stripe",
            location: "Remote · $180K",
            logo: "🟦",
          },
          {
            title: "Product Manager",
            company: "Notion",
            location: "NYC · $160K",
            logo: "⬜",
          },
          {
            title: "Strategy Lead",
            company: "Figma",
            location: "SF · $200K",
            logo: "🟣",
          },
        ].map((j) => (
          <div key={j.title} className="job-item">
            <div className="job-logo">{j.logo}</div>
            <div className="job-info">
              <div className="job-title">{j.title}</div>
              <div className="job-company">{j.company}</div>
              <div className="job-location">{j.location}</div>
            </div>
            <button className="apply-btn">Apply</button>
          </div>
        ))}
      </div>

      <div className="sidebar-card">
        <h3 className="sidebar-title">Upcoming Events</h3>
        {[
          {
            name: "SaaS Growth Summit",
            date: "Apr 12",
            attendees: "1.2K",
          },
          {
            name: "AI for Business Leaders",
            date: "Apr 18",
            attendees: "890",
          },
          {
            name: "Founder Fireside Chat",
            date: "May 2",
            attendees: "560",
          },
        ].map((e) => (
          <div key={e.name} className="event-item">
            <div className="event-date">{e.date}</div>
            <div className="event-info">
              <div className="event-name">{e.name}</div>
              <div className="event-attendees">{e.attendees} attending</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeNav, setActiveNav] = useState("home");

  function updatePost(updated: Post) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  return (
    <>
      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <div className="logo">
              <svg viewBox="0 0 34 34" width="34" height="34">
                <path
                  d="M34,2.5v29A2.5,2.5,0,0,1,31.5,34H2.5A2.5,2.5,0,0,1,0,31.5V2.5A2.5,2.5,0,0,1,2.5,0h29A2.5,2.5,0,0,1,34,2.5Z"
                  fill="#0a66c2"
                />
                <path
                  d="M7.5,14h3.5v11H7.5Zm1.75-5.5A2,2,0,1,1,7.25,10.5,2,2,0,0,1,9.25,8.5ZM15,14h3.35v1.5h.05A3.67,3.67,0,0,1,21.7,13.7c3.52,0,4.17,2.32,4.17,5.33V25H22.37V19.73c0-1.24,0-2.84-1.73-2.84s-2,1.35-2,2.75V25H15Z"
                  fill="white"
                />
              </svg>
              <span className="logo-text">BusinessHub</span>
            </div>
            <div className="search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input placeholder="Search" className="search-input" />
            </div>
          </div>
          <div className="navbar-nav">
            {[
              { id: "home", icon: "🏠", label: "Home" },
              { id: "network", icon: "👥", label: "Network" },
              { id: "jobs", icon: "💼", label: "Jobs" },
              { id: "messages", icon: "💬", label: "Messages" },
              { id: "notifications", icon: "🔔", label: "Alerts" },
            ].map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
            <div className="nav-divider" />
            <button className="nav-item">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
                alt="Me"
                style={{ width: 24, height: 24, borderRadius: "50%" }}
              />
              <span className="nav-label">Me ▾</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Page body ─── */}
      <main className="page-main">
        <div className="page-layout">
          <Sidebar />

          {/* Feed */}
          <section className="feed">
            {/* Post composer */}
            <div className="post-composer">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
                alt="You"
                className="composer-avatar"
              />
              <button className="composer-input">Start a post, try writing with AI</button>
            </div>

            {/* Posts */}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={updatePost} />
            ))}
          </section>

          <RightPanel />
        </div>
      </main>
    </>
  );
}