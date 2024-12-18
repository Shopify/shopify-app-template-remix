import { UnitValue, ValueWithDevice } from './general.field.entity';

export interface TransformFieldValue<T extends boolean = true> {
    translateX: T extends true ? ValueWithDevice<UnitValue> : UnitValue;
    translateY: T extends true ? ValueWithDevice<UnitValue> : UnitValue;
    scale: T extends true ? ValueWithDevice<UnitValue> : UnitValue;
    rotate: T extends true ? ValueWithDevice<UnitValue> : UnitValue;
}
