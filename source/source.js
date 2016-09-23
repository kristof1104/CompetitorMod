var CompetitorMod = {};
(function () {
CompetitorMod.competitors = [];
var companyNames = {};
var maxCompetitors = 10;


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

	//init companynames
	companyNames = $.extend([], CompanyNames);
	companyNames.push("Sienna");
	companyNames.push("Ubicroft");
	companyNames.push("MinniSoft");
	companyNames.push("AreaNet");
	companyNames.push("Backbone Media");
	companyNames.push("BionicWare");
	companyNames.push("Black Wolf Games");
	companyNames.push("Bulldog Productions");
	companyNames.push("Kogonami");
    companyNames.push("Eagle Software");

	//test
	/*
	this.embedCustomArt = function()
  {
    GameDev.ResourceManager.resources[ResourceKeys.Level1] = new Image();
    GameDev.ResourceManager.resources[ResourceKeys.Level1].src = 'http://www.jpl.nasa.gov/spaceimages/images/mediumsize/PIA17011_ip.jpg';
  };
	*/

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
		CompetitorMod.competitors = competitorModData["competitors"].map(function (o) {return CompetitorLib.load(o)});
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

	for(var i = 0;i<maxCompetitors;i++){
		CompetitorMod.addNewCompetitor(true);
	}
}

//todo: change this method when real costs are implemented ( defining the start captital)
CompetitorMod.addNewCompetitor = function(newGameInstance,newName,cash,owned){
	var name = companyNames.pickRandom();

    if(newName !=null){
        name = newName;
    }

	//check if name is used already
	for (var i=0;i<CompetitorMod.competitors.length;i++){
		var competitor = CompetitorMod.competitors[i];
		if(competitor.name == name){
            if(newGameInstance !== undefined || newGameInstance !== null){
                CompetitorMod.addNewCompetitor(newGameInstance);
            }else if(newName !== undefined || newName !== null){
                CompetitorMod.addNewCompetitor(newGameInstance,newName,cash,owned);
            }else{
                CompetitorMod.addNewCompetitor();
            }
			return;
		}
	}

	var new_competitor = CompetitorLib.createCompetitor("ID_"+name.replace(/\s/g,"") , name,[],CompetitorMod.getRandomTopics().slice(0, 4));

	if(!newGameInstance){
		new_competitor.cash = 2500000;
	}
    if(cash !=null){
        new_competitor.cash = cash;
    }
    if(owned != null){
        new_competitor.owned = owned;
    }
	CompetitorMod.competitors.push(new_competitor);
}

CompetitorMod.setRandomFocusPoints = function (competitor) {
	competitor.focusPoints = [];

	do{
		var focusPoint = competitor.experience.getAll().pickRandom();
		competitor.addFocusPoint(focusPoint);
	}while(competitor.focusPoints.length < competitor.maxFocusPoints);
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
		} else if (notification.sourceId === "offerNotification"){
			DecisionNotifications.offerNotification.setCompetitor(notification.competitor);
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
	};

	dn.offerNotification = {
		id : "offerNotification",
		trigger : function (company) {
			return false
		},
		competitor : undefined,
		contract : undefined,
		setCompetitor : function (_competitor) {
			this.competitor = _competitor;
			return;
		},
		setContract : function (_contract) {
			this.contract = _contract;
			return;
		},
		getNotification : function (company) {
			var msg = "{0} has offered to make '{1}'. Do you want to allocate this contract to {0}?".localize().format(this.competitor.name, this.contract.name);
			return new Notification({
				sourceId : "offerNotification",
				header : "Publisher Contract".localize("heading"),
				text : msg,
				competitor : company,
				options : ["Accept Offer".localize("decision action button"), "Refuse Offer".localize("decision action button")]
			})
		},
		complete : function (decision,notification) {
			var company = GameManager.company;
			if (decision === 0) {
				this.contract.activeCompany = this;
				this.competitor.activeContract = this.contract;
			}
		}
	};
}

})();
