import { PaginationEntity } from '../pagination.entity';
import { FileFontEntity } from './file-font.entity';
import { GoogleFontEntity } from './google-font.entity';
import { ManualFontEntity } from './manual-font.entity';

export declare namespace FontEntity {
    type FontIO = GoogleFontEntity.FieldItem | FileFontEntity.FieldItem | ManualFontEntity.FieldItem;
    interface CreateInput {
        label: string;
        family: string;
        fontWeight?: string;
        italic?: boolean;
        url?: string;
    }
    type MyFont = FileFontEntity.FieldItem | ManualFontEntity.FieldItem;
    interface MyFontList extends PaginationEntity.PaginationResponse<MyFont> {
    }
}
export type * from './file-font.entity';
export type * from './google-font.entity';
export type * from './manual-font.entity';
export type * from './recent-font.entity';
