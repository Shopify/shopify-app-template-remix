import { ValueWithDevice } from './general.field.entity';

export interface GridAreaValue {
    value: number;
    unit?: string;
}
export type GridAreaWithDevice = ValueWithDevice<GridAreaValue>;
export interface GridAreaWithDeviceValue {
    column: GridAreaWithDevice;
    row: GridAreaWithDevice;
}
