import { ValueWithDevice, ValueWithOriented } from './general.field.entity';

type SingleSpaceField = {
    value: number;
    unit: string;
};
export interface SpaceFieldValue {
    marginTop: SingleSpaceField;
    marginBottom: SingleSpaceField;
    paddingTop: SingleSpaceField;
    paddingBottom: SingleSpaceField;
}
export type SpacingOrientedFieldValue = ValueWithOriented<SingleSpaceField>;
export type SpacingOrientedWithDeviceFieldValue = ValueWithDevice<SpacingOrientedFieldValue>;
export {};
