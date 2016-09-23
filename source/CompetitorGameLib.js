var CompetitorGameLib = {};
(function () {

CompetitorGameLib.createCompetitorGame = function(name){
	return new CompetitorGame(name);
}

var CompetitorGame = function (name) {
	this.name = name;
	this.score = 0;
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

CompetitorGameLib.load = function (data) {
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
	
})();