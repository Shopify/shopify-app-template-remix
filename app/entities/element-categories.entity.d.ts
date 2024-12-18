import { UniqueId, IconName } from './shared-kernel';

export declare namespace ElementCategoriesEntity {
    interface Item {
        /**
         * Id của category
         */
        id: UniqueId;
        /**
         * Tên của category
         */
        label: string;
        /**
         * Icon mô tả category
         */
        icon: IconName;
        /**
         * Số lượng element của category
         */
        count: number;
        /**
         * Trạng thái đóng mở của category
         */
        open?: boolean;
    }
    type Items = Item[];
}
