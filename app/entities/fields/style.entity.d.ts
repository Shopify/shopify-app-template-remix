import { FontEntity } from '../font/font.entity';
import { MediaEntity } from '../media';
import { ButtonGroupWithDeviceValue } from './button-group.field.entity';
import { CheckboxValue } from './checkbox.field.entity';
import { ColorGradientWithDeviceValue, ColorOrientedWithDeviceValue, ColorWithDeviceValue } from './color.field.entity';
import { ShadowWithDeviceValue, UnitValue, ValueWithDevice, ValueWithOriented } from './general.field.entity';
import { PositionWithDeviceValue } from './position.field.entity';
import { SelectWithDeviceValue } from './select.field.entity';
import { SliderWithDeviceFieldValue } from './slider.field.entity';
import { SpacingOrientedWithDeviceFieldValue } from './spacing.field.entity';
import { TransformFieldValue } from './transform.field.entity';

export declare namespace StylesEntity {
    interface Spacing {
        padding: ValueWithOriented<UnitValue>;
        margin: ValueWithOriented<UnitValue>;
    }
    interface Typography {
        'font-family': FontEntity.FontIO;
        'font-size': SliderWithDeviceFieldValue;
        'letter-spacing': SliderWithDeviceFieldValue;
        'line-height': SliderWithDeviceFieldValue;
        color: ColorWithDeviceValue;
        'font-weight': SelectWithDeviceValue;
        'text-align': ButtonGroupWithDeviceValue;
        'text-transform': ButtonGroupWithDeviceValue;
        'text-decoration': ButtonGroupWithDeviceValue;
        'text-style': ButtonGroupWithDeviceValue;
        'text-shadow': ShadowWithDeviceValue;
    }
    interface Effect {
        opacity: SliderWithDeviceFieldValue;
        blur: SliderWithDeviceFieldValue;
        transition: SliderWithDeviceFieldValue;
        'box-shadow': ShadowWithDeviceValue;
    }
    interface Border {
        'border-style': ButtonGroupWithDeviceValue;
        'border-color': ColorOrientedWithDeviceValue;
        'border-width': SpacingOrientedWithDeviceFieldValue;
        'border-radius': SpacingOrientedWithDeviceFieldValue;
    }
    interface Background {
        'background-type': ButtonGroupWithDeviceValue;
        'background-color': ColorWithDeviceValue;
        'background-gradient': ColorGradientWithDeviceValue;
        'background-size': ButtonGroupWithDeviceValue;
        'background-attachment': ButtonGroupWithDeviceValue;
        'background-position': PositionWithDeviceValue;
        'background-repeat': ButtonGroupWithDeviceValue;
        'background-image': ValueWithDevice<MediaEntity.ImageItem>;
        'background-image-parallax': CheckboxValue;
        'background-video': ValueWithDevice<MediaEntity.VideoItem>;
        'mobile-static-image': CheckboxValue;
        'background-image-mobile': MediaEntity.ImageItem;
        'background-overlay': ColorWithDeviceValue;
    }
    interface Dimension {
        width: SliderWithDeviceFieldValue;
        height: SliderWithDeviceFieldValue;
    }
    interface Advanced {
        transform: TransformFieldValue<true>;
        'width-fit-content': ValueWithDevice<boolean>;
    }
    interface HoverRelation {
        'hover-parent': string;
    }
    type GeneralStyleValue = Spacing | Typography | Effect | Border | Background;
    type StyleValues = {
        [K in keyof GeneralStyleValue]: GeneralStyleValue[K];
    };
    type GeneralStyleFieldSet = {
        spacing: Spacing;
        typography: Typography;
        effect: Effect;
        border: Border;
        background: Background;
        dimension: Dimension;
        advanced: Advanced;
        'hover-relation': HoverRelation;
    };
    type FieldSetName = keyof GeneralStyleFieldSet;
    type FieldSetValue = GeneralStyleFieldSet[FieldSetName];
    type PseudoName = 'normal' | 'hover' | 'active';
    type FieldSet<T extends keyof GeneralStyleFieldSet> = {
        [K in T]?: GeneralStyleFieldSet[K];
    };
    type StyleValue = {
        [K in PseudoName]?: GeneralStyleFieldSet;
    } & {
        selector?: string[];
    };
}
