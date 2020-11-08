const databaseName = 'InnerWorldsDatabase';

const dbAction = {
	GET : 'get',
	CURSOR : 'CURSOR',
	PUT : 'put',
	DELETE : 'delete',
	RESET : 'reset',
	EXPORT : 'export',
	IMPORT : 'import',
};

const dbStores = [
	'GroupStore',
	'RoleStore',
	'AlterStore',
	'FronteventStore',
	'ChatStore',
	'MessageStore',
	'ImageStore',
];
const dbStore = {
	GROUP : dbStores[0],
	ROLE : dbStores[1],
	ALTER : dbStores[2],
	FRONTEVENT : dbStores[3],
	CHAT : dbStores[4],
	MESSAGE : dbStores[5],
	IMAGE : dbStores[6],
};
const dbIndexes = [
	{name: 'FronteventDate', store: dbStore.FRONTEVENT, value: 'time'},
	{name: 'MessageChat', store: dbStore.MESSAGE, value: 'chat'},
];
const dbIndex = {
	FRONTEVENTDATE : dbIndexes[0],
	MESSAGECHAT : dbIndexes[1],
};
function db(action, objectStore, object, location) {
	return new Promise((resolve, reject) => {
		var request = window.indexedDB.open(databaseName, 1);
		request.onerror = event => {
			console.log('Database error: ' + event.target.errorCode);
			reject('Errored');
		};
		request.onupgradeneeded = event => {
			var database = request.result;
			createStores(database);
		};
		request.onsuccess = async event => {
			var database = request.result;
			database.onerror = event => {
				console.log('Database error: ' + event.target.errorCode);
			};
			if(action == dbAction.EXPORT) exportToJsonString(database, (error, jsonString) => {
				if(error) reject(error);
				else resolve(CJSON.stringify(JSON.parse(jsonString)));
			});
			else if(action == dbAction.IMPORT) {
				await dbStores.forEach(async store => {
					await database.transaction(store, 'readwrite').objectStore(store).clear();
				});
				importFromJsonString(database, JSON.stringify(CJSON.parse(object)));
			} else {
				var checkStore = objectStore;
				const isIndex = Object.values(dbIndex).includes(objectStore);
				if(isIndex) checkStore = objectStore.store;
				let store = database.transaction(checkStore, 'readwrite').objectStore(checkStore);
				if(isIndex) store = store.index(objectStore.name);
				switch(action) {
					case dbAction.GET:
						if(isIndex || location == undefined) {
							let result = [];
							store.openCursor().onsuccess = event => {
								let cursor = event.target.result;
								if(cursor)
								{
									if(location == undefined || cursor.key == location) result.push(cursor.value);
									cursor.continue();
								}
								else resolve(result);
							}
						} else {
							store.get(location).onsuccess = event => {resolve(event.target.result)};
						}
						break;
					case dbAction.CURSOR:
						store.openCursor(undefined, object).onsuccess = event => {resolve(event.target.result)};
						break;
					case dbAction.PUT:
						if(location) object.key = location;
						store.put(object).onsuccess =  event => {resolve(event.target.result)};
						break;
					case dbAction.DELETE:
						store.delete(location).onsuccess =  event => {resolve(event.target.result)};
						break;
					case dbAction.RESET:
						store.clear().onsuccess = () => object.forEach((item, key) => {
							item.key = key+1;
							store.put(item);
						})
						resolve();
						break;
					default:
						console.log('Action not recognised');
				}
			}
		};
	});
}
function createStores(database) {
	dbStores.forEach(store => {
		store = database.createObjectStore(store, {autoIncrement: true, keyPath: 'key'});
		dbIndexes.forEach(index => {
			if(store.name == index.store) store.createIndex(index.name, index.value);
		});
	});
}
function pkImport(members) {
	let importable = [];
	members.forEach(member => {
		let promise = new Promise((resolve, reject) => resolve(new Alter(member.name, member.description, undefined, undefined, '')));
		if(member.avatar_url) promise = new Promise((resolve, reject) => fetch("https://cors-anywhere.herokuapp.com/" + member.avatar_url).then(response => response.blob()).then(async image => resolve(new Alter(member.name, member.description, undefined, undefined, await db(dbAction.PUT, dbStore.IMAGE, image)))));
		importable.push(promise);
	});
	Promise.all(importable).then(completedPromises => db(dbAction.RESET, dbStore.ALTER, completedPromises));
}