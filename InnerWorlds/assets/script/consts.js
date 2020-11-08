// Files
	const graphicDirectory = 'assets/graphic/';
	const defaultIconAlter = graphicDirectory + 'alter_default.webp';

// General
	const navBarItems = [
		navItem('maps', 'maps'),
		navItem('alters', 'altersPage'),
		navItem('new', 'newFront'),
		navItem('settings', 'settings'),
		navItem('messages', 'messages'),
	];

	const settingRegions = [
		{title: 'Credits', screen: 'credits'},
		{title: 'Import/Export', screen: 'importexport'},
		{title: 'Debug Menu', screen: 'debug'},
	];

	const creditsList = [
		{role: 'Functionality', name: 'Kyran Gostelow', link: ''},
		{role: 'Design', name: 'Emily Rush', link: ''},
		{role: 'Origin', name: 'Fragmented Psyche', link: 'https://www.instagram.com/frgmntdpsyche/'},
	];

// Code based
	let screens = [];
	const locale = 'en-SE'; // It seems the Swedish are a beautiful people... Other countries I cannot say that for...
	const optionsForDate = {year: 'numeric', month: '2-digit', day: '2-digit'};
	const optionsForTime = {hour: '2-digit', minute: '2-digit'};
	const dateFormatter = new Intl.DateTimeFormat(locale, optionsForDate);
	const timeFormatter = new Intl.DateTimeFormat(locale, optionsForTime);

	var croppie;

	const croppieDefault = {
		boundary: {width: 200, height: 200},
		viewport: {width: 200, height: 200, type: 'circle'},
		showZoomer: false,
		enableExif: true
	};

// Elements
	const base = document.body;
	const header = document.createElement('header');
		header.id = 'HEADER';
	const footer = document.createElement('footer');
		footer.id = 'FOOTER';