import { PaginationEntity } from '../pagination.entity';

interface ShopifyImage {
    id: string;
    width: number;
    height: number;
    url: string;
}
export type ImageDisplay = {
    width?: number;
    height?: number;
    url: string;
};
export interface ShopifyImageFile {
    id: string;
    alt: string;
    mimeType: string;
    createdAt: string;
    fileStatus: string;
    fileErrors: any[];
    image: ShopifyImage;
}
export type ShopifyImageFilePagination = PaginationEntity.PaginationResponse<ShopifyImageFile>;
export {};
