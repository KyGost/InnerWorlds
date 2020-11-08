async function fitText(element, max = 100, ratio = 1) {
	if(!document.contains(element)) return setTimeout(()=>{fitText(element, max, ratio)}, 1); // Yucky hack for async...
	element.style.overflow = 'hidden';
	const testElement = document.createElement('SPAN');
		testElement.style.position = 'absolute';
		testElement.style.visibility = 'hidden';
		testElement.style.height = 'auto';
		testElement.style.width = 'auto';
		testElement.style.whitespace = 'nowrap';
		testElement.style.fontSize = '1vh';
		testElement.innerHTML = element.innerHTML;
		document.body.appendChild(testElement);
	element.style.fontSize = Math.min((parseInt(window.getComputedStyle(element).width) / testElement.clientWidth) * ratio, max) + 'vh';
	testElement.remove();
}