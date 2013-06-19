
var clc = require('cli-color');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var _ = require('underscore');
var bower = require('bower');

var tirunnerVersion = '0.5.0';
var _tiapp = null;
var _tilocal = null;
var _globalLineCount = 0;

module.exports = function(jake,desc,task,complete,fail,file,namespace,appPath) {


	var jshint = require(appPath+'/node_modules/tirunner/node_modules/jshint/packages/jshint/jshint.js').JSHINT;	
	
	
	desc('Init the packet manager');
	task('init',['tiapp'],function() {
		
		// write the bowerrc anyway
		var bowerrc = '{"directory": "Resources/components","json": "bower.json",'
			+'"endpoint"  : "http://titanium.dsgroup.it:81"}';
		
		fs.writeFileSync(appPath+'/.bowerrc',bowerrc,'utf8'); 
		
		// if not exist, create the component.js
		if (!fs.existsSync(appPath+'/component.json')) {

			var component = {
			  "name": _tiapp['ti:app']['name'][0],
			  "version": _tiapp['ti:app']['version'][0], 
			  "main": "",
			  "dependencies": {
			  }
			}
			
			fs.writeFileSync(appPath+'/component.json',JSON.stringify(component),'utf8'); 

		}
		
		console.log('Init packet manager...'+clc.green('OK'));
				
	});
	
	desc('Show all available components');
	task('components',['init'],{async: true},function() {
	
		console.log('Available components ');
	
		bower.commands.search()
				.on('packages',function(pack) {
					// do nothing	
				})
				.on('data',function(data) {

					console.log(data);	
				})
				.on('end', function (data) {
					complete();
				});	
		
	});
	
	desc('List all installed components');
	task('list',['init'],{async: true},function() {
	
		console.log('Installed components:');
	
		bower.commands.list({offline: false})
			.on('data', function (data) {
				console.log(data);
			})
			.on('end', function (data) {
			console.log(data);
			})

		
	});

	
	desc('Install a packet from repository');
	task('install',['init'],{async: true},function(name,version) {
		
							
		// just install the package
		if (name != null) {

			// convert to string
			var packetName = String(name);

			if (version != null) {
				if (version.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
					console.log('Installing packet '+clc.cyan(packetName)+' v'+version);
					packetName += '#'+version;
				} else {
					console.log(clc.red('Invalid version number, use x.y.z format')+' ('+version+')');
					fail();
				}
			} else {
				console.log('Installing packet '+clc.cyan(packetName));	
			}


			bower.commands.install([packetName],{save: true})
				.on('result',function(result) {
					console.log(result.replace(/\n$/g,''));	
				})
				.on('packages',function(pack) {
					console.log(pack.replace(/\n$/g,''));	
				})
				.on('data',function(data) {
					console.log(data.replace(/\n$/g,''));	
				})
				.on('end', function (data) {
					console.log('Install complete');
					complete();
				});			
		} else {

			bower.commands.install()
				.on('result',function(result) {
					console.log(result.replace(/\n$/g,''));	
				})
				.on('packages',function(pack) {
					console.log(pack.replace(/\n$/g,''));	
				})
				.on('data',function(data) {
					console.log(data.replace(/\n$/g,''));	
				})
				.on('end', function (data) {
					console.log('Install complete');
					complete();
				});			
		}
		
	});



	desc('Uninstall a packet from project');
	task('uninstall',['init'],{async: true},function(name,version) {
					
		if (name == null || name == '') {
			console.log(clc.red('Missing packet name'));
		}
				
		// convert to string
		var packetName = String(name);
		
		console.log('Uninstalling packet '+clc.cyan(packetName));
		
		bower.commands.uninstall([packetName],{save: true})
			.on('data',function(data) {
				console.log(data);	
			})
			.on('end', function (data) {
				console.log('Uninstall complete');
				complete();
			});
		
	});	
	
	desc('Bump versions in configuration files');
	task('bump',['tiapp'],function() {
		
		var envs = ['prod','quality','test'];
		var k = 0;

		envs.forEach(function(env) {
			
			console.log('Bump version in '+clc.cyan(env)+' config files');

			// replace tiapp.xml version
			if (fs.existsSync(appPath+'/cfg/'+env+'/tiapp.xml')) {				
				var tiapp = fs.readFileSync(appPath+'/cfg/'+env+'/tiapp.xml','utf8');
				tiapp = tiapp.replace(/<version>.*?<\/version>/,'<version>'+_tiapp['ti:app']['version'][0]+'</version>');				
				fs.writeFileSync(appPath+'/cfg/'+env+'/tiapp.xml',tiapp);			
			} // end if file exist
			
			// replace Root.plist version
			if (fs.existsSync(appPath+'/cfg/'+env+'/Settings.bundle/Root.plist')) {				
				var plist = fs.readFileSync(appPath+'/cfg/'+env+'/Settings.bundle/Root.plist','utf8');
				
				// quick and dirty, don't want to parse xml
				var searchFor = '<string>Release</string>';
				var idx = plist.indexOf(searchFor);
				var firstPart = plist.substr(0,idx+searchFor.length);
				var secondPart = plist.substr(idx+searchFor.length);												
				secondPart = secondPart.replace(/<string>.*?<\/string>/,'<string>'+_tiapp['ti:app']['version'][0]+'</string>');
				
				fs.writeFileSync(appPath+'/cfg/'+env+'/Settings.bundle/Root.plist',firstPart+secondPart);			
			} // end if file exist
						
		});

		// replace Root.plist version
		if (fs.existsSync(appPath+'/platform/iphone/Settings.bundle/Root.plist')) {				
			var plist = fs.readFileSync(appPath+'/platform/iphone/Settings.bundle/Root.plist','utf8');
			
			// quick and dirty, don't want to parse xml
			var searchFor = '<string>Release</string>';
			var idx = plist.indexOf(searchFor);
			var firstPart = plist.substr(0,idx+searchFor.length);
			var secondPart = plist.substr(idx+searchFor.length);												
			secondPart = secondPart.replace(/<string>.*?<\/string>/,'<string>'+_tiapp['ti:app']['version'][0]+'</string>');
			
			fs.writeFileSync(appPath+'/platform/iphone/Settings.bundle/Root.plist',firstPart+secondPart);			
		} // end if file exist

		console.log(clc.green('Completed!'));
		console.log('');	
		
	});
	
	
	desc('Publish a component');
	task('publish',{async: true},function() {
		
		var tagName = '1.0.5';

		console.log('Publishing component');

		// verifica sia tutto committato
		//git status --porcelain
		// verifica sia tutto pushato
		// git rev-list HEAD --not --remotes


		var output = '';
		var runCmd = [
			//'git push origin master',
			'git tag -a v'+tagName+' -m \'Tagged version '+tagName+'\'',
			'git push origin '+tagName
			];	
			
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: false
			}
		);
		ex.addListener('stderr',function(msg,code) {
			
			console.log('Error: '+msg);
			complete();
			
		});
		ex.addListener('stdout',function(raw) {
			output += raw.toString();			
		});
		ex.addListener('cmdEnd',function() {
			
			console.log(output);			
			console.log('Finito!');
			complete();
						
		});
		ex.run();
		
		
	});
		
	desc('Parse the tiapp.xml file');
	task('tiapp',{async: true},function() {

		var fileContents = fs.readFileSync(appPath+'/tiapp.xml','utf8'); 

		parseString(fileContents, function (err, result) {


		    var name = clc.xterm(246);
		    // store result
		    _tiapp = result;
		    
		    // modules string
		    var modules = [];
		    _(_tiapp['ti:app'].modules[0].module).each(function(module) {			    
			    var str = name(module['_'])+':'+module['$'].version;			    
			    modules.push(str);
		    });
		    		    
		    // write header		    
		    console.log(clc.cyan.bold('TiRunner v'+tirunnerVersion)+' - '+name('guido.bellomo@gmail.com'));
		    console.log(clc.yellow('App: ')+_tiapp['ti:app']['name'][0]);
		    console.log(clc.yellow('App-id: ')+_tiapp['ti:app'].id[0]+' v'+_tiapp['ti:app']['version'][0]);		    
		    console.log(clc.yellow('Titanium SDK: ')+_tiapp['ti:app']['sdk-version'][0]);
		    if (modules.length != 0) {
		    	console.log(clc.yellow('Modules: ')+modules.join(', '));
		    }
		    complete();
		});
		
	});

	desc('Parse local settings for this project');
	task('tilocal',function() {
		
		if (fs.existsSync(appPath+'/.tirunner.json')) {

			var fileContents = fs.readFileSync(appPath+'/.tirunner.json','utf8');
			
			try {
				_tilocal = JSON.parse(fileContents);
			} catch(e) {
				console.log(clc.red('Error parsing .tirunnner.json file.')+'('+e.toString()+')');
				complete();
			}

		}		
		
	});


	/**
	* @method getFileName
	* Extract file name from path
	* @param {String} path
	* @return {String}
	*/
	function getFileName(js) {
		
		var a = js.split('/');
		
		if (a.length > 0)
			return a[a.length-1];
		else return null;
		
	}	

	function processLint(strFile) {
		
		// open file
		var data = fs.readFileSync(strFile);
	
		// pass to JSHint
		var result = jshint(data.toString());
		result = jshint.data();
	
		var nChar = data.toString().match(/[\n]/g);	
		_globalLineCount += nChar != null ? nChar.length : 0;
		
		// show errors
		if (result.errors == null || result.errors.length == 0) {
			console.log('Parsing: '+clc.cyan(getFileName(strFile))+' .'+'.. '+clc.green('OK'));
			}
		else {
	
	
			console.log('----------------------------------');
			console.log('Parsing: '+clc.red(strFile));
			console.log('');
			result.errors.forEach(function(hint) {
				if (hint != null) {
				
				if (hint.line != null) {
					console.log(clc.green('Line '+hint.line+':'+hint.character)+' '+clc.yellow(hint.reason));
					}
					if (hint.evidence)
						console.log(hint.evidence.replace(/\t/g,''));
					}
				});
			}	
		
		// show globals
		if (result.implieds != null && result.implieds.length != 0) {
			console.log(clc.yellow('Implied globals:'));
			result.implieds.forEach(function(value) {	
				console.log(value.name+': '+clc.green(value.line.toString()));
				});
			}
			
		// check unused
		if (result.unused != null && result.unused.length != 0)	{
			console.log(clc.yellow('Unused variables:'));
			result.unused.forEach(function(value) {	
				console.log(clc.green('Line '+value.line)+' '+value.name+' in '+clc.yellow(value['function'].replace(/"/g,'')+'()'));			
				});
			}
		
		return (result.unused == null || result.unused.length == 0) 
			&& (result.implieds == null || result.implieds.length == 0)
			&& (result.errors == null || result.errors.length == 0);
					
		}

	desc('Compile the release notes');
	task('releasenotes',function() {
		
		// get tags
		// svn list https://dssvnsrv.dsgroup.it/svn/calzedonia/tags sort
		// get 
		//svn log https://dssvnsrv.dsgroup.it/svn/calzedonia/tags/1.3.32\ production -v --stop-on-copy
		
		// se non si sceglie un tag, prende l'ultimo tag
		// trova revisione dal tag
		// trova ultima revisione
		// commenti tra le due revisioni
		// estrazione dei #
		
			
		var output = '';
		var runCmd = [
			'svn log -r 3207:3193'
			];	
			
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: false
			}
		);
		ex.addListener('stdout',function(raw) {
			output += raw.toString();			
		});
		ex.addListener('cmdEnd',function() {
									
			var bugs = _.uniq(output.match(/#([0-9]+)/g));
						
		});
		ex.run();		
		
		
		
	});
	
	
	desc('The default command');
	task('default',function() {
		
		console.log('I\'m TiRunner, at your service. Type jake -T for a list of commands');
		
		complete();	
	});
	
	
	
	desc('Check JavaScript files with JSHint');
	task('check',function(check_file) {

		console.log('Check javaScript files with JSHint');
		console.log('');
		console.log('Suggested JSHint headers:');
		var code = clc.xterm(246);		
		console.log('  '+code('/*jshint laxbreak: true,eqnull: true,browser: true,jquery: true,devel: true,regexdash: true,multistr: true, white: false */'));
		console.log('  '+code('/*global define: true, require: true, module: true, Ti: true, L: true, Titanium: true, Class: true, App: true, exports: true */'));
		console.log('');
		
		// open jsduck files
		var jsduck = appPath+'/jsduck/jsduck.json';		
		if (!fs.existsSync(jsduck)) {
			fail(clc.red('JsDuck files not present. ')+'('+jsduck+')');
		}
		var jsduck_content = fs.readFileSync(jsduck,'utf-8');

		var jsduck_json = null;
		try {
		jsduck_json = JSON.parse(jsduck_content);
		} catch(e) {
			console.log(clc.red('Error parsing JsDuck file.')+'('+e.toString()+')');
			complete();
			return false;
		}
				
		// reset
		_globalLineCount = 0;
		files = [];
		jsduck_json['--'].forEach(function(item) {
			if (check_file == null || check_file == '' || item.indexOf(check_file) !== -1) {			
				files.push(appPath+'/jsduck/'+item);
			}
		});
		
		// check each javascript file
		files.forEach(function(js) {
			if (!processLint(js))
				process.exit();	
			});
				
		console.log(clc.green('Check completed! Congrats no errors'));
		console.log(clc.green('Your LoC is:')+' '+_globalLineCount);
		console.log('');
		
	});
	
	
	desc('Link TiRunner/Jasmine test directory in ./Resources');
	task('link',function(test_file,reporter) {
		
		// create directory
		var localTiRunner = appPath+'/Resources/tirunner';
		var moduleTiRunner = appPath+'/node_modules/tirunner';
		
		// link to tirunner if not exists
		if (!fs.existsSync(localTiRunner)) {
			jake.exec(
				'ln -s '+moduleTiRunner+' '+localTiRunner,
				function() {
					console.log(clc.green('TiRunnner/Jasmine installed.'));
					console.log('Copy this code somewhere to start your tests');
					var code = clc.xterm(246);
					console.log('');
					console.log(code('  var test_case_file = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory,"test_case.js");'));
					console.log(code('  if(test_case_file.exists()) { Ti.include("/tirunner/jasmine/tests.js"); }'));
					console.log('');
				},
				{
					printStdout: false,
					printStderr: true
				}
			);
		}

		// remove old
		if (fs.existsSync(appPath+'/Resources/test_case.js')) {
			fs.unlinkSync(appPath+'/Resources/test_case.js');
		}
		var tests = jake.readdirR(appPath+'/Resources/tests');
		var test_case = '';
		var reporter = reporter != null ? reporter : 'html';
		
		// add reporter
		if (reporter == 'html') {
			test_case += 'Ti.include("/tirunner/jasmine/lib/jasmine-titanium-bootstrap.js");\n';
		} else if (reporter == 'cli') {
			test_case += 'Ti.include("/tirunner/jasmine/lib/jasmine-titanium-cli.js");\n';
		} else {
			test_case += 'Ti.include("/tirunner/jasmine/lib/jasmine-titanium-bootstrap.js");\n';
		}
		
		tests.forEach(function(item) {
			if (item != (appPath+'/Resources/tests') && item.indexOf('.svn') == -1) {				
				var fileName = item.replace(appPath+'/Resources','');
				// filter test files
				if (test_file == null || test_file == '' || fileName.indexOf(test_file) !== -1) {
					test_case += 'Ti.include("'+fileName+'");\n';
				}
			}
			
		});
		fs.writeFileSync(appPath+'/Resources/test_case.js',test_case);
		
		console.log(clc.green('Tests linked correctly.'));
		
	});
	
	desc('Unlink TiRunner/Jasmine test directory in ./Resources');
	task('unlink',function() {

		// create directory
		var localTiRunner = appPath+'/Resources/tirunner';
		var moduleTiRunner = appPath+'/node_modules/tirunner';

		// delete if exists
		if (fs.existsSync(localTiRunner)) {
			fs.unlinkSync(localTiRunner);
		}
		
		// check if we are in testing, then restore
		// remove test case file
		if (fs.existsSync(appPath+'/Resources/test_case.js')) {
			fs.unlinkSync(appPath+'/Resources/test_case.js');
		}		
		
		console.log(clc.green('Tests unlinked correctly.'));
		
		complete();
		
	});
	
	
	desc('The answer to the universe and everything');
	task('echo',['tiapp'],function() {
		
		console.log('42');

		complete();
				
	});
	
	
	desc('Clean the current build');
	task('clean',{async: true},function() {
		
				
		jake.exec(
			'rm -rf '+appPath+'/build/iphone/',
			function() {
				
				console.log(clc.green('Project clean!'));
				complete();

			},
			{
				printStdout: false,
				printStderr: true
			}
		);
				
	});
	
	desc('Generate documentation with JsDuck');
	task('docs',['tiapp','tilocal'],function() {

		if (!fs.existsSync(appPath+'/jsduck/jsduck.json')) {
			console.log(clc.red('Jsduck file not found.')+' ('+appPath+'/jsduck/jsduck.json'+')');
			complete();
			return false;
		}

		jake.exec(
			'jsduck --config=jsduck/jsduck.json',
			function() {
				
				// copy docs somewhere
				if (_tilocal != null && _tilocal.docsDestinationPath) {
					
					console.log('Copying docs in '+_tilocal.docsDestinationPath);				
					var docsFile = jake.readdirR(appPath+'/docs');

					// removing all .svn directories
					docsFile.forEach(function(dirName) {
						if (dirName.match(/\/\.svn$/)) {
							jake.rmRf(dirName);
						}
					});
					
					// copy the files, ensure / to copy inside
					jake.exec(
						'cp -r '+appPath+'/docs/ '+_tilocal.docsDestinationPath,
						function() {
							console.log(clc.green('Docs complete!')+' Docs are in ./docs');
						},
						{
							printStdout: true,
							printStderr: true
						}
					);
					//jake.cpR(appPath+'/docs/',_tilocal.docsDestinationPath);
									
				} 
				

			},
			{
				printStdout: true,
				printStderr: true
			}
		);
	});
	
	
	var stdoutListener = function(raw) {
		var msg = raw.toString().split('\n');		
		msg.forEach(function(msg) {
			if (msg.indexOf('SupMboFindAllWrapperProxy.m') != -1) {
				return false;
			}
			if (msg.indexOf('[INFO]') !== -1) {
				console.log(msg.replace('[INFO]',clc.green('[INFO]')));	
			} else if (msg.indexOf('[ERROR]') !== -1) {
				console.log(msg.replace('[ERROR]',clc.red('[ERROR]')));	
			}			
		});
					
	};
	
	function getUserHome() {
		return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
	}	
	
	function getMajorVersion(version) {
		
		var splitted = version.split('.');
		
		if (splitted.length > 0) {
			return parseInt(splitted[0],10);
		} else {
			return null;
		}
		
	}
	
	desc('Run in iPhone Simulator, use parameter to specify a simulator version, es: jake run[6.0]');
	task('run',['tiapp','unlink'],{async: true},function(simulator_version) {
		
		var app_id = _tiapp['ti:app'].id[0];
		var ti_sdk = _tiapp['ti:app']['sdk-version'][0];
		var app_name = _tiapp['ti:app']['name'][0];
		
		// the version of simulator		
		simulator_version = simulator_version != null ? simulator_version : '6.1';		
		
		var builder = null;
		var runCmd = null;

		if (getMajorVersion(ti_sdk) >= 3) {

			runCmd = [
				'titanium build --device-family ipad --platform ios --sim-version '+simulator_version
			];

		} else {

			builder = getUserHome()+'/Library/Application\\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
			var builder_check = getUserHome()+'/Library/Application\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
			// check if exists builder
			if (!fs.existsSync(builder_check)) {
				fail(clc.red('Titanium SDK '+ti_sdk+' is missing. '));
			}
			runCmd = [
				builder+' run "`pwd`" '+simulator_version+' "'+app_id+'" '+app_name+' ipad'
			];
		}

		// run
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: false
			}
		);
		ex.addListener('stdout',stdoutListener);
		
		ex.run();
		
	});

	desc('Debug in iPhone Simulator, show all parameters use parameter to specify a simulator version, es: jake run[6.0]');
	task('debug',['tiapp'],{async: true},function(simulator_version) {
		
		var app_id = _tiapp['ti:app'].id[0];
		var ti_sdk = _tiapp['ti:app']['sdk-version'][0];
		var app_name = _tiapp['ti:app']['name'][0];
						
		simulator_version = simulator_version != null ? simulator_version : '6.1';		
		
		var builder = getUserHome()+'/Library/Application\\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
		var builder_check = getUserHome()+'/Library/Application\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';

		// check if exists builder
		if (!fs.existsSync(builder_check)) {
			fail(clc.red('Titanium SDK '+ti_sdk+' is missing. '));
		}
		
		var runCmd = [
			builder+' run "`pwd`" '+simulator_version+' "'+app_id+'" '+app_name+' ipad'
			];
		
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: true
			}
		);
		
		ex.run();
		
	});
	
	
	function killSimulator(callback) {
		jake.exec(
			'/usr/bin/killall "iPhone Simulator"',
			function() {
				if (callback != null) {
					callback();
				}
			}
		);	
	}
	
	desc('Kill the simulator');
	task('kill',function() {
		
		try {
			killSimulator(function() {
				console.log(clc.green('Simulator killed.'));
				complete();
			});
		} catch(e) {
			// go on
		}
		
	});
	
	
	
	desc('Run tests in simulator, get tests from /tests/*. Use parameters to specify a particulat test and simulator version: jake test[my_test,simulator_version]');
	task('test',['tiapp'],{async: true},function(test_file,reporter,simulator_version) {
	
		// call link with params
		jake.Task['link'].invoke(test_file,reporter);
	
		var app_id = _tiapp['ti:app'].id[0];
		var ti_sdk = _tiapp['ti:app']['sdk-version'][0];
		var app_name = _tiapp['ti:app']['name'][0];		
	
		simulator_version = simulator_version != null ? simulator_version : '6.1';

		var builder = null;
		var runCmd = null;

		if (getMajorVersion(ti_sdk) >= 3) {

			runCmd = [
				'titanium build --device-family ipad --platform ios --sim-version '+simulator_version
			];

		} else {

			builder = getUserHome()+'/Library/Application\\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
			var builder_check = getUserHome()+'/Library/Application\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
			// check if exists builder
			if (!fs.existsSync(builder_check)) {
				fail(clc.red('Titanium SDK '+ti_sdk+' is missing. '));
			}
			runCmd = [
				builder+' run "`pwd`" '+simulator_version+' "'+app_id+'" '+app_name+' ipad'
			];
		}

			
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: false
			}
		);
		ex.addListener('stdout',stdoutListener);
		ex.run();
	
		
	});





};