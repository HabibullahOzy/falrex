// export type ReactionType = "like" | "love" | "haha" | "sad" | "angry" | null;

// export interface Comment {
//   id: number;
//   author: string;
//   avatar: string;
//   role: string;
//   text: string;
//   time: string;
//   likes: number;
// }

// export interface Post {
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

// export const REACTIONS = [
//   { type: "like" as ReactionType, emoji: "👍", label: "Like", color: "#0a66c2" },
//   { type: "love" as ReactionType, emoji: "❤️", label: "Love", color: "#df704d" },
//   { type: "haha" as ReactionType, emoji: "😄", label: "Haha", color: "#f5c75d" },
//   { type: "sad" as ReactionType, emoji: "😢", label: "Sad", color: "#f5c75d" },
//   { type: "angry" as ReactionType, emoji: "😡", label: "Angry", color: "#e05b43" },
// ];

// export const INITIAL_POSTS: Post[] = [
//   {
//     id: 1,
//     author: "Sarah Chen",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah&backgroundColor=b6e3f4",
//     role: "Chief Strategy Officer",
//     company: "Nexus Ventures",
//     time: "2h",
//     content:
//       "The future of B2B SaaS isn't just about features — it's about creating ecosystems.\n\nFocus on workflow integration, data portability, and community-led growth.",
//     tags: ["SaaS", "B2B", "ProductStrategy", "Leadership"],
//     reactions: { like: 847, love: 234, haha: 12, sad: 5, angry: 3 },
//     userReaction: null,
//     shares: 156,
//     comments: [
//       {
//         id: 1,
//         author: "Marcus Webb",
//         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus&backgroundColor=c0aede",
//         role: "VP of Product at TechCorp",
//         text: "Spot on. Integration depth creates real retention.",
//         time: "1h",
//         likes: 42,
//       },
//     ],
//     showComments: false,
//   },
//   {
//     id: 2,
//     author: "James Okoro",
//     avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james&backgroundColor=d1f4cc",
//     role: "CEO & Co-founder",
//     company: "Meridian AI",
//     time: "5h",
//     content:
//       "We just closed our Series B — $42M to reshape how enterprises use AI for decision-making.\n\nNo buzzwords. Just outcomes.",
//     image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
//     tags: ["SeriesB", "AIStartup", "Fundraising", "FinTech"],
//     reactions: { like: 2341, love: 891, haha: 23, sad: 8, angry: 2 },
//     userReaction: null,
//     shares: 412,
//     comments: [],
//     showComments: false,
//   },
// ];
