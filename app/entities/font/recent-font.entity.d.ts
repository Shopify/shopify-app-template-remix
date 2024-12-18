import { FileFontEntity } from './file-font.entity';
import { GoogleFontEntity } from './google-font.entity';

export declare namespace RecentFontEntity {
    interface CreateInput {
        id: string;
        type: 'google' | 'my-font';
    }
    type ResponseItem = GoogleFontEntity.ResponseItem | FileFontEntity.Node;
    type ResponseList = ResponseItem[];
}
