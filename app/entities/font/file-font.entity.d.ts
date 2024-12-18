import { PaginationEntity } from '../pagination.entity';
import { UniqueId } from '../shared-kernel';

export declare namespace FileFontEntity {
    type FileStatus = 'READY' | 'FAILED' | 'PROCESSING' | 'UPLOADED';
    interface DefaultNode {
        _id: string;
        label: string;
        family: string;
    }
    interface FileNode extends DefaultNode {
        fontWeight: string;
        italic: boolean;
        url: string;
        css: string;
    }
    interface ManualNode extends DefaultNode {
    }
    type Node = FileNode | ManualNode;
    interface ResponseList extends PaginationEntity.PaginationResponse<Node> {
    }
    interface PaginationQueryParams extends PaginationEntity.PaginationQueries {
        q?: string;
    }
    interface FieldItem {
        id: UniqueId;
        label: string;
        fontWeight: string;
        fontFamily: string;
        italic: boolean;
        url: string;
        css: string;
    }
    interface FieldItemList extends PaginationEntity.PaginationResponse<FieldItem> {
    }
    type FontWeight = '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
}
