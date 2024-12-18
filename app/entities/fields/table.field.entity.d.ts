export interface TableValueCol {
    data: string;
}
export interface TableBody {
    data: TableValueCol[];
}
export interface TableHead extends TableBody {
}
export interface TableValue {
    head: TableHead[];
    body: TableBody[];
    headColumn: number;
}
