import { ButtonGroupValue } from './fields/button-group.field.entity';
import { ColorGradientValue, ColorValue } from './fields/color.field.entity';
import { PositionValue } from './fields/position.field.entity';
import { MediaEntity } from './media/media.entity';

interface BreakpointsValue {
    value?: number;
    unit?: string;
}
interface Layout {
    'container-width': ContainerWidth;
    'spacing-grid-horizontal': SpacingGridHorizontal;
    'spacing-grid-vertical': SpacingGridVertical;
}
export interface CustomCode {
    css: string;
    js: string;
}
interface Colors {
    accent: string;
    title: string;
    text: string;
}
interface ImageLoader {
    type: string;
    size: BreakpointsValue;
    color: string;
    duration: BreakpointsValue;
    backgroundColor: string;
}
interface ContainerWidth {
    desktop: BreakpointsValue;
    tablet: BreakpointsValue;
    mobile: BreakpointsValue;
}
interface SpacingGridHorizontal {
    desktop: BreakpointsValue;
    tablet: BreakpointsValue;
    mobile: BreakpointsValue;
}
interface SpacingGridVertical {
    desktop: BreakpointsValue;
    tablet: BreakpointsValue;
    mobile: BreakpointsValue;
}
interface BaseSettingsEntity {
    layout: Layout;
    customCode: CustomCode;
    colors: Colors;
}
/** Page settings */
export interface PageSettings extends BaseSettingsEntity {
    background?: Partial<{
        'background-type': ButtonGroupValue;
        'background-color': ColorValue;
        'background-gradient': ColorGradientValue;
        'background-image': MediaEntity.ImageItem;
        'background-position': PositionValue;
        'background-repeat': ButtonGroupValue;
        'background-size': ButtonGroupValue;
        'background-attachment': ButtonGroupValue;
        'background-overlay': ColorValue;
    }>;
    additionalSettings: {
        isOverrideGlobalSettings?: boolean;
    };
}
export type PageFieldName = keyof PageSettings;
export type PageFieldValues = PageSettings[PageFieldName];
export type PageSettingsResponse = Partial<PageSettings>;
/** Global settings */
export interface GlobalSettings extends BaseSettingsEntity {
    imageLoader: ImageLoader;
    placeholderImage?: Partial<{
        'tab-type'?: ButtonGroupValue;
        'product-image': Partial<MediaEntity.ImageItem>;
        'collection-image': Partial<MediaEntity.ImageItem>;
        'article-image': Partial<MediaEntity.ImageItem>;
    }>;
}
export type GlobalFieldName = keyof GlobalSettings;
export type GlobalFieldValues = GlobalSettings[GlobalFieldName];
export type GlobalSettingsResponse = Partial<GlobalSettings>;
export {};
