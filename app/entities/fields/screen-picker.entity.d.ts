export type ScreenPickerValue = string;
export type ScreenPickerType = 'mask_image' | 'divider' | 'image-loader' | 'background-slider' | 'image-hover' | 'mega-menu' | 'navigation' | 'animation-heading';
export interface ScreenPickerStoreData {
    id: string;
    name: string;
    source: ScreenPickerValue;
    preview: string;
}
