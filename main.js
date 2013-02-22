module.exports = function(jake,desc,task,complete,fail,file,namespace,appPath) {

	var t = new jake.PackageTask('tirunner', 'v0.1.1', function () {
		var fileList = [
			'jakefile.js'
		];
		this.packageFiles.include(fileList);
		this.needTarGz = true;
		this.needTarBz2 = true;
	});
	
	
	desc('The answer to the universe and everything');
	task('echo',function() {
		
		console.log('42');

		complete();
				
	});
	
	
	desc('Clean the current build');
	task('clean',function() {
		
		jake.rmRf('build/iphone/build');
		console.log('Project clean!');
		
	});
	
	desc('Generate documentation with JsDuck');
	task('docs',function() {
		jake.exec(
			'jsduck --config=jsduck/jsduck.json',
			function() {
				console.log('Complete! Docs are in ./docs');
			},
			{
				printStdout: true,
				printStderr: true
			}
		);
	});
	
	
	desc('Run in iPhone Simulator');
	task('run',{async: true},function() {
	
	// !todo mettere $HOME qua	
		var builder = '/Volumes/OSX\\ Boot/Users/guidob/Library/Application\\ Support/Titanium/mobilesdk/osx/1.8.2/iphone/builder.py';
		var runCmd = [
			//'export ios_builder="/Volumes/OSX\ Boot/Users/guidob/Library/Application\ Support/Titanium/mobilesdk/osx/1.8.2/iphone/builder.py"',
			builder+' run "`pwd`" 6.1 "com.calzedonia.businesspad-quality" BusinessPad ipad'
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