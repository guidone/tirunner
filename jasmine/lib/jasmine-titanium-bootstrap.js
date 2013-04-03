(function() {
    
    var capture_spec = '';
    
    if (!jasmine) {
        throw new Exception("jasmine library does not exist in global namespace!");
    }
    
    /**
	* TitaniumReporter, by Guilherme Chapiewski - http://guilhermechapiewski.com
	*
	* TitaniumReporter is a Jasmine reporter that outputs spec results to a new 
	* window inside your iOS application. It helps you develop Titanium Mobile 
	* applications with proper unit testing.
	* 
	* More info at http://github.com/guilhermechapiewski/titanium-jasmine
	*
	* Usage:
	*
	* jasmine.getEnv().addReporter(new jasmine.TitaniumReporter());
	* jasmine.getEnv().execute();
	*/
	var TitaniumReporter = function() {
		// create Titanium Window and WebView to display results
		var titaniumTestWindow = Titanium.UI.createWindow({
			title:'Application Tests',
			backgroundColor: '#000000',
			zIndex: 999
		});

/*		
		var realoadButton = Ti.UI.createButton({			
			title: 'Reaload'			
		});
		realoadButton.addEventListener('click',function(e) {
			
			var result = options.realoadCallback();
			
			Ti.API.info('result reload ')
			
		});
*/		
		
		var titaniumTestsResultsWebView = Ti.UI.createWebView({
			html: ''
		});
		titaniumTestWindow.add(titaniumTestsResultsWebView);
		titaniumTestWindow.open();
		
		var testResults = '';
		var testResultsHeader = '<html><head>'
	        +'<link rel="stylesheet" href="/tirunner/reporter/bootstrap.css" type="text/css">'
	        +'<link rel="stylesheet" href="/tirunner/reporter/jasmine-bootstrap.css" type="text/css">' 		
			//+'<style type="text/css">body{font-size:14px;font-family:helvetica;background-color:#000000;color:#ffffff;}</style>'
			+'</head><body>'
			+'<div class="jasmine_reporter container show-passed">'
				+'<h1 class="banner well"><span class="logo"><span class="title">TiRunner Tests</span>'
				+'<small class="version">test?</small></span></h1>';



		var testResultsFooter = '</div></body></html>';
		var capture_spec = '';
		this.updateTestResults = function(message) {
			testResults += message;
			titaniumTestsResultsWebView.html = testResultsHeader + testResults + testResultsFooter;
		};
    };

    TitaniumReporter.prototype = {
        reportRunnerResults: function(runner) {
            //this.log('<h3>Test Runner Finished.</h3>');
        },

        reportRunnerStarting: function(runner) {
            //this.log('<h3>Test Runner Started.</h3>');
        },

        reportSpecResults: function(spec) {

/*
{"totalCount":1,"passedCount":1,"failedCount":0,"skipped":false,"items_":[{"type":"expect","matcherName":"toBeTruthy","passed_":true,"actual":"true","message":"Passed.","trace":""}],"description":"contains a single spec"}

*/

			
			//var pass = spec.results().passedCount + ' pass';
			var fail = null;
			var result = '';

			if (!spec.results().passed()) {
				result += '<div class="spec alert failed alert-error">'
					+'<a class="description">'+spec.description+' ('+spec.results().passedCount+') passed</a>';
			} else {
				result += '<div class="spec alert passed alert-success">'					
					+'<a class="description">'+spec.description+'</a>';
			}


            //this.log('[' + spec.suite.description + '] <font color="' + color + '">' + spec.description + '</font><br>');
			//result += ('• <font color="' + color + '">' + spec.description + '</font>' + msg + '<br>');
			
			if (!spec.results().passed()) {

				for (var i=0; i<spec.results().items_.length; i++) {

					if (!spec.results().items_[i].passed_) {

						result += '<div class="messages">';
						//	+'<div class="resultMessage fail">'+(i+1) + ' - ' + spec.results().items_[i].message+'</div>';						
						if (spec.results().items_[i].trace != null) {
							result += '<pre class="stackTrace"><strong>'+(i+1)+'</strong> '+spec.results().items_[i].trace.message+'</pre>';
						}
						
						result += '</div>';
						//result += ('&nbsp;&nbsp;&nbsp;&nbsp;(' + (i+1) + ') ' + spec.results().items_[i].message + '<br>');
						
						/*
						non server
						if (spec.results().items_[i].expected) {
							this.log('&nbsp;&nbsp;&nbsp;&nbsp;• Expected: "' + spec.results().items_[i].expected + '"<br>');
						}
						this.log('&nbsp;&nbsp;&nbsp;&nbsp;• Actual result: "' + spec.results().items_[i].actual + '"<br>');
						*/
						//this.log('<br>');
					} 
				}
			}
			//Ti.API.debug(JSON.stringify(spec.results()));			
			
			result += '</div>';
			
			// store for later
			capture_spec += result;
			//this.log(result);
        },

        reportSpecStarting: function(spec) {
            
            //this.log('spec start[' + spec.suite.description + '] ' + spec.description + '... <br>');
            
            //Ti.API.info('spec--- '+JSON.stringify(spec))
            
            //var result = '<div class="suite alert alert-block passed alert-success">'
            //	+'<a class="description">'+spec.suite.description+'</a>'
            
            
            //this.log(result);
        
        },

        reportSuiteResults: function(suite) {
        
        	//Ti.API.info('<<<SUITE '+JSON.stringify(suite));
        
            var results = suite.results();
            var html = '';
            
            if (results.passedCount == results.totalCount) {
	        	html += '<div class="suite alert alert-block passed alert-success">'
	        		+'<a class="run_spec btn btn-mini btn-info">OK</a>';   
            } else {
	            html += '<div class="suite alert alert-block failed alert-error">';
            }
            
            html += '<a class="description">'+suite.description+' ('+results.passedCount+' of '+results.totalCount+')<a>';
            
            html += capture_spec;
            capture_spec = '';
            
            html += '</div>';
            
            this.log(html);

        },

        log: function(str) {
            this.updateTestResults(str);
        }
    };
    
    // export public
    jasmine.TitaniumReporter = TitaniumReporter;
})();