import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { appendFileSync } from "node:fs";
import { EOL } from "node:os";

function getLatestTag() {
	try {
		return execSync("git describe --abbrev=0 --tags").toString().trim();
	} catch (e) {
		console.warn(e);
		return execSync("git rev-list --max-parents=0 HEAD").toString().trim();
	}
}

const commits = execSync(
	`git log ${getLatestTag()}..HEAD  --pretty="format:%s%b"`,
)
	.toString()
	.trim()
	.split("\n")
	.reverse();

console.log(getLatestTag(), commits);

const version = execSync("npm pkg get version").toString().replace(/"/gi, "");

const delimiter = `---${randomUUID()}---${EOL}`;

if (process.env.GITHUB_OUTPUT)
	appendFileSync(
		process.env.GITHUB_OUTPUT,
		`changelog<<${delimiter}${commits.join(
			EOL.repeat(2),
		)}${EOL}${delimiter}version=${version}${EOL}`,
	);
else console.log("Not github actions");
