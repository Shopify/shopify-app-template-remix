import { CurrentElementSettings, ExcludeAction, PreviewExcludeAction, UniqueId } from './shared-kernel';

export declare namespace CurrentElementEntity {
    type Template = string;
    interface DefaultElement {
        /**
         * Id của element tại page hiện tại
         */
        id: UniqueId;
        /**
         * Id từ bảng elements
         */
        elementId: UniqueId;
        /**
         * Tên của element
         */
        label: string;
        /**
         * Tên của element nhưng được sync từ value của 1 field
         */
        labelSync?: string;
        /**
         * Image của element nhưng được sync từ value của 1 field
         */
        imageSync?: string;
        /**
         * Ẩn hiện element tại page hiện tại
         */
        hide?: boolean;
        /**
         * Đóng mở element tại navigator
         */
        collapsed?: boolean;
        /**
         * Id của element cha
         */
        parent: UniqueId;
        /**
         * Các settings của element phụ thuộc vào schema tại bảng elements
         */
        settings?: CurrentElementSettings;
        /**
         * Template in ra element
         */
        template?: Template;
        /**
         * Đồng bộ id của field space để có thể kéo thay đổi giá trị tại preview
         */
        spaceIdSync?: UniqueId;
        /**
         * Xác định xem section thường hay section global
         * Chỉ áp dụng cho section
         * @default false
         */
        global?: boolean;
        /**
         * Xác định mongoId của section global nếu là section global
         * Xuất hiện khi add section global vào page
         */
        globalId?: string;
        /**
         * Xác định xem đây có phải là mega menu hay không
         * Chỉ áp dụng cho section
         * @default false
         */
        megaMenu?: boolean;
        /**
         * Xác định mongoId của section mega menu nếu là section mega menu
         * Xuất hiện khi add section mega menu vào page
         */
        megaMenuId?: string;
        /**
         * Xác định xem đây có phải là navigation hay không
         * Áp dụng cho tất cả các element
         * @default false
         */
        navigation?: boolean;
        /**
         * Xác định mongoId của navigation nếu là navigation
         * Xuất hiện khi add navigation vào page hoặc section
         */
        navigationId?: string;
        /**
         * Chỉ định các element thuộc cùng nhóm với nhau
         */
        group?: string;
        /**
         * Có phải là element cha của group hay không
         */
        isGroupParent?: boolean;
        /**
         * Cho phép kéo thả element bình thường vào trong group
         * @default false
         */
        allowDrop?: boolean;
        /**
         * Khi được bật chế độ này thì children sẽ không được in tại navigator nữa
         * và ở chế độ này thì cũng không thể add element khác vào trong nó
         */
        childrenHidden?: boolean;
        /**
         * Ẩn element tại navigator dựa vào điều kiện
         */
        hiddenCondition?: string;
        /**
         * Mỗi element sẽ có 1 thẻ bọc ngoài có thể ảnh hưởng tới cấu trúc
         * Ta có thể thay đổi tên thẻ đó
         * Chú ý chỉ áp dụng tại editor
         * @default "div"
         */
        wrapperTagName?: string;
        /**
         * Loại trừ các actions bao gồm: duplicate, delete, move, drag
         */
        excludeActions?: ExcludeAction[];
        /**
         * Loại trừ các actions tại preview bao gồm: duplicate, delete, move, drag, copy, paste
         */
        previewExcludeActions?: PreviewExcludeAction[];
    }
    interface WrapperElement extends DefaultElement {
        /**
         * Loại element này cho phép chứa các element khác
         */
        type: 'wrapper';
        /**
         * Mảng các id của element con
         */
        children: UniqueId[];
    }
    interface DynamicElement extends DefaultElement {
        /**
         * Loại element này không cho phép chứa các element khác
         */
        type: 'element';
    }
    type Element = WrapperElement | DynamicElement;
    interface Elements {
        /**
         * Key là id của element
         */
        [id: UniqueId]: Element;
    }
    type ElementType = Element['type'];
    type AddElementPosition = 'idle' | 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend';
}
