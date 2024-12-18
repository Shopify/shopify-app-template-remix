import { PaginationEntity } from '../pagination.entity';
import { FileEntity } from './file.entity';

export declare namespace MediaEntity {
    type FileStatus = 'READY' | 'FAILED' | 'PROCESSING' | 'UPLOADED';
    type PaginatedImage = PaginationEntity.PaginationResponse<FileEntity.NodeImage>;
    type PaginatedVideo = PaginationEntity.PaginationResponse<FileEntity.NodeVideo>;
    type PaginatedNode = PaginationEntity.PaginationResponse<FileEntity.NodeMedia>;
    type Node = FileEntity.NodeMedia;
    interface CategoryItem {
        _id: string;
        name: string;
        thumbnail: string;
        handle: string;
    }
    interface ImageItem {
        id: string;
        url: string;
        width: number;
        height: number;
        fileName: string;
        mimeType: string;
        extension: string;
    }
    interface VideoItem {
        id: string;
        url: string;
        videoThumbnail: string;
        width: number;
        height: number;
        fileName: string;
        mimeType: string;
        extension: string;
    }
    type Item = VideoItem | ImageItem;
    type ImageList = PaginationEntity.PaginationResponse<ImageItem>;
    type VideoList = PaginationEntity.PaginationResponse<VideoItem>;
    type MediaList = PaginationEntity.PaginationResponse<Item>;
    type CategoryList = PaginationEntity.PaginationResponse<CategoryItem>;
}
