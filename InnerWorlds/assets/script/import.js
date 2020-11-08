function iwImport(dataset, data) {
	var levels = [0, 0, 0];
		// Data
		/// Dataset = system
		//// 0 = Roles (Now groups)
		var groups = [];
		///// 0 = Name
		///// 1 = Description
		///// 2 = Color (as int)
		//// 1 = Alters
		var alters = [];
		///// 0 = Name
		///// 1 = Description
		///// 2 = Role (index)
		///// 3 = Image (index) IGNORE
		/// Dataset = data
		//// 0 = Front Events
		var frontevents = [];
		///// 0 = Alters (array of index)
		///// 1 = Times
		///// 2 = Notes
		///// 3 = Mood
		//// 1 = Todos IGNORE
		//// 2 = Messages IGNORE?
		var messages = [];
		//// 3 = Settings IGNORE?
	levels[0] = 0;
	var firstLevel = data.split('-!!!-');
	firstLevel.forEach(first => {
		levels[1] = 0;
		var secondLevel = first.split('-!!-');
		secondLevel.forEach(second => {
			var dataPieces = [];
			levels[2] = 0;

			var thirdLevel = second.split('-!-');
			thirdLevel.forEach(third =>{
				dataPieces[levels[2]] = third;

				levels[2]++;
			});
			switch(dataset) {
				case 'system':
					switch(levels[0]) {
						case 0: // Groups
							groups[levels[1]] = new Group(dataPieces[0], dataPieces[1], dataPieces[2]);
							break;
						case 1: // Alters
							alters[levels[1]] = new Alter(dataPieces[0], dataPieces[1], groups[dataPieces[2]], '', '');
							break;
					}
					break;
				case 'data':
					switch(levels[0]) {
						case 0: // Frontevents
							alterIndexes = dataPieces[0].split(',');
							fronters = [];
							alterIndexes.forEach(alterIndex => {
								if(alterIndex < 0) {

								} else {
									var alter;
									db(dbAction.GET, dbStore.ALTER, alter, alterIndex);
									fronters.push(alter);
								}
							});
							frontevents[levels[1]] = new Frontevent(fronters, dataPieces[1], dataPieces[2], dataPieces[3]);
							break;
						case 1: // Messages
							break;
					}
					break;
			}
			levels[1]++;
		});
		levels[0]++;
	});
	if(dataset == 'system') {
		db(dbAction.RESET, dbStore.GROUP, groups);
		db(dbAction.RESET, dbStore.ALTER, alters);
	} else if(dataset == 'data') {
		db(dbAction.RESET, dbStore.FRONTEVENT, frontevents);
	}
}