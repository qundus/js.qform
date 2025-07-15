const fs = require("node:fs");
const path = require("node:path");
const CONST = require("./const.cjs");

function getCommitFilePath() {
	const commit_file = process.argv[2];
	if (typeof commit_file !== "string") {
		console.error("ERROR: commit file is undefined!");
		process.exit(1); // Exit with a non-zero code to indicate failure
	}
	const git_dir = CONST.GIT_DIR; //__dirname + '/../../';
	const result = path.normalize(git_dir + "/" + commit_file);
	return result;
}
module.exports = {
	getCommitFilePath,
	// skipCheck() {
	//   const no_verify = process.argv[3];
	//   console.log('no verify is :: ', no_verify);
	//   return false;
	// },
	getCommit() {
		const commit_file = getCommitFilePath();
		try {
			const result = fs.readFileSync(commit_file, { encoding: "utf-8" });
			return result;
		} catch (e) {
			console.error(e);
			process.exit(1);
		}
	},
};
