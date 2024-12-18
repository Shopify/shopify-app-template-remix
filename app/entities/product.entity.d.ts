import { MediaEntity } from './media';
import { PaginationEntity } from './pagination.entity';

export declare namespace ProductEntity {
    interface FeaturedImage {
        id: string;
        url: string;
        width: number;
        height: number;
    }
    interface ProductInfo {
        id: string;
        title: string;
        handle: string;
    }
    interface Product extends ProductInfo {
        featuredImage: FeaturedImage | null;
        isPublished: boolean;
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
    type Products = Product[];
}
export type ProductFetch = PaginationEntity.PaginationResponse<ProductEntity.Product>;
