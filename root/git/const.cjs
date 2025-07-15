module.exports = {
	GIT_DIR: process.env.PWD, // set this to relative path if you wish, ie: _dirname + "../"
	COMMIT_PREFIXES: [
		"merge",
		"feat",
		"fix",
		"pause",
		"chore",
		"doc",
		"style",
		"refactor",
		"test",
		"pause",
		"milestone",
	],
};
