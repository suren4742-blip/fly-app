
import { MusicGenre, Artist, Format, VideoPlatform, VideoFeature, TextCategory, ImageCategory } from './types';

export const GENRES: MusicGenre[] = [
  { id: 'pop', name: 'Pop', icon: '🎤', description: 'Catchy melodies and widespread appeal.', color: 'from-pink-500 to-rose-500' },
  { id: 'rock', name: 'Rock', icon: '🎸', description: 'High energy with electric guitars and drums.', color: 'from-orange-500 to-red-600' },
  { id: 'classical', name: 'Classical', icon: '🎹', description: 'Sophisticated compositions from various eras.', color: 'from-amber-500 to-yellow-600' },
  { id: 'edm', name: 'Electronic', icon: '🎧', description: 'Digital beats designed for the dance floor.', color: 'from-blue-500 to-cyan-500' },
  { id: 'hiphop', name: 'Hip-Hop', icon: '🎶', description: 'Rhythmic speech and street-culture influence.', color: 'from-purple-500 to-indigo-600' },
  { id: 'jazz', name: 'Jazz', icon: '🎻', description: 'Improvisation and complex harmony.', color: 'from-emerald-500 to-teal-600' },
];

export const ARTISTS: Artist[] = [
  { 
    name: 'Michael Jackson', 
    image: 'https://images.unsplash.com/photo-1549834125-82d3c48159a3?auto=format&fit=crop&q=80&w=400&h=300', 
    tag: 'King of Pop', 
    notableWork: 'Thriller' 
  },
  { 
    name: 'Taylor Swift', 
    image: 'https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=400&h=300', 
    tag: 'Global Icon', 
    notableWork: '1989' 
  },
  { 
    name: 'A. R. Rahman', 
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400&h=300', 
    tag: 'Mozart of Madras', 
    notableWork: 'Slumdog Millionaire' 
  },
];

export const FORMATS: Format[] = [
  { type: 'MP3', description: 'Most popular compressed audio', quality: 'Medium', category: 'Audio' },
  { type: 'FLAC', description: 'Lossless audio compression', quality: 'Lossless', category: 'Audio' },
  { type: 'MP4', description: 'Most widely supported video', quality: 'High', category: 'Video' },
  { type: 'JPG', description: 'Standard for digital photos', quality: 'Medium', category: 'Image' },
  { type: 'PNG', description: 'Supports transparent background', quality: 'High', category: 'Image' },
  { type: 'WebP', description: 'Modern web-optimized image', quality: 'High', category: 'Image' },
];

export const VIDEO_PLATFORMS: VideoPlatform[] = [
  { name: 'TikTok', icon: '📱', color: 'from-slate-800 to-black', description: 'The pioneer of trending short clips.' },
  { name: 'Instagram Reels', icon: '📸', color: 'from-purple-600 to-pink-500', description: 'Aesthetically pleasing visual stories.' },
  { name: 'YouTube Shorts', icon: '🎥', color: 'from-red-600 to-rose-700', description: 'Fast entertainment from world creators.' },
];

export const VIDEO_FEATURES: VideoFeature[] = [
  { title: 'Vertical Format', description: '9:16 aspect ratio optimized for smartphones.', icon: '📐' },
  { title: 'Quick & Engaging', description: 'Usually 15-60 seconds to grab attention.', icon: '⚡' },
  { title: 'Creative Tools', description: 'Built-in music, text overlays, and filters.', icon: '🎨' },
  { title: 'Viral Potential', description: 'Algorithm-driven discovery for fast reach.', icon: '📈' },
];

export const TEXT_CATEGORIES: TextCategory[] = [
  { 
    title: 'Plain Text', 
    icon: '📄', 
    description: 'Minimalist content without formatting. Pure data.', 
    examples: ['.txt', 'Source code', 'Logs'] 
  },
  { 
    title: 'Formatted Text', 
    icon: '✍️', 
    description: 'Structured documents with styles like bold and italic.', 
    examples: ['.docx', '.pdf', 'Books'] 
  },
  { 
    title: 'Rich Text', 
    icon: '🌐', 
    description: 'Dynamic content with images, links, and web styling.', 
    examples: ['HTML', 'RTF', 'Websites'] 
  },
];

export const IMAGE_CATEGORIES: ImageCategory[] = [
  {
    title: 'Photography',
    icon: '📸',
    description: 'Capturing real-world moments with high fidelity.',
    formats: ['JPG', 'RAW', 'TIFF'],
    color: 'from-amber-400 to-orange-600'
  },
  {
    title: 'Digital Graphics',
    icon: '🎨',
    description: 'Logos, illustrations, and transparent UI elements.',
    formats: ['PNG', 'SVG', 'WebP'],
    color: 'from-yellow-400 to-amber-500'
  },
  {
    title: 'Motion & Web',
    icon: '🎞️',
    description: 'Animated loops and highly compressed web visuals.',
    formats: ['GIF', 'WebP', 'AVIF'],
    color: 'from-orange-500 to-red-500'
  }
];

export const SUGGESTED_TOPICS = [
  "How to convert images?",
  "JPG vs PNG vs WebP",
  "Viral short video tips",
  "Best fonts for design"
];

export const TRENDING_CONTENT = [
  { id: 1, title: "Lofi Beats 2025", type: "Audio", author: "@june_vibe", image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=200&h=200", views: "2.4M" },
  { id: 2, title: "Neon Tokyo Visuals", type: "Video", author: "@cyber_pixel", image: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=200&h=200", views: "1.8M" },
  { id: 3, title: "Minimalist UI Kit", type: "Design", author: "@flux_design", image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=200&h=200", views: "850K" },
  { id: 4, title: "Modern Haiku", type: "Text", author: "@poet_ai", image: "https://images.unsplash.com/photo-1473186533642-42419a06f23b?auto=format&fit=crop&q=80&w=200&h=200", views: "400K" },
];

export const FOLLOWING_FEED = [
  { id: 1, user: "Alex Rivera", action: "published a new track", time: "2m ago", avatar: "AR" },
  { id: 2, user: "Sophie Chen", action: "updated her icon set", time: "15m ago", avatar: "SC" },
  { id: 3, user: "Dev Dan", action: "started a live code stream", time: "1h ago", avatar: "DD" },
];
