const version = 'v0.1.2';

// On load
window.addEventListener('load', () => {
	// Start screens
	screensStart();

	// Load service worker
	navigator.serviceWorker.register('sw.js').then(register => {
		console.log('SW Registered');
	}).catch(error => {
		console.log('SW Registration failed: ' + error);
	})
});

console.log()

// Open important scripts
openJS('assets/script/db.js', true);
openJS('assets/script/dataclass.js', true);
openJS('assets/script/screens.js', true);
openJS('assets/script/consts.js', true);

// Open unimportant scripts
// Internal
openJS('assets/script/import.js');
openJS('assets/script/fittext.js');
/// CJSON JSON compressor
openJS('assets/script/cjson.js');
// External
/// Markdown library
openJS('https://cdn.jsdelivr.net/npm/showdown@1.9.1/dist/showdown.min.js');
/// Image editing
openJS('https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.2/croppie.min.js');
openCSS('https://cdnjs.cloudflare.com/ajax/libs/croppie/2.6.2/croppie.min.css');
//// EXIF support
openJS('https://cdn.jsdelivr.net/npm/exif-js');
/// Icons
openCSS('https://fonts.googleapis.com/icon?family=Material+Icons');
/// IndexedDB JSON Export / Import !(might do custom -- images and such)!
openJS('https://cdn.jsdelivr.net/npm/indexeddb-export-import@2.0.2/index.js');

async function openJS(url, loadImportant) {
	var script = document.createElement('SCRIPT');
	script.src = url;
	if(loadImportant) {
		script.async = false;
		document.head.insertBefore(script, document.head.getElementsByTagName('script')[0]);
	}
	else {
		script.defer = true;
		document.head.appendChild(script);
	}
}
async function openCSS(url) {
	var style = document.createElement('LINK');
	/*style.rel = 'preload';
	style.as = 'style';
	style.setAttribute('onload', 'this.rel="stylesheet"');*/ // Doesn't work in firefox
	style.rel = 'stylesheet';
	style.href = url;
	document.head.appendChild(style);
}