const VALIDATED = "was-validated";

let stopwatchDict = {},
	intervalDict = {},
	soundDict = {};

// Get Number, Display clock
function setClockNumber(stopwatch, hour, minute, second) {
	stopwatch.textContent = `${
		hour == 0 ? "" : hour < 10 ? "0" + hour + " : " : hour + " : "
	}${minute < 10 ? "0" + minute : minute} : ${
		second < 10 ? "0" + second : second
	}`;
}

// When time's up, make alarm
function makeAlarm(id) {
	const alarm = new Audio(`./sound/${stopwatchDict[id].sound}.mp3`);
	alarm.volume = stopwatchDict[id].volume - 0.2;
	alarm.play();

	const stopAlarmButton = document
		.getElementById(`${id}`)
		.querySelector(".stopwatch-stopalarm");
	stopAlarmButton.addEventListener("click", () => {
		alarm.pause();
		alarm.currentTime = 0;
	});
}

// Make stopwatch run
function stopwatchCountDown(id) {
	const remainTime = Math.ceil(
		(new Date(stopwatchDict[id].finishTime).getTime() - Date.now()) / 1000
	);

	if (remainTime < 0 || !stopwatchDict[id].running) {
		setClockNumber(
			document.getElementById(`${id}`).querySelector(".stopwatch-time"),
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
			document.getElementById(`${id}`).querySelector(".stopwatch-time"),
			hour,
			minute,
			second
		);
	}
}

// Time Trigger Function
function stopwatchStart(button) {
	const stopwatchBody = button.target.parentNode;

	const curTimes = stopwatchBody
		.querySelector(".stopwatch-time")
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
	stopwatchDict[stopwatchBody.id].finishTime = new Date(
		Date.now() + totalseconds * 1000
	);
	stopwatchDict[stopwatchBody.id].running = true;

	saveList();

	intervalDict[stopwatchBody.id] = setInterval(
		stopwatchCountDown,
		1000,
		stopwatchBody.id
	);
}

// Stopwatch Stop Function
function stopwatchStop(button) {
	const stopwatchBody = button.target.parentNode;
	clearInterval(intervalDict[stopwatchBody.id]);
	const totalTime = stopwatchDict[stopwatchBody.id].finishTime - Date.now();
	stopwatchDict[stopwatchBody.id].finishTime = new Date(totalTime);
	stopwatchDict[stopwatchBody.id].running = false;
	saveList();
}

// Stopwatch Reset Function
function stopwatchReset(button) {
	const stopwatchBody = button.target.parentNode;
	clearInterval(intervalDict[stopwatchBody.id]);
	setClockNumber(stopwatchBody.querySelector(".stopwatch-time"), 0, 0, 0);
	stopwatchDict[stopwatchBody.id].time = new Date(0);
	stopwatchDict[stopwatchBody.id].running = false;
	saveList();
}

function setDiv(div, id, item) {
	const title = item.title,
		volume = item.volume;
	div.innerHTML = `
	<div class="stopwatch-header">
		<p class="stopwatch-title">${title}</p>
		<button
			type="button"
			class="btn-close stopwatch-Close"
		></button>
	</div>
	<h3 class="stopwatch-time">00 : 00</h3>
	<button type="button" class="btn btn-success stopwatch-start">Start</button>
	<button type="button" class="btn btn-danger stopwatch-stop">Stop</button>
	<button type="button" class="btn btn-secondary stopwatch-reset">Reset</button>
	<button
		type="button"
		class="btn btn-primary"
		data-bs-toggle="modal"
		data-bs-target="#modal_${id}"
	>
		Settings
	</button>
	<button type="button" class="btn btn-primary stopwatch-stopalarm">
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
							class="btn-close stopwatch-SettingClose"
							data-bs-dismiss="modal"
							aria-label="Close"
						></button>
					</div>
					<div class="modal-body">
						<div class="stopwatch-settitle">
							<label
								for="stopwatch-titleinput"
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
								id="stopwatch-titleinput"
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
							class="btn btn-secondary stopwatch-buttomCloseSetting"
							data-bs-dismiss="modal"
						>
							Close
						</button>
						<button
							type="submit"
							class="btn btn-primary stopwatch-settingButton"
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
		stopwatchBody = modalBody.parentNode.parentNode.parentNode.parentNode,
		inputDiv = modalBody.querySelector(".modal-body"),
		timeInput = inputDiv
			.querySelector(".time-setting")
			.querySelectorAll("input");
	if (!modalBody.checkValidity()) {
		return;
	}

	modalBody.className = "row g-3 needs-validation";

	// Set Title
	stopwatchDict[stopwatchBody.id].title = modalBody
		.querySelector(".stopwatch-settitle")
		.querySelector("input").value;
	stopwatchBody.querySelector(".stopwatch-title").innerText =
		stopwatchDict[stopwatchBody.id].title;

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
		stopwatchBody.querySelector(".stopwatch-time"),
		hour,
		minute,
		second
	);

	stopwatchDict[stopwatchBody.id].finishTime = new Date(
		((hour * 60 + minute) * 60 + second) * 1000
	);
	stopwatchDict[stopwatchBody.id].running = false;

	// Set soundOption and soundVolume
	const selectedSound = modalBody.querySelector(".selected-sound"),
		selectedSoundVolume = modalBody.querySelector(".sound-volume");

	stopwatchDict[stopwatchBody.id].sound = selectedSound.value;
	stopwatchDict[stopwatchBody.id].volume = selectedSoundVolume.valueAsNumber;
	saveList();
	modalBody.querySelector(".stopwatch-SettingClose").click();
}

function saveList() {
	localStorage.setItem("stopwatch", JSON.stringify(stopwatchDict));
}

function createCurDiv() {
	const zeroTime = new Date(0);

	const thisStopwatch = {
		finishTime: zeroTime,
		running: false,
		sound: "Alarm",
		title: `Title${Object.keys(stopwatchDict).length}`,
		volume: 0.5,
	};
	createDiv(Date.now(), thisStopwatch);
}

function deleteStopwatch(button) {
	const stopwatchBody = button.target.parentNode.parentNode;
	stopwatchBody.remove();
	delete stopwatchDict[stopwatchBody.id];
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

	const titleInput = modalBody.querySelector(".stopwatch-settitle");
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
	const list = document.querySelector(".stopwatch-list");
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
		div.querySelector(".stopwatch-time"),
		timeObj.hour,
		timeObj.minute,
		timeObj.second
	);

	loadSetting(div, item);

	const stopwatchStartButton = div.querySelector(".stopwatch-start"),
		stopwatchStopButton = div.querySelector(".stopwatch-stop"),
		stopwatchResetButton = div.querySelector(".stopwatch-reset"),
		stopwatchStopAlarm = div.querySelector(".stopwatch-stopalarm"),
		stopwatchSaveChanges = div.querySelector(".stopwatch-settingButton"),
		stopwatchCloseChanges = div.querySelector(".stopwatch-SettingClose"),
		stopwatchButtomCloseChanges = div.querySelector(
			".stopwatch-buttomCloseSetting"
		),
		stopwatchClose = div.querySelector(".stopwatch-Close");

	stopwatchStartButton.addEventListener("click", stopwatchStart);
	stopwatchStopButton.addEventListener("click", stopwatchStop);
	stopwatchResetButton.addEventListener("click", stopwatchReset);
	stopwatchSaveChanges.addEventListener("click", makeSettings);
	stopwatchCloseChanges.addEventListener("click", () => {
		loadSetting(div, item);
	});
	stopwatchButtomCloseChanges.addEventListener("click", () => {
		loadSetting(div, item);
	});
	stopwatchClose.addEventListener("click", deleteStopwatch);

	list.appendChild(div);

	stopwatchDict[id] = item;
	saveList();

	if (item.running) {
		stopwatchStartButton.click();
	}
}

function loadStorage() {
	const item = JSON.parse(localStorage.getItem("stopwatch"));

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
	const createStopwatchButton = document
		.querySelector(".stopwatch-create")
		.querySelector("button");
	createStopwatchButton.addEventListener("click", createCurDiv);
}

init();
