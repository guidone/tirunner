
var clc = require('cli-color');
var fs = require('fs');
var parseString = require('xml2js').parseString;

var tirunnerVersion = '0.2.0';



var _tiapp = null;

module.exports = function(jake,desc,task,complete,fail,file,namespace,appPath) {
	
	desc('Parse the tiapp.xml file');
	task('tiapp',function() {

		var fileContents = fs.readFileSync(appPath+'/tiapp.xml','utf8'); 

		parseString(fileContents, function (err, result) {
		    
		    // store result
		    _tiapp = result;
		    // write header
		    console.log(clc.cyan.bold('TiRunner v'+tirunnerVersion));
		    console.log(clc.yellow('App: ')+_tiapp['ti:app']['name'][0]);
		    console.log(clc.yellow('App-id: ')+_tiapp['ti:app'].id[0]+' v'+_tiapp['ti:app']['version'][0]);		    
		    console.log(clc.yellow('Titanium SDK: ')+_tiapp['ti:app']['sdk-version'][0]);
		    
		    complete();
		});
		
	});
	
	
	desc('Install TiRunner/Jasmin test directory');
	task('install',function() {
		
	
		// create directory
		var localTiRunner = appPath+'/Resources/tirunner';
		var moduleTiRunner = appPath+'/node_modules/tirunner/jasmine';

		// delete if exists
		if (fs.existsSync(localTiRunner)) {
			fs.unlinkSync(localTiRunner);
		}
		
		// link
		jake.exec(
			'ln -s '+moduleTiRunner+' '+localTiRunner,
			function() {
				console.log(clc.green('TiRunnner/Jasmine installed.'));
				console.log('Copy this code somewhere to start your tests');
				var code = clc.xterm(246);
				console.log('');
				console.log(code('  if (Ti.App.id.match(/\-jasmine$/)) { Ti.include("/tirunner/tests.js"); }'));
				console.log('');
			},
			{
				printStdout: false,
				printStderr: true
			}
		);

		
	});
	
	
	desc('The answer to the universe and everything');
	task('echo',['tiapp'],function() {
		
		console.log('42');

		complete();
				
	});
	
	
	desc('Clean the current build');
	task('clean',function() {
		
		jake.rmRf('build/iphone/build');
		console.log(clc.green('Project clean!'));
		
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
	task('run',['tiapp'],{async: true},function() {
		
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
	
	
	desc('Run tests in simulator');
	task('test',['tiapp'],{async: true},function() {
	
		var app_id = _tiapp['ti:app'].id[0];
		var ti_sdk = _tiapp['ti:app']['sdk-version'][0];
		var app_name = _tiapp['ti:app']['name'][0];		
	
		var builder = '$HOME/Library/Application\\ Support/Titanium/mobilesdk/osx/'+ti_sdk+'/iphone/builder.py';
		var runCmd = [
			builder+' run "`pwd`" 6.1 "'+app_id+'-tirunner" '+app_name+'Jasmine ipad'
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