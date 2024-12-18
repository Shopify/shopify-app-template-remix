import { CurrentElementEntity } from './current-element.entity';
import { ElementsEntity } from './elements.entity';
import { CurrentPageEntity } from './current-page.entity';
import { ModifierEntity } from './fields/modifier.entity';

export declare namespace PostMessageEntity {
    /**
     * Nhận thông tin của 1 element
     */
    interface ReadModifier {
        type: '@@development/read-modifier';
        payload: ModifierEntity.Node;
    }
    /**
     * Nhận thông tin của 1 element
     */
    interface ReadAllModifier {
        type: '@@development/read-all-modifier';
        payload: Record<string, ModifierEntity.Nodes>;
    }
    type ModifierDevelopment = ReadModifier | ReadAllModifier;
    /**
     * Nhận thông tin của 1 element
     */
    interface ReadElement {
        type: '@@development/read-element';
        payload: ElementsEntity.Element;
    }
    /**
     * Nhận thông tin của tất cả các element
     */
    interface ReadElements {
        type: '@@development/read-elements';
        payload: ElementsEntity.Data;
    }
    /**
     * Nhận thông tin của page hiện tại
     */
    interface ReadPage {
        type: '@@development/read-page';
        payload: CurrentPageEntity.Data;
    }
    type ElementDevelopment = ReadElement | ReadElements | ReadPage;
    interface ElementDevelopmentCompileRequest {
        type: '@@development/code-compile-request';
        payload: CurrentElementEntity.Elements;
    }
    interface ElementDevelopmentCompileSuccess {
        type: '@@development/code-compile-success';
        payload: {
            liquid: string;
            html: string;
        };
    }
    interface SaveElements {
        type: '@@development/save-elements';
        payload: CurrentElementEntity.Elements;
    }
}
