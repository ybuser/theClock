const VALIDATED = "was-validated";

let timerDict = {},
	timerList = [],
	intervalDict = {},
	soundDict = {};

let focusedID = 0,
	previousID = 0;

// Get Number, Display clock
function setClockNumber(timer, hour, minute, second) {
	timer.textContent = `${
		hour === 0 ? "" : hour < 10 ? "0" + hour + " : " : hour + " : "
	}${minute < 10 ? "0" + minute : minute} : ${
		second < 10 ? "0" + second : second
	}`;
}

// Get totaltime, Display clock
function setClockTotalTime(timer, totalTime) {
	const timeObj = timesFromTotalTime(totalTime);
	setClockNumber(timer, timeObj.hour, timeObj.minute, timeObj.second);
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
	stopAlarmButton.style = "display: inline-block";

	const stopAlarm = function () {
		// Delete Eventlistener
		stopAlarmButton.removeEventListener("click", stopAlarm);

		// Click Reset button
		document.getElementById(id).querySelector(".timer-reset").click();

		// Make div focused
		document.getElementById(id).focus();

		// Alarm off
		alarm.pause();
		alarm.currentTime = 0;

		// setting save
		timerDict[id].running = false;
		saveList();

		// hide button
		stopAlarmButton.style = "display: none";
	};
	stopAlarmButton.addEventListener("click", stopAlarm);
}

// Make timer run, called every second
function timerCountDown(id) {
	// calculate remaintime
	const remainTime = timerDict[id].finishTime - Date.now();
	// if not running, stop decreasing time
	// else if negative, set 00:00, clear interval and make alarm
	// else, show remaintime
	if (!timerDict[id].running) {
		clearInterval(intervalDict[id]);
	} else if (remainTime < 0) {
		setClockNumber(
			document.getElementById(id).querySelector(".timer-time"),
			0,
			0,
			0
		);
		console.log("Time's Up!");
		makeAlarm(id);

		timerDict[id].finishTime = 0;
		saveList();

		clearInterval(intervalDict[id]);
	} else {
		setClockTotalTime(
			document.getElementById(id).querySelector(".timer-time"),
			remainTime
		);
	}
}

// When running, update bar
function progressBar(id) {
	const bar = document.getElementById(id).querySelector(".progress-bar");
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

	// Make div focused
	timerBody.focus();

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

	// Hide start button, Display Stop button
	timerBody.querySelector(".timer-start").style = "display: none";
	timerBody.querySelector(".timer-stop").style = "display: inline-block";
}

// Timer Stop Function
function timerStop(button) {
	const timerBody = button.target.parentNode;

	// Make div focused
	timerBody.focus();

	// timer sound stop
	timerBody.querySelector(".timer-stopalarm").click();

	// Change setting and save
	if (timerDict[timerBody.id].running) {
		const totalTime = timerDict[timerBody.id].finishTime - Date.now();
		timerDict[timerBody.id].finishTime = totalTime;
		timerDict[timerBody.id].running = false;
		saveList();

		// Bar setting
		barUpdate(
			timerBody.querySelector(".progress-bar"),
			timerDict[timerBody.id]
		);
	}
	// Hide stop button, Display start button
	timerBody.querySelector(".timer-start").style = "display: inline-block";
	timerBody.querySelector(".timer-stop").style = "display: none";
}

// Timer Reset Function
function timerReset(button) {
	const timerBody = button.target.parentNode;

	// Make div focused
	timerBody.focus();

	// stop repeat
	clearInterval(intervalDict[timerBody.id]);
	timerBody.querySelector(".timer-stop").click();

	// stop alarm
	timerBody.querySelector(".timer-stopalarm").click();

	// reset screen timer to initial setting
	setClockTotalTime(
		timerBody.querySelector(".timer-time"),
		timerDict[timerBody.id].totalTime
	);

	// settings save
	timerDict[timerBody.id].finishTime = timerDict[timerBody.id].totalTime;
	timerDict[timerBody.id].running = false;
	saveList();

	// bar setting
	barUpdate(
		timerBody.querySelector(".progress-bar"),
		timerDict[timerBody.id]
	);
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

	// Save settings
	const totalMilliSeconds = ((hour * 60 + minute) * 60 + second) * 1000;
	timerDict[timerBody.id].finishTime = totalMilliSeconds;
	timerDict[timerBody.id].totalTime = totalMilliSeconds;
	timerDict[timerBody.id].running = false;
	clearInterval(intervalDict[timerBody.id]);
	timerDict[timerBody.id].sound = selectedSound.value;
	timerDict[timerBody.id].volume = selectedSoundVolume.valueAsNumber;
	saveList();

	// Set bar
	barUpdate(
		timerBody.querySelector(".progress-bar"),
		timerDict[timerBody.id]
	);

	// Close
	modalBody.querySelector(".timer-SettingClose").click();

	// Remove check sign
	setTimeout(() => {
		modalBody.className = "row g-3 needs-validation";
	}, 100);
}

// totaltime => {hour, minute, second}
function timesFromTotalTime(totalTime) {
	// no negative time
	if (totalTime < 0) totalTime = 0;

	totalTime = Math.ceil(totalTime / 1000);

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

function loadTimeSetting(div, totalTime) {
	const timeInputs = div
		.querySelector(".modal-body")
		.querySelector(".time-setting-input")
		.querySelectorAll("input");
	const timeObj = timesFromTotalTime(totalTime);
	timeInputs[0].value = timeObj.hour;
	timeInputs[1].value = timeObj.minute;
	timeInputs[2].value = timeObj.second;
}

// Fill basic settings
function loadSetting(div, item) {
	const modalBody = div.querySelector(".modal-body"),
		titleInput = modalBody.querySelector(".timer-settitle"),
		selectSound = modalBody.querySelector(".selected-sound"),
		soundVolumeSetting = modalBody.querySelector(".sound-volume");

	// title setting
	titleInput.value = item.title;

	// time setting
	loadTimeSetting(div, item.totalTime);

	// soundoption setting
	selectSound.value = item.sound;

	// soundvolume setting
	soundVolumeSetting.value = item.volume;
	modalBody.querySelector(".timer-soundstop").click();

	// Make div focused
	div.focus();
}

// div html content
function setDiv(div, id, item) {
	div.id = id;
	div.tabIndex = 0;
	div.classList = "timer";
	const title = item.title,
		volume = item.volume;
	div.innerHTML = `
	<div class="timer-header" style="margin-left:auto; margin-right:auto;">
		<input type="text" value="${title}" class="timer-title" readonly="true">
		<i class="bi bi-arrows-move timer-move p-4" style="cursor: move; visibility: hidden; " draggable=true></i>
		<button
			type="button"
			class="btn-close btn-close-white timer-Close"
			style="visibility: hidden; color: white;"
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
		class="btn btn-primary timer-settingOpen"
		data-bs-toggle="modal"
		data-bs-target="#modal_${id}"
		style="background-color: #7d7d7d; color: white; border-color: #7d7d7d;"
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
						<div class="mb-2 ps-2 pe-2 timer-settitle">
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
						<div class="mb-2 ps-2 pe-2 time-setting">
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
						<div class="mb-2 ps-2 pe-2">
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
						<div class="ps-2 pe-2">
							<label for="customRange2" class="col-form-label"
								>Sound Volume</label
							>
							<div style="display: flex; " class="align-items-center">
								<input
									type="range"
									class="form-range sound-volume"
									min="0"
									max="1"
									step="0.01"
									value="${volume}"
									id="customRange2"
								/>
								<button type="button" class="btn btn-light ms-2 timer-soundplay"><i class="bi bi-volume-up-fill"></i></button>
								<button type="button" class="btn btn-light ms-2 timer-soundstop" style="display:none"><i class="bi bi-volume-mute-fill"></i></button>
							</div>
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

function getFocused(event) {
	// modify focusedid to current div
	focusedID = event.target.id;
	event.target.classList.add("timer-focused");

	// if it is different from previous id,
	if (focusedID !== previousID) {
		// find previous div
		const k = document.getElementById(previousID);
		if (k) {
			// remove class from previous div
			k.classList.remove("timer-focused");
		}
		// update previous div
		previousID = focusedID;
	}
}

// about setting panel, sound preview
function settingSoundPreview(event) {
	const modalBody = event.target.closest("div.modal-body"),
		selectedSound = modalBody.querySelector(".selected-sound"),
		selectedSoundVolume = modalBody.querySelector(".sound-volume"),
		audioPreview = new Audio(`./sound/${selectedSound.value}.mp3`);
	audioPreview.volume = selectedSoundVolume.valueAsNumber;
	audioPreview.play();

	// stop button event
	const timerSoundStopButton = modalBody.querySelector(".timer-soundstop"),
		timerSoundStartButton = modalBody.querySelector(".timer-soundplay");

	timerSoundStartButton.style = "display:none";
	timerSoundStopButton.style = "";

	const audioPreviewStop = function () {
		audioPreview.pause();
		audioPreview.currentTime = 0;

		timerSoundStartButton.style = "";
		timerSoundStopButton.style = "display:none";
		timerSoundStopButton.removeEventListener("click", audioPreviewStop);
	};
	timerSoundStopButton.addEventListener("click", audioPreviewStop);
}

// Assign event to buttons
function createDivEvents(div, item) {
	const timerTitle = div.querySelector(".timer-title"),
		timerStartButton = div.querySelector(".timer-start"),
		timerStopButton = div.querySelector(".timer-stop"),
		timerResetButton = div.querySelector(".timer-reset"),
		timerSettingButton = div.querySelector(".timer-settingOpen"),
		timerSaveChanges = div.querySelector(".timer-settingButton"),
		timerCloseChanges = div.querySelector(".timer-SettingClose"),
		timerButtomCloseChanges = div.querySelector(
			".timer-buttomCloseSetting"
		),
		timerClose = div.querySelector(".timer-Close"),
		timerStopAlarmButton = div.querySelector(".timer-stopalarm"),
		timerSoundStartButton = div.querySelector(".timer-soundplay"),
		timerSoundStopButton = div.querySelector(".timer-soundstop");

	timerTitle.addEventListener("click", () => {
		if (!div.classList.contains("timer-focused")) div.focus();
	});
	timerTitle.addEventListener("dblclick", () => {
		console.log(timerTitle.readOnly);
		timerTitle.readOnly = "";
		timerTitle.classList.add("get-input");
	});
	timerTitle.addEventListener("keydown", (ele) => {
		if (
			ele.code === "Escape" ||
			ele.code === "Enter" ||
			ele.code === "NumpadEnter"
		) {
			timerTitle.blur();
		}
	});
	timerTitle.addEventListener("blur", () => {
		timerTitle.readOnly = "true";
		timerTitle.classList.remove("get-input");
		timerDict[div.id].title = timerTitle.value;
		saveList();
	});

	timerStartButton.addEventListener("click", timerStart);
	timerStopButton.addEventListener("click", timerStop);
	timerResetButton.addEventListener("click", timerReset);
	timerSettingButton.addEventListener("click", () => {
		div.focus();
	});
	timerSaveChanges.addEventListener("click", makeSettings);
	timerCloseChanges.addEventListener("click", () => {
		loadSetting(div, item);
	});
	timerButtomCloseChanges.addEventListener("click", () => {
		loadSetting(div, item);
	});
	timerClose.addEventListener("click", deleteTimer);
	timerStopAlarmButton.addEventListener("click", () => {
		div.focus();
	});
	timerSoundStartButton.addEventListener("click", settingSoundPreview);
	timerSoundStopButton.addEventListener("click", () => {});

	// initial display
	timerStopButton.style = "display: none";
	timerStopAlarmButton.style = "display: none";

	// if mouse is over the div,
	div.addEventListener("mouseenter", addVisibleButton);
	div.addEventListener("mouseleave", removeVisibleButton);
	div.addEventListener("focus", getFocused);

	// if mouse drags div,
	const mouseDraggable = div.querySelector(".timer-move");

	/* code from https://www.w3schools.com/howto/howto_js_draggable.asp */
	mouseDraggable.addEventListener("mousedown", (e) => {
		div.focus();
		let pos1 = 0,
			pos2 = 0,
			pos3 = 0,
			pos4 = 0,
			index = timerList.indexOf(parseInt(div.id));
		const empty_div = createEmptyDiv(),
			list = document.querySelector(".timer-list");
		e = e || window.event;
		e.preventDefault();
		div.style.position = "absolute";
		list.insertBefore(empty_div, div.nextSibling);
		pos3 = e.clientX;
		pos4 = e.clientY + list.scrollTop;
		console.log(pos3, pos4);
		document.addEventListener("mouseup", closeDragElement);
		document.addEventListener("mousemove", elementDrag);
		document.addEventListener("scroll", (ele) => {
			console.log(ele);
		});
		div.style.top = div.offsetTop - list.scrollTop + "px";
		function elementDrag(ele) {
			ele = ele || window.event;
			ele.preventDefault();
			pos1 = pos3 - ele.clientX;
			pos2 = pos4 - (ele.clientY + list.scrollTop);
			pos3 = ele.clientX;
			pos4 = ele.clientY + list.scrollTop;
			div.style.top = div.offsetTop - pos2 + "px";
			div.style.left = div.offsetLeft - pos1 + "px";

			if (
				div.offsetTop - pos2 - (empty_div.offsetTop - list.scrollTop) >
				180
			) {
				if (
					empty_div.nextSibling &&
					!empty_div.nextSibling.classList.contains("timer-create")
				) {
					const scrolled = list.scrollTop;
					empty_div.nextSibling.after(empty_div);
					//empty_div.before(div);
					[timerList[index], timerList[index + 1]] = [
						timerList[index + 1],
						timerList[index],
					];
					index++;
					saveList();
					list.scrollTop = scrolled;
					console.log(empty_div.offsetTop, list.scrollTop);
				}
			} else if (
				div.offsetTop - pos2 - (empty_div.offsetTop - list.scrollTop) <
				-100
			) {
				if (index !== 0) {
					const scrolled = list.scrollTop;
					if (empty_div.previousSibling === div) {
						empty_div.previousSibling.previousSibling.before(
							empty_div
						);
					} else empty_div.previousSibling.before(empty_div);
					[timerList[index], timerList[index - 1]] = [
						timerList[index - 1],
						timerList[index],
					];
					index--;
					saveList();
					//empty_div.before(div);
					list.scrollTop = scrolled;
					console.log(empty_div.offsetTop, list.scrollTop);
				}
			}
		}

		function closeDragElement() {
			document.removeEventListener("mouseup", closeDragElement);
			document.removeEventListener("mousemove", elementDrag);
			div.style.position = "";
			div.style.top = "";
			div.style.left = "";
			empty_div.before(div);
			empty_div.remove();
		}
	});
}

// Make Emptydiv
function createEmptyDiv() {
	const empty_div = document.createElement("div");
	empty_div.id = Object.keys(timerDict).length;
	empty_div.className = "timer timer-empty";

	return empty_div;
}

// bar update
function barUpdate(bar, item) {
	if (item.totalTime === 0) {
		bar.style = "width: 100%";
	} else {
		const finishTime = item.running
			? item.finishTime - Date.now()
			: item.finishTime;
		if (finishTime < 0) {
			bar.style = "width: 0%";
		} else {
			bar.style = `width: ${(finishTime * 100) / item.totalTime}%`;
		}
	}
}

// Make timerdiv
function createDiv(id, item) {
	// set div
	const div = document.createElement("div");
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
		? item.finishTime - Date.now()
		: item.finishTime;
	setClockTotalTime(div.querySelector(".timer-time"), totalTime);

	// Bar to screen
	barUpdate(div.querySelector(".progress-bar"), item);

	// Setting input with item
	loadSetting(div, item);

	// Assign event to buttons
	createDivEvents(div, item);

	// div to screen
	const list = document.querySelector(".timer-list");
	//list.appendChild(div);
	list.querySelector(".timer-create").before(div);

	// add item to local dictionary, and save
	// OLD, to be replaced
	timerDict[id] = item;
	timerList.push(id);
	saveList();

	// if it is running, automatically click start
	if (item.running) {
		div.querySelector(".timer-start").click();
	}
}

// Delete timer and save
function deleteTimer(button) {
	// Screen remove
	const timerBody = button.target.parentNode.parentNode;
	timerBody.remove();

	// Delete storage, dictionary
	// OLD, to be replaced
	delete timerDict[timerBody.id];
	delete intervalDict[timerBody.id];
	delete soundDict[timerBody.id];
	timerList = timerList.filter((ele) => {
		return ele !== parseInt(timerBody.id);
	});
	saveList();
}

// Load storage
function loadStorage() {
	const itemDict = JSON.parse(localStorage.getItem("timer")),
		itemList = JSON.parse(localStorage.getItem("timerList"));

	if (
		!itemDict ||
		Object.keys(itemDict).length === 0 ||
		!itemList ||
		itemList.length === 0
	) {
		createCurDiv();
		return;
	}

	for (let i in itemList) {
		if (!itemDict[itemList[i]]) continue;
		createDiv(itemList[i], itemDict[itemList[i]]);
	}

	console.log(document.querySelector(".timer-list").childNodes.length);
	if (document.querySelector(".timer-list").childNodes.length === 0) {
		createCurDiv();
	}
}

// Save storage
function saveList() {
	localStorage.setItem("timer", JSON.stringify(timerDict));
	localStorage.setItem("timerList", JSON.stringify(timerList));
}

// plus time
function timePlus(div, milliSeconds) {
	// if running, return
	if (timerDict[div.id].running) return;

	// increase or decrease finishtime and totaltime & save
	timerDict[div.id].finishTime =
		timerDict[div.id].finishTime + milliSeconds > 0
			? timerDict[div.id].finishTime + milliSeconds
			: 0;
	timerDict[div.id].totalTime =
		timerDict[div.id].finishTime > timerDict[div.id].totalTime
			? timerDict[div.id].finishTime
			: timerDict[div.id].totalTime;
	saveList();

	// reflect to setting panel
	loadTimeSetting(div, timerDict[div.id].totalTime);

	// reflect to screen time
	setClockTotalTime(
		div.querySelector(".timer-time"),
		timerDict[div.id].finishTime
	);

	// reflect to screen bar
	barUpdate(div.querySelector(".progress-bar"), timerDict[div.id]);
}

// keyboard input
function keyboardSettings(event) {
	const div = document.getElementById(focusedID);
	if (
		div.querySelector(".modal").classList.contains("show") ||
		div.querySelector(".timer-title").classList.contains("get-input")
	)
		return;

	switch (event.keyCode) {
		case 27: // Escape
			div.querySelector(".timer-reset").click();
			break;
		case 32: // Space
			if (timerDict[div.id].running)
				div.querySelector(".timer-stop").click();
			else div.querySelector(".timer-start").click();
			break;
		case 38: // ArrowUp (+5s)
			timePlus(div, 5000);
			break;
		case 40: // ArrowDown (-5s)
			timePlus(div, -5000);
			break;
		case 37: // ArrowLeft (-1min)
			timePlus(div, -60000);
			break;
		case 39: // ArrowRight (+1min)
			timePlus(div, 60000);
			break;
		default:
			break;
	}
}

// first launched, make first div focused
function firstDivFocused() {
	const firstDiv = document.querySelectorAll(".timer")[0];
	firstDiv.focus();
	previousID = focusedID = firstDiv.id;
	firstDiv.classList.add("timer-focused");
}

// First Function
function init() {
	// load from local storage
	loadStorage();

	// make first div focused
	firstDivFocused();

	// listen user's keyboard
	document.addEventListener("keydown", keyboardSettings);

	// user clicks "create new timer" button
	const createTimerButton = document
		.querySelector(".timer-create")
		.querySelector("button");
	createTimerButton.addEventListener("click", createCurDiv);
}

init();
