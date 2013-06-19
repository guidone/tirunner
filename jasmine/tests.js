(function(){
	var _ = require('/tirunner/jasmine/underscore')._;
	Ti.include('/tirunner/jasmine/lib/jasmine-1.0.2.js');
	Ti.include('/tirunner/jasmine/lib/jasmine.asynch.js');
	Ti.include('/tirunner/jasmine/matchers.js');	
	Ti.include('/test_case.js');
	jasmine.getEnv().addReporter(new jasmine.TitaniumReporter());
	jasmine.getEnv().execute();
})();