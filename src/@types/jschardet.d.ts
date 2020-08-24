
declare interface jschardet {
    detect(data: string): any;
}

declare global {
    const jschardet: jschardet;
}


export = jschardet;