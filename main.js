
var clc = require('cli-color');
var fs = require('fs');
var parseString = require('xml2js').parseString;
var tirunnerVersion = '0.1.5';


var _tiapp = null;

module.exports = function(jake,desc,task,complete,fail,file,namespace,appPath) {
	
	desc('Parse the tiapp.xml file');
	task('tiapp',function() {

		var fileContents = fs.readFileSync(appPath+'/tiapp.xml','utf8'); 

		parseString(fileContents, function (err, result) {
		    
		    // store result
		    _tiapp = result;
		    // write header
		    console.log(clc.blue('TiRunner v'+tirunnerVersion));
		    console.log(clc.yellow('App: ')+_tiapp['ti:app']['name'][0]);
		    console.log(clc.yellow('App-id: ')+_tiapp['ti:app'].id[0]+' v'+_tiapp['ti:app']['version'][0]);		    
		    console.log(clc.yellow('Titanium SDK: ')+_tiapp['ti:app']['sdk-version'][0]);
		    
		    complete();
		});
		
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
	
	
	desc('Run in iPhone Simulator');
	task('run',['tiapp','kill'],{async: true},function() {
		
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
		ex.addListener('stdout',function(raw) {
			var msg = raw.toString().split('\n');		
			msg.forEach(function(msg) {
				if (msg.indexOf('[INFO]') !== -1 || msg.indexOf('[ERROR]') !== -1) {
					console.log(msg);	
				}			
			});
						
		});
		ex.addListener('error',function() {
			console.log('finito e killo');
		});
		
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
		
		killSimulator(function() {
			console.log(clc.green('Simulator killed.'));
			complete();
		})
		
	});
	
	
	desc('Run tests in simulator');
	task('test',{async: true},function() {
	
		console.log('Running test in simulator');
	// !todo mettere $HOME qua	
		var builder = '/Volumes/OSX\\ Boot/Users/guidob/Library/Application\\ Support/Titanium/mobilesdk/osx/1.8.2/iphone/builder.py';
		var runCmd = [
			//'export ios_builder="/Volumes/OSX\ Boot/Users/guidob/Library/Application\ Support/Titanium/mobilesdk/osx/1.8.2/iphone/builder.py"',
			builder+' run "`pwd`" 6.1 "com.calzedonia.businesspad-quality-jasmine" BusinessPadJasmine ipad'
			];
		
		var ex = jake.createExec(
			runCmd, 
			{
				printStdout: false
			}
		);
		ex.addListener('stdout',function(raw) {
			var msg = raw.toString().split('\n');		
			msg.forEach(function(msg) {
				if (msg.indexOf('[INFO]') !== -1 || msg.indexOf('[ERROR]') !== -1 || true) {
					console.log(msg);	
				}			
			});
						
		});
		ex.run();
		
	});


};