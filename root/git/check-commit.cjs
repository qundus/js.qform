// Read the commit message from the command line arguments
const CONST = require("./const.cjs");
const methods = require("./methods.cjs");
// const no_check = methods.skipCheck();
//
// if (no_check) {
//   process.exit(0);
// }

const commit = methods.getCommit();

// Define the regex pattern for conventional commit format
// const pattern = /^(feat|fix|docs|style|refactor|test|chore)\(?.*\)?: .+$/;
const pattern = new RegExp(`^(${CONST.COMMIT_PREFIXES?.join("|")}):.*`);
// Check if the commit message matches the pattern

if (!pattern.test(commit)) {
	console.error(
		"Lefthook: commit message does not start with the conventional prefixes :: ",
		CONST.COMMIT_PREFIXES,
	);
	console.error("Lefthook: example feat: description");
	process.exit(1); // Exit with a non-zero code to indicate failure
}

// If the message is valid, exit with success
process.exit(0);
