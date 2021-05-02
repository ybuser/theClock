const timer = document.querySelector(".timer-time");

function setTime(string) {
	timer.textContent = string;
}

function init() {
	setTime("03:00");
}

init();
