export interface LinkItem {
  title: string;
  url: string;
  description?: string;
  image?: string;
}

export interface ApiResponse {
  links: LinkItem[];
  meta?: {
    stale?: boolean;
    age_seconds?: number;
    fetched_at?: number;
    cache_ttl?: number;
    cache_file?: string;
    source?: string;
    error?: string;
  };
  error?: string;
  details?: string;
}
