import { DeviceValue } from './fields/general.field.entity';

export interface IKeyframeProperties {
    x?: number | string;
    y?: number | string;
    scale?: number | string;
    scaleX?: number | string;
    scaleY?: number | string;
    rotate?: number | string;
    rotateX?: number | string;
    rotateY?: number | string;
    skew?: number | string;
    skewX?: number | string;
    skewY?: number | string;
    opacity?: number | string;
    width?: number | string;
    height?: number | string;
    backgroundPositionY?: number | string;
    brightness?: number | string;
    contrast?: number | string;
    hueRotate?: number | string;
}
/**
 keyframes = {
  "0%": {
    opacity: 0,
  },
  "100%": {
    opacity: 1,
  },
 }
 */
export type IKeyframes = Record<string, IKeyframeProperties>;
export type TKeyframeUnit = 'px' | '%' | 'vh' | 'vw' | 'deg';
export type PropertyHaveUnit = Extract<keyof IKeyframeProperties, 'width' | 'hueRotate' | 'height' | 'backgroundPositionY' | 'x' | 'y' | 'brightness' | 'contrast'>;
export type KeyframesWithDeviceValue = Record<DeviceValue, IKeyframes>;
