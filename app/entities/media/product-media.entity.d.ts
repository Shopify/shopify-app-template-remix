import { PaginationEntity } from '../pagination.entity';
import { MediaEntity } from './media.entity';

export declare namespace ProductMediaEntity {
    interface FeaturedImage {
        id: string;
        url: string;
        width: number;
        height: number;
    }
    interface ProductInfo {
        id: string;
        title: string;
    }
    interface Product extends ProductInfo {
        featuredImage: FeaturedImage | null;
    }
    type PaginatedProductList = PaginationEntity.PaginationResponse<Product>;
    type PaginatedProductMediaList = ProductInfo & {
        media: MediaEntity.PaginatedNode;
    };
    type PaginatedProductImageList = ProductInfo & {
        media: MediaEntity.PaginatedImage;
    };
    type PaginatedProductVideoList = ProductInfo & {
        media: MediaEntity.PaginatedVideo;
    };
    type PaginatedTransformProductMediaList = ProductInfo & {
        media: MediaEntity.MediaList;
    };
    type PaginatedTransformProductImagesList = ProductInfo & {
        media: MediaEntity.ImageList;
    };
    type PaginatedTransformProductVideosList = ProductInfo & {
        media: MediaEntity.VideoList;
    };
    interface QueryProductsParams extends PaginationEntity.PaginationQueriesSearch {
    }
}
