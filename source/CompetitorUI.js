var CompetitorUI = {};
(function () {

CompetitorUI.init = function(){
	addCompetitorContainer();
	addCompetitorBar();
	addCompetitorContainerAllCompetitors();
	addCompetitorConfirmDialog();
	CompetitorUI.show_ranking = true;
	CompetitorUI.move_activated = false;
}

var addCompetitorBar = function(){
	var div = $("#barLeft");
	div.append('<div id="competitorModGraphs" style="pointer-events: all;"/>');
}

var addCompetitorContainer = function(){
	var html = [];
	html.push('<div id="CompetitorModContainer" class="windowBorder tallWindow" style="overflow:auto;display:none;">');
	html.push('<div id="CompetitorModTitle" class="windowTitle smallerWindowTitle">Competitors</div>');
	html.push('<div id="CompetitorModContent"/>');
	html.push('</div>');
	var div = $("body");
	div.append(html.join(""));
}

var addCompetitorContainerAllCompetitors = function(){
	var html = [];
	html.push('<div id="CompetitorModAllCompetitorsContainer" class="windowBorder tallWindow" style="overflow:auto;display:none;">');
	html.push('<div id="CompetitorModAllCompetitorsTitle" class="windowTitle smallerWindowTitle">Competitors</div>');
	html.push('<div id="CompetitorModAllCompetitorsContent"/>');
	html.push('</div>');
	var div = $("body");
	div.append(html.join(""));
}

var addCompetitorConfirmDialog = function(){
	var html = [];
	html.push('<div id="CompetitorModConfirmDialog" class="windowBorder smallWindow" style="overflow:auto;display:none;">');
	html.push('<div id="CompetitorModConfirmDialogTitle" class="windowTitle smallerWindowTitle">Confirmation</div>');
	html.push('<br><div id="CompetitorModConfirmDialogText"></div>');
	html.push('<div class="centeredButtonWrapper" style="position:absolute;bottom:20px;width:93%">');
    html.push('<div class="confirmActionButton deleteButton selectorButton">Yes</div>');
    html.push('<div class="cancelActionButton selectorButton orangeButton">No</div>');
    html.push('</div>');
	var div = $("body");
	div.append(html.join(""));
}

var createUIButton = function(id,competitor,type,option,text){
	if(type == 0)
		return '<div id="{0}" class="selectorButton whiteButton" onclick="CompetitorMod.buy({1},{2})" style="margin-left:50px;width: 450px">{3}</div>'.format(id, "'"+competitor.id+"'" ,option,text);
	else if(type == 1)
		return '<div id="{0}" class="selectorButton whiteButton" onclick="CompetitorMod.sabotage({1},{2})" style="margin-left:50px;width: 450px">{3}</div>'.format(id,"'"+competitor.id+"'",option,text);
	else if(type == 2)
		return '<div id="{0}" class="selectorButton whiteButton" onclick="CompetitorMod.settings({1},{2})" style="margin-left:50px;width: 450px">{3}</div>'.format(id,"'"+competitor.id+"'",option,text);
}

var createUITexFieldWithButton = function(id,competitor,option,text){
	var html = [];
	html.push("<input id='textField"+option+"' type='text' maxlength='35' value='" + competitor.name + "' style='margin-left:50px;width:300px;font-size: 22pt'/>");
	html.push('<div id="{0}" class="selectorButton whiteButton" onclick="CompetitorMod.settings({1},{2})" style="display:inline-block;position: relative;margin-left:10px;width: 136px">{3}</div>'.format(id,"'"+competitor.id+"'",option,text));
	return html.join("");
}

var createBuyCompetitorScreen = function(competitor){
	var div = $("#CompetitorModTitle");
	div.html("Buy Company: "+competitor.name);
	div = $("#CompetitorModContent");
	div.html("Make money by buying this company");
	
	div.append(createUIButton(competitor.id + "1" , competitor , 0 , 1 , "Buy Competitor"));
}
var createSabotageCompetitorScreen = function(competitor){
	var div = $("#CompetitorModTitle");
	div.html("Sabotage: "+competitor.name);
	div = $("#CompetitorModContent");
	div.html("Sabotage this company");
	
	div.append(createUIButton(competitor.id + "1" , competitor , 1 , 1 , "Bankrupt company(debug)"));
	div.append(createUIButton(competitor.id + "2" , competitor , 1 , 2 , "Hire Scammers (Costs 100k)"));
	div.append(createUIButton(competitor.id + "3" , competitor , 1 , 3 , "Hack (Costs:100k  Reward:10RP)"));
}
var createSettingsCompetitorScreen = function(competitor){
	var div = $("#CompetitorModTitle");
	div.html("Settings For: "+competitor.name);
	div = $("#CompetitorModContent");
	div.html("Set Settings for this owned company");
	
	div.append(createUIButton(competitor.id + "1" , competitor , 2 , 1 , "Merge with parent company"));
	div.append(createUIButton(competitor.id + "2" , competitor , 2 , 2 , "Sell company"));
	div.append(createUITexFieldWithButton(competitor.id + "3" , competitor , 3 , "Change"));
	//div.append(createUIButton(competitor.id + "4" , competitor , 2 , 4 , "Focus on Genre"));
}
var createCompetitorPlayerScreen = function(){
	var div = $("#CompetitorModTitle");
	div.html("CompetitorMod");
	div = $("#CompetitorModContent");
	div.html("");
	
	div.append(createUIButton(competitor.id + "1" , competitor , 2 , 1 , "Merge with parent company"));
	div.append(createUIButton(competitor.id + "2" , competitor , 2 , 2 , "Sell company"));
	div.append(createUITexFieldWithButton(competitor.id + "3" , competitor , 3 , "Change"));
	//div.append(createUIButton(competitor.id + "4" , competitor , 2 , 4 , "Focus on Genre"));
}

var createCompetitorsScreen = function(){
	var div = $("#CompetitorModAllCompetitorsTitle");
	div.html("Competitors");

	var content = $("#CompetitorModAllCompetitorsContent");
	content.empty();

	var slider = $('<div id="CompetitorModAllCompetitorsSlider" class="gameHistorySliderContainer royalSlider rsDefaultInv"></div>');
	slider.css({"width" : "525px","height" : "300px"});
	content.append(slider);
	
	for (var i=0;i<CompetitorMod.competitors.length;i++){
		var competitor = CompetitorMod.competitors[i];
		var element = CompetitorUI.getElementForCompetitor(competitor, (i+1) );
		slider.append(element);
	}
	
	//add buttons
	content.append('<div id="CompetitorModAllCompetitorsGameLog" class="selectorButton whiteButton" onclick="CompetitorUI.handleAllCompetitorsMenu(0)" style="margin-left:50px;width: 450px">Game History</div>');
	content.append('<div id="CompetitorModAllCompetitorsBuy" class="selectorButton whiteButton" onclick="CompetitorUI.handleAllCompetitorsMenu(1)" style="margin-left:50px;width: 450px">Buy Company</div>');
	content.append('<div id="CompetitorModAllCompetitorsSabotage" class="selectorButton whiteButton" onclick="CompetitorUI.handleAllCompetitorsMenu(2)" style="margin-left:50px;width: 450px">Sabotage</div>');
	content.append('<div id="CompetitorModAllCompetitorsSettings" class="selectorButton whiteButton" onclick="CompetitorUI.handleAllCompetitorsMenu(3)" style="margin-left:50px;width: 450px">Settings</div>');

}

CompetitorUI.handleAllCompetitorsMenu = function(menuItem){
	var content = $("#CompetitorModAllCompetitorsContent");
	var item = content.find(".rsActiveSlide");
	var id = item.find(".gameId").text();
	var competitor = undefined;

	for (var i=0;i<CompetitorMod.competitors.length;i++){
		if(CompetitorMod.competitors[i].id == id){
			competitor = CompetitorMod.competitors[i];
			break;
		}
	}
	
	if(menuItem == 0){

		CompetitorMod.showGameHistory(competitor);
	}else if(menuItem == 1){

		var dlg = $("#CompetitorModContainer");
		createBuyCompetitorScreen(competitor);
		dlg.gdDialog({
			close : true,
			popout : true,
			onClose : function () {
				GameManager.resume(true)
			}	
		});
	}else if(menuItem == 2){

		var dlg = $("#CompetitorModContainer");
		createSabotageCompetitorScreen(competitor);
		dlg.gdDialog({
			close : true,
			popout : true,
			onClose : function () {
				GameManager.resume(true)
			}	
		});
		
	}else if(menuItem == 3){
		if(competitor.owned === false) return;
		
		var dlg = $("#CompetitorModContainer");
		$("#CompetitorModContainer").css("z-index","5400");
		createSettingsCompetitorScreen(competitor);
		dlg.gdDialog({
			close : true,
			popout : true,
			onClose : function () {
				GameManager.resume(true)
			}	
		});
	}
	
}

CompetitorUI.getElementForCompetitor = function(competitor, rank){
	var template = $("#gameDetailsTemplate").clone();
	template.removeAttr("id");
	//remove not needed items from template
	template.find(".gameDetailsImage").remove();
	template.find(".gameDetailsAmountEarnedLabel").remove();
	template.find(".gameDetailsAmountEarned").remove();	
	template.find(".gameDetailsTotalLabel").remove();
	template.find(".gameDetailsTotal").remove();
	template.find(".gameDetailsFansChangeLabel").remove();
	template.find(".gameDetailsFansChange").remove();
	
	//reuse existing labels
	template.find(".gameDetailsUnitsSoldLabel").text("Rank:");
	template.find(".gameDetailsCostsLabel").text("Cash:");
	template.find(".gameDetailsReleaseWeekLabel").text("Fans:");
	template.find(".gameDetailsAvgReviewLabel").text("Released games:");
	template.find(".gameDetailsTopSalesRankLabel").text("XP:");
	
	//rearrange positions
	template.css({"width" : "400px"});
	template.find(".gameDetailsUnitsSoldLabel").css({"left" : "50px"});
	template.find(".gameDetailsCostsLabel").css({"left" : "50px"});
	template.find(".gameDetailsReleaseWeekLabel").css({"top" : "112px", "left" : "50px"});
	template.find(".gameDetailsReleaseWeek").css({"top" : "115px"});
	template.find(".gameDetailsAvgReviewLabel").css({"top" : "142px", "left" : "50px"});
	template.find(".gameDetailsAvgReview").css({"top" : "145px"});
	template.find(".gameDetailsTopSalesRankLabel").css({"top" : "172px", "left" : "50px"});
	template.find(".gameDetailsTopSalesRank").css({"top" : "175px"});
	
	//fill in template
	template.find(".gameDetailsTitle").text(competitor.name);
	template.find(".gameId").text(competitor.id);
	
	template.find(".gameDetailsUnitsSold").text("# " + rank);
	template.find(".gameDetailsCosts").text(UI.getShortNumberString(competitor.cash));
	template.find(".gameDetailsReleaseWeek").text(UI.getShortNumberString(competitor.fans));
	template.find(".gameDetailsAvgReview").text(competitor.gameLog.length);
	template.find(".gameDetailsTopSalesRank").text(competitor.xp);
	
	//set appropriate colors
	if(competitor.cash < 0)
		template.find(".gameDetailsCosts").css({"color" : "red"});
	else
		template.find(".gameDetailsCosts").css({"color" : "green"});
	
	//add owned status if competitor is owned by player
	if(competitor.owned)
		template.append('<div id="competitorOwned" style="background-color:#ddfcdf;text-align:center;font-size: 10pt;width:60px;border: 2px solid #5aef62;border-radius: 5px;position: absolute; margin-left:320px;top:16px;">Owned</div>')
	
	return template;
}

UI.showCompetitorMenu = function(e,sender){
	var competitor;
	for (var i=0;i<CompetitorMod.competitors.length;i++){
		if(CompetitorMod.competitors[i].id == sender.id){
			competitor = CompetitorMod.competitors[i];
			break;
		}
	}

	var x = e.clientX;
	var y = e.clientY;
	var menuItems = [];
	
	menuItems.push({
		label : "Game History".localize("menu item"),
			action : function () {
				CompetitorMod.showGameHistory(competitor);
			}
	});	
	
	menuItems.push({
		label : "Buy Company".localize("menu item"),
			action : function () {
				Sound.click();
				var dlg = $("#CompetitorModContainer");
				createBuyCompetitorScreen(competitor);
				dlg.gdDialog({
					close : true,
					popout : true,
					onClose : function () {
						GameManager.resume(true)
					}	
				})
			}
	});
	
	menuItems.push({
		label : "Sabotage".localize("menu item"),
			action : function () {
				Sound.click();
				var dlg = $("#CompetitorModContainer");
				createSabotageCompetitorScreen(competitor);
				dlg.gdDialog({
					close : true,
					popout : true,
					onClose : function () {
						GameManager.resume(true)
					}	
				});
			}
	});
	
	if(competitor.owned === true){
		menuItems.push({
			label : "Settings".localize("menu item"),
				action : function () {
					Sound.click();
					var dlg = $("#CompetitorModContainer");
					$("#CompetitorModContainer").css("z-index","5400");
					createSettingsCompetitorScreen(competitor);
					dlg.gdDialog({
						close : true,
						popout : true,
						onClose : function () {
							GameManager.resume(true)
						}	
					})
				}
		});
	}	
	
	
	/*menuItems.push({
		label : "Create PublishDeal".localize("menu item"),
			action : function () {
				Sound.click();
				var dlg = $("#CompetitorModPublisherContainer");
				CompetitorModPublisher.createContractUI();
				//UI.showModalContent("#CompetitorModPublisherContainer");
				$("#CompetitorModPublisherContainer").css("z-index","5400");
				dlg.gdDialog({
					close : true,
					popout : true,
					onClose : function () {
						GameManager.resume(true)
					}	
				})
				dlg.dialog( "option", "width", 620 );
			}
	});*/
	
	if (menuItems.length >= 1)
		UI._showContextMenu("competitorMod", menuItems, x, y)
}


//hook the default contextMenu
var original_showContextMenu = UI._showContextMenu;
var new_showContextMenu = function(b, c, d, h){
		if(b == "competitorMod"){
		}else{
			var targetChar = GameManager.company.currentLevel > 1 ? UI.getCharUnderCursor() : GameManager.company.staff[0];
			
			if (targetChar && targetChar.id == 0){
				c.push({
					label : "CompetitorMod".localize("menu item"),
					action : function () {
						Sound.click();
						var dlg = $("#CompetitorModContainer");
						$("#CompetitorModContainer").css("z-index","5400");
						createCompetitorPlayerScreen();
						dlg.gdDialog({
							close : true,
							popout : true,
							onClose : function () {
								GameManager.resume(true);
							}	
						})
					}
				});
			}	
		}
	original_showContextMenu(b, c, d, h);
};
UI._showContextMenu = new_showContextMenu

CompetitorUI.updateCompetitorUI = function(){
	var visible_graphs = 3;
	var div = $("#competitorModGraphs");
	var html = [];
	var color = CompetitorUI.move_activated == false? "red" : "green";

	for (var i=0;i<visible_graphs;i++){
		if(CompetitorUI.show_ranking == false)break;
		
		var competitor = CompetitorMod.competitors[i];
		var margin = 5;
		if(i==0) margin = 35;
		
		html.push('<div id="CompetitorRanking" class="selectorButton " style="background-color: white;border: solid 2px #a4a4a4;position:absolute;line-height: 35px;height:40px;width: 40px; opacity=0;-webkit-border-radius: 999px;-moz-border-radius: 999px;border-radius: 999px;behavior: url(PIE.htc);">' + (i+1) + "</div>");
		html.push('<div id="{0}" class="statusBar" style="margin-top:{1}px;margin-left:60px;width:250px;word-spacing: normal;">'.format(competitor.id,margin));
			
		if(competitor.owned)
			html.push('<div id="competitorOwned" style="background-color:#ddfcdf;text-align:center;font-size: 10pt;width:60px;border: 2px solid #5aef62;border-radius: 5px;position: absolute; margin-left:180px">Owned</div>');
		
		html.push('<div id="competitorName" class="statusBarItem">{0}</div><br>'.format(competitor.name));
		html.push('<div id="competitorNrOfGames" class="statusBarItem" style="padding-left:10px;font-size:13px;">Cash: {0}<br>Fans: {1}</div><br>'.format(UI.getShortNumberString(competitor.cash),UI.getShortNumberString(competitor.fans)));
		html.push('</div>');
		html.push('</div>');
	}
	//test
	html.push('<div id="CompetitorModMoveUI" class="selectorButton " style="background-color: white;border: solid 2px {0};position:absolute;line-height: 36px;height:40px;width: 40px; opacity=0;-webkit-border-radius: 999px;-moz-border-radius: 999px;border-radius: 999px;behavior: url(PIE.htc);"><i id="collapseIcon" class="fontCharacterButton icon-move"></i></div>'.format(color));
	//add show/hide & All Competitors button
	html.push('<div id="CompetitorModAllCompetitors" class="selectorButton" style="background-color: white;border: solid 2px #a4a4a4;border-radius: 5px;margin-top:20px;margin-left:60px;width:150px;height:30px;line-height: 26px;word-spacing: normal;">All Competitors</div>');
	html.push('<div id="CompetitorModShowHide" class="selectorButton" style="background-color: white;border: solid 2px #a4a4a4;border-radius: 5px;margin-top:2px;margin-left:60px;width:120px;height:30px;line-height: 26px;word-spacing: normal;">Show/Hide</div>');
	div.html(html.join(""));
	
	//add menu to graphs
	for (var i=0;i<visible_graphs;i++){
		var competitor = CompetitorMod.competitors[i];
		var competitor_graph = $("#" + competitor.id);
		competitor_graph.on("click", function (event) {
			UI.showCompetitorMenu(event,this);
		});
	}
	
	//add handler
	$("#CompetitorModShowHide").click (function () {
		if(CompetitorUI.show_ranking == false){
			CompetitorUI.show_ranking = true;
		}else{
			CompetitorUI.show_ranking = false;
		}
		CompetitorUI.updateCompetitorUI();
		return false;
	});	
	
	//add handler
	$("#CompetitorModAllCompetitors").click (function () {
		GameManager.pause(true);
		var dlg = $("#CompetitorModAllCompetitorsContainer");
				createCompetitorsScreen();
				dlg.gdDialog({
					close : true,
					popout : true,
					onClose : function () {
						GameManager.resume(true)
					}	
					
		})
		$("#CompetitorModAllCompetitorsSlider").gdSlider();
		return false;
	});
	
	//add move handler
	$("#CompetitorModMoveUI").click (function () {
		var div = $("#competitorModGraphs");
		
		if(CompetitorUI.move_activated == true){
			$("#CompetitorModMoveUI").css({"border":"solid 2px red"});
			div.draggable( "destroy" );
			CompetitorUI.move_activated = false;
		}else{
			$("#CompetitorModMoveUI").css({"border":"solid 2px green"});
			div.draggable({ axis: "y" ,containment: "window", handle: "#CompetitorModMoveUI", scroll: false});
			CompetitorUI.move_activated = true;
		}
		return false;
	});	
}

CompetitorUI.confirmAction = function (text,action) {
	var dlg = $("#CompetitorModConfirmDialog");
	//set text
	dlg.find("#CompetitorModConfirmDialogText").text(text);
	
	dlg.find(".confirmActionButton").clickExclOnce(function () {
		Sound.click();
		action();
		dlg.dialog("close")
	});
	dlg.find(".cancelActionButton").clickExclOnce(function () {
		Sound.click();
		dlg.dialog("close")
	});
	dlg.gdDialog({
		close : true,
		popout : true,
		onClose : function () {
			GameManager.resume(true)
		}
	})
};
			
})();