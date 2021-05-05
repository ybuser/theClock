const VALIDATED = "was-validated";

let timerDict = {},
	intervalDict = {},
	soundDict = {};

// Get Number, Display clock
function setClockNumber(timer, hour, minute, second) {
	timer.textContent = `${
		hour == 0 ? "" : hour < 10 ? "0" + hour + " : " : hour + " : "
	}${minute < 10 ? "0" + minute : minute} : ${
		second < 10 ? "0" + second : second
	}`;
}

// When time's up, make alarm
function makeAlarm(id) {
	const alarm = new Audio(`./sound/${timerDict[id].sound}.mp3`);
	alarm.volume = timerDict[id].volume - 0.2;
	alarm.play();

	const stopAlarmButton = document
		.getElementById(`${id}`)
		.querySelector(".timer-stopalarm");
	stopAlarmButton.addEventListener("click", () => {
		alarm.pause();
		alarm.currentTime = 0;
	});
}

// Make timer run
function timerCountDown(id) {
	const remainTime = Math.ceil(
		(new Date(timerDict[id].finishTime).getTime() - Date.now()) / 1000
	);

	if (remainTime < 0 || !timerDict[id].running) {
		setClockNumber(
			document.getElementById(`${id}`).querySelector(".timer-time"),
			0,
			0,
			0
		);
		console.log("Time's Up!");
		makeAlarm(id);
		clearInterval(intervalDict[id]);
	} else {
		const second = parseInt(remainTime % 60);
		const minute = parseInt(remainTime / 60) % 60;
		const hour = parseInt(remainTime / 3600);
		setClockNumber(
			document.getElementById(`${id}`).querySelector(".timer-time"),
			hour,
			minute,
			second
		);
	}
}

// Time Trigger Function
function timerStart(button) {
	const timerBody = button.target.parentNode;

	const curTimes = timerBody
		.querySelector(".timer-time")
		.textContent.split(/\ : |d /);

	let day, hour, minute, second;

	for (let i = 0; i < curTimes.length; i++) {
		curTimes[i] = parseInt(curTimes[i]);
	}

	if (curTimes.length == 4) {
		day = curTimes[0];
		hour = curTimes[1];
		minute = curTimes[2];
		second = curTimes[3];
	} else if (curTimes.length == 3) {
		day = 0;
		hour = curTimes[0];
		minute = curTimes[1];
		second = curTimes[2];
	} else {
		day = 0;
		hour = 0;
		minute = curTimes[0];
		second = curTimes[1];
	}

	const totalseconds = ((day * 24 + hour) * 60 + minute) * 60 + second;
	timerDict[timerBody.id].finishTime = new Date(
		Date.now() + totalseconds * 1000
	);
	timerDict[timerBody.id].running = true;

	saveList();

	intervalDict[timerBody.id] = setInterval(
		timerCountDown,
		1000,
		timerBody.id
	);
}

// Timer Stop Function
function timerStop(button) {
	const timerBody = button.target.parentNode;
	clearInterval(intervalDict[timerBody.id]);
	const totalTime = timerDict[timerBody.id].finishTime - Date.now();
	timerDict[timerBody.id].finishTime = new Date(totalTime);
	timerDict[timerBody.id].running = false;
	saveList();
}

// Timer Reset Function
function timerReset(button) {
	const timerBody = button.target.parentNode;
	clearInterval(intervalDict[timerBody.id]);
	setClockNumber(timerBody.querySelector(".timer-time"), 0, 0, 0);
	timerDict[timerBody.id].time = new Date(0);
	timerDict[timerBody.id].running = false;
	saveList();
}

function setDiv(div, id, item) {
	const title = item.title,
		volume = item.volume;
	div.innerHTML = `
	<div class="timer-header">
		<p class="timer-title">${title}</p>
		<button
			type="button"
			class="btn-close timer-Close"
		></button>
	</div>
	<h3 class="timer-time">00 : 00</h3>
	<button type="button" class="btn btn-success timer-start">Start</button>
	<button type="button" class="btn btn-danger timer-stop">Stop</button>
	<button type="button" class="btn btn-secondary timer-reset">Reset</button>
	<button
		type="button"
		class="btn btn-primary"
		data-bs-toggle="modal"
		data-bs-target="#modal_${id}"
	>
		Settings
	</button>
	<button type="button" class="btn btn-primary timer-stopalarm">
		Stop Alarm
	</button>

	<div
		class="modal fade"
		id="modal_${id}"
		data-bs-backdrop="static"
		data-bs-keyboard="false"
		tabindex="-1"
		aria-labelledby="exampleModalLabel"
		aria-hidden="true"
	>
		<div class="modal-dialog">
			<div class="modal-content">
				<form class="row g-3 needs-validation" novalidate>
					<div class="modal-header">
						<h5 class="modal-title" id="exampleModalLabel">
							Clock Settings
						</h5>
						<button
							type="button"
							class="btn-close timer-SettingClose"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div class="modal-body">
						<div class="timer-settitle">
							<label
								for="timer-titleinput"
								class="col-form-label"
								required
								>Title:</label
							>
							<input
								type="text"
								class="form-control"
								value="${title}"
								aria-label="Username"
								aria-describedby="basic-addon1"
								id="timer-titleinput"
								required
							/>
							<div class="invalid-feedback">Please enter a title.</div>
						</div>
						<div class="mb-3 time-setting">
							<label for="time-setting-input" class="col-form-label"
								>Time:</label
							>
							<div class="container time-setting-input">
								<div class="row">
									<div class="col">
										<input
											type="number"
											min="0"
											value="0"
										/>
									</div>
									<div class="col"><p>:</p></div>
									<div class="col">
										<input
											type="number"
											min="0"
											max="59"
											value="0"
										/>
									</div>
									<div class="col"><p>:</p></div>
									<div class="col">
										<input
											type="number"
											min="0"
											max="59"
											value="0"
										/>
									</div>
								</div>
							</div>
						</div>
						<div>
							<label for="selected-sound" class="col-form-label"
								>Select Sound</label
							>
							<select
								class="form-select selected-sound"
								id="inputGroupSelect01"
							>
								<option value="Alarm">Alarm</option>
								<option value="Organ">Organ</option>
								<option value="Sound3">Sound3</option>
								<option value="Sound4">Sound4</option>
							</select>
						</div>
						<div>
							<label for="customRange2" class="form-label"
								>Sound Volume</label
							>
							<input
								type="range"
								class="form-range sound-volume"
								min="0"
								max="1"
								step="0.01"
								value="${volume}"
								id="customRange2"
							/>
						</div>
					</div>
					<div class="modal-footer">
						<button
							type="button"
							class="btn btn-secondary timer-buttomCloseSetting"
							data-bs-dismiss="modal"
						>
							Close
						</button>
						<button
							type="submit"
							class="btn btn-primary timer-settingButton"
						>
							Save changes
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
`;
}

function makeSettings(button) {
	const modalBody = button.target.parentNode.parentNode,
		timerBody = modalBody.parentNode.parentNode.parentNode.parentNode,
		inputDiv = modalBody.querySelector(".modal-body"),
		timeInput = inputDiv
			.querySelector(".time-setting")
			.querySelectorAll("input");
	if (!modalBody.checkValidity()) {
		return;
	}

	modalBody.className = "row g-3 needs-validation";

	// Set Title
	timerDict[timerBody.id].title = modalBody
		.querySelector(".timer-settitle")
		.querySelector("input").value;
	timerBody.querySelector(".timer-title").innerText =
		timerDict[timerBody.id].title;

	// SetTime
	const hour = isNaN(parseInt(timeInput[0].value))
			? (timeInput[0].value = 0)
			: parseInt(timeInput[0].value),
		minute = isNaN(parseInt(timeInput[1].value))
			? (timeInput[1].value = 0)
			: parseInt(timeInput[1].value),
		second = isNaN(parseInt(timeInput[2].value))
			? (timeInput[2].value = 0)
			: parseInt(timeInput[2].value);

	setClockNumber(
		timerBody.querySelector(".timer-time"),
		hour,
		minute,
		second
	);

	timerDict[timerBody.id].finishTime = new Date(
		((hour * 60 + minute) * 60 + second) * 1000
	);
	timerDict[timerBody.id].running = false;

	// Set soundOption and soundVolume
	const selectedSound = modalBody.querySelector(".selected-sound"),
		selectedSoundVolume = modalBody.querySelector(".sound-volume");

	timerDict[timerBody.id].sound = selectedSound.value;
	timerDict[timerBody.id].volume = selectedSoundVolume.valueAsNumber;
	saveList();
	modalBody.querySelector(".timer-SettingClose").click();
}

function saveList() {
	localStorage.setItem("timer", JSON.stringify(timerDict));
}

function createCurDiv() {
	const zeroTime = new Date(0);

	const thisTimer = {
		finishTime: zeroTime,
		running: false,
		sound: "Alarm",
		title: `Title${Object.keys(timerDict).length}`,
		volume: 0.5,
	};
	createDiv(Date.now(), thisTimer);
}

function deleteTimer(button) {
	const timerBody = button.target.parentNode.parentNode;
	timerBody.remove();
	delete timerDict[timerBody.id];
	saveList();
}

function timesFromTotalTime(totalTime) {
	if (totalTime < 0) totalTime = 0;
	const hour = Math.floor(totalTime / 3600);
	const minute = Math.floor((totalTime / 60) % 60);
	const second = Math.floor(totalTime % 60);
	return {
		hour,
		minute,
		second,
	};
}

function loadSetting(div, item) {
	const modalBody = div.querySelector(".modal-body");

	const totalTime = item.running
		? (new Date(item.finishTime).getTime() - Date.now()) / 1000
		: new Date(item.finishTime).getTime() / 1000;

	const titleInput = modalBody.querySelector(".timer-settitle");
	titleInput.value = item.title;

	const timeInputs = modalBody
		.querySelector(".time-setting-input")
		.querySelectorAll("input");
	const timeObj = timesFromTotalTime(Math.ceil(totalTime));
	timeInputs[0].value = timeObj.hour;
	timeInputs[1].value = timeObj.minute;
	timeInputs[2].value = timeObj.second;

	const selectSound = modalBody.querySelector(".selected-sound");
	selectSound.value = item.sound;

	modalBody.querySelector(".sound-volume").value = item.volume;
}

function createDiv(id, item) {
	const list = document.querySelector(".timer-list");
	const div = document.createElement("div");
	div.id = id;
	setDiv(div, id, item);

	// Fetch all the forms we want to apply custom Bootstrap validation styles to
	const forms = div.querySelectorAll(".needs-validation");

	// Loop over them and prevent submission
	Array.prototype.slice.call(forms).forEach(function (form) {
		form.addEventListener(
			"submit",
			function (event) {
				event.preventDefault();
				if (!form.checkValidity()) {
					event.stopPropagation();
				}

				form.classList.add(VALIDATED);
			}
			//false
		);
	});

	const totalTime = item.running
		? (new Date(item.finishTime).getTime() - Date.now()) / 1000
		: new Date(item.finishTime).getTime() / 1000;

	const timeObj = timesFromTotalTime(totalTime);
	setClockNumber(
		div.querySelector(".timer-time"),
		timeObj.hour,
		timeObj.minute,
		timeObj.second
	);

	loadSetting(div, item);

	const timerStartButton = div.querySelector(".timer-start"),
		timerStopButton = div.querySelector(".timer-stop"),
		timerResetButton = div.querySelector(".timer-reset"),
		timerStopAlarm = div.querySelector(".timer-stopalarm"),
		timerSaveChanges = div.querySelector(".timer-settingButton"),
		timerCloseChanges = div.querySelector(".timer-SettingClose"),
		timerButtomCloseChanges = div.querySelector(
			".timer-buttomCloseSetting"
		),
		timerClose = div.querySelector(".timer-Close");

	timerStartButton.addEventListener("click", timerStart);
	timerStopButton.addEventListener("click", timerStop);
	timerResetButton.addEventListener("click", timerReset);
	timerSaveChanges.addEventListener("click", makeSettings);
	timerCloseChanges.addEventListener("click", () => {
		loadSetting(div, item);
	});
	timerButtomCloseChanges.addEventListener("click", () => {
		loadSetting(div, item);
	});
	timerClose.addEventListener("click", deleteTimer);

	list.appendChild(div);

	timerDict[id] = item;
	saveList();

	if (item.running) {
		timerStartButton.click();
	}
}

function loadStorage() {
	const item = JSON.parse(localStorage.getItem("timer"));

	if (!item || Object.keys(item).length === 0) {
		createCurDiv();
		return;
	}

	for (const id in item) {
		createDiv(id, item[id]);
	}
}

// First Function
function init() {
	loadStorage();
	const createTimerButton = document
		.querySelector(".timer-create")
		.querySelector("button");
	createTimerButton.addEventListener("click", createCurDiv);
}

init();
