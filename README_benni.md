## Publishing a new version

* Increment version number in `package.json`
* Run `npm publish`

## Use the new version in the VM

* On my machine: `cd ba/src && yarn upgrade`
* `ssh root@134.169.32.26 -p 2038`
* `cd /root/ba/src`
* `yarn`
