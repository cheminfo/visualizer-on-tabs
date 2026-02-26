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
  // Roc login configuration. Don't set or set to false to disable login
  rocLogin: {
    // URL of the rest-on-couch server
    url: 'https://demo.scipeaks.com/roc',
    // Redirect after login
    redirect: 'https://demo.scipeaks.com/',
  },
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

  // Options related to https://github.com/cheminfo/react-visualizer
  visualizer: {
    /**
     * Options to generate the visualizer html page
     */
    loadversion: 'exact',
    fallbackVersion: 'latest',
    cdn: 'https://www.lactame.com/visualizer',

    /*
     * Props passed to the visualizer component
     */
    // Visualizer config.json
    config: undefined,
  },
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
