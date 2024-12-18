import { ValueWithDevice } from './general.field.entity';
import { IconEntity } from './icon.field.entity';

export interface ButtonGroupOption {
    /**
     * Value của button option
     */
    value: ButtonGroupValue;
    /**
     * Icon của button option
     */
    icon?: IconEntity.IconProps['name'];
    /**
     * Label của button option
     */
    label?: string;
}
export type ButtonGroupValue = string | boolean;
export type ButtonGroupWithDeviceValue = ValueWithDevice<ButtonGroupValue>;
