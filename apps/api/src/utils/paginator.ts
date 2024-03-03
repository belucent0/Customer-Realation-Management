export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total;
        lastPage: number;
        currentPage: number;
        take: number;
        prev?: number | null;
        next?: number | null;
    };
}
