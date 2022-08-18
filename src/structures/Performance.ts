import { LimitedCollection } from 'discord.js';
import { Options } from '../utility/Options';

type PerformanceOptions = {
    interval?: number,
    maxDataPoints?: number,
};

export class Performance<T extends Record<string, unknown>> {
    public current: T;

    public interval: number;

    public latest: T | null;

    public readonly dataPoints: LimitedCollection<number, T>;

    constructor(options?: PerformanceOptions) {
        this.current = {} as T;
        this.dataPoints = new LimitedCollection({
            maxSize: options?.maxDataPoints ?? Options.performanceMaxDataPoints,
        });
        this.interval = options?.interval ?? Options.performanceInterval;
        this.latest = null;
    }

    public addData(key: keyof T, value: T[keyof T]) {
        this.current[key] = value;
    }

    public addDataPoint() {
        const latestTimestamp = this.dataPoints.firstKey();

        if (
            latestTimestamp
            && Date.now() > latestTimestamp + this.interval
        ) {
            this.dataPoints.set(Date.now(), this.current);
        }

        this.latest = this.current;
    }
}