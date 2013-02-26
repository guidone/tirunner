
var clc = require('cli-color');
var fs = require('fs');
var parseString = require('xml2js').parseString;


var tirunnerVersion = '0.2.7';



var _tiapp = null;
var _globalLineCount = 0;

module.exports = function(jake,desc,task,complete,fail,file,namespace,appPath) {


	var jshint = require(appPath+'/node_modules/tirunner/node_modules/jshint/packages/jshint/jshint.js').JSHINT;	
	
	desc('Parse the tiapp.xml file');
	task('tiapp',{async: true},function() {

		var fileContents = fs.readFileSync(appPath+'/tiapp.xml','utf8'); 

		parseString(fileContents, function (err, result) {
		    
		    // store result
		    _tiapp = result;
		    // write header
		    var name = clc.xterm(246);
		    console.log(clc.cyan.bold('TiRunner v'+tirunnerVersion)+' - '+name('guido.bellomo@gmail.com'));
		    console.log(clc.yellow('App: ')+_tiapp['ti:app']['name'][0]);
		    console.log(clc.yellow('App-id: ')+_tiapp['ti:app'].id[0]+' v'+_tiapp['ti:app']['version'][0]);		    
		    console.log(clc.yellow('Titanium SDK: ')+_tiapp['ti:app']['sdk-version'][0]);
		    
		    complete();
		});
		
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
	task('link',function(test_file) {
		
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
	task('docs',function() {

		if (!fs.existsSync(appPath+'/jsduck/jsduck.json')) {
			console.log(clc.red('Jsduck file not found.')+' ('+appPath+'/jsduck/jsduck.json'+')');
			complete();
			return false;
		}

		jake.exec(
			'jsduck --config=jsduck/jsduck.json',
			function() {
				console.log(clc.green('Docs complete!')+' Docs are in ./docs');
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
			if (msg.indexOf('[INFO]') !== -1) {
				console.log(msg.replace('[INFO]',clc.green('[INFO]')));	
			} else if (msg.indexOf('[ERROR]') !== -1) {
				console.log(msg.replace('[ERROR]',clc.red('[ERROR]')));	
			}			
		});
					
	};
	
	desc('Run in iPhone Simulator');
	task('run',['tiapp','unlink'],{async: true},function() {
		
		var app_id = _tiapp['ti:app'].id[0];
		var ti_sdk = _tiapp['ti:app']['sdk-version'][0];
		var app_name = _tiapp['ti:app']['name'][0];		
		
		var builder = '$HOME/Library/Application\\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
		var runCmd = [
			//'export ios_builder="/Volumes/OSX\ Boot/Users/guidob/Library/Application\ Support/Titanium/mobilesdk/osx/1.8.2/iphone/builder.py"',
			builder+' run "`pwd`" 6.1 "'+app_id+'" '+app_name+' ipad'
			];
		
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: false
			}
		);
		ex.addListener('stdout',stdoutListener);
		
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
	
	
	
	desc('Run tests in simulator, get tests from /tests/*. Use parameters to specify a particulat test: jake test[my_test]');
	task('test',['tiapp'],{async: true},function(test_file) {
	
		// call link with params
		jake.Task['link'].invoke(test_file);
	
		var app_id = _tiapp['ti:app'].id[0];
		var ti_sdk = _tiapp['ti:app']['sdk-version'][0];
		var app_name = _tiapp['ti:app']['name'][0];		
	
		
		var builder = '$HOME/Library/Application\\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
		var runCmd = [
			builder+' run "`pwd`" 6.1 "'+app_id+'" '+app_name+' ipad'
			];	
			
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