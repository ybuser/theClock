const timer = document.querySelector(".timer-time"),
	timerSettingButton = document.querySelector(".timer-settingButton"),
	timerStartButton = document.querySelector(".timer-start"),
	timerResetButton = document.querySelector(".timer-reset"),
	timerStopButton = document.querySelector(".timer-stop");
let interval;

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

function setClockNumber(hour, minute, second) {
	timer.textContent = `${hour < 10 ? "0" + hour : hour} : ${
		minute < 10 ? "0" + minute : minute
	} : ${second < 10 ? "0" + second : second}`;
}

function processSetting() {
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

function timerCountDown(times) {
	console.log("Running");
	if (times.totalsecond === 0) {
		clearInterval(interval);
	}
	times.totalsecond -= times.totalsecond > 0 ? 1 : 0;
	setClock(
		String(times.hour()),
		String(times.minute()),
		String(times.second())
	);
}

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

function timerStop() {
	clearInterval(interval);
}

function timerReset() {
	clearInterval(interval);
	setClockNumber(0, 0, 0);
}

function init() {
	timerSettingButton.addEventListener("click", processSetting);
	timerStartButton.addEventListener("click", timerStart);
	timerStopButton.addEventListener("click", timerStop);
	timerResetButton.addEventListener("click", timerReset);
}

init();
