/// <reference path="../@types/array.d.ts" />

if (!Array.prototype.remove) {
    Array.prototype.remove = function <T>(elem: number | T | T[] | undefined): T[] {
        if (Array.isArray(elem)) {
            return this.filter(e => elem.indexOf(e) === -1);
        }
        else {
            let i = Number(elem);
            if (!isNaN(i)) {
                this.splice(i, 1);
                return this;
            } else
                return this.filter(e => e !== elem);
        }
    }
}

if (!Array.prototype.first) {
    Array.prototype.first = function <T>(): T {
        return this.length > 0 ? this[0] : null;
    }
}

if (!Array.prototype.last) {
    Array.prototype.last = function <T>(): T {
        return this.length > 0 ? this[this.length - 1] : null;
    }
}

if (!Array.prototype.contains) {
    Array.prototype.contains = function <T>(o: T) {
        let l = this.length;
        while (l-- > 0)
            if (this[l] === o) return true;
        return false;
    };
}

if (!Array.prototype.min) {
    Array.prototype.min = function <T>(s: Function): T  {
        let l = this.length;
        let min = s(this[0]);
        while (l-- > 0)
            if (s(this[l]) < min) min = s(this[l]);
        return min;
    };
}

if (!Array.prototype.max) {
    Array.prototype.max = function <T>(s: Function): any  {
        let l = this.length;
        let max = s(this[0]);
        while (l-- > 0)
            if (s(this[l]) > max) max = s(this[l]);
        return max;
    };
}

if (!Array.prototype.group) {
    Array.prototype.group = function <T>(selector: Function): Map<any, any[]> {
        let grp: Map<any, any[]> = new Map;

        for (let i = 0; i < this.length; i++) {
            let key = selector(this[i]);

            if (grp.has(key)) {
                grp.get(key)!.push(this[i]);
            }
            else {
                grp.set(key, [this[i]]);
            }
        }

        return grp;
    };
}