import { CurrentElementEntity } from './current-element.entity';
import { LibraryEntity } from './library.entity';

export declare namespace CurrentPageEntity {
    type ElementType = CurrentElementEntity.Element['type'];
    type Data = LibraryEntity.Page | LibraryEntity.Section | LibraryEntity.Block;
}
