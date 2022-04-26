import one from './en-US.json';

export const locales: {
    [key: string]: {
        [key: string]: {
            message: string,
        } | undefined
    }
} = {
    'en-US': one,
};