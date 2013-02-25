(function(){
	Ti.include('/tirunner/lib/jasmine-1.0.2.js');
	Ti.include('/tirunner/lib/jasmine-titanium.js');
	
	// Include all the test files
	Ti.include('/tests/test_main.js');
	
	jasmine.getEnv().addReporter(new jasmine.TitaniumReporter());
	jasmine.getEnv().execute();
})();