import { FIELD_TYPES, STATIC_FIELD_TYPES } from '@xobuilder/constants';
import { ElementsEntity } from './elements.entity';
import { TextFieldValue, TextFieldWithDeviceValue } from './fields/text-field.field.entity';
import { ActionTypeEntity } from './fields/action-type.field.entity';
import { AttributeEntity } from './fields/attributes.field.entity';
import { ButtonGroupOption, ButtonGroupValue, ButtonGroupWithDeviceValue } from './fields/button-group.field.entity';
import { CheckboxValue } from './fields/checkbox.field.entity';
import { ChildrenIdValue } from './fields/children-id.field.entity';
import { CollectionEntity } from './fields/collection.field.entity';
import { ColorValue, ColorWithDeviceValue } from './fields/color.field.entity';
import { CssCodeValue } from './fields/css-code.field.entity';
import { DateValue } from './fields/date.field.entity';
import { GridAreaWithDeviceValue } from './fields/grid-area.field.entity';
import { HiddenValue } from './fields/hidden.field.entity';
import { LiquidValue } from './fields/liquid.field.entity';
import { MarkUpValue } from './fields/markup.field.entity';
import { ParentIdValue } from './fields/parent-id-field.entity';
import { RichtextValue } from './fields/richtext.field.entity';
import { SelectOption, SelectValue, SelectWithDeviceValue } from './fields/select.field.entity';
import { SliderFieldOptions, SliderFieldValue, SliderFieldWithDeviceOptions, SliderWithDeviceFieldValue } from './fields/slider.field.entity';
import { SwitchValue } from './fields/switch.field.entity';
import { TableValue } from './fields/table.field.entity';
import { VideoInfoEntity } from './fields/video-url.field.entity';
import { ModifierEntity } from './fields/modifier.entity';
import { StylesEntity } from './style.entity';
import { KeyFramesEntity } from './fields/keyframes.field.entity';
import { MegaMenuValue, MenuValue, NavigationHamburgerValue, NavigationValue, PresetValue, ScreenPickerType, ValueWithDevice, VisibilityWithDevice } from './fields/fields.entity';
import { MediaEntity } from './media';
import { IconEntity } from './icon/icon.entity';
import { ProductEntity } from './product.entity';
import { BlogEntity } from './shopify-blog.entity';
import { ArticleEntity } from './shopify-article.entity';
import { FontEntity } from './font/font.entity';
import { UniqueId } from './shared-kernel';

export declare namespace Development {
    type DefaultElement = Omit<ElementsEntity.DynamicElement | ElementsEntity.WrapperElement, 'id' | 'template' | 'settings'>;
    type BlockElement = Omit<ElementsEntity.BlockElement, 'id' | 'template' | 'settings'>;
    interface DefaultField<TypeT extends string, DefaultT> {
        /**
         * Id (name) của field
         */
        id: UniqueId;
        /**
         * Tên của field
         * @default ""
         */
        label?: string;
        /**
         * Mô tả tóm tắt của field
         */
        helpText?: string;
        /**
         * Field thuộc section nào
         * Hiện tại có 3 section: content, design, advanced
         * @default content
         */
        sectionType?: ElementsEntity.SectionType;
        /**
         * Trường hợp ẩn hiện field
         */
        condition?: string;
        /**
         * Giá trị mặc định của field
         */
        default: DefaultT;
        /**
         * type của field
         */
        type: TypeT;
        /**
         * Field này thuộc style để khi paste style sẽ lấy thêm giá trị của field này
         */
        isStyle?: boolean;
    }
    interface DefaultStaticField<TypeT extends string> {
        /**
         * Field thuộc section nào
         * Hiện tại có 3 section: content, design, advanced
         * @default content
         */
        sectionType?: ElementsEntity.SectionType;
        /**
         * Trường hợp ẩn hiện field
         */
        condition?: string;
        /**
         * type của field
         */
        type: TypeT;
    }
    type ToolbarItems = 'heading' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'color' | 'backgroundColor' | 'link' | 'code' | 'blockquote' | 'ol' | 'ul' | 'left' | 'center' | 'right' | 'sub' | 'sup' | 'reset';
    /** ===== Text Field ===== */
    interface TextDefaultField extends DefaultField<typeof FIELD_TYPES.TEXT, TextFieldValue> {
        multiline?: number;
        deviceEnabled?: false;
        placeholder?: string;
    }
    interface TextWithDeviceField extends DefaultField<typeof FIELD_TYPES.TEXT, TextFieldWithDeviceValue> {
        multiline?: number;
        deviceEnabled: true;
        placeholder?: string;
    }
    type TextField = TextDefaultField | TextWithDeviceField;
    /** ===== Action Field ===== */
    interface ActionField extends DefaultField<typeof FIELD_TYPES.ACTION, ActionTypeEntity.ActionItem> {
    }
    /** ===== Attributes Field ===== */
    interface AttributesField extends DefaultField<typeof FIELD_TYPES.ATTRIBUTES, AttributeEntity.Attribute> {
    }
    /** ===== ButtonGroup Field ===== */
    interface ButtonGroupDefaultField extends DefaultField<typeof FIELD_TYPES.BUTTON_GROUP, ButtonGroupValue> {
        deviceEnabled?: false;
        options: ButtonGroupOption[];
        tooltipEnabled?: boolean;
    }
    interface ButtonGroupWithDeviceField extends DefaultField<typeof FIELD_TYPES.BUTTON_GROUP, ButtonGroupWithDeviceValue> {
        deviceEnabled: true;
        options: ButtonGroupOption[];
        tooltipEnabled?: boolean;
    }
    type ButtonGroupField = ButtonGroupDefaultField | ButtonGroupWithDeviceField;
    /** ===== Checkbox Field ===== */
    interface CheckboxField extends DefaultField<typeof FIELD_TYPES.CHECKBOX, CheckboxValue> {
    }
    /** ===== ChildrenId Field ===== */
    interface ChildrenIdField extends DefaultField<typeof FIELD_TYPES.CHILDREN_ID, ChildrenIdValue> {
    }
    /** ===== Collection Field ===== */
    interface CollectionField extends DefaultField<typeof FIELD_TYPES.COLLECTION_PICKER, CollectionEntity.Collection | {}> {
    }
    /** ===== CollectionList Field ===== */
    interface CollectionListField extends DefaultField<typeof FIELD_TYPES.COLLECTION_LIST, CollectionEntity.Collections> {
    }
    /** ===== Color Field ===== */
    interface ColorDefaultField extends DefaultField<typeof FIELD_TYPES.COLOR, ColorValue> {
        deviceEnabled?: false;
    }
    interface ColorWithDeviceField extends DefaultField<typeof FIELD_TYPES.COLOR, ColorWithDeviceValue> {
        deviceEnabled: true;
    }
    type ColorField = ColorDefaultField | ColorWithDeviceField;
    /** ===== CssCode Field ===== */
    interface CssCodeField extends DefaultField<typeof FIELD_TYPES.CSS_CODE, CssCodeValue> {
    }
    /** ===== DatePicker Field ===== */
    interface DatePickerField extends DefaultField<typeof FIELD_TYPES.DATE_PICKER, DateValue> {
    }
    /** ===== GridArea Field ===== */
    interface GridAreaField extends DefaultField<typeof FIELD_TYPES.GRID_AREA, GridAreaWithDeviceValue> {
    }
    /** ===== Icon Field ===== */
    interface IconField extends DefaultField<typeof FIELD_TYPES.ICON_PICKER, IconEntity.Icon> {
    }
    /** ===== Liquid Field ===== */
    interface LiquidField extends DefaultField<typeof FIELD_TYPES.LIQUID, LiquidValue> {
    }
    /** ===== ParentId Field ===== */
    interface ParentIdField extends DefaultField<typeof FIELD_TYPES.PARENT_ID, ParentIdValue> {
    }
    /** ===== Richtext Field ===== */
    interface RichtextField extends DefaultField<typeof FIELD_TYPES.RICH_TEXT, RichtextValue> {
        placeholder?: string;
        toolbarItems?: ToolbarItems[];
    }
    /** ===== Select Field ===== */
    interface SelectDefaultField extends DefaultField<typeof FIELD_TYPES.SELECT, SelectValue> {
        deviceEnabled?: false;
        options: SelectOption[];
    }
    interface SelectWithDeviceField extends DefaultField<typeof FIELD_TYPES.SELECT, SelectWithDeviceValue> {
        deviceEnabled: true;
        options: SelectOption[];
    }
    type SelectField = SelectDefaultField | SelectWithDeviceField;
    /** ===== Modifier Field ===== */
    interface ModifierField extends DefaultField<typeof FIELD_TYPES.MODIFIER, ModifierEntity.ModifierValue> {
    }
    /** ===== Preset Field ===== */
    interface PresetField extends DefaultField<typeof FIELD_TYPES.PRESET, PresetValue> {
    }
    /** ===== Style Field ===== */
    interface StyleField extends DefaultField<typeof FIELD_TYPES.STYLES, StylesEntity.StyleValue> {
        /** Include field trong field set được add thêm */
        include?: string[];
        /** Exclude field trong field set bị remove đi */
        exclude?: string[];
        /** Trạng thái disable pseudo */
        disablePseudo?: boolean;
        /** Cho phép style field hiển thị trong screen */
        useScreen?: boolean;
        /** List class name đính kèm được nối thêm  */
        selector?: string | string[];
        /**
         * Class name thay thế cho element id
         */
        elementClassName?: string;
    }
    /** ===== Keyframes Field ===== */
    interface KeyframesField extends DefaultField<typeof FIELD_TYPES.KEYFRAMES, KeyFramesEntity.IKeyframes> {
    }
    /** ===== Visibility Field ===== */
    interface VisibilityField extends DefaultField<typeof FIELD_TYPES.VISIBILITY, VisibilityWithDevice> {
    }
    /** ===== Image Picker Field ===== */
    interface ImageDefaultField extends DefaultField<typeof FIELD_TYPES.IMAGE_PICKER, MediaEntity.ImageItem | {}> {
        deviceEnabled?: false;
    }
    interface ImageWithDeviceField extends DefaultField<typeof FIELD_TYPES.IMAGE_PICKER, ValueWithDevice<MediaEntity.ImageItem>> {
        deviceEnabled: true;
    }
    type ImageField = ImageDefaultField | ImageWithDeviceField;
    /** ===== Images Picker Field ===== */
    interface ImagesDefaultField extends DefaultField<typeof FIELD_TYPES.IMAGES_PICKER, MediaEntity.ImageItem[]> {
        deviceEnabled?: false;
    }
    interface ImagesWithDeviceField extends DefaultField<typeof FIELD_TYPES.IMAGES_PICKER, ValueWithDevice<MediaEntity.ImageItem[]>> {
        deviceEnabled: true;
    }
    type ImagesField = ImagesDefaultField | ImagesWithDeviceField;
    /** ===== Video Picker Field ===== */
    interface VideoDefaultField extends DefaultField<typeof FIELD_TYPES.VIDEO_PICKER, MediaEntity.VideoItem | {}> {
        deviceEnabled?: false;
    }
    interface VideoWithDeviceField extends DefaultField<typeof FIELD_TYPES.VIDEO_PICKER, ValueWithDevice<MediaEntity.VideoItem | {}>> {
        deviceEnabled: true;
    }
    type VideoField = VideoDefaultField | VideoWithDeviceField;
    /** ===== Videos Picker Field ===== */
    interface VideosDefaultField extends DefaultField<typeof FIELD_TYPES.VIDEOS_PICKER, MediaEntity.VideoItem[]> {
        deviceEnabled?: false;
    }
    interface VideosWithDeviceField extends DefaultField<typeof FIELD_TYPES.VIDEOS_PICKER, ValueWithDevice<MediaEntity.VideoItem[]>> {
        deviceEnabled: true;
    }
    type VideosField = VideosDefaultField | VideosWithDeviceField;
    /** ===== Switch Field ===== */
    interface SwitchField extends DefaultField<typeof FIELD_TYPES.SWITCH, SwitchValue> {
        labelVariant?: 'label' | 'title';
    }
    /** ===== Table Field ===== */
    interface TableField extends DefaultField<typeof FIELD_TYPES.TABLE, TableValue> {
    }
    /** ===== VideoUrl Field ===== */
    interface VideoUrlField extends DefaultField<typeof FIELD_TYPES.VIDEO_URL, VideoInfoEntity | {}> {
    }
    /** ===== Slider Field ===== */
    interface SliderDefaultField extends DefaultField<typeof FIELD_TYPES.SLIDER, SliderFieldValue>, SliderFieldOptions {
        deviceEnabled?: false;
    }
    interface SliderWithDeviceField extends DefaultField<typeof FIELD_TYPES.SLIDER, SliderWithDeviceFieldValue>, SliderFieldWithDeviceOptions {
        deviceEnabled: true;
    }
    type SliderField = SliderDefaultField | SliderWithDeviceField;
    /** ===== MakeUp Field ===== */
    interface MakeUpField extends DefaultStaticField<typeof STATIC_FIELD_TYPES.MARK_UP> {
        id: UniqueId;
        default: MarkUpValue;
    }
    /** ===== Screen Picker Field ===== */
    interface ScreenPickerField extends DefaultField<typeof FIELD_TYPES.SCREEN_PICKER, TextFieldValue> {
        for: ScreenPickerType;
    }
    /** ===== Hidden Field ===== */
    interface HiddenField extends DefaultField<typeof STATIC_FIELD_TYPES.HIDDEN, HiddenValue> {
    }
    /** ===== Header Field ===== */
    interface HeaderField extends DefaultStaticField<typeof STATIC_FIELD_TYPES.HEADER> {
        label: string;
    }
    /** ===== Mega menu Field ===== */
    interface MegaMenuField extends DefaultField<typeof FIELD_TYPES.MEGA_MENU, MegaMenuValue> {
        default: MegaMenuValue;
    }
    /** ===== Menu Field ===== */
    interface MenuField extends DefaultField<typeof FIELD_TYPES.MENU, MenuValue> {
        default: MenuValue;
    }
    /** ===== Navigation Field ===== */
    interface NavigationField extends DefaultField<typeof FIELD_TYPES.NAVIGATION, NavigationValue> {
        default: NavigationValue;
    }
    /** ===== Navigation hamburger Field ===== */
    interface NavigationHamburgerField extends DefaultField<typeof FIELD_TYPES.NAVIGATION_HAMBURGER, NavigationValue> {
        default: NavigationHamburgerValue;
    }
    /** ===== Divider Field ===== */
    interface DividerField extends DefaultStaticField<typeof STATIC_FIELD_TYPES.DIVIDER> {
    }
    /** ===== Product Picker Field ===== */
    interface ProductPickerField extends DefaultField<typeof FIELD_TYPES.PRODUCT_PICKER, ProductEntity.ProductInfo | {}> {
    }
    /** ===== Blog Picker Field ===== */
    interface BlogPickerField extends DefaultField<typeof FIELD_TYPES.BLOG_PICKER, BlogEntity.Blog | {}> {
    }
    /** ===== Article Picker Field ===== */
    interface ArticlePickerField extends DefaultField<typeof FIELD_TYPES.ARTICLE_PICKER, ArticleEntity.Article | {}> {
    }
    /** ===== Collection Picker Field ===== */
    interface CollectionPickerField extends DefaultField<typeof FIELD_TYPES.COLLECTION_PICKER, CollectionEntity.Collection | {}> {
    }
    /** ===== Carousel ID Field ===== */
    interface CarouselIdField extends DefaultField<typeof FIELD_TYPES.CAROUSEL_ID, string> {
    }
    /** ===== Font Picker Field ===== */
    interface FontPickerField extends DefaultField<typeof FIELD_TYPES.FONT_PICKER, FontEntity.MyFont | {}> {
    }
    /** ===== Product List Field ===== */
    interface ProductListField extends DefaultField<typeof FIELD_TYPES.PRODUCT_LIST, Array<ProductEntity.ProductInfo> | []> {
    }
    type Field = HiddenField | HeaderField | DividerField | MakeUpField | TextField | ActionField | AttributesField | ButtonGroupField | CheckboxField | ChildrenIdField | CollectionField | CollectionListField | ColorField | CssCodeField | DatePickerField | GridAreaField | IconField | LiquidField | ParentIdField | RichtextField | SelectField | SliderField | SwitchField | TableField | VideoUrlField | ModifierField | StyleField | KeyframesField | VisibilityField | ImageField | ImagesField | VideoField | VideosField | ScreenPickerField | ProductPickerField | BlogPickerField | ArticlePickerField | CollectionPickerField | CarouselIdField | FontPickerField | ProductListField | PresetField | MegaMenuField | MenuField | NavigationField | NavigationHamburgerField;
    export type Settings = Field[];
    export type Element = (DefaultElement & {
        settings: Settings;
    }) | BlockElement;
    export {};
}
