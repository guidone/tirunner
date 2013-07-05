# TiRunner

TiRunner is a Titanium command line utility to run apps, launch tests and handle components inside a Titanium project 

For installation, type

	sudo npm install tirunner

## Requirements
In order to work properly, Titanium CLI is needed

	sudo npm install titanium
	
And also Bower might be useful (the Twitter component manager)

	sudo npm install bower

Install git command line

	https://help.github.com/articles/set-up-git

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
In order the access the components repository, it's needed to register the ssh key to access the server (see below). 

List all components available

	jake components
	
To install a component

	jake install[my_component]

To install a specific version

	jake install[my_component,1.0.0]
	
To remove a component

	jake uninstall[my_component]

Components are installed under /Resources/components
Some features are available only with bower command line (install using "sudo npm install bower").
For example to see the installed components

	bower ls
	
or to get information about a component (for example the available versions):

	bower info my_component	  

## Access to GIT repository
To access the components repository, a SSH key is needed

	cd ~/.ssh
	ssh-keygen -t rsa -C "your_email@example.com"
	~/.ssh/id_rsa.pub
	
Then add to the server

	cat ~/.ssh/id_rsa.pub | ssh user@hostname 'cat >> .ssh/authorized_keys'	

## Creating a component
To create a new components in the components server

1. Log in the the components server with ssh and create a new directory for the component, suppose the component name is my_component

	mkdir /components/my_component.git
	
2. Initialize the git repository

	cd /components/my_component.git
	git init
	git config --bool core.bare true

3. Clone the repository locally
	
	git clone http://titanium.dsgroup.it/dscomponents/my_component.git
	
4. Add the component descriptor bower.json in the root of the repository

	{
	"name": "my_component",
  	"version": "1.0.0",
  	"main": ["./layoutManager.js"],
  	"dependencies": {}
  	}
  	
5. Start adding your files
6. Commit and tag your last commit with 'v1.0.0', then push your commit and the tag to the remote repository
7. Log into components server and edit the file
 
	/Users/titanium/components/packages/index.json

adding 	the reference for your component and the end of the array, for example

	{"name":"my_component","url":"ssh://titanium@192.168.9.39/dscomponents/my_component.git"}

Then create a file index.json with this content

	{"name":"my_component","url":"ssh://titanium@192.168.9.39/dscomponents/my_component.git"}

in this path

	/Users/titanium/components/packages/my_component/index.json

(that's because there isn't any automatic component registration procedure)
8. Test your new component
	jake components
You should be able to view your new component in the list
	jake install[my_component]
To install it locally

Every component update, keep in mind that you have to

1. Increase the version in the bower.json file
2. Commit all the changes
3. Tag the last commit with the name 'v1.0.1' where '1.0.1' is the new version (don't forget the 'v')
4. Push the changes to the remote server alogn with the tag
5. Don't forget to publish the tag
6. Check if the new version is available with bower *info my_component*

At this point you have a separate repository for your component (for example /my_projects/my_component) and the local copy of the component in the project directory (/my_projects/my_app/Resources/components/my_component)

To update a component in a project, just type

	cd /my_projects/my_app
	jake install[my_component]

It's not very useful, every time a component is updated, repeat the steps 1 to 5 and then make an update.
That's where the *bower* command it's useful: it's possibile, inside a project, to link directly the component repository, in that case any changes to the component repository will be immediately reflected to linked project (but projects that use the component normally will be unaffected).
To link a component, enter the component directory (for example /my_projects/my_component) and type

	bower link

Try with sudo if any problem. This will link your component globally on the system (this operation must be done just once)
Then enter the app project directory (for example /my_projects/my_app) and type

	bower link my_component
	
This will create a symbolic link under ./Resources/components/my_component


## Credits
TiRunner uses this components

- Titanium Command Line Interface
- Bower: the Twitter components managaer
- JSHint: for JavaScript syntax check
- JSDuck: for document generation

