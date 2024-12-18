import { PaginationEntity } from './pagination.entity';

export declare namespace BlogEntity {
    interface Blog {
        id: number;
        title: string;
        handle: string;
    }
    type Blogs = Blog[];
}
export type BlogFetch = PaginationEntity.PaginationResponse<BlogEntity.Blog>;
