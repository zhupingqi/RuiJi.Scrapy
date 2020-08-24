import { Differ } from "@/core/diff/differ";

enum ChangeType {
    Unchanged,
    Deleted,
    Inserted,
    Imaginary,
    Modified
}

export class DiffBlock {
    constructor(public deleteStartA: number, public deleteCountA: number, public insertStartB: number, public insertCountB: number) { }
}

export class DiffResult {
    constructor(public piecesOld: string[], public piecesNew: string[], public diffBlocks: DiffBlock[]) { }
}

class DiffPiece {
    subPieces: DiffPiece[] = [];

    constructor(public text: string, public type: ChangeType = ChangeType.Imaginary, public position: number | null = null) { }
}

export class DiffPaneModel {
    lines: DiffPiece[] = [];

    constructor() { }
}

export class InlineDiff {
    differ: Differ = new Differ();

    constructor() {
    }

    buildDiffModel(oldText: string, newText: string): DiffPaneModel {
        var model = new DiffPaneModel();
        var diffResult = this.differ.createLineDiffs(oldText, newText, true, false);

        InlineDiff.BuildDiffPieces(diffResult, model.lines);
        return model;
    }

    static BuildDiffPieces(diffResult: DiffResult, pieces: DiffPiece[]) {
        let bPos: number = 0;

        diffResult.diffBlocks.forEach(diffBlock => {
            for (; bPos < diffBlock.insertStartB; bPos++)
                pieces.push(new DiffPiece(diffResult.piecesNew[bPos], ChangeType.Unchanged, bPos + 1));

            let i = 0;

            for (; i < Math.min(diffBlock.deleteCountA, diffBlock.insertCountB); i++)
                pieces.push(new DiffPiece(diffResult.piecesOld[i + diffBlock.deleteStartA], ChangeType.Deleted));

            i = 0;

            for (; i < Math.min(diffBlock.deleteCountA, diffBlock.insertCountB); i++) {
                pieces.push(new DiffPiece(diffResult.piecesNew[i + diffBlock.insertStartB], ChangeType.Inserted, bPos + 1));
                bPos++;
            }

            if (diffBlock.deleteCountA > diffBlock.insertCountB) {
                for (; i < diffBlock.deleteCountA; i++)
                    pieces.push(new DiffPiece(diffResult.piecesOld[i + diffBlock.deleteStartA], ChangeType.Deleted));
            }
            else {
                for (; i < diffBlock.insertCountB; i++) {
                    pieces.push(new DiffPiece(diffResult.piecesNew[i + diffBlock.insertStartB], ChangeType.Inserted, bPos + 1));
                    bPos++;
                }
            }
        });

        for (; bPos < diffResult.piecesNew.length; bPos++)
            pieces.push(new DiffPiece(diffResult.piecesNew[bPos], ChangeType.Unchanged, bPos + 1));
    }
}