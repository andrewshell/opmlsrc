const packagejson = require('./package.json');
const myProductName = packagejson.name, myVersion = packagejson.version;

exports.run = run;

// requires
	const crypto = require('crypto');
	const fetch = require('node-fetch');
	const fs = require('fs');
	const md5File = require('md5-file');
	const opmlToJson = require('opml-to-json');
	const path = require('path');
const etags = {}
const includeCache = {};

function exportFilesFromOpml (opmlsrc) {
	if (!fs.existsSync(opmlsrc)) {
		console.error('not found: ' + opmlsrc);
		return;
		}
	const opmltext = fs.readFileSync(opmlsrc, 'utf8');
	opmlToJson(opmltext, function (err, json) {
		const packroot = json.children[0];
		const filenodes = packroot.children;
		filenodes.forEach(saveFile)
		});
	}
function saveFile (filenode) {
	const filename = filenode.text;
	if (filename.length === 0 || !filenode.children) {
		return;
		}
	renderBody (filenode.children, 0)
		.then (function (body) {
			writeFileIfChanged (filename, body);
			});
	}
async function renderBody (children, tabs) {
	let body = '', line;
	for (line of children) {
		if (line.iscomment) {
			continue;
			}
		line.text = await processIncludes (line.text);
		body += "\t".repeat(tabs) + line.text + "\n";
		if (line.children) {
			body += await renderBody(line.children, tabs + 1);
			}
		}
	return body;
	}
async function processIncludes (text) {
	const match = text.match (new RegExp('^\\[\\[(.*)\\]\\]$'));
	if (match) {
		const url = match[1];
		const options = {};
		const etag = etags[url];
		if (etag && includeCache[url + etag]) {
			options.headers = {
				"If-None-Match": etag
				};
			}
		const res = await fetch(url, options);
		if (res.status === 304) {
			text = includeCache [url + etag];
			}
		if (res.status === 200) {
			console.log('Fetching: ' + url);
			text = res.text();
			const resEtag = res.headers.get('Etag');
			if (resEtag) {
				includeCache[url + resEtag] = text;
				etags[url] = resEtag;
				}
			}
		}
	return text;
	}
function writeFileIfChanged (filename, body) {
	const bodyhash = crypto.createHash('md5').update(body).digest("hex");
	const dirname = path.dirname (filename);
	if (dirname.length > 0 && !fs.existsSync(dirname)) {
		fs.mkdirSync(dirname, { recursive: true });
		}
	if (!fs.existsSync (filename) || bodyhash !== md5File.sync (filename)) {
		console.log (filename);
		fs.writeFileSync (filename, body, 'utf8');
		}
	}
function run (opmlsrc, watch = false) {
	if (watch) {
		console.log('Watching ' + opmlsrc + '...');
		let timeout;
		exportFilesFromOpml(opmlsrc); // Run once right away
		fs.watch (opmlsrc, function () {
			clearTimeout (timeout);
			timeout = setTimeout (exportFilesFromOpml, 1000, opmlsrc);
			})
		}
	else {
		exportFilesFromOpml (opmlsrc);
		}
	}
