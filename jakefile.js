require('./main')(jake,desc,task,complete,fail,file,namespace,__dirname);

var p = new jake.NpmPublishTask('jake',
	[
	'jakefile.js',
	'README.md',
	'package.json',
	'main.js'
]);
