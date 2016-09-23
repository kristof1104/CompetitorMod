var CompetitorMod = {};
(function () {
CompetitorMod.competitors = [];



		//temp for testing
		var test = function(){
		}
		//UI._showNotification = test;
		var setCustomGameSpeed = function(){
			GameFlags = jQuery.extend({},GameFlags);
			GameFlags.ghg6 = true;
		}
		//end temp for testing

		
		
		
var oldStartNewGame = GameManager.startNewGame;
var newStartNewGame = function(){
	CompetitorMod.startNewGame();
	CompetitorUI.updateCompetitorUI();	
	oldStartNewGame();
}
GameManager.startNewGame = newStartNewGame;

CompetitorMod.init = function(){
	CompetitorModPublisher.init();
	CompetitorUI.init();

	//init tick,Save,Load
	GDT.on(GDT.eventKeys.gameplay.weekProceeded, CompetitorMod.tick);
	GDT.on(GDT.eventKeys.saves.loading, CompetitorMod.load);
	GDT.on(GDT.eventKeys.saves.saving, CompetitorMod.save);
	
	//debug
	GDT.on(GDT.eventKeys.saves.loading, setCustomGameSpeed);
	
	//test
	/*ResourceKeys.Level1 = "./mods/CompetitorMod/source/images/level1.png";
	var loader = new html5Preloader(ResourceKeys.Level1);
	GameDev.ResourceManager.resources[ResourceKeys.Level1] = loader.getFile(ResourceKeys.Level1);*/
}

CompetitorMod.save = function(e){
	var data = e.data;
	var competitorModData = data['competitorModData'];
	if (!competitorModData) {
		competitorModData = data.competitorModData = {};
	}
	competitorModData["competitors"] = CompetitorMod.competitors.map(function (n) {return n.save()});
}

CompetitorMod.load = function(e){
	var data = e.data;
	var competitorModData = data['competitorModData'];
	if (!competitorModData) {
		CompetitorMod.startNewGame();
	}else if(competitorModData["competitors"]){
		CompetitorMod.competitors = competitorModData["competitors"].map(function (o) {return Competitor.load(o)});
	}
	
	CompetitorUI.updateCompetitorUI();
}

CompetitorMod.tick = function(company){
	for (var i=CompetitorMod.competitors.length-1;i>=0;i--){
		var competitor = CompetitorMod.competitors[i];
		
		if(competitor.flagForRemoval == true){
			//remove from array and add new competitor
			CompetitorMod.competitors.remove(competitor);
			CompetitorMod.addNewCompetitor();
			continue;
		}
		competitor.tick();
	}
	CompetitorMod.sortCompetitors();
	
	CompetitorUI.updateCompetitorUI();
}

CompetitorMod.startNewGame = function(company){
	CompetitorMod.competitors = [];
	CompetitorMod.competitors.push(new Competitor("ID_sierra","Sienna",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_Ubisoft","Ubicroft",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_Minnisoft","MinniSoft",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_AreaNet","AreaNet",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_BackboneMedia","Backbone Media",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_BionicWare","BionicWare",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_BlackWolfGames","Black Wolf Games",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_BulldogProductions","Bulldog Productions",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_Kogonami","Kogonami",[],CompetitorMod.getRandomTopics().slice(0, 4)));
	CompetitorMod.competitors.push(new Competitor("ID_EagleSoftware","Eagle Software",[],CompetitorMod.getRandomTopics().slice(0, 4)));
}

CompetitorMod.addNewCompetitor = function(){
	var name = CompanyNames.pickRandom();
	
	//check if name is used already
	for (var i=0;i<CompetitorMod.competitors.length;i++){
		var competitor = CompetitorMod.competitors[i];
		if(competitor.name == name){
			CompetitorMod.addNewCompetitor();
			return;
		}
	}
	
	var new_competitor = new Competitor("ID_"+name.replace(/\s/g,"") , name,[],CompetitorMod.getRandomTopics().slice(0, 4));
	new_competitor.cash = 2500000;
	CompetitorMod.competitors.push(new_competitor);
}

CompetitorMod.getRandomTopics = function () {
	var original = Topics.topics;
	var finalOrder = original.slice(0, 0);
	var rest = original.slice(0);
	var random = new MersenneTwister(Math.floor(Math.random() * 65535));
		while (rest.length > 0) {
			var index = Math.floor(random.random() * rest.length);
			finalOrder.push(rest[index]);
			rest.splice(index, 1)
		}
	return finalOrder
};

CompetitorMod.sortCompetitors = function(){
	CompetitorMod.competitors.sort(function(a, b){
	 return a.cash-b.cash;
	});
	CompetitorMod.competitors.reverse();
}

var getCompetitor = function(competitor_id){
	for (var i=0;i<CompetitorMod.competitors.length;i++){
		var competitor = CompetitorMod.competitors[i];
		if(competitor.id == competitor_id){
			return competitor;
		}
	}
	return null;
}

var CompetitorGame = function (name) {
	this.name = name;
	this.score = 8;
	this.fans = 0;
	this.gameSize = "small";
	this.releaseWeek = 0;
	this.genre = undefined;
	this.topic = undefined;
	this.weeksOnMarket = 0;
	this.targetAudience = "everyone";
	this.hypePoints = 0;
	this.platforms = [];
	this.platforms.push(Platforms.allPlatforms[0]);
	this.totalSalesCash =0;
	this.currentSalesCash = 0;
	this.nextSalesCash = 0;
	this.nextSalesRank = 0;
	this.fansChangeTarget = 0;
	this.nextfansChange = 0;
	this.fansChanged = 0;
	this.costs = 0;
	this.contract = undefined;
	this.flags = {};
	
	this.save = function () {
		var data = {};
		data["name"] = this.name;
		data["score"] = this.score;
		data["fans "] = this.fans;
		data["gameSize"] = this.gameSize;
		data["releaseWeek"] = this.releaseWeek;
		data["genre"] = this.genre.id;
		data["topic"] = this.topic.id;
		data["targetAudience"] = this.targetAudience;
		data["hypePoints"] = this.hypePoints;
		data["platforms"] = this.platforms.map(function (p) {return {"id" : p.id}});
		data["totalSalesCash"] = this.totalSalesCash;
		data["currentSalesCash"] = this.currentSalesCash;
		data["fansChangeTarget"] = this.fansChangeTarget;
		data["nextfansChange"] = this.nextfansChange;
		data["fansChanged"] = this.fansChanged;
		data["nextSalesCash"] = this.nextSalesCash;
		data["nextSalesRank"] = this.nextSalesRank;
		data["costs"] = this.costs;
		data["flags"] = this.flags;
		return data
	}
}

CompetitorGame.load = function (data) {
		if (data) {
			var game = new CompetitorGame();
			game.name = data["name"];
			game.score = data["score"];
			game.fans = data["fans"];
			game.gameSize = data["gameSize"];
			game.releaseWeek = data["releaseWeek"];
			if (data["genre"] != undefined)
				game.genre = GameGenre.getAll().first(function (item) {return item.id === data["genre"]});
			if (data["secondGenre"] != undefined)
				game.secondGenre = GameGenre.getAll().first(function (item) {return item.id === data["secondGenre"]});	
			if (data["topic"] != undefined)
				game.topic = Topics.topics.first(function (item) {return item.id === data["topic"]});
			game.targetAudience = data["targetAudience"];
			game.hypePoints = data["hypePoints"];
			if (data["platforms"] != undefined)
				game.platforms = data["platforms"].map(function (f) {
						var platform = Platforms.allPlatforms.first(function (item) {return item.id === f["id"]});
						if (!platform)
							platform = company.licencedPlatforms.first(function (item) {return item.id === f["id"]});
						return platform
				});		
			game.totalSalesCash = data["totalSalesCash"];
			game.currentSalesCash = data["currentSalesCash"];
			game.fansChangeTarget = data["fansChangeTarget"];
			game.nextfansChange = data["nextfansChange"];
			game.fansChanged = data["fansChanged"];
			game.nextSalesCash = data["nextSalesCash"];
			game.nextSalesRank = data["nextSalesRank"];
			game.costs = data["costs"];
			game.flags = data["flags"];
			if (!game.flags)
				game.flags = {};

			return game
		}
		return undefined
	};

var Competitor = function (id,name,genres,topics) {
	this.id = id;
	this.name = name;
	this.gameLog = [];
	this.activeGenres = genres;
	this.activeTopics = topics;
	this.cash = 75000;
	this.fans = 0;
	this.isLastGameSelling = false;
	this.flags = {};
	this.licencedPlatforms = [];
	this.availablePlatforms = [];
	this.owned = false;
	this.xp = 0;
	this.maxGamesUntilNewTopic = 20;
	this.knowledgeBase = [];
	this.gamesUntilNewTopîc = this.maxGamesUntilNewTopic;
	this.activeContract = undefined;
	this.flagForRemoval = false;
	
	this.getLastGameInfo = function(){
		if(this.gameLog.length <1)
			return "None";
		
		var game = this.gameLog[this.gameLog.length-1];
		return "{0}  Score: {1}<br>Genre: {2}<br>Topic: {3}<br>Costs: {4}".format(game.name,game.score,game.genre.name,game.topic.name,UI.getShortNumberString(game.costs));
	}

	this.processSales = function(){
		var game = this.gameLog[this.gameLog.length-1];
		CompetitorModSales.sellGame(this,game);
	}
	
	this.generateGameScore = function(game){
		var topicGenreMatch = GameGenre.getGenreWeighting(game.topic.genreWeightings, game.genre);
		var maxScore = 0;
		var score;
		var r = GameManager.company.getRandom();

		switch (topicGenreMatch) {
			case 0.6:
				maxScore = 3;
				break;
			case 0.7:
				maxScore = 5;
				break;
			case 0.8:
				maxScore = 8;
				break;
			case 0.9:
				maxScore = 9;
				break;
			case 1:
				maxScore = 10;
				break
		}
		
		if(this.xp > 1000){
			r += 0.05;
		}else if(this.xp > 2000){
			r += 0.075;
		}else if(this.xp > 3000){
			r += 0.125;
		}else if(this.xp > 4000){
			r += 0.15;
		}
		
		if(r <=0.25){
			score = Math.floor(maxScore * 0.6);
		}else if(r <=0.5){
			score = Math.floor(maxScore * 0.7);
		}else if(r <=0.75){
			score = Math.floor(maxScore * 0.8);
		}else if(r <=0.9){
			score = Math.floor(maxScore * 0.9);
		}else if(r <=1){
			score = maxScore;
		}else{
			score = maxScore;
		}
		
		return score;
	}
	
	this.addNewTopic = function(){
		var newTopic;
		var foundTopic;
		do{
			foundTopic = null;
			newTopic = CompetitorMod.getRandomTopics().slice(0, 1)[0];
			foundTopic = this.activeTopics.first(function (item) {return item.id === newTopic.id});
		}while(foundTopic != null && foundTopic.id === newTopic.id);
		
		this.activeTopics.push(newTopic);
	}
	
	this.checkIfComboIsBadAndKnown = function(topic,genre){
		var topicGenreMatch = GameGenre.getGenreWeighting(topic.genreWeightings, genre);
		if((topicGenreMatch == 0.6 || topicGenreMatch == 0.7 || topicGenreMatch == 0.8) && this.hasComboKnowledge(topic,genre)){
			return true;
		}else{
			return false;
		}
	}
	
	this.releaseNewGame = function () {
		var game = new CompetitorGame(this.generateGameName());
		game.releaseWeek = Math.floor(GameManager.company.currentWeek) + 1;		
		var genre;
		var topic;
		
		if(this.activeContract == undefined){
			//check if combo is bad and in knowledgebase:
			do{
				genre = GameGenre.getAll().pickRandom();
				topic = this.activeTopics.pickRandom();
			}while(this.checkIfComboIsBadAndKnown(topic,genre));
			
			if( GameManager.company.currentLevel == 2)
				game.gameSize = "medium";
			if( GameManager.company.currentLevel == 3)
				game.gameSize = "medium";		
			if( GameManager.company.currentLevel == 4)
				game.gameSize = "large";
		}else{
			//get contract details (genre & topic)
			genre = this.activeContract.genre;
			topic = this.activeContract.topic;
			game.gameSize = this.activeContract.gameSize;
			game.targetAudience = this.activeContract.targetAudience;
			game.contract = this.activeContract;
			this.activeContract = undefined;
			game.flags.royaltyRate = true;
		}
		
		game.genre = genre;
		game.topic = topic;
		game.score = this.generateGameScore(game);
		
		this.gameLog.push(game);
		this.addToKnowledge(game);
		this.isLastGameSelling = true;
		
		//add xp for releasing game
		if(game.score == 10){
			this.xp += 75;
		}else{
			this.xp += 50;
		}
		
		//GameManager.company.notifications.push(new Notification("News", "{0} has released a their new game {1}".format(name,game.name)));
		
		CompetitorModSales.calculateSales(this,game);
		
		//process game dev costs
		var gameCosts = 0;
		for(var i = 0;i< game.platforms.length;i++){
			gameCosts += game.platforms[i].developmentCosts;
		}
		
		//get engine from user and calculate cost of using the engine
		if(GameManager.company.engines.length >0)
			gameCosts += Math.floor(GameManager.company.engines[GameManager.company.engines.length-1].costs/2.6);
			

		this.cash -= gameCosts;
		game.costs = gameCosts;
		
		
		
		//publishercontracts
		if(game.contract != undefined ){
			if(game.score < game.contract.score){
				//Company didn't have correct score--> give penalty 
				this.cash -= game.contract.penaltyFee;
				GameManager.company.notifications.push(new Notification("Publisher Contract", "{0} has failed to meet the required score for your Publish Contract. You will receive a penalty fee of {1}".format(this.name,UI.getShortNumberString(game.contract.penaltyFee))));
				GameManager.company.adjustCash(game.contract.penaltyFee, "Publisher Contract Penalty {0}".format(this.name));
			}else{
				GameManager.company.notifications.push(new Notification("Publisher Contract", "{0} has just released '{1}' the required score for your Publish Contract has been reached! You will receive a weekly profit of {2}%".format(this.name,game.name,game.contract.royalty)));
			}
			GameManager.company.adjustCash(-game.contract.penaltyFee, "Publisher Contract Costs {0}".format(game.contract.preBonus));
		}
		
		//check if a new topic needs to be added!
		this.gamesUntilNewTopîc -= 1;
		if(this.gamesUntilNewTopîc <=0){
			this.addNewTopic();
			this.gamesUntilNewTopîc = this.maxGamesUntilNewTopic;
		}
	}
	
	this.processWeek = function () {
		//costs
		if(GameManager.company.currentLevel == 1)
			this.cash -= 2000;
		else if(GameManager.company.currentLevel == 2)
			this.cash -= 10000;
		else if(GameManager.company.currentLevel > 2)
			this.cash -= 15000;
		/*else if(GameManager.company.currentLevel == 3)
			this.cash -= 2000;
		else if(GameManager.company.currentLevel == 4)
			this.cash -= 2000;	*/
			
			
		//check if company is bankrupt
		if(this.cash < -50000){
				GameManager.company.notifications.push(DecisionNotifications.bankruptcyNotification.getNotification(this));
			//GameManager.company.notifications.push(new Notification("Bankrupt", "A sad turn of events, {0} a company known for it's great games has just announced Bankruptcy.".format(this.name)));
		}

		
		//owning revenue
		if(this.owned){
			var revenue = Math.floor((this.cash * 0.05) /100);
			this.cash -= revenue;
			GameManager.company.adjustCash(revenue, "Weekly Revenue {0}".format(this.name));
			GameManager.company.researchPoints +=1 ;
		}
	}
	
	this.processPublisherContracts = function(){
		var contract;
		for(var i = 0;i<CompetitorModPublisher.contracts.length;i++){
			contract = CompetitorModPublisher.contracts[i];
			if(contract.activeCompany === undefined){
				var foundTopic = this.activeTopics.first(function (item) {return item.id === contract.topic.id});
				if(foundTopic != null){
					//competitor has researched the needed topic
					//Add to list of availible competitors and random choose one to complete the task, after that notify user publish deal is done
					//for now just always use this company, so I can test the sales mechanism
					contract.activeCompany = this;
					this.activeContract = contract;
				}
			}
		}
	}
	
	this.tick = function(){
		if(this.isLastGameSelling == true){
			this.processSales();
		}else{
			this.releaseNewGame();
		}
		this.processWeek();
		this.processPublisherContracts();
	}
	
	this.hasComboKnowledge = function (topic, genre) {
		if (!this.knowledgeBase)
			return false;
		return this.knowledgeBase.first(function (item) {
			return item.topicId == topic.id && (item.genreId == genre.id /*&& (!game.secondGenre || game.secondGenre.id == item.secondGenreId)*/)
		})
	};
	
	this.addToKnowledge = function(game){
		if (!this.knowledgeBase)
			this.knowledgeBase = [];
		if (this.hasComboKnowledge(game.topic,game.genre))
			return;
		var topicGenreMatch = GameGenre.getGenreWeighting(game.topic.genreWeightings, game.genre);

		var item = {
			"topicId" : game.topic.id,
			"genreId" : game.genre.id,
			"topicGenreMatch" : topicGenreMatch
		};
		/*if (game.secondGenre)
			item.secondGenreId = game.secondGenre.id;*/
		this.knowledgeBase.push(item);
	}
	
	this.generateGameName = function(){
		var name = null;
		do{
			name = Kristof1104Lib.generateGameName();
		}while(this.isExistingGameName(name) == true);
		return name;
	}
	
	this.isExistingGameName = function(name){
		var name = this.gameLog.first(function (item) {
			return item.name == name;
		})
		if(!name && name != null){
			return true;
		}
		return false;
	}
	
	this.save = function () {
		var data = {};
		
		data["id"] = this.id;
		data["name"] = this.name;
		data["cash"] = this.cash;
		data["fans"] = this.fans;
		data["flags"] = this.flags;
		data["owned"] = this.owned;
		data["xp"] = this.xp;
		data["isLastGameSelling"] = this.isLastGameSelling;
		data["gamesUntilNewTopîc"] = this.gamesUntilNewTopîc;
		data["knowledgeBase"] = this.knowledgeBase;
		data["gameLog"] = this.gameLog.map(function (n) {
				return n.save()
			});
		data["activeGenres"] = this.activeGenres.map(function (n) {
				return n.save()
			});
		data["activeTopics"] = this.activeTopics.map(function (n) {
				return TopicsSerializer.save(n)
			});
		data["licencedPlatforms"] = this.licencedPlatforms.map(function (n) {
				return PlatformsSerializer.save(n)
			});
		data["availablePlatforms"] = this.availablePlatforms.map(function (n) {
				return PlatformsSerializer.save(n)
			});
		return data
	}
}

Competitor.load = function (data) {
		var obj = new Competitor();
		obj.id = data["id"];
		obj.name = data["name"];
		obj.cash = data["cash"];
		obj.fans = data["fans"];
		obj.owned = data["owned"];
		obj.xp = data["xp"];
		obj.isLastGameSelling = data["isLastGameSelling"];
		obj.gamesUntilNewTopîc = data["gamesUntilNewTopîc"];
		obj.knowledgeBase = data["knowledgeBase"];
		obj.flags = data["flags"];
		if (!obj.flags)
			obj.flags = {};
			
		obj.activeGenres = data["activeGenres"].map(function (o) {
				return Genres.load(o)
			});
		obj.activeTopics = data["activeTopics"].map(function (o) {
				return TopicsSerializer.load(o)
			});
		obj.licencedPlatforms = data["licencedPlatforms"].map(function (o) {
				return PlatformsSerializer.load(o)
			});
		obj.availablePlatforms = data["availablePlatforms"].map(function (o) {
				return PlatformsSerializer.load(o)
			});

		if (data["gameLog"])
			obj.gameLog = data["gameLog"].map(function (o) {
					return CompetitorGame.load(o)});
		
		return obj
	};


//UI Actions
CompetitorMod.sabotage = function(competitor_id,option){
	var competitor = getCompetitor(competitor_id);
	if(option == 1){
		var action = function(){
			GameManager.company.adjustCash(-100000, "Sabotage");
			//temp debug bankrupt company
			competitor.cash = -50000;
		}
		CompetitorUI.confirmAction("Are you sure you want to bankrupt this competitor? This will costs you 100K",action);
	}else if(option == 2){
		var action = function(){
			GameManager.company.adjustCash(-100000, "Hire Scammers");
			competitor.cash -= 200000;
		}
		CompetitorUI.confirmAction("Are you sure you want to hire scammers to scam 200K from this competitor? This will costs you 100K",action);
	}else if(option == 3){
		var action = function(){
			GameManager.company.adjustCash(-100000, "Hack Competitor");
			GameManager.company.researchPoints = Math.floor(GameManager.company.researchPoints) + 10;
			VisualsManager.researchPoints.updatePoints(GameManager.company.researchPoints); 
		}
		CompetitorUI.confirmAction("Are you sure you want to hack this competitor? This will costs you 100K. You will get 10 Research Points",action);
	}
}

CompetitorMod.buy = function(competitor_id,option){
	var competitor = getCompetitor(competitor_id);
	if(option == 1){
		if(competitor.owned == true)
			return;
	
		var action = function(){
			GameManager.company.adjustCash(-competitor.cash, "Buy");
			competitor.owned = true;
		}
		CompetitorUI.confirmAction("Are you sure you want to buy this competitor?",action);
	}
}

CompetitorMod.settings = function(competitor_id,option){
	var competitor = getCompetitor(competitor_id);
	if(option == 1){
		if(competitor == undefined || competitor.flagForRemoval == true || competitor.owned == false)
			return;
		
		var action = function(){
			// add company cash to parent company
			GameManager.company.adjustCash(competitor.cash, "Merge company {0}".format(competitor.name));
			//add research points xp /50 = 1 RP
			GameManager.company.researchPoints += Math.floor(competitor.xp/50);
			VisualsManager.researchPoints.updatePoints(GameManager.company.researchPoints); 
			//add fans
			GameManager.company.fans += competitor.fans;
			//todo staff training!
			
			//flag competitor for removal
			competitor.owned = false;
			competitor.flagForRemoval = true;
		}
		
		CompetitorUI.confirmAction("Are you sure you want to merge this competitor with your company?",action);
		
	}else if(option == 2){
		if(competitor.owned == false)
			return;
			
		var action = function(){
			GameManager.company.adjustCash(competitor.cash, "Sell company {0}".format(competitor.name));
			competitor.owned = false;
		}
			
		CompetitorUI.confirmAction("Are you sure you want to sell this competitor?",action);
	}else if(option == 3){
		if(competitor.owned == false)
			return;
		
		var action = function(){
			var name = $("#CompetitorModContent").find("#textField"+option).val();
			competitor.name = name;
		}
		CompetitorUI.confirmAction("Are you sure you want to rename this competitor?",action);
	}
}

//UI part
CompetitorMod.showGameHistory = function (competitor) {
		var games = competitor.gameLog;
		if (games.length > 0) {
			GameManager.pause(true);
			var dlg = $("#gameHistoryDialog");
			var content = dlg.find("#gameHistoryContent");
			content.empty();
			dlg.find(".windowTitle").text(competitor.name + " Game History");
			
			var slider = $('<div class="gameHistorySliderContainer royalSlider rsDefaultInv"></div>');
			content.append(slider);
			games.slice().sort(function (a,
					b) {
				if (a.releaseWeek > b.releaseWeek)
					return 1;
				return -1
			});
			for (var i = games.length - 1; i >= 0; i--) {
				var game = games[i];
				if (!game.flags.isExtensionPack || forPostMortem) {
					var avgScore = game.score;
					var element = CompetitorMod.getElementForGameDetail(game, avgScore);
					slider.append(element)
				}
			}
			//var selectGame = GameManager.flags.selectGameActive;
			//if (selectGame)
			//	GameManager.flags.selectedGameId = null;
			//var dialogHeader = selectGame ? "Select Game".localize("heading") : "Game History".localize();
			//dlg.find(".windowTitle").text(dialogHeader);
			UI.maxFont(dlg.find(".windowTitle"), 34, 50);
			var buttonText = "OK".localize();
			dlg.find(".okButton").text(buttonText).clickExcl(function () {
				Sound.click();
				//if (selectGame)
					//GameManager.flags.selectedGameId = dlg.find(".rsActiveSlide").find(".gameId").text();
				$("#gameHistoryDialog").dialog("close");
				GameManager.resume(true)
			});
			if (PlatformShim.ISWIN8)
				slider.gdSlider();
			dlg.dialog({
				draggable : false,
				width : 660,
				height : 650,
				modal : true,
				resizable : false,
				show : "fade",
				zIndex : 6000,
				open : function () {
					var closeButton =
						$(this).parents(".ui-dialog:first").find(".closeDialogButton");
					if (closeButton.length == 0) {
						closeButton = $(UI.closeButtonTemplate);
						$(this).parents(".ui-dialog:first").append(closeButton)
					}
					closeButton.zIndex = 4500;
					closeButton.clickExclOnce(function () {
						Sound.click();
						dlg.dialog("close")
					});
					$(this).siblings(".ui-dialog-titlebar").remove();
					$(this).parents(".ui-dialog:first").addClass("tallWindow");
					$(this).parents(".ui-dialog:first").addClass("windowBorder");
					$(this).parents(".ui-dialog:first").removeClass("ui-widget-content");
					var that = this;
					if (!PlatformShim.ISWIN8)
						slider.gdSlider()
				},
				close : function () {
					$(this).dialog("destroy");
					this.style.cssText = "display:none;";
					//if (callback)
						//callback();
					GameManager.resume(true)
				}
			})
		}
}

CompetitorMod.getElementForGameDetail = function (game, avgReview) {
	var date = GameManager.company.getDate(game.releaseWeek);
	var template = $("#gameDetailsTemplate").clone();
	template.removeAttr("id");
	template.find(".gameDetailsTitle").text(game.name);
	if (UI._gameDetailsColumn1FontSize == undefined) {
		var column1 = template.find(".gameDetailsColumn1");
		var texts = [];
		for (var i = 0; i < column1.length; i++)
			if (column1[i].innerText)
				texts.push(column1[i].innerText);
		var fontName = UI.IS_SEGOE_UI_INSTALLED ?
			"Segoe UI" : "Open Sans";
		UI._gameDetailsColumn1FontSize = 15;
		var font = "bolder {0}pt {1}".format(UI._gameDetailsColumn1FontSize, fontName);
		for (var i = 0; i < texts.length; i++) {
			if (UI._gameDetailsColumn1FontSize == 10)
				break;
			var text = new createjs.Text(texts[i], font, "black");
			if (text.getMeasuredWidth() > 180) {
				UI._gameDetailsColumn1FontSize -= 1;
				font = "{0}pt {1}".format(UI._gameDetailsColumn1FontSize, fontName);
				i--
			}
		}
	}
	template.find(".gameDetailsColumn1").css({
		"font-size" : UI._gameDetailsColumn1FontSize + "pt"
	});
	if (!UI.IS_SEGOE_UI_INSTALLED) {
		template.find(".gameDetailsColumn1").css({
			"font-family" : "Open Sans"
		});
		template.find(".gameDetailsColumn2").css({
			"font-size" : "12pt",
			"font-family" : "Open Sans"
		})
	}
	//template.find(".gameId").text(game.id);
	if (game.secondGenre)
		template.find(".gameDetailsTopicGenre").text(game.topic.name + "/" + game.genre.name + "-" + game.secondGenre.name);
	else
		template.find(".gameDetailsTopicGenre").text(game.topic.name + "/" + game.genre.name);
	var platforms = game.platforms.map(function (p) {
			return p.name
		}).join(", ");
	template.find(".gameDetailsPlatform").text(platforms);
	//if (GameManager.company.researchCompleted.indexOf(Research.TargetAudience) !=
	//	-1)
		//template.find(".gameDetailsAudience").text(General.getAudienceLabel(game.targetAudience));
	template.find(".gameDetailsImage").attr("src", Platforms.getPlatformImage(game.platforms[0], game.releaseWeek));
	template.find(".gameDetailsCosts").text(UI.getShortNumberString(game.costs));
	if (game.releaseWeek > GameManager.company.currentWeek)
		template.find(".gameDetailsReleaseWeek").text("coming soon".localize());
	else
		template.find(".gameDetailsReleaseWeek").text("Y{0} M{1} W{2}".localize("date display").format(date.year,
				date.month, date.week));
	if (game.totalSalesCash > 0) {
		template.find(".gameDetailsAmountEarned").text(UI.getShortNumberString(game.totalSalesCash));
		var profitElement = template.find(".gameDetailsTotal");
		var profit = game.totalSalesCash - game.costs;
		if (profit < 0) {
			template.find(".gameDetailsTotalLabel").text("Loss:".localize());
			profitElement.addClass("red")
		} else
			profitElement.addClass("green");
		profitElement.text(UI.getShortNumberString(profit));
		template.find(".gameDetailsFansChange").text(UI.getLongNumberString(Math.max(0, Math.round(game.fansChanged))));
		if (game.topSalesRank > 0)
			template.find(".gameDetailsTopSalesRank").text(game.topSalesRank);
		else
			template.find(".gameDetailsTopSalesRank").text("");
			template.find(".gameDetailsTopSalesRankLabel").text("");
		template.find(".gameDetailsUnitsSold").text("");
		template.find(".gameDetailsUnitsSoldLabel").text("");
	} else {
		var displayText = game.flags.isExtensionPack ? "-" : "?";
		template.find(".gameDetailsUnitsSold").text(displayText);
		template.find(".gameDetailsAmountEarned").text(displayText);
		template.find(".gameDetailsTotal").text(displayText);
		template.find(".gameDetailsFansChange").text(displayText);
		template.find(".gameDetailsTopSalesRank").text(displayText);
		template.find(".gameDetailsAmountEarned").removeClass("green")
	}
		template.find(".gameAverageScoreOverview").text(avgReview);
		template.find(".gameDetailsAvgReview").text(avgReview)
	
	return template
}

//Notifications
//Hook the broadCastNofificationComplete to Set the competitor source.
var old_broadCastNofificationComplete = General.broadCastNofificationComplete
var new_broadCastNofificationComplete = function (notification, params) {
		if (notification.sourceId === "bankruptcyNotification"){
		//set competitor
			DecisionNotifications.bankruptcyNotification.setCompetitor(notification.competitor);
		}
	old_broadCastNofificationComplete(notification, params);
};
General.broadCastNofificationComplete = new_broadCastNofificationComplete

{
var dn = DecisionNotifications;
	dn.bankruptcyNotification = {
		id : "bankruptcyNotification",
		trigger : function (company) {
				return false
		},
		competitor : undefined,
		setCompetitor : function (_competitor) {
			this.competitor = _competitor;
			return;
		},
		getNotification : function (company) {
			var msg = "A sad turn of events, {0} a company known for it's great games has just announced Bankruptcy. Still there is a great opportunity would you like to purchase this company? Estimated costs: {1}".localize().format(company.name,UI.getShortNumberString(-(company.cash - 500000)));
			return new Notification({
				sourceId : "bankruptcyNotification",
				header : "Bankruptcy".localize("heading"),
				text : msg,
				competitor : company,
				options : ["Buy company and pay Debts".localize("decision action button; move as in move to new office"), "Let It burn :p".localize("decision action button")]
			})
		},
		complete : function (decision,notification) {
			var company = GameManager.company;
			if (decision === 0) {
				company.adjustCash(this.competitor.cash - 500000, "Buy bankrupt company {0}".format(this.competitor.name));
				this.competitor.owned = true;
				this.competitor.cash = 500000;
			} else{
				//flag competitor for removal.
				this.competitor.flagForRemoval = true;
			}
		}
	}
}

})();