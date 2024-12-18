import { PaginationEntity } from '../pagination.entity';
import { UniqueId } from '../shared-kernel';

export declare namespace CollectionEntity {
    interface Collection {
        id: UniqueId;
        title: string;
        handle: string;
        image: {
            url: string;
        } | null;
    }
    type Collections = Collection[];
}
export type CollectionFetch = PaginationEntity.PaginationResponse<CollectionEntity.Collection>;
