import { PageType } from './shared-kernel';

export type HomePageExtension = 'json' | 'liquid';
export type PageTemplatePublish = {
    /** Xác định type ban đầu của template, thường chỉ có homepage mới cần cái này  */
    originalExtension?: HomePageExtension;
    /**
     * Type của page được publish
     * Ảnh hưởng đến tên file khi lên theme template
     */
    pageType: PageType;
};
