var CompetitorModSales = {};
(function () {

	CompetitorModSales.calculateSales = function (company, game) {
		var year = GameManager.company.getCurrentDate().year;
		var score = game.score.clamp(1, 10);
		
		var getMarketSizeFactor = function (game) {
			var bonusFactor = 0;
			switch (game.gameSize) {
			case "medium":
				bonusFactor = 1;
				break;
			case "large":
				bonusFactor = 1.2;
				break;
			case "aaa":
				bonusFactor = 1.5;
				break;
			default:
				return 1
			}
			return 1 + bonusFactor;
		};

		var scoreRatio = score / 10;
		var fans = Math.min(1500000, company.fans) + Math.max(0, company.fans - 1500000) / 10;
		var marketSize = [0, 0, 0];
		var minTech = 8;
		for (var x = 0; x < game.platforms.length; x++)
			if (game.platforms[x].id != "PC")
				minTech = Math.min(minTech, game.platforms[x].techLevel);
		for (var i = 0; i < game.platforms.length; i++) {
			var currentTechLevel = game.platforms[i].techLevel;
			if (game.platforms[i].id == "PC")
				currentTechLevel = minTech;
			var marketSizeFactor = 1;
			if (i == 0 && game.platforms.length >
				1)
				marketSizeFactor = 0.7;
			else if (i == 1)
				marketSizeFactor = game.platforms.length == 2 ? 0.55 : 0.4;
			else if (i == 2)
				marketSizeFactor = 0.3;
			marketSize[i] += Platforms.getMarketSizeForWeek(game.platforms[i], GameManager.company.currentWeek , company) * marketSizeFactor * (1 / currentTechLevel * minTech) * getMarketSizeFactor(game);
		}
		var reach = [0, 0, 0];
		var marketReach = 0;
		var reachBalanceF = 1;
		if (score <= 9) {
			marketReach = Math.pow(score, 3) / 100 * 0.2;
			if (GameManager.company.currentLevel === 4)
				reachBalanceF = 1.25
		} else {
			marketReach = Math.pow(score, 3) / (100 - 35 * (score - 9));
			if (year < 6)
				reachBalanceF = 0.65;
			else if (GameManager.company.currentLevel === 4)
				reachBalanceF = 0.35;
			else
				reachBalanceF = 0.5
		}
		marketReach *= reachBalanceF;
		marketReach = marketReach / 15 * 0.2 + 0.008;
		marketReach = [marketReach, marketReach, marketReach];
		for (var i = 0; i < game.platforms.length; i++) {
			var tempPlatform = [game.platforms[i]];
			marketReach[i] = marketReach[i] * Platforms.getAudienceWeighting(tempPlatform, game.targetAudience);
			reach[i] += Math.floor(marketSize[i] * marketReach[i])
		}
		if (game.hypePoints) {
			var hypeFactor = Math.min(500, game.hypePoints) / 500;
			var hasPositiveHypeEffect =
				score >= 5;
			if (game.flags.interviewHyped && game.flags.interviewHyped.decision)
				hasPositiveHypeEffect = score >= 8;
			if (hasPositiveHypeEffect)
				for (var i = 0; i < game.platforms.length; i++)
					reach[i] += Math.floor(marketSize[i] * 0.05 * hypeFactor * ((score - 5) / 5));
			else
				for (var i = 0; i < game.platforms.length; i++)
					reach[i] -= Math.floor(marketSize[i] * marketReach[i] * 0.25 * hypeFactor * (score / 5))
		}
		for (var i = 0; i < game.platforms.length; i++)
			reach[i] = Math.floor(Math.min(reach[i], marketSize[i]));
		if (!game.flags.royaltyRate)
			reach[0] += fans * scoreRatio;
		else {
			reach[0] += Math.max(0, Sales.getTargetFans(company, game) /*- fans*/) * scoreRatio;
			for (var i = 0; i < game.platforms.length; i++)
				reach[i] *= 10
		}
		if (!LOGWEEKSALES)
			/*"market size {0}. total reach {1}. existing fans {2}".format(marketSize.sum(function (x) {
					return x
				}), reach.sum(function (x) {
					return x
				}), fans).log();*/
		var unitSales = Math.floor(reach.sum(function (x) {
					return x
				}) * 0.8 * scoreRatio + reach.sum(function (x) {
					return x
				}) * 0.2 * GameManager.company.getRandom());
		var fanModification = 0;
		if (score >= 7 && !game.flags.sequelsTooClose)
			fanModification +=
			fans * 0.05 + fans * 0.05 * GameManager.company.getRandom();
		if (score >= 5 && !game.flags.sequelsTooClose)
			if (game.flags.royaltyRate && Sales.getTargetFans(company, game) - fans <= 0)
				fanModification += Math.floor((unitSales * 0.005 * scoreRatio + unitSales * 0.005 * GameManager.company.getRandom()) / 10);
			else
				fanModification += Math.floor(unitSales * 0.005 * scoreRatio + unitSales * 0.005 * GameManager.company.getRandom());
		else
			fanModification = -company.fans * (1 - scoreRatio) * 0.25 * GameManager.company.getRandom();
		game.unitPrice = Sales.getUnitPrice(game);
		if (game.flags.mmo && game.gameSize === "aaa")
			unitSales *=
			1.45;
		var sales = unitSales * game.unitPrice;
		//if (!LOGWEEKSALES)
			//"units sold: {0}, sales: {1}$, fanMod{2}".format(unitSales, sales, fanModification).log();
		if (!game.totalSalesCash)
			game.totalSalesCash = 0;
		game.totalSalesCash += sales;
		game.fansChangeTarget = fanModification;
		//console.log("company: {0}  score: {1} totalCashForNextGame:{2} totalFansForNextGame:{3}".format(company.name,score,game.totalSalesCash,game.fansChangeTarget));
	};

	CompetitorModSales.getIncome = function (game) {
		var cashIncome = game.totalSalesCash - game.currentSalesCash;
		var salesEnd = 0.1;
		var beforeAll = 0.01;
		var endFactor = 0.4;
		var normalFactor = 0.2;
		var generalFactor = 1;
		if (game.gameSize === "medium")
			generalFactor = 0.75;
		else if (game.gameSize === "large")
			generalFactor = 0.65;
		else if (game.gameSize === "aaa")
			generalFactor = 0.5;
		if ((game.totalSalesCash - game.currentSalesCash) / game.totalSalesCash < salesEnd * generalFactor) {
			if ((game.totalSalesCash - game.currentSalesCash) / game.totalSalesCash > beforeAll * generalFactor)
				cashIncome = (game.totalSalesCash - game.currentSalesCash) * (GameManager.company.getRandom() * endFactor * generalFactor + endFactor * generalFactor)
		} else
			cashIncome = (game.totalSalesCash - game.currentSalesCash) * (GameManager.company.getRandom() * normalFactor * generalFactor + normalFactor * generalFactor);
		return cashIncome
	};

	CompetitorModSales.sellGame = function (company, game) {
		if (!game.unitsSold)
			game.unitsSold = 0;
		if (!game.revenue)
			game.revenue = 0;

		//var saleLengthInWeeks = Sales.getSalesLengthInWeek(game);
		
		if (game.nextSalesCash) {
			game.currentSalesRank = game.nextSalesRank;
			game.fansChanged += game.nextfansChange;
			game.currentSalesCash += game.nextSalesCash;
			game.unitsSold += Math.floor(game.nextSalesCash / game.unitPrice)
			
			if (game.nextSalesCash != 0) {
				//publisher contracts
				if(game.contract != undefined ){
					var percentage = game.contract.royalty;
					var royalteMoney = (game.nextSalesCash * percentage)/100;
					
					company.cash += Math.floor(game.nextSalesCash-royalteMoney);
					game.revenue += Math.floor(game.nextSalesCash-royalteMoney);
					
					GameManager.company.adjustCash( Math.floor(royalteMoney), "Publisher Contract Royalty {0}".format(company.name));
				}else{
					company.cash += game.nextSalesCash;
					game.revenue += Math.floor(game.nextSalesCash);
				}
			}
			
			if (game.nextfansChange != 0) {
				var fanChange = Math.floor(game.nextfansChange);
				if (company.fans === 0) {
					if (fanChange <= 0)
						return;
				}
				company.fans += fanChange;
			}
			
			game.nextfansChange = undefined;
			game.nextSalesCash = undefined
		}
		if (game.totalSalesCash > game.currentSalesCash || game.flags.mmo && !game.flags.saleCancelled) {
			var firstSales = game.currentSalesCash === 0;
			
			var cashIncome = CompetitorModSales.getIncome(game);
			var part = cashIncome / game.totalSalesCash;
			game.nextfansChange = Math.floor(game.fansChangeTarget * part);
			game.nextSalesCash = Math.floor(cashIncome);
			if (game.nextSalesCash <= 0) {
				game.nextSalesCash = undefined;
				game.nextMaintenance = undefined;
				game.totalSalesCash = game.currentSalesCash
			}
		} else {
			game.soldOut = true;
			company.isLastGameSelling = false;
			game.currentSalesRank = -1;
			var msg = "{0} is now off the market. It sold {1} units generating {2} in sales.".localize().format(game.name, UI.getLongNumberString(game.unitsSold), UI.getLongNumberString(game.revenue));
			//GameManager.company.notifications.push(new Notification("Game off the market.".localize("heading"),
			//		msg, "OK".localize()))
		}
	};	
})();