(function () {
	var ready = function () {
		CompetitorMod.init();
	};

	var error = function () {
	};

	GDT.loadJs(
	['mods/CompetitorMod/source/CompetitorSales.js',
	'mods/CompetitorMod/source/CompetitorPublisher.js',
	'mods/CompetitorMod/source/source.js'], ready, error);
})();