// "use client";

// import { useEffect, useRef, useState } from "react";
// import styles from "../social.module.css";

// type ReactionType = "like" | "love" | "haha" | "sad" | "angry" | null;

// interface Comment {
//   id: number;
//   author: string;
//   avatar: string;
//   role: string;
//   text: string;
//   time: string;
//   likes: number;
// }

// interface Post {
//   id: number;
//   author: string;
//   avatar: string;
//   role: string;
//   company: string;
//   time: string;
//   content: string;
//   image?: string;
//   tags: string[];
//   reactions: Record<string, number>;
//   userReaction: ReactionType;
//   comments: Comment[];
//   shares: number;
//   showComments: boolean;
// }

// const me = {
//   name: "Alex Johnson",
//   avatar:
//     "https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4",
//   role: "Business Professional",
// };

// const REACTIONS = [
//   { type: "like" as ReactionType, emoji: "👍", label: "Like", color: "#0a66c2" },
//   { type: "love" as ReactionType, emoji: "❤️", label: "Love", color: "#df704d" },
//   { type: "haha" as ReactionType, emoji: "😄", label: "Haha", color: "#c99105" },
//   { type: "sad" as ReactionType, emoji: "😢", label: "Sad", color: "#c99105" },
//   { type: "angry" as ReactionType, emoji: "😡", label: "Angry", color: "#e05b43" },
// ];

// const INITIAL_POSTS: Post[] = [
//   {
//     id: 1,
//     author: "Sarah Chen",
//     avatar:
//       "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4",
//     role: "Chief Strategy Officer",
//     company: "Nexus Ventures",
//     time: "2h",
//     content:
//       "The future of B2B SaaS isn't just about features — it's about creating ecosystems.\n\nFocus on workflow integration, data portability, and community-led growth.\n\nThe companies winning in 2025 aren't selling software. They're selling transformation.",
//     tags: ["SaaS", "B2B", "ProductStrategy", "Leadership"],
//     reactions: { like: 847, love: 234, haha: 12, sad: 5, angry: 3 },
//     userReaction: null,
//     shares: 156,
//     comments: [
//       {
//         id: 1,
//         author: "Marcus Webb",
//         avatar:
//           "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=c0aede",
//         role: "VP of Product at TechCorp",
//         text: "Spot on. Integration depth creates real switching costs.",
//         time: "1h",
//         likes: 42,
//       },
//     ],
//     showComments: false,
//   },
//   {
//     id: 2,
//     author: "James Okoro",
//     avatar:
//       "https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=d1f4cc",
//     role: "CEO & Co-founder",
//     company: "Meridian AI",
//     time: "5h",
//     content:
//       "We just closed our Series B — $42M to reshape how enterprises use AI for decision-making.\n\nThe hardest part wasn't the fundraise. It was staying focused on customer problems while everyone pushed buzzwords.",
//     image:
//       "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1000&q=80",
//     tags: ["SeriesB", "AIStartup", "Fundraising", "FinTech"],
//     reactions: { like: 2341, love: 891, haha: 23, sad: 8, angry: 2 },
//     userReaction: null,
//     shares: 412,
//     comments: [],
//     showComments: false,
//   },
// ];

// function totalReactions(reactions: Record<string, number>) {
//   return Object.values(reactions).reduce((sum, value) => sum + value, 0);
// }

// function topReactions(reactions: Record<string, number>) {
//   return Object.entries(reactions)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 3)
//     .map(([type]) => REACTIONS.find((reaction) => reaction.type === type))
//     .filter(Boolean);
// }

// function formatCount(n: number) {
//   return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
// }

// function Avatar({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
//   return (
//     <img
//       src={src}
//       alt={alt}
//       className={styles.avatar}
//       style={{ width: size, height: size }}
//     />
//   );
// }

// function ExpandableText({ text }: { text: string }) {
//   const [expanded, setExpanded] = useState(false);
//   const limit = 220;
//   const isLong = text.length > limit;
//   const visibleText = isLong && !expanded ? `${text.slice(0, limit)}...` : text;

//   return (
//     <p className={styles.expandText}>
//       {visibleText}
//       {isLong && (
//         <button className={styles.seeMoreBtn} onClick={() => setExpanded((v) => !v)}>
//           {expanded ? " see less" : " see more"}
//         </button>
//       )}
//     </p>
//   );
// }

// function ReactionPicker({
//   visible,
//   onSelect,
// }: {
//   visible: boolean;
//   onSelect: (reaction: ReactionType) => void;
// }) {
//   return (
//     <div className={`${styles.reactionPicker} ${visible ? styles.visible : ""}`}>
//       {REACTIONS.map((reaction) => (
//         <button
//           key={reaction.type}
//           className={styles.reactionButton}
//           title={reaction.label}
//           onClick={() => onSelect(reaction.type)}
//         >
//           <span className={styles.reactionEmoji}>{reaction.emoji}</span>
//           <span className={styles.reactionLabel}>{reaction.label}</span>
//         </button>
//       ))}
//     </div>
//   );
// }

// function Composer({ onCreate }: { onCreate: (content: string) => void }) {
//   const [content, setContent] = useState("");

//   function submitPost() {
//     if (!content.trim()) return;
//     onCreate(content.trim());
//     setContent("");
//   }

//   return (
//     <div className={styles.composer}>
//       <Avatar src={me.avatar} alt={me.name} size={48} />
//       <div className={styles.composerBody}>
//         <textarea
//           className={styles.composerTextarea}
//           placeholder="Start a post"
//           value={content}
//           rows={content ? 3 : 1}
//           onChange={(e) => setContent(e.target.value)}
//         />
//         {content.trim() && (
//           <button className={styles.primaryBtn} onClick={submitPost}>
//             Post
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

// function PostCard({ post, onUpdate }: { post: Post; onUpdate: (post: Post) => void }) {
//   const [showPicker, setShowPicker] = useState(false);
//   const [newComment, setNewComment] = useState("");
//   const [shareToast, setShareToast] = useState(false);
//   const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
//   const pickerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function closePicker(e: MouseEvent) {
//       if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
//         setShowPicker(false);
//       }
//     }

//     document.addEventListener("mousedown", closePicker);
//     return () => document.removeEventListener("mousedown", closePicker);
//   }, []);

//   function handleReact(type: ReactionType) {
//     if (!type) return;

//     let reactions = { ...post.reactions };
//     let userReaction: ReactionType = type;

//     if (post.userReaction === type) {
//       reactions[type] = Math.max(0, reactions[type] - 1);
//       userReaction = null;
//     } else {
//       if (post.userReaction) {
//         reactions[post.userReaction] = Math.max(0, reactions[post.userReaction] - 1);
//       }

//       reactions[type] = (reactions[type] || 0) + 1;
//     }

//     onUpdate({ ...post, reactions, userReaction });
//     setShowPicker(false);
//   }

//   function submitComment() {
//     if (!newComment.trim()) return;

//     const comment: Comment = {
//       id: Date.now(),
//       author: "You",
//       avatar: me.avatar,
//       role: me.role,
//       text: newComment.trim(),
//       time: "Just now",
//       likes: 0,
//     };

//     onUpdate({
//       ...post,
//       comments: [...post.comments, comment],
//       showComments: true,
//     });

//     setNewComment("");
//   }

//   function handleShare() {
//     onUpdate({ ...post, shares: post.shares + 1 });
//     setShareToast(true);
//     window.setTimeout(() => setShareToast(false), 1600);
//   }

//   const activeReaction = post.userReaction
//     ? REACTIONS.find((reaction) => reaction.type === post.userReaction)
//     : null;

//   return (
//     <article className={styles.postCard}>
//       <div className={styles.postHeader}>
//         <Avatar src={post.avatar} alt={post.author} size={52} />

//         <div className={styles.postMeta}>
//           <div className={styles.postAuthor}>{post.author}</div>
//           <div className={styles.postRole}>
//             {post.role} · <span>{post.company}</span>
//           </div>
//           <div className={styles.postTime}>{post.time} ago</div>
//         </div>

//         <button className={styles.followBtn}>+ Follow</button>
//       </div>

//       <div className={styles.postContent}>
//         <ExpandableText text={post.content} />
//       </div>

//       {post.image && (
//         <div className={styles.postImageWrap}>
//           <img src={post.image} alt="Post image" className={styles.postImage} />
//         </div>
//       )}

//       <div className={styles.tags}>
//         {post.tags.map((tag) => (
//           <span key={tag} className={styles.tag}>
//             #{tag}
//           </span>
//         ))}
//       </div>

//       <div className={styles.reactionSummary}>
//         <div className={styles.summaryLeft}>
//           {topReactions(post.reactions).map((reaction) => (
//             <span key={reaction!.type} className={styles.summaryEmoji}>
//               {reaction!.emoji}
//             </span>
//           ))}
//           <span>{formatCount(totalReactions(post.reactions))}</span>
//         </div>

//         <div className={styles.summaryRight}>
//           <button onClick={() => onUpdate({ ...post, showComments: !post.showComments })}>
//             {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
//           </button>
//           <span>{formatCount(post.shares)} shares</span>
//         </div>
//       </div>

//       <div className={styles.actionBar}>
//         <div className={styles.actionWrap} ref={pickerRef}>
//           <ReactionPicker visible={showPicker} onSelect={handleReact} />

//           <button
//             className={`${styles.actionBtn} ${post.userReaction ? styles.reacted : ""}`}
//             style={activeReaction ? { color: activeReaction.color } : undefined}
//             onClick={() => handleReact(post.userReaction === "like" ? "like" : "like")}
//             onMouseEnter={() => setShowPicker(true)}
//           >
//             <span>{activeReaction ? activeReaction.emoji : "👍"}</span>
//             {activeReaction ? activeReaction.label : "Like"}
//           </button>
//         </div>

//         <button
//           className={styles.actionBtn}
//           onClick={() => onUpdate({ ...post, showComments: !post.showComments })}
//         >
//           💬 Comment
//         </button>

//         <button className={styles.actionBtn} onClick={handleShare}>
//           🔁 Repost
//         </button>

//         <button className={styles.actionBtn}>📤 Send</button>

//         {shareToast && <div className={styles.shareToast}>Reposted!</div>}
//       </div>

//       {post.showComments && (
//         <div className={styles.comments}>
//           <div className={styles.commentInputRow}>
//             <Avatar src={me.avatar} alt="You" size={36} />

//             <div className={styles.commentInputWrap}>
//               <textarea
//                 className={styles.commentTextarea}
//                 placeholder="Add a comment..."
//                 rows={1}
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     submitComment();
//                   }
//                 }}
//               />

//               {newComment.trim() && (
//                 <button className={styles.commentSubmit} onClick={submitComment}>
//                   Post
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className={styles.commentList}>
//             {post.comments.map((comment) => {
//               const liked = Boolean(commentLikes[comment.id]);
//               const likeCount = comment.likes + (liked ? 1 : 0);

//               return (
//                 <div key={comment.id} className={styles.commentItem}>
//                   <Avatar src={comment.avatar} alt={comment.author} size={36} />

//                   <div className={styles.commentBody}>
//                     <div className={styles.commentBubble}>
//                       <div className={styles.commentAuthor}>{comment.author}</div>
//                       <div className={styles.commentRole}>{comment.role}</div>
//                       <div>{comment.text}</div>
//                     </div>

//                     <div className={styles.commentActions}>
//                       <button
//                         className={liked ? styles.commentLiked : ""}
//                         onClick={() =>
//                           setCommentLikes((prev) => ({
//                             ...prev,
//                             [comment.id]: !prev[comment.id],
//                           }))
//                         }
//                       >
//                         {liked ? "Liked" : "Like"}
//                         {likeCount > 0 ? ` · ${likeCount}` : ""}
//                       </button>
//                       <button>Reply</button>
//                       <span>{comment.time}</span>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </article>
//   );
// }

// function Sidebar() {
//   const trending = [
//     ["AIStrategy", "12,403 posts"],
//     ["FutureOfWork", "8,721 posts"],
//     ["StartupFunding", "6,118 posts"],
//     ["LeadershipTips", "5,240 posts"],
//   ];

//   return (
//     <aside className={styles.sidebar}>
//       <div className={`${styles.sidebarCard} ${styles.profileCard}`}>
//         <div className={styles.profileBanner} />
//         <img src={me.avatar} alt="Profile" className={styles.profileAvatar} />
//         <h3>Alex Johnson</h3>
//         <p>Business Development Lead</p>
//         <p>TechForward Inc.</p>

//         <div className={styles.profileStats}>
//           <div>
//             <strong>847</strong>
//             <span>Connections</span>
//           </div>
//           <div>
//             <strong>3.2K</strong>
//             <span>Post views</span>
//           </div>
//         </div>
//       </div>

//       <div className={styles.sidebarCard}>
//         <h3 className={styles.sidebarTitle}>Trending in Business</h3>
//         {trending.map(([tag, posts]) => (
//           <div key={tag} className={styles.trendingItem}>
//             <strong>#{tag}</strong>
//             <span>{posts}</span>
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// function RightPanel() {
//   const jobs = [
//     ["Head of Growth", "Stripe", "Remote · $180K"],
//     ["Product Manager", "Notion", "NYC · $160K"],
//     ["Strategy Lead", "Figma", "SF · $200K"],
//   ];

//   return (
//     <aside className={styles.rightPanel}>
//       <div className={styles.sidebarCard}>
//         <h3 className={styles.sidebarTitle}>Featured Jobs</h3>
//         {jobs.map(([title, company, location]) => (
//           <div key={title} className={styles.jobItem}>
//             <div>
//               <strong>{title}</strong>
//               <span>{company}</span>
//               <small>{location}</small>
//             </div>
//             <button>Apply</button>
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// export default function HomePage() {
//   const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
//   const [activeNav, setActiveNav] = useState("home");

//   function updatePost(updatedPost: Post) {
//     setPosts((prev) =>
//       prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
//     );
//   }

//   function createPost(content: string) {
//     const nextPost: Post = {
//       id: Date.now(),
//       author: "Alex Johnson",
//       avatar: me.avatar,
//       role: "Business Development Lead",
//       company: "TechForward Inc.",
//       time: "Just now",
//       content,
//       tags: ["Business", "Update"],
//       reactions: { like: 0, love: 0, haha: 0, sad: 0, angry: 0 },
//       userReaction: null,
//       comments: [],
//       shares: 0,
//       showComments: false,
//     };

//     setPosts((prev) => [nextPost, ...prev]);
//   }

//   return (
//     <div className={styles.socialPage}>
//       <nav className={styles.navbar}>
//         <div className={styles.navbarInner}>
//           <div className={styles.logo}>BusinessHub</div>

//           <div className={styles.searchBar}>
//             <input placeholder="Search" />
//           </div>

//           <div className={styles.navItems}>
//             {[
//               ["home", "🏠", "Home"],
//               ["network", "👥", "Network"],
//               ["jobs", "💼", "Jobs"],
//               ["messages", "💬", "Messages"],
//               ["alerts", "🔔", "Alerts"],
//             ].map(([id, icon, label]) => (
//               <button
//                 key={id}
//                 className={`${styles.navItem} ${
//                   activeNav === id ? styles.active : ""
//                 }`}
//                 onClick={() => setActiveNav(id)}
//               >
//                 <span>{icon}</span>
//                 <small>{label}</small>
//               </button>
//             ))}
//           </div>
//         </div>
//       </nav>

//       <main className={styles.pageMain}>
//         <div className={styles.pageLayout}>
//           <Sidebar />

//           <section className={styles.feed}>
//             <Composer onCreate={createPost} />

//             {posts.map((post) => (
//               <PostCard key={post.id} post={post} onUpdate={updatePost} />
//             ))}
//           </section>

//           <RightPanel />
//         </div>
//       </main>
//     </div>
//   );
// }


// "use client";

// import { useState, useRef, useEffect } from "react";
// import styles from "../social.module.css";
// import Image from "next/image";
// import imglogo from "../../../assets/falrex.png"
// import Link from "next/link";

// // ─── Types ────────────────────────────────────────────────────────────────────
// type ReactionType = "like" | "love" | "haha" | "sad" | "angry" | null;

// interface Comment {
//   id: number;
//   author: string;
//   avatar: string;
//   role: string;
//   text: string;
//   time: string;
//   likes: number;
//   liked: boolean;
// }

// interface Post {
//   id: number;
//   author: string;
//   avatar: string;
//   role: string;
//   time: string;
//   content: string;
//   image?: string | null;
//   tags: string[];
//   reactions: Record<string, number>;
//   userReaction: ReactionType;
//   comments: Comment[];
//   shares: number;
//   showComments: boolean;
// }

// // ─── Constants ────────────────────────────────────────────────────────────────
// const REACTIONS = [
//   { type: "like" as ReactionType, emoji: "👍", label: "Like",  color: "#0a66c2" },
//   { type: "love" as ReactionType, emoji: "❤️", label: "Love",  color: "#b24020" },
//   { type: "haha" as ReactionType, emoji: "😄", label: "Haha",  color: "#c49316" },
//   { type: "sad"  as ReactionType, emoji: "😢", label: "Sad",   color: "#c49316" },
//   { type: "angry"as ReactionType, emoji: "😡", label: "Angry", color: "#c0392b" },
// ];

// const INITIAL_POSTS: Post[] = [
//   {
//     id: 1,
//     author: "Akash Hawladar",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4",
//     role: "Chief Strategy Officer · Nexus Ventures",
//     time: "2h",
//     content:
//       "The future of B2B SaaS isn't just about features — it's about creating ecosystems.\n\n🔑 Focus on workflow integration, not standalone tools\n📊 Data portability builds trust AND reduces churn\n🤝 Community-led growth outperforms traditional sales by 3x\n\nThe companies winning in 2025 aren't selling software. They're selling transformation. What's your take?",
//     tags: ["SaaS", "B2B", "ProductStrategy", "Leadership"],
//     reactions: { like: 847, love: 234, haha: 12, sad: 5, angry: 3 },
//     userReaction: null,
//     shares: 156,
//     comments: [
//       {
//         id: 1,
//         author: "Shofiq",
//         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=c0aede",
//         role: "VP of Product at TechCorp",
//         text: "Spot on, Sarah! The ecosystem play is exactly what differentiates Slack from every other messaging tool. Integration depth = switching costs.",
//         time: "1h",
//         likes: 42,
//         liked: false,
//       },
//       {
//         id: 2,
//         author: "Naser Uddin",
//         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya&backgroundColor=ffd5dc",
//         role: "Founder @ GrowthOS",
//         text: "Community-led growth stat is fascinating. We saw similar results — our community members have 40% lower CAC and 2x LTV.",
//         time: "45m",
//         likes: 28,
//         liked: false,
//       },
//     ],
//     showComments: false,
//   },
//   {
//     id: 2,
//     author: "James Okoro",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=d1f4cc",
//     role: "CEO & Co-founder · Meridian AI",
//     time: "5h",
//     content:
//       "We just closed our Series B — $42M to reshape how enterprises use AI for decision-making.\n\nHonest reflection: The hardest part wasn't the fundraise. It was staying focused on customer problems while VCs pushed us toward 'AI-washing' our pitch.\n\nWe kept it simple: We help CFOs reduce forecasting errors by 60%. No buzzwords. Just outcomes.\n\nThank you to our 200+ enterprise customers who believed in us before the hype. 🚀",
//     image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
//     tags: ["SeriesB", "AIStartup", "Fundraising", "FinTech"],
//     reactions: { like: 2341, love: 891, haha: 23, sad: 8, angry: 2 },
//     userReaction: null,
//     shares: 412,
//     comments: [
//       {
//         id: 1,
//         author: "Linda Zhao",
//         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linda&backgroundColor=ffdfbf",
//         role: "Partner at Sequoia",
//         text: "Congratulations James! Your focus on measurable outcomes is exactly why Meridian stood out. Excited for what's next.",
//         time: "4h",
//         likes: 156,
//         liked: false,
//       },
//     ],
//     showComments: false,
//   },
//   {
//     id: 3,
//     author: "Emran Hossen",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena&backgroundColor=ffd5dc",
//     role: "Head of Marketing · Orbit Digital",
//     time: "1d",
//     content:
//       "Unpopular opinion: Most content marketing strategies are broken because they optimize for impressions, not influence.\n\n3 shifts that 10x'd our pipeline in 6 months:\n\n1️⃣ Stopped writing for search engines, started writing for our ICP's Monday morning problems\n2️⃣ Replaced vanity metrics with downstream revenue attribution\n3️⃣ Built a content flywheel — every asset feeds the next\n\nResult: 340% increase in qualified leads, 0% increase in ad spend.",
//     tags: ["ContentMarketing", "B2BMarketing", "GrowthStrategy"],
//     reactions: { like: 1203, love: 445, haha: 67, sad: 14, angry: 89 },
//     userReaction: null,
//     shares: 287,
//     comments: [
//       {
//         id: 1,
//         author: "Tom Bradley",
//         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tom&backgroundColor=b6e3f4",
//         role: "CMO at Scale.io",
//         text: "The 'ICP Monday morning problems' framing is gold. We restructured our entire content calendar around this.",
//         time: "20h",
//         likes: 87,
//         liked: false,
//       },
//       {
//         id: 2,
//         author: "Aisha Patel",
//         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha&backgroundColor=c0aede",
//         role: "Content Director",
//         text: "Revenue attribution for content is so underrated. How are you attributing revenue to specific content pieces?",
//         time: "18h",
//         likes: 63,
//         liked: false,
//       },
//     ],
//     showComments: false,
//   },
// ];

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function formatCount(n: number) {
//   return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
// }

// function topReactions(reactions: Record<string, number>) {
//   return Object.entries(reactions)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 3)
//     .map(([type]) => REACTIONS.find((r) => r.type === type))
//     .filter(Boolean) as typeof REACTIONS;
// }

// function totalReactions(reactions: Record<string, number>) {
//   return Object.values(reactions).reduce((a, b) => a + b, 0);
// }

// // ─── Toast ────────────────────────────────────────────────────────────────────
// function Toast({ message }: { message: string }) {
//   return <div className={styles.toast}>{message}</div>;
// }

// // ─── ExpandableText ───────────────────────────────────────────────────────────
// function ExpandableText({ text }: { text: string }) {
//   const [expanded, setExpanded] = useState(false);
//   const limit = 220;
//   const needs = text.length > limit;
//   const display = needs && !expanded ? text.slice(0, limit) + "…" : text;

//   return (
//     <p style={{ whiteSpace: "pre-line", margin: 0, lineHeight: 1.6 }}>
//       {display}
//       {needs && (
//         <button className={styles.seeMoreBtn} onClick={() => setExpanded((v) => !v)}>
//           {expanded ? " see less" : " …see more"}
//         </button>
//       )}
//     </p>
//   );
// }

// // ─── ReactionPicker ───────────────────────────────────────────────────────────
// function ReactionPicker({
//   visible,
//   onSelect,
//   activeType,
// }: {
//   visible: boolean;
//   onSelect: (r: ReactionType) => void;
//   activeType: ReactionType;
// }) {
//   return (
//     <div
//       className={`${styles.reactionPicker} ${visible ? styles.reactionPickerVisible : ""}`}
//     >
//       {REACTIONS.map((r) => (
//         <button
//           key={r.type}
//           className={`${styles.reactBtn} ${activeType === r.type ? styles.reactBtnActive : ""}`}
//           title={r.label}
//           onClick={(e) => {
//             e.stopPropagation();
//             onSelect(r.type);
//           }}
//         >
//           {r.emoji}
//         </button>
//       ))}
//     </div>
//   );
// }

// // ─── PostCard ─────────────────────────────────────────────────────────────────
// function PostCard({
//   post,
//   onUpdate,
//   showToast,
// }: {
//   post: Post;
//   onUpdate: (p: Post) => void;
//   showToast: (msg: string) => void;
// }) {
//   const [showPicker, setShowPicker] = useState(false);
//   const [commentText, setCommentText] = useState("");
//   const pickerRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     function handleClick(e: MouseEvent) {
//       if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
//         setShowPicker(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = "auto";
//       textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
//     }
//   }, [commentText]);

//   function applyReaction(type: ReactionType) {
//     const updated = { ...post, reactions: { ...post.reactions } };
//     if (post.userReaction === type) {
//       updated.reactions[type!] = Math.max(0, (updated.reactions[type!] || 0) - 1);
//       updated.userReaction = null;
//     } else {
//       if (post.userReaction) {
//         updated.reactions[post.userReaction] = Math.max(
//           0,
//           (updated.reactions[post.userReaction] || 0) - 1
//         );
//       }
//       updated.reactions[type!] = (updated.reactions[type!] || 0) + 1;
//       updated.userReaction = type;
//     }
//     setShowPicker(false);
//     onUpdate(updated);
//   }

//   function handleLikeClick() {
//     if (post.userReaction === "like" || !post.userReaction) {
//       applyReaction("like");
//     } else {
//       setShowPicker((v) => !v);
//     }
//   }

//   function submitComment() {
//     if (!commentText.trim()) return;
//     const newComment: Comment = {
//       id: Date.now(),
//       author: "You",
//       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4",
//       role: "Business Professional",
//       text: commentText.trim(),
//       time: "Just now",
//       likes: 0,
//       liked: false,
//     };
//     onUpdate({ ...post, comments: [...post.comments, newComment], showComments: true });
//     setCommentText("");
//   }

//   function toggleCommentLike(cid: number) {
//     const updated = post.comments.map((c) => {
//       if (c.id !== cid) return c;
//       return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
//     });
//     onUpdate({ ...post, comments: updated });
//   }

//   function handleShare() {
//     onUpdate({ ...post, shares: post.shares + 1 });
//     showToast("Reposted to your network!");
//   }

//   const activeReaction = post.userReaction
//     ? REACTIONS.find((r) => r.type === post.userReaction) ?? null
//     : null;
//   const top = topReactions(post.reactions);

//   return (
//     <article className={styles.postCard}>
//       {/* Header */}
//       <div className={styles.postHeader}>
//         <img src={post.avatar} alt={post.author} className={styles.postAvatar} />
//         <div className={styles.postMeta}>
//           <div className={styles.postAuthor}>{post.author}</div>
//           <div className={styles.postRole}>{post.role}</div>
//           <div className={styles.postTime}>
//             <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
//               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
//             </svg>
//             {post.time} ago
//           </div>
//         </div>
//         <button className={styles.followBtn}>+ Follow</button>
//       </div>

//       {/* Content */}
//       <div className={styles.postContent}>
//         <ExpandableText text={post.content} />
//       </div>

//       {/* Image */}
//       {post.image && (
//         <div className={styles.postImageWrap}>
//           <img src={post.image} alt="Post visual" className={styles.postImage} />
//         </div>
//       )}

//       {/* Tags */}
//       {post.tags.length > 0 && (
//         <div className={styles.postTags}>
//           {post.tags.map((tag) => (
//             <span key={tag} className={styles.tag}>
//               #{tag}
//             </span>
//           ))}
//         </div>
//       )}

//       {/* Reaction summary */}
//       <div className={styles.reactionSummary}>
//         <div className={styles.reactionEmojis}>
//           {top.map((r) => (
//             <span key={r.type} className={styles.summaryEmoji} title={r.label}>
//               {r.emoji}
//             </span>
//           ))}
//           <span className={styles.reactionCount}>
//             {formatCount(totalReactions(post.reactions))}
//           </span>
//         </div>
//         <div className={styles.summaryRight}>
//           <button
//             className={styles.summaryLink}
//             onClick={() => onUpdate({ ...post, showComments: !post.showComments })}
//           >
//             {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
//           </button>
//           <span className={styles.summaryLink}>{formatCount(post.shares)} reposts</span>
//         </div>
//       </div>

//       {/* Action bar */}
//       <div className={styles.actionBar}>
//         {/* Like with reaction picker */}
//         <div ref={pickerRef} className={styles.actionWrap}>
//           <ReactionPicker
//             visible={showPicker}
//             onSelect={applyReaction}
//             activeType={post.userReaction}
//           />
//           <button
//             className={`${styles.actionBtn} ${post.userReaction ? styles.actionBtnReacted : ""}`}
//             style={activeReaction ? { color: activeReaction.color } : undefined}
//             onClick={handleLikeClick}
//             onMouseEnter={() => setShowPicker(true)}
//             onMouseLeave={(e) => {
//               const rel = e.relatedTarget as Node | null;
//               if (!pickerRef.current?.contains(rel)) setShowPicker(false);
//             }}
//           >
//             <span className={styles.actionIcon}>{activeReaction ? activeReaction.emoji : "👍"}</span>
//             <span>{activeReaction ? activeReaction.label : "Like"}</span>
//           </button>
//         </div>

//         <button
//           className={styles.actionBtn}
//           onClick={() => onUpdate({ ...post, showComments: !post.showComments })}
//         >
//           <span className={styles.actionIcon}>💬</span>
//           <span>Comment</span>
//         </button>

//         <button className={styles.actionBtn} onClick={handleShare}>
//           <span className={styles.actionIcon}>🔁</span>
//           <span>Repost</span>
//         </button>

//         <button className={styles.actionBtn}>
//           <span className={styles.actionIcon}>📤</span>
//           <span>Send</span>
//         </button>
//       </div>

//       {/* Comments */}
//       {post.showComments && (
//         <div className={styles.commentsSection}>
//           {/* Input */}
//           <div className={styles.commentInputRow}>
//             <img
//               src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
//               alt="You"
//               className={styles.commentAvatar}
//             />
//             <div className={styles.commentBox}>
//               <textarea
//                 ref={textareaRef}
//                 className={styles.commentTextarea}
//                 placeholder="Add a comment…"
//                 value={commentText}
//                 onChange={(e) => setCommentText(e.target.value)}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     submitComment();
//                   }
//                 }}
//                 rows={1}
//               />
//               {commentText && (
//                 <button className={styles.commentSubmit} onClick={submitComment}>
//                   Post
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* List */}
//           <div className={styles.commentList}>
//             {post.comments.map((c) => (
//               <div key={c.id} className={styles.commentItem}>
//                 <img src={c.avatar} alt={c.author} className={styles.commentAvatar} />
//                 <div className={styles.commentBody}>
//                   <div className={styles.commentBubble}>
//                     <div className={styles.commentAuthor}>{c.author}</div>
//                     <div className={styles.commentRole}>{c.role}</div>
//                     <div className={styles.commentText}>{c.text}</div>
//                   </div>
//                   <div className={styles.commentFooter}>
//                     <button
//                       className={`${styles.commentAction} ${c.liked ? styles.commentActionLiked : ""}`}
//                       onClick={() => toggleCommentLike(c.id)}
//                     >
//                       {c.liked ? "👍 Liked" : "Like"}
//                       {c.likes > 0 && ` · ${formatCount(c.likes)}`}
//                     </button>
//                     <button className={styles.commentAction}>Reply</button>
//                     <span className={styles.commentTime}>{c.time}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </article>
//   );
// }

// // ─── Post Composer Modal ──────────────────────────────────────────────────────
// function PostComposerModal({
//   onClose,
//   onPost,
// }: {
//   onClose: () => void;
//   onPost: (data: { text: string; tags: string[]; image: string | null }) => void;
// }) {
//   const [text, setText] = useState("");
//   const [tags, setTags] = useState("");
//   const [imgUrl, setImgUrl] = useState("");
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     textareaRef.current?.focus();
//   }, []);

//   function handleSubmit() {
//     if (!text.trim()) return;
//     const tagList = tags
//       .split(",")
//       .map((t) => t.trim().replace(/^#/, ""))
//       .filter(Boolean);
//     onPost({ text: text.trim(), tags: tagList, image: imgUrl.trim() || null });
//     onClose();
//   }

//   return (
//     <div
//       className={styles.modalBg}
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div className={styles.modal}>
//         <div className={styles.modalHeader}>
//           <div className={styles.modalUser}>
//             <img
//               src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
//               alt="You"
//               className={styles.modalAvatar}
//             />
//             <div>
//               <div className={styles.modalUserName}>Alex Johnson</div>
//               <div className={styles.modalUserSub}>Post to Anyone</div>
//             </div>
//           </div>
//           <button className={styles.modalCloseBtn} onClick={onClose} aria-label="Close">
//             ×
//           </button>
//         </div>

//         <textarea
//           ref={textareaRef}
//           className={styles.postTextarea}
//           placeholder="What do you want to talk about?"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//         />

//         <input
//           className={styles.modalTagInput}
//           placeholder="Tags (comma-separated): SaaS, Leadership, AI"
//           value={tags}
//           onChange={(e) => setTags(e.target.value)}
//         />

//         <input
//           className={styles.modalImgInput}
//           placeholder="Image URL (optional)"
//           value={imgUrl}
//           onChange={(e) => setImgUrl(e.target.value)}
//         />

//         <div className={styles.modalFooter}>
//           <button className={styles.btnSecondary} onClick={onClose}>
//             Cancel
//           </button>
//           <button className={styles.btnPrimary} disabled={!text.trim()} onClick={handleSubmit}>
//             Post
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Sidebar ──────────────────────────────────────────────────────────────────
// function Sidebar() {
//   const people = [
//     { name: "Diana Fox",    role: "CMO at Pulse",       seed: "diana",  bg: "ffd5dc" },
//     { name: "Raj Mehta",   role: "Founder, BuildCo",   seed: "raj",    bg: "c0aede" },
//     { name: "Sophie Turner",role: "VC Partner",         seed: "sophie", bg: "d1f4cc" },
//   ];

//   const trends = [
//     { tag: "AIStrategy",    count: "12.4K posts" },
//     { tag: "FutureOfWork",  count: "8.7K posts"  },
//     { tag: "StartupFunding",count: "6.1K posts"  },
//     { tag: "LeadershipTips",count: "5.2K posts"  },
//     { tag: "ProductLaunch", count: "4.9K posts"  },
//   ];

//   return (
//     <aside className={styles.sidebar}>
//       {/* Profile */}
//       <div className={styles.sidebarCard}>
//         <div className={styles.profileBanner} />
//         <img
//           src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
//           alt="Profile"
//           className={styles.profileAvatar}
//         />
//         <div className={styles.profileBody}>
//           <div className={styles.profileName}>Alex Johnson</div>
//           <div className={styles.profileTitle}>Business Development Lead · TechForward Inc.</div>
//         </div>
//         <div className={styles.profileStats}>
//           <div className={styles.profileStat}>
//             <span className={styles.statNum}>847</span>
//             Connections
//           </div>
//           <div className={styles.profileStat}>
//             <span className={styles.statNum}>3.2K</span>
//             Post views
//           </div>
//         </div>
//         <button className={styles.premiumBtn}>✨ Try Premium free</button>
//       </div>

//       {/* Trending */}
//       <div className={styles.sidebarCard}>
//         <div className={styles.sidebarTitle}>Trending in Business</div>
//         {trends.map((t) => (
//           <div key={t.tag} className={styles.trendItem}>
//             <div className={styles.trendTag}>#{t.tag}</div>
//             <div className={styles.trendCount}>{t.count}</div>
//           </div>
//         ))}
//       </div>

//       {/* People */}
//       <div className={styles.sidebarCard}>
//         <div className={styles.sidebarTitle}>People you may know</div>
//         {people.map((p) => (
//           <div key={p.name} className={styles.peopleItem}>
//             <img
//               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.seed}&backgroundColor=${p.bg}`}
//               alt={p.name}
//               className={styles.peopleAvatar}
//             />
//             <div className={styles.peopleInfo}>
//               <div className={styles.peopleName}>{p.name}</div>
//               <div className={styles.peopleRole}>{p.role}</div>
//             </div>
//             <button className={styles.connectBtn}>Connect</button>
//           </div>
//         ))}
//       </div>
//     </aside>
//   );
// }

// // ─── Right Panel ──────────────────────────────────────────────────────────────
// function RightPanel() {
//   const jobs = [
//     { title: "Head of Growth",  company: "Stripe", loc: "Remote · $180K", logo: "🟦" },
//     { title: "Product Manager", company: "Notion", loc: "NYC · $160K",    logo: "⬜" },
//     { title: "Strategy Lead",   company: "Figma",  loc: "SF · $200K",     logo: "🟣" },
//   ];

//   const events = [
//     { name: "SaaS Growth Summit",       date: "May 12", att: "1.2K" },
//     { name: "AI for Business Leaders",  date: "May 18", att: "890"  },
//     { name: "Founder Fireside Chat",    date: "Jun 2",  att: "560"  },
//   ];

//   return (
//     <div className={styles.rightPanel}>
//       <div className={styles.sidebarCard}>
//         <div className={styles.sidebarTitle}>Featured Jobs</div>
//         {jobs.map((j) => (
//           <div key={j.title} className={styles.jobItem}>
//             <div className={styles.jobLogo}>{j.logo}</div>
//             <div className={styles.jobInfo}>
//               <div className={styles.jobTitle}>{j.title}</div>
//               <div className={styles.jobMeta}>{j.company}</div>
//               <div className={styles.jobMeta}>{j.loc}</div>
//             </div>
//             <button className={styles.applyBtn}>Apply</button>
//           </div>
//         ))}
//       </div>

//       <div className={styles.sidebarCard}>
//         <div className={styles.sidebarTitle}>Upcoming Events</div>
//         {events.map((e) => (
//           <div key={e.name} className={styles.eventItem}>
//             <div className={styles.eventDate}>{e.date}</div>
//             <div>
//               <div className={styles.eventName}>{e.name}</div>
//               <div className={styles.eventAttendees}>{e.att} attending</div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function HomePage() {
//   const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
//   const [activeNav, setActiveNav] = useState("home");
//   const [showModal, setShowModal] = useState(false);
//   const [toast, setToast] = useState<string | null>(null);
//   const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

//   function triggerToast(msg: string) {
//     if (toastTimer.current) clearTimeout(toastTimer.current);
//     setToast(msg);
//     toastTimer.current = setTimeout(() => setToast(null), 2400);
//   }

//   function updatePost(updated: Post) {
//     setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
//   }

//   function createPost({
//     text,
//     tags,
//     image,
//   }: {
//     text: string;
//     tags: string[];
//     image: string | null;
//   }) {
//     const newPost: Post = {
//       id: Date.now(),
//       author: "Alex Johnson",
//       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4",
//       role: "Business Development Lead · TechForward Inc.",
//       time: "Just now",
//       content: text,
//       image,
//       tags,
//       reactions: { like: 0, love: 0, haha: 0, sad: 0, angry: 0 },
//       userReaction: null,
//       shares: 0,
//       comments: [],
//       showComments: false,
//     };
//     setPosts((prev) => [newPost, ...prev]);
//     triggerToast("Post published successfully!");
//   }

//   const navItems = [
//     { id: "home",          icon: "🏠", label: "Home"     },
//     { id: "network",       icon: "👥", label: "Network"  },
//     { id: "jobs",          icon: "💼", label: "Jobs"     },
//     { id: "messages",      icon: "💬", label: "Messages" },
//     { id: "notifications", icon: "🔔", label: "Alerts"   },
//   ];

//   return (
//     <div className={styles.root}>
//       {/* ─── Navbar ─── */}
//       <nav className={styles.navbar}>
//         <div className={styles.navbarInner}>
//           {/* Logo */}
//           <Link href="/" className={styles.logo}>

//             <svg viewBox="0 0 34 34" width="28" height="28">
//               <path
//                 d="M34,2.5v29A2.5,2.5,0,0,1,31.5,34H2.5A2.5,2.5,0,0,1,0,31.5V2.5A2.5,2.5,0,0,1,2.5,0h29A2.5,2.5,0,0,1,34,2.5Z"
//                 fill="#4c1de7"
//               />
//               <path
//                 d="M7.5,14h3.5v11H7.5Zm1.75-5.5A2,2,0,1,1,7.25,10.5,2,2,0,0,1,9.25,8.5ZM15,14h3.35v1.5h.05A3.67,3.67,0,0,1,21.7,13.7c3.52,0,4.17,2.32,4.17,5.33V25H22.37V19.73c0-1.24,0-2.84-1.73-2.84s-2,1.35-2,2.75V25H15Z"
//                 fill="white"
//               />
//             </svg>
//             BusinessHub
//           </Link>

//           {/* Search */}
//           <div className={styles.searchBar}>
//             <svg width="15" height="15" viewBox="0 0 24 24" fill="#888">
//               <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
//             </svg>
//             <input className={styles.searchInput} placeholder="Search" />
//           </div>

//           {/* Nav items */}
//           <div className={styles.navbarNav}>
//             {navItems.map((item) => (
//               <button
//                 key={item.id}
//                 className={`${styles.navBtn} ${activeNav === item.id ? styles.navBtnActive : ""}`}
//                 onClick={() => setActiveNav(item.id)}
//               >
//                 <span className={styles.navIcon}>{item.icon}</span>
//                 <span>{item.label}</span>
//               </button>
//             ))}
//             <button className={styles.navMe}>
//               <img
//                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
//                 alt="Me"
//                 className={styles.navMeAvatar}
//               />
//               <span>Me ▾</span>
//             </button>
//           </div>
//         </div>
//       </nav>

//       {/* ─── Body ─── */}
//       <main className={styles.pageMain}>
//         <div className={styles.pageLayout}>
//           <Sidebar />

//           {/* Feed */}
//           <section className={styles.feed}>
//             {/* Composer */}
//             <div className={styles.composer}>
//               <div className={styles.composerRow}>
//                 <img
//                   src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
//                   alt="You"
//                   className={styles.composerAvatar}
//                 />
//                 <button
//                   className={styles.composerInputBtn}
//                   onClick={() => setShowModal(true)}
//                 >
//                   Start a post, try writing with AI
//                 </button>
//               </div>
//               <div className={styles.composerActions}>
//                 <button className={styles.composerAction} onClick={() => setShowModal(true)}>
//                   🖼️ Photo
//                 </button>
//                 <button className={styles.composerAction} onClick={() => setShowModal(true)}>
//                   🎥 Video
//                 </button>
//                 <button className={styles.composerAction} onClick={() => setShowModal(true)}>
//                   📝 Write article
//                 </button>
//               </div>
//             </div>

//             {/* Posts */}
//             {posts.map((post) => (
//               <PostCard
//                 key={post.id}
//                 post={post}
//                 onUpdate={updatePost}
//                 showToast={triggerToast}
//               />
//             ))}
//           </section>

//           <RightPanel />
//         </div>
//       </main>

//       {/* ─── Modal ─── */}
//       {showModal && (
//         <PostComposerModal onClose={() => setShowModal(false)} onPost={createPost} />
//       )}

//       {/* ─── Toast ─── */}
//       {toast && <Toast message={toast} />}
//     </div>
//   );
// }


"use client";

import { useState, useRef, useEffect } from "react";
import styles from "../social/social.module.css";
import Link from "next/link";
import logoe from "../../../assets/falrex2.png"
import Image from "next/image";

type ReactionType = "like" | "love" | "haha" | "sad" | "angry";
type UserReaction = ReactionType | null;
type MediaType = "image" | "video";

interface MediaItem {
  type: MediaType;
  url: string;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  role: string;
  text: string;
  media?: MediaItem | null;
  time: string;
  likes: number;
  liked: boolean;
}

interface Post {
  id: number;
  author: string;
  avatar: string;
  role: string;
  time: string;
  content: string;
  media?: MediaItem | null;
  tags: string[];
  reactions: Record<ReactionType, number>;
  userReaction: UserReaction;
  comments: Comment[];
  shares: number;
  showComments: boolean;
}

const REACTIONS: {
  type: ReactionType;
  emoji: string;
  label: string;
  color: string;
}[] = [
    { type: "like", emoji: "👍", label: "Like", color: "#0a66c2" },
    { type: "love", emoji: "❤️", label: "Love", color: "#b24020" },
    { type: "haha", emoji: "😄", label: "Haha", color: "#c49316" },
    { type: "sad", emoji: "😢", label: "Sad", color: "#c49316" },
    { type: "angry", emoji: "😡", label: "Angry", color: "#c0392b" },
  ];

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "Akash Hawladar",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4",
    role: "Chief Strategy Officer · Nexus Ventures",
    time: "2h",
    content:
      "The future of B2B SaaS isn't just about features — it's about creating ecosystems.\n\n🔑 Focus on workflow integration, not standalone tools\n📊 Data portability builds trust AND reduces churn\n🤝 Community-led growth outperforms traditional sales by 3x\n\nThe companies winning in 2025 aren't selling software. They're selling transformation. What's your take?",
    media: null,
    tags: ["SaaS", "B2B", "ProductStrategy", "Leadership"],
    reactions: { like: 847, love: 234, haha: 12, sad: 5, angry: 3 },
    userReaction: null,
    shares: 156,
    comments: [
      {
        id: 1,
        author: "Shofiq",
        avatar:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=c0aede",
        role: "VP of Product at TechCorp",
        text: "Spot on! The ecosystem play is exactly what differentiates Slack from every other messaging tool.",
        media: null,
        time: "1h",
        likes: 42,
        liked: false,
      },
    ],
    showComments: false,
  },
  {
    id: 2,
    author: "James Bond",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=d1f4cc",
    role: "CEO & Co-founder · Meridian AI",
    time: "5h",
    content:
      "We just closed our Series B — $42M to reshape how enterprises use AI for decision-making.\n\nWe kept it simple: We help CFOs reduce forecasting errors by 60%. No buzzwords. Just outcomes.",
    media: {
      type: "image",
      url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    },
    tags: ["SeriesB", "AIStartup", "Fundraising", "FinTech"],
    reactions: { like: 2341, love: 891, haha: 23, sad: 8, angry: 2 },
    userReaction: null,
    shares: 412,
    comments: [],
    showComments: false,
  },
];

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function totalReactions(reactions: Record<ReactionType, number>) {
  return Object.values(reactions).reduce((a, b) => a + b, 0);
}

function topReactions(reactions: Record<ReactionType, number>) {
  return Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([type]) => REACTIONS.find((r) => r.type === type))
    .filter(Boolean) as typeof REACTIONS;
}

function Toast({ message }: { message: string }) {
  return <div className={styles.toast}>{message}</div>;
}

function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 220;
  const needsExpand = text.length > limit;
  const displayText =
    needsExpand && !expanded ? `${text.slice(0, limit)}...` : text;

  return (
    <p style={{ whiteSpace: "pre-line", margin: 0, lineHeight: 1.6 }}>
      {displayText}
      {needsExpand && (
        <button
          type="button"
          className={styles.seeMoreBtn}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? " see less" : " see more"}
        </button>
      )}
    </p>
  );
}

function MediaPreview({
  media,
  className,
}: {
  media: MediaItem;
  className?: string;
}) {
  if (media.type === "video") {
    return <video src={media.url} className={className} controls />;
  }

  return <Image width={10} height={10} src={media.url} alt="Media" className={className} />;
}

function ReactionPicker({
  visible,
  onSelect,
  activeType,
}: {
  visible: boolean;
  onSelect: (reaction: ReactionType) => void;
  activeType: UserReaction;
}) {
  return (
    <div
      className={`${styles.reactionPicker} ${visible ? styles.reactionPickerVisible : ""
        }`}
    >
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.type}
          type="button"
          className={`${styles.reactBtn} ${activeType === reaction.type ? styles.reactBtnActive : ""
            }`}
          title={reaction.label}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(reaction.type);
          }}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

function PostCard({
  post,
  onUpdate,
  showToast,
}: {
  post: Post;
  onUpdate: (post: Post) => void;
  showToast: (message: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentMediaUrl, setCommentMediaUrl] = useState("");
  const [commentMediaType, setCommentMediaType] =
    useState<MediaType>("image");

  const pickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [commentText]);

  function applyReaction(type: ReactionType) {
    const reactions = { ...post.reactions };
    const previousReaction = post.userReaction;

    if (previousReaction === type) {
      reactions[type] = Math.max(0, reactions[type] - 1);
      onUpdate({ ...post, reactions, userReaction: null });
      setShowPicker(false);
      return;
    }

    if (previousReaction) {
      reactions[previousReaction] = Math.max(
        0,
        reactions[previousReaction] - 1
      );
    }

    reactions[type] = reactions[type] + 1;

    onUpdate({
      ...post,
      reactions,
      userReaction: type,
    });

    setShowPicker(false);
  }

  function handleLikeClick() {
    applyReaction(post.userReaction ?? "like");
  }

  function submitComment() {
    if (!commentText.trim() && !commentMediaUrl.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: "You",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4",
      role: "Business Professional",
      text: commentText.trim(),
      media: commentMediaUrl.trim()
        ? {
          type: commentMediaType,
          url: commentMediaUrl.trim(),
        }
        : null,
      time: "Just now",
      likes: 0,
      liked: false,
    };

    onUpdate({
      ...post,
      comments: [...post.comments, newComment],
      showComments: true,
    });

    setCommentText("");
    setCommentMediaUrl("");
  }

  function toggleCommentLike(commentId: number) {
    const comments = post.comments.map((comment) => {
      if (comment.id !== commentId) return comment;

      return {
        ...comment,
        liked: !comment.liked,
        likes: comment.liked
          ? Math.max(0, comment.likes - 1)
          : comment.likes + 1,
      };
    });

    onUpdate({ ...post, comments });
  }

  function handleShare() {
    onUpdate({ ...post, shares: post.shares + 1 });
    showToast("Reposted to your network!");
  }

  const activeReaction = post.userReaction
    ? REACTIONS.find((reaction) => reaction.type === post.userReaction)
    : null;

  const top = topReactions(post.reactions);

  return (
    <article className={styles.postCard}>
      <div className={styles.postHeader}>
        <Image width={10} height={10} src={post.avatar} alt={post.author} className={styles.postAvatar} />

        <div className={styles.postMeta}>
          <div className={styles.postAuthor}>{post.author}</div>
          <div className={styles.postRole}>{post.role}</div>
          <div className={styles.postTime}>{post.time} ago</div>
        </div>

        <button type="button" className={styles.followBtn}>
          + Follow
        </button>
      </div>

      <div className={styles.postContent}>
        <ExpandableText text={post.content} />
      </div>

      {post.media && (
        <div className={styles.postImageWrap}>
          <MediaPreview media={post.media} className={styles.postImage} />
        </div>
      )}

      {post.tags.length > 0 && (
        <div className={styles.postTags}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className={styles.reactionSummary}>
        <div className={styles.reactionEmojis}>
          {top.map((reaction) => (
            <span
              key={reaction.type}
              className={styles.summaryEmoji}
              title={reaction.label}
            >
              {reaction.emoji}
            </span>
          ))}

          <span className={styles.reactionCount}>
            {formatCount(totalReactions(post.reactions))}
          </span>
        </div>

        <div className={styles.summaryRight}>
          <button
            type="button"
            className={styles.summaryLink}
            onClick={() =>
              onUpdate({ ...post, showComments: !post.showComments })
            }
          >
            {post.comments.length} comment
            {post.comments.length !== 1 ? "s" : ""}
          </button>

          <span className={styles.summaryLink}>
            {formatCount(post.shares)} reposts
          </span>
        </div>
      </div>

      <div className={styles.actionBar}>
        <div ref={pickerRef} className={styles.actionWrap}>
          <ReactionPicker
            visible={showPicker}
            onSelect={applyReaction}
            activeType={post.userReaction}
          />

          <button
            type="button"
            className={`${styles.actionBtn} ${post.userReaction ? styles.actionBtnReacted : ""
              }`}
            style={activeReaction ? { color: activeReaction.color } : undefined}
            onClick={handleLikeClick}
            onMouseEnter={() => setShowPicker(true)}
          >
            <span className={styles.actionIcon}>
              {activeReaction ? activeReaction.emoji : "👍"}
            </span>
            <span>{activeReaction ? activeReaction.label : "Like"}</span>
          </button>
        </div>

        <button
          type="button"
          className={styles.actionBtn}
          onClick={() =>
            onUpdate({ ...post, showComments: !post.showComments })
          }
        >
          <span className={styles.actionIcon}>💬</span>
          <span>Comment</span>
        </button>

        <button type="button" className={styles.actionBtn} onClick={handleShare}>
          <span className={styles.actionIcon}>🔁</span>
          <span>Repost</span>
        </button>

        <button type="button" className={styles.actionBtn}>
          <span className={styles.actionIcon}>📤</span>
          <span>Send</span>
        </button>
      </div>

      {post.showComments && (
        <div className={styles.commentsSection}>
          <div className={styles.commentInputRow}>
            <Image
            width={10}
            height={10}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
              alt="You"
              className={styles.commentAvatar}
            />

            <div className={styles.commentBox}>
              <textarea
                ref={textareaRef}
                className={styles.commentTextarea}
                placeholder="Add a comment..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    submitComment();
                  }
                }}
                rows={1}
              />

              <div className={styles.commentMediaRow}>
                <select
                  className={styles.commentMediaSelect}
                  value={commentMediaType}
                  onChange={(event) =>
                    setCommentMediaType(event.target.value as MediaType)
                  }
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>

                <input
                  className={styles.commentMediaInput}
                  placeholder="Paste image or video URL"
                  value={commentMediaUrl}
                  onChange={(event) => setCommentMediaUrl(event.target.value)}
                />
              </div>

              {(commentText.trim() || commentMediaUrl.trim()) && (
                <button
                  type="button"
                  className={styles.commentSubmit}
                  onClick={submitComment}
                >
                  Post
                </button>
              )}
            </div>
          </div>

          <div className={styles.commentList}>
            {post.comments.map((comment) => (
              <div key={comment.id} className={styles.commentItem}>
                <Image
                width={10}
                height={10}
                  src={comment.avatar}
                  alt={comment.author}
                  className={styles.commentAvatar}
                />

                <div className={styles.commentBody}>
                  <div className={styles.commentBubble}>
                    <div className={styles.commentAuthor}>
                      {comment.author}
                    </div>
                    <div className={styles.commentRole}>{comment.role}</div>

                    {comment.text && (
                      <div className={styles.commentText}>{comment.text}</div>
                    )}

                    {comment.media && (
                      <div className={styles.commentMediaPreview}>
                        <MediaPreview media={comment.media} />
                      </div>
                    )}
                  </div>

                  <div className={styles.commentFooter}>
                    <button
                      type="button"
                      className={`${styles.commentAction} ${comment.liked ? styles.commentActionLiked : ""
                        }`}
                      onClick={() => toggleCommentLike(comment.id)}
                    >
                      {comment.liked ? "👍 Liked" : "Like"}
                      {comment.likes > 0 && ` · ${formatCount(comment.likes)}`}
                    </button>

                    <button type="button" className={styles.commentAction}>
                      Reply
                    </button>

                    <span className={styles.commentTime}>{comment.time}</span>
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

function PostComposerModal({
  onClose,
  onPost,
}: {
  onClose: () => void;
  onPost: (data: {
    text: string;
    tags: string[];
    media: MediaItem | null;
  }) => void;
}) {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("image");
  const [mediaUrl, setMediaUrl] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  function handleSubmit() {
    if (!text.trim()) return;

    const tagList = tags
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);

    onPost({
      text: text.trim(),
      tags: tagList,
      media: mediaUrl.trim()
        ? {
          type: mediaType,
          url: mediaUrl.trim(),
        }
        : null,
    });

    onClose();
  }

  return (
    <div
      className={styles.modalBg}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalUser}>
            <Image
            width={10}
            height={10}
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
              alt="You"
              className={styles.modalAvatar}
            />

            <div>
              <div className={styles.modalUserName}>Habibullah Ozy</div>
              <div className={styles.modalUserSub}>Post to Anyone</div>
            </div>
          </div>

          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className={styles.postTextarea}
          placeholder="What do you want to talk about?"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <input
          className={styles.modalTagInput}
          placeholder="Tags comma-separated: SaaS, Leadership, AI"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />

        <select
          className={styles.modalImgInput}
          value={mediaType}
          onChange={(event) => setMediaType(event.target.value as MediaType)}
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        <input
          className={styles.modalImgInput}
          placeholder="Image or video URL optional"
          value={mediaUrl}
          onChange={(event) => setMediaUrl(event.target.value)}
        />

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            disabled={!text.trim()}
            onClick={handleSubmit}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const people = [
    { name: "Diana Fox", role: "CMO at Pulse", seed: "diana", bg: "ffd5dc" },
    { name: "Raj Mehta", role: "Founder, BuildCo", seed: "raj", bg: "c0aede" },
    {
      name: "Sophie Turner",
      role: "VC Partner",
      seed: "sophie",
      bg: "d1f4cc",
    },
  ];

  const trends = [
    { tag: "AIStrategy", count: "12.4K posts" },
    { tag: "FutureOfWork", count: "8.7K posts" },
    { tag: "StartupFunding", count: "6.1K posts" },
    { tag: "LeadershipTips", count: "5.2K posts" },
    { tag: "ProductLaunch", count: "4.9K posts" },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <div className={styles.profileBanner} />

        <Image
        width={10}
        height={10}
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
          alt="Profile"
          className={styles.profileAvatar}
        />

        <div className={styles.profileBody}>
          <div className={styles.profileName}>Alex Johnson</div>
          <div className={styles.profileTitle}>
            Business Development Lead · TechForward Inc.
          </div>
        </div>

        <div className={styles.profileStats}>
          <div className={styles.profileStat}>
            <span className={styles.statNum}>847</span>
            Connections
          </div>

          <div className={styles.profileStat}>
            <span className={styles.statNum}>3.2K</span>
            Post views
          </div>
        </div>

        <button type="button" className={styles.premiumBtn}>
          ✨ Try Premium free
        </button>
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>Trending in Business</div>

        {trends.map((trend) => (
          <div key={trend.tag} className={styles.trendItem}>
            <div className={styles.trendTag}>#{trend.tag}</div>
            <div className={styles.trendCount}>{trend.count}</div>
          </div>
        ))}
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>People you may know</div>

        {people.map((person) => (
          <div key={person.name} className={styles.peopleItem}>
            <Image
            width={10}
            height={10}
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${person.seed}&backgroundColor=${person.bg}`}
              alt={person.name}
              className={styles.peopleAvatar}
            />

            <div className={styles.peopleInfo}>
              <div className={styles.peopleName}>{person.name}</div>
              <div className={styles.peopleRole}>{person.role}</div>
            </div>

            <button type="button" className={styles.connectBtn}>
              Connect
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}

function RightPanel() {
  const jobs = [
    { title: "Head of Growth", company: "Stripe", loc: "Remote · $180K", logo: "🟦" },
    { title: "Product Manager", company: "Notion", loc: "NYC · $160K", logo: "⬜" },
    { title: "Strategy Lead", company: "Figma", loc: "SF · $200K", logo: "🟣" },
  ];

  const events = [
    { name: "SaaS Growth Summit", date: "May 12", att: "1.2K" },
    { name: "AI for Business Leaders", date: "May 18", att: "890" },
    { name: "Founder Fireside Chat", date: "Jun 2", att: "560" },
  ];

  return (
    <div className={styles.rightPanel}>
      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>Featured Jobs</div>

        {jobs.map((job) => (
          <div key={job.title} className={styles.jobItem}>
            <div className={styles.jobLogo}>{job.logo}</div>

            <div className={styles.jobInfo}>
              <div className={styles.jobTitle}>{job.title}</div>
              <div className={styles.jobMeta}>{job.company}</div>
              <div className={styles.jobMeta}>{job.loc}</div>
            </div>

            <button type="button" className={styles.applyBtn}>
              Apply
            </button>
          </div>
        ))}
      </div>

      <div className={styles.sidebarCard}>
        <div className={styles.sidebarTitle}>Upcoming Events</div>

        {events.map((event) => (
          <div key={event.name} className={styles.eventItem}>
            <div className={styles.eventDate}>{event.date}</div>

            <div>
              <div className={styles.eventName}>{event.name}</div>
              <div className={styles.eventAttendees}>
                {event.att} attending
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [activeNav, setActiveNav] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function triggerToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);

    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  function updatePost(updatedPost: Post) {
    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post
      )
    );
  }

  function createPost({
    text,
    tags,
    media,
  }: {
    text: string;
    tags: string[];
    media: MediaItem | null;
  }) {
    const newPost: Post = {
      id: Date.now(),
      author: "Habibullah Ozy",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4",
      role: "Business Development Lead · TechForward Inc.",
      time: "Just now",
      content: text,
      media,
      tags,
      reactions: { like: 0, love: 0, haha: 0, sad: 0, angry: 0 },
      userReaction: null,
      shares: 0,
      comments: [],
      showComments: false,
    };

    setPosts((previousPosts) => [newPost, ...previousPosts]);
    triggerToast("Post published successfully!");
  }

  const navItems = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "network", icon: "👥", label: "Network" },
    { id: "jobs", icon: "💼", label: "Jobs" },
    { id: "messages", icon: "💬", label: "Messages" },
    { id: "notifications", icon: "🔔", label: "Alerts" },
  ];

  return (
    <div className={styles.root}>
      <nav className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link href="/" className={styles.logo}>

            <Image width={10} height={10} src={logoe} alt="logo" className="w-16" />

            FalRex
          </Link>

          <div className={styles.searchBar}>
            <input className={styles.searchInput} placeholder="Search" />
          </div>

          <div className={styles.navbarNav}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.navBtn} ${activeNav === item.id ? styles.navBtnActive : ""
                  }`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <button type="button" className={styles.navMe}>
              <Image
              width={10}
              height={10}
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
                alt="Me"
                className={styles.navMeAvatar}
              />
              <span>Me ▾</span>
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.pageMain}>
        <div className={styles.pageLayout}>
          <Sidebar />

          <section className={styles.feed}>
            <div className={styles.composer}>
              <div className={styles.composerRow}>
                <Image
                width={10}
                height={10}
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=you&backgroundColor=b6e3f4"
                  alt="You"
                  className={styles.composerAvatar}
                />

                <button
                  type="button"
                  className={styles.composerInputBtn}
                  onClick={() => setShowModal(true)}
                >
                  Start a post, try writing with AI
                </button>
              </div>

              <div className={styles.composerActions}>
                <button
                  type="button"
                  className={styles.composerAction}
                  onClick={() => setShowModal(true)}
                >
                  🖼️ Photo
                </button>

                <button
                  type="button"
                  className={styles.composerAction}
                  onClick={() => setShowModal(true)}
                >
                  🎥 Video
                </button>

                <button
                  type="button"
                  className={styles.composerAction}
                  onClick={() => setShowModal(true)}
                >
                  📝 Write article
                </button>
              </div>
            </div>

            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onUpdate={updatePost}
                showToast={triggerToast}
              />
            ))}
          </section>

          <RightPanel />
        </div>
      </main>

      {showModal && (
        <PostComposerModal
          onClose={() => setShowModal(false)}
          onPost={createPost}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}