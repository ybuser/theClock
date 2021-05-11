const timerButton = document.querySelector(".go-to-timer");

timerButton.addEventListener("click", () => {
	location.href = "./scripts/timer/timer.html";
});

const stopwatchButton = document.querySelector(".go-to-stopwatch");

stopwatchButton.addEventListener("click", () => {
	location.href = "./scripts/stopwatch/stopwatch.html";
});
