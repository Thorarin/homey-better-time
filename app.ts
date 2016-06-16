/// <reference path="typings/Homey.d.ts" />
import * as SunCalc from "suncalc";
import { SpeechTime, HomeyPromised as homey } from "./HomeyPromised";
import * as moment from "moment";

module BetterTime {
	var getTimesForCurrentLocation = async function (date: moment.Moment) {
			let location = await homey.managers.geolocation.getLocation();
			//homey.log("latitude: " + location.latitude + ", longitude: " + location.longitude);
			Homey.log("Times for " + date.toDate());
			return SunCalc.getTimes(date.toDate(), location.latitude, location.longitude);
	}

	function isBetweenTimes(begin: string, end: string) {
		let now = moment().format("HH:mm");
		
		if (end < begin) {
			return now >= begin || now < end;
		} else {
			return now >= begin && now < end;
		}
	}

	function calculateEventMoment(times: SunCalc.SunCalcTimes, event: string, adjustment: number) {
		var result = moment(times[event]);
		result.add(adjustment, 'minutes');
		return result;		
	}
	
	export function init() {
		homey.managers.flow.on('condition.time_between', async function(args) {
			return isBetweenTimes(args.begin, args.end);
		});

		homey.managers.flow.on('condition.between_solar_events', async function(args) {
			let now = moment();
			let times = await getTimesForCurrentLocation(now);

			var begin = calculateEventMoment(times, args.beginEvent, args.beginAdjustment);
			var end = calculateEventMoment(times, args.endEvent, args.endAdjustment);

			if (end < begin) {
				// Calculate solar event times for tomorrow and use them for end.
				let tomorrow = moment().add(1, 'day');
				let timesTomorrow = await getTimesForCurrentLocation(tomorrow);
				end = calculateEventMoment(timesTomorrow, args.endEvent, args.endAdjustment);
			}

			let result = now >= begin && now < end;
			Homey.log(`Is ${now.format()} between ${begin.format()} and ${end.format()}? ${result}`);

			return result;
		});

		Homey.manager('flow').on('condition.time_after', function(callback, args) {
			setTimeout(() => { callback(null, true);}, 1000);
		});
		
		Homey.manager('flow').on('condition.nighttime', async function(callback, args) {
			Homey.log("Nighttime?");
			Homey.log(JSON.stringify(Homey));
			Homey.log(JSON.stringify(Homey.manager('flow')));

			let location = await homey.managers.geolocation.getLocation();
			Homey.log(JSON.stringify(SunCalc.getTimes(new Date(2016, 11, 30), location.latitude, location.longitude)));

			let pos = SunCalc.getPosition(moment('2016-06-11T23:43:29.523Z').toDate(), location.latitude, location.longitude);
			Homey.log(JSON.stringify(pos));
			
			var times = await getTimesForCurrentLocation(moment());
			
			// format sunrise time from the Date object
			var sunriseStr = times.sunrise.getHours() + ':' + times.sunrise.getMinutes();

			// get position of the sun (azimuth and altitude) at today's sunrise
			//var sunrisePos = SunCalc.getPosition(times.sunrise, 51.5, -0.1);

			// get sunrise azimuth in degrees
			//var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;
			
			let now = new Date();
			now.toTimeString()	    
			
			Homey.log("Times " + JSON.stringify(times));
			Homey.log("Sunrise " + sunriseStr);
			Homey.log("Condition called " + new Date() + ", " + args.begin + ", " + args.end);
			callback(null, true);
		});

		// Homey.manager('speech-input').on('speech', function (speech: any[], callback) {
		// 	

		// 	triggers.
		// 	Homey.log(JSON.stringify(speech));
		// 	callback(null, true);
		// });

		function getDateDescription(date: moment.Moment) {
			var now = moment();
			if (date.isSame(now, 'day')) return __('today');
			if (date.isSame(now.clone().add(1, 'day'))) return __('tomorrow');
			if (date.isSame(now.clone().add(-1, 'day'))) return __('yesterday');

			return date.format(__('otherDate'));
		}

		homey.managers.speechInput.onSpeech(async function (speech) {
			Homey.log("Speech:");
			Homey.log(JSON.stringify(speech));

			let triggers = speech.triggers.map(item => item.id);

			if (triggers.indexOf("when") === -1) return false;

			var query: ('sunset' | 'sunrise');

			if (triggers.indexOf("sunset") >= 0 || (triggers.indexOf("sun") >= 0 && triggers.indexOf("set") >= 0)) {
				query = 'sunset'
			} else	if (triggers.indexOf("sun") >= 0 && triggers.indexOf("rise") >= 0) {
				query = 'sunrise';
			} else {
				return false;
			}

			Homey.log("Query type: " + query);

			var queryDay: moment.Moment;
			if (typeof speech.time === 'bool') {
				queryDay = moment();
			} else {
				let time = (<SpeechTime[]>speech.time)[0].time;
				queryDay = moment.utc([time.year, time.month, time.day]);
			}

			Homey.log("Query day: " + queryDay.format());
			
			var times = await getTimesForCurrentLocation(queryDay);
			var resultTime = moment(times[query]);
			Homey.log(moment().format() + " " + resultTime.format());
			let isPast = moment() > resultTime;
			let speechParams = { 
				day: getDateDescription(queryDay),
				time: resultTime.format(__('timeFormat'))
			};

			switch (query) {
				case 'sunset':
					Homey.manager('speech-output').say(isPast ? __('sunsetPast',  speechParams) : __('sunsetFuture',  speechParams), { session: speech.session });
					break;
				case 'sunrise':
					Homey.manager('speech-output').say(isPast ? __('sunrisePast',  speechParams) : __('sunriseFuture',  speechParams), { session: speech.session });
					break;
			}

			return true;
		})	
	}
}

export = BetterTime;
