import { PaginationEntity } from '../pagination.entity';
import { UniqueId } from '../shared-kernel';
import { EmojiEntity } from './emoji.entity';
import { SvgEntity } from './icon-svg.entity';

export declare namespace IconEntity {
    export type IconType = 'image' | 'icon' | 'emoji';
    type IconBase = {
        name: string;
        type: IconType;
        source: string;
    };
    export type IconSvg = IconBase & {
        type: 'icon';
    };
    export type IconSvgPaginated = PaginationEntity.PaginationResponse<IconSvg>;
    export type IconSvgQueryPaginated = PaginationEntity.PaginationQueries & {
        variation?: SvgEntity.Variation;
    };
    export type IconImage = IconBase & {
        id?: UniqueId;
        type: 'image';
    };
    export type IconEmoji = IconBase & {
        id?: UniqueId;
        type: 'emoji';
        category?: EmojiEntity.Category;
    };
    export type Icon = IconSvg | IconImage | IconEmoji;
    export type ImageInputCreateIcon = IconBase;
    export {};
}
export * from './emoji.entity';
export * from './icon-svg.entity';
export * from './image-file.entity';
