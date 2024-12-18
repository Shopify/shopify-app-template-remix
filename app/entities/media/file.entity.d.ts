export declare namespace FileEntity {
    interface FileErrorResult {
        filename: string;
        message: string;
    }
    interface FileError {
        code: string;
        details: string;
        message: string;
    }
    interface Image {
        id: string;
        width: number;
        height: number;
        url: string;
    }
    interface Preview {
        status: string;
        image: Image;
    }
    interface OriginalSource {
        url: string;
        width: number;
        height: number;
        mimeType: string;
    }
    type FileStatus = 'READY' | 'FAILED' | 'PROCESSING' | 'UPLOADED';
    interface DefaultNode {
        id: string;
        alt: string;
        fileStatus: FileStatus;
        fileErrors: FileError[];
    }
    interface NodeVideo extends DefaultNode {
        preview: Preview;
        originalSource: OriginalSource;
    }
    interface NodeImage extends DefaultNode {
        mimeType: string;
        image: Image;
    }
    interface NodeGenericFile extends DefaultNode {
        url: string;
        mimeType: string;
        preview: Preview;
        originalFileSize: number;
    }
    type NodeMedia = NodeImage | NodeVideo;
    type NodeFile = NodeImage | NodeVideo | NodeGenericFile;
}
