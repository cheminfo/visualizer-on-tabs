import Tabs from './Tabs.js';

export default function iframeMessageHandler(data, [level2]) {
  let prom;
  switch (level2) {
    case 'open':
      Tabs.openTab(data.message);
      prom = Promise.resolve('done');
      break;
    case 'status':
      Tabs.status(data);
      prom = Promise.resolve('done');
      break;
    case 'message':
      Tabs.sendMessage(data.message);
      prom = Promise.resolve('done');
      break;
    case 'focus':
      Tabs.focus(data.message);
      prom = Promise.resolve('done');
      break;
    default:
      prom = Promise.reject(new Error(`Unknown action: ${level2}}`));
      break;
  }

  prom.then(
    (message) => {
      data.message = message.data;
      // the iframeMessageHandler callback's `this` is bound by the iframe-bridge library
      // eslint-disable-next-line no-invalid-this
      this.postMessage(data);
    },
    (error) => {
      data.status = 'error';
      data.message = error;
      // the iframeMessageHandler callback's `this` is bound by the iframe-bridge library
      // eslint-disable-next-line no-invalid-this
      this.postMessage(data);
    },
  );
}
