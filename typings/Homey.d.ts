declare module Homey {
    export function log(str): void;
    export function manager(manager: string): any;
}

declare function __(str: string, params?: any) : string;