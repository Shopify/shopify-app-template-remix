import { IconName } from '../shared-kernel';

export interface UnitValue {
    value?: number;
    unit?: string;
}
export type DeviceValue = 'desktop' | 'tablet' | 'mobile';
export type Pseudo = 'normal' | 'hover' | 'active';
export type Oriented = 'top' | 'right' | 'bottom' | 'left';
export type ValueWithOriented<T> = {
    [K in Oriented]?: T;
};
export type ValueWithDevice<T> = {
    [K in DeviceValue]?: T;
};
export type ValueWithDeviceRequired<T> = {
    [K in DeviceValue]: T;
};
export interface DeviceListItem {
    label: string;
    value: DeviceValue;
    icon: IconName;
}
export type MinMaxNumberEntity = number;
export interface MinMaxWithDevice extends Record<string, MinMaxNumberEntity> {
}
export type MinMaxEntity = MinMaxNumberEntity | MinMaxWithDevice;
/** Slider field */
export type SliderValue = {
    value: number;
    unit?: string;
};
export type SlideWithDeviceValue = {
    [K in DeviceValue]?: SliderValue;
};
/** Shadow field */
export interface ShadowValue {
    id: string;
    horizontal: UnitValue;
    vertical: UnitValue;
    blur: UnitValue;
    spread?: UnitValue;
    color: string;
}
export type ShadowWithDeviceValue = ValueWithDevice<ShadowValue>;
