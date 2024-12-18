import { PaginationEntity } from './pagination.entity';

export declare namespace PageEntity {
    interface Page {
        id: number;
        title: string;
        handle: string;
    }
    type Pages = Page[];
}
export type PageFetch = PaginationEntity.PaginationResponse<PageEntity.Page>;
