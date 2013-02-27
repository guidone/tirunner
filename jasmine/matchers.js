var _ = require('/tirunner/jasmine/underscore')._;

(function () {
  function u(v, f, a) {
    return _(v)[f].apply(_(v), a);
  }
  
  function generateMatcherName(functionName) {
    function capitalise(str) {
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    }
    return functionName.match(/^is(.*)/) ? 'toBe' + functionName.slice(2) : 'toBe' + capitalise(functionName); 
  }
  
  var allowedFunctions = {

      booleanFunctions : {
        names : ['isEmpty', 
                'isElement', 
                'isArray', 
                'isArguments', 
                'isFunction', 
                'isString', 
                'isNumber', 
                'isBoolean', 
                'isDate',
                'isRegExp',
                'isNaN', 
                'isNull', 
                'isUndefined',
                'include',
                'all',
                'any'],
        matcherGenerator: function (functionName) {
          return function () {
            return u(this.actual, functionName, arguments);
          };
        }
      },
      
      equalityFunctions : {
        names : ['compact', 
                'flatten', 
                'uniq', 
                'without'],
        matcherGenerator : function (functionName) {
          return function () {
            return _(u(this.actual, functionName, arguments)).isEqual(this.actual);
          };
        }
      }
    },
    overrides = {
      'flatten' : 'toBeFlat',
      'uniq' : 'toHaveUniqueValues',
      'include' : 'toInclude',
      'all' : 'allToSatisfy',
      'any' : 'anyToSatisfy'
    };

  var matcherDefs = _(_).chain()
    .keys()
    .reduce(function (memo, key) {
      var type = _(allowedFunctions).detect(function (value) {
        return _(value.names).contains(key);
      });
      
      if (type) {
        memo[overrides[key] || generateMatcherName(key)] = type.matcherGenerator(key);
      }

     return memo;
    }, {}).value();  

  beforeEach(function () {
    this.addMatchers(matcherDefs);
  });
}());

(function () {
  this.using = function () {
    var self = this, 
      args = _(arguments).toArray(), 
      examples = args.slice(0, args.length - 1),
      block = args[args.length - 1];

    _(examples).each(function (example) {
      if (block.length === 1) {
        block.call(self, example);
      } else if (_(example).isArray() && block.length === example.length) {
        block.apply(self, example);
      } else {
        throw "Parameter count mismatch";
      }
    });
  };
}());




beforeEach(function() {
	this.addMatchers({

/*		toHaveMethod: function() {
			
		},

toBeInstanceOf: function(Constructor) {
return this.actual instanceof Constructor;
},

    toBeOneOf: function(values) {
      return values.indexOf(this.actual) > -1;
    }
		
    toBeInRange: function(a, b) {
      return this.actual <= b && this.actual >= a;
    },		
		
*/		
		toHaveProperty: function(property) {
		
			var that = this;
			var actual = that.actual;
			
			this.message = function () {
			
				if (that.isNot) {
					return 'Expected not to have property '+property;
				} else {
					return 'Expected to have property '+property;
				}
			
			};
			
			return actual != null && _(actual).has(property) !== undefined;	
			
		},

		/*toContain: function(item) {

			var that = this;
			var actual = that.actual;	
			
			this.message = function() {

				if (that.isNot) {
					return 'Expected to not contain '+item+' :'+JSON.stringify(actual);
				} else {
					return 'Expected to contain '+item+' :'+JSON.stringify(actual);
				}
				
			};
			
			if (._isString(actual)) {
				return actual.indexOf(item) != -1;
			} else if (_.isArray(actual) || _.isObject(actual)) {
				return _(actual).contains(item);
			} else {
				return false;
			}			
		},
		*/

		toHaveSizeOf: function(count) {
			
		},

		/**
		* @method toBeEmpty
		* Check if a object,string,array is null or empty
		* @return {Boolean}
		*/
/*		toBeEmpty: function() {
		
			var that = this;
			var actual = that.actual;
			
			this.message = function () {
			
				if (that.isNot) {
					return 'Expected not to be empty, it is.'
				} else {
					return 'Expected to be empty, it\'s not.';
				}
			
			};
			
			return _.isEmpty(actual);
		},
*/

		/**
		* @method toBeA
		* Check the type of a variable
		* @param {String} type Could be: array,string,function,object,boolean,date,nan,empty,number
		* @return {Boolean}		
		*/
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