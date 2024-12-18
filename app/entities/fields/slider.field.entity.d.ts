import { DeviceValue, MinMaxEntity, MinMaxNumberEntity } from './general.field.entity';

export interface SliderFieldValue {
    value: number;
    unit?: string;
}
export type SliderWithDeviceFieldValue = Partial<Record<DeviceValue, SliderFieldValue>>;
export interface SliderFieldOptions {
    unit?: string[];
    min?: MinMaxNumberEntity | MinMaxEntity;
    max?: MinMaxNumberEntity | MinMaxEntity;
    step?: number;
}
export interface SliderFieldWithDeviceOptions {
    unit?: string[];
    min?: MinMaxEntity;
    max?: MinMaxEntity;
    step?: number;
}
