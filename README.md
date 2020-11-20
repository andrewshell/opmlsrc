# OPML Source
Command line tool to export source code from an opml outline.

Based on [nodeEditor example](http://this.how/frontier/nodeEditorExample.opml)

## Install Globally
```
npm install -g @andrewshell/opmlsrc
```

## Test with davefilesystem.opml

You'll want to have a properly formatted OPML file like [davefilesystem.opml](http://code.shll.me/davefilesystem.opml?format=opml).

Calling `opmlsrc <filename>` will process the file into the current directory.

### Example

```
cd ~
mkdir davefilesystem
cd davefilesystem
wget http://code.shll.me/davefilesystem.opml?format=opml -O davefilesystem.opml
opmlsrc davefilesystem.opml
ls -la
```

You should see something like:

```
total 48
drwxr-xr-x   7 andrewshell  staff   224 Nov 20 13:55 .
drwxr-xr-x+ 93 andrewshell  staff  2976 Nov 20 13:54 ..
-rw-r--r--   1 andrewshell  staff  5396 Nov 20 13:55 davefilesystem.opml
-rw-r--r--   1 andrewshell  staff  5532 Nov 20 13:55 filesystem.js
-rw-r--r--   1 andrewshell  staff   351 Nov 20 13:55 package.json
-rw-r--r--   1 andrewshell  staff   577 Nov 20 13:55 readme.md
drwxr-xr-x   4 andrewshell  staff   128 Nov 20 13:55 testing
```

## Watching during development

If you're actively working on a project you might want the files to be updated when you update the outline.  Do do this just add the `--watch` flag to your call.

```
opmlsrc davefilesystem.opml --watch
```

## Supports includes

If you look in `davefilesystem.opml` you'll see the line:

```
[[http://fargo.io/code/node/shared/fs.js]]
```

This is an include. We will fetch this document and replace that block with the file contents.

When you're watching an outline with includes in it, I try to be helpful and cache the file in memory.  On every build we re-request this document with the last etag and if we get back a status 304 Not Modified than we use the local cache.

### Local includes

In addition to specifying a full URL, you can include local files by using the `file:` prefix like this:

```
[[file:package.json]]
```

It will try to find your file based on the location of the opml file you're processing.

## Ignores comments

If your OPML file has an outline with the attribute isComment=true, we will ignore that branch and it will not end up in the rendered file.
