import { PaginationEntity } from './pagination.entity';
import { BlogEntity } from './shopify-blog.entity';

export declare namespace ArticleEntity {
    interface Article {
        id: number;
        title: string;
        handle: string;
        image: null | {
            id: string;
            url: string;
            width: number;
            height: number;
        };
        blog_id: number;
        blog_handle: string;
    }
    type Articles = Article[];
}
export interface BlogArticle extends Pick<BlogEntity.Blog, 'id' | 'handle' | 'title'> {
}
export type BlogArticles = BlogArticle[];
export type ArticleFetch = PaginationEntity.PaginationResponse<ArticleEntity.Article>;
export type BlogIdFetch = PaginationEntity.PaginationResponse<BlogArticle>;
export declare namespace BlogArticleEntity {
    interface Blog {
        id: number;
    }
    type Blogs = Blog[];
}
export type BlogArticleFetch = PaginationEntity.PaginationResponse<BlogArticleEntity.Blog>;
