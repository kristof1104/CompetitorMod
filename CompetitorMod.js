(function () {
	var ready = function () {
		CompetitorMod.init();
	};

	var error = function () {
	};

	GDT.loadJs(
	['source/CompetitorSales.js',
	'source/CompetitorGameLib.js',
	'source/CompetitorLib.js',
	'source/CompetitorPublisher.js',
	'source/CompetitorUI.js',
	'source/Kristof1104Lib.js',
	'source/source.js'], ready, error);
})();