import { PaginationEntity } from '../pagination.entity';
import { UniqueId } from '../shared-kernel';

export declare namespace GoogleFontEntity {
    interface Variant {
        value: string;
        weight: string;
        italic: boolean;
    }
    interface ResponseItem {
        id: string;
        family: string;
        variants: Variant[];
    }
    interface FieldItem {
        id: UniqueId;
        label: string;
        fontFamily: string;
        variants: Variant[];
        css: string;
    }
    interface ResponseList extends PaginationEntity.PaginationResponse<ResponseItem> {
    }
    interface FieldItemList extends PaginationEntity.PaginationResponse<FieldItem> {
    }
    interface PaginationQueryParams extends PaginationEntity.PaginationQueries {
        /**
         * Text  search
         */
        q?: string;
    }
}
