# visualizer-on-tabs
Builds a static website that has multiple instances of the visualizer that can communicate with each other.

## Install and configure visualizer-on-tabs

### Clone visualizer-on-tabs

Clone the github project in your prefered location. In this example let's use /usr/local/node/

```bash
cd usr/local/node/
git clone https://github.com/cheminfo/visualizer-on-tabs.git
cd visualizer-on-tabs
npm install
```

### Choose your configuration

If you want to override the default behavior of visualizer-on-tabs, you have to add a custom.json with your custom preferences in /usr/local/on-tabs-config/custom.json. Here there is an [example](https://github.com/cheminfo/cheminfo-server-setup/blob/master/doc/on-tabs/custom.json)

### Build the project on your default apache websites directory

```bash
node bin/build.js --outDir=/var/www/html/on-tabs/ --config=/usr/local/on-tabs-config/custom.json
```

Now you try it in: www.myserver.com/on-tabs/
