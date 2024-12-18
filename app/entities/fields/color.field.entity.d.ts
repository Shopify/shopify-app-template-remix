import { ValueWithDevice, ValueWithOriented } from './general.field.entity';

export type ColorValue = string;
export type ColorWithDeviceValue = ValueWithDevice<ColorValue>;
export type ColorOrientedValue = ValueWithOriented<ColorValue>;
export type ColorOrientedWithDeviceValue = ValueWithDevice<ColorOrientedValue>;
export interface ColorGradientPointValue {
    id: string;
    color: string;
    position: number;
}
export interface ColorGradientValue {
    rotate: number;
    points: ColorGradientPointValue[];
}
export type ColorGradientWithDeviceValue = ValueWithDevice<ColorGradientValue>;
