export declare namespace ResponseEntity {
    type Code = 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR' | 'UNAUTHORIZED' | 'BAD_REQUEST' | 'FORBIDDEN' | 'METHOD_NOT_ALLOWED' | 'CONFLICT' | 'TOO_MANY_REQUESTS' | 'WRONG_PASSWORD' | 'SERVICE_UNAVAILABLE' | 'VALIDATION_FAILED';
    interface Success<T> {
        success: true;
        payload: T;
    }
    interface Error {
        success: false;
        message: string;
        code: Code;
    }
}
