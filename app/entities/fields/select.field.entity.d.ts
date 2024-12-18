import { ValueWithDevice } from './general.field.entity';
import { IconEntity } from './icon.field.entity';

export type SelectValue = string;
export type SelectWithDeviceValue = ValueWithDevice<SelectValue>;
export interface SelectOption {
    label: string;
    value: string;
    icon?: IconEntity.IconProps['name'];
    default?: boolean;
}
