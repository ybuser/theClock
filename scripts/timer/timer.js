const VALIDATED = "was-validated";

let timerDict = {},
	intervalDict = {},
	soundDict = {};

// Get Number, Display clock
function setClockNumber(timer, hour, minute, second) {
	timer.textContent = `${
		hour === 0 ? "" : hour < 10 ? "0" + hour + " : " : hour + " : "
	}${minute < 10 ? "0" + minute : minute} : ${
		second < 10 ? "0" + second : second
	}`;
}

// When time's up, make alarm
function makeAlarm(id) {
	// alarm play
	const alarm = new Audio(`./sound/${timerDict[id].sound}.mp3`);
	alarm.volume = timerDict[id].volume;
	alarm.play();

	// stop button event
	const stopAlarmButton = document
		.getElementById(`${id}`)
		.querySelector(".timer-stopalarm");
	stopAlarmButton.addEventListener("click", () => {
		alarm.pause();
		alarm.currentTime = 0;
	});
}

// Make timer run, called every second
function timerCountDown(id) {
	// calculate remaintime
	const remainTime = (timerDict[id].finishTime - Date.now()) / 1000;
	// if not running, stop decreasing time
	// else if negative, set 00:00, clear interval and make alarm
	// else, show remaintime
	if (!timerDict[id].running) {
		clearInterval(intervalDict[id]);
	} else if (remainTime < 0) {
		setClockNumber(
			document.getElementById(`${id}`).querySelector(".timer-time"),
			0,
			0,
			0
		);
		console.log("Time's Up!");
		makeAlarm(id);

		timerDict[id].finishTime = 0;
		timerDict[id].running = false;
		saveList();

		clearInterval(intervalDict[id]);
	} else {
		const timeObj = timesFromTotalTime(Math.ceil(remainTime));
		setClockNumber(
			document.getElementById(`${id}`).querySelector(".timer-time"),
			timeObj.hour,
			timeObj.minute,
			timeObj.second
		);
	}
}

// When running, update bar
function progressBar(id) {
	const bar = document.getElementById(`${id}`).querySelector(".progress-bar");
	(function innerLoop() {
		if (timerDict[id].running) {
			const percentage =
				((timerDict[id].finishTime - Date.now()) * 100) /
				timerDict[id].totalTime;
			bar.style = `width: ${percentage}%`;
			setTimeout(innerLoop, 10);
		}
	})();
}

// Timer Start
function timerStart(button) {
	const timerBody = button.target.parentNode;

	if (timerDict[timerBody.id].finishTime === 0) {
		console.log("You can't start timer when it's 0:00");
		return;
	}

	if (!timerDict[timerBody.id].running) {
		timerDict[timerBody.id].finishTime += Date.now();
		timerDict[timerBody.id].running = true;
		saveList();
	}

	timerCountDown(timerBody.id);
	// Call function every second
	intervalDict[timerBody.id] = setInterval(
		timerCountDown,
		timerDict[timerBody.id].finishTime % 1000,
		timerBody.id
	);

	// move progress bar
	progressBar(timerBody.id);
}

// Timer Stop Function
function timerStop(button) {
	// Change setting and save
	const timerBody = button.target.parentNode;
	if (timerDict[timerBody.id].running) {
		const totalTime = timerDict[timerBody.id].finishTime - Date.now();
		timerDict[timerBody.id].finishTime = totalTime;
		timerDict[timerBody.id].running = false;
		saveList();

		// Bar setting
		const bar = timerBody.querySelector(".progress-bar");
		bar.style = `width: ${
			(totalTime / timerDict[timerBody.id].totalTime) * 100
		}%`;
		console.log(
			`width: ${(totalTime / timerDict[timerBody.id].totalTime) * 100}%`
		);
	}
}

// Timer Reset Function
function timerReset(button) {
	const timerBody = button.target.parentNode;

	// stop repeat
	clearInterval(intervalDict[timerBody.id]);

	// reset screen timer to initial setting
	const timeObj = timesFromTotalTime(
		timerDict[timerBody.id].totalTime / 1000
	);
	setClockNumber(
		timerBody.querySelector(".timer-time"),
		timeObj.hour,
		timeObj.minute,
		timeObj.second
	);

	// bar setting
	const bar = timerBody.querySelector(".progress-bar");
	bar.style = "width: 100%";

	// settings save
	timerDict[timerBody.id].finishTime = timerDict[timerBody.id].totalTime;
	timerDict[timerBody.id].running = false;
	saveList();
}

// Save settings
function makeSettings(button) {
	const modalBody = button.target.parentNode.parentNode,
		timerBody = modalBody.parentNode.parentNode.parentNode.parentNode,
		inputDiv = modalBody.querySelector(".modal-body"),
		timeInput = inputDiv
			.querySelector(".time-setting")
			.querySelectorAll("input"),
		selectedSound = modalBody.querySelector(".selected-sound"),
		selectedSoundVolume = modalBody.querySelector(".sound-volume"),
		bar = timerBody.querySelector(".progress-bar");

	modalBody.className = "row g-3 needs-validation";

	// if not valid, don't proceed
	if (!modalBody.checkValidity()) {
		return;
	}

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

	// Set bar
	bar.style = "width: 100%";

	// Save settings
	const totalMilliSeconds = ((hour * 60 + minute) * 60 + second) * 1000;
	timerDict[timerBody.id].finishTime = totalMilliSeconds;
	timerDict[timerBody.id].totalTime = totalMilliSeconds;
	timerDict[timerBody.id].running = false;
	clearInterval(intervalDict[timerBody.id]);
	timerDict[timerBody.id].sound = selectedSound.value;
	timerDict[timerBody.id].volume = selectedSoundVolume.valueAsNumber;
	saveList();

	// Close
	modalBody.querySelector(".timer-SettingClose").click();
}

// totaltime => {hour, minute, second}
function timesFromTotalTime(totalTime) {
	// no negative time
	if (totalTime < 0) totalTime = 0;

	// return hour, minute, second
	const hour = Math.floor(totalTime / 3600);
	const minute = Math.floor((totalTime / 60) % 60);
	const second = Math.floor(totalTime % 60);
	return {
		hour,
		minute,
		second,
	};
}

// Fill basic settings
function loadSetting(div, item) {
	const modalBody = div.querySelector(".modal-body"),
		titleInput = modalBody.querySelector(".timer-settitle"),
		timeInputs = modalBody
			.querySelector(".time-setting-input")
			.querySelectorAll("input"),
		selectSound = modalBody.querySelector(".selected-sound"),
		soundVolumeSetting = modalBody.querySelector(".sound-volume");

	// title setting
	titleInput.value = item.title;

	// time setting
	const totalTime = Math.ceil(item.totalTime / 1000);
	const timeObj = timesFromTotalTime(totalTime);
	timeInputs[0].value = timeObj.hour;
	timeInputs[1].value = timeObj.minute;
	timeInputs[2].value = timeObj.second;

	// soundoption setting
	selectSound.value = item.sound;

	// soundvolume setting
	soundVolumeSetting.value = item.volume;
}

// div html content
function setDiv(div, id, item) {
	const title = item.title,
		volume = item.volume;
	div.innerHTML = `
	<div class="timer-header">
		<p class="timer-title">${title}</p>
		<i class="bi bi-arrows-move timer-move p-4" style="cursor: move; visibility: hidden;" draggable=true></i>
		<button
			type="button"
			class="btn-close timer-Close"
			style="visibility: hidden;"
		></button>
	</div>
	<h3 class="timer-time">00 : 00</h3>
	<div class="progress">
  		<div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
	</div>
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

// Make new timerdiv
function createCurDiv() {
	// Basic settings
	const thisTimer = {
		finishTime: 0,
		totalTime: 0,
		running: false,
		sound: "Alarm",
		title: `Title${Object.keys(timerDict).length}`,
		volume: 0.5,
	};
	createDiv(Date.now(), thisTimer);
}

// visible add to Remove Button
function addVisibleButton(target) {
	target.target.querySelector(".timer-Close").style.visibility = "visible";
	target.target.querySelector(".timer-move").style.visibility = "visible";
}

// visible remove to Remove Button
function removeVisibleButton(target) {
	target.target.querySelector(".timer-Close").style.visibility = "hidden";
	target.target.querySelector(".timer-move").style.visibility = "hidden";
}

// Make timerdiv
function createDiv(id, item) {
	// set div
	const div = document.createElement("div");
	div.id = id;
	div.draggable = true;
	div.classList = "timer";
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

	// Clock to screen
	const totalTime = item.running
		? (item.finishTime - Date.now()) / 1000
		: item.finishTime / 1000;

	const timeObj = timesFromTotalTime(Math.ceil(totalTime));
	console.log(timeObj);
	setClockNumber(
		div.querySelector(".timer-time"),
		timeObj.hour,
		timeObj.minute,
		timeObj.second
	);

	// Bar to screen
	const bar = div.querySelector(".progress-bar");
	bar.style = `width: ${
		item.totalTime === 0
			? 100
			: ((totalTime < 0 ? 0 : totalTime) / (item.totalTime / 1000)) * 100
	}%`;

	// Setting input with item
	loadSetting(div, item);

	// Assign event to buttons
	const timerStartButton = div.querySelector(".timer-start"),
		timerStopButton = div.querySelector(".timer-stop"),
		timerResetButton = div.querySelector(".timer-reset"),
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

	// if mouse is over the div,
	div.addEventListener("mouseenter", addVisibleButton);
	div.addEventListener("mouseleave", removeVisibleButton);

	// div to screen
	const list = document.querySelector(".timer-list");
	list.appendChild(div);

	// if mouse drags div,
	const mouseDraggable = div.querySelector(".timer-move");
	const empty_div = document.createElement("div");
	empty_div.id = 0;
	empty_div.className = "timer";
	mouseDraggable.addEventListener("dragstart", (event) => {
		//event.target.parentNode.parentNode;
		console.dir(event.target.parentNode.parentNode.style.position);
		event.target.style.opacity = 0.1;
		console.log("Dragged!");
	});
	mouseDraggable.addEventListener("drag", (event) => {
		console.log(event.layerX, event.layerY);
		list.replaceChild(div, empty_div);
		div.style.position = "absolute";
		div.style.top = "20px";
		div.style.left = "20px";
	});
	console.dir(mouseDraggable);

	// add item to local dictionary, and save
	timerDict[id] = item;
	saveList();

	// if it is running, automatically click start
	if (item.running) {
		timerStartButton.click();
	}
}

// Delete timer and save
function deleteTimer(button) {
	// Screen remove
	const timerBody = button.target.parentNode.parentNode;
	timerBody.remove();

	// Delete storage, dictionary
	delete timerDict[timerBody.id];
	delete intervalDict[timerBody.id];
	delete soundDict[timerBody.id];
	saveList();
}

// Load storage
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

// Save storage
function saveList() {
	localStorage.setItem("timer", JSON.stringify(timerDict));
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
