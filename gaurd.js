function newEvent(input) {
	var event = {};
	event.data = input;
	let year  = parseInt(input.substring(1, 5));
	let month = parseInt(input.substring(6, 8)) - 1;
	let day = parseInt(input.substring(9, 11));
	let hour = parseInt(input.substring(12, 14));
	let minute = parseInt(input.substring(15, 17));
	event.date = new Date(year, month, day, hour, minute, 0, 0);
	event.what_happaned = 0; //0 is a place holder. 1 is woke up, 2 is fell asleep, 3 is new gaurd
	let action = input.substring(19, 24);
	if (action === "wakes") {
		event.what_happaned = 1;
	}
	else if (action === "falls") {
		event.what_happaned = 2;
	}
	else {
		event.what_happaned = 3;
	}
	return event;
}

function newGaurd(number) {
	var gaurd = {};
	gaurd.id = number;
	gaurd.sleeping = false;
	gaurd.slept = new Date(0, 0, 0, 0, 0, 0, 0)
	gaurd.time_slept = 0;
	gaurd.minutes = [120];
	for (let i = 0; i < 120; i++) {
		gaurd.minutes[i] = 0;
	}
	gaurd.sleeping = function(start, end) {
		for (let i = start; i < end; i++) {
			gaurd.minutes[i]++;
		}
	};
	return gaurd;
}

function sortByDate(a, b) {
	if (a.date > b.date) {
		return 1;
	}
	if (a.date < b.date) {
		return -1;
	}
	return 0;
}

function countSleep(gaurd, event) {
	while (gaurd.slept < event.date) {
		if (gaurd.slept.getHours() == 23) {
			gaurd.minutes[gaurd.slept.getMinutes()]++;
		}
		else {
			gaurd.minutes[gaurd.slept.getMinutes() + 60]++;
		}
		gaurd.time_slept++;
		gaurd.slept.setTime(gaurd.slept.getTime() + 60000);
	}
}

let events = [];
let gaurds = [];

var lines = process.argv[2].split("\n");

for (let i = 0; i < lines.length; i++) {
	let temp = newEvent(lines[i]);
	events.push(temp);
}

events.sort(sortByDate);

for (let i = 0; i < events.length; i++) {
	if (events[i].what_happaned === 3) {
		let words = events[i].data.split(" ");
		let id = parseInt(words[3].substring(1, words[3].length));
		let exists = false;
		for (let i = 0; i < gaurds.length; i++) {
			if (gaurds[i].id === id) {
				exists = true;
			}
		}
		if (!exists) {
			let temp = newGaurd(id);
			gaurds.push(temp);
		}
	}
}

let current_gaurd_pos = -1;
let new_gaurd = -1;
let new_gaurd_pos = -1;

for (let i = 0; i < events.length; i++) {
	if (events[i].what_happaned === 1) {
		if (current_gaurd_pos !== -1) {
			countSleep(gaurds[current_gaurd_pos], events[i]);
			gaurds[current_gaurd_pos].sleeping = false;
		}
	}
	else if (events[i].what_happaned === 2) {
		if (current_gaurd_pos !== -1) {
			gaurds[current_gaurd_pos].sleeping = true;
			gaurds[current_gaurd_pos].slept = events[i].date;
		}
	}
	else {
		let words = events[i].data.split(" ");
		new_gaurd = parseInt(words[3].substring(1, words[3].length));
		for (let j = 0; j < gaurds.length; j++) {
			if (new_gaurd === gaurds[j].id) {
				new_gaurd_pos = j;
				break;
			}
		}
		if (current_gaurd_pos !== -1) {
			if (gaurds[current_gaurd_pos].sleeping) {
				gaurds[current_gaurd_pos].sleeping = false;
				countSleep(gaurds[current_gaurd_pos], events[i]);
			}

		}
		current_gaurd_pos = new_gaurd_pos;
	}
}

let total_min = 0;
let longest_gaurd = -1;
let watched_minute = 0;

for (let i = 0; i < gaurds.length; i++) {
	for (let j = 0; j < 120; j++) {
		if (gaurds[i].minutes[j] > total_min) {
			total_min = gaurds[i].minutes[j];
			longest_gaurd = gaurds[i].id;
			if (j < 60) {
				watched_minute = j;
			}
			else {
				watched_minute = j - 60;
			}
		}
	}
}
console.log(watched_minute * longest_gaurd);
