/// <reference path="typings/Promise.d.ts" />

interface SpeechTrigger {
    id: string;
    position: number;
    text: string;
    time?: any;
}

export interface SpeechTime {
    transcript: string;
    index: number;
    time: {
        second: number | boolean;
        minute: number | boolean;
        hour: number | boolean;
        fuzzyhour: boolean;
        day: number;
        month: number;
        year: number;
    }
}

interface Speech {
    transcript: string;
    session: string;
    language: string;
    triggers: SpeechTrigger[];
    zones: any;
    time: SpeechTime[] | boolean;
}

type Nodeback = (err, callback) => void;
type HomeyEvent = (callback, args, ...extra) => void;
type Bla = (args, ...extra) => Promise<any>;
type SpeechCallback = (speech: Speech) => Promise<boolean>; 

function nodebackToPromise(func: Nodeback, ...args) {
    return new Promise(function(resolve, reject) {
        
    })
}

// function temp (err, data) {
//     if(err !== null) return reject(err);
//     resolve(data);
// }

class HomeyGeolocation {
    getLocation() : Promise<any> {
        return new Promise((resolve, reject) => {
            Homey.manager('geolocation').getLocation((err, data) => {
                if (err !== null) return reject(err);
                resolve(data);
            })    
        })
        
    }
}

class HomeyFlow {
    on(id: string, func: Bla ) {
        Homey.manager('flow').on(id, async function (callback, args, ...extra) {
            try {
                let result = await func(args, ...extra);
                callback(null, result);
            }
            catch (e) {
                callback(e, null);
            }
        });
    }
}

class HomeySpeechInput {
    onSpeech(func: SpeechCallback) {
        Homey.manager('speech-input').on('speech', async function(speech, callback) {
            try {
                let result = await func(speech);
                callback(null, result);
            }
            catch (e) {
                callback(e, null);
            }
        });
    }
}

interface HomeyManagers {
    geolocation: HomeyGeolocation;
    flow: HomeyFlow;
    speechInput: HomeySpeechInput;
}

export module HomeyPromised {
    export function log(str) {
        Homey.log(str);
    }
    
    export var managers: HomeyManagers;
    
    managers = {
        geolocation: new HomeyGeolocation(),
        flow: new HomeyFlow(),
        speechInput: new HomeySpeechInput()
    }
}