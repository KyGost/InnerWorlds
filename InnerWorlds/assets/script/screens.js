window.onpopstate = () => {
	var state = window.location.hash.substring(1);
	if(screens[1] && state == screens[screens.length-2][0].name) backPressed();
}

function screensStart() {
	setScreen(home);
}
function setScreen(screen, parameter) {
	updateScreenLog(screen, parameter);

	while(header.lastElementChild) header.removeChild(header.lastElementChild);

	footer.style = footer.innerHTML = '';
	setHeader();

	while(base.lastElementChild) base.removeChild(base.lastElementChild);
	base.appendChild(header);
	base.appendChild(screen(parameter));
	base.appendChild(footer);
	padBase();
}
function setHeader() {
	header.style.display = 'initial';
	const backButton = document.createElement('I');
		backButton.id = 'BACKBUTTON';
		backButton.classList.add('button');
		backButton.classList.add('material-icons');
		backButton.innerHTML = 'arrow_back';
		backButton.setAttribute('onclick', 'backPressed()');
		keyboardNav(backButton);
	const funcButton = document.createElement('I');
		funcButton.id = 'FUNCBUTTON';
		funcButton.classList.add('button');
		funcButton.classList.add('material-icons');
		funcButton.style.display = 'none';
		keyboardNav(funcButton);
	const miscElement = document.createElement('SPAN');
		miscElement.id = 'MISCELEMENT';
		miscElement.style.display = 'none';
	header.appendChild(backButton);
	header.appendChild(miscElement);
	header.appendChild(funcButton);
}
function updateScreenLog(screen, parameter) {
	if(screens[1] && screen == screens[screens.length-2][0]) screens.pop();
	else screens.push([screen, parameter]);

	window.location.hash = screen.name;
}
function padBase() {
	base.style.paddingTop = parseInt(header.offsetHeight) + 'px';
	base.style.paddingBottom = parseInt(footer.offsetHeight) + 'px';
	Array.from(document.getElementsByClassName('fullscreen')).forEach(element => {element.style.maxHeight = window.innerHeight - ((parseInt(header.offsetHeight) + parseInt(footer.offsetHeight)) * (1.3 /*just a tiny margin... a little hackish*/)) + 'px'});
}
function backPressed() {
	const previousScreen = screens[screens.length-2];
	setScreen(previousScreen[0], previousScreen[1]);
}
function home() {
	header.style.display = 'none';
	const home = document.createElement('DIV');
		home.id = 'HOME';
		const widgets = document.createElement('DIV');
			widgets.id = 'WIDGETS';
			widgets.appendChild(journal(true));
			const observer = new MutationObserver(() => {
				observer.disconnect();
				widgets.style.height = (window.innerHeight - (parseInt(header.offsetHeight) + parseInt(footer.offsetHeight))) + 'px';
			});
			observer.observe(footer, {childList: true});
		home.appendChild(widgets);
		navBar();
	return home;
}
function journal(isSample = false) {
	const journal = document.createElement('DIV');
		journal.id = 'JOURNAL';
		if(isSample) {
			journal.setAttribute('onclick', 'setScreen(journal)');
		} else journal.classList.add('fullscreen');
		let date = new Date();
		let previousDay = new Date();
		let journalDay = journalStart(date);
		db(dbAction.GET, dbIndex.FRONTEVENTDATE, []).then(results => {
			results.reverse().forEach(result => {
				let frontevent = result;
				let time = new Date(frontevent.time);
				if (time.getYear() != previousDay.getYear() || time.getMonth() != previousDay.getMonth() || time.getDay() != previousDay.getDay()) {// yuck
					journal.appendChild(journalDay);
					if(isSample) return;
					else {
						previousDay = time;
						journalDay = journalStart(time);
					}
					
				}
				const fronteventElement = document.createElement('DIV');
					const title = document.createElement('DIV');
						title.classList.add('title')
						title.innerHTML = timeFormatter.format(frontevent.time) + ' - ';
						frontevent.alters.forEach((alter, key) => {
							db(dbAction.GET, dbStore.ALTER, undefined, alter).then(alterObject => {
								title.innerHTML += alterObject.name + (key < frontevent.alters.length-1 ? ', ' : '');
							});
						});
					const notes = document.createElement('P');
						notes.classList.add('notes');
						notes.innerHTML = new showdown.Converter().makeHtml(frontevent.notes);
					fronteventElement.appendChild(title);
					fronteventElement.appendChild(notes);
				journalDay.appendChild(fronteventElement);
			});
			journal.appendChild(journalDay);
		});
	return journal;
}
function journalStart(time) {
	journalDay = document.createElement('DIV');
	journalDay.classList.add('day');
	const journalDayTitle = document.createElement('DIV');
		journalDayTitle.classList.add('journalDay');
		journalDayTitle.innerHTML = dateFormatter.format(time);
	journalDay.appendChild(journalDayTitle);
	return journalDay;
}
function navBar() {
	navBarItems.forEach(navItem => footer.appendChild(navItem));
}
function maps() {
	alert('Not yet implemented!');
}
function altersPage() {
	funcButton('setScreen(newAlter)', 'add');
	return alters(false, 'setScreen(alter, this.value)');
}
function alters(isEmbeded = true, onclick, size) {
	const alters = document.createElement('DIV');
		alters.id = 'ALTERS';
		alters.classList.add(isEmbeded ? 'line' : 'fullscreen');
		if(!isEmbeded) {
			const searchBar = document.createElement('DIV');
				const searchText = inputElement('search', 'text', 'Search');
					searchText.style.width = '95%';
					searchText.addEventListener('keyup', event => {
						let alterDisplays = Array.from(alters.getElementsByClassName('alterDisplay'));
						let searchString = searchText.value;
						console.log(alterDisplays);
						alterDisplays.sort((a, b) => {
							let elements = [a, b];
							let values = [];
							elements.forEach(element => {
								let string = element.getElementsByTagName('SPAN')[0].innerHTML;
								values.push(
									(string.split(searchString).length - 1)
									+ (searchString == string.slice(0, searchString.length) ? 5 : 0)
								);
							});
							return values[1] - values[0];
						});
						while(alters.lastElementChild) alters.removeChild(alters.lastElementChild);
						alterDisplays.forEach(element => alters.appendChild(element));
					});
			footer.appendChild(searchText);
			footer.style.background = '#EEEEEE';
		}
		var alterObjects = [];
		if(isEmbeded/*Allow synths*/) {
			[
				{alter: new Alter('Search', graphicDirectory + 'control_search.webp'), onclick: ()=>{setScreen(search, onclick)}}
			].forEach(synth => alters.appendChild(alterDisplay(-1, synth.alter, synth.onclick, size)));
		}
		db(dbAction.GET, dbStore.ALTER, alterObjects).then(result => {
			result.forEach((resultValue) => {
				alters.appendChild(alterDisplay(resultValue.key, resultValue, onclick, size));
			})
		});
	return alters;
}
function search(onclick) {
	return alters(false, async (event) => {
		let alterID = event.path[1].name; // Hackish... Onclick seems to grab the thing clicked not that which own's the event.
		backPressed();
		for(let x = 0; x < 1000; x++) try {
			await new Promise(resolve => setTimeout(resolve, 1));
			document.getElementsByName(alterID)[0].click()
			return;
		} catch {}
		// Gross... Best I could think of at 'the time'
	});
}
function alterDisplay(alterID, alterObject, onclick, size) {
	const alterDisplay = document.createElement('DIV');
		alterDisplay.classList.add('alterDisplay');
		alterDisplay.setAttribute('name', alterID);
		alterDisplay.value = alterID;
		if(typeof onclick == 'string') alterDisplay.setAttribute('onclick', onclick);
		else alterDisplay.onclick = onclick;
		alterDisplay.name = alterDisplay.value = alterID;
		if(size) {
			alterDisplay.style.minWidth = size + 'vw';
			alterDisplay.style.width = size + 'vw';
			alterDisplay.style.maxWidth = size + 'vw';
		}
		const icon = document.createElement('IMG');
			alterIcon(icon, alterObject);
			icon.classList.add('icon');
		const name = document.createElement('SPAN');
			name.innerHTML = alterObject.name;
	alterDisplay.appendChild(icon);
	alterDisplay.appendChild(name);
	fitText(name, 2);
	return alterDisplay;
}
function alter(alterID) {
	funcButton('editAlter(' + alterID + ', false)', 'edit');
	const alter = document.createElement('DIV');
		alter.id = 'ALTER';
		query = alterID ? db(dbAction.GET, dbStore.ALTER, null, alterID) : new Promise((resolve, reject) => {resolve(new Alter())});
		query.then(result => {
			const heading = document.createElement('DIV');
				heading.classList.add('heading');
				const icon = document.createElement('IMG');
					icon.classList.add('icon');
					icon.classList.add('editable');
				const name = document.createElement('SPAN');
					name.innerHTML = result.name;
					name.id = 'name';
					name.classList.add('name');
					name.classList.add('editable');
				heading.appendChild(icon);
				heading.appendChild(name);
			const description = document.createElement('P');
				description.innerHTML = new showdown.Converter().makeHtml(result.description);
				description.id = 'description';
				description.classList.add('description');
				description.classList.add('editable');
			alter.appendChild(heading);
			alter.appendChild(description);
			alterIcon(undefined, result);
			fitText(name, 10, 0.9);
		});
	return alter;
}
function editAlter(alterID, finish) {
	if(finish) {
		const name = document.getElementById('name');
		const description = document.getElementById('description');
		const icon = document.getElementsByClassName('icon')[0];
		((icon.style.display == 'none')
			? croppie.result('blob', {width: 300, height: 300})
			: new Promise((resolve, reject) => {resolve(false)})
		).then(iconResult => {
			if(name == '') alert('Ensure name is set');
			else if(name.length > 32) alert('Maximum name length is 32 characters');
			else {
				((iconResult)
					? db(dbAction.PUT, dbStore.IMAGE, iconResult)
					: new Promise((resolve, reject) => {resolve(false)})
				).then(location => {
					db(dbAction.PUT, dbStore.ALTER, new Alter(name.innerHTML, description.innerHTML, undefined, undefined, location || icon.value), alterID);
					if(location && icon.value != '' && location != icon.value) db(dbAction.DELETE, dbStore.IMAGE, null, icon.value);
					description.innerHTML = new showdown.Converter().makeHtml(description.innerHTML);
					backPressed();
				});
			}
		});
	} else {
		updateScreenLog('editing');
		document.getElementById('description').innerHTML = new showdown.Converter().makeMarkdown(document.getElementById('description').innerHTML);
		funcButton('editAlter(' + alterID + ', true)', 'done');
	}
	Array.from(document.getElementsByClassName('editable')).forEach(element => {
		element.setAttribute('contenteditable', !finish);
		if(element.tagName == 'IMG') element.onclick = finish ? null : () => {
			fileSelect = document.createElement('INPUT');
				fileSelect.type = 'file';
				fileSelect.accept = 'image/*';
				fileSelect.style.display = 'none';
				fileSelect.id = 'fileSelect';
				document.body.appendChild(fileSelect);
			fileSelect.click();
			fileSelect.onchange = () => {
				if(document.getElementById('fileSelect').files[0] === undefined) return console.log(document.getElementById('fileSelect').files[0]);
				const editIcon = document.createElement('DIV');
				editIcon.id = 'editIcon';
				editIcon.style.width = 'auto';
				element.style.display = 'none';
				element.parentElement.insertBefore(editIcon, element);
				croppie = new Croppie(editIcon, croppieDefault);
				croppie.bind({url: URL.createObjectURL(fileSelect.files[0])});
			}
		};
	});
}
function newAlter() {
	const alterElement = alter(undefined);
	const observer = new MutationObserver(() => {
		observer.disconnect();
		editAlter(undefined, false);
		screens.pop();
	});
	observer.observe(alterElement, {childList: true});
	return alterElement;
}
function newFront() {
	funcButton('newFrontSubmit()', 'done');
	const newFront = document.createElement('DIV');
		const newFrontForm = document.createElement('DIV');
			newFrontForm.classList.add('form');
			newFrontForm.appendChild(alters(true, 'alterSelectFront(this)', 15));
			// Eh :-(
			let date = new Date();
			let dateString = [
					leadingZeros(date.getFullYear(), 4),
					leadingZeros((date.getMonth()+1), 2),
					leadingZeros(date.getDate(), 2),
				].join('-') + 'T' + [
					leadingZeros(date.getHours(), 2),
					leadingZeros(date.getMinutes(), 2),
				].join(':');
			newFrontForm.appendChild(inputElement('datetime', 'datetime-local', 'Event Date', dateString));
			newFrontForm.appendChild(inputElement('description', 'textarea', 'Description'));
		newFront.appendChild(newFrontForm);
	return newFront;
}
function alterSelectFront(element) {
	let alters = document.getElementById('ALTERS');
	//Array.from(alters.getElementsByClassName('alterDisplay')).forEach(alterElement => {if(alterElement.value == element.value) element = alterElement;}); // Ew ew gross... For searching (refers to searched element but needs to get the intended element)
	const className = 'selected';
	if(element.classList.contains(className)) element.classList.remove(className);
	else element.classList.add('selected');
}
function newFrontSubmit() {
	var alters = [];
	Array.from(document.getElementsByClassName('selected')).forEach((element) => {alters.push(element.value)});
	const datetime = document.getElementById('datetime').value;
	const description = document.getElementById('description').value;
	const mood = ''; //TODO
	if(alters.length < 1) {
		alert('Please select at least 1 alter');
	} else {
		db(dbAction.PUT, dbStore.FRONTEVENT, new Frontevent(alters, datetime, description, mood));
		backPressed();
	}
}
function settings() {
	// Const: Setting Regions
	const settings = document.createElement('DIV');
		settings.id = 'SETTINGS';
		settingRegions.forEach(settingRegion => {
			const settingRegionElement = document.createElement('DIV');
				settingRegionElement.classList.add('divButton');
				settingRegionElement.innerHTML = settingRegion.title;
				settingRegionElement.setAttribute('onclick', 'setScreen(' + settingRegion.screen + ')');
			settings.appendChild(settingRegionElement);
		});
	return settings;
}
function credits() {
	// Const: Credits
	footer.innerHTML = version;
	footer.style.display = 'initial';
	footer.style.textAlign = 'center';

	const credits = document.createElement('DIV');
		credits.id = 'CREDITS';
		creditsList.forEach(credit => {
			let creditElement = document.createElement('DIV');
				creditElement.classList.add('credit');
				creditElement.onclick = () => {location.href = credit.link};
				let role = document.createElement('SPAN');
					role.classList.add('role');
					role.innerHTML = credit.role;
				let name = document.createElement('SPAN');
					name.classList.add('name');
					name.innerHTML = credit.name;
			creditElement.appendChild(role);
			creditElement.appendChild(name);
			credits.appendChild(creditElement);
		});
	return credits;
}
function importexport() {
	const importexport = document.createElement('DIV');
		const notice = document.createElement('DIV');
			notice.classList.add('warning');
			notice.innerHTML = 'Using this feature could mean a complete loss of data, do not use if unsure.';
		const oldImport = document.createElement('DIV');
			oldImport.classList.add('divButton');
			oldImport.innerHTML = 'Import from old app';
			oldImport.onclick = () => {
				iwImport('system', prompt('Old app system (export): '));
				iwImport('data', prompt('Old app data (export): '));
			};
		const pluralKitImport = document.createElement('DIV');
			pluralKitImport.classList.add('divButton');
			pluralKitImport.innerHTML = 'Import from PluralKit';
			pluralKitImport.onclick = () => {
				fetch('https://api.pluralkit.me/v1/s/' + prompt('PluralKit System ID:') + '/members')
					.then(response => response.json())
					.then(members => pkImport(members))
					.catch(error => console.log(error));
			};
		const pkJsonImport = document.createElement('DIV');
			pkJsonImport.classList.add('divButton');
			pkJsonImport.innerHTML = 'PluralKit JSON Import';
			pkJsonImport.onclick = () => {
				const upload = document.createElement('INPUT');
				upload.type = 'file';
				upload.accept = '.json';
				upload.onchange = () => {
					let file = upload.files[0];
					if(file) {
						const reader = new FileReader();
						reader.readAsText(file, "UTF-8");
						reader.onload = event => {
							pkImport(JSON.parse(event.target.result).members);
						}
					}
				};
				upload.click();
			};
		const jsonImport = document.createElement('DIV');
			jsonImport.classList.add('divButton');
			jsonImport.innerHTML = 'Data Import';
			jsonImport.onclick = () => {
				const upload = document.createElement('INPUT');
				upload.type = 'file';
				upload.accept = '.json';
				upload.onchange = () => {
					let file = upload.files[0];
					if(file) {
						const reader = new FileReader();
						reader.readAsText(file, "UTF-8");
						reader.onload = event => {
							db(dbAction.IMPORT, undefined, event.target.result);
						}
					}
				};
				upload.click();
			};
		const jsonExport = document.createElement('DIV');
			jsonExport.classList.add('divButton');
			jsonExport.innerHTML = 'Data Export';
			jsonExport.onclick = () => {
				db(dbAction.EXPORT).then(result => {
					const download = document.createElement('A');
					download.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(result));
					download.setAttribute('download', 'InnerWorlds_Export_' + new Date().toISOString() + '.json');
					download.click();
				});
				
			};
	importexport.appendChild(notice);
	importexport.appendChild(oldImport);
	importexport.appendChild(pluralKitImport);
	importexport.appendChild(pkJsonImport);
	importexport.appendChild(jsonImport);
	importexport.appendChild(jsonExport);
	return importexport;
}
function debug() {
	const debug = document.createElement('DIV');
		const notice = document.createElement('DIV');
				notice.classList.add('warning');
				notice.innerHTML = 'Using this feature could mean a complete loss of data, do not use if unsure.';
		const reset = document.createElement('DIV');
			reset.classList.add('divButton');
			reset.innerHTML = 'Reset data';
			reset.onclick = () => {
				if(confirm('Reset?')) {
					window.indexedDB.deleteDatabase(databaseName);
					window.location.reload();
				}
			};
		debug.appendChild(notice);
		debug.appendChild(reset);
	return debug;
}
function messages() {
	funcButton('setScreen(newChat)', 'add');
	const messages = document.createElement('DIV');
		messages.id = 'MESSAGES';
		db(dbAction.GET, dbStore.CHAT, []).then(results => {
			results.forEach(result => {
				let chat = result;
				const chatElement = document.createElement('DIV');
					chatElement.classList.add('divButton');
					chatElement.innerHTML = chat.name;
					chatElement.onclick = () => setScreen(chatScreen, result.key);
				messages.appendChild(chatElement);
			});
		});
	return messages;
}
function newChat() {
	funcButton('newChatSubmit()', 'done');
	const newChat = document.createElement('DIV');
		const newChatForm = document.createElement('DIV');
			newChatForm.classList.add('form');
			newChatForm.appendChild(inputElement('name', 'text', 'Name'));
		newChat.appendChild(newChatForm);
	return newChat;
}
function newChatSubmit() {
	const name = document.getElementById('name').value;
	if(name.length < 1) {
		alert('Please set a name');
	} else {
		db(dbAction.PUT, dbStore.CHAT, new Chat(name));
		backPressed();
	}
}
function chatScreen(chat) {
	funcButton('alert("Not yet implemented")', 'edit');
	const messageArea = document.createElement('DIV');
		messageArea.id = 'messageArea';
		messageArea.classList.add('fullscreen')
		messageArea.value = chat;
	const title = document.getElementById('MISCELEMENT');
		title.style.display = 'initial';
		db(dbAction.GET, dbStore.CHAT, undefined, chat).then(chatObject => title.innerHTML = chatObject.name);
	const messageBox = document.createElement('DIV');
		messageBox.classList.add('messageBox');
		messageBox.style.display = 'flex';
		const textbox = inputElement('message', 'text', 'Message');
			textbox.style.width = '80%';
			textbox.setAttribute('autocomplete', 'off');
			textbox.addEventListener('keyup', event => {if(event.keyCode === 13) submit.click()});
			textbox.addEventListener('focusout', event => event.target.focus());
			window.onresize = () => messageFixDisplay(messageArea);
		const submit = document.createElement('BUTTON');
			submit.innerHTML = 'Send';
			submit.style.width = '15%';
			submit.onclick = () => {
				let alter;
				Array.from(document.getElementsByClassName('selected')).forEach(element => {alter = element.value; return;});
				let message = textbox.value;
				if(alter == undefined) {
					alert('Please select an alter');
				} else if (message == '') {
					alert('Please enter a message');
				} else {
					db(dbAction.PUT, dbStore.MESSAGE, new Message(alter, message, new Date(), chat));
					updateMessages(messageArea);
					textbox.value = '';
				}
			}
		messageBox.appendChild(textbox);
		messageBox.appendChild(submit);
		footer.appendChild(alters(true, 'alterSelectChat(this)', 15));
		footer.appendChild(messageBox);
		footer.style.background = '#EEEEEE';
		footer.style.display = 'flex';
		footer.style.flexDirection = 'column';
		updateMessages(messageArea);
	return messageArea;
}
function alterSelectChat(element) {
	Array.from(document.getElementsByClassName('selected')).forEach(element => element.classList.remove('selected'))
	element.classList.add('selected');
}
async function updateMessages(messageArea) {
	let latestFrontevent = await db(dbAction.CURSOR, dbIndex.FRONTEVENTDATE, 'prev');
	latestFrontevent = latestFrontevent.value;

	while(messageArea.lastElementChild) messageArea.removeChild(messageArea.lastElementChild);
	db(dbAction.GET, dbIndex.MESSAGECHAT, [], messageArea.value).then(results => {
		results.forEach(result => {
			messageArea.appendChild(messageElement(result, latestFrontevent))
		})
		messageFixDisplay(messageArea);
	});
}
function messageFixDisplay(messageArea) {
	padBase();
	messageArea.scrollTo(0, messageArea.scrollHeight);
}
function messageElement(message, latestFrontevent) {
	const messageElement = document.createElement('DIV');
		messageElement.classList.add('message');
		messageElement.classList.add(latestFrontevent.alters.includes(message.sender) ? 'right' : 'left')
		const icon = document.createElement('IMG');
			icon.classList.add('icon');
			let test = db(dbAction.GET, dbStore.ALTER, undefined, message.sender).then(alter => {alterIcon(icon, alter)});
		const text = document.createElement('SPAN');
			text.innerHTML = message.message;
		messageElement.appendChild(icon);
		messageElement.appendChild(text);
	return messageElement;
}

function funcButton(action, display) {
	const funcButton = document.getElementById('FUNCBUTTON');
	funcButton.innerHTML = display;
	funcButton.style.display = 'initial';
	funcButton.setAttribute('onclick', action);
}

function navItem(icon, onclick) {
	const sizes = [512, 384, 256, 128, 64];
	const navItem = document.createElement('IMG');
		navItem.src = graphicDirectory + 'nav_' + icon + '.webp';
		navItem.alt = icon;
		navItem.srcset = navItem.src;
		sizes.forEach(size => {
			navItem.srcset += ', ' + graphicDirectory + 'nav_' + icon + '_' + size + '.webp ' + size + 'w';
		});
		navItem.setAttribute('onclick', 'setScreen(' + onclick + ')');
		keyboardNav(navItem);
		navItem.classList.add('navItem');
		navItem.classList.add('icon');
	return navItem;
}
function keyboardNav(element) {
	element.setAttribute('tabindex', 0);
	element.addEventListener('keydown', event => {if(event.keyCode !== 9) element.click()});
	element.addEventListener('keyup', event => {if(event.keyCode !== 9) element.click()});
}
function inputElement(id, type, placeholder, defaultValue) {
	const element = document.createElement(type == 'textarea' ? 'TEXTAREA' : 'INPUT');
		element.id = id;
		element.type = type;
		element.placeholder = placeholder;
		if(defaultValue) element.value = defaultValue;
	return element;
}
function alterIcon(icon = document.getElementsByClassName('icon')[0], alterObject) {
	icon.width = 1024;
	icon.height = 1024;
	icon.src = defaultIconAlter;
	icon.alt = 'Alter Icon';
	icon.value = '';
	if(alterObject.icon) {
		if(isNaN(parseInt(alterObject.icon))) icon.src = alterObject.icon; // For synths...
		else db(dbAction.GET, dbStore.IMAGE, null, alterObject.icon).then(result => {
				icon.src = URL.createObjectURL(result) || defaultIconAlter;
				icon.value = alterObject.icon;
			});
	}
}
function leadingZeros(num, length) {
	num = num.toString();
	zeros = Math.max(length - num.length, 0);
	return '0'.repeat(zeros) + num;
}