var _ = require('/tirunner/jasmine/underscore')._;

beforeEach(function() {
	this.addMatchers({

		toBeA: function(type) {
		
			var that = this;
			var actual = that.actual;
			var notText = that.isNot ? " not" : "";


			this.message = function () {
				var expected = null;
				switch(type) {
					case 'array': expected = 'array'; break;
					case 'string': expected = 'string'; break;
					case 'function': expected = 'function'; break;
					case 'object': expected = 'object'; break;
					case 'boolean': expected = 'boolean'; break;
					case 'date': expected = 'date'; break;
					case 'nan': expected = 'not a number'; break;
					case 'empty': expected = 'empty'; break;
					case 'number': expected = 'number'; break;
					}
				if (expected != null) {	
					return "Expected " + actual + notText + " to be a " + expected;
				} else {
					return 'Type not supported ('+type+')';
				}
			};
			
			var result = false;
			switch(type) {
				case 'array': result = _.isArray(actual); break;
				case 'string': result = _.isString(actual); break;
				case 'function': result = _.isFunction(actual); break;
				case 'object': result = _.isObject(actual); break;
				case 'boolean': result = _.isBoolean(actual); break;
				case 'date': result = _.isDate(actual); break;
				case 'nan': result = _.isNaN(actual); break;
				case 'empty': result = _.isEmpty(actual); break;
				case 'number': result = _.isNumber(actual); break;
				
			}

			return result;
			}			

			
		});		
});