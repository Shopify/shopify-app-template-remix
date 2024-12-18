export declare namespace AttributeEntity {
    interface AttributesCustomItem {
        /** Unique id của attr */
        id: string;
        /** Tên của attr được thêm */
        key: string;
        /** Giá trị của attr được thêm */
        value: string;
    }
    type AttributesCustomItems = AttributesCustomItem[];
    interface Attribute {
        /** Unique id của field */
        id: string;
        /** Class name được thêm */
        class: string;
        /** Các data-attr custom được thêm */
        custom?: AttributesCustomItems;
    }
}
