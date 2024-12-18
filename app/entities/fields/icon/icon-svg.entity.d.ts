import { PaginationEntity } from '../../pagination.entity';
export declare namespace SvgEntity {
    type Variation = 'solid' | 'regular' | 'light' | 'thin' | 'duotone' | 'brands';
    interface RawData {
        id: string;
        label: string;
        value: string;
    }
    type Paginated = PaginationEntity.PaginationResponse<RawData>;
}
