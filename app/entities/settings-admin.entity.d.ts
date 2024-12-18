import { GlobalSettings, CustomCode } from './settings.entity';

export interface AppSettingsEntity {
    /**
     * Tính năng tự động lưu có được bật hay không.
     */
    autoSaveEnabled?: boolean;
    /**
     * Bật chế độ này sidebar sẽ chuyển sang dạng linh hoạt có thể kéo đi nơi khác.
     */
    navigatorFlexible?: boolean;
    /**
     * Bật chế độ này sidebar sẽ mở rộng ra khi hover vào.
     */
    useThemeFont?: boolean;
}
export declare namespace $SettingsEntity {
    interface LimitPlan {
        isMaxSections: boolean;
        isMaxPages: boolean;
        isMaxSectionsPublish: boolean;
        isMaxPagesPublish: boolean;
    }
    interface GeneralSettings {
        password: string;
    }
    interface AdminGlobalSetting extends Omit<GlobalSettings, 'customCode'> {
    }
    interface Application {
        general: GeneralSettings;
        page: AdminGlobalSetting;
        customCode: CustomCode;
        appUtils: AppSettingsEntity;
    }
    interface TaskComplete {
        handle: string;
        completeTime: string;
    }
    interface HideBlocks {
        introduce: boolean;
        guide: boolean;
        feedback: boolean;
        recommended: boolean;
    }
    interface MaxValue {
        sections?: number;
        pages?: number;
        sections_publish?: number;
        pages_publish?: number;
    }
    interface MaxPlan {
        free?: MaxValue;
        basic?: MaxValue;
        pro?: MaxValue;
    }
    interface RequiredMaxPlan {
        free: Required<MaxValue>;
        basic: Required<MaxValue>;
        pro: Required<Omit<MaxValue, 'sections' | 'pages'>>;
    }
    interface External {
        /**
         * Các task đã hoàn thành
         */
        tasksComplete: TaskComplete[];
        /**
         * Các block đã ẩn
         */
        hideBlocks: HideBlocks;
        /**
         * Danh sách các theme đã được init
         */
        themeInitIds: number[];
        /**
         * Số lượng section và page tối đa mà store có thể tạo
         * Số lượng publish tối đa mà store có thể publish
         */
        maxPlan?: MaxPlan;
        /**
         * Xác định xem store có phải store có quyền dev hay ko
         * (có thể là admin của Xotiny hoặc bên thứ 3 vào dev element, section)
         */
        isDevStore?: boolean;
        /**
         * Id của metafield definition được init sẵn để link metaObject
         */
        metafieldTemplateRefDef?: {
            product?: string;
            collection?: string;
        };
    }
    interface Settings {
        /**
         * Các cài đặt liên quan đến app chính người dùng có thể chỉnh trong app
         */
        application: Application;
        /**
         * Các cài đặt liên dữ liệu người dùng ko thể chỉnh sửa
         */
        external: External;
        createdAt: string;
    }
}
