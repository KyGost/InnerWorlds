class Group {
	constructor(name = '', description = '', color = '') {
		this.name = name; // String
		this.description = description; // Markdown / String
		this.color = color; // Color	
	}
}
class Alter {
	constructor(name = '', description = '', group = new Group(), roles = '', icon = '') {
		if(arguments.length == 2) icon = description;
		this.name = name; // String
		this.description = description; // Markdown / String
		this.group = group; // Index (Group)
		this.roles = roles; // Array of Index (Role)
		this.icon = icon; // Index (Image)
	}
}
class Frontevent {
	constructor(alters, time, notes, mood) {
		this.alters = alters; // Array of Index (Alter)
		this.time = new Date(time); // DateTime
		this.notes = notes; // String
		this.mood = mood; // Byte
	}
}
class Message {
	constructor(sender, message, sent, chat) {
		this.sender = sender; // Alter
		this.message = message; // String
		this.sent = sent; // DateTime
		this.chat = chat; // Index (Chat)
	}
}
class Chat {
	constructor(name) {
		this.name = name; // String
	}
}