import { container } from '@sapphire/framework';

export class Base {
    readonly container: typeof container;

    constructor() {
        this.container = container;
    }
}