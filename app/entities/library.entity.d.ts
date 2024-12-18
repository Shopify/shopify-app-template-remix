import { CurrentElementEntity } from './current-element.entity';
import { UniqueId, IImage, PageType } from './shared-kernel';

export declare namespace LibraryEntity {
    interface Base {
        /**
         * Id của page, section
         * @deprecated truong nay se xoa, vi trong editor ko dung
         */
        id?: UniqueId;
        /**
         * Tên của page, section
         */
        label: string;
        /**
         * Category của page, section
         */
        category: string;
        /**
         * Tags của page, section
         */
        tags?: string[];
        /**
         * Hình ảnh feature của page, section
         */
        featuredImage?: IImage;
        /**
         * Các elements của page, section
         */
        entities: CurrentElementEntity.Elements;
        /**
         * Mảng các id của section theo thứ tự
         */
        order: UniqueId[];
        /**
         * Xác định xem đây là page nào
         */
        pageType?: PageType;
        /**
         * Có sử dụng header, footer hay không
         * Sẽ bỏ cái mặc định của theme shopify đi
         */
        useCustomHeaderFooter?: boolean;
    }
    interface Section extends Base {
    }
    interface Block extends Base {
    }
    interface Page extends Base {
    }
    interface Menu extends Base {
    }
}
