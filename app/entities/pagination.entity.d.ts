export declare namespace PaginationEntity {
    interface PaginationQueries {
        /**
         * Giới hạn bản ghi trả về
         */
        limit?: number;
        /**
         * cursor cuối của bản ghi trước đó, dùng để lấy trang trước
         */
        previous_cursor?: string;
        /**
         * cursor đầu của bản ghi tiếp theo, dùng để lấy trang tiếp theo
         */
        next_cursor?: string;
        /**
         * query tìm kiếm
         */
        q?: string;
        /**
         * Chiều sắp xếp paginate, bao gồm cả field và chiều sắp xếp phân cách bởi dấu cách
         */
        order?: string;
    }
    /**
     * @deprecated Dùng PaginationQueries để thay thế
     */
    interface PaginationQueriesSearch extends PaginationQueries {
    }
    interface PaginationResponse<T> {
        /**
         * Danh sách data trả về
         */
        data: T[];
        /**
         * cursor đầu của bản ghi tiếp theo, dùng để lấy trang tiếp theo,
         * trả ra undefined nếu không có trang tiếp theo
         */
        next_cursor?: string;
        /**
         * cursor cuối của bản ghi trước đó, dùng đẻlấy trang trước,
         * trả ra undefined nếu không có trang trước
         */
        previous_cursor?: string;
    }
}
