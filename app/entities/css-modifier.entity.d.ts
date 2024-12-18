import { UniqueId } from './shared-kernel';

export declare namespace CssModifierEntity {
    type Modifiers = Record<string, Nodes>;
    interface Node {
        id: UniqueId;
        elementId: UniqueId;
        label: string;
        css: string;
        handle: string;
        cssVariables: Record<string, string>;
    }
    interface Nodes {
        nodes: Node[];
        template: string;
    }
}
