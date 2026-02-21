
export interface MusicGenre {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Artist {
  name: string;
  image: string;
  tag: string;
  notableWork: string;
}

export interface Format {
  type: string;
  description: string;
  quality: 'Low' | 'Medium' | 'High' | 'Lossless' | 'N/A';
  category: 'Audio' | 'Video' | 'Text' | 'Image';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isAudio?: boolean;
}

export interface VideoPlatform {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface VideoFeature {
  title: string;
  description: string;
  icon: string;
}

export interface TextCategory {
  title: string;
  icon: string;
  description: string;
  examples: string[];
}

export interface ImageCategory {
  title: string;
  icon: string;
  description: string;
  formats: string[];
  color: string;
}
