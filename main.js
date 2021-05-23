const timerButton = document.querySelector(".go-to-timer");
timerButton.addEventListener("click", () => {
	location.href = "./scripts/timer/timer.html";
});

const stopwatchButton = document.querySelector(".go-to-stopwatch");
stopwatchButton.addEventListener("click", () => {
	location.href = "./scripts/stopwatch/stopwatch.html";
});

const backgroundclockButton = document.querySelector(".go-to-backgroundclock");
backgroundclockButton.addEventListener("click", () => {
	location.href = "./scripts/backgroundclock/backgroundclock.html";
});

const alarmButton = document.querySelector(".go-to-alarm");
alarmButton.addEventListener("click", () => {
	location.href = "./scripts/alarm/alarm.html";
});

const globaltimeButton = document.querySelector(".go-to-globaltime");
globaltimeButton.addEventListener("click", () => {
	location.href = "./scripts/globaltime/globaltime.html";
});

