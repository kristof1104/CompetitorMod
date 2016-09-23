var CompetitorModPublisher = {};
(function () {
CompetitorModPublisher.contracts = [];

	var PublisherContract = function () {
		this.score = 0;
		this.gameSize = "small";
		this.genre = undefined;
		this.topic = undefined;
		this.targetAudience = "everyone";
		this.platforms = [];
		this.penaltyFee = 50000;
		this.preBonus = 70000;
		this.royalty = 10;
		this.activeCompany = undefined;
	}

	CompetitorModPublisher.init = function () {
		CompetitorModPublisher.initUI();
	}
	
	
//UI
	CompetitorModPublisher.initUI = function () {
		var html = [];
		html.push('<div id="CompetitorModPublisherContainer" class="windowBorder tallWindow" style="z-index: 5400;overflow:auto;display:none;">');
		html.push('<div id="CompetitorModPublisherTitle" class="windowTitle smallerWindowTitle">Create A Publisher Contract</div>');
		html.push('<div id="CompetitorModPublisherContent"/>');
		html.push('<div id="CompetitorModPublisherTopicChooser"/>');
		html.push('<div id="CompetitorModPublisherGenreChooser"/>');
		html.push('<div id="CompetitorModPublisherPlatformChooser"/>');
		html.push('</div>');
		var div = $("body");
		div.append(html.join(""));
	}
	
	CompetitorModPublisher.createContractUI = function () {
		$("#CompetitorModPublisherTopicChooser").hide();
		$("#CompetitorModPublisherGenreChooser").hide();
		$("#CompetitorModPublisherPlatformChooser").hide();

		var content = $("#CompetitorModPublisherContent");
		content.empty();
		
		var template = $("#gameDefinitionContentTemplate").clone();
		template.find("#gameTitle").remove();
		
		template.find(".pickTopicButton").clickExcl(function () {
			CompetitorModPublisher.pickTopicClick();
		});
		template.find("#pickGenreButton").clickExcl(function () {
			CompetitorModPublisher.pickGenreClick();
		});
		template.find("#pickSecondGenreButton").clickExcl(function () {
			UI.pickSecondGenreClick()
		});
		template.find(".pickPlatformButton").clickExcl(function () {
			CompetitorModPublisher.pickPlatformClick($(this))
		});
		if (GameManager.company.canDevelopMediumGames()) {
			if (!GameManager.company.canDevelopLargeGames())
				template.find(".gameSizeLarge").hide();
			if (!GameManager.company.canDevelopAAAGames())
				template.find(".gameSizeAAA").hide()
		} else
			template.find("#gameSizeGroup").hide();
		if (!GameManager.company.canDevelopMMOGames())
			template.find(".gameGenreMMO").hide();
		//if (!GameManager.company.canUseMultiGenre())
			template.find("#pickSecondGenreButton").hide();
		/*else {
			template.find("#pickSecondGenreButton").css("margin-left", "2.5px").css("margin-right", "2.5px").css("width", "145px");
			template.find("#pickGenreButton").css("margin-left",
				"2.5px").css("margin-right", "2.5px").css("width", "145px")
		}*/
		if (GameManager.company.canDevelopMultiPlatform())
			template.find(".pickPlatformButton").css("margin-left", "2.5px").css("margin-right", "2.5px").css("width", "145px");
		else
			template.find(".pickPlatformButton").slice(1).hide();
		if (!GameManager.company.canSetTargetAudience())
			template.find("#targetRating").hide();
			
		
		template.find(".pickEngineButtonWrapper").hide();
		template.find(".ratingLabel").hide();
		
		template.find(".gameDefSelection").clickExcl(function () {
			Sound.click();
			var e = $(this);
			/*if (e.hasClass("rating"))
				if (game.flags.lockedSettings && game.flags.lockedSettings.targetAudience)
					return;
			if (e.hasClass("gameSizeButton"))
				if (game.flags.lockedSettings && game.flags.lockedSettings.gameSize)
					return;
			if (e.hasClass("gameGenreMMO")) {
				if (game.flags.lockedSettings && game.flags.lockedSettings.mmo)
					return;
				if (e.hasClass("selected"))
					e.removeClass("selected");
				else
					e.addClass("selected")
			} else {*/
				e.parent().find(".gameDefSelection").removeClass("selected");
				e.addClass("selected");
				//if (e.hasClass("rating"))
				//	template.find(".ratingLabel").text(getAudienceLabel(e));
				//else if (e.hasClass("gameSizeButton"))
					//game.gameSize = getGameSizeFromButton(template.find(".gameSizeButton.selected"))
			/*}
			UI._updateGameDefinitionCost();
			UI._updateGameDefinitionNextButtonEnabled()*/
		});
		
		$("#gameDefinition").find(".dialogNextButton").clickExcl(function () {
			$("#gameDefinition").find(".dialogNextButton").effect("shake", {
				times : 2,
				distance : 5
			}, 50)
		});
		var allGraphicTypeIds = Research.getAllItems().filter(function (f) {
				return f.group ===
				"graphic-type"
			}).map(function (f) {
				return f.id
			});
		$("#gameDefinition").find(".dialogBackButton").clickExcl(function () {
			Sound.click();
			UI._saveSelectedGameFeatureSettings(function (id) {
				return allGraphicTypeIds.indexOf(id) != -1
			});
			$("#gameDefinition").find(".dialogScreen1").transition({
				"margin-left" : 0
			});
			$("#gameDefinition").find(".dialogScreen2").transition({
				"margin-left" : "100%"
			})
		});
		
		//money slider
		template.append("PrePay Bonus: <input id='moneyField' type='text' maxlength='35' value='" + UI.getLongNumberString(50000) + "' style='width:170px;font-size: 22pt'/>");
		template.append("<div id='moneySlider' style='margin-top:3px;'></div>")
		template.find("#moneySlider").slider({
		min: 0,
		max: 100000000,
		range: "min",
		value: 50000,
		step:5000,
		animate: !1,
		slide: function (a, b) {
			var value = b.value;
			$("#moneyField").val(UI.getLongNumberString(value));
		}});
		//royalty slider
		template.append("RoyaltyRate %: <input id='royaltyField' type='text' maxlength='35' value='" + UI.getPercentNumberString(10) + "' style='width:170px;font-size: 22pt'/>");
		template.append("<div id='royaltySlider' style='margin-top:3px;'></div>")
		template.find("#royaltySlider").slider({
		min: 0,
		max: 100,
		range: "min",
		value: 10,
		step:1,
		animate: !1,
		slide: function (a, b) {
			var value = b.value;
			$("#royaltyField").val(UI.getPercentNumberString(value));
		}});

		template.append("<div style='width:302px;margin: auto;'><div id='CompetitorModPublisherOKButton' class=' baseButton orangeButton windowLargeOkButton'>Create Publisher Contract</div></div>");
		template.find("#CompetitorModPublisherOKButton").clickExcl(function () {
			Sound.click();
			var succes = CompetitorModPublisher.createContract();
			if(succes == true){
				$("#CompetitorModPublisherContainer").dialog("close");
			}else{
				$("#CompetitorModPublisherOKButton").effect("shake", {
				times : 2,
				distance : 5
			}, 50)
			}
				
		});

		okClicked = false;
		PlatformShim.execUnsafeLocalFunction(function () {
			content.append(template);
			$("#CompetitorModPublisherContent").show();
			$("#CompetitorModPublisherTitle").show();
		})
	}
	
	
	CompetitorModPublisher.pickTopicClick = function (element) {
		Sound.click();
		var container = $("#CompetitorModPublisherTopicChooser");

		if (element) {
			var pickTopicButton = $("#CompetitorModPublisherContent").find(".pickTopicButton");
			var names = element.innerText.split("\n");
			pickTopicButton.get(0).innerText = names[0];
			pickTopicButton.removeClass("selectorButtonEmpty");
			
			$("#CompetitorModPublisherContent").show();
			$("#CompetitorModPublisherTitle").show();
			$("#CompetitorModPublisherTopicChooser").hide();
			return;
		}
		PlatformShim.execUnsafeLocalFunction(function () {
			var modal = $(".simplemodal-data");
			modal.find(".overlayTitle").text("Pick Topic".localize("heading"));
			container.empty();
			var activeTopictemplate = '<div class="selectorButton whiteButton" onclick="CompetitorModPublisher.pickTopicClick(this)">{{name}}</div>';
			var lockedTopicTemplate = '<div class="selectorButton disabledButton">{{name}}</div>';
			var itemsPerRow = 3;
			var currentCount = 0;
			var row = 0;
			var researchVisibleCount = 0;
			var topics = General.getTopicOrder(GameManager.company);
			if (UI.pickTopicFontSize == undefined) {
				var values = [];
				for (var i = 0; i < topics.length; i++)
					values.push(topics[i].name);
				UI.pickTopicFontSize = UI._getMaxFontSize("{0}pt {1}",
						UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 16, 10, 175, values)
			}
			for (var i = 0; i < topics.length; i++) {
				var topic = topics[i];
				currentCount++;
				if (currentCount > itemsPerRow) {
					row++;
					currentCount = 1
				}
				var isAvailable = GameManager.company.topics.indexOf(topic) != -1;
				var isInResearch = GameManager.currentResearches.filter(function (f) {
						return f.topicId === topic.id
					}).length > 0;
				var isEnabled = isAvailable;
				var template = isEnabled ? activeTopictemplate :
					lockedTopicTemplate;
				var isNameHidden = (!isEnabled && (!isAvailable && !isInResearch)) || !isEnabled;
				if (!isNameHidden)
					if (GameManager.areHintsEnabled() && Knowledge.hasTopicAudienceWeightingKnowledge(GameManager.company, topic)) {
						var enabledDisabledContent = !isEnabled ? " disabledButton" : '" onclick="CompetitorModPublisher.pickTopicClick(this)';
						var whiteButton = !isEnabled ? " " : " whiteButton ";
						var t = '<div class="selectorButton' + whiteButton + "pickTopicButtonAudienceHintVisible" + enabledDisabledContent + '"><span style="position:relative;top:5px;">{0}<span style="font-size:11pt;"><br/>{1}</span></span></div>';
						template = t.format(topic.name, Knowledge.getTopicAudienceHtml(GameManager.company, topic))
					} else
						template = template.replace("{{name}}", topic.name);
				else
					template = template.replace("{{name}}", "?");
				var element = $(template);
				element.css("position", "absolute");
				element.css("top", 50 * row + row * 10);
				element.css("left", (currentCount - 1) * 190 + 10);
				element.css("font-size", UI.pickTopicFontSize + "pt");
				container.append(element);
				if (!isAvailable && !isInResearch)
					researchVisibleCount++
			}
			modal.find(".selectionOverlayContainer").fadeIn("fast")
			
			$("#CompetitorModPublisherContent").hide();
			$("#CompetitorModPublisherTitle").hide();
			$("#CompetitorModPublisherTopicChooser").show();
		})
	};
	
	CompetitorModPublisher.pickGenreClick = function (element) {
		Sound.click();
		var container = $("#CompetitorModPublisherGenreChooser");

		if (element) {
			var pickGenreButton = $("#CompetitorModPublisherContent").find("#pickGenreButton");
			pickGenreButton.get(0).innerText = element.innerText;
			pickGenreButton.removeClass("selectorButtonEmpty");
			
			$("#CompetitorModPublisherContent").show();
			$("#CompetitorModPublisherTitle").show();
			$("#CompetitorModPublisherGenreChooser").hide();
			return
		}
		PlatformShim.execUnsafeLocalFunction(function () {
			var modal = $(".simplemodal-data");
			modal.find(".overlayTitle").text("Pick Genre".localize("heading"));
			container.empty();
			var template = '<div class="selectorButton" onclick="CompetitorModPublisher.pickGenreClick(this)">{{name}}</div>';
			var genres = General.getAvailableGenres(GameManager.company);
			//var second = modal.find("#pickSecondGenreButton").get(0).innerText;
			var topMarginAdded = false;
			for (var i = 0; i < genres.length; i++) {
				//if (second == genres[i].name)
				//	continue;
				var genre = genres[i];
				var element = $(template.replace("{{name}}", genre.name));
				element.css("margin-left", 210);
				if (!topMarginAdded) {
					element.css("margin-top", 90);
					topMarginAdded = true
				}
				element.addClass("whiteButton");
				container.append(element)
			}
			modal.find(".selectionOverlayContainer").fadeIn("fast")
			
			$("#CompetitorModPublisherContent").hide();
			$("#CompetitorModPublisherTitle").hide();
			$("#CompetitorModPublisherGenreChooser").show();
		})
	};
	
	CompetitorModPublisher.pickPlatformClick = function (platformName,platformId) {
		Sound.click();
		var container = $("#CompetitorModPublisherPlatformChooser");
		
		
		if (platformName && platformId) {
			var pickplatformButton = $("#CompetitorModPublisherContent").find(".pickPlatformButton");
			pickplatformButton.get(0).innerText = platformName;
			pickplatformButton.removeClass("selectorButtonEmpty");
			
			$("#CompetitorModPublisherContent").show();
			$("#CompetitorModPublisherTitle").show();
			$("#CompetitorModPublisherPlatformChooser").hide();
			return;
		}
		
		
		PlatformShim.execUnsafeLocalFunction(function () {
			var modal =$(".simplemodal-data");
			modal.find(".overlayTitle").text("Pick Platform".localize("heading"));
			
			container.empty();
			var platforms = Platforms.getPlatformsOnMarket(GameManager.company);
			var game = GameManager.company.currentGame;

			platforms = platforms.slice().sort(function (a, b) {
					return Platforms.getTotalMarketSizePercent(b, GameManager.company) - Platforms.getTotalMarketSizePercent(a,
						GameManager.company)});
						
			for (var i = 0; i < platforms.length; i++) {
				var element =
					$("#platformButtonTemplate").clone();
				element.removeAttr("id");
				var platform = platforms[i];
				element.platformId = platform.id;
				element.platformName = platform.name;
				var isEnabled = GameManager.company.licencedPlatforms.indexOf(platform) != -1;
				element.find(".platformButtonImage").attr("src", Platforms.getPlatformImage(platform, GameManager.company.currentWeek));
				element.find(".platformTitle").text(platform.name);
				element.find(".cost").text("Dev. cost: ".localize() + UI.getShortNumberString(platform.developmentCosts));
				if (!isEnabled) {
					element.find(".licenseCost").text("License cost: ".localize() +
						UI.getShortNumberString(platform.licencePrize));
					if (GameManager.company.cash < platform.licencePrize)
						element.find(".licenseCost").addClass("red")
				} else
					element.find(".licenseCost").hide();
				element.find(".marketShare").text("Marketshare: ".localize() + UI.getPercentNumberString(Platforms.getTotalMarketSizePercent(platform, GameManager.company)));
				if (GameManager.areHintsEnabled()) {
					var content = Knowledge.getPlatformAudienceHintHtml(GameManager.company, platform);
					if (content)
						element.find(".audienceHints").html(content);
					var content = Knowledge.getPlatformGenreHintHtml(GameManager.company, platform);
					if (content)
						element.find(".genreHints").html(content)
				}
				(function (element) {
					if (isEnabled) {
						element.addClass("whiteButton");
						element.on("click", function () {
							CompetitorModPublisher.pickPlatformClick(element.platformName,element.platformId)
						})
					} else if (platform.licencePrize <= GameManager.company.cash) {
						element.addClass("whiteButton");
						element.on("click", function () {
							var that = this;
							UI.buyPlatform($(that).find(".platformTitle").get(0).innerText, function (e) {
								if (e)
									CompetitorModPublisher.pickPlatformClick(element.platformName,element.platformId)
							})
						})
					} else
						element.addClass("disabledButton")
				})(element);
				container.append(element)
			}
			modal.find(".selectionOverlayContainer").fadeIn("fast")
			
			$("#CompetitorModPublisherContent").hide();
			$("#CompetitorModPublisherTitle").hide();
			$("#CompetitorModPublisherPlatformChooser").show();
		})
	};

	var getTargetAudience = function (audience) {
		var modalContent = $("#CompetitorModPublisherContent");
		var selectedRating = modalContent.find(".rating.selected");;
		
		if (selectedRating.hasClass("ratingY"))
			return "young";
		else if (selectedRating.hasClass("ratingE"))
			return "everyone";
		else if (selectedRating.hasClass("ratingM"))
			return "mature";
		return "everyone"
	};
	var getGameSize = function (size) {
		var modalContent = $("#CompetitorModPublisherContent");
		var selectedSize = modalContent.find(".gameSizeButton.selected");;
		
		if (selectedSize.hasClass("gameSizeSmall"))
			return "small";
		else if (selectedSize.hasClass("gameSizeMedium"))
			return "medium";
		else if (selectedSize.hasClass("gameSizeLarge"))
			return "large";
		else if (selectedSize.hasClass("gameSizeAAA"))
			return "aaa";
		return "small"
	};
	var getSelectedTopic = function () {
		var modalContent = $("#CompetitorModPublisherContent");
		var topicName = modalContent.find(".pickTopicButton").text();
		var topic = GameManager.company.topics.first(function (t) {
				return t.name == topicName
			});
		return topic
	};
	var getSelectedGenre = function () {
		var modalContent = $("#CompetitorModPublisherContent");
		var genreName = modalContent.find("#pickGenreButton").text();
		var genre = GameGenre.getAll().first(function (i) {
				return i.name == genreName
			});
		return genre
	};
	var getSelectedPlatform = function () {
		var modalContent = $("#CompetitorModPublisherContent");
		var platformName = modalContent.find("#pickPlatformButton").text();
		var platform = GameManager.company.licencedPlatforms.first(function (i) {
				return i.name.trim() == platformName.trim()
			});
		return platform
	};
	
	CompetitorModPublisher.createContract = function(){
		var contract = new PublisherContract();
		
		var topic = getSelectedTopic();
		var genre = getSelectedGenre();
		var platform = getSelectedPlatform();
		var targetAudience = getTargetAudience();
		var gameSize = getGameSize();
		//var score = 
		
		if(topic == null || genre == null || platform == null){
			return null;
		}
		
		contract.score = 1;s
		contract.gameSize = gameSize;
		contract.genre = genre;
		contract.topic = topic;
		contract.targetAudience = targetAudience;
		contract.platforms.push(platform);
		
		CompetitorModPublisher.contracts.push(contract);
		
		return true;
	}
})();