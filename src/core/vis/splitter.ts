import Rectangle from "@/core/vis/rectangle";
import { Direction } from "@/core/vis/enum";

export class Splitter {
    explicit: boolean = false;
    constructor(public rect: Rectangle, public direction: Direction) {

    }
}

export class AroundSplitter {
    constructor(public up: Splitter | null, public down: Splitter | null, public left: Splitter | null, public right: Splitter | null) {

    }
}