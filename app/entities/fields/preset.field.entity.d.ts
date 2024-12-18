import { ColorGradientValue, ColorValue } from './color.field.entity';
import { ValueWithDeviceRequired } from './general.field.entity';
import { StylesEntity } from './style.entity';

export interface SectionAnalyticColor {
    /**
     * Key là các path của field có color được set
     * VD: ['id+background+background-color', 'id+typography+color', 'id+modifier+--xb-color-color-primary']
     */
    key: string[];
    /**
     * isSection check màu hiện tại có phải là màu của section hay không.
     * Nếu là seciton thì sẽ move lên đầu được ưu tiên duyệt làm màu chính nến đạt chỉ tiêu (khác màu đơn sắc đen và trắng)
     */
    isSection: boolean;
    /**
     * Type là các loại color: color, background-color, border-color, shadow-color, overlay-color, ...
     */
    type: string[];
    /**
     * Value là giá trị của color
     */
    value: ColorValue | ColorGradientValue;
    /**
     * isGradient check màu hiện tại có phải là gradient hay không
     */
    isGradient?: boolean;
    /**
     * subField là field con của field color
     */
    subField?: string;
}
export interface PresetValueBase {
    /**
     * Giá trị ban đầu của section ( các preset schemes sau đều được sinh theo original này)
     * Original chỉ được update khi section ban đầu này thay đổi element hoặc thay đổi style color
     */
    original?: SectionColorAnalytic;
    /**
     * Giá trị đang được chọn của section
     */
    value?: SectionColorAnalytic;
}
export interface PresetValueGeneral extends PresetValueBase {
    /**
     * Type của preset đang chọn
     */
    type?: 'general';
    /**
     * Preset là giá trị của scheme đang được chọn ( lấy theo index )
     */
    preset?: number;
}
export interface PresetValueCustom extends PresetValueBase {
    /**
     * Type của preset đang chọn
     */
    type?: 'custom';
    /**
     * Trục X của wheel color khi quay
     */
    dx?: number;
    /**
     * Trục Y của wheel color khi quay
     */
    dy?: number;
    /**
     * Góc quay của wheel color để thay đổi hue color
     */
    hue?: number;
}
export interface PresetValueRandom extends PresetValueBase {
    /**
     * Type của preset đang chọn
     */
    type?: 'random';
}
export type PresetValue = PresetValueGeneral | PresetValueCustom | PresetValueRandom;
export type SectionColorAnalytic = {
    [K in StylesEntity.PseudoName]: ValueWithDeviceRequired<SectionAnalyticColor[]>;
};
export type SectionColorList = {
    [K in StylesEntity.PseudoName]: ValueWithDeviceRequired<ColorValues[]>;
};
export interface PresetScheme {
    data: SectionAnalyticColor[];
    key: string;
    type: string;
    isSection: boolean;
    value: ColorValues;
    isGradient?: boolean;
    subField?: string;
}
export type ColorValues = ColorValue | ColorGradientValue;
