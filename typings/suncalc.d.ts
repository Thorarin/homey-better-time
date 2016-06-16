declare module 'suncalc' {
    interface SunCalcTimes {
        solarNoon: Date;
        nadir: Date;
        sunrise: Date;
        sunriseEnd: Date;
        sunset: Date;
        sunsetStart: Date;
        dawn: Date;
        dusk: Date;
        nauticalDawn: Date;
        nauticalDusk: Date;
        night: Date;
        nightEnd: Date;
        goldenHourEnd: Date;
        goldenHour: Date;
    }
    
    export function getTimes(time: Date, latitude: number, longitude: number): SunCalcTimes;
    export function getPosition(time: Date, latitude: number, longitude: number): any;
}
