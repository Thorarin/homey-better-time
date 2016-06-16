/// <reference path="typings/Promise.d.ts" />
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
function nodebackToPromise(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return new Promise(function (resolve, reject) {
    });
}
// function temp (err, data) {
//     if(err !== null) return reject(err);
//     resolve(data);
// }
var HomeyGeolocation = (function () {
    function HomeyGeolocation() {
    }
    HomeyGeolocation.prototype.getLocation = function () {
        return new Promise(function (resolve, reject) {
            Homey.manager('geolocation').getLocation(function (err, data) {
                if (err !== null)
                    return reject(err);
                resolve(data);
            });
        });
    };
    return HomeyGeolocation;
}());
var HomeyFlow = (function () {
    function HomeyFlow() {
    }
    HomeyFlow.prototype.on = function (id, func) {
        Homey.manager('flow').on(id, function (callback, args) {
            return __awaiter(this, void 0, void 0, function* () {
                var extra = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    extra[_i - 2] = arguments[_i];
                }
                try {
                    var result = yield func.apply(void 0, [args].concat(extra));
                    callback(null, result);
                }
                catch (e) {
                    callback(e, null);
                }
            });
        });
    };
    return HomeyFlow;
}());
var HomeySpeechInput = (function () {
    function HomeySpeechInput() {
    }
    HomeySpeechInput.prototype.onSpeech = function (func) {
        Homey.manager('speech-input').on('speech', function (speech, callback) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var result = yield func(speech);
                    callback(null, result);
                }
                catch (e) {
                    callback(e, null);
                }
            });
        });
    };
    return HomeySpeechInput;
}());
var HomeyPromised;
(function (HomeyPromised) {
    function log(str) {
        Homey.log(str);
    }
    HomeyPromised.log = log;
    HomeyPromised.managers = {
        geolocation: new HomeyGeolocation(),
        flow: new HomeyFlow(),
        speechInput: new HomeySpeechInput()
    };
})(HomeyPromised = exports.HomeyPromised || (exports.HomeyPromised = {}));
