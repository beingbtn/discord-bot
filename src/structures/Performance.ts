import { Collection } from 'discord.js';
import { Options } from '../utility/Options';

/* eslint-disable no-underscore-dangle */

type PerformanceOptions = {
    interval?: number,
    maxDataPoints?: number,
};

export class Performance {
    public current: Collection<string, number>;

    public interval: number;

    public latest: Collection<string, number> | null;

    public readonly dataPoints: Collection<string, number>[];

    public readonly maxDataPoints: number;

    constructor(options?: PerformanceOptions) {
        this.current = new Collection();
        this.dataPoints = [];
        this.interval = options?.interval ?? Options.performanceInterval;
        this.latest = null;
        this.maxDataPoints = options?.maxDataPoints ?? Options.performanceMaxDataPoints;
    }

    public addData(key: string) {
        this.current.set(key, Date.now());
    }

    public addDataPoint() {
        const latestTimestamp = this.dataPoints[0]?.get('_timestamp');

        if (
            latestTimestamp
            && Date.now() > latestTimestamp + this.interval
        ) {
            this.current.set('_timestamp', Date.now());
            this.dataPoints.push(this.current);
            this.dataPoints.length = this.maxDataPoints;
        }

        this.latest = this.current;
    }
}