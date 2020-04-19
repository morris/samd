function createMockWindow() {
  const window = {
    document: createMockElement({
      createElement(tagName) {
        return createMockElement({
          tagName
        });
      },
      createTextNode(text) {
        return createMockText(text);
      },
      children: [
        createMockElement({ tagName: 'head' }),
        createMockElement({ tagName: 'body' })
      ]
    }),

    setTimeout(callback, ms) {
      const id = setTimeout(() => {
        try {
          callback();
        } catch (err) {
          window.__uncaughtErrors.push(err);
        } finally {
          window.__timeouts.delete(id);
        }
      }, ms);

      window.__timeouts.add(id);

      return id;
    },

    clearTimeout(id) {
      clearTimeout(id);
      window.__timeouts.delete(id);
    },

    console: {
      warn(arg) {
        window.__warnings.push(arg);
      },
      debug(...args) {
        // eslint-disable-next-line no-console
        console.debug(...args);
      }
    },

    //

    __timeouts: new Set(),
    __uncaughtErrors: [],
    __warnings: [],
    __xhrSendCallbacks: [],

    __execScript(script) {
      window.document.currentScript = script;

      try {
        script.__exec();
      } catch (err) {
        window.__uncaughtErrors.push(err);
      } finally {
        window.document.currentScript = undefined;
      }
    },

    __onXhrSend(callback) {
      window.__xhrSendCallbacks.push(callback);
    }
  };

  window.document.body = window.document.children[1];

  window.XMLHttpRequest = class {
    open(method, url, async) {
      this.method = method;
      this.url = url;
      this.async = async;
    }

    send() {
      for (const callback of window.__xhrSendCallbacks) {
        callback(this);
      }
    }
  };

  return window;
}

function createMockScript(options) {
  const script = createMockElement({
    tagName: 'script',
    ...options
  });

  if (script.src) script.attributes.src = script.src;
  if (script.type) script.attributes.type = script.type;

  return script;
}

function createMockElement(options) {
  return {
    attributes: {},
    children: [],

    getAttribute(name) {
      return this.attributes[name];
    },

    getElementsByTagName(tagName) {
      const elements = [];

      for (const child of this.children) {
        if (child.tagName === tagName) elements.push(child);
        if (typeof child.getElementsByTagName === 'function') {
          elements.push(...child.getElementsByTagName(tagName));
        }
      }

      return elements;
    },

    appendChild(newNode) {
      this.children.push(newNode);
      this.lastChild = newNode;
    },

    ...options
  };
}

function createMockText(text) {
  return {
    text
  };
}

module.exports = { createMockWindow, createMockScript, createMockElement };
