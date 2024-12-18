export declare namespace ShopifyFileEntity {
    interface StagedUploadInput {
        fileSize?: string;
        filename: string;
        httpMethod?: string;
        mimeType: string;
        resource: string;
    }
    interface StagedUploadParameter {
        name: string;
        value: string;
    }
    interface StagedMediaUploadTarget {
        url: string;
        resourceUrl: string;
        parameters: StagedUploadParameter[];
    }
    interface UserError {
        field: string[];
        message: string;
    }
    interface StagedUploadsCreatePayload {
        stagedTargets: StagedMediaUploadTarget[];
        userErrors: UserError[];
    }
    interface FileCreateInput {
        alt: string;
        contentType: string;
        originalSource: string;
    }
    interface FileError {
        code: string;
        details: string;
        message: string;
    }
    interface FileCreateResult {
        files: Array<{
            id: string;
        }>;
    }
}
