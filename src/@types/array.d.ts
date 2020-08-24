export { }
declare global {
    interface Array<T> {
        remove(elem: number | T | T[]): Array<T>;
        first(): T;
        last(): T;
        contains(o: T): boolean;
        min(callbackfn: (value: T, index: number, array: T[]) => any): any;
        max(callbackfn: (value: T, index: number, array: T[]) => any): any;
        group(callbackfn: (value: T) => any): Map<any, any[]>;
    }
}