# TiRunner

TiRunner is a Titanium command line utility to run apps, launch tests and handle components inside a Titanium project 

For installation, type

	sudo npm install tirunner -g

## Requirements
In order to work properly, Titanium CLI is needed

	sudo npm install titanium
	
And also Bower might be useful (the Twitter component manager)

	sudo npm install bower	

## Available commands
Run jake -T to list all available commands

- **jake run**: Run the current project. It's possibile to specify a iOS version, like jake run[6.0]. This is useful to launch app in a complete different environment (with different settings for example)
- **jake debug**: It's like run, but shows all debug information
- **jake test[file,reporter,version]**: Run the app with the specified test case. If nothing will run all the tests. Reporter
	- file: The JavaScript test file to run (could also be part of filename)
	- reporter: the reporter to use: cli or html
	- version: the simulator version to use 6.0 or 6.1
- **jake clean**: Clean the project
- **jake kill**: Kill the simulator
- **jake check**: Check the source listed in ./jsduck/jsduck.json against JSHint and report errors
- **jake docs**: Generate docs with JsDuck. JsDuck configuration must be in ./jsduck folder.
- **jake components**: List all available components
- **jake list**: List all installed components
- **jake install[component_name,version]**: Install a component, version paramenter could be omitted
- **jake uninstall[component_name]**: Uninistall component
- **jake bump**: Update the /cfg/* files with the version number of tiapp.xml

## Testing
A basic test file looks like

	(function() {
		describe('my test 1',function() {		
			it('deve pingare il server sup',function() {
				expect(true).toBe(true);	
			});
		});
		// asynch testing
		describe('my test 2',function() {
			var async = new AsyncSpec(this);
			it('deve pingare il server sup',function(done) {
				expect(true).toBe(true);
				done();	
			});
		});
	})();

It's possibile to choose two kind of reporters:
	- cli: show the result on the command line (useful for testing user interface elements)
	- html: show the result in the application (useful for testing models, where the debug output is important) 

Test files follows the Jasmine BDD styles, the following commands are available:

- toHaveProperty(property)
- toBe(value)
- toBeA(type): where type is array, object, boolean, number, string, function, date
- toBeEmpty, toBeElement, toBeisArray, toBeArguments, toBeFunction, toBeString, toBeNumber, toBeBoolean, toBeDate, toBeNaN, toBeNull, toBeUndefined
- toBeLessThan(value)
- toBeGreatherThan(value)
- include
- all
- any
- toBeFlat
- toHaveUniqueValues
- toInclude
- allToSatisfy
- anyToSatisfy


## Documentation
tbd

## JSHint
tbd

## Components
tdb

## Credits
TiRunner uses this components

- Titanium Command Line Interface
- Bower: the Twitter components managaer
- JSHint: for JavaScript syntax check
- JSDuck: for document generation

