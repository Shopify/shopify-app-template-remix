export interface VideoInfoEntity {
    title: string;
    thumbnail: string;
    url: string;
    width: number;
    height: number;
    id: string;
    aspectRatio: number;
    type: 'vimeo' | 'youtube' | 'custom';
}
export interface VimeoEntity {
    type: string;
    version: string;
    provider_name: string;
    provider_url: string;
    title: string;
    author_name: string;
    author_url: string;
    is_plus: string;
    account_type: string;
    html: string;
    width: number;
    height: number;
    duration: number;
    description: string;
    thumbnail_url: string;
    thumbnail_width: number;
    thumbnail_height: number;
    thumbnail_url_with_play_button: string;
    upload_date: string;
    video_id: number;
    uri: string;
}
export interface YoutubeEntity {
    title: string;
    author_name: string;
    author_url: string;
    type: string;
    height: number;
    width: number;
    version: string;
    provider_name: string;
    provider_url: string;
    thumbnail_height: number;
    thumbnail_width: number;
    thumbnail_url: string;
    html: string;
}
