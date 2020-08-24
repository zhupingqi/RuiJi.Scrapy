
declare class Button {
    render(options: any, el: string | HTMLElement): void;
}

declare interface paypal {
    Button: Button;
}

declare global {
    const paypal: paypal;
    const braintree: any;
}

export = paypal;