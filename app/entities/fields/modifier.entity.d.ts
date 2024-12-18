import { UniqueId } from '../shared-kernel';
import { StylesEntity } from './style.entity';

export declare namespace ModifierEntity {
    type Modifiers = Record<string, Nodes>;
    type CssVariablesValue = Record<string, {
        name: string;
        property?: string;
        value: StylesEntity.StyleValues;
    }>;
    interface Node {
        id: UniqueId;
        elementId: UniqueId;
        label: string;
        css: string;
        handle: string;
        cssVariables: CssVariablesValue;
    }
    interface Nodes {
        nodes: Node[];
        template: string;
    }
    interface ModifierValue {
        label?: string;
        handle?: string;
        cssVariables?: CssVariablesValue;
    }
}
