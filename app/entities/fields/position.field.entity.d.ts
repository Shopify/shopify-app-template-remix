import { ValueWithDevice } from './general.field.entity';

export interface PositionValue {
    /**
     * Tọa độ x của điểm kéo (đơn vị %)
     */
    x?: number;
    /**
     * Tọa độ y của điểm kéo (đơn vị %)
     */
    y?: number;
}
export type PositionWithDeviceValue = ValueWithDevice<PositionValue>;
