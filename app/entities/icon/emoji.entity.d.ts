import { PaginationEntity } from '../pagination.entity';

export declare namespace EmojiEntity {
    type Category = 'smileys_people' | 'animals_nature' | 'food_drink' | 'travel_places' | 'activities' | 'objects' | 'symbols' | 'flags' | 'custom';
    interface Item {
        _id: string;
        category: Category;
        name: string;
        hexCode: string;
        html: string;
        version: string;
    }
    interface QueryParams extends PaginationEntity.PaginationQueriesSearch {
    }
    interface Pagination extends PaginationEntity.PaginationResponse<Item> {
    }
}
