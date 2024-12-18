import { ValueWithDevice } from './general.field.entity';

export declare namespace KeyFramesEntity {
    interface IKeyframeProperties {
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
    type IKeyframes = Record<string, IKeyframeProperties>;
    type TKeyframeUnit = 'px' | '%' | 'vh' | 'vw' | 'deg';
    type PropertyHaveUnit = Extract<keyof IKeyframeProperties, 'width' | 'hueRotate' | 'height' | 'backgroundPositionY' | 'x' | 'y' | 'brightness' | 'contrast'>;
    type KeyframesWithDeviceValue = ValueWithDevice<IKeyframes>;
}
