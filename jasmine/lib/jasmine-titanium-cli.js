var _ = require("/tirunner/jasmine/underscore")._;

(function() {
    
    var capture_spec = '';
    
    if (!jasmine) {
        throw new Exception("jasmine library does not exist in global namespace!");
    }
    
    var stackMessages = null;
    
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

/*		
		var realoadButton = Ti.UI.createButton({			
			title: 'Reaload'			
		});
		realoadButton.addEventListener('click',function(e) {
			
			var result = options.realoadCallback();
			
			Ti.API.info('result reload ')
			
		});
*/		
				
	

		var capture_spec = '';
		this.updateTestResults = function(messages) {
			
			//_(stackMessages).each(function(item) {
			//	Ti.API.info(item);
			//});

		};
    };

    TitaniumReporter.prototype = {
        reportRunnerResults: function(runner) {
            //this.log('<h3>Test Runner Finished.</h3>');
        },

        reportRunnerStarting: function(runner) {
            //this.log('<h3>Test Runner Started.</h3>');
			stackMessages = [];
        },

        reportSpecResults: function(spec) {

			
			//var pass = spec.results().passedCount + ' pass';
			var fail = null;
			var result = '';

			if (!spec.results().passed()) {
				//result += '<div class="spec alert failed alert-error">'
				//	+'<a class="description">'+spec.description+' ('+spec.results().passedCount+') passed</a>';
				stackMessages.push(spec.description+' ('+spec.results().passedCount+') passed');
			} else {
				//result += '<div class="spec alert passed alert-success">'					
				//	+'<a class="description">'+spec.description+' ('+spec.results().passedCount+') passed</a>';
				stackMessages.push(spec.description+' ('+spec.results().passedCount+') passed');
			}


            //this.log('[' + spec.suite.description + '] <font color="' + color + '">' + spec.description + '</font><br>');
			//result += ('• <font color="' + color + '">' + spec.description + '</font>' + msg + '<br>');
			
			if (!spec.results().passed()) {

				for (var i=0; i<spec.results().items_.length; i++) {

					if (!spec.results().items_[i].passed_) {

						//result += '<div class="messages">';
						//	+'<div class="resultMessage fail">'+(i+1) + ' - ' + spec.results().items_[i].message+'</div>';						
						if (spec.results().items_[i].trace != null) {
							//result += '<pre class="stackTrace"><strong>'+(i+1)+'</strong> '+spec.results().items_[i].trace.message+'</pre>';
							stackMessages.push('['+(i+1)+'] '+spec.results().items_[i].trace.message);
						}
						
						//result += '</div>';
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
			
			//result += '</div>';
			
			// store for later
capture_spec += result;
			//this.log(result);
        },

        reportSpecStarting: function(spec) {
            
            //this.log('spec start[' + spec.suite.description + '] ' + spec.description + '... <br>');
            
            //Ti.API.info('- '+spec.description);
            
            
            //Ti.API.info('spec--- '+JSON.stringify(spec))
            
            //var result = '<div class="suite alert alert-block passed alert-success">'
            //	+'<a class="description">'+spec.suite.description+'</a>'
            
            
            //this.log(result);
        
        },

        reportSuiteResults: function(suite) {
        
        	//Ti.API.info('<<<SUITE '+JSON.stringify(suite));
        
            var results = suite.results();
            var html = '';
            
            /*
            if (results.passedCount == results.totalCount) {
	        	html += '<div class="suite alert alert-block passed alert-success hide-messages">'
	        		+'<a class="run_spec btn btn-mini btn-info">OK</a>'
	        		+'<a class="run_spec btn btn-mini btn-info btn-showall">SHOW</a>';   
            } else {
	            html += '<div class="suite alert alert-block failed alert-error">';
            }
            */

			
			//Ti.API.info('  Passed: '+results.passedCount+' of '+results.totalCount)                        
            //html += '<a class="description">'+suite.description+' ('+results.passedCount+' of '+results.totalCount+')<a>';
			Ti.API.info('* '+suite.description+' ('+results.passedCount+' of '+results.totalCount+')');
            
            _(stackMessages).each(function(message) {
	            Ti.API.info('*   - '+message);
            })
            stackMessages = [];
            
            
            //html += capture_spec;
            
            //capture_spec = '';
            
            //html += '</div>';
            
            this.log(stackMessages);

        },

        log: function(messages) {
            this.updateTestResults(messages);
        }
    };
    
    // export public
    jasmine.TitaniumReporter = TitaniumReporter;
})();