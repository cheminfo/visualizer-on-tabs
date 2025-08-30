# visualizer-on-tabs

Builds a static website that has multiple instances of the visualizer that can communicate with each other.

## CLI usage

```bash
npx visualizer-on-tabs --config=./config.json --outDir=./out
```

## Configuration

Example: https://github.com/cheminfo/cheminfo-server-setup/blob/master/doc/on-tabs/config.json

```js
const config = {
  // Title of the single page app
  title: 'My app',
  // List of default views to load
  possibleViews: {
    Home: {
      url: 'https://couch.cheminfo.org/cheminfo-public/158ef2f0cc85bfc5b4f2d88cff473e83/view.json',
    },
  },
  // Rules on how visualizer view URLs should be rewritten when a tab is opened
  rewriteRules: [
    {
      reg: '^([a-z0-9]+)\\?(.*)$',
      replace: 'https://couch.cheminfo.org/cheminfo-public/$1/view.json?$2',
    },
    {
      reg: '^[a-z0-9]+$',
      replace: 'https://couch.cheminfo.org/cheminfo-public/$&/view.json',
    },
    {
      reg: '^[a-z0-9]+/view.json\\?.*',
      replace: 'https://couch.cheminfo.org/cheminfo-public/$&',
    },
  ],
  // Setting this to true loads all the tabs (in possibleViews) on page load
  // It is discouraged to do this because loading hidden iframes
  // lead to layout issues. Especially in Firefox.
  // When false, only the selected tab is loaded.
  loadHidden: false,
  // The visualizer configuration object that will be passed to each visualizer instance
  visualizerConfig: undefined,
  // The version of the visualizer to load. By default it 'auto', which uses
  // the version stored in the loaded view.
  visualizerVersion: 'auto',
  // Options passed to `makeVisualizerPage`, see https://github.com/cheminfo/react-visualizer
  // Respectively `fallbackVersion` and `cdn`.
  visualizerFallbackVersion: undefined,
  visualizerCDN: undefined,
};
```

## Dev setup

Here is how you can test your changes in the visualizer-on-tabs react app.

### Build the page with a custom configuration

There is a dev configuration in `./dev.json`, which is used by local scripts to build a working visualizer-on-tabs app.

To build in dev mode with automatic rebuild, run:

```bash
npm run build:dev
```

To test the production build, run:

```bash
npm run build
```

To serve the files produced by the build, run:

```bash
npm run serve
```

## Install and configure visualizer-on-tabs

### Configure a flavor to deploy on-tabs

Edit the `flavorLayouts`(/usr/local/flavor-builder/config.json) to specify a deployment method for your flavor. For this, you need to add a new entry which key is your flavor name and value is `visualizer-on-tabs`. Example:

```
...
"flavorLayouts": {
    "720p": "minimal-simple-menu",
    "myflavor":"visualizer-on-tabs"
  }
  ...
```

Add a new rewriteRule

```
"visualizerOnTabs": {
    "_default": {
      "rocLogin": {
        "url": "https://myloginserver"
      },
      "rewriteRules": [
        {"reg": "^[^/]+$", "replace": "http://myserver.org/rest-on-couch/db/visualizer/$&/view.json"}
      ]
    }
    ...
```

You would need to edit a view in this flavor, or launch the build manually with the `--forceUpdate` option.
