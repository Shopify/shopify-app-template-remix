import { UniqueId } from '../../shared-kernel';
import { EmojiEntity } from './emoji.entity';
export declare namespace IconEntity {
    export type IconType = 'image' | 'icon' | 'emoji';
    export type IconVariant = 'fas' | 'far' | 'fal' | 'fab';
    type IconBase = {
        name: string;
        type: IconType;
        source: string;
    };
    export type IconFont = IconBase & {
        type: 'icon';
    };
    export type IconImage = IconBase & {
        id: UniqueId;
        type: 'image';
    };
    export type IconEmoji = IconBase & {
        id: UniqueId;
        type: 'emoji';
        category: EmojiEntity.Category;
    };
    export type Icon = IconFont | IconImage | IconEmoji;
    export type ImageInputCreateIcon = IconBase;
    export {};
}
export * from './emoji.entity';
export * from './image-file.entity';
export * from './icon-svg.entity';
