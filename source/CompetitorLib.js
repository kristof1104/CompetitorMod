var CompetitorLib = {};
var Experience;
(function () {

CompetitorLib.createCompetitor = function(id,name,genres,topics){
	return new Competitor(id,name,genres,topics);
};

var LevelSystem = {
	Level1 : {	id:"Level1",
					levelNumber: 1,
					xpRangeStart: 0,
					xpRangeEnd: 10000
				 },	
	Level2 : {	id:"Level2",
					levelNumber: 2,
					xpRangeStart: 10000,
					xpRangeEnd: 20000
				 },	
	Level3 : {	id:"Level3",
					levelNumber: 3,
					xpRangeStart: 20000,
					xpRangeEnd: 30000
				 },	
	Level4 : {	id:"Level4",
					levelNumber: 4,
					xpRangeStart: 30000,
					xpRangeEnd: 50000
				 },	
	Level5 : {	id:"Level5",
					levelNumber: 5,
					xpRangeStart: 50000,
					xpRangeEnd: 70000
				 },	
	Level6 : {	id:"Level6",
					levelNumber: 6,
					xpRangeStart: 70000,
					xpRangeEnd: 90000
				 },	
	Level7 : {	id:"Level7",
					levelNumber: 7,
					xpRangeStart: 90000,
					xpRangeEnd: 100000
				 },	
	Level8 : {	id:"Level8",
					levelNumber: 8,
					xpRangeStart: 100000,
					xpRangeEnd: 110000
				 },	
	Level9 : {	id:"Level9",
					levelNumber: 9,
					xpRangeStart: 110000,
					xpRangeEnd: 140000
				 },	
	Level10 : {	id:"Level10",
					levelNumber: 10,
					xpRangeStart: 140000,
					xpRangeEnd: 9999999999999999999999999999999999999999999
				 },
	
	getAllLevels : function(){return [LevelSystem.Level1,LevelSystem.Level2,LevelSystem.Level3,LevelSystem.Level4,LevelSystem.Level5,LevelSystem.Level6,LevelSystem.Level7,LevelSystem.Level8,LevelSystem.Level9,LevelSystem.Level10]},
	
	getLevelForExperienceItem : function(item){
		var xp = item.xp;
		var allLvls = LevelSystem.getAllLevels();
		for (var i=0;i<allLvls.length;i++) {
			var level = allLvls[i];
			if(xp >= level.xpRangeStart && xp < level.xpRangeEnd){
					return level;
			}
		}
	}
};

	

//todo:check if there is one exp.Action per competitor object or all competitors lead to one exp.Action item. 
Experience = function(){
	this.Action = {
        id: "Action",
        xp: 0
    };
    this.Adventure = {
        id: "Adventure",
        xp: 0
    };
    this.RPG = {
        id: "RPG",
        xp: 0
    };
    this.Simulation = {
        id: "Simulation",
        xp: 0
    };
    this.Strategy = {
        id: "Strategy",
        xp: 0
    };
    this.Casual = {
        id: "Casual",
        xp: 0
    };
    this.MMO = {
        id: "MMO",
        xp: 0
    };
	
    this.getAll = function() {
        return [this.Action, this.Adventure, this.RPG, this.Simulation, this.Strategy, this.Casual,this.MMO];
    };
	
	this.save = function () {
		var data = {};
		data["Action"] = this.Action.xp;
		data["Adventure"] = this.Adventure.xp;
		data["RPG"] = this.RPG.xp;
		data["Simulation"] = this.Simulation.xp;
		data["Strategy"] = this.Strategy.xp;
		data["Casual"] = this.Casual.xp;
		data["MMO"] = this.MMO.xp;
		return data
	}
};
Experience.load = function(data){
	var obj = new Experience();
	obj.Action.xp = data["Action"];
	obj.Adventure.xp = data["Adventure"];
	obj.RPG.xp = data["RPG"];
	obj.Simulation.xp = data["Simulation"];
	obj.Strategy.xp = data["Strategy"];
	obj.Casual.xp = data["Casual"];
	obj.MMO.xp = data["MMO"];
	return obj;
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
	
	this.experience = new Experience();
	this.focusPoints = [];
	this.maxFocusPoints = 2;
	
	//temp function for loggin :)
	this.getDebugData = function(){
		var str = "FocusPoints: \x0D";
		for(var i=0;i<this.focusPoints.length;i++){
			var focuspoint = this.focusPoints[i];
			str += focuspoint.id;
			if(i != this.focusPoints.length-1) {
				str += "\x0D";
			}
		}
		str += "\x0D\x0D";
		
		for(var j=0;j<this.experience.getAll().length;j++){
			var exp = this.experience.getAll()[j];
			var level = LevelSystem.getLevelForExperienceItem(exp);
			str += exp.id + " XP: " + exp.xp + " Level: ";
			for(var x=0;x<level.levelNumber;x++){str += "★";}
			str += "(" + level.levelNumber + ")" + "\x0D";
		}
		
		return str;
	};
	
	this.addFocusPoint = function(focusPoint){
		if(this.focusPoints.length < this.maxFocusPoints){
			if(this.focusPoints.indexOf(focusPoint) == -1){
				this.focusPoints.push(focusPoint);
			}
		}
	};
	
	this.removeFocusPoint = function(focusPoint){
		if(this.focusPoints.indexOf(focusPoint) != -1){
			this.focusPoints.remove(focusPoint);
		}
	};
	
	this.getLastGameInfo = function(){
		if(this.gameLog.length <1)
			return "None";
		
		var game = this.gameLog[this.gameLog.length-1];
		return "{0}  Score: {1}<br>Genre: {2}<br>Topic: {3}<br>Costs: {4}".format(game.name,game.score,game.genre.name,game.topic.name,UI.getShortNumberString(game.costs));
	};

	this.processSales = function(){
		var game = this.gameLog[this.gameLog.length-1];
		CompetitorModSales.sellGame(this,game);
	};
	
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
		
		console.log("--GENERATE GAMESCORE {0}--".format(this.name));
		console.log("{0}: maxScore:{1}".format(this.name, maxScore));
		console.log("{0}: current r value: {1}".format(this.name, r));
		
		//Add xp bonus
		var exp = this.searchForExperienceItem(this.experience,game.genre.id);
		var level = LevelSystem.getLevelForExperienceItem(exp);
		r += level.levelNumber *0.02;
		
		console.log("{0}: xpLevel:{1} adding {2} to r value".format(this.name, level.levelNumber, level.levelNumber*0.02));
		console.log("{0}: r value after adding: {1}".format(this.name, r));
		
		if(r <=0.25){
			score = Math.floor(maxScore * 0.6);
		}else if(r <=0.5){
			score = Math.floor(maxScore * 0.7);
		}else if(r <=0.75){
			score = Math.floor(maxScore * 0.8);
		}else if(r <=0.9){
			score = Math.floor(maxScore * 0.9);
		}else if(r <=1 || r > 1){
			score = maxScore;
		}else{
			score = maxScore;
		}
		console.log("{0}: generated score: {1}".format(this.name, score));
		console.log("--END GENERATE GAMESCORE {0}--".format(this.name, score));
		
		return score;
	};
	
	this.addNewTopic = function(){
		var newTopic;
		var foundTopic;
		do{
			foundTopic = null;
			newTopic = CompetitorMod.getRandomTopics().slice(0, 1)[0];
			foundTopic = this.activeTopics.first(function (item) {return item.id === newTopic.id});
		}while(foundTopic != null && foundTopic.id === newTopic.id);
		
		this.activeTopics.push(newTopic);
	};
	
	this.checkIfComboIsBadAndKnown = function(topic,genre){
		var topicGenreMatch = GameGenre.getGenreWeighting(topic.genreWeightings, genre);

        //todo Check if this function only returns 0.6 0.7 0.8 as bad matches. (can cause balancing issues)
		if((topicGenreMatch == 0.6 || topicGenreMatch == 0.7 || topicGenreMatch == 0.8) && this.hasComboKnowledge(topic,genre)){
			return true;
		}else{
			return false;
		}
	};
	
	this.searchForExperienceItem = function(experience,id){
		return experience.getAll().filter(function(item) {
             return item.id === id;
        })[0];
	};
	
	this.addExperiencePoints = function(game){
		//check genre check score add xp based on score!.
		var experienceItem = this.searchForExperienceItem(this.experience, game.genre.id);
		var xpToAdd = 1000 + game.score * 100;
		
		experienceItem.xp = experienceItem.xp + xpToAdd;
		//console.log("company: {0} adding xp({1}) to {2}".format(this.name,xpToAdd,game.genre.id));


		//Todo create MMO releases for competitors.
		/*if(game.isMMO){
			var experienceItemMMO = this.searchForExperienceItem(this.experience,"MMO");
			--> ADD XP TO experienceItemMMO
		}*/
	};
	
	this.getGameGenreForNewGame = function(){
		var focusPoint = this.focusPoints.pickRandom();
        if(focusPoint == null || focusPoint == undefined){
            return GameGenre.getAll().pickRandom();
        }else {
            while (focusPoint.id == "MMO") {
                focusPoint = this.focusPoints.pickRandom();
            }

            var percentage = 0.0;
            var r = GameManager.company.getRandom();
            if (this.focusPoints.length < this.maxFocusPoints) {
                percentage = 0.5;
            }else {
                percentage = 0.85;
            }

            if (r < percentage) { 		//90 % chance of releasing game in focusPoint
                return GameGenre.getAll().filter(function (item) {
                    return item.id === focusPoint.id;
                })[0];
            } else {
                return GameGenre.getAll().pickRandom();
            }

        }
	};
	
	this.checkOffer = function (action, object) {
		if (action == "Contract") {
			var applyRate = 1;
		
			applyRate /= (object.minScore / 3);
			applyRate += (object.preBonus / (this.cash * 0.25));
			applyRate -= (object.royalty / 100);
			
			if($.inArray(object.genre, this.focusPoints)){
				applyRate *= 1.15;
			}
			
			if(applyRate >= 1) {
				return true;
			} else {
				return false;
			}
		}
	};
	
	this.releaseNewGame = function () {
		var game = CompetitorGameLib.createCompetitorGame(this.generateGameName());
		game.releaseWeek = Math.floor(GameManager.company.currentWeek) + 1;		
		var genre;
		var topic;
		
		if(this.activeContract == undefined || this.activeContract.active == false){
			//check if combo is bad and in knowledgebase:
			do{
				genre = this.getGameGenreForNewGame();
				topic = this.activeTopics.pickRandom();
			}while(this.checkIfComboIsBadAndKnown(topic,genre));
			
			if( GameManager.company.currentLevel == 2)
				game.gameSize = "medium";
			if( GameManager.company.currentLevel == 3)
				game.gameSize = "medium";		
			if( GameManager.company.currentLevel == 4)
				game.gameSize = "large";
		}else if (this.activeContract.active == true){
			//get contract details (genre & topic)
			genre = this.activeContract.genre;
			topic = this.activeContract.topic;
			game.gameSize = this.activeContract.gameSize;
			game.targetAudience = this.activeContract.targetAudience;
			game.contract = this.activeContract;
			this.activeContract.active = false;
			game.flags.royaltyRate = true;
		}
		
		game.genre = genre;
		game.topic = topic;
		game.score = this.generateGameScore(game);
		
		this.addExperiencePoints(game);
		
		this.gameLog.push(game);
		this.addToKnowledge(game);
		this.isLastGameSelling = true;
		
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
		if(game.contract != undefined ) {
			if(game.score < game.contract.minScore){
				//Company didn't have correct score--> give penalty 
				this.cash -= game.contract.penaltyFee;
				GameManager.company.notifications.push(new Notification("Publisher Contract", "{0} has failed to meet the required score for your Publish Contract. You will receive a penalty fee of {1}".format(this.name,UI.getShortNumberString(game.contract.penaltyFee))));
				GameManager.company.adjustCash(game.contract.penaltyFee, "Publisher Contract Penalty {0}".format(this.name));
			}else{
				GameManager.company.notifications.push(new Notification("Publisher Contract", "{0} has just released '{1}' the required score for your Publish Contract has been reached! You will receive a weekly profit of {2}%".format(this.name,game.name,game.contract.royalty)));
			}
		}
		
		//check if a new topic needs to be added!
		this.gamesUntilNewTopîc -= 1;
		if(this.gamesUntilNewTopîc <=0){
			this.addNewTopic();
			this.gamesUntilNewTopîc = this.maxGamesUntilNewTopic;
		}
		
		//check if player has focuspoints if not add when needed.
		if(this.focusPoints.length < this.maxFocusPoints){
            var games = this.gameLog.filter(function (item) {
                return item.genre.id == game.genre.id && item.score > 7;
            });
            console.log('{0}: Found {1} games in genre: {2}'.format(this.name,games.length,game.genre.id));
            if(games.length >=3){
                var focusPoint = this.focusPoints.filter(function (item) {
                    return item.id == game.genre.id;
                })[0];
                if(focusPoint == undefined || focusPoint == null){
                    console.log('{0} adding focusPoint {1}'.format(this.name,game.genre));
                    var experienceItem = this.experience.getAll().filter(function (item) {
                        return item.id == game.genre.id;
                    })[0];
                    this.focusPoints.push(experienceItem);

                    var temp = "";
                    for(var x = 0;x<this.focusPoints.length;x++){
                        temp += this.focusPoints[x].id + ' ';
                    }
                    console.log('{0}: Current focusPoints:{1}');
                }
            }
		}
	};
	
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
	};
	
	this.processPublisherContracts = function(){
		for(var i = 0;i<CompetitorModPublisher.contracts.length;i++){
			var contract = CompetitorModPublisher.contracts[i];
			DecisionNotifications.offerNotification.competitor = this;
			DecisionNotifications.offerNotification.contract = contract;
			if (contract.active == true && contract.activeCompany == undefined) {
				if(this.checkOffer("Contract",contract)) {
					GameManager.company.notifications.push(DecisionNotifications.offerNotification.getNotification(this));
					console.log("Contract Made!" + this);
				}
			}
		}
	};
	
	this.tick = function(){
		if(this.isLastGameSelling == true){
			this.processSales();
		}else{
			this.releaseNewGame();
		}
		this.processWeek();
		this.processPublisherContracts();
	};
	
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
	};
	
	this.generateGameName = function(){
		var name = null;
		do{
			name = Kristof1104Lib.generateGameName();
		}while(this.isExistingGameName(name) == true);
		return name;
	};
	
	this.isExistingGameName = function(gameName){
		var name = this.gameLog.first(function (item) {
			return item.name == gameName;
		});
		if(!name && name != null){
			return true;
		}
		return false;
	};
	
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
		data["focusPoints"] = this.focusPoints;
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
		data["experience"] = this.experience.save();
		return data
	};
};

CompetitorLib.load = function (data) {
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
		obj.focusPoints = data["focusPoints"];
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
		obj.experience = Experience.load(data["experience"]);

		if (data["gameLog"])
			obj.gameLog = data["gameLog"].map(function (o) {
					return CompetitorGameLib.load(o)});
		
		return obj
	};
	
})();
