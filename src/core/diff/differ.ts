import { DiffResult, DiffBlock } from "@/core/diff/inline";

enum Edit {
    None,
    DeleteRight,
    DeleteLeft,
    InsertDown,
    InsertUp
}

class EditLengthResult {
    constructor(public editLength: number = 0, public startX: number = 0, public endX: number = 0, public startY: number = 0, public endY: number = 0, public lastEdit: Edit | null = null) { }
}

class ModificationData {
    constructor(public rawData: string, public hashedPieces: number[] = [], public modifications: boolean[] = [], public pieces: string[] = []) { }
}

export class Differ {
    createLineDiffs(oldText: string, newText: string, ignoreWhitespace: boolean, ignoreCase: boolean): DiffResult {
        return this.createCustomDiffs(oldText, newText, ignoreWhitespace, ignoreCase, (str: string) => {
            str = str.replace(/\r\n/g, '\n');

            return str.split(/\n/g);
        });
    }

    createCustomDiffs(oldText: string, newText: string, ignoreWhitespace: boolean, ignoreCase: boolean, chunker: (str: string) => string[]): DiffResult {
        var pieceHash = new Map<string, number>();
        var lineDiffs: DiffBlock[] = [];

        var modOld = new ModificationData(oldText);
        var modNew = new ModificationData(newText);

        Differ.BuildPieceHashes(pieceHash, modOld, ignoreWhitespace, ignoreCase, chunker);
        Differ.BuildPieceHashes(pieceHash, modNew, ignoreWhitespace, ignoreCase, chunker);

        Differ.BuildModificationData0(modOld, modNew);

        let piecesALength: number = modOld.hashedPieces.length;
        let piecesBLength: number = modNew.hashedPieces.length;
        let posA: number = 0;
        let posB: number = 0;

        do {
            while (posA < piecesALength
                && posB < piecesBLength
                && !modOld.modifications[posA]
                && !modNew.modifications[posB]) {
                posA++;
                posB++;
            }

            let beginA: number = posA;
            let beginB: number = posB;
            for (; posA < piecesALength && modOld.modifications[posA]; posA++);

            for (; posB < piecesBLength && modNew.modifications[posB]; posB++);

            let deleteCount: number = posA - beginA;
            let insertCount: number = posB - beginB;

            if (deleteCount > 0 || insertCount > 0) {
                lineDiffs.push(new DiffBlock(beginA, deleteCount, beginB, insertCount));
            }
        } while (posA < piecesALength && posB < piecesBLength);

        return new DiffResult(modOld.pieces, modNew.pieces, lineDiffs);
    }

    private static CalculateEditLength(A: number[], startA: number, endA: number, B: number[], startB: number, endB: number, forwardDiagonal: number[], reverseDiagonal: number[]): EditLengthResult {
        if (A.length === 0 && B.length === 0) {
            return new EditLengthResult();
        }

        let lastEdit: Edit = Edit.None;
        let N = endA - startA;
        let M = endB - startB;
        let MAX = M + N + 1;
        let HALF = MAX / 2;
        let delta = N - M;
        let deltaEven: boolean = (delta % 2 === 0);

        forwardDiagonal[1 + HALF] = 0;
        reverseDiagonal[1 + HALF] = N + 1;

        for (let D = 0; D <= HALF; D++) {
            
            for (let k = -D; k <= D; k += 2) {
                let kIndex = k + HALF;
                let x: number = 0;
                let y: number = 0;
                if (k === -D || (k !== D && forwardDiagonal[kIndex - 1] < forwardDiagonal[kIndex + 1])) {
                    x = forwardDiagonal[kIndex + 1];
                    lastEdit = Edit.InsertDown;
                }
                else {
                    x = forwardDiagonal[kIndex - 1] + 1;
                    lastEdit = Edit.DeleteRight;
                }
                y = x - k;
                let startX = x;
                let startY = y;

                while (x < N && y < M && A[x + startA] === B[y + startB]) {
                    x += 1;
                    y += 1;
                }

                forwardDiagonal[kIndex] = x;

                if (!deltaEven) {
                    let revX: number = 0;
                    let revY: number = 0;

                    if ((k - delta) >= (-D + 1) &&( k - delta) <= (D - 1)) {
                        let revKIndex = (k - delta) + HALF;
                        revX = reverseDiagonal[revKIndex];
                        revY = revX - k;
                        if (revX <= x && revY <= y) {
                            var res = new EditLengthResult();
                            res.editLength = 2 * D - 1;
                            res.startX = startX + startA;
                            res.startY = startY + startB;
                            res.endX = x + startA;
                            res.endY = y + startB;
                            res.lastEdit = lastEdit;
                            return res;
                        }
                    }
                }
            }

            for (let k = -D; k <= D; k += 2) {
                let kIndex = k + HALF;
                let x: number = 0;
                let y: number = 0;

                if (k === -D || (k !== D && reverseDiagonal[kIndex + 1] <= reverseDiagonal[kIndex - 1])) {
                    x = reverseDiagonal[kIndex + 1] - 1;
                    lastEdit = Edit.DeleteLeft;
                }
                else {
                    x = reverseDiagonal[kIndex - 1];
                    lastEdit = Edit.InsertUp;
                }
                y = x - (k + delta);

                let endX = x;
                let endY = y;

                while (x > 0 && y > 0 && A[startA + x - 1] === B[startB + y - 1]) {
                    x -= 1;
                    y -= 1;
                }

                reverseDiagonal[kIndex] = x;

                if (deltaEven) {
                    let forX: number = 0;
                    let forY: number = 0;
                    if (k + delta >= -D && k + delta <= D) {
                        let forKIndex = (k + delta) + HALF;
                        forX = forwardDiagonal[forKIndex];
                        forY = forX - (k + delta);
                        if (forX >= x && forY >= y) {
                            var res = new EditLengthResult();
                            res.editLength = 2 * D;
                            res.startX = x + startA;
                            res.startY = y + startB;
                            res.endX = endX + startA;
                            res.endY = endY + startB;
                            res.lastEdit = lastEdit;
                            return res;
                        }
                    }
                }
            }
        }

        return new EditLengthResult();
    }

    protected static BuildModificationData0(A: ModificationData, B: ModificationData) {
        let N = A.hashedPieces.length;
        let M = B.hashedPieces.length;
        let MAX = M + N + 1;
        let forwardDiagonal: number[] = new Array(MAX + 1).fill(0);
        let reverseDiagonal: number[] = new Array(MAX + 1).fill(0);

        Differ.BuildModificationData(A, 0, N, B, 0, M, forwardDiagonal, reverseDiagonal);
    }

    private static BuildModificationData(A: ModificationData, startA: number, endA: number, B: ModificationData, startB: number, endB: number, forwardDiagonal: number[], reverseDiagonal: number[]) {
        while (startA < endA && startB < endB && A.hashedPieces[startA] === B.hashedPieces[startB]) {
            startA++;
            startB++;
        }
        while (startA < endA && startB < endB && A.hashedPieces[endA - 1] === B.hashedPieces[endB - 1]) {
            endA--;
            endB--;
        }

        let aLength = endA - startA;
        let bLength = endB - startB;

        if (aLength > 0 && bLength > 0) {
            let res = Differ.CalculateEditLength(A.hashedPieces, startA, endA, B.hashedPieces, startB, endB, forwardDiagonal, reverseDiagonal);
            if (res.editLength <= 0) return;

            if (res.lastEdit === Edit.DeleteRight && res.startX - 1 > startA)
                A.modifications[--res.startX] = true;
            else if (res.lastEdit === Edit.InsertDown && res.startY - 1 > startB)
                B.modifications[--res.startY] = true;
            else if (res.lastEdit === Edit.DeleteLeft && res.endX < endA)
                A.modifications[res.endX++] = true;
            else if (res.lastEdit === Edit.InsertUp && res.endY < endB)
                B.modifications[res.endY++] = true;

            Differ.BuildModificationData(A, startA, res.startX, B, startB, res.startY, forwardDiagonal, reverseDiagonal);

            Differ.BuildModificationData(A, res.endX, endA, B, res.endY, endB, forwardDiagonal, reverseDiagonal);
        }
        else if (aLength > 0) {
            for (let i = startA; i < endA; i++)
                A.modifications[i] = true;
        }
        else if (bLength > 0) {
            for (let i = startB; i < endB; i++)
                B.modifications[i] = true;
        }
    }

    private static BuildPieceHashes(pieceHash: Map<string, number>, data: ModificationData, ignoreWhitespace: boolean, ignoreCase: boolean, chunker: (str: string) => string[]) {
        let pieces = data.rawData.trim() === "" ? [] : chunker(data.rawData);

        data.pieces = pieces;
        data.hashedPieces = new Array(pieces.length).fill(0);
        data.modifications = new Array(pieces.length).fill(false);

        for (let i = 0; i < pieces.length; i++) {
            let piece: string = pieces[i];
            if (ignoreWhitespace)
                piece = piece.trim();
            if (ignoreCase) piece =
                piece = piece.toUpperCase();

            if (pieceHash.has(piece)) {
                data.hashedPieces[i] = pieceHash.get(piece) as number;
            }
            else {
                data.hashedPieces[i] = pieceHash.size;
                pieceHash.set(piece, pieceHash.size);
            }
        }
    }
}