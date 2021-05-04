const timer = document.querySelector(".timer-time"),
	timerSettingButton = document.querySelector(".timer-settingButton"),
	timerStartButton = document.querySelector(".timer-start"),
	timerResetButton = document.querySelector(".timer-reset"),
	timerStopButton = document.querySelector(".timer-stop"),
	soundVolume = document.querySelector(".sound-volume");

let interval;

// Old Function, get String to display clock
function setClock(hour = 0, minute = 0, second = 0) {
	if (hour === "0" || hour === "") {
		timer.textContent = `${minute.length < 2 ? "0" + minute : minute} : ${
			second.length < 2 ? "0" + second : second
		}`;
	} else {
		timer.textContent = `${hour.length < 2 ? "0" + hour : hour} : ${
			minute.length < 2 ? "0" + minute : minute
		} : ${second.length < 2 ? "0" + second : second}`;
	}
}

// Get Number, Display clock
function setClockNumber(hour, minute, second) {
	timer.textContent = `${hour < 10 ? "0" + hour : hour} : ${
		minute < 10 ? "0" + minute : minute
	} : ${second < 10 ? "0" + second : second}`;
}

let soundOption = new Audio();
// Read setting panel and get time, and set the time
function processSetting(target) {
	const selectedSound = document.querySelector(".selected-sound"),
		selectedSoundVolume = document.querySelector(".sound-volume");
	console.dir(selectedSoundVolume);
	console.log(selectedSoundVolume.valueAsNumber);
	console.log(target);

	switch (selectedSound.value) {
		case "Alarm":
			soundOption = new Audio("./sound/Alarm.mp3");
			console.log(soundOption);
			break;
		case "Organ":
			soundOption = new Audio("./sound/Organ.mp3");
			break;
		default:
			soundOption = null;
			break;
	}

	soundOption.volume = selectedSoundVolume.valueAsNumber;

	const inputs = document
		.querySelector(".time-setting")
		.querySelectorAll("input");
	console.log(inputs);

	const hour = inputs[0].value,
		minute = inputs[1].value,
		second = inputs[2].value;

	setClock(hour, minute, second);
	timerStart();
}

// When time's up, make alarm
function makeAlarm() {
	soundOption.play();

	const stopAlarmButton = document.querySelector(".stop-alarm");
	stopAlarmButton.addEventListener("click", () => {
		soundOption.pause();
		soundOption.currentTime = 0;
	});
}

// Make timer run
function timerCountDown(times) {
	if (times.totalsecond === 0) {
		console.log("Time's Up!");
		makeAlarm();
		clearInterval(interval);
	}
	times.totalsecond -= times.totalsecond > 0 ? 1 : 0;
	setClock(
		String(times.hour()),
		String(times.minute()),
		String(times.second())
	);
}

// Time Trigger Function
function timerStart() {
	let currentTime = timer.textContent;
	let splittedTime = currentTime.split(":");
	let totalsecond;

	console.log(splittedTime);
	if (splittedTime.length == 2) {
		totalsecond =
			parseInt(splittedTime[0]) * 60 + parseInt(splittedTime[1]);
	} else {
		totalsecond =
			parseInt(splittedTime[0]) * 3600 +
			parseInt(splittedTime[1]) * 60 +
			parseInt(splittedTime[2]);
	}

	console.log(totalsecond, typeof totalsecond);

	const times = {
		totalsecond,
		hour: function () {
			return Math.floor(this.totalsecond / 3600);
		},
		minute: function () {
			return Math.floor((this.totalsecond % 3600) / 60);
		},
		second: function () {
			return Math.floor(this.totalsecond % 60);
		},
	};

	console.log(times.totalsecond, times.hour());

	interval = setInterval(timerCountDown, 1000, times);
}

// Timer Stop Function
function timerStop() {
	clearInterval(interval);
}

// Timer Reset Function
function timerReset() {
	clearInterval(interval);
	setClockNumber(0, 0, 0);
}

function testInput(e) {
	console.log(e.target.value, parseFloat(e.target.value) * 100);
}

// First Function
function init() {
	timerSettingButton.addEventListener("click", processSetting);
	timerStartButton.addEventListener("click", timerStart);
	timerStopButton.addEventListener("click", timerStop);
	timerResetButton.addEventListener("click", timerReset);
	soundVolume.addEventListener("input", testInput);
}

init();
