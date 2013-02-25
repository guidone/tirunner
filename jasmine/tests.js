var chai = require('/tirunner/node_modules/chai/chai');
Ti.API.info('caricato chai'+JSON.stringify(chai));

(function(){
	Ti.include('/tirunner/jasmine/lib/jasmine-1.0.2.js');
	Ti.include('/tirunner/jasmine/lib/jasmine-titanium.js');
	
	// Include all the test files
	Ti.include('/test_case.js');
	
	jasmine.getEnv().addReporter(new jasmine.TitaniumReporter());
	jasmine.getEnv().execute();
})();