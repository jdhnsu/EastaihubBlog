var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// .wrangler/tmp/bundle-CxR2uj/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input2, init) {
  const request = new Request(input2, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form2 = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form2[key] = value;
    } else {
      handleParsingAllValues(form2, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form2).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form2, key, value);
        delete form2[key];
      }
    });
  }
  return form2;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form2, key, value) => {
  if (form2[key] !== void 0) {
    if (Array.isArray(form2[key])) {
      ;
      form2[key].push(value);
    } else {
      form2[key] = [form2[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form2[key] = value;
    } else {
      form2[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form2, key, value) => {
  let nestedForm = form2;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");

// node_modules/hono/dist/utils/url.js
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
var HonoRequest = /* @__PURE__ */ __name(class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return this.bodyCache.parsedBody ??= await parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
}, "HonoRequest");

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var escapeRe = /[&<>'"]/;
var stringBufferToString = /* @__PURE__ */ __name(async (buffer, callbacks) => {
  let str = "";
  callbacks ||= [];
  const resolvedBuffer = await Promise.all(buffer);
  for (let i = resolvedBuffer.length - 1; ; i--) {
    str += resolvedBuffer[i];
    i--;
    if (i < 0) {
      break;
    }
    let r = resolvedBuffer[i];
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    const isEscaped = r.isEscaped;
    r = await (typeof r === "object" ? r.toString() : r);
    if (typeof r === "object") {
      callbacks.push(...r.callbacks || []);
    }
    if (r.isEscaped ?? isEscaped) {
      str += r;
    } else {
      const buf = [str];
      escapeToBuffer(r, buf);
      str = buf[0];
    }
  }
  return raw(str, callbacks);
}, "stringBufferToString");
var escapeToBuffer = /* @__PURE__ */ __name((str, buffer) => {
  const match2 = str.search(escapeRe);
  if (match2 === -1) {
    buffer[0] += str;
    return;
  }
  let escape;
  let index;
  let lastIndex = 0;
  for (index = match2; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escape = "&quot;";
        break;
      case 39:
        escape = "&#39;";
        break;
      case 38:
        escape = "&amp;";
        break;
      case 60:
        escape = "&lt;";
        break;
      case 62:
        escape = "&gt;";
        break;
      default:
        continue;
    }
    buffer[0] += str.substring(lastIndex, index) + escape;
    lastIndex = index + 1;
  }
  buffer[0] += str.substring(lastIndex, index);
}, "escapeToBuffer");
var resolveCallbackSync = /* @__PURE__ */ __name((str) => {
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return str;
  }
  const buffer = [str];
  const context = {};
  callbacks.forEach((c) => c({ phase: HtmlEscapedCallbackPhase.Stringify, buffer, context }));
  return buffer[0];
}, "resolveCallbackSync");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var Context = /* @__PURE__ */ __name(class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= new Response(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = new Response(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = new Response(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return new Response(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html2, arg, headers) => {
    const res = /* @__PURE__ */ __name((html22) => this.#newResponse(html22, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html2 === "object" ? resolveCallback(html2, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html2);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => new Response();
    return this.#notFoundHandler(this);
  };
}, "Context");

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input2, requestInit, Env, executionCtx) => {
    if (input2 instanceof Request) {
      return this.fetch(requestInit ? new Request(input2, requestInit) : input2, Env, executionCtx);
    }
    input2 = input2.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input2) ? input2 : `http://localhost${mergePath("/", input2)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// node_modules/hono/dist/jsx/constants.js
var DOM_RENDERER = /* @__PURE__ */ Symbol("RENDERER");
var DOM_ERROR_HANDLER = /* @__PURE__ */ Symbol("ERROR_HANDLER");
var DOM_INTERNAL_TAG = /* @__PURE__ */ Symbol("INTERNAL");
var PERMALINK = /* @__PURE__ */ Symbol("PERMALINK");

// node_modules/hono/dist/jsx/dom/utils.js
var setInternalTagFlag = /* @__PURE__ */ __name((fn) => {
  ;
  fn[DOM_INTERNAL_TAG] = true;
  return fn;
}, "setInternalTagFlag");

// node_modules/hono/dist/jsx/dom/context.js
var createContextProviderFunction = /* @__PURE__ */ __name((values) => ({ value, children }) => {
  if (!children) {
    return void 0;
  }
  const props = {
    children: [
      {
        tag: setInternalTagFlag(() => {
          values.push(value);
        }),
        props: {}
      }
    ]
  };
  if (Array.isArray(children)) {
    props.children.push(...children.flat());
  } else {
    props.children.push(children);
  }
  props.children.push({
    tag: setInternalTagFlag(() => {
      values.pop();
    }),
    props: {}
  });
  const res = { tag: "", props, type: "" };
  res[DOM_ERROR_HANDLER] = (err) => {
    values.pop();
    throw err;
  };
  return res;
}, "createContextProviderFunction");

// node_modules/hono/dist/jsx/context.js
var globalContexts = [];
var createContext = /* @__PURE__ */ __name((defaultValue) => {
  const values = [defaultValue];
  const context = /* @__PURE__ */ __name((props) => {
    values.push(props.value);
    let string;
    try {
      string = props.children ? (Array.isArray(props.children) ? new JSXFragmentNode("", {}, props.children) : props.children).toString() : "";
    } finally {
      values.pop();
    }
    if (string instanceof Promise) {
      return string.then((resString) => raw(resString, resString.callbacks));
    } else {
      return raw(string);
    }
  }, "context");
  context.values = values;
  context.Provider = context;
  context[DOM_RENDERER] = createContextProviderFunction(values);
  globalContexts.push(context);
  return context;
}, "createContext");
var useContext = /* @__PURE__ */ __name((context) => {
  return context.values.at(-1);
}, "useContext");

// node_modules/hono/dist/jsx/intrinsic-element/common.js
var deDupeKeyMap = {
  title: [],
  script: ["src"],
  style: ["data-href"],
  link: ["href"],
  meta: ["name", "httpEquiv", "charset", "itemProp"]
};
var domRenderers = {};
var dataPrecedenceAttr = "data-precedence";

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var components_exports = {};
__export(components_exports, {
  button: () => button,
  form: () => form,
  input: () => input,
  link: () => link,
  meta: () => meta,
  script: () => script,
  style: () => style,
  title: () => title
});

// node_modules/hono/dist/jsx/children.js
var toArray = /* @__PURE__ */ __name((children) => Array.isArray(children) ? children : [children], "toArray");

// node_modules/hono/dist/jsx/intrinsic-element/components.js
var metaTagMap = /* @__PURE__ */ new WeakMap();
var insertIntoHead = /* @__PURE__ */ __name((tagName, tag, props, precedence) => ({ buffer, context }) => {
  if (!buffer) {
    return;
  }
  const map = metaTagMap.get(context) || {};
  metaTagMap.set(context, map);
  const tags = map[tagName] ||= [];
  let duped = false;
  const deDupeKeys = deDupeKeyMap[tagName];
  if (deDupeKeys.length > 0) {
    LOOP:
      for (const [, tagProps] of tags) {
        for (const key of deDupeKeys) {
          if ((tagProps?.[key] ?? null) === props?.[key]) {
            duped = true;
            break LOOP;
          }
        }
      }
  }
  if (duped) {
    buffer[0] = buffer[0].replaceAll(tag, "");
  } else if (deDupeKeys.length > 0) {
    tags.push([tag, props, precedence]);
  } else {
    tags.unshift([tag, props, precedence]);
  }
  if (buffer[0].indexOf("</head>") !== -1) {
    let insertTags;
    if (precedence === void 0) {
      insertTags = tags.map(([tag2]) => tag2);
    } else {
      const precedences = [];
      insertTags = tags.map(([tag2, , precedence2]) => {
        let order = precedences.indexOf(precedence2);
        if (order === -1) {
          precedences.push(precedence2);
          order = precedences.length - 1;
        }
        return [tag2, order];
      }).sort((a, b) => a[1] - b[1]).map(([tag2]) => tag2);
    }
    insertTags.forEach((tag2) => {
      buffer[0] = buffer[0].replaceAll(tag2, "");
    });
    buffer[0] = buffer[0].replace(/(?=<\/head>)/, insertTags.join(""));
  }
}, "insertIntoHead");
var returnWithoutSpecialBehavior = /* @__PURE__ */ __name((tag, children, props) => raw(new JSXNode(tag, props, toArray(children ?? [])).toString()), "returnWithoutSpecialBehavior");
var documentMetadataTag = /* @__PURE__ */ __name((tag, children, props, sort) => {
  if ("itemProp" in props) {
    return returnWithoutSpecialBehavior(tag, children, props);
  }
  let { precedence, blocking, ...restProps } = props;
  precedence = sort ? precedence ?? "" : void 0;
  if (sort) {
    restProps[dataPrecedenceAttr] = precedence;
  }
  const string = new JSXNode(tag, restProps, toArray(children || [])).toString();
  if (string instanceof Promise) {
    return string.then(
      (resString) => raw(string, [
        ...resString.callbacks || [],
        insertIntoHead(tag, resString, restProps, precedence)
      ])
    );
  } else {
    return raw(string, [insertIntoHead(tag, string, restProps, precedence)]);
  }
}, "documentMetadataTag");
var title = /* @__PURE__ */ __name(({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2) {
    const context = useContext(nameSpaceContext2);
    if (context === "svg" || context === "head") {
      return new JSXNode(
        "title",
        props,
        toArray(children ?? [])
      );
    }
  }
  return documentMetadataTag("title", children, props, false);
}, "title");
var script = /* @__PURE__ */ __name(({
  children,
  ...props
}) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (["src", "async"].some((k) => !props[k]) || nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("script", children, props);
  }
  return documentMetadataTag("script", children, props, false);
}, "script");
var style = /* @__PURE__ */ __name(({
  children,
  ...props
}) => {
  if (!["href", "precedence"].every((k) => k in props)) {
    return returnWithoutSpecialBehavior("style", children, props);
  }
  props["data-href"] = props.href;
  delete props.href;
  return documentMetadataTag("style", children, props, true);
}, "style");
var link = /* @__PURE__ */ __name(({ children, ...props }) => {
  if (["onLoad", "onError"].some((k) => k in props) || props.rel === "stylesheet" && (!("precedence" in props) || "disabled" in props)) {
    return returnWithoutSpecialBehavior("link", children, props);
  }
  return documentMetadataTag("link", children, props, "precedence" in props);
}, "link");
var meta = /* @__PURE__ */ __name(({ children, ...props }) => {
  const nameSpaceContext2 = getNameSpaceContext();
  if (nameSpaceContext2 && useContext(nameSpaceContext2) === "head") {
    return returnWithoutSpecialBehavior("meta", children, props);
  }
  return documentMetadataTag("meta", children, props, false);
}, "meta");
var newJSXNode = /* @__PURE__ */ __name((tag, { children, ...props }) => (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new JSXNode(tag, props, toArray(children ?? []))
), "newJSXNode");
var form = /* @__PURE__ */ __name((props) => {
  if (typeof props.action === "function") {
    props.action = PERMALINK in props.action ? props.action[PERMALINK] : void 0;
  }
  return newJSXNode("form", props);
}, "form");
var formActionableElement = /* @__PURE__ */ __name((tag, props) => {
  if (typeof props.formAction === "function") {
    props.formAction = PERMALINK in props.formAction ? props.formAction[PERMALINK] : void 0;
  }
  return newJSXNode(tag, props);
}, "formActionableElement");
var input = /* @__PURE__ */ __name((props) => formActionableElement("input", props), "input");
var button = /* @__PURE__ */ __name((props) => formActionableElement("button", props), "button");

// node_modules/hono/dist/jsx/utils.js
var normalizeElementKeyMap = /* @__PURE__ */ new Map([
  ["className", "class"],
  ["htmlFor", "for"],
  ["crossOrigin", "crossorigin"],
  ["httpEquiv", "http-equiv"],
  ["itemProp", "itemprop"],
  ["fetchPriority", "fetchpriority"],
  ["noModule", "nomodule"],
  ["formAction", "formaction"]
]);
var normalizeIntrinsicElementKey = /* @__PURE__ */ __name((key) => normalizeElementKeyMap.get(key) || key, "normalizeIntrinsicElementKey");
var styleObjectForEach = /* @__PURE__ */ __name((style2, fn) => {
  for (const [k, v] of Object.entries(style2)) {
    const key = k[0] === "-" || !/[A-Z]/.test(k) ? k : k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
    fn(
      key,
      v == null ? null : typeof v === "number" ? !key.match(
        /^(?:a|border-im|column(?:-c|s)|flex(?:$|-[^b])|grid-(?:ar|[^a])|font-w|li|or|sca|st|ta|wido|z)|ty$/
      ) ? `${v}px` : `${v}` : v
    );
  }
}, "styleObjectForEach");

// node_modules/hono/dist/jsx/base.js
var nameSpaceContext = void 0;
var getNameSpaceContext = /* @__PURE__ */ __name(() => nameSpaceContext, "getNameSpaceContext");
var toSVGAttributeName = /* @__PURE__ */ __name((key) => /[A-Z]/.test(key) && // Presentation attributes are findable in style object. "clip-path", "font-size", "stroke-width", etc.
// Or other un-deprecated kebab-case attributes. "overline-position", "paint-order", "strikethrough-position", etc.
key.match(
  /^(?:al|basel|clip(?:Path|Rule)$|co|do|fill|fl|fo|gl|let|lig|i|marker[EMS]|o|pai|pointe|sh|st[or]|text[^L]|tr|u|ve|w)/
) ? key.replace(/([A-Z])/g, "-$1").toLowerCase() : key, "toSVGAttributeName");
var emptyTags = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];
var booleanAttributes = [
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "download",
  "formnovalidate",
  "hidden",
  "inert",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "playsinline",
  "readonly",
  "required",
  "reversed",
  "selected"
];
var childrenToStringToBuffer = /* @__PURE__ */ __name((children, buffer) => {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i];
    if (typeof child === "string") {
      escapeToBuffer(child, buffer);
    } else if (typeof child === "boolean" || child === null || child === void 0) {
      continue;
    } else if (child instanceof JSXNode) {
      child.toStringToBuffer(buffer);
    } else if (typeof child === "number" || child.isEscaped) {
      ;
      buffer[0] += child;
    } else if (child instanceof Promise) {
      buffer.unshift("", child);
    } else {
      childrenToStringToBuffer(child, buffer);
    }
  }
}, "childrenToStringToBuffer");
var JSXNode = /* @__PURE__ */ __name(class {
  tag;
  props;
  key;
  children;
  isEscaped = true;
  localContexts;
  constructor(tag, props, children) {
    this.tag = tag;
    this.props = props;
    this.children = children;
  }
  get type() {
    return this.tag;
  }
  // Added for compatibility with libraries that rely on React's internal structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get ref() {
    return this.props.ref || null;
  }
  toString() {
    const buffer = [""];
    this.localContexts?.forEach(([context, value]) => {
      context.values.push(value);
    });
    try {
      this.toStringToBuffer(buffer);
    } finally {
      this.localContexts?.forEach(([context]) => {
        context.values.pop();
      });
    }
    return buffer.length === 1 ? "callbacks" in buffer ? resolveCallbackSync(raw(buffer[0], buffer.callbacks)).toString() : buffer[0] : stringBufferToString(buffer, buffer.callbacks);
  }
  toStringToBuffer(buffer) {
    const tag = this.tag;
    const props = this.props;
    let { children } = this;
    buffer[0] += `<${tag}`;
    const normalizeKey = nameSpaceContext && useContext(nameSpaceContext) === "svg" ? (key) => toSVGAttributeName(normalizeIntrinsicElementKey(key)) : (key) => normalizeIntrinsicElementKey(key);
    for (let [key, v] of Object.entries(props)) {
      key = normalizeKey(key);
      if (key === "children") {
      } else if (key === "style" && typeof v === "object") {
        let styleStr = "";
        styleObjectForEach(v, (property, value) => {
          if (value != null) {
            styleStr += `${styleStr ? ";" : ""}${property}:${value}`;
          }
        });
        buffer[0] += ' style="';
        escapeToBuffer(styleStr, buffer);
        buffer[0] += '"';
      } else if (typeof v === "string") {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v, buffer);
        buffer[0] += '"';
      } else if (v === null || v === void 0) {
      } else if (typeof v === "number" || v.isEscaped) {
        buffer[0] += ` ${key}="${v}"`;
      } else if (typeof v === "boolean" && booleanAttributes.includes(key)) {
        if (v) {
          buffer[0] += ` ${key}=""`;
        }
      } else if (key === "dangerouslySetInnerHTML") {
        if (children.length > 0) {
          throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
        }
        children = [raw(v.__html)];
      } else if (v instanceof Promise) {
        buffer[0] += ` ${key}="`;
        buffer.unshift('"', v);
      } else if (typeof v === "function") {
        if (!key.startsWith("on") && key !== "ref") {
          throw new Error(`Invalid prop '${key}' of type 'function' supplied to '${tag}'.`);
        }
      } else {
        buffer[0] += ` ${key}="`;
        escapeToBuffer(v.toString(), buffer);
        buffer[0] += '"';
      }
    }
    if (emptyTags.includes(tag) && children.length === 0) {
      buffer[0] += "/>";
      return;
    }
    buffer[0] += ">";
    childrenToStringToBuffer(children, buffer);
    buffer[0] += `</${tag}>`;
  }
}, "JSXNode");
var JSXFunctionNode = /* @__PURE__ */ __name(class extends JSXNode {
  toStringToBuffer(buffer) {
    const { children } = this;
    const props = { ...this.props };
    if (children.length) {
      props.children = children.length === 1 ? children[0] : children;
    }
    const res = this.tag.call(null, props);
    if (typeof res === "boolean" || res == null) {
      return;
    } else if (res instanceof Promise) {
      if (globalContexts.length === 0) {
        buffer.unshift("", res);
      } else {
        const currentContexts = globalContexts.map((c) => [c, c.values.at(-1)]);
        buffer.unshift(
          "",
          res.then((childRes) => {
            if (childRes instanceof JSXNode) {
              childRes.localContexts = currentContexts;
            }
            return childRes;
          })
        );
      }
    } else if (res instanceof JSXNode) {
      res.toStringToBuffer(buffer);
    } else if (typeof res === "number" || res.isEscaped) {
      buffer[0] += res;
      if (res.callbacks) {
        buffer.callbacks ||= [];
        buffer.callbacks.push(...res.callbacks);
      }
    } else {
      escapeToBuffer(res, buffer);
    }
  }
}, "JSXFunctionNode");
var JSXFragmentNode = /* @__PURE__ */ __name(class extends JSXNode {
  toStringToBuffer(buffer) {
    childrenToStringToBuffer(this.children, buffer);
  }
}, "JSXFragmentNode");
var initDomRenderer = false;
var jsxFn = /* @__PURE__ */ __name((tag, props, children) => {
  if (!initDomRenderer) {
    for (const k in domRenderers) {
      ;
      components_exports[k][DOM_RENDERER] = domRenderers[k];
    }
    initDomRenderer = true;
  }
  if (typeof tag === "function") {
    return new JSXFunctionNode(tag, props, children);
  } else if (components_exports[tag]) {
    return new JSXFunctionNode(
      components_exports[tag],
      props,
      children
    );
  } else if (tag === "svg" || tag === "head") {
    nameSpaceContext ||= createContext("");
    return new JSXNode(tag, props, [
      new JSXFunctionNode(
        nameSpaceContext,
        {
          value: tag
        },
        children
      )
    ]);
  } else {
    return new JSXNode(tag, props, children);
  }
}, "jsxFn");

// node_modules/hono/dist/jsx/jsx-dev-runtime.js
function jsxDEV(tag, props, key) {
  let node;
  if (!props || !("children" in props)) {
    node = jsxFn(tag, props, []);
  } else {
    const children = props.children;
    node = Array.isArray(children) ? jsxFn(tag, props, children) : jsxFn(tag, props, [children]);
  }
  node.key = key;
  return node;
}
__name(jsxDEV, "jsxDEV");

// src/renderer.tsx
var Layout = /* @__PURE__ */ __name((props) => {
  return /* @__PURE__ */ jsxDEV("html", { lang: "zh-CN", children: [
    /* @__PURE__ */ jsxDEV("head", { children: [
      /* @__PURE__ */ jsxDEV("meta", { charset: "utf-8" }),
      /* @__PURE__ */ jsxDEV("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
      /* @__PURE__ */ jsxDEV("title", { children: props.title ? `${props.title} - CNU AI Game Lab` : "CNU\u5B66\u9662\u4EBA\u5DE5\u667A\u80FD\u6E38\u620F\u5B9E\u9A8C\u5BA4(Eastaihub)" }),
      /* @__PURE__ */ jsxDEV("meta", { name: "description", content: props.metaDescription || "\u63A2\u7D22AI\u4E0E\u6E38\u620F\u5F00\u53D1\u7684\u521B\u65B0\u878D\u5408" }),
      /* @__PURE__ */ jsxDEV("link", { rel: "stylesheet", href: "/style.css" }),
      /* @__PURE__ */ jsxDEV("link", { href: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css", rel: "stylesheet" })
    ] }),
    /* @__PURE__ */ jsxDEV("body", { children: [
      /* @__PURE__ */ jsxDEV("div", { id: "heaptop", children: /* @__PURE__ */ jsxDEV("div", { id: "mission-statement", children: "\u6B22\u8FCE\u6765\u5230AI\u6E38\u620F\u5B9E\u9A8C\u5BA4\u535A\u5BA2" }) }),
      /* @__PURE__ */ jsxDEV("header", { id: "header", children: /* @__PURE__ */ jsxDEV("div", { className: "header-inner", children: /* @__PURE__ */ jsxDEV("div", { className: "logo-text", children: [
        /* @__PURE__ */ jsxDEV("h1", { children: /* @__PURE__ */ jsxDEV("a", { href: "/", children: "CNU\u5B66\u9662\u4EBA\u5DE5\u667A\u80FD\u6E38\u620F\u5B9E\u9A8C\u5BA4(Eastaihub)" }) }),
        /* @__PURE__ */ jsxDEV("p", { className: "subtitle", children: "\u63A2\u7D22AI\u4E0E\u6E38\u620F\u5F00\u53D1\u7684\u521B\u65B0\u878D\u5408" })
      ] }) }) }),
      /* @__PURE__ */ jsxDEV("div", { id: "navigation", children: /* @__PURE__ */ jsxDEV("ul", { children: [
        /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/", children: "\u9996\u9875" }) }),
        /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/tags", children: "\u5206\u7C7B\u6807\u7B7E" }) })
      ] }) }),
      /* @__PURE__ */ jsxDEV("div", { id: "main-container", children: [
        /* @__PURE__ */ jsxDEV("div", { id: "content", children: props.children }),
        /* @__PURE__ */ jsxDEV("aside", { id: "sidebar", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "sidebar-module", children: /* @__PURE__ */ jsxDEV("form", { action: "/search", method: "get", className: "search-form", children: [
            /* @__PURE__ */ jsxDEV("input", { type: "text", name: "q", placeholder: "\u641C\u7D22AI/\u6E38\u620F\u5F00\u53D1\u76F8\u5173\u5185\u5BB9" }),
            /* @__PURE__ */ jsxDEV("button", { type: "submit", children: "\u641C\u7D22" })
          ] }) }),
          /* @__PURE__ */ jsxDEV("div", { className: "sidebar-module", children: [
            /* @__PURE__ */ jsxDEV("h3", { children: "\u5B9E\u9A8C\u5BA4\u7B80\u4ECB" }),
            /* @__PURE__ */ jsxDEV("p", { children: "CNU\u5B66\u9662eastaihub\u4EBA\u5DE5\u667A\u80FD\u6E38\u620F\u5B9E\u9A8C\u5BA4\u81F4\u529B\u4E8E\u63A2\u7D22\u4EBA\u5DE5\u667A\u80FD\u6280\u672F\u5728\u6E38\u620F\u5F00\u53D1\u4E2D\u7684\u524D\u6CBF\u5E94\u7528\u3002\u6211\u4EEC\u5173\u6CE8\u751F\u6210\u5F0FAI\u3001\u5F3A\u5316\u5B66\u4E60\u4EE3\u7406\u4EE5\u53CA\u667A\u80FDNPC\u884C\u4E3A\u8BBE\u8BA1\u3002" })
          ] }),
          /* @__PURE__ */ jsxDEV("div", { className: "sidebar-module", children: [
            /* @__PURE__ */ jsxDEV("h3", { children: "\u8054\u7CFB\u6211\u4EEC" }),
            /* @__PURE__ */ jsxDEV("p", { children: "Email: Jdhuan@eastaihub.cloud" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxDEV("div", { id: "footer", children: [
        /* @__PURE__ */ jsxDEV("p", { children: [
          "\xA9 2025 CNU\u5B66\u9662eastaihub\u4EBA\u5DE5\u667A\u80FD\u6E38\u620F\u5B9E\u9A8C\u5BA4 \u7248\u6743\u6240\u6709\u3002",
          /* @__PURE__ */ jsxDEV("br", {})
        ] }),
        /* @__PURE__ */ jsxDEV("p", { children: "Generated with Cloudflare Workers & Hono." })
      ] }),
      /* @__PURE__ */ jsxDEV("script", { src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" }),
      /* @__PURE__ */ jsxDEV("script", { src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js" })
    ] })
  ] });
}, "Layout");
var DEFAULT_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%23aaa'%3ECover%3C/text%3E%3C/svg%3E";
var PostCard = /* @__PURE__ */ __name(({ post }) => /* @__PURE__ */ jsxDEV("div", { class: "post-card", children: [
  post.featured_image && /* @__PURE__ */ jsxDEV("div", { class: "post-cover", children: /* @__PURE__ */ jsxDEV(
    "img",
    {
      src: post.featured_image,
      alt: post.title,
      loading: "lazy",
      width: "200",
      height: "200",
      onError: `this.onerror=null;this.src='${DEFAULT_COVER}';`
    }
  ) }),
  /* @__PURE__ */ jsxDEV("div", { class: "post-content", children: [
    /* @__PURE__ */ jsxDEV("h3", { children: /* @__PURE__ */ jsxDEV("a", { href: `/post/${post.slug}`, children: post.title }) }),
    /* @__PURE__ */ jsxDEV("div", { class: "meta", children: [
      /* @__PURE__ */ jsxDEV("span", { class: "date", children: new Date(post.date).toLocaleDateString() }),
      post.tags && post.tags.length > 0 && /* @__PURE__ */ jsxDEV("span", { class: "tags", children: [
        " | Tags: ",
        post.tags.join(", ")
      ] })
    ] }),
    /* @__PURE__ */ jsxDEV("p", { children: post.excerpt })
  ] })
] }), "PostCard");

// src/content.json
var content_default = {
  posts: [
    {
      slug: "Python_Manage",
      title: "Python \u9879\u76EE\u7BA1\u7406\u5165\u95E8",
      date: "2025-10-10T11:02:53.000Z",
      tags: [
        "\u8BA1\u7B97\u673A\u57FA\u7840"
      ],
      excerpt: " Python \u9879\u76EE\u7BA1\u7406\u5165\u95E8\r\n> \u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684 Python \u9879\u76EE\u7BA1\u7406\u5165\u95E8\u6559\u7A0B\u3002\r\n\r\n\u505A\u9879\u76EE\u5C31\u50CF\u517B\u4E00\u68F5\u6811\uFF1A\u79CD\u4E0B\u6E90\u7801\uFF08seed\uFF09\uFF0C\u9010\u6B65\u65BD\u80A5\uFF08\u4F9D\u8D56\u3001\u6D4B\u8BD5\u3001CI\uFF09\uFF0C\u6700\u7EC8\u6536\u83B7\u679C\u5B9E\uFF08\u53EF\u4EA4\u4ED8\u7684\u8F6F\u4EF6\uFF09\u3002\u7F3A\u5C11\u9879\u76EE\u7BA1\u7406\uFF0C\u4F60\u7684\u4EE3\u7801\u4F1A\u50CF\u6742\u8349\u4E1B\u751F\u2014\u2014\u4F9D\u8D56\u51B2\u7A81\u3001\u73AF\u5883\u4E0D\u53EF\u590D\u73B0\u3001\u90E8\u7F72\u53CD\u590D\u5931\u8D25\u3002\u826F\u597D\u7684\u9879\u76EE\u7BA1\u7406\u80FD\u8BA9\u4F60\u5728\u5B66\u672F\u6216\u5DE5\u7A0B\u9879\u76EE\u4E2D\u66F4\u5FEB\u5730\u590D\u73B0\u7ED3\u679C\u3001\u5171\u4EAB\u73AF\u5883\u3001\u5B9A\u4F4D\u95EE\u9898\uFF0C\u4E5F\u80FD\u8BA9\u56E2\u961F\u534F\u4F5C\u66F4\u987A\u7545\u3002\r\n\r\n\u672C...",
      content: '<h1>Python \u9879\u76EE\u7BA1\u7406\u5165\u95E8</h1>\n<blockquote>\n<p>\u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684 Python \u9879\u76EE\u7BA1\u7406\u5165\u95E8\u6559\u7A0B\u3002</p>\n</blockquote>\n<p>\u505A\u9879\u76EE\u5C31\u50CF\u517B\u4E00\u68F5\u6811\uFF1A\u79CD\u4E0B\u6E90\u7801\uFF08seed\uFF09\uFF0C\u9010\u6B65\u65BD\u80A5\uFF08\u4F9D\u8D56\u3001\u6D4B\u8BD5\u3001CI\uFF09\uFF0C\u6700\u7EC8\u6536\u83B7\u679C\u5B9E\uFF08\u53EF\u4EA4\u4ED8\u7684\u8F6F\u4EF6\uFF09\u3002\u7F3A\u5C11\u9879\u76EE\u7BA1\u7406\uFF0C\u4F60\u7684\u4EE3\u7801\u4F1A\u50CF\u6742\u8349\u4E1B\u751F\u2014\u2014\u4F9D\u8D56\u51B2\u7A81\u3001\u73AF\u5883\u4E0D\u53EF\u590D\u73B0\u3001\u90E8\u7F72\u53CD\u590D\u5931\u8D25\u3002\u826F\u597D\u7684\u9879\u76EE\u7BA1\u7406\u80FD\u8BA9\u4F60\u5728\u5B66\u672F\u6216\u5DE5\u7A0B\u9879\u76EE\u4E2D\u66F4\u5FEB\u5730\u590D\u73B0\u7ED3\u679C\u3001\u5171\u4EAB\u73AF\u5883\u3001\u5B9A\u4F4D\u95EE\u9898\uFF0C\u4E5F\u80FD\u8BA9\u56E2\u961F\u534F\u4F5C\u66F4\u987A\u7545\u3002</p>\n<p>\u672C\u6307\u5357\u91C7\u7528\u5B9E\u7528\u4E3A\u4E3B\u7684\u98CE\u683C\uFF0C\u6309\u5E38\u89C1\u5DE5\u5177\u6D41\u6D3E\u62C6\u89E3\uFF1A\u793E\u533A\u6807\u51C6\uFF08pip + venv\uFF09\u3001\u79D1\u5B66\u4E0E\u4E8C\u8FDB\u5236\u5305\u53CB\u597D\uFF08Conda\uFF09\uFF0C\u4EE5\u53CA\u73B0\u4EE3\u5316\u7684\u4F9D\u8D56\u4E0E\u53D1\u5E03\u5DE5\u5177\uFF08Poetry\uFF09\u3002\u6BCF\u4E00\u8282\u90FD\u5305\u542B\u547D\u4EE4\u793A\u4F8B\u3001\u4F18\u52A3\u5BF9\u6BD4\u4E0E\u5E38\u89C1\u9677\u9631\u3002</p>\n<h2>\u5C0F\u5951\u7EA6\uFF08Contract\uFF09</h2>\n<ul>\n<li>\u8F93\u5165\uFF1A\u5F00\u53D1\u8005\u5E0C\u671B\u5728\u4EFB\u610F\u673A\u5668\u4E0A\u590D\u73B0 Python \u73AF\u5883\u5E76\u8FD0\u884C\u9879\u76EE\u3002</li>\n<li>\u8F93\u51FA\uFF1A\u53EF\u590D\u73B0\u7684\u4F9D\u8D56\u6E05\u5355\u3001\u53EF\u5207\u6362\u7684\u9694\u79BB\u73AF\u5883\u3001\u5E38\u7528\u547D\u4EE4\u901F\u67E5\u8868\u3002</li>\n<li>\u9519\u8BEF\u6A21\u5F0F\uFF1A\u4F9D\u8D56\u51B2\u7A81\u3001\u5E73\u53F0\u5DEE\u5F02\uFF08Windows/Linux/macOS\uFF09\u3001\u4E8C\u8FDB\u5236\u5305\u7F3A\u5931\u3001\u7F51\u7EDC/\u955C\u50CF\u95EE\u9898\u3002</li>\n</ul>\n<h2>\u5E38\u89C1\u7684\u8FB9\u754C\u60C5\u51B5\uFF08Edge cases\uFF09</h2>\n<ul>\n<li>\u9700\u8981\u4E8C\u8FDB\u5236\u6269\u5C55\uFF08\u4F8B\u5982 numpy\u3001pandas\u3001scipy\uFF09\u4E14\u76EE\u6807\u673A\u5668\u65E0\u7F16\u8BD1\u73AF\u5883\u3002</li>\n<li>\u540C\u65F6\u9700\u8981\u591A\u4E2A Python \u7248\u672C\uFF08\u5982 3.8 \u4E0E 3.11\uFF09\u3002</li>\n<li>CI \u4E0E\u751F\u4EA7\u73AF\u5883\u4F7F\u7528\u4E0D\u540C\u7684\u5305\u6E90\u6216\u79C1\u6709\u5305\u3002</li>\n</ul>\n<hr>\n<blockquote>\n<p><strong>\u5B9E\u9A8C\u5BA4\u4E00\u822C\u4F7F\u7528<code>conda</code>\u4F5C\u4E3A\u5B66\u4E60\u548C\u5F00\u53D1\u7684\u4E3B\u8981\u5DE5\u5177</strong></p>\n</blockquote>\n<h2>\u5DE5\u5177\u4E00\uFF1Apip + venv\uFF08Python \u793E\u533A\u7684\u57FA\u7840\u65B9\u6848\uFF09</h2>\n<blockquote>\n<p>\u6700\u8F7B\u91CF\u3001\u4E0E\u6807\u51C6\u5E93\u6700\u8D34\u8FD1\u7684\u65B9\u6848\u3002\u63A8\u8350\u7528\u4E8E\u5C0F\u578B\u9879\u76EE\u3001\u811A\u672C\u3001\u6559\u5B66\u4EE5\u53CA\u5BF9\u4E8C\u8FDB\u5236\u4F9D\u8D56\u8981\u6C42\u4E0D\u9AD8\u7684\u573A\u666F\u3002</p>\n</blockquote>\n<p>\u4E3A\u4EC0\u4E48\u9009\u5B83\uFF1Apip \u548C venv \u662F Python \u6807\u51C6\u5DE5\u5177\uFF08\u65E0\u9700\u989D\u5916\u5B89\u88C5 Python3 \u81EA\u5E26 venv\uFF09\uFF0C\u5B83\u6613\u4E8E\u7406\u89E3\u3001\u4E0E\u5927\u591A\u6570\u6258\u7BA1\u5E73\u53F0\uFF08\u6BD4\u5982 PyPI\uFF09\u517C\u5BB9\u3002</p>\n<p>\u5982\u4F55\u5DE5\u4F5C\uFF08\u7B80\u77ED\u6D41\u7A0B\uFF09\uFF1A</p>\n<ol>\n<li>\u521B\u5EFA\u865A\u62DF\u73AF\u5883\uFF08\u9694\u79BB site-packages\uFF09\u3002</li>\n<li>\u6FC0\u6D3B\u73AF\u5883\u5E76\u5B89\u88C5\u4F9D\u8D56\uFF08pip install\uFF09\u3002</li>\n<li>\u5BFC\u51FA\u4F9D\u8D56\uFF08requirements.txt\uFF09\u4EE5\u4FBF\u590D\u73B0\u3002</li>\n</ol>\n<p>\u5FEB\u901F\u4E0A\u624B\uFF08Windows pwsh \u793A\u4F8B\uFF09\uFF1A</p>\n<pre><code class="language-powershell"># \u521B\u5EFA\u865A\u62DF\u73AF\u5883\uFF08\u53EA\u9700\u4E00\u6B21\uFF09\npython -m venv .venv\n\n# \u6FC0\u6D3B\uFF08PowerShell\uFF09\n.\\.venv\\Scripts\\Activate.ps1\n\n# \u5B89\u88C5\u4F9D\u8D56\npip install requests flask\n\n# \u5C06\u5F53\u524D\u73AF\u5883\u4F9D\u8D56\u5BFC\u51FA\u4E3A requirements.txt\npip freeze &gt; requirements.txt\n\n# \u5728\u53E6\u4E00\u53F0\u673A\u5668\u4E0A\u590D\u73B0\npython -m venv .venv\n.\\.venv\\Scripts\\Activate.ps1\npip install -r requirements.txt\n</code></pre>\n<p>\u5B9E\u7528\u6280\u5DE7\u4E0E\u9677\u9631\uFF1A</p>\n<ul>\n<li>windows \u4E0B\u4E0D\u8981\u628A\u865A\u62DF\u73AF\u5883\u653E\u5728 PATH \u5F88\u6DF1\u7684\u76EE\u5F55\uFF0C\u907F\u514D\u8DEF\u5F84\u957F\u5EA6\u95EE\u9898\u3002</li>\n<li>\u4F7F\u7528 <code>python -m pip</code> \u800C\u4E0D\u662F\u76F4\u63A5 <code>pip</code> \u53EF\u4EE5\u51CF\u5C11\u7248\u672C\u9519\u914D\uFF08\u786E\u4FDD\u4F7F\u7528\u5F53\u524D Python \u7684 pip\uFF09\u3002</li>\n<li><code>pip freeze</code> \u4F1A\u5C06\u6240\u6709\u5DF2\u5B89\u88C5\u5305\u56FA\u5B9A\u5230\u5177\u4F53\u7248\u672C\uFF0C\u9002\u5408\u751F\u4EA7\u6216 CI\uFF1B\u5F00\u53D1\u65F6\u53EF\u53EA\u7EF4\u62A4 <code>requirements.in</code> \u5E76\u901A\u8FC7 <code>pip-compile</code> \u751F\u6210\u9501\u6587\u4EF6\uFF08\u89C1\u4E0B\uFF09\u3002</li>\n<li>\u5BF9\u4E8E\u9700\u8981\u7F16\u8BD1\u7684\u4E8C\u8FDB\u5236\u6269\u5C55\uFF0CWindows/macOS \u53EF\u80FD\u7F3A\u5C11\u7F16\u8BD1\u5668\uFF0C\u8FD9\u65F6\u8003\u8651\u4F7F\u7528 wheels \u6216\u5207\u6362\u5230 Conda\u3002</li>\n</ul>\n<p>\u9A8C\u6536\u6807\u51C6\uFF1A\u80FD\u5728\u5E72\u51C0\u673A\u5668\u4E0A\u901A\u8FC7 <code>requirements.txt</code> \u5B8C\u6574\u5B89\u88C5\u5E76\u8FD0\u884C\u9879\u76EE\u7684\u6700\u5C0F\u793A\u4F8B\u3002</p>\n<hr>\n<h2>\u5DE5\u5177\u4E8C\uFF1AConda\uFF08\u9002\u5408\u79D1\u5B66\u8BA1\u7B97\u4E0E\u4E8C\u8FDB\u5236\u5305\uFF09</h2>\n<blockquote>\n<p>Conda \u662F\u4E00\u4E2A\u8DE8\u8BED\u8A00\u7684\u5305\u548C\u73AF\u5883\u7BA1\u7406\u5668\uFF0C\u64C5\u957F\u5206\u53D1\u9884\u7F16\u8BD1\u7684\u4E8C\u8FDB\u5236\u5305\uFF08\u5C24\u5176\u662F\u79D1\u5B66\u6808\uFF09\uFF0C\u5E38\u7528\u4E8E\u6570\u636E\u79D1\u5B66\u548C\u79D1\u7814\u73AF\u5883\u3002</p>\n</blockquote>\n<p>\u4E3A\u4EC0\u4E48\u9009\u5B83\uFF1A\u5F53\u4F60\u7684\u9879\u76EE\u4F9D\u8D56\u5982 numpy\u3001scipy\u3001pandas\u3001opencv \u7B49\u5927\u578B\u4E8C\u8FDB\u5236\u5305\u65F6\uFF0CConda \u80FD\u907F\u514D\u672C\u5730\u7F16\u8BD1\uFF0C\u76F4\u63A5\u5B89\u88C5\u517C\u5BB9\u7684\u4E8C\u8FDB\u5236\u6587\u4EF6\u3002</p>\n<h3>conda \u5B89\u88C5</h3>\n<p>\u4E00\u822C\u76F4\u63A5\u4ECE\u5B98\u7F51(<a href="https://www.anaconda.com/download">anaconda.com</a>)\u76F4\u63A5\u4E0B\u8F7D\u5B89\u88C5\u5305\u5B89\u88C5\u5373\u53EF\uFF0C\u5B89\u88C5\u540E\u53EF\u901A\u8FC7 <code>conda --version</code> \u9A8C\u8BC1\u662F\u5426\u5B89\u88C5\u6210\u529F\u3002\u4F46\u662F\u6709\u65F6\u53D7\u9650\u4E8E\u7F51\u7EDC\u73AF\u5883\u95EE\u9898\u4E0B\u8F7D\u901F\u5EA6\u7F13\u6162\uFF0C\u53EF\u4EE5\u8003\u8651\u4ECE\u6E05\u534E\u6E90\u4E0B\u8F7D\u5B89\u88C5\u5305\u3002</p>\n<ul>\n<li><p>1.\u6253\u5F00<a href="https://mirrors.tuna.tsinghua.edu.cn/help/anaconda/">\u6E05\u534E\u6E90conda-help</a></p>\n</li>\n<li><p>2.\u6253\u5F00<a href="https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/">https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/</a> \u4E0B\u8F7D\u5408\u9002\u7248\u672C\u7684\u5B89\u88C5\u5305(\u5EFA\u8BAE\u4F7F\u7528 <code>Anaconda3-2025.06-1-Windows/Linux/MacOS-x86_64.sh/exe/pkg</code> \u7248\u672C\uFF0C\u907F\u514D\u4E00\u4E9B\u5217\u7684\u7248\u672C\u95EE\u9898)</p>\n<blockquote>\n<p>\u5BF9\u4E8Ewindows\u7CFB\u7EDF\uFF0C\u4E0B\u8F7D\u540E\u76F4\u63A5\u53CC\u51FB\u8FD0\u884C\u5B89\u88C5\u5305\u5373\u53EF\uFF0C\u5B89\u88C5\u8DEF\u5F84\u9ED8\u8BA4\u5373\u53EF\u3002\u7136\u540E\uFF1A</p>\n<ul>\n<li>\u6253\u5F00 <code>\u63A7\u5236\u9762\u677F</code> -&gt; <code>\u7CFB\u7EDF\u548C\u5B89\u5168</code> -&gt; <code>\u7CFB\u7EDF</code> -&gt; <code>\u9AD8\u7EA7\u7CFB\u7EDF\u8BBE\u7F6E</code> -&gt; <code>\u9AD8\u7EA7</code> -&gt; <code>\u73AF\u5883\u53D8\u91CF</code> -&gt; <code>\u7CFB\u7EDF\u53D8\u91CF</code> -&gt; <code>Path</code></li>\n<li>\u7F16\u8F91 <code>Path</code> \u53D8\u91CF\uFF0C\u5728\u672B\u5C3E\u6DFB\u52A0 <code>C:\\Users\\\u7528\u6237\u540D\\Anaconda3;C:\\Users\\\u7528\u6237\u540D\\Anaconda3\\Scripts;C:\\Users\\\u7528\u6237\u540D\\Anaconda3\\Library\\bin;</code>\n\u5982\u679C\u4F60\u6CA1\u6709\u5B89\u88C5\u5230\u9ED8\u8BA4\u8DEF\u5F84\uFF0C\u8BF7\u81EA\u884C\u4FEE\u6539\u4E0A\u8FF0\u8DEF\u5F84\u3002</li>\n</ul>\n</blockquote>\n</li>\n<li><p>\u5C06conda\u7684\u8F6F\u4EF6\u7684\u4E0B\u8F7D\u6E90\u4E5F\u6362\u5230\u6E05\u534E\u6E90\uFF1A</p>\n<ul>\n<li><p>Windows\uFF1A\u6253\u5F00<code>C:\\Users\\&lt;YourUserName&gt;\\.condarc</code>, \u6DFB\u52A0\u4E0Elinux/macos\u76F8\u540C\u7684\u5185\u5BB9\u3002</p>\n</li>\n<li><p>Linux/MacOS\uFF1A\u6253\u5F00 <code>~/.condarc</code> \u6587\u4EF6\uFF0C\u6DFB\u52A0\u4EE5\u4E0B\u5185\u5BB9\uFF1A</p>\n<pre><code class="language-bash">channels:\n    - defaults\nshow_channel_urls: true\ndefault_channels:\n    - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main\n    - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r\n    - https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/msys2\ncustom_channels:\n    conda-forge: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud\n    pytorch: https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud\n</code></pre>\n</li>\n</ul>\n</li>\n</ul>\n<p>\u57FA\u7840\u4F7F\u7528\u793A\u4F8B\uFF08Miniconda/Anaconda\uFF09\uFF1A</p>\n<pre><code class="language-bash"># \u521B\u5EFA\u5E76\u6307\u5B9A Python \u7248\u672C\nconda create -n myenv python=3.10\n\n# \u6FC0\u6D3B\u73AF\u5883\nconda activate myenv\n\n# \u5B89\u88C5\u5305\uFF08\u6765\u81EA\u9ED8\u8BA4 channel \u6216 conda-forge\uFF09\nconda install numpy pandas\n\n# \u5BFC\u51FA\u73AF\u5883\u5230 yml\uFF08\u5305\u542B\u4F9D\u8D56\u4E0E Python \u7248\u672C\uFF09\nconda env export --no-builds &gt; environment.yml\n\n# \u5728\u53E6\u4E00\u53F0\u673A\u5668\u4E0A\u590D\u73B0\nconda env create -f environment.yml\nconda activate myenv\n</code></pre>\n<p>\u4F18\u70B9\uFF1A</p>\n<ul>\n<li>\u9884\u7F16\u8BD1\u4E8C\u8FDB\u5236\u5305\uFF0C\u907F\u514D\u7F16\u8BD1\u5DE5\u5177\u94FE\u95EE\u9898\u3002</li>\n<li>\u53EF\u4EE5\u7BA1\u7406\u975E Python \u4F9D\u8D56\uFF08\u5982 libpng\u3001openblas\uFF09\u3002</li>\n<li>\u9002\u914D\u8DE8\u5E73\u53F0\u79D1\u5B66\u6808\uFF0Cconda-forge \u793E\u533A\u6D3B\u8DC3\u3002</li>\n</ul>\n<p>\u7F3A\u70B9\uFF1A</p>\n<ul>\n<li>Conda \u73AF\u5883\u901A\u5E38\u8F83\u5927\uFF0C\u5360\u7528\u78C1\u76D8\u591A\u3002</li>\n<li>\u6709\u65F6\u5305\u7248\u672C\u843D\u540E\u4E8E PyPI\uFF0C\u6216\u51FA\u73B0\u4F9D\u8D56\u51B2\u7A81\u89E3\u6790\u8F83\u6162\u3002</li>\n<li>\u4E0E pip \u7684\u4E92\u64CD\u4F5C\u9700\u8981\u5C0F\u5FC3\uFF1A\u4E0D\u8981\u5728 base \u73AF\u5883\u4E2D\u6DF7\u7528\uFF0C\u4F18\u5148\u5728\u72EC\u7ACB\u73AF\u5883\u5185\u4F7F\u7528 <code>pip</code> \u6216 <code>conda</code>\u3002</li>\n</ul>\n<p>\u5E38\u89C1\u9677\u9631\u4E0E\u5EFA\u8BAE\uFF1A</p>\n<ul>\n<li>\u4F18\u5148\u5728\u65B0\u5EFA\u7684 conda \u73AF\u5883\u5185\u7528 <code>conda install</code> \u5B89\u88C5\u80FD\u4ECE conda \u83B7\u5F97\u7684\u5305\uFF1B\u4EC5\u5F53 conda \u65E0\u5305\u65F6\u4F7F\u7528 <code>pip</code>\u3002</li>\n<li>\u4F7F\u7528 <code>conda env export --no-builds</code> \u53EF\u4EE5\u5F97\u5230\u66F4\u53EF\u79FB\u690D\u7684 yml \u6587\u4EF6\u3002</li>\n<li>\u5728 CI \u4E2D\u4F7F\u7528 miniconda \u955C\u50CF\u6216 mambaforge\uFF08mamba \u7684 conda \u66FF\u4EE3\u5B9E\u73B0\uFF09\u4EE5\u52A0\u5FEB\u89E3\u6790\u901F\u5EA6\uFF1A<code>mamba create -n myenv python=3.10 numpy</code>\u3002</li>\n</ul>\n<p>\u9A8C\u6536\u6807\u51C6\uFF1A\u5728 CI \u6216\u76EE\u6807\u673A\u5668\u4E0A\u901A\u8FC7 <code>environment.yml</code> \u91CD\u5EFA\u73AF\u5883\u5E76\u8FD0\u884C\u5173\u952E\u6D4B\u8BD5\u3002</p>\n<hr>\n<h2>\u5DE5\u5177\u4E09\uFF1APoetry\uFF08\u73B0\u4EE3\u5316\u9879\u76EE\u4E0E\u4F9D\u8D56\u7BA1\u7406\uFF09</h2>\n<p>\u4E3A\u4EC0\u4E48\u9009\u5B83\uFF1APoetry \u628A\u4F9D\u8D56\u7BA1\u7406\uFF08pyproject.toml\uFF09\u548C\u7248\u672C\u89E3\u6790\u3001\u53D1\u5E03\u6D41\u7A0B\u7ED3\u5408\u5230\u4E00\u8D77\uFF0C\u652F\u6301 lock \u6587\u4EF6\uFF08poetry.lock\uFF09\uFF0C\u4FBF\u4E8E\u5728\u56E2\u961F\u4E0E CI \u95F4\u590D\u5236\u7CBE\u786E\u4F9D\u8D56\u6811\u3002</p>\n<p>\u5FEB\u901F\u4E0A\u624B\uFF1A</p>\n<pre><code class="language-bash"># \u5B89\u88C5\uFF08\u5EFA\u8BAE\u4F7F\u7528\u5B98\u65B9\u811A\u672C\u6216\u5305\u7BA1\u7406\u5668\uFF09\ncurl -sSL https://install.python-poetry.org | python -\n\n# \u5728\u9879\u76EE\u6839\u76EE\u5F55\u521D\u59CB\u5316\npoetry init\n\n# \u6DFB\u52A0\u4F9D\u8D56\u5E76\u81EA\u52A8\u521B\u5EFA\u865A\u62DF\u73AF\u5883\npoetry add requests\n\n# \u8FD0\u884C\u547D\u4EE4\uFF08\u5728 Poetry \u7BA1\u7406\u7684\u865A\u62DF\u73AF\u5883\u4E2D\uFF09\npoetry run python -m mymodule\n\n# \u5BFC\u51FA requirements\uFF08\u5FC5\u8981\u65F6\u7528\u4E8E Docker/CI\uFF09\npoetry export -f requirements.txt --output requirements.txt --without-hashes\n</code></pre>\n<p>\u4F18\u70B9\uFF1A</p>\n<ul>\n<li>\u5C06\u9879\u76EE\u914D\u7F6E\u96C6\u4E2D\u5230 <code>pyproject.toml</code>\uFF08PEP 621\uFF09\uFF0C\u73B0\u4EE3\u3001\u6807\u51C6\u5316\u3002</li>\n<li>\u81EA\u52A8\u751F\u6210\u5E76\u7EF4\u62A4\u9501\u6587\u4EF6\uFF0C\u4FBF\u4E8E\u590D\u73B0\u3002</li>\n<li>\u96C6\u6210\u53D1\u5E03\uFF08poetry publish\uFF09\u5230 PyPI\u3002</li>\n</ul>\n<p>\u7F3A\u70B9\uFF1A</p>\n<ul>\n<li>\u5BF9\u4E8E\u4F9D\u8D56\u9700\u8981 conda \u4E8C\u8FDB\u5236\u5305\u7684\u79D1\u5B66\u6808\uFF0C\u5E76\u4E0D\u662F\u6700\u4F73\u9009\u62E9\uFF08\u4ECD\u53EF\u4E0E conda \u6DF7\u7528\uFF0C\u4F46\u9700\u8C28\u614E\uFF09\u3002</li>\n<li>\u5B66\u4E60\u66F2\u7EBF\u6BD4 pip+venv \u7565\u9661\uFF0C\u9700\u8981\u7406\u89E3 pyproject \u4E0E\u865A\u62DF\u73AF\u5883\u7684\u9690\u5F0F\u7BA1\u7406\u3002</li>\n</ul>\n<p>\u5EFA\u8BAE\u7528\u6CD5\uFF1A</p>\n<ul>\n<li>\u4F7F\u7528 Poetry \u7BA1\u7406\u5E93\u6216\u5E94\u7528\u7684\u4F9D\u8D56\u4E0E\u6253\u5305\u53D1\u5E03\u6D41\u7A0B\u3002</li>\n<li>\u5728 Dockerfile \u4E2D\u53EF\u5C06 poetry \u5BFC\u51FA\u7684 requirements.txt \u4E0E\u5B98\u65B9 Python \u955C\u50CF\u7ED3\u5408\uFF0C\u4EE5\u51CF\u5C11\u8FD0\u884C\u65F6\u4F9D\u8D56\u5DEE\u5F02\u3002</li>\n</ul>\n<p>\u9A8C\u6536\u6807\u51C6\uFF1A\u901A\u8FC7 <code>poetry install</code> \u5728\u5E72\u51C0\u73AF\u5883\u4E2D\u91CD\u73B0\u5F00\u53D1\u73AF\u5883\uFF0C\u5E76\u80FD\u901A\u8FC7 <code>poetry run pytest</code> \u8FD0\u884C\u6D4B\u8BD5\u5957\u4EF6\u3002</p>\n<hr>\n<h2>\u5DE5\u5177\u56DB\uFF1Auv\uFF08\u4E00\u4F53\u5316\u7684\u6781\u901F\u9879\u76EE\u7BA1\u7406\u5DE5\u5177\uFF09</h2>\n<blockquote>\n<p>\u5982\u679C\u4F60\u5728\u5BFB\u627E\u4E00\u4E2A\u628A <code>pip</code>\u3001<code>pip-tools</code>\u3001<code>pipx</code>\u3001<code>poetry</code>\u3001<code>pyenv</code>\u3001<code>virtualenv</code> \u7B49\u529F\u80FD\u96C6\u5408\u5230\u4E00\u4E2A\u547D\u4EE4\u884C\u5DE5\u5177\u91CC\u7684\u73B0\u4EE3\u65B9\u6848\uFF0C<code>uv</code> \u503C\u5F97\u4E86\u89E3\u3002\u5B83\u7531 Astral \u56E2\u961F\u5F00\u53D1\uFF08\u540C\u6837\u7684\u56E2\u961F\u5F00\u53D1\u4E86 Ruff\uFF09\uFF0C\u4EE5\u901F\u5EA6\u548C\u4E00\u4F53\u5316\u7279\u6027\u4E3A\u4EAE\u70B9\u3002</p>\n</blockquote>\n<p>\u6838\u5FC3\u4EAE\u70B9\uFF08\u7B80\u8FF0\uFF09\uFF1A</p>\n<ul>\n<li>\u4E00\u4F53\u5316\uFF1A\u9879\u76EE\u7BA1\u7406\u3001\u811A\u672C\u8FD0\u884C\u3001\u5DE5\u5177\u5B89\u88C5\u3001Python \u7248\u672C\u7BA1\u7406\u4E0E pip \u517C\u5BB9\u63A5\u53E3\u90FD\u88AB\u8986\u76D6\u3002</li>\n<li>\u6781\u901F\uFF1A\u5B98\u65B9\u57FA\u51C6\u663E\u793A\u5728\u5F88\u591A\u573A\u666F\u4E0B\u6BD4\u4F20\u7EDF pip \u5FEB 10-100 \u500D\uFF08\u53D7\u76CA\u4E8E Rust \u5B9E\u73B0\u4E0E\u5168\u5C40\u7F13\u5B58\uFF09\u3002</li>\n<li>\u5DE5\u4F5C\u533A\u4E0E\u9501\u6587\u4EF6\uFF1A\u652F\u6301\u7C7B\u4F3C Cargo \u7684\u5DE5\u4F5C\u533A\u3001\u591A\u9879\u76EE\u7BA1\u7406\u4E0E\u901A\u7528\u9501\u6587\u4EF6\uFF0C\u65B9\u4FBF\u5927\u578B\u5DE5\u7A0B\u6216 monorepo\u3002</li>\n</ul>\n<p>\u5FEB\u901F\u4E0A\u624B\u4E0E\u5B89\u88C5\uFF1A</p>\n<pre><code class="language-bash"># \u5B98\u65B9\u5B89\u88C5\u811A\u672C\uFF08macOS / Linux\uFF09\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n\n# Windows \u6216\u901A\u8FC7 pip/homebrew \u5B89\u88C5\u53C2\u8003\u5B98\u65B9\u6587\u6863\n</code></pre>\n<p>\u9879\u76EE\u7BA1\u7406\u793A\u4F8B\uFF1A</p>\n<pre><code class="language-bash"># \u521D\u59CB\u5316\u9879\u76EE\nuv init example\ncd example\n\n# \u6DFB\u52A0\u4F9D\u8D56\uFF08\u4F1A\u81EA\u52A8\u521B\u5EFA .venv\uFF09\nuv add ruff\n\n# \u8FD0\u884C\u5DF2\u5B89\u88C5\u7684\u5DE5\u5177\u6216\u811A\u672C\nuv run ruff check\n\n# \u9501\u5B9A\u4E0E\u540C\u6B65\u4F9D\u8D56\nuv lock\nuv sync\n</code></pre>\n<p>\u811A\u672C\u7BA1\u7406\uFF08\u5355\u6587\u4EF6\u4F9D\u8D56\u58F0\u660E\uFF09\uFF1A</p>\n<pre><code class="language-bash"># \u5728\u811A\u672C\u4E2D\u4F7F\u7528\u5185\u8054\u5143\u6570\u636E\u5E76\u5B89\u88C5\u8FD0\u884C\necho &#39;import requests; print(requests.get(&quot;https://astral.sh&quot;))&#39; &gt; example.py\nuv add --script example.py requests\nuv run example.py\n</code></pre>\n<p>\u5DE5\u5177\u5B89\u88C5\u4E0E\u4E34\u65F6\u8FD0\u884C\uFF08\u7C7B\u4F3C pipx\uFF09\uFF1A</p>\n<pre><code class="language-bash"># \u4E34\u65F6\u8FD0\u884C\nuvx pycowsay &#39;hello world!&#39;\n\n# \u5B89\u88C5\u5DE5\u5177\u5230 uv \u7BA1\u7406\u7684\u5168\u5C40\u5DE5\u5177\u4F4D\u7F6E\nuv tool install ruff\nruff --version\n</code></pre>\n<p>Python \u7248\u672C\u7BA1\u7406\uFF1A</p>\n<pre><code class="language-bash"># \u5B89\u88C5\u5E76\u5207\u6362 Python \u7248\u672C\nuv python install 3.10 3.11 3.12\nuv venv --python 3.12.0\nuv python pin 3.11\n</code></pre>\n<p>pip \u517C\u5BB9\u63A5\u53E3\uFF1A</p>\n<pre><code class="language-bash"># \u4F7F\u7528 uv \u7684 pip \u63A5\u53E3\u8FDB\u884C\u66F4\u5FEB\u7684\u89E3\u6790\u4E0E\u5B89\u88C5\nuv pip sync docs/requirements.txt\nuv pip compile docs/requirements.in --universal --output-file docs/requirements.txt\n</code></pre>\n<p>\u4F18\u70B9\u4E0E\u9002\u7528\u573A\u666F\uFF1A</p>\n<ul>\n<li>\u5982\u679C\u4F60\u60F3\u8981\u4E00\u4E2A\u5355\u4E00\u5DE5\u5177\u8986\u76D6\u4F9D\u8D56\u89E3\u6790\u3001\u865A\u62DF\u73AF\u5883\u7BA1\u7406\u3001Python \u7248\u672C\u7BA1\u7406\u4E0E\u5DE5\u5177\u6267\u884C\uFF0C<code>uv</code> \u662F\u5F88\u597D\u7684\u9009\u62E9\u3002</li>\n<li>\u5BF9\u4E8E\u9700\u8981\u9891\u7E41\u5B89\u88C5/\u5207\u6362\u4F9D\u8D56\u3001\u5728 CI \u4E2D\u8FFD\u6C42\u901F\u5EA6\u6216\u7BA1\u7406\u5927\u578B monorepo\uFF0Cuv \u7684\u5168\u5C40\u7F13\u5B58\u4E0E\u5E76\u884C\u5316\u89E3\u6790\u975E\u5E38\u6709\u5438\u5F15\u529B\u3002</li>\n</ul>\n<p>\u5C40\u9650\u4E0E\u6CE8\u610F\u4E8B\u9879\uFF1A</p>\n<ul>\n<li>\u65B0\u5174\u5DE5\u5177\uFF1A\u867D\u7136\u529F\u80FD\u5F3A\u5927\u4E14\u5728\u5FEB\u901F\u53D1\u5C55\uFF0C\u4F46\u751F\u6001\u4E0E\u793E\u533A\u89C4\u6A21\u5C1A\u4E0D\u53CA pip/conda/poetry \u90A3\u822C\u6210\u719F\uFF0C\u9047\u5230\u6781\u7AEF\u517C\u5BB9\u95EE\u9898\u65F6\u53EF\u80FD\u9700\u8981\u66F4\u591A\u6392\u67E5\u3002</li>\n<li>\u4E0E Conda \u7684\u4E8C\u8FDB\u5236\u5305\u7BA1\u7406\uFF08\u5C24\u5176\u79D1\u5B66\u6808\uFF09\u5E76\u4E0D\u603B\u662F\u76F4\u63A5\u4E92\u6362\uFF1B\u5BF9\u5927\u91CF\u4F9D\u8D56\u672C\u5730\u7F16\u8BD1\u6216\u7279\u5B9A\u4E8C\u8FDB\u5236\u7684\u9879\u76EE\u4ECD\u5EFA\u8BAE\u4F7F\u7528 Conda\u3002</li>\n</ul>\n<p>\u8FC1\u79FB\u5EFA\u8BAE\uFF1A</p>\n<ul>\n<li>\u4ECE pip/venv \u6216 Poetry \u8FC1\u79FB\u5230 uv\uFF1A\u5148\u5728\u6C99\u76D2\u5206\u652F\u4E2D\u8BD5\u9A8C <code>uv init</code> + <code>uv add</code>\uFF0C\u4F7F\u7528 <code>uv lock</code> \u751F\u6210\u9501\u5E76\u5728 CI \u4E2D\u5C1D\u8BD5 <code>uv sync</code>\u3002</li>\n<li>\u5728\u9700\u8981 conda \u4E8C\u8FDB\u5236\u5305\u7684\u9879\u76EE\u4E2D\uFF0C\u53EF\u53EA\u5728\u8FD0\u884C\u4E0E\u6784\u5EFA\u9636\u6BB5\u7EE7\u7EED\u4F7F\u7528 Conda\uFF0C\u800C\u7528 uv \u7BA1\u7406 Python \u7EA7\u522B\u7684\u4F9D\u8D56\u4E0E\u5DE5\u5177\u6267\u884C\u3002</li>\n</ul>\n<p>\u53C2\u8003\u4E0E\u5EF6\u4F38\u9605\u8BFB\uFF1A</p>\n<ul>\n<li>uv \u4E2D\u6587\u6587\u6863: <a href="https://uv.doczh.com/">https://uv.doczh.com/</a></li>\n<li>uv \u5B98\u65B9\u4ED3\u5E93: <a href="https://github.com/astral-sh/uv">https://github.com/astral-sh/uv</a></li>\n</ul>\n<h2>\u4F5C\u8005\u6CE8</h2>\n<p>\u5BF9\u4E8E\u65B0\u624B\u6765\u8BF4\u6211\u5EFA\u8BAE\u5148\u5165\u95E8\u4F7F\u7528 <code>pip+venv</code>\uFF0C\u719F\u6089\u5176\u57FA\u672C\u7528\u6CD5\uFF0C\u7136\u540E\u518D\u5C1D\u8BD5\u4F7F\u7528<code>uv</code>\uFF0C\u56E0\u4E3A <code>pip+venv</code>  \u4EE3\u8868\u4E86\u4F20\u7EDF\u7684 Python \u5305\u7BA1\u7406\u65B9\u5F0F\uFF0C\u5E76\u4E14\u548C<code>python</code>\u7684\u8BBE\u8BA1\u54F2\u5B66\u66F4\u8D34\u8FD1\uFF0C\u6709\u5229\u4E8E\u5B66\u4E60\u548C\u7406\u89E3<code>python</code>,\u800C<code>uv</code>\u5219\u662F\u4E00\u6B3E\u65B0\u578B\u7684\u5DE5\u5177,\u5B83\u4EE3\u8868\u8005\u4E00\u79CD\u5168\u65B0\u7684\u601D\u7EF4\u65B9\u5F0F,\u5B83\u5C06\u5305\u7BA1\u7406\u3001\u865A\u62DF\u73AF\u5883\u3001Python\u7248\u672C\u7BA1\u7406\u3001\u5DE5\u5177\u7BA1\u7406\u7B49\u529F\u80FD\u96C6\u5408\u5230\u4E00\u4E2A\u547D\u4EE4\u884C\u5DE5\u5177\u4E2D,\u5E76\u4E14\u5B83\u8FD8\u63D0\u4F9B\u4E86\u6781\u901F\u7684\u4F9D\u8D56\u89E3\u6790\u3001\u5168\u5C40\u7F13\u5B58\u3001\u5E76\u884C\u5316\u89E3\u6790\u7B49\u7279\u6027\uFF0C\u81F3\u4E8E<code>poetry</code>\uFF0C\u5B83\u548C<code>uv</code>\u4E00\u6837\u90FD\u662F\u65B0\u7684\u601D\u7EF4\u91C7\u7528\u4E86<code>pyproject.toml</code>\u4F5C\u4E3A\u914D\u7F6E\u6587\u4EF6\uFF0C\u6240\u4EE5\u6CA1\u5FC5\u8981\u4E86\u89E3\u8FC7\u591A\u91CD\u590D\u5185\u5BB9\uFF0C\u5F53\u4F60\u56E0\u4E3A\u4E00\u4E2A\u9879\u76EE\u63A5\u89E6\u5230\u65F6\uFF0C\u53EA\u9700\u8981\u7B80\u5355\u4E86\u89E3\u5373\u53EF\u5FEB\u901F\u4E0A\u624B\u3002</p>\n<p>\u5F53\u4F60\u5F00\u59CB\u5B66\u4E60\u672C\u5B9E\u9A8C\u5BA4\u76F8\u5173\u7684AI\u9879\u76EE\u65F6\uFF0C\u90A3\u4E48\u4F60\u5C31\u53EF\u4EE5\u5F00\u59CB\u5B66\u4E60<code>conda</code>\u7684\u9879\u76EE\u7BA1\u7406\u4E86\uFF0C\u56E0\u4E3A<code>conda</code>\u53EF\u4EE5\u7BA1\u7406\u975E Python \u4F9D\u8D56\uFF0C\u5E76\u4E14\u5B83\u662F\u8DE8\u5E73\u53F0\u7684\uFF0C\u9002\u5408\u79D1\u5B66\u8BA1\u7B97\u4E0E\u4E8C\u8FDB\u5236\u5305\uFF0C\u5BF9\u4E8E\u4E00\u4E9B\u9700\u8981<code>c/c++</code>\u52A0\u901F\u7684\u5E93\u6765\u8BF4\uFF0C<code>conda</code>\u662F\u6700\u597D\u7684\u9009\u62E9\uFF0C\u5E76\u4E14<code>conda</code>\u4E0D\u4EC5\u4EC5\u652F\u6301\u4E8E<code>python</code>\u7684\u5F00\u53D1\u9879\u76EE\uFF0C\u5BF9\u4E8E\u4E00\u4E9B\u4E3B\u6D41\u8BED\u8A00\u90FD\u5177\u5907\u5B8C\u6210\u7684\u9879\u76EE\u7BA1\u7406\u6D41\u7A0B\u3002</p>\n<p>\u901A\u8FC7\u8FD9\u6837\u4E00\u6B65\u4E00\u6B65\u7684\u4E86\u89E3\u548C\u5B66\u4E60\uFF0C\u4F60\u624D\u80FD\u4E0D\u53D7\u9650\u4E8E\u5DE5\u5177\u672C\u8EAB\u7684\u9650\u5236\uFF0C\u5728\u5B66\u4E60\u4E2D\u4E0D\u88AB\u5DE5\u5177\u672C\u8EAB\u56F0\u6270\uFF0C\u5728\u5B9E\u8DF5\u4E2D\u6E38\u5203\u6709\u4F59\u3002</p>\n<blockquote>\n<p>\u672C\u6587\u548Cgit\u4E8Eshell\u7BC7\u4E0D\u540C\uFF0C\u672C\u6587\u4E3B\u8981\u7531AI\u64B0\u5199\uFF0C\u6587\u7AE0\u6BD4\u8F83\u6B7B\u677F\uFF0C\u6240\u4EE5\u5EFA\u8BAE\u591A\u770B\u770B\u6587\u7AE0\u4E2D\u94FE\u63A5\u7684\u5B98\u65B9\u6587\u6863\u3002</p>\n<blockquote>\n<p>\u4F5C\u4E3A\u4E00\u540D\u8BA1\u7B97\u673A\u5B66\u4E60\u8005\uFF0C\u5B66\u4F1A\u6839\u636E\u4E0D\u540C\u573A\u666F\u9009\u62E9\u5408\u9002\u7684\u5DE5\u5177\u81F3\u5173\u91CD\u8981\uFF0C\u5B83\u80FD\u591F\u663E\u8457\u63D0\u5347\u5DE5\u4F5C\u6548\u7387\u3002\u540C\u65F6\uFF0C\u5F3A\u5927\u7684\u641C\u7D22\u80FD\u529B\u548C\u6587\u6863\u9605\u8BFB\u6280\u5DE7\u4E5F\u6781\u4E3A\u91CD\u8981\u3002</p>\n</blockquote>\n</blockquote>\n<h2>\u5B9E\u7528\u6700\u4F73\u5B9E\u8DF5\uFF08\u9002\u7528\u4E8E\u6240\u6709\u5DE5\u5177\uFF09</h2>\n<ul>\n<li>\u5C06\u4F9D\u8D56\u533A\u5206\u4E3A\u8FD0\u884C\u65F6\u4F9D\u8D56\u548C\u5F00\u53D1\u4F9D\u8D56\uFF08\u4F8B\u5982\uFF1Atest\u3001lint\u3001type-check \u5DE5\u5177\uFF09\u3002Poetry/conda \u90FD\u652F\u6301\u5206\u7EC4\uFF0Cpip \u53EF\u7528 requirements-dev.txt\u3002</li>\n<li>\u5728 CI \u4E2D\u4F18\u5148\u4F7F\u7528\u660E\u786E\u7684 Python \u7248\u672C\u4E0E\u955C\u50CF\uFF08\u4F8B\u5982 <code>python:3.10-slim</code>\uFF09\u3002</li>\n<li>\u628A\u865A\u62DF\u73AF\u5883\u653E\u5728 .venv\uFF08\u9879\u76EE\u5185\uFF09\u5E76\u52A0\u5165 .gitignore\uFF1B\u8FD9\u6837\u66F4\u6613\u4E8E\u7BA1\u7406\u4E0E\u6FC0\u6D3B\u3002</li>\n<li>\u4F7F\u7528\u79C1\u6709\u955C\u50CF\u6216\u5185\u90E8\u7D22\u5F15\u6765\u52A0\u901F\u4F01\u4E1A\u5185\u90E8\u5305\u5B89\u88C5\u3002\u56FD\u5185\u7528\u6237\u53EF\u914D\u7F6E PyPI \u955C\u50CF\uFF08\u5982\u6E05\u534E\u3001\u963F\u91CC\u4E91\u955C\u50CF\uFF09\u3002</li>\n<li>\u5B9A\u671F\u66F4\u65B0\u4F9D\u8D56\u5E76\u5728 CI \u4E2D\u8FD0\u884C\u5B89\u5168\u626B\u63CF\uFF08\u5982 pip-audit\u3001safety\u3001Bandit\uFF09\u3002</li>\n</ul>\n<p>\u793A\u4F8B .gitignore\uFF08\u6700\u5C0F\uFF09:</p>\n<pre><code>.venv/\n__pycache__/\n*.pyc\ndist/\nbuild/\n*.egg-info\n</code></pre>\n<p>CI \u793A\u4F8B\uFF08GitHub Actions \u7B80\u8981\u7247\u6BB5\uFF0C\u7528 poetry\uFF09:</p>\n<pre><code class="language-yaml">jobs:\n    test:\n        runs-on: ubuntu-latest\n        steps:\n            - uses: actions/checkout@v4\n            - name: Set up Python\n                uses: actions/setup-python@v4\n                with:\n                    python-version: &#39;3.10&#39;\n            - name: Install Poetry\n                run: curl -sSL https://install.python-poetry.org | python -\n            - name: Install dependencies\n                run: poetry install\n            - name: Run tests\n                run: poetry run pytest -q\n</code></pre>\n<hr>\n<h2>\u8FDB\u9636\u8BDD\u9898\u4E0E\u8FC1\u79FB\u5EFA\u8BAE</h2>\n<ul>\n<li>\u4ECE requirements.txt \u8FC1\u79FB\u5230 Poetry\uFF1A\u9010\u6B65\u8FC1\u79FB\uFF0C\u5148\u5728\u65B0\u5206\u652F\u4E2D\u7528 <code>poetry init</code>\uFF0C\u624B\u52A8\u628A\u4F9D\u8D56\u586B\u5165 <code>pyproject.toml</code>\uFF0C\u4F7F\u7528 <code>poetry lock</code> \u751F\u6210\u9501\u6587\u4EF6\uFF0CCI \u4E2D\u91C7\u7528 <code>poetry install --no-dev</code> \u8FDB\u884C\u751F\u4EA7\u90E8\u7F72\u3002</li>\n<li>\u5728\u9700\u8981\u5927\u91CF\u4E8C\u8FDB\u5236\u5305\u7684\u9879\u76EE\u4E2D\uFF0C\u4F18\u5148\u4F7F\u7528 Conda\uFF08\u6216 mamba\uFF09\u521B\u5EFA\u8FD0\u884C\u73AF\u5883\uFF0C\u5C06 Python \u6E90\u4EE3\u7801\u4E0E\u4F9D\u8D56\u7684\u4E8C\u8FDB\u5236\u7EC4\u4EF6\u5206\u5F00\u7BA1\u7406\u3002</li>\n<li>\u5BF9\u4E8E\u5305\u7684\u53D1\u5E03\u4E0E\u7248\u672C\u7B56\u7565\uFF0C\u63A8\u8350\u8BED\u4E49\u5316\u7248\u672C\uFF08SemVer\uFF09\uFF0C\u5E76\u5728 CI \u4E2D\u52A0\u5165\u81EA\u52A8\u53D1\u5E03\u7684\u4FDD\u62A4\uFF08tag\u3001\u7B7E\u540D\u3001\u5BA1\u6838\uFF09\u3002</li>\n</ul>\n<hr>\n<h2>\u5E38\u7528\u547D\u4EE4\u901F\u67E5\u8868</h2>\n<ul>\n<li>\u521B\u5EFA venv: <code>python -m venv .venv</code></li>\n<li>\u6FC0\u6D3B\uFF08Windows PowerShell\uFF09: <code>.\\.venv\\Scripts\\Activate.ps1</code></li>\n<li>\u5BFC\u51FA requirements: <code>pip freeze &gt; requirements.txt</code></li>\n<li>Conda \u5BFC\u51FA: <code>conda env export --no-builds &gt; environment.yml</code></li>\n</ul>\n<hr>\n<h2>\u53C2\u8003\u4E0E\u5EF6\u4F38\u9605\u8BFB</h2>\n<ul>\n<li>pip \u5B98\u65B9\u6587\u6863: <a href="https://pip.pypa.io/">https://pip.pypa.io/</a></li>\n<li>Python Packaging User Guide: <a href="https://packaging.python.org/">https://packaging.python.org/</a></li>\n<li>Poetry: <a href="https://python-poetry.org/">https://python-poetry.org/</a></li>\n<li>Conda: <a href="https://docs.conda.io/">https://docs.conda.io/</a></li>\n<li>uv: <a href="https://github.com/astral-sh/uv">https://github.com/astral-sh/uv</a></li>\n<li>conda \u8FD8\u6709\u5F88\u591A\u884D\u751F\uFF0C\u5982 <a href="https://conda-forge.org/">conda-forge</a> \u955C\u50CF\uFF0C<a href="https://github.com/mamba-org/mamba">mamba</a> \u4E0E <a href="https://github.com/mamba-org/micromamba">micromamba</a> \u66F4\u5FEB\u901F\u7684\u5305\u7BA1\u7406\u5668\u3002</li>\n</ul>\n'
    },
    {
      slug: "markdown",
      title: "Markdown \u5FEB\u901F\u5165\u95E8",
      date: "2025-10-09T11:02:53.000Z",
      tags: [
        "\u8BA1\u7B97\u673A\u57FA\u7840"
      ],
      excerpt: " Markdown \u5FEB\u901F\u5165\u95E8\n\nMarkdown \u662F\u4E00\u79CD\u8F7B\u91CF\u7EA7\u6807\u8BB0\u8BED\u8A00\uFF0C\u5B83\u5141\u8BB8\u4EBA\u4EEC\u4F7F\u7528\u6613\u8BFB\u6613\u5199\u7684\u7EAF\u6587\u672C\u683C\u5F0F\u7F16\u5199\u6587\u6863\uFF0C\u7136\u540E\u8F6C\u6362\u6210\u6709\u6548\u7684 HTML \u6587\u6863\u3002Markdown \u7684\u8BED\u6CD5\u7B80\u6D01\uFF0C\u5B66\u4E60\u8D77\u6765\u4E5F\u5F88\u5BB9\u6613.\n\n> \u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684\u8BA1\u7B97\u673A\u5E38\u7528\u5DE5\u5177\u5165\u95E8\u6559\u7A0B\u4E4BMarkdown.\n\n\u5728\u8BA1\u7B97\u673A\u4EE5\u53CA\u4E92\u8054\u7F51\u9886\u57DF\u7684\u4ECE\u4E1A\u8005\u7684\u5B66\u4E60\u548C\u5DE5\u4F5C\u4E2D\uFF0C\u65E0\u8BBA\u662F\u524D\u7AEF\u8FD8\u662F\u540E\u7AEF\u5DE5\u7A0BMarkdown\u90FD\u662F\u5FC5\u5907\u7684\u5DE5\u5177\u3002\u672C\u6587\u5C06\u4ECB\u7ECD...",
      content: '<h1>Markdown \u5FEB\u901F\u5165\u95E8</h1>\n<p>Markdown \u662F\u4E00\u79CD\u8F7B\u91CF\u7EA7\u6807\u8BB0\u8BED\u8A00\uFF0C\u5B83\u5141\u8BB8\u4EBA\u4EEC\u4F7F\u7528\u6613\u8BFB\u6613\u5199\u7684\u7EAF\u6587\u672C\u683C\u5F0F\u7F16\u5199\u6587\u6863\uFF0C\u7136\u540E\u8F6C\u6362\u6210\u6709\u6548\u7684 HTML \u6587\u6863\u3002Markdown \u7684\u8BED\u6CD5\u7B80\u6D01\uFF0C\u5B66\u4E60\u8D77\u6765\u4E5F\u5F88\u5BB9\u6613.</p>\n<blockquote>\n<p>\u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684\u8BA1\u7B97\u673A\u5E38\u7528\u5DE5\u5177\u5165\u95E8\u6559\u7A0B\u4E4BMarkdown.</p>\n</blockquote>\n<p>\u5728\u8BA1\u7B97\u673A\u4EE5\u53CA\u4E92\u8054\u7F51\u9886\u57DF\u7684\u4ECE\u4E1A\u8005\u7684\u5B66\u4E60\u548C\u5DE5\u4F5C\u4E2D\uFF0C\u65E0\u8BBA\u662F\u524D\u7AEF\u8FD8\u662F\u540E\u7AEF\u5DE5\u7A0BMarkdown\u90FD\u662F\u5FC5\u5907\u7684\u5DE5\u5177\u3002\u672C\u6587\u5C06\u4ECB\u7ECD Markdown \u7684\u57FA\u672C\u8BED\u6CD5\uFF0C\u5E76\u901A\u8FC7\u5B9E\u4F8B\u4ECB\u7ECD Markdown \u7684\u5E38\u7528\u529F\u80FD.</p>\n<h2>1.Markdown \u4E8E HTML \u7684\u533A\u522B</h2>\n<p>MD\u548CHTML\u90FD\u662F\u6807\u8BB0\u8BED\u8A00\uFF0C\u672C\u8D28\u6211\u8BA4\u4E3A\u6CA1\u6709\u4EC0\u4E48\u533A\u522B\uFF0C\u90FD\u662F\u7279\u5B9A\u7684\u6807\u8BB0\u7B26\u53F7\u6765\u6807\u8BB0\u6587\u672C\u7684\u7ED3\u6784\u548C\u683C\u5F0F\uFF0C\u5E76\u4E14\u6211\u4EEC\u4E00\u822C\u6240\u770B\u5230\u7684MD\u6587\u6863\u90FD\u662F\u7ECF\u8FC7\u6E32\u67D3\u540E\u7684HTML\u6587\u6863.</p>\n<p>MD\u7684\u8BED\u6CD5\u66F4\u52A0\u7B80\u5355\uFF0C\u66F4\u52A0\u6613\u8BFB\u6613\u5199\uFF0C\u5E76\u4E14\u53EF\u4EE5\u76F4\u63A5\u8F6C\u6362\u6210HTML\uFF0C\u6240\u4EE5\u5728\u5199MD\u6587\u6863\u7684\u65F6\u5019\uFF0C\u6211\u4EEC\u53EF\u4EE5\u66F4\u52A0\u4E13\u6CE8\u4E8E\u5185\u5BB9\u7684\u521B\u4F5C\uFF0C\u800C\u4E14MD\u5230HTML\u7684\u8F6C\u6362\u8FC7\u7A0B\u76F8\u5BF9\u7B80\u5355\uFF0C\u5982\u679C\u6709\u5174\u8DA3\u53EF\u4EE5\u81EA\u5DF1\u5C1D\u8BD5\u4F7F\u7528<code>Python</code> ,<code>CPP</code> \u7B49\u8BED\u8A00\u7684\u6807\u51C6\u5E93\u5B9E\u73B0\u4E00\u4E2A\u7B80\u5355\u7684<code>MD\u7F16\u8BD1\u5668</code>.</p>\n<h2>2.Markdown \u6587\u5B57\u8BED\u6CD5</h2>\n<h4>1. \u6807\u9898</h4>\n<pre><code># \u4E00\u7EA7\u6807\u9898\n## \u4E8C\u7EA7\u6807\u9898\n### \u4E09\u7EA7\u6807\u9898\n#### \u56DB\u7EA7\u6807\u9898\n##### \u4E94\u7EA7\u6807\u9898\n###### \u516D\u7EA7\u6807\u9898\n</code></pre>\n<h4>2. \u5F3A\u8C03</h4>\n<pre><code>*\u659C\u4F53*\n_\u659C\u4F53_\n**\u7C97\u4F53**\n__\u7C97\u4F53__\n</code></pre>\n<blockquote>\n<p> <em>\u659C\u4F53</em>\u3001<em>\u659C\u4F53</em>\u3001<strong>\u7C97\u4F53</strong>\u3001<strong>\u7C97\u4F53</strong></p>\n</blockquote>\n<h4>3. \u5F15\u7528</h4>\n<pre><code>&gt; \u8FD9\u662F\u4E00\u4E2A\u5F15\u7528\n</code></pre>\n<blockquote>\n<p> \u8FD9\u662F\u4E00\u4E2A\u5F15\u7528</p>\n</blockquote>\n<h4>4. \u5217\u8868</h4>\n<ul>\n<li>\u65E0\u5E8F\u5217\u5217\u8868</li>\n</ul>\n<pre><code>- \u5217\u88681\n- \u5217\u88682\n- \u5217\u88683\n</code></pre>\n<ul>\n<li>\u6709\u5E8F\u5217\u8868</li>\n</ul>\n<pre><code>2. \u5217\u88681\n3. \u5217\u88682\n4. \u5217\u88683\n</code></pre>\n<ul>\n<li>\u5D4C\u5957\u5217\u8868</li>\n</ul>\n<pre><code>- \u5217\u88681\n  - \u5217\u88681.2\n- \u5217\u88682\n  - \u5217\u88682.1\n      - \u5217\u88682.1.1\n  - \u5217\u88682.2\n      - \u5217\u88682.2.1\n</code></pre>\n<blockquote>\n<ul>\n<li>\u65E0\u5E8F\u5217\u5217\u8868</li>\n<li>\u5217\u88681</li>\n<li>\u5217\u88682</li>\n<li>\u5217\u88683</li>\n</ul>\n</blockquote>\n<h4>5. <code>\\</code> \u8F6C\u4E49\u5B57\u7B26</h4>\n<ul>\n<li>\u53CD\u659C\u6760<code>\\</code>\u7528\u6765\u8F6C\u4E49Markdown\u8BED\u6CD5\u4E2D\u7684\u7279\u6B8A\u5B57\u7B26\uFF0C\u6BD4\u5982<code>\\*</code>\u8868\u793A\u661F\u53F7\uFF0C<code>\\|</code>\u8868\u793A\u7AD6\u7EBF\u7B49\u3002</li>\n<li>\u793A\u4F8B\uFF1A</li>\n</ul>\n<pre><code>\\*\u659C\u4F53\\*\n</code></pre>\n<p><strong>\u6548\u679C</strong>: *\u659C\u4F53*</p>\n<h2>3. Markdown \u6587\u4EF6\u4E0E\u94FE\u63A5\u8BED\u6CD5</h2>\n<h4>1. \u94FE\u63A5</h4>\n<ul>\n<li>\u884C\u5185\u5F0F\uFF1A</li>\n</ul>\n<pre><code>[\u94FE\u63A5\u540D\u79F0](\u94FE\u63A5\u5730\u5740)\n[eastaihub.cloud](https://eastaihub.cloud/)\n</code></pre>\n<blockquote>\n<p> <a href="https://eastaihub.cloud/">eastaihub.cloud</a></p>\n</blockquote>\n<ul>\n<li>\u53C2\u8003\u5F0F\uFF1A</li>\n</ul>\n<pre><code>[\u94FE\u63A5\u540D\u79F0][1]\n\n [1]: \u94FE\u63A5\u5730\u5740\n</code></pre>\n<h4>2. \u56FE\u7247</h4>\n<ul>\n<li>\u884C\u5185\u5F0F\uFF1A</li>\n</ul>\n<pre><code>![\u56FE\u7247\u540D\u79F0](\u56FE\u7247\u5730\u5740)\n</code></pre>\n<ul>\n<li>\u53C2\u8003\u5F0F\uFF1A</li>\n</ul>\n<pre><code>![\u56FE\u7247\u540D\u79F0][2]\n\n[2]: \u56FE\u7247\u5730\u5740 &quot;\u53EF\u9009\u7684\u6807\u9898\u6587\u5B57&quot;\n</code></pre>\n<h4>3. \u4EE3\u7801\u5757</h4>\n<ul>\n<li>\u884C\u5185\u5F0F\uFF1A</li>\n</ul>\n<pre><code>`\u4EE3\u7801\u5185\u5BB9`\n</code></pre>\n<ul>\n<li>\u4EE3\u7801\u5757\uFF1A</li>\n</ul>\n<pre><code>``` \u4EE3\u7801\u8BED\u8A00\n\u4EE3\u7801\u5185\u5BB9\n\n```cpp\n#include &lt;iostream&gt;\n\nint main() {\n    std::cout &lt;&lt; &quot;Hello, world!&quot; &lt;&lt; std::endl;\n    return 0;\n}\n\n\n```python\nprint(&quot;Hello, world!&quot;)\n</code></pre>\n<pre><code>\n</code></pre>\n<pre><code>\n```python\nprint(&quot;Hello, world!&quot;)\n</code></pre>\n<pre><code class="language-cpp">#include &lt;iostream&gt;\n\nint main() {\n    std::cout &lt;&lt; &quot;Hello, world!&quot; &lt;&lt; std::endl;\n    return 0;\n}\n</code></pre>\n<h2>4.\u5DE5\u5177\u63A8\u8350</h2>\n<ul>\n<li><a href="https://typoraio.cn/">Typora</a><blockquote>\n<p>\u5546\u4E1A\u8F6F\u4EF6\uFF08\u975E\u5F00\u6E90\uFF09,\u5168\u7F51\u76EE\u524D\u98CE\u8BC4\u8F83\u9AD8\u7684MD\u7F16\u8F91\u5668</p>\n</blockquote>\n</li>\n<li><a href="https://code.visualstudio.com/">VS Code</a><blockquote>\n<p>\u514D\u8D39\u5F00\u6E90\u7684\u7F16\u8F91\u5668\uFF0C\u652F\u6301MD\u8BED\u6CD5\u9AD8\u4EAE\uFF0C\u63D2\u4EF6\u4E30\u5BCC\uFF0C\u529F\u80FD\u5F3A\u5927,<em>\u63A8\u8350\u4F7F\u7528</em>,\u5E76\u4E14\u63A8\u8350\u4E00\u4E2AMD\u63D2\u4EF6<a href="https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced">markdown-preview-enhanced</a>,\u8FD9\u4E2A\u63D2\u4EF6\u652F\u6301xaringan\u3001reveal.js\u3001markdown-it\u7B49\u591A\u79CD\u6E32\u67D3\u65B9\u5F0F\uFF0C\u53EF\u4EE5\u5F88\u65B9\u4FBF\u5730\u5C06MD\u6587\u4EF6\u6E32\u67D3\u6210HTML\u3001PDF\u3001PPT\u7B49\u683C\u5F0F,\u5E76\u4E14\u7528\u8D77\u6765\u6BD4\u4E00\u4E9B\u5546\u4E1A\u8F6F\u4EF6\u66F4\u52A0\u987A\u624B,\u5E76\u4E14\u6BD4\u5176\u5B83\u90E8\u5206\u542F\u52A8\u66F4\u5FEB,\u4F46\u662F\u4E0D\u652F\u6301\u6240\u89C1\u5373\u6240\u5F97\u7684\u9884\u89C8\u6A21\u5F0F.</p>\n</blockquote>\n</li>\n</ul>\n<blockquote>\n<p>\u5927\u5BB6\u53EF\u4EE5\u4F7F\u7528 <a href="https://commonmark.org/help/">commonmark.org</a>10\u5206\u949F\u5FEB\u901F\u5165\u95E8Markdown\u8BED\u6CD5</p>\n</blockquote>\n'
    },
    {
      slug: "Git\u4F7F\u7528\u5165\u95E8",
      title: "Git\u7248\u672C\u63A7\u5236\u6838\u5FC3\u539F\u7406\u4E0E\u64CD\u4F5C\u6307\u5357",
      date: "2025-10-08T11:02:53.000Z",
      tags: [
        "\u8BA1\u7B97\u673A\u57FA\u7840"
      ],
      excerpt: "\r\n Git\u7684\u6A21\u578B\u4E0E\u57FA\u7840\u64CD\u4F5C\r\n\r\n> \u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684\u8BA1\u7B97\u673A\u5E38\u7528\u5DE5\u5177\u5165\u95E8\u6559\u7A0B\u4E4BGit\u3002\u4F5C\u4E3A\u4E00\u540D\u8BA1\u7B97\u673A\u5B66\u4E60\u8005\uFF0C\u5B66\u4F1A\u6839\u636E\u4E0D\u540C\u573A\u666F\u9009\u62E9\u5408\u9002\u7684\u5DE5\u5177\u81F3\u5173\u91CD\u8981\uFF0C\u5B83\u80FD\u591F\u663E\u8457\u63D0\u5347\u5DE5\u4F5C\u6548\u7387\u3002\u540C\u65F6\uFF0C\u5F3A\u5927\u7684\u641C\u7D22\u80FD\u529B\u548C\u6587\u6863\u9605\u8BFB\u6280\u5DE7\u4E5F\u6781\u4E3A\u91CD\u8981\u3002\r\n\r\nGit\u662F\u4E00\u6B3E\u7248\u672C\u63A7\u5236\u5DE5\u5177\uFF0C\u8FD9\u7C7B\u5DE5\u5177\u4E3B\u8981\u7528\u4E8E\u8FFD\u8E2A\u6E90\u4EE3\u7801\u3001\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u7684\u53D8\u5316\u3002\u4F7F\u7528Git\u53EF\u4EE5\u8F7B\u677E\u5730\u5BF9\u4EE3\u7801\u8FDB\u884C\u56DE\u6EAF\u7B49\u64CD\u4F5C\u3002\u7279\u522B\u662F\u5728\u56E2\u961F\u534F\u4F5C\u4E2D\uFF0CGit\u5C24\u4E3A\u4FBF\u6377...",
      content: '<h1>Git\u7684\u6A21\u578B\u4E0E\u57FA\u7840\u64CD\u4F5C</h1>\n<blockquote>\n<p>\u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684\u8BA1\u7B97\u673A\u5E38\u7528\u5DE5\u5177\u5165\u95E8\u6559\u7A0B\u4E4BGit\u3002\u4F5C\u4E3A\u4E00\u540D\u8BA1\u7B97\u673A\u5B66\u4E60\u8005\uFF0C\u5B66\u4F1A\u6839\u636E\u4E0D\u540C\u573A\u666F\u9009\u62E9\u5408\u9002\u7684\u5DE5\u5177\u81F3\u5173\u91CD\u8981\uFF0C\u5B83\u80FD\u591F\u663E\u8457\u63D0\u5347\u5DE5\u4F5C\u6548\u7387\u3002\u540C\u65F6\uFF0C\u5F3A\u5927\u7684\u641C\u7D22\u80FD\u529B\u548C\u6587\u6863\u9605\u8BFB\u6280\u5DE7\u4E5F\u6781\u4E3A\u91CD\u8981\u3002</p>\n</blockquote>\n<p>Git\u662F\u4E00\u6B3E\u7248\u672C\u63A7\u5236\u5DE5\u5177\uFF0C\u8FD9\u7C7B\u5DE5\u5177\u4E3B\u8981\u7528\u4E8E\u8FFD\u8E2A\u6E90\u4EE3\u7801\u3001\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u7684\u53D8\u5316\u3002\u4F7F\u7528Git\u53EF\u4EE5\u8F7B\u677E\u5730\u5BF9\u4EE3\u7801\u8FDB\u884C\u56DE\u6EAF\u7B49\u64CD\u4F5C\u3002\u7279\u522B\u662F\u5728\u56E2\u961F\u534F\u4F5C\u4E2D\uFF0CGit\u5C24\u4E3A\u4FBF\u6377\uFF1A\u6BCF\u4F4D\u8D21\u732E\u8005\u7684\u4EE3\u7801\u90FD\u80FD\u88AB\u6253\u4E0A\u6807\u7B7E\u5E76\u4FDD\u5B58\u5176\u4E2A\u4EBA\u4FE1\u606F\uFF0C\u4FBF\u4E8E\u540E\u7EED\u7684\u4EE3\u7801\u7BA1\u7406\u3002\u6B64\u5916\uFF0C\u7531\u4E8EGit\u91C7\u7528\u5206\u5E03\u5F0F\u67B6\u6784\uFF0C\u6BCF\u4F4D\u5F00\u53D1\u4EBA\u5458\u5747\u53EF\u5728\u672C\u5730\u5B8C\u6574\u5B58\u50A8\u6E90\u4EE3\u7801\u526F\u672C\u3002\u4E0D\u4EC5\u5982\u6B64\uFF0CGit\u8FD8\u96C6\u6210\u4E86\u5206\u652F\u7BA1\u7406\u548C\u51B2\u7A81\u89E3\u51B3\u65B9\u6848\u7B49\u591A\u9879\u529F\u80FD\u3002</p>\n<h2>\u5FEB\u7167</h2>\n<p>\u5982\u540C\u4E00\u53F0\u76F8\u673A\uFF0CGit\u80FD\u591F\u6355\u6349\u5230\u5F53\u524D\u9879\u76EE\u7684\u6574\u4F53\u72B6\u6001\uFF08\u6DB5\u76D6\u6240\u6709\u6587\u4EF6\u5939\u53CA\u5B50\u76EE\u5F55\uFF09\uFF0C\u751F\u6210\u4E00\u4EFD\u8BE6\u5C3D\u7684\u201C\u7167\u7247\u201D\u3002\u4E00\u65E6\u9700\u8981\u67E5\u770B\u5386\u53F2\u8BB0\u5F55\u4E2D\u7684\u67D0\u4E2A\u7279\u5B9A\u65F6\u523B\u7684\u72B6\u6001\uFF0C\u53EA\u9700\u5B9A\u4F4D\u81F3\u76F8\u5E94\u7684\u5FEB\u7167\u5373\u53EF\u83B7\u53D6\u5F53\u65F6\u5B8C\u6574\u7684\u9879\u76EE\u89C6\u56FE\uFF0C\u5176\u4E2D\u5305\u62EC\u4E86\u5177\u4F53\u7684\u4F5C\u8005\u4FE1\u606F\u4E0E\u63D0\u4EA4\u8BE6\u60C5\u3002\u4E3A\u4E86\u9AD8\u6548\u5229\u7528\u7A7A\u95F4\u8D44\u6E90\uFF0C\u9488\u5BF9\u672A\u66FE\u53D8\u52A8\u8FC7\u7684\u6570\u636E\u90E8\u5206\uFF0C\u5219\u901A\u8FC7\u6307\u9488\u673A\u5236\u76F4\u63A5\u6307\u5411\u5148\u524D\u7248\u672C\u7684\u6570\u636E\u5757\u6765\u5B9E\u73B0\u8282\u7EA6\u5927\u91CF\u5B58\u50A8\u7684\u76EE\u7684\u3002</p>\n<hr>\n<p><strong>\u5728git\u7684\u4E13\u4E1A\u672F\u8BED\u4E2D</strong>: \u6587\u4EF6\u88AB\u79F0\u4E3Ablob\uFF0C\u6587\u4EF6\u5939\u88AB\u79F0\u4E3Atree\u3002</p>\n<h3>\u4F8B\u5982:</h3>\n<pre><code class="language-bash">&lt;root&gt; (tree)\n|\n+- foo (tree)\n|  |\n|  + bar.txt (blob, contents = &quot;hello world&quot;)\n|\n+- baz.txt (blob, contents = &quot;git is wonderful&quot;)\n</code></pre>\n<p>\u8FD9\u4E2A\u6811\u5305\u542B\u4E86\u4E24\u4E2A\u5143\u7D20\uFF0C\u4E00\u4E2A\u540D\u4E3A \u201Cfoo\u201D \u7684\u6811\uFF08\u5B83\u672C\u8EAB\u5305\u542B\u4E86\u4E00\u4E2A blob \u5BF9\u8C61 \u201Cbar.txt\u201D\uFF09\uFF0C\u4EE5\u53CA\u4E00\u4E2A blob \u5BF9\u8C61 \u201Cbaz.txt\u201D\u3002</p>\n<h2>\u5386\u53F2\u8BB0\u5F55</h2>\n<p>Git\u7684\u5386\u53F2\u8BB0\u5F55\u662F\u57FA\u4E8E\u5FEB\u7167\u6784\u5EFA\u7684\uFF0C\u76F8\u5F53\u4E8E\u4E00\u7EC4\u6309\u65F6\u95F4\u6392\u5217\u7684\u7167\u7247\u3002\u6BCF\u4E00\u6B21\u63D0\u4EA4\u90FD\u662F\u4E00\u5F20\u7167\u7247\uFF0C\u5305\u542B\u4E86\u9879\u76EE\u7684\u5B8C\u6574\u72B6\u6001\uFF0C\u5305\u62EC\u6240\u6709\u6587\u4EF6\u53CA\u5176\u5185\u5BB9\u3002\u901A\u8FC7\u67E5\u770B\u5386\u53F2\u8BB0\u5F55\uFF0C\u53EF\u4EE5\u4E86\u89E3\u9879\u76EE\u7684\u6F14\u53D8\u8FC7\u7A0B\uFF0C\u4EE5\u53CA\u6BCF\u4E2A\u7248\u672C\u7684\u5177\u4F53\u4FEE\u6539\u5185\u5BB9\u3002</p>\n<hr>\n<p><strong>\u5728git\u7684\u4E13\u4E1A\u672F\u8BED\u4E2D</strong>: \u63D0\u4EA4\u88AB\u79F0\u4E3Acommit\uFF0C\u5B83\u5305\u542B\u4E00\u4E2A\u552F\u4E00\u7684\u6807\u8BC6\u7B26\uFF08commit hash\uFF09\uFF0C\u4EE5\u53CA\u4E00\u4E2A\u6307\u5411\u7236\u63D0\u4EA4\uFF08parent commit\uFF09\u7684\u6307\u9488\u3002\u5386__\u53F2\u8BB0\u5F55\u662F\u7531\u5FEB\u7167\u7EC4\u6210\u7684\u6709\u5411\u65E0\u73AF\u56FE\u3002</p>\n<p>\u5728 Git \u4E2D\uFF0C\u8FD9\u4E9B\u5FEB\u7167\u88AB\u79F0\u4E3A\u201C\u63D0\u4EA4\u201D\u3002\u901A\u8FC7\u53EF\u89C6\u5316\u7684\u65B9\u5F0F\u6765\u8868\u793A\u8FD9\u4E9B\u5386\u53F2\u63D0\u4EA4\u8BB0\u5F55\u65F6\uFF0C\u770B\u8D77\u6765\u5DEE\u4E0D\u591A\u662F\u8FD9\u6837\u7684\uFF1A</p>\n<pre><code class="language-bash">o &lt;-- o &lt;-- o &lt;-- o\n            ^\n             \\\n              --- o &lt;-- o\n</code></pre>\n<p>\u7BAD\u5934\u6307\u5411\u4E86\u5F53\u524D\u63D0\u4EA4\u7684\u7236\u8F88\uFF08\u8FD9\u662F\u4E00\u79CD\u201C\u5728\u2026\u4E4B\u524D\u201D\uFF0C\u800C\u4E0D\u662F\u201C\u5728\u2026\u4E4B\u540E\u201D\u7684\u5173\u7CFB\uFF09\u3002\u5728\u7B2C\u4E09\u6B21\u63D0\u4EA4\u4E4B\u540E\uFF0C\u5386\u53F2\u8BB0\u5F55\u5206\u5C94\u6210\u4E86\u4E24\u6761\u72EC\u7ACB\u7684\u5206\u652F\u3002\u8FD9\u53EF\u80FD\u56E0\u4E3A\u6B64\u65F6\u9700\u8981\u540C\u65F6\u5F00\u53D1\u4E24\u4E2A\u4E0D\u540C\u7684\u7279\u6027\uFF0C\u5B83\u4EEC\u4E4B\u95F4\u662F\u76F8\u4E92\u72EC\u7ACB\u7684\u3002\u5F00\u53D1\u5B8C\u6210\u540E\uFF0C\u8FD9\u4E9B\u5206\u652F\u53EF\u80FD\u4F1A\u88AB\u5408\u5E76\u5E76\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u63D0\u4EA4\uFF0C\u8FD9\u4E2A\u65B0\u7684\u63D0\u4EA4\u4F1A\u540C\u65F6\u5305\u542B\u8FD9\u4E9B\u7279\u6027\u3002\u65B0\u7684\u63D0\u4EA4\u4F1A\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u5386\u53F2\u8BB0\u5F55\uFF0C\u770B\u4E0A\u53BB\u50CF\u8FD9\u6837\uFF08\u6700\u65B0\u7684\u5408\u5E76\u63D0\u4EA4\u7528\u7C97\u4F53\u6807\u8BB0\uFF09\uFF1A</p>\n<pre><code class="language-bash">o &lt;-- o &lt;-- o &lt;-- o &lt;----  o \n            ^            /\n             \\          v\n              --- o &lt;-- o\n</code></pre>\n<p>\u6CE8\uFF1AGit \u4E2D\u7684\u63D0\u4EA4\u662F\u4E0D\u53EF\u6539\u53D8\u7684\u3002\u4F46\u8FD9\u5E76\u4E0D\u4EE3\u8868\u9519\u8BEF\u4E0D\u80FD\u88AB\u4FEE\u6539\uFF0C\u53EA\u4E0D\u8FC7\u8FD9\u79CD\u201C\u4FEE\u6539\u201D\u5B9E\u9645\u4E0A\u662F\u521B\u5EFA\u4E86\u4E00\u4E2A\u5168\u65B0\u7684\u63D0\u4EA4\u8BB0\u5F55\u3002</p>\n<h2>\u6570\u636E\u6A21\u578B\u53CA\u5176\u4F2A\u4EE3\u7801\u8868\u793A</h2>\n<p>\u4EE5\u4F2A\u4EE3\u7801\u7684\u5F62\u5F0F\u6765\u5B66\u4E60 Git \u7684\u6570\u636E\u6A21\u578B\uFF0C\u53EF\u80FD\u66F4\u52A0\u6E05\u6670\uFF1A</p>\n<pre><code class="language-python">// \u6587\u4EF6\u5C31\u662F\u4E00\u7EC4\u6570\u636E\ntype blob = array&lt;byte&gt;\n\n// \u4E00\u4E2A\u5305\u542B\u6587\u4EF6\u548C\u76EE\u5F55\u7684\u76EE\u5F55\ntype tree = map&lt;string, tree | blob&gt;\n\n// \u6BCF\u4E2A\u63D0\u4EA4\u90FD\u5305\u542B\u4E00\u4E2A\u7236\u8F88\uFF0C\u5143\u6570\u636E\u548C\u9876\u5C42\u6811\ntype commit = struct {\n    parents: array&lt;commit&gt;\n    author: string\n    message: string\n    snapshot: tree\n}\n</code></pre>\n<p>\u8FD9\u662F\u4E00\u79CD\u7B80\u6D01\u7684\u5386\u53F2\u6A21\u578B\u3002</p>\n<p>Git \u4E2D\u7684\u5BF9\u8C61\u53EF\u4EE5\u662F blob\u3001\u6811\u6216\u63D0\u4EA4\uFF1A</p>\n<pre><code>type object = blob | tree | commit\n</code></pre>\n<p>Git \u5728\u50A8\u5B58\u6570\u636E\u65F6\uFF0C\u6240\u6709\u7684\u5BF9\u8C61\u90FD\u4F1A\u57FA\u4E8E\u5B83\u4EEC\u7684 <a href="https://en.wikipedia.org/wiki/SHA-1">SHA-1 \u54C8\u5E0C</a> \u8FDB\u884C\u5BFB\u5740\u3002</p>\n<pre><code>objects = map&lt;string, object&gt;\n\ndef store(object):\n    id = sha1(object)\n    objects[id] = object\n\ndef load(id):\n    return objects[id]\n</code></pre>\n<p>Blobs\u3001\u6811\u548C\u63D0\u4EA4\u90FD\u4E00\u6837\uFF0C\u5B83\u4EEC\u90FD\u662F\u5BF9\u8C61\u3002\u5F53\u5B83\u4EEC\u5F15\u7528\u5176\u4ED6\u5BF9\u8C61\u65F6\uFF0C\u5B83\u4EEC\u5E76\u6CA1\u6709\u771F\u6B63\u7684\u5728\u786C\u76D8\u4E0A\u4FDD\u5B58\u8FD9\u4E9B\u5BF9\u8C61\uFF0C\u800C\u662F\u4EC5\u4EC5\u4FDD\u5B58\u4E86\u5B83\u4EEC\u7684\u54C8\u5E0C\u503C\u4F5C\u4E3A\u5F15\u7528\u3002</p>\n<p>\u4F8B\u5982\uFF0C<a href="#snapshots">\u4E0A\u9762</a> \u4F8B\u5B50\u4E2D\u7684\u6811\uFF08\u53EF\u4EE5\u901A\u8FC7 <code>git cat-file -p 698281bc680d1995c5f4caaf3359721a5a58d48d</code> \u6765\u8FDB\u884C\u53EF\u89C6\u5316\uFF09\uFF0C\u770B\u4E0A\u53BB\u662F\u8FD9\u6837\u7684\uFF1A</p>\n<pre><code>100644 blob 4448adbf7ecd394f42ae135bbeed9676e894af85    baz.txt\n040000 tree c68d233a33c5c06e0340e4c224f0afca87c8ce87    foo\n</code></pre>\n<p>\u6811\u672C\u8EAB\u4F1A\u5305\u542B\u4E00\u4E9B\u6307\u5411\u5176\u4ED6\u5185\u5BB9\u7684\u6307\u9488\uFF0C\u4F8B\u5982 <code>baz.txt</code> (blob) \u548C <code>foo</code>\n(\u6811)\u3002\u5982\u679C\u6211\u4EEC\u7528 <code>git cat-file -p 4448adbf7ecd394f42ae135bbeed9676e894af85</code>\uFF0C\u5373\u901A\u8FC7\u54C8\u5E0C\u503C\u67E5\u770B baz.txt \u7684\u5185\u5BB9\uFF0C\u4F1A\u5F97\u5230\u4EE5\u4E0B\u4FE1\u606F\uFF1A</p>\n<pre><code>git is wonderful\n</code></pre>\n<h2>\u5F15\u7528</h2>\n<p>\u73B0\u5728\uFF0C\u6240\u6709\u7684\u5FEB\u7167\u90FD\u53EF\u4EE5\u901A\u8FC7\u5B83\u4EEC\u7684 SHA-1 \u54C8\u5E0C\u503C\u6765\u6807\u8BB0\u4E86\u3002\u4F46\u8FD9\u4E5F\u592A\u4E0D\u65B9\u4FBF\u4E86\uFF0C\u8C01\u4E5F\u8BB0\u4E0D\u4F4F\u4E00\u4E32 40 \u4F4D\u7684\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u3002</p>\n<p>\u9488\u5BF9\u8FD9\u4E00\u95EE\u9898\uFF0CGit \u7684\u89E3\u51B3\u65B9\u6CD5\u662F\u7ED9\u8FD9\u4E9B\u54C8\u5E0C\u503C\u8D4B\u4E88\u4EBA\u7C7B\u53EF\u8BFB\u7684\u540D\u5B57\uFF0C\u4E5F\u5C31\u662F\u5F15\u7528\uFF08references\uFF09\u3002\u5F15\u7528\u662F\u6307\u5411\u63D0\u4EA4\u7684\u6307\u9488\u3002\u4E0E\u5BF9\u8C61\u4E0D\u540C\u7684\u662F\uFF0C\u5B83\u662F\u53EF\u53D8\u7684\uFF08\u5F15\u7528\u53EF\u4EE5\u88AB\u66F4\u65B0\uFF0C\u6307\u5411\u65B0\u7684\u63D0\u4EA4\uFF09\u3002\u4F8B\u5982\uFF0C<code>master</code> \u5F15\u7528\u901A\u5E38\u4F1A\u6307\u5411\u4E3B\u5206\u652F\u7684\u6700\u65B0\u4E00\u6B21\u63D0\u4EA4\u3002</p>\n<pre><code>references = map&lt;string, string&gt;\n\ndef update_reference(name, id):\n    references[name] = id\n\ndef read_reference(name):\n    return references[name]\n\ndef load_reference(name_or_id):\n    if name_or_id in references:\n        return load(references[name_or_id])\n    else:\n        return load(name_or_id)\n</code></pre>\n<p>\u8FD9\u6837\uFF0CGit \u5C31\u53EF\u4EE5\u4F7F\u7528\u8BF8\u5982 &quot;master&quot; \u8FD9\u6837\u4EBA\u7C7B\u53EF\u8BFB\u7684\u540D\u79F0\u6765\u8868\u793A\u5386\u53F2\u8BB0\u5F55\u4E2D\u67D0\u4E2A\u7279\u5B9A\u7684\u63D0\u4EA4\uFF0C\u800C\u4E0D\u9700\u8981\u5728\u4F7F\u7528\u4E00\u957F\u4E32\u5341\u516D\u8FDB\u5236\u5B57\u7B26\u4E86\u3002</p>\n<p>\u6709\u4E00\u4E2A\u7EC6\u8282\u9700\u8981\u6211\u4EEC\u6CE8\u610F\uFF0C \u901A\u5E38\u60C5\u51B5\u4E0B\uFF0C\u6211\u4EEC\u4F1A\u60F3\u8981\u77E5\u9053\u201C\u6211\u4EEC\u5F53\u524D\u6240\u5728\u4F4D\u7F6E\u201D\uFF0C\u5E76\u5C06\u5176\u6807\u8BB0\u4E0B\u6765\u3002\u8FD9\u6837\u5F53\u6211\u4EEC\u521B\u5EFA\u65B0\u7684\u5FEB\u7167\u7684\u65F6\u5019\uFF0C\u6211\u4EEC\u5C31\u53EF\u4EE5\u77E5\u9053\u5B83\u7684\u76F8\u5BF9\u4F4D\u7F6E\uFF08\u5982\u4F55\u8BBE\u7F6E\u5B83\u7684\u201C\u7236\u8F88\u201D\uFF09\u3002\u5728 Git \u4E2D\uFF0C\u6211\u4EEC\u5F53\u524D\u7684\u4F4D\u7F6E\u6709\u4E00\u4E2A\u7279\u6B8A\u7684\u7D22\u5F15\uFF0C\u5B83\u5C31\u662F &quot;HEAD&quot;\u3002</p>\n<h2>\u4ED3\u5E93</h2>\n<p>\u6700\u540E\uFF0C\u6211\u4EEC\u53EF\u4EE5\u7C97\u7565\u5730\u7ED9\u51FA Git \u4ED3\u5E93\u7684\u5B9A\u4E49\u4E86\uFF1A<code>\u5BF9\u8C61</code> \u548C <code>\u5F15\u7528</code>\u3002</p>\n<p>\u5728\u786C\u76D8\u4E0A\uFF0CGit \u4EC5\u5B58\u50A8\u5BF9\u8C61\u548C\u5F15\u7528\uFF1A\u56E0\u4E3A\u5176\u6570\u636E\u6A21\u578B\u4EC5\u5305\u542B\u8FD9\u4E9B\u4E1C\u897F\u3002\u6240\u6709\u7684 <code>git</code> \u547D\u4EE4\u90FD\u5BF9\u5E94\u7740\u5BF9\u63D0\u4EA4\u6811\u7684\u64CD\u4F5C\uFF0C\u4F8B\u5982\u589E\u52A0\u5BF9\u8C61\uFF0C\u589E\u52A0\u6216\u5220\u9664\u5F15\u7528\u3002</p>\n<p>\u5F53\u60A8\u8F93\u5165\u67D0\u4E2A\u6307\u4EE4\u65F6\uFF0C\u8BF7\u601D\u8003\u4E00\u4E0B\u8FD9\u6761\u547D\u4EE4\u662F\u5982\u4F55\u5BF9\u5E95\u5C42\u7684\u56FE\u6570\u636E\u7ED3\u6784\u8FDB\u884C\u64CD\u4F5C\u7684\u3002\u53E6\u4E00\u65B9\u9762\uFF0C\u5982\u679C\u60A8\u5E0C\u671B\u4FEE\u6539\u63D0\u4EA4\u6811\uFF0C\u4F8B\u5982\u201C\u4E22\u5F03\u672A\u63D0\u4EA4\u7684\u4FEE\u6539\u548C\u5C06 \u2018master\u2019 \u5F15\u7528\u6307\u5411\u63D0\u4EA4 <code>5d83f9e</code> \u65F6\uFF0C\u6709\u4EC0\u4E48\u547D\u4EE4\u53EF\u4EE5\u5B8C\u6210\u8BE5\u64CD\u4F5C\uFF08\u9488\u5BF9\u8FD9\u4E2A\u5177\u4F53\u95EE\u9898\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528 <code>git checkout master; git reset --hard 5d83f9e</code>\uFF09</p>\n<h2>\u6682\u5B58\u533A</h2>\n<p>Git \u4E2D\u8FD8\u5305\u62EC\u4E00\u4E2A\u548C\u6570\u636E\u6A21\u578B\u5B8C\u5168\u4E0D\u76F8\u5173\u7684\u6982\u5FF5\uFF0C\u4F46\u5B83\u786E\u662F\u521B\u5EFA\u63D0\u4EA4\u7684\u63A5\u53E3\u7684\u4E00\u90E8\u5206\u3002</p>\n<p>\u5C31\u4E0A\u9762\u4ECB\u7ECD\u7684\u5FEB\u7167\u7CFB\u7EDF\u6765\u8BF4\uFF0C\u60A8\u4E5F\u8BB8\u4F1A\u671F\u671B\u5B83\u7684\u5B9E\u73B0\u91CC\u5305\u62EC\u4E00\u4E2A \u201C\u521B\u5EFA\u5FEB\u7167\u201D \u7684\u547D\u4EE4\uFF0C\u8BE5\u547D\u4EE4\u80FD\u591F\u57FA\u4E8E\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u7684\u5F53\u524D\u72B6\u6001\u521B\u5EFA\u4E00\u4E2A\u5168\u65B0\u7684\u5FEB\u7167\u3002\u6709\u4E9B\u7248\u672C\u63A7\u5236\u7CFB\u7EDF\u786E\u5B9E\u662F\u8FD9\u6837\u5DE5\u4F5C\u7684\uFF0C\u4F46 Git \u4E0D\u662F\u3002\u6211\u4EEC\u5E0C\u671B\u7B80\u6D01\u7684\u5FEB\u7167\uFF0C\u800C\u4E14\u6BCF\u6B21\u4ECE\u5F53\u524D\u72B6\u6001\u521B\u5EFA\u5FEB\u7167\u53EF\u80FD\u6548\u679C\u5E76\u4E0D\u7406\u60F3\u3002\u4F8B\u5982\uFF0C\u8003\u8651\u5982\u4E0B\u573A\u666F\uFF0C\u60A8\u5F00\u53D1\u4E86\u4E24\u4E2A\u72EC\u7ACB\u7684\u7279\u6027\uFF0C\u7136\u540E\u60A8\u5E0C\u671B\u521B\u5EFA\u4E24\u4E2A\u72EC\u7ACB\u7684\u63D0\u4EA4\uFF0C\u5176\u4E2D\u7B2C\u4E00\u4E2A\u63D0\u4EA4\u4EC5\u5305\u542B\u7B2C\u4E00\u4E2A\u7279\u6027\uFF0C\u800C\u7B2C\u4E8C\u4E2A\u63D0\u4EA4\u4EC5\u5305\u542B\u7B2C\u4E8C\u4E2A\u7279\u6027\u3002\u6216\u8005\uFF0C\u5047\u8BBE\u60A8\u5728\u8C03\u8BD5\u4EE3\u7801\u65F6\u6DFB\u52A0\u4E86\u5F88\u591A\u6253\u5370\u8BED\u53E5\uFF0C\u7136\u540E\u60A8\u4EC5\u4EC5\u5E0C\u671B\u63D0\u4EA4\u548C\u4FEE\u590D bug \u76F8\u5173\u7684\u4EE3\u7801\u800C\u4E22\u5F03\u6240\u6709\u7684\u6253\u5370\u8BED\u53E5\u3002</p>\n<p>Git \u5904\u7406\u8FD9\u4E9B\u573A\u666F\u7684\u65B9\u6CD5\u662F\u4F7F\u7528\u4E00\u79CD\u53EB\u505A \u201C\u6682\u5B58\u533A\uFF08staging area\uFF09\u201D\u7684\u673A\u5236\uFF0C\u5B83\u5141\u8BB8\u60A8\u6307\u5B9A\u4E0B\u6B21\u5FEB\u7167\u4E2D\u8981\u5305\u62EC\u90A3\u4E9B\u6539\u52A8\u3002</p>\n<h2>Git \u5B89\u88C5\u4E0E\u4F7F\u7528</h2>\n<h3>\u5B89\u88C5</h3>\n<h4>\u547D\u4EE4\u884C\u7248\u672C</h4>\n<ul>\n<li><p>Windows:</p>\n<ul>\n<li>\u76F4\u63A5\u4E0B\u8F7D\u5B89\u88C5\u6587\u4EF6\n<a href="https://git-scm.com/download/win">Git for Windows</a></li>\n<li>Winget \u5B89\u88C5 <code>winget install git.git</code></li>\n<li>Chocolatey \u5B89\u88C5 <code>choco install git</code></li>\n<li>scoop \u5B89\u88C5 <code>scoop install git</code></li>\n</ul>\n</li>\n<li><p>linux:</p>\n<ul>\n<li>Debian/Ubuntu: <code>sudo apt-get install git</code></li>\n<li>Fedora/CentOS/RHEL: <code>sudo yum install git</code> or <code>sudo dnf install git</code></li>\n<li>Arch Linux: <code>sudo pacman -S git</code></li>\n<li>openSUSE: <code>sudo zypper install git</code></li>\n</ul>\n</li>\n<li><p>macOS: <code>brew install git</code></p>\n</li>\n</ul>\n<p>\u5B89\u88C5\u540E\u68C0\u6D4B\u662F\u5426\u5B89\u88C5\u6210\u529F\uFF1A<code>git --version</code>\n<img src="./img/git/image_1.png" alt="alt text"></p>\n<h4>GUI\u7248\u672C</h4>\n<ul>\n<li><a href="https://desktop.github.com/">GitHub Desktop</a></li>\n<li><a href="https://www.gitkraken.com/">GitKraken</a></li>\n</ul>\n<blockquote>\n<p>\u5F53\u7136\u6211\u4F9D\u7136\u63A8\u8350\u5148\u4F7F\u7528\u597D\u547D\u4EE4\u884C\u7248\u672C\uFF0C\u518D\u4F7F\u7528 GUI\u7248\u672C\u3002\u4E00\u4E9B\u4EE3\u7801\u7F16\u8F91\u5668\u548CIDE\u90FD\u5185\u7F6E\u4E86\u4E00\u4E9BGit\u63D2\u4EF6\u4E5F\u53EF\u4EE5\u514D\u53BB\u547D\u4EE4\u884C\u7684\u4F7F\u7528\uFF0C\u4F46\u662F\u53EA\u6709\u9996\u5148\u7406\u89E3\u4E86Git\u7684\u57FA\u672C\u6982\u5FF5\u548C\u547D\u4EE4\uFF0C\u624D\u80FD\u66F4\u597D\u5730\u4F7F\u7528\u8FD9\u4E9B\u5DE5\u5177\u3002</p>\n</blockquote>\n<h3>Git \u521D\u59CB\u914D\u7F6E</h3>\n<ul>\n<li><code>git config --global user.name &quot;your name&quot;</code>: \u8BBE\u7F6E\u7528\u6237\u540D</li>\n<li><code>git config --global user.email &quot;your email&quot;</code>: \u8BBE\u7F6E\u7528\u6237\u90AE\u7BB1</li>\n<li>\u6DFB\u52A0Github SSH key\u5230SSH agent: <code>ssh-keygen -t ed25519 -C &quot;your email&quot;</code> \u7136\u540E\u590D\u5236\u751F\u6210\u7684\u516C\u94A5\u5230Github\u7684SSH key\u4E2D\u3002\uFF08\u53EF\u9009\uFF09</li>\n</ul>\n<pre><code class="language-1.">2. \u5728\u8FB9\u680F\u7684\u201CAccess\u201D\u90E8\u5206\u4E2D\uFF0C\u5355\u51FB \u201CSSH and GPG keys\u201D\n3. \u5355\u51FB\u201C\u65B0\u5EFA SSH \u5BC6\u94A5\u201D\u6216\u201C\u6DFB\u52A0 SSH \u5BC6\u94A5\u201D \u3002\n4. \u5728 &quot;Title&quot;\uFF08\u6807\u9898\uFF09\u5B57\u6BB5\u4E2D\uFF0C\u4E3A\u65B0\u5BC6\u94A5\u6DFB\u52A0\u63CF\u8FF0\u6027\u6807\u7B7E\u3002 \u4F8B\u5982\uFF0C\u5982\u679C\u4F7F\u7528\u7684\u662F\u4E2A\u4EBA\u7B14\u8BB0\u672C\u7535\u8111\uFF0C\u5219\u53EF\u4EE5\u5C06\u6B64\u5BC6\u94A5\u79F0\u4E3A\u201C\u4E2A\u4EBA\u7B14\u8BB0\u672C\u7535\u8111\u201D\u3002\n5. \u5728\u201C\u5BC6\u94A5\u201D\u5B57\u6BB5\u4E2D\uFF0C\u7C98\u8D34\u516C\u94A5\u3002\n6. \u5355\u51FB\u201C\u6DFB\u52A0 SSH \u5BC6\u94A5\u201D\u3002\n</code></pre>\n<p><img src="images/Git%E4%BD%BF%E7%94%A8%E5%85%A5%E9%97%A8/1760152030554.png" alt="1760152030554"></p>\n<h3>Git \u547D\u4EE4</h3>\n<ul>\n<li><code>git help &lt;command&gt;</code>: \u83B7\u53D6 git \u547D\u4EE4\u7684\u5E2E\u52A9\u4FE1\u606F</li>\n<li><code>git init</code>: \u521B\u5EFA\u4E00\u4E2A\u65B0\u7684 git \u4ED3\u5E93\uFF0C\u5176\u6570\u636E\u4F1A\u5B58\u653E\u5728\u4E00\u4E2A\u540D\u4E3A <code>.git</code> \u7684\u76EE\u5F55\u4E0B</li>\n<li><code>git status</code>: \u663E\u793A\u5F53\u524D\u7684\u4ED3\u5E93\u72B6\u6001</li>\n<li><code>git add &lt;filename&gt;</code>: \u6DFB\u52A0\u6587\u4EF6\u5230\u6682\u5B58\u533A</li>\n<li><code>git commit</code>: \u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u63D0\u4EA4<ul>\n<li>\u5982\u4F55\u7F16\u5199 <a href="https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html">\u826F\u597D\u7684\u63D0\u4EA4\u4FE1\u606F</a>!</li>\n<li>\u4E3A\u4F55\u8981 <a href="https://chris.beams.io/posts/git-commit/">\u7F16\u5199\u826F\u597D\u7684\u63D0\u4EA4\u4FE1\u606F</a></li>\n</ul>\n</li>\n<li><code>git log</code>: \u663E\u793A\u5386\u53F2\u65E5\u5FD7</li>\n<li><code>git log --all --graph --decorate</code>: \u53EF\u89C6\u5316\u5386\u53F2\u8BB0\u5F55\uFF08\u6709\u5411\u65E0\u73AF\u56FE\uFF09</li>\n<li><code>git diff &lt;filename&gt;</code>: \u663E\u793A\u4E0E\u6682\u5B58\u533A\u6587\u4EF6\u7684\u5DEE\u5F02</li>\n<li><code>git diff &lt;revision&gt; &lt;filename&gt;</code>: \u663E\u793A\u67D0\u4E2A\u6587\u4EF6\u4E24\u4E2A\u7248\u672C\u4E4B\u95F4\u7684\u5DEE\u5F02</li>\n<li><code>git checkout &lt;revision&gt;</code>: \u66F4\u65B0 HEAD\uFF08\u5982\u679C\u662F\u68C0\u51FA\u5206\u652F\u5219\u540C\u65F6\u66F4\u65B0\u5F53\u524D\u5206\u652F\uFF09</li>\n</ul>\n<h2>\u5206\u652F\u548C\u5408\u5E76</h2>\n<ul>\n<li><code>git branch</code>: \u663E\u793A\u5206\u652F</li>\n<li><code>git branch &lt;name&gt;</code>: \u521B\u5EFA\u5206\u652F</li>\n<li><code>git checkout -b &lt;name&gt;</code>: \u521B\u5EFA\u5206\u652F\u5E76\u5207\u6362\u5230\u8BE5\u5206\u652F<ul>\n<li>\u76F8\u5F53\u4E8E <code>git branch &lt;name&gt;; git checkout &lt;name&gt;</code></li>\n</ul>\n</li>\n<li><code>git merge &lt;revision&gt;</code>: \u5408\u5E76\u5230\u5F53\u524D\u5206\u652F</li>\n<li><code>git mergetool</code>: \u4F7F\u7528\u5DE5\u5177\u6765\u5904\u7406\u5408\u5E76\u51B2\u7A81</li>\n<li><code>git rebase</code>: \u5C06\u4E00\u7CFB\u5217\u8865\u4E01\u53D8\u57FA\uFF08rebase\uFF09\u4E3A\u65B0\u7684\u57FA\u7EBF</li>\n</ul>\n<h2>\u8FDC\u7AEF\u64CD\u4F5C</h2>\n<ul>\n<li><p><code>git remote</code>: \u5217\u51FA\u8FDC\u7AEF</p>\n</li>\n<li><p><code>git remote add &lt;name&gt; &lt;url&gt;</code>: \u6DFB\u52A0\u4E00\u4E2A\u8FDC\u7AEF</p>\n</li>\n<li><p><code>git push &lt;remote&gt; &lt;local branch&gt;:&lt;remote branch&gt;</code>: \u5C06\u5BF9\u8C61\u4F20\u9001\u81F3\u8FDC\u7AEF\u5E76\u66F4\u65B0\u8FDC\u7AEF\u5F15\u7528</p>\n</li>\n<li><p><code>git branch --set-upstream-to=&lt;remote&gt;/&lt;remote branch&gt;</code>: \u521B\u5EFA\u672C\u5730\u548C\u8FDC\u7AEF\u5206\u652F\u7684\u5173\u8054\u5173\u7CFB</p>\n</li>\n<li><p><code>git fetch</code>: \u4ECE\u8FDC\u7AEF\u83B7\u53D6\u5BF9\u8C61/\u7D22\u5F15</p>\n</li>\n<li><p><code>git pull</code>: \u76F8\u5F53\u4E8E <code>git fetch; git merge</code></p>\n</li>\n<li><p><code>git clone</code>: \u4ECE\u8FDC\u7AEF\u4E0B\u8F7D\u4ED3\u5E93 (\u8FD9\u662F\u4E0B\u8F7D\u4EE3\u7801\u7684\u4E3B\u8981\u65B9\u5F0F\u4E5F\u662F\u6700\u5E38\u7528\u7684\u547D\u4EE4\u4E4B\u4E00)\n<img src="images/Git%E4%BD%BF%E7%94%A8%E5%85%A5%E9%97%A8/1760152289709.png" alt="1760152289709">\n\u590D\u5236\u8FD9\u4E2A\u94FE\u63A5\u4F7F\u7528<code>git clone https://github.com/Jdhggg/hello-algo.git</code> \u5373\u53EF\u4E0B\u8F7D\u4ED3\u5E93\u6587\u4EF6\u5230\u5F53\u524D\u76EE\u5F55</p>\n<p>\u5F53\u7136\u4E5F\u53EF\u4EE5\u4E0B\u8F7D\u5230\u6307\u5B9A\u76EE\u5F55\u4E0B\uFF0C\u4F8B\u5982<code>git clone https://github.com/Jdhggg/hello-algo.git ~/Documents/hello-algo</code></p>\n</li>\n</ul>\n<h2>\u64A4\u9500</h2>\n<ul>\n<li><code>git commit --amend</code>: \u7F16\u8F91\u63D0\u4EA4\u7684\u5185\u5BB9\u6216\u4FE1\u606F</li>\n<li><code>git reset HEAD &lt;file&gt;</code>: \u6062\u590D\u6682\u5B58\u7684\u6587\u4EF6</li>\n<li><code>git checkout -- &lt;file&gt;</code>: \u4E22\u5F03\u4FEE\u6539</li>\n<li><code>git restore</code>: git2.32 \u7248\u672C\u540E\u53D6\u4EE3 git reset \u8FDB\u884C\u8BB8\u591A\u64A4\u9500\u64CD\u4F5C</li>\n</ul>\n<h1>Git \u9AD8\u7EA7\u64CD\u4F5C</h1>\n<ul>\n<li><code>git config</code>: Git \u662F\u4E00\u4E2A <a href="https://git-scm.com/docs/git-config">\u9AD8\u5EA6\u53EF\u5B9A\u5236\u7684</a> \u5DE5\u5177</li>\n<li><code>git clone --depth=1</code>: \u6D45\u514B\u9686\uFF08shallow clone\uFF09\uFF0C\u4E0D\u5305\u62EC\u5B8C\u6574\u7684\u7248\u672C\u5386\u53F2\u4FE1\u606F</li>\n<li><code>git add -p</code>: \u4EA4\u4E92\u5F0F\u6682\u5B58</li>\n<li><code>git rebase -i</code>: \u4EA4\u4E92\u5F0F\u53D8\u57FA</li>\n<li><code>git blame</code>: \u67E5\u770B\u6700\u540E\u4FEE\u6539\u67D0\u884C\u7684\u4EBA</li>\n<li><code>git stash</code>: \u6682\u65F6\u79FB\u9664\u5DE5\u4F5C\u76EE\u5F55\u4E0B\u7684\u4FEE\u6539\u5185\u5BB9</li>\n<li><code>git bisect</code>: \u901A\u8FC7\u4E8C\u5206\u67E5\u627E\u641C\u7D22\u5386\u53F2\u8BB0\u5F55</li>\n<li><code>.gitignore</code>: <a href="https://git-scm.com/docs/gitignore">\u6307\u5B9A</a> \u6545\u610F\u4E0D\u8FFD\u8E2A\u7684\u6587\u4EF6</li>\n</ul>\n',
      featured_image: "https://miro.medium.com/v2/resize:fit:932/0*19RL32QnfLdva1Fa.png"
    },
    {
      slug: "Shell_tool",
      title: "Shell \u811A\u672C",
      date: "2025-10-07T11:02:53.000Z",
      tags: [
        "\u8BA1\u7B97\u673A\u57FA\u7840"
      ],
      excerpt: " Shell \u811A\u672C\r\n\r\n\u5230\u76EE\u524D\u4E3A\u6B62\uFF0C\u6211\u4EEC\u5DF2\u7ECF\u5B66\u4E60\u4E86\u5982\u4F55\u5728 shell \u4E2D\u6267\u884C\u547D\u4EE4\uFF0C\u5E76\u4F7F\u7528\u7BA1\u9053\u5C06\u547D\u4EE4\u7EC4\u5408\u4F7F\u7528\u3002\u4F46\u662F\uFF0C\u5F88\u591A\u60C5\u51B5\u4E0B\u6211\u4EEC\u9700\u8981\u6267\u884C\u4E00\u7CFB\u5217\u7684\u64CD\u4F5C\u5E76\u4F7F\u7528\u6761\u4EF6\u6216\u5FAA\u73AF\u8FD9\u6837\u7684\u63A7\u5236\u6D41\u3002\r\n\r\n\r\nshell \u811A\u672C\u7684\u590D\u6742\u6027\u8FDB\u4E00\u6B65\u63D0\u9AD8\u3002\r\n\r\n\r\n\u5927\u591A\u6570 shell \u90FD\u6709\u81EA\u5DF1\u7684\u4E00\u5957\u811A\u672C\u8BED\u8A00\uFF0C\u5305\u62EC\u53D8\u91CF\u3001\u63A7\u5236\u6D41\u548C\u81EA\u5DF1\u7684\u8BED\u6CD5\u3002shell \u811A\u672C\u4E0E\u5176\u4ED6\u811A\u672C\u8BED\u8A00\u4E0D\u540C\u4E4B\u5904\u5728\u4E8E\uFF0Cshell \u811A\u672C\u9488\u5BF9 shell \u6240\u4ECE\u4E8B...",
      content: '<h1>Shell \u811A\u672C</h1>\n<p>\u5230\u76EE\u524D\u4E3A\u6B62\uFF0C\u6211\u4EEC\u5DF2\u7ECF\u5B66\u4E60\u4E86\u5982\u4F55\u5728 shell \u4E2D\u6267\u884C\u547D\u4EE4\uFF0C\u5E76\u4F7F\u7528\u7BA1\u9053\u5C06\u547D\u4EE4\u7EC4\u5408\u4F7F\u7528\u3002\u4F46\u662F\uFF0C\u5F88\u591A\u60C5\u51B5\u4E0B\u6211\u4EEC\u9700\u8981\u6267\u884C\u4E00\u7CFB\u5217\u7684\u64CD\u4F5C\u5E76\u4F7F\u7528\u6761\u4EF6\u6216\u5FAA\u73AF\u8FD9\u6837\u7684\u63A7\u5236\u6D41\u3002</p>\n<p>shell \u811A\u672C\u7684\u590D\u6742\u6027\u8FDB\u4E00\u6B65\u63D0\u9AD8\u3002</p>\n<p>\u5927\u591A\u6570 shell \u90FD\u6709\u81EA\u5DF1\u7684\u4E00\u5957\u811A\u672C\u8BED\u8A00\uFF0C\u5305\u62EC\u53D8\u91CF\u3001\u63A7\u5236\u6D41\u548C\u81EA\u5DF1\u7684\u8BED\u6CD5\u3002shell \u811A\u672C\u4E0E\u5176\u4ED6\u811A\u672C\u8BED\u8A00\u4E0D\u540C\u4E4B\u5904\u5728\u4E8E\uFF0Cshell \u811A\u672C\u9488\u5BF9 shell \u6240\u4ECE\u4E8B\u7684\u76F8\u5173\u5DE5\u4F5C\u8FDB\u884C\u4E86\u4F18\u5316\u3002\u56E0\u6B64\uFF0C\u521B\u5EFA\u547D\u4EE4\u6D41\u7A0B\uFF08pipelines\uFF09\u3001\u5C06\u7ED3\u679C\u4FDD\u5B58\u5230\u6587\u4EF6\u3001\u4ECE\u6807\u51C6\u8F93\u5165\u4E2D\u8BFB\u53D6\u8F93\u5165\uFF0C\u8FD9\u4E9B\u90FD\u662F shell \u811A\u672C\u4E2D\u7684\u539F\u751F\u64CD\u4F5C\uFF0C\u8FD9\u8BA9\u5B83\u6BD4\u901A\u7528\u7684\u811A\u672C\u8BED\u8A00\u66F4\u6613\u7528\u3002\u672C\u8282\u4E2D\uFF0C\u6211\u4EEC\u4F1A\u4E13\u6CE8\u4E8E bash \u811A\u672C\uFF0C\u56E0\u4E3A\u5B83\u6700\u6D41\u884C\uFF0C\u5E94\u7528\u66F4\u4E3A\u5E7F\u6CDB\u3002</p>\n<p>\u5728 bash \u4E2D\u4E3A\u53D8\u91CF\u8D4B\u503C\u7684\u8BED\u6CD5\u662F <code>foo=bar</code>\uFF0C\u8BBF\u95EE\u53D8\u91CF\u4E2D\u5B58\u50A8\u7684\u6570\u503C\uFF0C\u5176\u8BED\u6CD5\u4E3A <code>$foo</code>\u3002\n\u9700\u8981\u6CE8\u610F\u7684\u662F\uFF0C<code>foo = bar</code> \uFF08\u4F7F\u7528\u7A7A\u683C\u9694\u5F00\uFF09\u662F\u4E0D\u80FD\u6B63\u786E\u5DE5\u4F5C\u7684\uFF0C\u56E0\u4E3A\u89E3\u91CA\u5668\u4F1A\u8C03\u7528\u7A0B\u5E8F <code>foo</code> \u5E76\u5C06 <code>=</code> \u548C <code>bar</code> \u4F5C\u4E3A\u53C2\u6570\u3002\n\u603B\u7684\u6765\u8BF4\uFF0C\u5728 shell \u811A\u672C\u4E2D\u4F7F\u7528\u7A7A\u683C\u4F1A\u8D77\u5230\u5206\u5272\u53C2\u6570\u7684\u4F5C\u7528\uFF0C\u6709\u65F6\u5019\u53EF\u80FD\u4F1A\u9020\u6210\u6DF7\u6DC6\uFF0C\u8BF7\u52A1\u5FC5\u591A\u52A0\u68C0\u67E5\u3002</p>\n<p>Bash \u4E2D\u7684\u5B57\u7B26\u4E32\u901A\u8FC7 <code>&#39;</code> \u548C <code>&quot;</code> \u5206\u9694\u7B26\u6765\u5B9A\u4E49\uFF0C\u4F46\u662F\u5B83\u4EEC\u7684\u542B\u4E49\u5E76\u4E0D\u76F8\u540C\u3002\u4EE5 <code>&#39;</code> \u5B9A\u4E49\u7684\u5B57\u7B26\u4E32\u4E3A\u539F\u4E49\u5B57\u7B26\u4E32\uFF0C\u5176\u4E2D\u7684\u53D8\u91CF\u4E0D\u4F1A\u88AB\u8F6C\u4E49\uFF0C\u800C <code>&quot;</code> \u5B9A\u4E49\u7684\u5B57\u7B26\u4E32\u4F1A\u5C06\u53D8\u91CF\u503C\u8FDB\u884C\u66FF\u6362\u3002</p>\n<pre><code class="language-bash">foo=bar\necho &quot;$foo&quot;\n# \u6253\u5370 bar\necho &#39;$foo&#39;\n# \u6253\u5370 $foo\n</code></pre>\n<p>\u548C\u5176\u4ED6\u5927\u591A\u6570\u7684\u7F16\u7A0B\u8BED\u8A00\u4E00\u6837\uFF0C<code>bash</code> \u4E5F\u652F\u6301 <code>if</code>, <code>case</code>, <code>while</code> \u548C <code>for</code> \u8FD9\u4E9B\u63A7\u5236\u6D41\u5173\u952E\u5B57\u3002\u540C\u6837\u5730\uFF0C\n <code>bash</code> \u4E5F\u652F\u6301\u51FD\u6570\uFF0C\u5B83\u53EF\u4EE5\u63A5\u53D7\u53C2\u6570\u5E76\u57FA\u4E8E\u53C2\u6570\u8FDB\u884C\u64CD\u4F5C\u3002\u4E0B\u9762\u8FD9\u4E2A\u51FD\u6570\u662F\u4E00\u4E2A\u4F8B\u5B50\uFF0C\u5B83\u4F1A\u521B\u5EFA\u4E00\u4E2A\u6587\u4EF6\u5939\u5E76\u4F7F\u7528 <code>cd</code> \u8FDB\u5165\u8BE5\u6587\u4EF6\u5939\u3002</p>\n<pre><code class="language-bash">mcd () {\n    mkdir -p &quot;$1&quot;\n    cd &quot;$1&quot;\n}\n</code></pre>\n<p>\u8FD9\u91CC <code>$1</code> \u662F\u811A\u672C\u7684\u7B2C\u4E00\u4E2A\u53C2\u6570\u3002\u4E0E\u5176\u4ED6\u811A\u672C\u8BED\u8A00\u4E0D\u540C\u7684\u662F\uFF0Cbash \u4F7F\u7528\u4E86\u5F88\u591A\u7279\u6B8A\u7684\u53D8\u91CF\u6765\u8868\u793A\u53C2\u6570\u3001\u9519\u8BEF\u4EE3\u7801\u548C\u76F8\u5173\u53D8\u91CF\u3002\u4E0B\u9762\u5217\u4E3E\u4E86\u5176\u4E2D\u4E00\u4E9B\u53D8\u91CF\uFF0C\u66F4\u5B8C\u6574\u7684\u5217\u8868\u53EF\u4EE5\u53C2\u8003 <a href="https://www.tldp.org/LDP/abs/html/special-chars.html">\u8FD9\u91CC</a>\u3002</p>\n<ul>\n<li><code>$0</code> - \u811A\u672C\u540D</li>\n<li><code>$1</code> \u5230 <code>$9</code> - \u811A\u672C\u7684\u53C2\u6570\u3002 <code>$1</code> \u662F\u7B2C\u4E00\u4E2A\u53C2\u6570\uFF0C\u4F9D\u6B64\u7C7B\u63A8\u3002</li>\n<li><code>$@</code> - \u6240\u6709\u53C2\u6570</li>\n<li><code>$#</code> - \u53C2\u6570\u4E2A\u6570</li>\n<li><code>$?</code> - \u524D\u4E00\u4E2A\u547D\u4EE4\u7684\u8FD4\u56DE\u503C</li>\n<li><code>$$</code> - \u5F53\u524D\u811A\u672C\u7684\u8FDB\u7A0B\u8BC6\u522B\u7801</li>\n<li><code>!!</code> - \u5B8C\u6574\u7684\u4E0A\u4E00\u6761\u547D\u4EE4\uFF0C\u5305\u62EC\u53C2\u6570\u3002\u5E38\u89C1\u5E94\u7528\uFF1A\u5F53\u4F60\u56E0\u4E3A\u6743\u9650\u4E0D\u8DB3\u6267\u884C\u547D\u4EE4\u5931\u8D25\u65F6\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>sudo !!</code> \u518D\u5C1D\u8BD5\u4E00\u6B21\u3002</li>\n<li><code>$_</code> - \u4E0A\u4E00\u6761\u547D\u4EE4\u7684\u6700\u540E\u4E00\u4E2A\u53C2\u6570\u3002\u5982\u679C\u4F60\u6B63\u5728\u4F7F\u7528\u7684\u662F\u4EA4\u4E92\u5F0F shell\uFF0C\u4F60\u53EF\u4EE5\u901A\u8FC7\u6309\u4E0B <code>Esc</code> \u4E4B\u540E\u952E\u5165 . \u6765\u83B7\u53D6\u8FD9\u4E2A\u503C\u3002</li>\n</ul>\n<p>\u547D\u4EE4\u901A\u5E38\u4F7F\u7528 <code>STDOUT</code> \u6765\u8FD4\u56DE\u8F93\u51FA\u503C\uFF0C\u4F7F\u7528 <code>STDERR</code> \u6765\u8FD4\u56DE\u9519\u8BEF\u53CA\u9519\u8BEF\u7801\uFF0C\u4FBF\u4E8E\u811A\u672C\u4EE5\u66F4\u52A0\u53CB\u597D\u7684\u65B9\u5F0F\u62A5\u544A\u9519\u8BEF\u3002\n\u8FD4\u56DE\u7801\u6216\u9000\u51FA\u72B6\u6001\u662F\u811A\u672C/\u547D\u4EE4\u4E4B\u95F4\u4EA4\u6D41\u6267\u884C\u72B6\u6001\u7684\u65B9\u5F0F\u3002\u8FD4\u56DE\u503C 0 \u8868\u793A\u6B63\u5E38\u6267\u884C\uFF0C\u5176\u4ED6\u6240\u6709\u975E 0 \u7684\u8FD4\u56DE\u503C\u90FD\u8868\u793A\u6709\u9519\u8BEF\u53D1\u751F\u3002</p>\n<p>\u9000\u51FA\u7801\u53EF\u4EE5\u642D\u914D <code>&amp;&amp;</code>\uFF08\u4E0E\u64CD\u4F5C\u7B26\uFF09\u548C <code>||</code>\uFF08\u6216\u64CD\u4F5C\u7B26\uFF09\u4F7F\u7528\uFF0C\u7528\u6765\u8FDB\u884C\u6761\u4EF6\u5224\u65AD\uFF0C\u51B3\u5B9A\u662F\u5426\u6267\u884C\u5176\u4ED6\u7A0B\u5E8F\u3002\u5B83\u4EEC\u90FD\u5C5E\u4E8E <a href="https://en.wikipedia.org/wiki/Short-circuit_evaluation">\u77ED\u8DEF\u8FD0\u7B97\u7B26</a>\uFF08short-circuiting\uFF09 \u540C\u4E00\u884C\u7684\u591A\u4E2A\u547D\u4EE4\u53EF\u4EE5\u7528 <code>;</code> \u5206\u9694\u3002\u7A0B\u5E8F <code>true</code> \u7684\u8FD4\u56DE\u7801\u6C38\u8FDC\u662F <code>0</code>\uFF0C<code>false</code> \u7684\u8FD4\u56DE\u7801\u6C38\u8FDC\u662F <code>1</code>\u3002\u8BA9\u6211\u4EEC\u770B\u51E0\u4E2A\u4F8B\u5B50</p>\n<pre><code class="language-bash">false || echo &quot;Oops, fail&quot;\n# Oops, fail\n\ntrue || echo &quot;Will not be printed&quot;\n#\n\ntrue &amp;&amp; echo &quot;Things went well&quot;\n# Things went well\n\nfalse &amp;&amp; echo &quot;Will not be printed&quot;\n#\n\nfalse ; echo &quot;This will always run&quot;\n# This will always run\n</code></pre>\n<p>\u53E6\u4E00\u4E2A\u5E38\u89C1\u7684\u6A21\u5F0F\u662F\u4EE5\u53D8\u91CF\u7684\u5F62\u5F0F\u83B7\u53D6\u4E00\u4E2A\u547D\u4EE4\u7684\u8F93\u51FA\uFF0C\u8FD9\u53EF\u4EE5\u901A\u8FC7 <em>\u547D\u4EE4\u66FF\u6362</em>\uFF08<em>command substitution</em>\uFF09\u5B9E\u73B0\u3002</p>\n<p>\u5F53\u60A8\u901A\u8FC7 <code>$( CMD )</code> \u8FD9\u6837\u7684\u65B9\u5F0F\u6765\u6267\u884C <code>CMD</code> \u8FD9\u4E2A\u547D\u4EE4\u65F6\uFF0C\u5B83\u7684\u8F93\u51FA\u7ED3\u679C\u4F1A\u66FF\u6362\u6389 <code>$( CMD )</code> \u3002\u4F8B\u5982\uFF0C\u5982\u679C\u6267\u884C <code>for file in $(ls)</code> \uFF0Cshell \u9996\u5148\u5C06\u8C03\u7528 <code>ls</code> \uFF0C\u7136\u540E\u904D\u5386\u5F97\u5230\u7684\u8FD9\u4E9B\u8FD4\u56DE\u503C\u3002\u8FD8\u6709\u4E00\u4E2A\u51B7\u95E8\u7684\u7C7B\u4F3C\u7279\u6027\u662F <em>\u8FDB\u7A0B\u66FF\u6362</em>\uFF08<em>process substitution</em>\uFF09\uFF0C <code>&lt;( CMD )</code> \u4F1A\u6267\u884C <code>CMD</code> \u5E76\u5C06\u7ED3\u679C\u8F93\u51FA\u5230\u4E00\u4E2A\u4E34\u65F6\u6587\u4EF6\u4E2D\uFF0C\u5E76\u5C06 <code>&lt;( CMD )</code> \u66FF\u6362\u6210\u4E34\u65F6\u6587\u4EF6\u540D\u3002\u8FD9\u5728\u6211\u4EEC\u5E0C\u671B\u8FD4\u56DE\u503C\u901A\u8FC7\u6587\u4EF6\u800C\u4E0D\u662F STDIN \u4F20\u9012\u65F6\u5F88\u6709\u7528\u3002\u4F8B\u5982\uFF0C <code>diff &lt;(ls foo) &lt;(ls bar)</code> \u4F1A\u663E\u793A\u6587\u4EF6\u5939 <code>foo</code> \u548C <code>bar</code> \u4E2D\u6587\u4EF6\u7684\u533A\u522B\u3002</p>\n<p>\u8BF4\u4E86\u5F88\u591A\uFF0C\u73B0\u5728\u8BE5\u770B\u4F8B\u5B50\u4E86\uFF0C\u4E0B\u9762\u8FD9\u4E2A\u4F8B\u5B50\u5C55\u793A\u4E86\u4E00\u90E8\u5206\u4E0A\u9762\u63D0\u5230\u7684\u7279\u6027\u3002\u8FD9\u6BB5\u811A\u672C\u4F1A\u904D\u5386\u6211\u4EEC\u63D0\u4F9B\u7684\u53C2\u6570\uFF0C\u4F7F\u7528 <code>grep</code> \u641C\u7D22\u5B57\u7B26\u4E32 <code>foobar</code>\uFF0C\u5982\u679C\u6CA1\u6709\u627E\u5230\uFF0C\u5219\u5C06\u5176\u4F5C\u4E3A\u6CE8\u91CA\u8FFD\u52A0\u5230\u6587\u4EF6\u4E2D\u3002</p>\n<pre><code class="language-bash">#!/bin/bash\n\necho &quot;Starting program at $(date)&quot; # date\u4F1A\u88AB\u66FF\u6362\u6210\u65E5\u671F\u548C\u65F6\u95F4\n\necho &quot;Running program $0 with $# arguments with pid $$&quot;\n\nfor file in &quot;$@&quot;; do\n    grep foobar &quot;$file&quot; &gt; /dev/null 2&gt; /dev/null\n    # \u5982\u679C\u6A21\u5F0F\u6CA1\u6709\u627E\u5230\uFF0C\u5219grep\u9000\u51FA\u72B6\u6001\u4E3A 1\n    # \u6211\u4EEC\u5C06\u6807\u51C6\u8F93\u51FA\u6D41\u548C\u6807\u51C6\u9519\u8BEF\u6D41\u91CD\u5B9A\u5411\u5230Null\uFF0C\u56E0\u4E3A\u6211\u4EEC\u5E76\u4E0D\u5173\u5FC3\u8FD9\u4E9B\u4FE1\u606F\n    if [[ $? -ne 0 ]]; then\n        echo &quot;File $file does not have any foobar, adding one&quot;\n        echo &quot;# foobar&quot; &gt;&gt; &quot;$file&quot;\n    fi\ndone\n</code></pre>\n<p>\u5728\u6761\u4EF6\u8BED\u53E5\u4E2D\uFF0C\u6211\u4EEC\u6BD4\u8F83 <code>$?</code> \u662F\u5426\u7B49\u4E8E 0\u3002\nBash \u5B9E\u73B0\u4E86\u8BB8\u591A\u7C7B\u4F3C\u7684\u6BD4\u8F83\u64CD\u4F5C\uFF0C\u60A8\u53EF\u4EE5\u67E5\u770B <a href="https://man7.org/linux/man-pages/man1/test.1.html"><code>test \u624B\u518C</code></a>\u3002\n\u5728 bash \u4E2D\u8FDB\u884C\u6BD4\u8F83\u65F6\uFF0C\u5C3D\u91CF\u4F7F\u7528\u53CC\u65B9\u62EC\u53F7 <code>[[ ]]</code> \u800C\u4E0D\u662F\u5355\u65B9\u62EC\u53F7 <code>[ ]</code>\uFF0C\u8FD9\u6837\u4F1A\u964D\u4F4E\u72AF\u9519\u7684\u51E0\u7387\uFF0C\u5C3D\u7BA1\u8FD9\u6837\u5E76\u4E0D\u80FD\u517C\u5BB9 <code>sh</code>\u3002 \u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\u53C2\u89C1 <a href="http://mywiki.wooledge.org/BashFAQ/031">\u8FD9\u91CC</a>\u3002</p>\n<p>\u5F53\u6267\u884C\u811A\u672C\u65F6\uFF0C\u6211\u4EEC\u7ECF\u5E38\u9700\u8981\u63D0\u4F9B\u5F62\u5F0F\u7C7B\u4F3C\u7684\u53C2\u6570\u3002bash \u4F7F\u6211\u4EEC\u53EF\u4EE5\u8F7B\u677E\u7684\u5B9E\u73B0\u8FD9\u4E00\u64CD\u4F5C\uFF0C\u5B83\u53EF\u4EE5\u57FA\u4E8E\u6587\u4EF6\u6269\u5C55\u540D\u5C55\u5F00\u8868\u8FBE\u5F0F\u3002\u8FD9\u4E00\u6280\u672F\u88AB\u79F0\u4E3A shell \u7684 <em>\u901A\u914D</em>\uFF08<em>globbing</em>\uFF09</p>\n<ul>\n<li>\u901A\u914D\u7B26 - \u5F53\u4F60\u60F3\u8981\u5229\u7528\u901A\u914D\u7B26\u8FDB\u884C\u5339\u914D\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5206\u522B\u4F7F\u7528 <code>?</code> \u548C <code>*</code> \u6765\u5339\u914D\u4E00\u4E2A\u6216\u4EFB\u610F\u4E2A\u5B57\u7B26\u3002\u4F8B\u5982\uFF0C\u5BF9\u4E8E\u6587\u4EF6 <code>foo</code>, <code>foo1</code>, <code>foo2</code>, <code>foo10</code> \u548C <code>bar</code>, <code>rm foo?</code> \u8FD9\u6761\u547D\u4EE4\u4F1A\u5220\u9664 <code>foo1</code> \u548C <code>foo2</code> \uFF0C\u800C <code>rm foo*</code> \u5219\u4F1A\u5220\u9664\u9664\u4E86 <code>bar</code> \u4E4B\u5916\u7684\u6240\u6709\u6587\u4EF6\u3002</li>\n<li>\u82B1\u62EC\u53F7 <code>{}</code> - \u5F53\u4F60\u6709\u4E00\u7CFB\u5217\u7684\u6307\u4EE4\uFF0C\u5176\u4E2D\u5305\u542B\u4E00\u6BB5\u516C\u5171\u5B50\u4E32\u65F6\uFF0C\u53EF\u4EE5\u7528\u82B1\u62EC\u53F7\u6765\u81EA\u52A8\u5C55\u5F00\u8FD9\u4E9B\u547D\u4EE4\u3002\u8FD9\u5728\u6279\u91CF\u79FB\u52A8\u6216\u8F6C\u6362\u6587\u4EF6\u65F6\u975E\u5E38\u65B9\u4FBF\u3002</li>\n</ul>\n<pre><code class="language-bash">convert image.{png,jpg}\n# \u4F1A\u5C55\u5F00\u4E3A\nconvert image.png image.jpg\n\ncp /path/to/project/{foo,bar,baz}.sh /newpath\n# \u4F1A\u5C55\u5F00\u4E3A\ncp /path/to/project/foo.sh /path/to/project/bar.sh /path/to/project/baz.sh /newpath\n\n# \u4E5F\u53EF\u4EE5\u7ED3\u5408\u901A\u914D\u4F7F\u7528\nmv *{.py,.sh} folder\n# \u4F1A\u79FB\u52A8\u6240\u6709 *.py \u548C *.sh \u6587\u4EF6\n\nmkdir foo bar\n\n# \u4E0B\u9762\u547D\u4EE4\u4F1A\u521B\u5EFA foo/a, foo/b, ... foo/h, bar/a, bar/b, ... bar/h \u8FD9\u4E9B\u6587\u4EF6\ntouch {foo,bar}/{a..h}\ntouch foo/x bar/y\n# \u6BD4\u8F83\u6587\u4EF6\u5939 foo \u548C bar \u4E2D\u5305\u542B\u6587\u4EF6\u7684\u4E0D\u540C\ndiff &lt;(ls foo) &lt;(ls bar)\n# \u8F93\u51FA\n# &lt; x\n# ---\n# &gt; y\n</code></pre>\n<!-- Lastly, pipes `|` are a core feature of scripting. Pipes connect one program\'s output to the next program\'s input. We will cover them more in detail in the data wrangling lecture. -->\n\n<p>\u7F16\u5199 <code>bash</code> \u811A\u672C\u6709\u65F6\u5019\u4F1A\u5F88\u522B\u626D\u548C\u53CD\u76F4\u89C9\u3002\u4F8B\u5982 <a href="https://github.com/koalaman/shellcheck">shellcheck</a> \u8FD9\u6837\u7684\u5DE5\u5177\u53EF\u4EE5\u5E2E\u52A9\u4F60\u5B9A\u4F4D sh/bash \u811A\u672C\u4E2D\u7684\u9519\u8BEF\u3002</p>\n<p>\u6CE8\u610F\uFF0C\u811A\u672C\u5E76\u4E0D\u4E00\u5B9A\u53EA\u6709\u7528 bash \u5199\u624D\u80FD\u5728\u7EC8\u7AEF\u91CC\u8C03\u7528\u3002\u6BD4\u5982\u8BF4\uFF0C\u8FD9\u662F\u4E00\u6BB5 Python \u811A\u672C\uFF0C\u4F5C\u7528\u662F\u5C06\u8F93\u5165\u7684\u53C2\u6570\u5012\u5E8F\u8F93\u51FA\uFF1A</p>\n<pre><code class="language-python">#!/usr/local/bin/python\nimport sys\nfor arg in reversed(sys.argv[1:]):\n    print(arg)\n</code></pre>\n<p>\u5185\u6838\u77E5\u9053\u53BB\u7528 python \u89E3\u91CA\u5668\u800C\u4E0D\u662F shell \u547D\u4EE4\u6765\u8FD0\u884C\u8FD9\u6BB5\u811A\u672C\uFF0C\u662F\u56E0\u4E3A\u811A\u672C\u7684\u5F00\u5934\u7B2C\u4E00\u884C\u7684 <a href="https://en.wikipedia.org/wiki/Shebang_(Unix)">shebang</a>\u3002</p>\n<p>\u5728 <code>shebang</code> \u884C\u4E2D\u4F7F\u7528 <a href="https://man7.org/linux/man-pages/man1/env.1.html"><code>env</code></a> \u547D\u4EE4\u662F\u4E00\u79CD\u597D\u7684\u5B9E\u8DF5\uFF0C\u5B83\u4F1A\u5229\u7528\u73AF\u5883\u53D8\u91CF\u4E2D\u7684\u7A0B\u5E8F\u6765\u89E3\u6790\u8BE5\u811A\u672C\uFF0C\u8FD9\u6837\u5C31\u63D0\u9AD8\u4E86\u60A8\u7684\u811A\u672C\u7684\u53EF\u79FB\u690D\u6027\u3002<code>env</code> \u4F1A\u5229\u7528\u6211\u4EEC\u7B2C\u4E00\u8282\u8BB2\u5EA7\u4E2D\u4ECB\u7ECD\u8FC7\u7684 <code>PATH</code> \u73AF\u5883\u53D8\u91CF\u6765\u8FDB\u884C\u5B9A\u4F4D\u3002\n\u4F8B\u5982\uFF0C\u4F7F\u7528\u4E86 <code>env</code> \u7684 shebang \u770B\u4E0A\u53BB\u662F\u8FD9\u6837\u7684 <code>#!/usr/bin/env python</code>\u3002</p>\n<p>shell \u51FD\u6570\u548C\u811A\u672C\u6709\u5982\u4E0B\u4E00\u4E9B\u4E0D\u540C\u70B9\uFF1A</p>\n<ul>\n<li>\u51FD\u6570\u53EA\u80FD\u4E0E shell \u4F7F\u7528\u76F8\u540C\u7684\u8BED\u8A00\uFF0C\u811A\u672C\u53EF\u4EE5\u4F7F\u7528\u4EFB\u610F\u8BED\u8A00\u3002\u56E0\u6B64\u5728\u811A\u672C\u4E2D\u5305\u542B <code>shebang</code> \u662F\u5F88\u91CD\u8981\u7684\u3002</li>\n<li>\u51FD\u6570\u4EC5\u5728\u5B9A\u4E49\u65F6\u88AB\u52A0\u8F7D\uFF0C\u811A\u672C\u4F1A\u5728\u6BCF\u6B21\u88AB\u6267\u884C\u65F6\u52A0\u8F7D\u3002\u8FD9\u8BA9\u51FD\u6570\u7684\u52A0\u8F7D\u6BD4\u811A\u672C\u7565\u5FEB\u4E00\u4E9B\uFF0C\u4F46\u6BCF\u6B21\u4FEE\u6539\u51FD\u6570\u5B9A\u4E49\uFF0C\u90FD\u8981\u91CD\u65B0\u52A0\u8F7D\u4E00\u6B21\u3002</li>\n<li>\u51FD\u6570\u4F1A\u5728\u5F53\u524D\u7684 shell \u73AF\u5883\u4E2D\u6267\u884C\uFF0C\u811A\u672C\u4F1A\u5728\u5355\u72EC\u7684\u8FDB\u7A0B\u4E2D\u6267\u884C\u3002\u56E0\u6B64\uFF0C\u51FD\u6570\u53EF\u4EE5\u5BF9\u73AF\u5883\u53D8\u91CF\u8FDB\u884C\u66F4\u6539\uFF0C\u6BD4\u5982\u6539\u53D8\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\uFF0C\u811A\u672C\u5219\u4E0D\u884C\u3002\u4F7F\u7528 <a href="https://man7.org/linux/man-pages/man1/export.1p.html"><code>export</code></a> \u5BFC\u51FA\u7684\u73AF\u5883\u53D8\u91CF\u4F1A\u4EE5\u4F20\u503C\u7684\u65B9\u5F0F\u4F20\u9012\u7ED9\u811A\u672C\u3002</li>\n<li>\u4E0E\u5176\u4ED6\u7A0B\u5E8F\u8BED\u8A00\u4E00\u6837\uFF0C\u51FD\u6570\u53EF\u4EE5\u63D0\u9AD8\u4EE3\u7801\u6A21\u5757\u6027\u3001\u4EE3\u7801\u590D\u7528\u6027\u5E76\u521B\u5EFA\u6E05\u6670\u6027\u7684\u7ED3\u6784\u3002shell \u811A\u672C\u4E2D\u5F80\u5F80\u4E5F\u4F1A\u5305\u542B\u5B83\u4EEC\u81EA\u5DF1\u7684\u51FD\u6570\u5B9A\u4E49\u3002</li>\n</ul>\n<h1>Shell \u5DE5\u5177</h1>\n<h2>\u67E5\u770B\u547D\u4EE4\u5982\u4F55\u4F7F\u7528</h2>\n<p>\u770B\u5230\u8FD9\u91CC\uFF0C\u60A8\u53EF\u80FD\u4F1A\u6709\u7591\u95EE\uFF0C\u6211\u4EEC\u5E94\u8BE5\u5982\u4F55\u4E3A\u7279\u5B9A\u7684\u547D\u4EE4\u627E\u5230\u5408\u9002\u7684\u6807\u8BB0\u5462\uFF1F\u4F8B\u5982 <code>ls -l</code>, <code>mv -i</code> \u548C <code>mkdir -p</code>\u3002\u66F4\u666E\u904D\u7684\u662F\uFF0C\u7ED9\u60A8\u4E00\u4E2A\u547D\u4EE4\u884C\uFF0C\u60A8\u5E94\u8BE5\u600E\u6837\u4E86\u89E3\u5982\u4F55\u4F7F\u7528\u8FD9\u4E2A\u547D\u4EE4\u884C\u5E76\u627E\u51FA\u5B83\u7684\u4E0D\u540C\u7684\u9009\u9879\u5462\uFF1F\n\u4E00\u822C\u6765\u8BF4\uFF0C\u60A8\u53EF\u80FD\u4F1A\u5148\u53BB\u7F51\u4E0A\u641C\u7D22\u7B54\u6848\uFF0C\u4F46\u662F\uFF0CUNIX \u53EF\u6BD4 StackOverflow \u51FA\u73B0\u7684\u65E9\uFF0C\u56E0\u6B64\u6211\u4EEC\u7684\u7CFB\u7EDF\u91CC\u5176\u5B9E\u65E9\u5C31\u5305\u542B\u4E86\u53EF\u4EE5\u83B7\u53D6\u76F8\u5173\u4FE1\u606F\u7684\u65B9\u6CD5\u3002</p>\n<p>\u5728\u4E0A\u4E00\u8282\u4E2D\u6211\u4EEC\u4ECB\u7ECD\u8FC7\uFF0C\u6700\u5E38\u7528\u7684\u65B9\u6CD5\u662F\u4E3A\u5BF9\u5E94\u7684\u547D\u4EE4\u884C\u6DFB\u52A0 <code>-h</code> \u6216 <code>--help</code> \u6807\u8BB0\u3002\u53E6\u5916\u4E00\u4E2A\u66F4\u8BE6\u7EC6\u7684\u65B9\u6CD5\u5219\u662F\u4F7F\u7528 <code>man</code> \u547D\u4EE4\u3002<a href="https://man7.org/linux/man-pages/man1/man.1.html"><code>man</code></a> \u547D\u4EE4\u662F\u624B\u518C\uFF08manual\uFF09\u7684\u7F29\u5199\uFF0C\u5B83\u63D0\u4F9B\u4E86\u547D\u4EE4\u7684\u7528\u6237\u624B\u518C\u3002</p>\n<p>\u4F8B\u5982\uFF0C<code>man rm</code> \u4F1A\u8F93\u51FA\u547D\u4EE4 <code>rm</code> \u7684\u8BF4\u660E\uFF0C\u540C\u65F6\u8FD8\u6709\u5176\u6807\u8BB0\u5217\u8868\uFF0C\u5305\u62EC\u4E4B\u524D\u6211\u4EEC\u4ECB\u7ECD\u8FC7\u7684 <code>-i</code>\u3002\n\u4E8B\u5B9E\u4E0A\uFF0C\u76EE\u524D\u6211\u4EEC\u7ED9\u51FA\u7684\u6240\u6709\u547D\u4EE4\u7684\u8BF4\u660E\u94FE\u63A5\uFF0C\u90FD\u662F\u7F51\u9875\u7248\u7684 Linux \u547D\u4EE4\u624B\u518C\u3002\u5373\u4F7F\u662F\u60A8\u5B89\u88C5\u7684\u7B2C\u4E09\u65B9\u547D\u4EE4\uFF0C\u524D\u63D0\u662F\u5F00\u53D1\u8005\u7F16\u5199\u4E86\u624B\u518C\u5E76\u5C06\u5176\u5305\u542B\u5728\u4E86\u5B89\u88C5\u5305\u4E2D\u3002\u5728\u4EA4\u4E92\u5F0F\u7684\u3001\u57FA\u4E8E\u5B57\u7B26\u5904\u7406\u7684\u7EC8\u7AEF\u7A97\u53E3\u4E2D\uFF0C\u4E00\u822C\u4E5F\u53EF\u4EE5\u901A\u8FC7 <code>:help</code> \u547D\u4EE4\u6216\u952E\u5165 <code>?</code> \u6765\u83B7\u53D6\u5E2E\u52A9\u3002</p>\n<p>\u6709\u65F6\u5019\u624B\u518C\u5185\u5BB9\u592A\u8FC7\u8BE6\u5B9E\uFF0C\u8BA9\u6211\u4EEC\u96BE\u4EE5\u5728\u5176\u4E2D\u67E5\u627E\u54EA\u4E9B\u6700\u5E38\u7528\u7684\u6807\u8BB0\u548C\u8BED\u6CD5\u3002\n<a href="https://tldr.inbrowser.app/">TLDR pages</a> \u662F\u4E00\u4E2A\u5F88\u4E0D\u9519\u7684\u66FF\u4EE3\u54C1\uFF0C\u5B83\u63D0\u4F9B\u4E86\u4E00\u4E9B\u6848\u4F8B\uFF0C\u53EF\u4EE5\u5E2E\u52A9\u60A8\u5FEB\u901F\u627E\u5230\u6B63\u786E\u7684\u9009\u9879\u3002</p>\n<p>\u4F8B\u5982\uFF0C\u5728 tldr \u4E0A\u641C\u7D22 <a href="https://tldr.inbrowser.app/pages/common/tar"><code>tar</code></a> \u7684\u7528\u6CD5\u3002</p>\n<h2>\u67E5\u627E\u6587\u4EF6</h2>\n<p>\u7A0B\u5E8F\u5458\u4EEC\u9762\u5BF9\u7684\u6700\u5E38\u89C1\u7684\u91CD\u590D\u4EFB\u52A1\u5C31\u662F\u67E5\u627E\u6587\u4EF6\u6216\u76EE\u5F55\u3002\u6240\u6709\u7684\u7C7B UNIX \u7CFB\u7EDF\u90FD\u5305\u542B\u4E00\u4E2A\u540D\u4E3A <a href="https://www.runoob.com/linux/linux-comm-find.html"><code>find</code></a> \u7684\u5DE5\u5177\uFF0C\u5B83\u662F shell \u4E0A\u7528\u4E8E\u67E5\u627E\u6587\u4EF6\u7684\u7EDD\u4F73\u5DE5\u5177\u3002<code>find</code> \u547D\u4EE4\u4F1A\u9012\u5F52\u5730\u641C\u7D22\u7B26\u5408\u6761\u4EF6\u7684\u6587\u4EF6\uFF0C\u4F8B\u5982\uFF1A</p>\n<pre><code class="language-bash"># \u67E5\u627E\u6240\u6709\u540D\u79F0\u4E3Asrc\u7684\u6587\u4EF6\u5939\nfind . -name src -type d\n# \u67E5\u627E\u6240\u6709\u6587\u4EF6\u5939\u8DEF\u5F84\u4E2D\u5305\u542Btest\u7684python\u6587\u4EF6\nfind . -path &#39;*/test/*.py&#39; -type f\n# \u67E5\u627E\u524D\u4E00\u5929\u4FEE\u6539\u7684\u6240\u6709\u6587\u4EF6\nfind . -mtime -1\n# \u67E5\u627E\u6240\u6709\u5927\u5C0F\u5728500k\u81F310M\u7684tar.gz\u6587\u4EF6\nfind . -size +500k -size -10M -name &#39;*.tar.gz&#39;\n</code></pre>\n<p>\u9664\u4E86\u5217\u51FA\u6240\u5BFB\u627E\u7684\u6587\u4EF6\u4E4B\u5916\uFF0Cfind \u8FD8\u80FD\u5BF9\u6240\u6709\u67E5\u627E\u5230\u7684\u6587\u4EF6\u8FDB\u884C\u64CD\u4F5C\u3002\u8FD9\u80FD\u6781\u5927\u5730\u7B80\u5316\u4E00\u4E9B\u5355\u8C03\u7684\u4EFB\u52A1\u3002</p>\n<pre><code class="language-bash"># \u5220\u9664\u5168\u90E8\u6269\u5C55\u540D\u4E3A.tmp \u7684\u6587\u4EF6\nfind . -name &#39;*.tmp&#39; -exec rm {} \\;\n# \u67E5\u627E\u5168\u90E8\u7684 PNG \u6587\u4EF6\u5E76\u5C06\u5176\u8F6C\u6362\u4E3A JPG\nfind . -name &#39;*.png&#39; -exec magick {} {}.jpg \\;\n</code></pre>\n<p>\u5C3D\u7BA1 <code>find</code> \u7528\u9014\u5E7F\u6CDB\uFF0C\u5B83\u7684\u8BED\u6CD5\u5374\u6BD4\u8F83\u96BE\u4EE5\u8BB0\u5FC6\u3002\u4F8B\u5982\uFF0C\u4E3A\u4E86\u67E5\u627E\u6EE1\u8DB3\u6A21\u5F0F <code>PATTERN</code> \u7684\u6587\u4EF6\uFF0C\u60A8\u9700\u8981\u6267\u884C <code>find -name &#39;*PATTERN*&#39;</code> (\u5982\u679C\u60A8\u5E0C\u671B\u6A21\u5F0F\u5339\u914D\u65F6\u662F\u4E0D\u533A\u5206\u5927\u5C0F\u5199\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>-iname</code> \u9009\u9879\uFF09</p>\n<p>\u60A8\u5F53\u7136\u53EF\u4EE5\u4F7F\u7528 alias \u8BBE\u7F6E\u522B\u540D\u6765\u7B80\u5316\u4E0A\u8FF0\u64CD\u4F5C\uFF0C\u4F46 shell \u7684\u54F2\u5B66\u4E4B\u4E00\u4FBF\u662F\u5BFB\u627E\uFF08\u66F4\u597D\u7528\u7684\uFF09\u66FF\u4EE3\u65B9\u6848\u3002\n\u8BB0\u4F4F\uFF0Cshell \u6700\u597D\u7684\u7279\u6027\u5C31\u662F\u60A8\u53EA\u662F\u5728\u8C03\u7528\u7A0B\u5E8F\uFF0C\u56E0\u6B64\u60A8\u53EA\u8981\u627E\u5230\u5408\u9002\u7684\u66FF\u4EE3\u7A0B\u5E8F\u5373\u53EF\uFF08\u751A\u81F3\u81EA\u5DF1\u7F16\u5199\uFF09\u3002</p>\n<p>\u4F8B\u5982\uFF0C<a href="https://github.com/sharkdp/fd"><code>fd</code></a> \u5C31\u662F\u4E00\u4E2A\u66F4\u7B80\u5355\u3001\u66F4\u5FEB\u901F\u3001\u66F4\u53CB\u597D\u7684\u7A0B\u5E8F\uFF0C\u5B83\u53EF\u4EE5\u7528\u6765\u4F5C\u4E3A <code>find</code> \u7684\u66FF\u4EE3\u54C1\u3002\u5B83\u6709\u5F88\u591A\u4E0D\u9519\u7684\u9ED8\u8BA4\u8BBE\u7F6E\uFF0C\u4F8B\u5982\u8F93\u51FA\u7740\u8272\u3001\u9ED8\u8BA4\u652F\u6301\u6B63\u5219\u5339\u914D\u3001\u652F\u6301 unicode \u5E76\u4E14\u6211\u8BA4\u4E3A\u5B83\u7684\u8BED\u6CD5\u66F4\u7B26\u5408\u76F4\u89C9\u3002\u4EE5\u6A21\u5F0F <code>PATTERN</code> \u641C\u7D22\u7684\u8BED\u6CD5\u662F <code>fd PATTERN</code>\u3002</p>\n<p>\u5927\u591A\u6570\u4EBA\u90FD\u8BA4\u4E3A <code>find</code> \u548C <code>fd</code> \u5DF2\u7ECF\u5F88\u597D\u7528\u4E86\uFF0C\u4F46\u662F\u6709\u7684\u4EBA\u53EF\u80FD\u60F3\u77E5\u9053\uFF0C\u6211\u4EEC\u662F\u4E0D\u662F\u53EF\u4EE5\u6709\u66F4\u9AD8\u6548\u7684\u65B9\u6CD5\uFF0C\u4F8B\u5982\u4E0D\u8981\u6BCF\u6B21\u90FD\u641C\u7D22\u6587\u4EF6\u800C\u662F\u901A\u8FC7\u7F16\u8BD1\u7D22\u5F15\u6216\u5EFA\u7ACB\u6570\u636E\u5E93\u7684\u65B9\u5F0F\u6765\u5B9E\u73B0\u66F4\u52A0\u5FEB\u901F\u5730\u641C\u7D22\u3002</p>\n<p>\u8FD9\u5C31\u8981\u9760 <a href="https://www.runoob.com/linux/linux-comm-locate.html"><code>locate</code></a> \u4E86\u3002\n<code>locate</code> \u4F7F\u7528\u4E00\u4E2A\u7531 <a href="https://www.runoob.com/linux/linux-comm-updatedb.html"><code>updatedb</code></a> \u8D1F\u8D23\u66F4\u65B0\u7684\u6570\u636E\u5E93\uFF0C\u5728\u5927\u591A\u6570\u7CFB\u7EDF\u4E2D <code>updatedb</code> \u90FD\u4F1A\u901A\u8FC7 <a href="https://www.runoob.com/linux/linux-comm-crontab.html"><code>cron</code></a> \u6BCF\u65E5\u66F4\u65B0\u3002\u8FD9\u4FBF\u9700\u8981\u6211\u4EEC\u5728\u901F\u5EA6\u548C\u65F6\u6548\u6027\u4E4B\u95F4\u4F5C\u51FA\u6743\u8861\u3002\u800C\u4E14\uFF0C<code>find</code> \u548C\u7C7B\u4F3C\u7684\u5DE5\u5177\u53EF\u4EE5\u901A\u8FC7\u522B\u7684\u5C5E\u6027\u6BD4\u5982\u6587\u4EF6\u5927\u5C0F\u3001\u4FEE\u6539\u65F6\u95F4\u6216\u662F\u6743\u9650\u6765\u67E5\u627E\u6587\u4EF6\uFF0C<code>locate</code> \u5219\u53EA\u80FD\u901A\u8FC7\u6587\u4EF6\u540D\u3002\u3002</p>\n<h2>\u67E5\u627E\u4EE3\u7801</h2>\n<p>\u67E5\u627E\u6587\u4EF6\u662F\u5F88\u6709\u7528\u7684\u6280\u80FD\uFF0C\u4F46\u662F\u5F88\u591A\u65F6\u5019\u60A8\u7684\u76EE\u6807\u5176\u5B9E\u662F\u67E5\u770B\u6587\u4EF6\u7684\u5185\u5BB9\u3002\u4E00\u4E2A\u6700\u5E38\u89C1\u7684\u573A\u666F\u662F\u60A8\u5E0C\u671B\u67E5\u627E\u5177\u6709\u67D0\u79CD\u6A21\u5F0F\u7684\u5168\u90E8\u6587\u4EF6\uFF0C\u5E76\u627E\u5B83\u4EEC\u7684\u4F4D\u7F6E\u3002</p>\n<p>\u4E3A\u4E86\u5B9E\u73B0\u8FD9\u4E00\u70B9\uFF0C\u5F88\u591A\u7C7B UNIX \u7684\u7CFB\u7EDF\u90FD\u63D0\u4F9B\u4E86 <a href="https://www.runoob.com/linux/linux-comm-grep.html"><code>grep</code></a> \u547D\u4EE4\uFF0C\u5B83\u662F\u7528\u4E8E\u5BF9\u8F93\u5165\u6587\u672C\u8FDB\u884C\u5339\u914D\u7684\u901A\u7528\u5DE5\u5177\u3002\u5B83\u662F\u4E00\u4E2A\u975E\u5E38\u91CD\u8981\u7684 shell \u5DE5\u5177\uFF0C\u6211\u4EEC\u4F1A\u5728\u540E\u7EED\u7684\u6570\u636E\u6E05\u7406\u8BFE\u7A0B\u4E2D\u6DF1\u5165\u7684\u63A2\u8BA8\u5B83\u3002</p>\n<p><code>grep</code> \u6709\u5F88\u591A\u9009\u9879\uFF0C\u8FD9\u4E5F\u4F7F\u5B83\u6210\u4E3A\u4E00\u4E2A\u975E\u5E38\u5168\u80FD\u7684\u5DE5\u5177\u3002\u5176\u4E2D\u6211\u7ECF\u5E38\u4F7F\u7528\u7684\u6709 <code>-C</code> \uFF1A\u83B7\u53D6\u67E5\u627E\u7ED3\u679C\u7684\u4E0A\u4E0B\u6587\uFF08Context\uFF09\uFF1B<code>-v</code> \u5C06\u5BF9\u7ED3\u679C\u8FDB\u884C\u53CD\u9009\uFF08Invert\uFF09\uFF0C\u4E5F\u5C31\u662F\u8F93\u51FA\u4E0D\u5339\u914D\u7684\u7ED3\u679C\u3002\u4E3E\u4F8B\u6765\u8BF4\uFF0C <code>grep -C 5</code> \u4F1A\u8F93\u51FA\u5339\u914D\u7ED3\u679C\u524D\u540E\u4E94\u884C\u3002\u5F53\u9700\u8981\u641C\u7D22\u5927\u91CF\u6587\u4EF6\u7684\u65F6\u5019\uFF0C\u4F7F\u7528 <code>-R</code> \u4F1A\u9012\u5F52\u5730\u8FDB\u5165\u5B50\u76EE\u5F55\u5E76\u641C\u7D22\u6240\u6709\u7684\u6587\u672C\u6587\u4EF6\u3002</p>\n<p>\u4F46\u662F\uFF0C\u6211\u4EEC\u6709\u5F88\u591A\u529E\u6CD5\u53EF\u4EE5\u5BF9 <code>grep -R</code> \u8FDB\u884C\u6539\u8FDB\uFF0C\u4F8B\u5982\u4F7F\u5176\u5FFD\u7565 <code>.git</code> \u6587\u4EF6\u5939\uFF0C\u4F7F\u7528\u591A CPU \u7B49\u7B49\u3002</p>\n<p>\u56E0\u6B64\u4E5F\u51FA\u73B0\u4E86\u5F88\u591A\u5B83\u7684\u66FF\u4EE3\u54C1\uFF0C\u5305\u62EC <a href="https://beyondgrep.com/">ack</a>, <a href="https://github.com/ggreer/the_silver_searcher">ag</a> \u548C <a href="https://github.com/BurntSushi/ripgrep">rg</a>\u3002\u5B83\u4EEC\u90FD\u7279\u522B\u597D\u7528\uFF0C\u4F46\u662F\u529F\u80FD\u4E5F\u90FD\u5DEE\u4E0D\u591A\uFF0C\u6211\u6BD4\u8F83\u5E38\u7528\u7684\u662F ripgrep (<code>rg</code>) \uFF0C\u56E0\u4E3A\u5B83\u901F\u5EA6\u5FEB\uFF0C\u800C\u4E14\u7528\u6CD5\u975E\u5E38\u7B26\u5408\u76F4\u89C9\u3002\u4F8B\u5B50\u5982\u4E0B\uFF1A</p>\n<pre><code class="language-bash"># \u67E5\u627E\u6240\u6709\u4F7F\u7528\u4E86 requests \u5E93\u7684\u6587\u4EF6\nrg -t py &#39;import requests&#39;\n# \u67E5\u627E\u6240\u6709\u6CA1\u6709\u5199 shebang \u7684\u6587\u4EF6\uFF08\u5305\u542B\u9690\u85CF\u6587\u4EF6\uFF09\nrg -u --files-without-match &quot;^#\\!&quot;\n# \u67E5\u627E\u6240\u6709\u7684foo\u5B57\u7B26\u4E32\uFF0C\u5E76\u6253\u5370\u5176\u4E4B\u540E\u76845\u884C\nrg foo -A 5\n# \u6253\u5370\u5339\u914D\u7684\u7EDF\u8BA1\u4FE1\u606F\uFF08\u5339\u914D\u7684\u884C\u548C\u6587\u4EF6\u7684\u6570\u91CF\uFF09\nrg --stats PATTERN\n</code></pre>\n<p>\u4E0E <code>find</code>/<code>fd</code> \u4E00\u6837\uFF0C\u91CD\u8981\u7684\u662F\u4F60\u8981\u77E5\u9053\u6709\u4E9B\u95EE\u9898\u4F7F\u7528\u5408\u9002\u7684\u5DE5\u5177\u5C31\u4F1A\u8FCE\u5203\u800C\u89E3\uFF0C\u800C\u5177\u4F53\u9009\u62E9\u54EA\u4E2A\u5DE5\u5177\u5219\u4E0D\u662F\u90A3\u4E48\u91CD\u8981\u3002</p>\n<h2>\u67E5\u627E shell \u547D\u4EE4</h2>\n<p>\u76EE\u524D\u4E3A\u6B62\uFF0C\u6211\u4EEC\u5DF2\u7ECF\u5B66\u4E60\u4E86\u5982\u4F55\u67E5\u627E\u6587\u4EF6\u548C\u4EE3\u7801\uFF0C\u4F46\u968F\u7740\u4F60\u4F7F\u7528 shell \u7684\u65F6\u95F4\u8D8A\u6765\u8D8A\u4E45\uFF0C\u60A8\u53EF\u80FD\u60F3\u8981\u627E\u5230\u4E4B\u524D\u8F93\u5165\u8FC7\u7684\u67D0\u6761\u547D\u4EE4\u3002\u9996\u5148\uFF0C\u6309\u5411\u4E0A\u7684\u65B9\u5411\u952E\u4F1A\u663E\u793A\u4F60\u4F7F\u7528\u8FC7\u7684\u4E0A\u4E00\u6761\u547D\u4EE4\uFF0C\u7EE7\u7EED\u6309\u4E0A\u952E\u5219\u4F1A\u904D\u5386\u6574\u4E2A\u5386\u53F2\u8BB0\u5F55\u3002</p>\n<p><code>history</code> \u547D\u4EE4\u5141\u8BB8\u60A8\u4EE5\u7A0B\u5E8F\u5458\u7684\u65B9\u5F0F\u6765\u8BBF\u95EE shell \u4E2D\u8F93\u5165\u7684\u5386\u53F2\u547D\u4EE4\u3002\u8FD9\u4E2A\u547D\u4EE4\u4F1A\u5728\u6807\u51C6\u8F93\u51FA\u4E2D\u6253\u5370 shell \u4E2D\u7684\u5386\u53F2\u547D\u4EE4\u3002\u5982\u679C\u6211\u4EEC\u8981\u641C\u7D22\u5386\u53F2\u8BB0\u5F55\uFF0C\u5219\u53EF\u4EE5\u5229\u7528\u7BA1\u9053\u5C06\u8F93\u51FA\u7ED3\u679C\u4F20\u9012\u7ED9 <code>grep</code> \u8FDB\u884C\u6A21\u5F0F\u641C\u7D22\u3002\n<code>history | grep find</code> \u4F1A\u6253\u5370\u5305\u542B find \u5B50\u4E32\u7684\u547D\u4EE4\u3002</p>\n<p>\u5BF9\u4E8E\u5927\u591A\u6570\u7684 shell \u6765\u8BF4\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528 <code>Ctrl+R</code> \u5BF9\u547D\u4EE4\u5386\u53F2\u8BB0\u5F55\u8FDB\u884C\u56DE\u6EAF\u641C\u7D22\u3002\u6572 <code>Ctrl+R</code> \u540E\u60A8\u53EF\u4EE5\u8F93\u5165\u5B50\u4E32\u6765\u8FDB\u884C\u5339\u914D\uFF0C\u67E5\u627E\u5386\u53F2\u547D\u4EE4\u884C\u3002</p>\n<p>\u53CD\u590D\u6309\u4E0B\u5C31\u4F1A\u5728\u6240\u6709\u641C\u7D22\u7ED3\u679C\u4E2D\u5FAA\u73AF\u3002\u5728 <a href="https://github.com/zsh-users/zsh-history-substring-search">zsh</a> \u4E2D\uFF0C\u4F7F\u7528\u65B9\u5411\u952E\u4E0A\u6216\u4E0B\u4E5F\u53EF\u4EE5\u5B8C\u6210\u8FD9\u9879\u5DE5\u4F5C\u3002</p>\n<p><code>Ctrl+R</code> \u53EF\u4EE5\u914D\u5408 <a href="https://github.com/junegunn/fzf/wiki/Configuring-shell-key-bindings#ctrl-r">fzf</a> \u4F7F\u7528\u3002<code>fzf</code> \u662F\u4E00\u4E2A\u901A\u7528\u7684\u6A21\u7CCA\u67E5\u627E\u5DE5\u5177\uFF0C\u5B83\u53EF\u4EE5\u548C\u5F88\u591A\u547D\u4EE4\u4E00\u8D77\u4F7F\u7528\u3002\u8FD9\u91CC\u6211\u4EEC\u53EF\u4EE5\u5BF9\u5386\u53F2\u547D\u4EE4\u8FDB\u884C\u6A21\u7CCA\u67E5\u627E\u5E76\u5C06\u7ED3\u679C\u4EE5\u8D4F\u5FC3\u60A6\u76EE\u7684\u683C\u5F0F\u8F93\u51FA\u3002</p>\n<p>\u53E6\u5916\u4E00\u4E2A\u548C\u5386\u53F2\u547D\u4EE4\u76F8\u5173\u7684\u6280\u5DE7\u6211\u559C\u6B22\u79F0\u4E4B\u4E3A <strong>\u57FA\u4E8E\u5386\u53F2\u7684\u81EA\u52A8\u8865\u5168</strong>\u3002\n\u8FD9\u4E00\u7279\u6027\u6700\u521D\u662F\u7531 <a href="https://fishshell.com/">fish</a> shell \u521B\u5EFA\u7684\uFF0C\u5B83\u53EF\u4EE5\u6839\u636E\u60A8\u6700\u8FD1\u4F7F\u7528\u8FC7\u7684\u5F00\u5934\u76F8\u540C\u7684\u547D\u4EE4\uFF0C\u52A8\u6001\u5730\u5BF9\u5F53\u524D\u7684 shell \u547D\u4EE4\u8FDB\u884C\u8865\u5168\u3002\u8FD9\u4E00\u529F\u80FD\u5728 <a href="https://github.com/zsh-users/zsh-autosuggestions">zsh</a> \u4E2D\u4E5F\u53EF\u4EE5\u4F7F\u7528\uFF0C\u5B83\u53EF\u4EE5\u6781\u5927\u7684\u63D0\u9AD8\u7528\u6237\u4F53\u9A8C\u3002</p>\n<p>\u4F60\u53EF\u4EE5\u4FEE\u6539 shell history \u7684\u884C\u4E3A\uFF0C\u4F8B\u5982\uFF0C\u5982\u679C\u5728\u547D\u4EE4\u7684\u5F00\u5934\u52A0\u4E0A\u4E00\u4E2A\u7A7A\u683C\uFF0C\u5B83\u5C31\u4E0D\u4F1A\u88AB\u52A0\u8FDB shell \u8BB0\u5F55\u4E2D\u3002\u5F53\u4F60\u8F93\u5165\u5305\u542B\u5BC6\u7801\u6216\u662F\u5176\u4ED6\u654F\u611F\u4FE1\u606F\u7684\u547D\u4EE4\u65F6\u4F1A\u7528\u5230\u8FD9\u4E00\u7279\u6027\u3002\n\u4E3A\u6B64\u4F60\u9700\u8981\u5728 <code>.bashrc</code> \u4E2D\u6DFB\u52A0 <code>HISTCONTROL=ignorespace</code> \u6216\u8005\u5411 <code>.zshrc</code> \u6DFB\u52A0 <code>setopt HIST_IGNORE_SPACE</code>\u3002\n\u5982\u679C\u4F60\u4E0D\u5C0F\u5FC3\u5FD8\u4E86\u5728\u524D\u9762\u52A0\u7A7A\u683C\uFF0C\u53EF\u4EE5\u901A\u8FC7\u7F16\u8F91 <code>.bash_history</code> \u6216 <code>.zhistory</code> \u6765\u624B\u52A8\u5730\u4ECE\u5386\u53F2\u8BB0\u5F55\u4E2D\u79FB\u9664\u90A3\u4E00\u9879\u3002</p>\n<h2>\u6587\u4EF6\u5939\u5BFC\u822A</h2>\n<p>\u4E4B\u524D\u5BF9\u6240\u6709\u64CD\u4F5C\u6211\u4EEC\u90FD\u9ED8\u8BA4\u4E00\u4E2A\u524D\u63D0\uFF0C\u5373\u60A8\u5DF2\u7ECF\u4F4D\u4E8E\u60F3\u8981\u6267\u884C\u547D\u4EE4\u7684\u76EE\u5F55\u4E0B\uFF0C\u4F46\u662F\u5982\u4F55\u624D\u80FD\u9AD8\u6548\u5730\u5728\u76EE\u5F55\u95F4\u968F\u610F\u5207\u6362\u5462\uFF1F\u6709\u5F88\u591A\u7B80\u4FBF\u7684\u65B9\u6CD5\u53EF\u4EE5\u505A\u5230\uFF0C\u6BD4\u5982\u8BBE\u7F6E alias\uFF0C\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-alias.html">ln -s</a> \u521B\u5EFA\u7B26\u53F7\u8FDE\u63A5\u7B49\u3002\u800C\u5F00\u53D1\u8005\u4EEC\u5DF2\u7ECF\u60F3\u5230\u4E86\u5F88\u591A\u66F4\u4E3A\u7CBE\u5999\u7684\u89E3\u51B3\u65B9\u6848\u3002</p>\n<p>\u7531\u4E8E\u672C\u6559\u7A0B\u7684\u76EE\u7684\u662F\u5C3D\u53EF\u80FD\u5BF9\u4F60\u7684\u65E5\u5E38\u4E60\u60EF\u8FDB\u884C\u4F18\u5316\u3002\u56E0\u6B64\uFF0C\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528 <a href="https://github.com/clvv/fasd"><code>fasd</code></a> \u548C <a href="https://github.com/wting/autojump">autojump</a> \u8FD9\u4E24\u4E2A\u5DE5\u5177\u6765\u67E5\u627E\u6700\u5E38\u7528\u6216\u6700\u8FD1\u4F7F\u7528\u7684\u6587\u4EF6\u548C\u76EE\u5F55\u3002</p>\n<p>Fasd \u57FA\u4E8E <a href="https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm"><em>frecency</em> </a> \u5BF9\u6587\u4EF6\u548C\u6587\u4EF6\u6392\u5E8F\uFF0C\u4E5F\u5C31\u662F\u8BF4\u5B83\u4F1A\u540C\u65F6\u9488\u5BF9\u9891\u7387\uFF08<em>frequency</em>\uFF09\u548C\u65F6\u6548\uFF08<em>recency</em>\uFF09\u8FDB\u884C\u6392\u5E8F\u3002\u9ED8\u8BA4\u60C5\u51B5\u4E0B\uFF0C<code>fasd</code> \u4F7F\u7528\u547D\u4EE4 <code>z</code> \u5E2E\u52A9\u6211\u4EEC\u5FEB\u901F\u5207\u6362\u5230\u6700\u5E38\u8BBF\u95EE\u7684\u76EE\u5F55\u3002\u4F8B\u5982\uFF0C \u5982\u679C\u60A8\u7ECF\u5E38\u8BBF\u95EE <code>/home/user/files/cool_project</code> \u76EE\u5F55\uFF0C\u90A3\u4E48\u53EF\u4EE5\u76F4\u63A5\u4F7F\u7528 <code>z cool</code> \u8DF3\u8F6C\u5230\u8BE5\u76EE\u5F55\u3002\u5BF9\u4E8E autojump\uFF0C\u5219\u4F7F\u7528 <code>j cool</code> \u4EE3\u66FF\u5373\u53EF\u3002</p>\n<p>\u8FD8\u6709\u4E00\u4E9B\u66F4\u590D\u6742\u7684\u5DE5\u5177\u53EF\u4EE5\u7528\u6765\u6982\u89C8\u76EE\u5F55\u7ED3\u6784\uFF0C\u4F8B\u5982 <a href="https://linux.die.net/man/1/tree"><code>tree</code></a>, <a href="https://github.com/Canop/broot"><code>broot</code></a> \u6216\u66F4\u52A0\u5B8C\u6574\u7684\u6587\u4EF6\u7BA1\u7406\u5668\uFF0C\u4F8B\u5982 <a href="https://github.com/jarun/nnn"><code>nnn</code></a> \u6216 <a href="https://github.com/ranger/ranger"><code>ranger</code></a>\u3002</p>\n'
    },
    {
      slug: "Shell",
      title: "Shell \u662F\u4EC0\u4E48\uFF1F",
      date: "2025-10-06T11:02:53.000Z",
      tags: [
        "\u8BA1\u7B97\u673A\u57FA\u7840"
      ],
      excerpt: "\r\n The Shell\r\n> \u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684\u8BA1\u7B97\u673A\u5E38\u7528\u5DE5\u5177\u5165\u95E8\u6559\u7A0B\u4E4BShell\r\n\r\n  Shell \u662F\u4EC0\u4E48\uFF1F\r\n\r\n\u5982\u4ECA\u7684\u8BA1\u7B97\u673A\u6709\u7740\u591A\u79CD\u591A\u6837\u7684\u4EA4\u4E92\u63A5\u53E3\u8BA9\u6211\u4EEC\u53EF\u4EE5\u8FDB\u884C\u6307\u4EE4\u7684\u7684\u8F93\u5165\uFF0C\u4ECE\u70AB\u9177\u7684\u56FE\u50CF\u7528\u6237\u754C\u9762\uFF08GUI\uFF09\uFF0C\u8BED\u97F3\u8F93\u5165\u751A\u81F3\u662F AR/VR \u90FD\u5DF2\u7ECF\u65E0\u5904\u4E0D\u5728\u3002\r\n\u8FD9\u4E9B\u4EA4\u4E92\u63A5\u53E3\u53EF\u4EE5\u8986\u76D6 80% \u7684\u4F7F\u7528\u573A\u666F\uFF0C\u4F46\u662F\u5B83\u4EEC\u4E5F\u4ECE\u6839\u672C\u4E0A\u9650\u5236\u4E86\u60A8\u7684\u64CD\u4F5C\u65B9\u5F0F\u2014\u2014\u4F60\u4E0D\u80FD\u70B9\u51FB\u4E00\u4E2A\u4E0D\u5B58\u5728\u7684\u6309\u94AE\u6216...",
      content: '<h1>The Shell</h1>\n<blockquote>\n<p>\u8FD9\u662F\u4E00\u7BC7\u9762\u5411\u65B0\u52A0\u5165\u5B9E\u9A8C\u5BA4\u7684\u540C\u5B66\u64B0\u5199\u7684\u8BA1\u7B97\u673A\u5E38\u7528\u5DE5\u5177\u5165\u95E8\u6559\u7A0B\u4E4BShell</p>\n</blockquote>\n<h2>Shell \u662F\u4EC0\u4E48\uFF1F</h2>\n<p>\u5982\u4ECA\u7684\u8BA1\u7B97\u673A\u6709\u7740\u591A\u79CD\u591A\u6837\u7684\u4EA4\u4E92\u63A5\u53E3\u8BA9\u6211\u4EEC\u53EF\u4EE5\u8FDB\u884C\u6307\u4EE4\u7684\u7684\u8F93\u5165\uFF0C\u4ECE\u70AB\u9177\u7684\u56FE\u50CF\u7528\u6237\u754C\u9762\uFF08GUI\uFF09\uFF0C\u8BED\u97F3\u8F93\u5165\u751A\u81F3\u662F AR/VR \u90FD\u5DF2\u7ECF\u65E0\u5904\u4E0D\u5728\u3002\n\u8FD9\u4E9B\u4EA4\u4E92\u63A5\u53E3\u53EF\u4EE5\u8986\u76D6 80% \u7684\u4F7F\u7528\u573A\u666F\uFF0C\u4F46\u662F\u5B83\u4EEC\u4E5F\u4ECE\u6839\u672C\u4E0A\u9650\u5236\u4E86\u60A8\u7684\u64CD\u4F5C\u65B9\u5F0F\u2014\u2014\u4F60\u4E0D\u80FD\u70B9\u51FB\u4E00\u4E2A\u4E0D\u5B58\u5728\u7684\u6309\u94AE\u6216\u8005\u662F\u7528\u8BED\u97F3\u8F93\u5165\u4E00\u4E2A\u8FD8\u6CA1\u6709\u88AB\u5F55\u5165\u7684\u6307\u4EE4\u3002\n\u4E3A\u4E86\u5145\u5206\u5229\u7528\u8BA1\u7B97\u673A\u7684\u80FD\u529B\uFF0C\u6211\u4EEC\u4E0D\u5F97\u4E0D\u56DE\u5230\u6700\u6839\u672C\u7684\u65B9\u5F0F\uFF0C\u4F7F\u7528\u6587\u5B57\u63A5\u53E3\uFF1AShell</p>\n<p>\u51E0\u4E4E\u6240\u6709\u60A8\u80FD\u591F\u63A5\u89E6\u5230\u7684\u5E73\u53F0\u90FD\u652F\u6301\u67D0\u79CD\u5F62\u5F0F\u7684 shell\uFF0C\u6709\u4E9B\u751A\u81F3\u8FD8\u63D0\u4F9B\u4E86\u591A\u79CD shell \u4F9B\u60A8\u9009\u62E9\u3002\u867D\u7136\u5B83\u4EEC\u4E4B\u95F4\u6709\u4E9B\u7EC6\u8282\u4E0A\u7684\u5DEE\u5F02\uFF0C\u4F46\u662F\u5176\u6838\u5FC3\u529F\u80FD\u90FD\u662F\u4E00\u6837\u7684\uFF1A\u5B83\u5141\u8BB8\u4F60\u6267\u884C\u7A0B\u5E8F\uFF0C\u8F93\u5165\u5E76\u83B7\u53D6\u67D0\u79CD\u534A\u7ED3\u6784\u5316\u7684\u8F93\u51FA\u3002</p>\n<p>\u672C\u8282\u8BFE\u6211\u4EEC\u4F1A\u4F7F\u7528 Bourne Again SHell, \u7B80\u79F0 &quot;bash&quot; \u3002\n\u8FD9\u662F\u88AB\u6700\u5E7F\u6CDB\u4F7F\u7528\u7684\u4E00\u79CD shell\uFF0C\u5B83\u7684\u8BED\u6CD5\u548C\u5176\u4ED6\u7684 shell \u90FD\u662F\u7C7B\u4F3C\u7684\u3002\u6253\u5F00 shell <em>\u63D0\u793A\u7B26</em>\uFF08\u60A8\u8F93\u5165\u6307\u4EE4\u7684\u5730\u65B9\uFF09\uFF0C\u60A8\u9996\u5148\u9700\u8981\u6253\u5F00 <em>\u7EC8\u7AEF</em> \u3002\u60A8\u7684\u8BBE\u5907\u901A\u5E38\u90FD\u5DF2\u7ECF\u5185\u7F6E\u4E86\u7EC8\u7AEF\uFF0C\u6216\u8005\u60A8\u4E5F\u53EF\u4EE5\u5B89\u88C5\u4E00\u4E2A\uFF0C\u975E\u5E38\u7B80\u5355\u3002</p>\n<ul>\n<li><p>\u5982\u679C\u4F60\u4F7F\u7528\u7684\u662F<code>windows</code> \uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>cmd</code> \u542F\u52A8\u4E00\u4E2A\u7EC8\u7AEF,\u4F46\u8FD8\u672C\u6587\u4F7F\u7528\u7684\u547D\u4EE4\u5C5E\u4E8E<code>Unix</code>\u98CE\u683C\uFF0C<code>cmd</code>\u53EF\u80FD\u65E0\u6CD5\u6267\u884C\u67D0\u4E9B\u547D\u4EE4\u3002\n\u6240\u4EE5\u5EFA\u8BAE\u5728Windows \u4E2D\u5EFA\u8BAE\u4F7F\u7528 <code>WSl</code> \u6216\u8005 <code>pwsh</code> \u6765\u8DDF\u8FDB\u8BFE\u7A0B\u3002</p>\n<ul>\n<li><a href="https://learn.microsoft.com/zh-cn/windows/wsl/install">wsl</a> \u662F Windows 10 \u7684\u4E00\u4E2A\u529F\u80FD\uFF0C\u5141\u8BB8\u60A8\u4F7F\u7528 Linux \u7684\u547D\u4EE4\u884C\u754C\u9762\uFF0C\u672C\u8D28\u4E0A\u662F\u4E00\u4E2A\u865A\u62DF\u673A\uFF0C\u4F46\u662F\u8FD9\u4E00\u76F4\u63A5\u8C03\u7528\u90E8\u5206\u786C\u4EF6\uFF0C\u5982 CPU\u3001\u5185\u5B58\u3001\u786C\u76D8\u3001\u663E\u5361\u7B49\u7B49\uFF0C\u4F7F\u7528 WSL \u6765\u505A\u4E00\u4E9B\u5F00\u53D1\u4EFB\u52A1\u4E5F\u5341\u5206\u65B9\u4FBF\u3002</li>\n<li><a href="https://learn.microsoft.com/zh-cn/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.5">pwsh</a> \u662F PowerShell \u7684\u4E00\u4E2A\u5B9E\u73B0\uFF0CPowerShell \u662F\u4E00\u4E2A\u5F00\u6E90\u7684\u8DE8\u5E73\u53F0 shell\u3002\u56E0\u4E3A<code>pwsh</code>\u662F\u8DE8\u5E73\u53F0\u7684\uFF0C\u6240\u4EE5\u5728 Windows \u548C Linux \u4E2D\u90FD\u662F\u53EF\u7528\u7684\uFF0C\uFF0C\u5B83\u5141\u8BB8\u60A8\u4F7F\u7528 .NET \u6846\u67B6\uFF0C\u56E0\u6B64\u60A8\u53EF\u4EE5\u4F7F\u7528 C# \u6216 PowerShell \u6765\u7F16\u5199\u811A\u672C\uFF0C\u5E76\u4E14\u5BF9\u4E8E\u4E00\u4E9B<code>bash</code>\u547D\u4EE4\u53EF\u4EE5\u76F4\u63A5\u6620\u5C04\u6267\u884C\u3002</li>\n</ul>\n</li>\n<li><p>\u5BF9\u4E8E<code>MacOS</code> \u4E2D\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>terminal</code>,\u5E94\u4E3A<code>MacOS</code> \u662F\u4E00\u4E2A Unix \u7CFB\u7EDF\uFF0C\u6240\u4EE5\u5B83\u4E5F\u652F\u6301\u672C\u8BFE\u7A0B\u7684\u5927\u591A\u6570 shell \u547D\u4EE4\u3002</p>\n</li>\n<li><p>\u5BF9\u4E8E<code>Linux</code> \u4E2D\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>bash</code> \u542F\u52A8\u4E00\u4E2A\u7EC8\u7AEF\uFF0C\u672C\u8BFE\u7A0B\u4F7F\u7528\u7684\u5C31\u662F<code>linux</code>\u7CFB\u7EDF\u3002</p>\n</li>\n</ul>\n<h2>\u4F7F\u7528 shell</h2>\n<p>\u5F53\u60A8\u6253\u5F00\u7EC8\u7AEF\u65F6\uFF0C\u60A8\u4F1A\u770B\u5230\u4E00\u4E2A\u63D0\u793A\u7B26\uFF0C\u5B83\u770B\u8D77\u6765\u4E00\u822C\u662F\u8FD9\u4E2A\u6837\u5B50\u7684\uFF1A</p>\n<pre><code class="language-console">missing:~$ \n</code></pre>\n<p>\u8FD9\u662F shell \u6700\u4E3B\u8981\u7684\u6587\u672C\u63A5\u53E3\u3002\u5B83\u544A\u8BC9\u4F60\uFF0C\u4F60\u7684\u4E3B\u673A\u540D\u662F <code>missing</code> \u5E76\u4E14\u60A8\u5F53\u524D\u7684\u5DE5\u4F5C\u76EE\u5F55\uFF08&quot;current working directory&quot;\uFF09\u6216\u8005\u8BF4\u60A8\u5F53\u524D\u6240\u5728\u7684\u4F4D\u7F6E\u662F <code>~</code> (\u8868\u793A &quot;home&quot;)\u3002 <code>$</code> \u7B26\u53F7\u8868\u793A\u60A8\u73B0\u5728\u7684\u8EAB\u4EFD\u4E0D\u662F root \u7528\u6237\uFF08\u7A0D\u540E\u4F1A\u4ECB\u7ECD\uFF09\u3002\u5728\u8FD9\u4E2A\u63D0\u793A\u7B26\u4E2D\uFF0C\u60A8\u53EF\u4EE5\u8F93\u5165 <em>\u547D\u4EE4</em> \uFF0C\u547D\u4EE4\u6700\u7EC8\u4F1A\u88AB shell \u89E3\u6790\u3002\u6700\u7B80\u5355\u7684\u547D\u4EE4\u662F\u6267\u884C\u4E00\u4E2A\u7A0B\u5E8F\uFF1A</p>\n<pre><code class="language-console">missing:~$ date\nFri 10 Jan 2020 11:49:31 AM EST\nmissing:~$ \n</code></pre>\n<p>\u8FD9\u91CC\uFF0C\u6211\u4EEC\u6267\u884C\u4E86 <code>date</code> \u8FD9\u4E2A\u7A0B\u5E8F\uFF0C\u4E0D\u51FA\u610F\u6599\u5730\uFF0C\u5B83\u6253\u5370\u51FA\u4E86\u5F53\u524D\u7684\u65E5\u671F\u548C\u65F6\u95F4\u3002\u7136\u540E\uFF0Cshell \u7B49\u5F85\u6211\u4EEC\u8F93\u5165\u5176\u4ED6\u547D\u4EE4\u3002\u6211\u4EEC\u53EF\u4EE5\u5728\u6267\u884C\u547D\u4EE4\u7684\u540C\u65F6\u5411\u7A0B\u5E8F\u4F20\u9012 <em>\u53C2\u6570</em> \uFF1A</p>\n<pre><code class="language-console">missing:~$ echo hello\nhello\n</code></pre>\n<p>\u4E0A\u4F8B\u4E2D\uFF0C\u6211\u4EEC\u8BA9 shell \u6267\u884C <code>echo</code> \uFF0C\u540C\u65F6\u6307\u5B9A\u53C2\u6570 <code>hello</code>\u3002<code>echo</code> \u7A0B\u5E8F\u5C06\u8BE5\u53C2\u6570\u6253\u5370\u51FA\u6765\u3002\nshell \u57FA\u4E8E\u7A7A\u683C\u5206\u5272\u547D\u4EE4\u5E76\u8FDB\u884C\u89E3\u6790\uFF0C\u7136\u540E\u6267\u884C\u7B2C\u4E00\u4E2A\u5355\u8BCD\u4EE3\u8868\u7684\u7A0B\u5E8F\uFF0C\u5E76\u5C06\u540E\u7EED\u7684\u5355\u8BCD\u4F5C\u4E3A\u7A0B\u5E8F\u53EF\u4EE5\u8BBF\u95EE\u7684\u53C2\u6570\u3002\u5982\u679C\u60A8\u5E0C\u671B\u4F20\u9012\u7684\u53C2\u6570\u4E2D\u5305\u542B\u7A7A\u683C\uFF08\u4F8B\u5982\u4E00\u4E2A\u540D\u4E3A My Photos \u7684\u6587\u4EF6\u5939\uFF09\uFF0C\u60A8\u8981\u4E48\u7528\u4F7F\u7528\u5355\u5F15\u53F7\uFF0C\u53CC\u5F15\u53F7\u5C06\u5176\u5305\u88F9\u8D77\u6765\uFF0C\u8981\u4E48\u4F7F\u7528\u8F6C\u4E49\u7B26\u53F7 <code>\\</code> \u8FDB\u884C\u5904\u7406\uFF08<code>My\\ Photos</code>\uFF09\u3002</p>\n<p>\u4F46\u662F\uFF0Cshell \u662F\u5982\u4F55\u77E5\u9053\u53BB\u54EA\u91CC\u5BFB\u627E <code>date</code> \u6216 <code>echo</code> \u7684\u5462\uFF1F\u5176\u5B9E\uFF0C\u7C7B\u4F3C\u4E8E Python \u6216 Ruby\uFF0Cshell \u662F\u4E00\u4E2A\u7F16\u7A0B\u73AF\u5883\uFF0C\u6240\u4EE5\u5B83\u5177\u5907\u53D8\u91CF\u3001\u6761\u4EF6\u3001\u5FAA\u73AF\u548C\u51FD\u6570\uFF08\u4E0B\u4E00\u8BFE\u8FDB\u884C\u8BB2\u89E3\uFF09\u3002\u5F53\u4F60\u5728 shell \u4E2D\u6267\u884C\u547D\u4EE4\u65F6\uFF0C\u60A8\u5B9E\u9645\u4E0A\u662F\u5728\u6267\u884C\u4E00\u6BB5 shell \u53EF\u4EE5\u89E3\u91CA\u6267\u884C\u7684\u7B80\u77ED\u4EE3\u7801\u3002\u5982\u679C\u4F60\u8981\u6C42 shell \u6267\u884C\u67D0\u4E2A\u6307\u4EE4\uFF0C\u4F46\u662F\u8BE5\u6307\u4EE4\u5E76\u4E0D\u662F shell \u6240\u4E86\u89E3\u7684\u7F16\u7A0B\u5173\u952E\u5B57\uFF0C\u90A3\u4E48\u5B83\u4F1A\u53BB\u54A8\u8BE2 <em>\u73AF\u5883\u53D8\u91CF</em>  <code>$PATH</code>\uFF0C\u5B83\u4F1A\u5217\u51FA\u5F53 shell \u63A5\u5230\u67D0\u6761\u6307\u4EE4\u65F6\uFF0C\u8FDB\u884C\u7A0B\u5E8F\u641C\u7D22\u7684\u8DEF\u5F84\uFF1A</p>\n<pre><code class="language-console">missing:~$ echo $PATH\n/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nmissing:~$ which echo\n/bin/echo\nmissing:~$ /bin/echo $PATH\n/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n</code></pre>\n<p>\u5F53\u6211\u4EEC\u6267\u884C <code>echo</code> \u547D\u4EE4\u65F6\uFF0Cshell \u4E86\u89E3\u5230\u9700\u8981\u6267\u884C <code>echo</code> \u8FD9\u4E2A\u7A0B\u5E8F\uFF0C\u968F\u540E\u5B83\u4FBF\u4F1A\u5728 <code>$PATH</code> \u4E2D\u641C\u7D22\u7531 <code>:</code> \u6240\u5206\u5272\u7684\u4E00\u7CFB\u5217\u76EE\u5F55\uFF0C\u57FA\u4E8E\u540D\u5B57\u641C\u7D22\u8BE5\u7A0B\u5E8F\u3002\u5F53\u627E\u5230\u8BE5\u7A0B\u5E8F\u65F6\u4FBF\u6267\u884C\uFF08\u5047\u5B9A\u8BE5\u6587\u4EF6\u662F <em>\u53EF\u6267\u884C\u7A0B\u5E8F</em>\uFF0C\u540E\u7EED\u8BFE\u7A0B\u5C06\u8BE6\u7EC6\u8BB2\u89E3\uFF09\u3002\u786E\u5B9A\u67D0\u4E2A\u7A0B\u5E8F\u540D\u4EE3\u8868\u7684\u662F\u54EA\u4E2A\u5177\u4F53\u7684\u7A0B\u5E8F\uFF0C\u53EF\u4EE5\u4F7F\u7528\n<code>which</code> \u7A0B\u5E8F\u3002\u6211\u4EEC\u4E5F\u53EF\u4EE5\u7ED5\u8FC7 <code>$PATH</code>\uFF0C\u901A\u8FC7\u76F4\u63A5\u6307\u5B9A\u9700\u8981\u6267\u884C\u7684\u7A0B\u5E8F\u7684\u8DEF\u5F84\u6765\u6267\u884C\u8BE5\u7A0B\u5E8F</p>\n<h2>\u5728 shell \u4E2D\u5BFC\u822A</h2>\n<p>shell \u4E2D\u7684\u8DEF\u5F84\u662F\u4E00\u7EC4\u88AB\u5206\u5272\u7684\u76EE\u5F55\uFF0C\u5728 Linux \u548C macOS \u4E0A\u4F7F\u7528 <code>/</code> \u5206\u5272\uFF0C\u800C\u5728 Windows \u4E0A\u662F <code>\\</code>\u3002\u8DEF\u5F84 <code>/</code> \u4EE3\u8868\u7684\u662F\u7CFB\u7EDF\u7684\u6839\u76EE\u5F55\uFF0C\u6240\u6709\u7684\u6587\u4EF6\u5939\u90FD\u5305\u62EC\u5728\u8FD9\u4E2A\u8DEF\u5F84\u4E4B\u4E0B\uFF0C\u5728 Windows \u4E0A\u6BCF\u4E2A\u76D8\u90FD\u6709\u4E00\u4E2A\u6839\u76EE\u5F55\uFF08\u4F8B\u5982\uFF1A\n<code>C:\\</code>\uFF09\u3002 \u6211\u4EEC\u5047\u8BBE\u60A8\u5728\u5B66\u4E60\u672C\u8BFE\u7A0B\u65F6\u4F7F\u7528\u7684\u662F Linux \u6587\u4EF6\u7CFB\u7EDF\u3002\u5982\u679C\u67D0\u4E2A\u8DEF\u5F84\u4EE5 <code>/</code> \u5F00\u5934\uFF0C\u90A3\u4E48\u5B83\u662F\u4E00\u4E2A <em>\u7EDD\u5BF9\u8DEF\u5F84</em>\uFF0C\u5176\u4ED6\u7684\u90FD\u662F <em>\u76F8\u5BF9\u8DEF\u5F84</em> \u3002\u76F8\u5BF9\u8DEF\u5F84\u662F\u6307\u76F8\u5BF9\u4E8E\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u7684\u8DEF\u5F84\uFF0C\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\u53EF\u4EE5\u4F7F\u7528 <code>pwd</code> \u547D\u4EE4\u6765\u83B7\u53D6\u3002\u6B64\u5916\uFF0C\u5207\u6362\u76EE\u5F55\u9700\u8981\u4F7F\u7528 <code>cd</code> \u547D\u4EE4\u3002\u5728\u8DEF\u5F84\u4E2D\uFF0C<code>.</code> \u8868\u793A\u7684\u662F\u5F53\u524D\u76EE\u5F55\uFF0C\u800C <code>..</code> \u8868\u793A\u4E0A\u7EA7\u76EE\u5F55\uFF1A</p>\n<pre><code class="language-console">missing:~$ pwd\n/home/missing\nmissing:~$ cd /home\nmissing:/home$ pwd\n/home\nmissing:/home$ cd ..\nmissing:/$ pwd\n/\nmissing:/$ cd ./home\nmissing:/home$ pwd\n/home\nmissing:/home$ cd missing\nmissing:~$ pwd\n/home/missing\nmissing:~$ ../../bin/echo hello\nhello\n</code></pre>\n<p>\u6CE8\u610F\uFF0Cshell \u4F1A\u5B9E\u65F6\u663E\u793A\u5F53\u524D\u7684\u8DEF\u5F84\u4FE1\u606F\u3002\u60A8\u53EF\u4EE5\u901A\u8FC7\u914D\u7F6E shell \u63D0\u793A\u7B26\u6765\u663E\u793A\u5404\u79CD\u6709\u7528\u7684\u4FE1\u606F\uFF0C\u8FD9\u4E00\u5185\u5BB9\u6211\u4EEC\u4F1A\u5728\u540E\u9762\u7684\u8BFE\u7A0B\u4E2D\u8FDB\u884C\u8BA8\u8BBA\u3002</p>\n<p>\u4E00\u822C\u6765\u8BF4\uFF0C\u5F53\u6211\u4EEC\u8FD0\u884C\u4E00\u4E2A\u7A0B\u5E8F\u65F6\uFF0C\u5982\u679C\u6211\u4EEC\u6CA1\u6709\u6307\u5B9A\u8DEF\u5F84\uFF0C\u5219\u8BE5\u7A0B\u5E8F\u4F1A\u5728\u5F53\u524D\u76EE\u5F55\u4E0B\u6267\u884C\u3002\u4F8B\u5982\uFF0C\u6211\u4EEC\u5E38\u5E38\u4F1A\u641C\u7D22\u6587\u4EF6\uFF0C\u5E76\u5728\u9700\u8981\u65F6\u521B\u5EFA\u6587\u4EF6\u3002</p>\n<p>\u4E3A\u4E86\u67E5\u770B\u6307\u5B9A\u76EE\u5F55\u4E0B\u5305\u542B\u54EA\u4E9B\u6587\u4EF6\uFF0C\u6211\u4EEC\u4F7F\u7528 <code>ls</code> \u547D\u4EE4\uFF1A</p>\n<pre><code class="language-console">missing:~$ ls\nmissing:~$ cd ..\nmissing:/home$ ls\nmissing\nmissing:/home$ cd ..\nmissing:/$ ls\nbin\nboot\ndev\netc\nhome\n...\n</code></pre>\n<p>\u9664\u975E\u6211\u4EEC\u5229\u7528\u7B2C\u4E00\u4E2A\u53C2\u6570\u6307\u5B9A\u76EE\u5F55\uFF0C\u5426\u5219 <code>ls</code> \u4F1A\u6253\u5370\u5F53\u524D\u76EE\u5F55\u4E0B\u7684\u6587\u4EF6\u3002\u5927\u591A\u6570\u7684\u547D\u4EE4\u63A5\u53D7\u6807\u8BB0\u548C\u9009\u9879\uFF08\u5E26\u6709\u503C\u7684\u6807\u8BB0\uFF09\uFF0C\u5B83\u4EEC\u4EE5 <code>-</code> \u5F00\u5934\uFF0C\u5E76\u53EF\u4EE5\u6539\u53D8\u7A0B\u5E8F\u7684\u884C\u4E3A\u3002\u901A\u5E38\uFF0C\u5728\u6267\u884C\u7A0B\u5E8F\u65F6\u4F7F\u7528 <code>-h</code> \u6216 <code>--help</code> \u6807\u8BB0\u53EF\u4EE5\u6253\u5370\u5E2E\u52A9\u4FE1\u606F\uFF0C\u4EE5\u4FBF\u4E86\u89E3\u6709\u54EA\u4E9B\u53EF\u7528\u7684\u6807\u8BB0\u6216\u9009\u9879\u3002\u4F8B\u5982\uFF0C<code>ls --help</code> \u7684\u8F93\u51FA\u5982\u4E0B\uFF1A</p>\n<pre><code>  -l                         use a long listing format\n</code></pre>\n<pre><code class="language-console">missing:~$ ls -l /home\ndrwxr-xr-x 1 missing  users  4096 Jun 15  2019 missing\n</code></pre>\n<p>\u8FD9\u4E2A\u53C2\u6570\u53EF\u4EE5\u66F4\u52A0\u8BE6\u7EC6\u5730\u5217\u51FA\u76EE\u5F55\u4E0B\u6587\u4EF6\u6216\u6587\u4EF6\u5939\u7684\u4FE1\u606F\u3002\u9996\u5148\uFF0C\u672C\u884C\u7B2C\u4E00\u4E2A\u5B57\u7B26 <code>d</code> \u8868\u793A\n<code>missing</code> \u662F\u4E00\u4E2A\u76EE\u5F55\u3002\u7136\u540E\u63A5\u4E0B\u6765\u7684\u4E5D\u4E2A\u5B57\u7B26\uFF0C\u6BCF\u4E09\u4E2A\u5B57\u7B26\u6784\u6210\u4E00\u7EC4\u3002\n\uFF08<code>rwx</code>\uFF09. \u5B83\u4EEC\u5206\u522B\u4EE3\u8868\u4E86\u6587\u4EF6\u6240\u6709\u8005\uFF08<code>missing</code>\uFF09\uFF0C\u7528\u6237\u7EC4\uFF08<code>users</code>\uFF09 \u4EE5\u53CA\u5176\u4ED6\u6240\u6709\u4EBA\u5177\u6709\u7684\u6743\u9650\u3002\u5176\u4E2D <code>-</code> \u8868\u793A\u8BE5\u7528\u6237\u4E0D\u5177\u5907\u76F8\u5E94\u7684\u6743\u9650\u3002\u4ECE\u4E0A\u9762\u7684\u4FE1\u606F\u6765\u770B\uFF0C\u53EA\u6709\u6587\u4EF6\u6240\u6709\u8005\u53EF\u4EE5\u4FEE\u6539\uFF08<code>w</code>\uFF09\uFF0C<code>missing</code> \u6587\u4EF6\u5939 \uFF08\u4F8B\u5982\uFF0C\u6DFB\u52A0\u6216\u5220\u9664\u6587\u4EF6\u5939\u4E2D\u7684\u6587\u4EF6\uFF09\u3002\u4E3A\u4E86\u8FDB\u5165\u67D0\u4E2A\u6587\u4EF6\u5939\uFF0C\u7528\u6237\u9700\u8981\u5177\u5907\u8BE5\u6587\u4EF6\u5939\u4EE5\u53CA\u5176\u7236\u6587\u4EF6\u5939\u7684\u201C\u641C\u7D22\u201D\u6743\u9650\uFF08\u4EE5\u201C\u53EF\u6267\u884C\u201D\uFF1A<code>x</code>\uFF09\u6743\u9650\u8868\u793A\u3002\u4E3A\u4E86\u5217\u51FA\u5B83\u7684\u5305\u542B\u7684\u5185\u5BB9\uFF0C\u7528\u6237\u5FC5\u987B\u5BF9\u8BE5\u6587\u4EF6\u5939\u5177\u5907\u8BFB\u6743\u9650\uFF08<code>r</code>\uFF09\u3002\u5BF9\u4E8E\u6587\u4EF6\u6765\u8BF4\uFF0C\u6743\u9650\u7684\u610F\u4E49\u4E5F\u662F\u7C7B\u4F3C\u7684\u3002\u6CE8\u610F\uFF0C<code>/bin</code> \u76EE\u5F55\u4E0B\u7684\u7A0B\u5E8F\u5728\u6700\u540E\u4E00\u7EC4\uFF0C\u5373\u8868\u793A\u6240\u6709\u4EBA\u7684\u7528\u6237\u7EC4\u4E2D\uFF0C\u5747\u5305\u542B <code>x</code> \u6743\u9650\uFF0C\u4E5F\u5C31\u662F\u8BF4\u4EFB\u4F55\u4EBA\u90FD\u53EF\u4EE5\u6267\u884C\u8FD9\u4E9B\u7A0B\u5E8F\u3002</p>\n<p>\u5728\u8FD9\u4E2A\u9636\u6BB5\uFF0C\u8FD8\u6709\u51E0\u4E2A\u8D81\u624B\u7684\u547D\u4EE4\u662F\u60A8\u9700\u8981\u638C\u63E1\u7684\uFF0C\u4F8B\u5982 <code>mv</code>\uFF08\u7528\u4E8E\u91CD\u547D\u540D\u6216\u79FB\u52A8\u6587\u4EF6\uFF09\u3001 <code>cp</code>\uFF08\u62F7\u8D1D\u6587\u4EF6\uFF09\u4EE5\u53CA <code>mkdir</code>\uFF08\u65B0\u5EFA\u6587\u4EF6\u5939\uFF09\u3002</p>\n<p>\u5982\u679C\u60A8\u60F3\u8981\u77E5\u9053\u5173\u4E8E\u7A0B\u5E8F\u53C2\u6570\u3001\u8F93\u5165\u8F93\u51FA\u7684\u4FE1\u606F\uFF0C\u4EA6\u6216\u662F\u60F3\u8981\u4E86\u89E3\u5B83\u4EEC\u7684\u5DE5\u4F5C\u65B9\u5F0F\uFF0C\u8BF7\u8BD5\u8BD5 <code>man</code> \u8FD9\u4E2A\u7A0B\u5E8F\u3002\u5B83\u4F1A\u63A5\u53D7\u4E00\u4E2A\u7A0B\u5E8F\u540D\u4F5C\u4E3A\u53C2\u6570\uFF0C\u7136\u540E\u5C06\u5B83\u7684\u6587\u6863\uFF08\u7528\u6237\u624B\u518C\uFF09\u5C55\u73B0\u7ED9\u60A8\u3002\u6CE8\u610F\uFF0C\u4F7F\u7528 <code>q</code> \u53EF\u4EE5\u9000\u51FA\u8BE5\u7A0B\u5E8F\u3002</p>\n<pre><code class="language-console">missing:~$ man ls\n</code></pre>\n<p>\u8FD9\u65F6\u5019\u4F60\u7684\u5C4F\u5E55\u5DEE\u4E0D\u591A\u5DF2\u7ECF\u6EE1\u4E86\uFF0C\u4F60\u53EF\u4F7F\u7528<code>clear</code>\u6216 <code>Ctrl+L</code> \u6765\u6E05\u5C4F</p>\n<h2>\u5728\u7A0B\u5E8F\u95F4\u521B\u5EFA\u8FDE\u63A5</h2>\n<p>\u5728 shell \u4E2D\uFF0C\u7A0B\u5E8F\u6709\u4E24\u4E2A\u4E3B\u8981\u7684\u201C\u6D41\u201D\uFF1A\u5B83\u4EEC\u7684\u8F93\u5165\u6D41\u548C\u8F93\u51FA\u6D41\u3002\n\u5F53\u7A0B\u5E8F\u5C1D\u8BD5\u8BFB\u53D6\u4FE1\u606F\u65F6\uFF0C\u5B83\u4EEC\u4F1A\u4ECE\u8F93\u5165\u6D41\u4E2D\u8FDB\u884C\u8BFB\u53D6\uFF0C\u5F53\u7A0B\u5E8F\u6253\u5370\u4FE1\u606F\u65F6\uFF0C\u5B83\u4EEC\u4F1A\u5C06\u4FE1\u606F\u8F93\u51FA\u5230\u8F93\u51FA\u6D41\u4E2D\u3002\n\u901A\u5E38\uFF0C\u4E00\u4E2A\u7A0B\u5E8F\u7684\u8F93\u5165\u8F93\u51FA\u6D41\u90FD\u662F\u60A8\u7684\u7EC8\u7AEF\u3002\u4E5F\u5C31\u662F\uFF0C\u60A8\u7684\u952E\u76D8\u4F5C\u4E3A\u8F93\u5165\uFF0C\u663E\u793A\u5668\u4F5C\u4E3A\u8F93\u51FA\u3002\n\u4F46\u662F\uFF0C\u6211\u4EEC\u4E5F\u53EF\u4EE5\u91CD\u5B9A\u5411\u8FD9\u4E9B\u6D41\uFF01</p>\n<p>\u6700\u7B80\u5355\u7684\u91CD\u5B9A\u5411\u662F <code>&lt; file</code> \u548C <code>&gt; file</code>\u3002\u8FD9\u4E24\u4E2A\u547D\u4EE4\u53EF\u4EE5\u5C06\u7A0B\u5E8F\u7684\u8F93\u5165\u8F93\u51FA\u6D41\u5206\u522B\u91CD\u5B9A\u5411\u5230\u6587\u4EF6\uFF1A</p>\n<pre><code class="language-console">missing:~$ echo hello &gt; hello.txt\nmissing:~$ cat hello.txt\nhello\nmissing:~$ cat &lt; hello.txt\nhello\nmissing:~$ cat &lt; hello.txt &gt; hello2.txt\nmissing:~$ cat hello2.txt\nhello\n</code></pre>\n<p>\u60A8\u8FD8\u53EF\u4EE5\u4F7F\u7528 <code>&gt;&gt;</code> \u6765\u5411\u4E00\u4E2A\u6587\u4EF6\u8FFD\u52A0\u5185\u5BB9\u3002\u4F7F\u7528\u7BA1\u9053\uFF08 <em>pipes</em> \uFF09\uFF0C\u6211\u4EEC\u80FD\u591F\u66F4\u597D\u7684\u5229\u7528\u6587\u4EF6\u91CD\u5B9A\u5411\u3002\n<code>|</code> \u64CD\u4F5C\u7B26\u5141\u8BB8\u6211\u4EEC\u5C06\u4E00\u4E2A\u7A0B\u5E8F\u7684\u8F93\u51FA\u548C\u53E6\u5916\u4E00\u4E2A\u7A0B\u5E8F\u7684\u8F93\u5165\u8FDE\u63A5\u8D77\u6765\uFF1A </p>\n<pre><code class="language-console">missing:~$ ls -l / | tail -n1\ndrwxr-xr-x 1 root  root  4096 Jun 20  2019 var\nmissing:~$ curl --head --silent google.com | grep --ignore-case content-length | cut --delimiter=&#39; &#39; -f2\n219\n</code></pre>\n<p>\u6211\u4EEC\u4F1A\u5728\u6570\u636E\u6E05\u7406\u4E00\u7AE0\u4E2D\u66F4\u52A0\u8BE6\u7EC6\u7684\u63A2\u8BA8\u5982\u4F55\u66F4\u597D\u7684\u5229\u7528\u7BA1\u9053\u3002</p>\n<h2>\u4E00\u4E2A\u529F\u80FD\u5168\u9762\u53C8\u5F3A\u5927\u7684\u5DE5\u5177</h2>\n<p>\u5BF9\u4E8E\u5927\u591A\u6570\u7684\u7C7B Unix \u7CFB\u7EDF\uFF0C\u6709\u4E00\u7C7B\u7528\u6237\u662F\u975E\u5E38\u7279\u6B8A\u7684\uFF0C\u90A3\u5C31\u662F\uFF1A\u6839\u7528\u6237\uFF08root user\uFF09\u3002\n\u60A8\u5E94\u8BE5\u5DF2\u7ECF\u6CE8\u610F\u5230\u4E86\uFF0C\u5728\u4E0A\u9762\u7684\u8F93\u51FA\u7ED3\u679C\u4E2D\uFF0C\u6839\u7528\u6237\u51E0\u4E4E\u4E0D\u53D7\u4EFB\u4F55\u9650\u5236\uFF0C\u4ED6\u53EF\u4EE5\u521B\u5EFA\u3001\u8BFB\u53D6\u3001\u66F4\u65B0\u548C\u5220\u9664\u7CFB\u7EDF\u4E2D\u7684\u4EFB\u4F55\u6587\u4EF6\u3002\n\u901A\u5E38\u5728\u6211\u4EEC\u5E76\u4E0D\u4F1A\u4EE5\u6839\u7528\u6237\u7684\u8EAB\u4EFD\u76F4\u63A5\u767B\u5F55\u7CFB\u7EDF\uFF0C\u56E0\u4E3A\u8FD9\u6837\u53EF\u80FD\u4F1A\u56E0\u4E3A\u67D0\u4E9B\u9519\u8BEF\u7684\u64CD\u4F5C\u800C\u7834\u574F\u7CFB\u7EDF\u3002\n\u53D6\u800C\u4EE3\u4E4B\u7684\u662F\u6211\u4EEC\u4F1A\u5728\u9700\u8981\u7684\u65F6\u5019\u4F7F\u7528 <code>sudo</code> \u547D\u4EE4\u3002\u987E\u540D\u601D\u4E49\uFF0C\u5B83\u7684\u4F5C\u7528\u662F\u8BA9\u60A8\u53EF\u4EE5\u4EE5 su\uFF08super user \u6216 root \u7684\u7B80\u5199\uFF09\u7684\u8EAB\u4EFD\u6267\u884C\u4E00\u4E9B\u64CD\u4F5C\u3002\n\u5F53\u60A8\u9047\u5230\u62D2\u7EDD\u8BBF\u95EE\uFF08permission denied\uFF09\u7684\u9519\u8BEF\u65F6\uFF0C\u901A\u5E38\u662F\u56E0\u4E3A\u6B64\u65F6\u60A8\u5FC5\u987B\u662F\u6839\u7528\u6237\u624D\u80FD\u64CD\u4F5C\u3002\u7136\u800C\uFF0C\u8BF7\u518D\u6B21\u786E\u8BA4\u60A8\u662F\u771F\u7684\u8981\u6267\u884C\u6B64\u64CD\u4F5C\u3002</p>\n<p>\u6709\u4E00\u4EF6\u4E8B\u60C5\u662F\u60A8\u5FC5\u987B\u4F5C\u4E3A\u6839\u7528\u6237\u624D\u80FD\u505A\u7684\uFF0C\u90A3\u5C31\u662F\u5411 <code>sysfs</code> \u6587\u4EF6\u5199\u5165\u5185\u5BB9\u3002\u7CFB\u7EDF\u88AB\u6302\u8F7D\u5728 <code>/sys</code> \u4E0B\uFF0C<code>sysfs</code> \u6587\u4EF6\u5219\u66B4\u9732\u4E86\u4E00\u4E9B\u5185\u6838\uFF08kernel\uFF09\u53C2\u6570\u3002\n\u56E0\u6B64\uFF0C\u60A8\u4E0D\u9700\u8981\u501F\u52A9\u4EFB\u4F55\u4E13\u7528\u7684\u5DE5\u5177\uFF0C\u5C31\u53EF\u4EE5\u8F7B\u677E\u5730\u5728\u8FD0\u884C\u671F\u95F4\u914D\u7F6E\u7CFB\u7EDF\u5185\u6838\u3002<strong>\u6CE8\u610F Windows \u548C macOS \u6CA1\u6709\u8FD9\u4E2A\u6587\u4EF6</strong></p>\n<p>\u4F8B\u5982\uFF0C\u60A8\u7B14\u8BB0\u672C\u7535\u8111\u7684\u5C4F\u5E55\u4EAE\u5EA6\u5199\u5728 <code>brightness</code> \u6587\u4EF6\u4E2D\uFF0C\u5B83\u4F4D\u4E8E</p>\n<pre><code>/sys/class/backlight\n</code></pre>\n<p>\u901A\u8FC7\u5C06\u6570\u503C\u5199\u5165\u8BE5\u6587\u4EF6\uFF0C\u6211\u4EEC\u53EF\u4EE5\u6539\u53D8\u5C4F\u5E55\u7684\u4EAE\u5EA6\u3002\u73B0\u5728\uFF0C\u8E66\u5230\u60A8\u8111\u888B\u91CC\u7684\u7B2C\u4E00\u4E2A\u60F3\u6CD5\u53EF\u80FD\u662F\uFF1A</p>\n<pre><code class="language-console">$ sudo find -L /sys/class/backlight -maxdepth 2 -name &#39;*brightness*&#39;\n/sys/class/backlight/thinkpad_screen/brightness\n$ cd /sys/class/backlight/thinkpad_screen\n$ sudo echo 3 &gt; brightness\nAn error occurred while redirecting file &#39;brightness&#39;\nopen: Permission denied\n</code></pre>\n<p>\u51FA\u4E4E\u610F\u6599\u7684\u662F\uFF0C\u6211\u4EEC\u8FD8\u662F\u5F97\u5230\u4E86\u4E00\u4E2A\u9519\u8BEF\u4FE1\u606F\u3002\u6BD5\u7ADF\uFF0C\u6211\u4EEC\u5DF2\u7ECF\u4F7F\u7528\u4E86\n<code>sudo</code> \u547D\u4EE4\uFF01\u5173\u4E8E shell\uFF0C\u6709\u4EF6\u4E8B\u6211\u4EEC\u5FC5\u987B\u8981\u77E5\u9053\u3002<code>|</code>\u3001<code>&gt;</code>\u3001\u548C <code>&lt;</code> \u662F\u901A\u8FC7 shell \u6267\u884C\u7684\uFF0C\u800C\u4E0D\u662F\u88AB\u5404\u4E2A\u7A0B\u5E8F\u5355\u72EC\u6267\u884C\u3002\n<code>echo</code> \u7B49\u7A0B\u5E8F\u5E76\u4E0D\u77E5\u9053 <code>|</code> \u7684\u5B58\u5728\uFF0C\u5B83\u4EEC\u53EA\u77E5\u9053\u4ECE\u81EA\u5DF1\u7684\u8F93\u5165\u8F93\u51FA\u6D41\u4E2D\u8FDB\u884C\u8BFB\u5199\u3002\n\u56DE\u5230\u4E0A\u9762\u66F4\u6539\u5C4F\u5E55\u4EAE\u5EA6\u547D\u4EE4\u6267\u884C\u7684\u62A5\u9519\uFF0C\u4E3A\u4E86\u80FD\u8BA9 <code>sudo echo</code> \u547D\u4EE4\u8F93\u51FA\u7684\u4EAE\u5EA6\u503C\u5199\u5165 brightness \u6587\u4EF6\uFF0C <em>shell</em> (\u6743\u9650\u4E3A\u5F53\u524D\u7528\u6237) \u4F1A\u5148\u5C1D\u8BD5\u6253\u5F00 brightness \u6587\u4EF6\uFF0C\u4F46\u6B64\u65F6\u64CD\u4F5C shell \u7684\u4E0D\u662F\u6839\uFF08root\uFF09\u7528\u6237\uFF0C\u6240\u4EE5\u7CFB\u7EDF\u62D2\u7EDD\u4E86\u8FD9\u4E2A\u6253\u5F00\u64CD\u4F5C\uFF0C\u63D0\u793A\u65E0\u6743\u9650\u3002</p>\n<p>\u660E\u767D\u8FD9\u4E00\u70B9\u540E\uFF0C\u6211\u4EEC\u53EF\u4EE5\u8FD9\u6837\u64CD\u4F5C\uFF1A</p>\n<pre><code class="language-console">$ echo 3 | sudo tee brightness\n</code></pre>\n<p>\u6B64\u65F6\u6253\u5F00 <code>/sys</code> \u6587\u4EF6\u7684\u662F <code>tee</code> \u8FD9\u4E2A\u7A0B\u5E8F\uFF0C\u5E76\u4E14\u8BE5\u7A0B\u5E8F\u4EE5 <code>root</code> \u6743\u9650\u5728\u8FD0\u884C\uFF0C\u56E0\u6B64\u64CD\u4F5C\u53EF\u4EE5\u8FDB\u884C\u3002\n\u8FD9\u6837\u60A8\u5C31\u53EF\u4EE5\u5728 <code>/sys</code> \u4E2D\u6109\u5FEB\u5730\u73A9\u800D\u4E86\uFF0C\u4F8B\u5982\u4FEE\u6539\u7CFB\u7EDF\u4E2D\u5404\u79CD LED \u7684\u72B6\u6001\uFF08\u8DEF\u5F84\u53EF\u80FD\u4F1A\u6709\u6240\u4E0D\u540C\uFF09\uFF1A</p>\n<pre><code class="language-console">$ echo 1 | sudo tee /sys/class/leds/input6::scrolllock/brightness\n</code></pre>\n'
    },
    {
      slug: "command-line",
      title: "\u547D\u4EE4\u884C\u73AF\u5883",
      date: "2025-10-05T11:02:53.000Z",
      tags: [
        "\u8BA1\u7B97\u673A\u57FA\u7840"
      ],
      excerpt: " \u547D\u4EE4\u884C\u73AF\u5883\n\n\u5F53\u60A8\u4F7F\u7528 shell \u8FDB\u884C\u5DE5\u4F5C\u65F6\uFF0C\u53EF\u4EE5\u4F7F\u7528\u4E00\u4E9B\u65B9\u6CD5\u6539\u5584\u60A8\u7684\u5DE5\u4F5C\u6D41\uFF0C\u672C\u8282\u8BFE\u6211\u4EEC\u5C31\u6765\u8BA8\u8BBA\u8FD9\u4E9B\u65B9\u6CD5\u3002\n\n\u6211\u4EEC\u5DF2\u7ECF\u4F7F\u7528 shell \u4E00\u6BB5\u65F6\u95F4\u4E86\uFF0C\u4F46\u662F\u5230\u76EE\u524D\u4E3A\u6B62\u6211\u4EEC\u7684\u5173\u6CE8\u70B9\u4E3B\u8981\u96C6\u4E2D\u5728\u4F7F\u7528\u4E0D\u540C\u7684\u547D\u4EE4\u4E0A\u9762\u3002\u73B0\u5728\uFF0C\u6211\u4EEC\u5C06\u4F1A\u5B66\u4E60\u5982\u4F55\u540C\u65F6\u6267\u884C\u591A\u4E2A\u4E0D\u540C\u7684\u8FDB\u7A0B\u5E76\u8FFD\u8E2A\u5B83\u4EEC\u7684\u72B6\u6001\u3001\u5982\u4F55\u505C\u6B62\u6216\u6682\u505C\u67D0\u4E2A\u8FDB\u7A0B\u4EE5\u53CA\u5982\u4F55\u4F7F\u8FDB\u7A0B\u5728\u540E\u53F0\u8FD0\u884C\u3002\n\n\u6211\u4EEC\u8FD8\u5C06\u5B66\u4E60\u4E00\u4E9B\u80FD\u591F\u6539\u5584\u60A8\u7684 shell \u53CA\u5176\u4ED6\u5DE5\u5177\u7684\u5DE5\u4F5C\u6D41\u7684\u65B9\u6CD5\uFF0C\u8FD9\u4E3B\u8981\u662F...",
      content: '<h1>\u547D\u4EE4\u884C\u73AF\u5883</h1>\n<p>\u5F53\u60A8\u4F7F\u7528 shell \u8FDB\u884C\u5DE5\u4F5C\u65F6\uFF0C\u53EF\u4EE5\u4F7F\u7528\u4E00\u4E9B\u65B9\u6CD5\u6539\u5584\u60A8\u7684\u5DE5\u4F5C\u6D41\uFF0C\u672C\u8282\u8BFE\u6211\u4EEC\u5C31\u6765\u8BA8\u8BBA\u8FD9\u4E9B\u65B9\u6CD5\u3002</p>\n<p>\u6211\u4EEC\u5DF2\u7ECF\u4F7F\u7528 shell \u4E00\u6BB5\u65F6\u95F4\u4E86\uFF0C\u4F46\u662F\u5230\u76EE\u524D\u4E3A\u6B62\u6211\u4EEC\u7684\u5173\u6CE8\u70B9\u4E3B\u8981\u96C6\u4E2D\u5728\u4F7F\u7528\u4E0D\u540C\u7684\u547D\u4EE4\u4E0A\u9762\u3002\u73B0\u5728\uFF0C\u6211\u4EEC\u5C06\u4F1A\u5B66\u4E60\u5982\u4F55\u540C\u65F6\u6267\u884C\u591A\u4E2A\u4E0D\u540C\u7684\u8FDB\u7A0B\u5E76\u8FFD\u8E2A\u5B83\u4EEC\u7684\u72B6\u6001\u3001\u5982\u4F55\u505C\u6B62\u6216\u6682\u505C\u67D0\u4E2A\u8FDB\u7A0B\u4EE5\u53CA\u5982\u4F55\u4F7F\u8FDB\u7A0B\u5728\u540E\u53F0\u8FD0\u884C\u3002</p>\n<p>\u6211\u4EEC\u8FD8\u5C06\u5B66\u4E60\u4E00\u4E9B\u80FD\u591F\u6539\u5584\u60A8\u7684 shell \u53CA\u5176\u4ED6\u5DE5\u5177\u7684\u5DE5\u4F5C\u6D41\u7684\u65B9\u6CD5\uFF0C\u8FD9\u4E3B\u8981\u662F\u901A\u8FC7\u5B9A\u4E49\u522B\u540D\u6216\u57FA\u4E8E\u914D\u7F6E\u6587\u4EF6\u5BF9\u5176\u8FDB\u884C\u914D\u7F6E\u6765\u5B9E\u73B0\u7684\u3002\u8FD9\u4E9B\u65B9\u6CD5\u90FD\u53EF\u4EE5\u5E2E\u60A8\u8282\u7701\u5927\u91CF\u7684\u65F6\u95F4\u3002\u4F8B\u5982\uFF0C\u4EC5\u9700\u8981\u6267\u884C\u4E00\u4E9B\u7B80\u5355\u7684\u547D\u4EE4\uFF0C\u6211\u4EEC\u5C31\u53EF\u4EE5\u5728\u6240\u6709\u7684\u4E3B\u673A\u4E0A\u4F7F\u7528\u76F8\u540C\u7684\u914D\u7F6E\u3002\u6211\u4EEC\u8FD8\u4F1A\u5B66\u4E60\u5982\u4F55\u4F7F\u7528 SSH \u64CD\u4F5C\u8FDC\u7AEF\u673A\u5668\u3002</p>\n<h1>\u4EFB\u52A1\u63A7\u5236</h1>\n<p>\u67D0\u4E9B\u60C5\u51B5\u4E0B\u6211\u4EEC\u9700\u8981\u4E2D\u65AD\u6B63\u5728\u6267\u884C\u7684\u4EFB\u52A1\uFF0C\u6BD4\u5982\u5F53\u4E00\u4E2A\u547D\u4EE4\u9700\u8981\u6267\u884C\u5F88\u957F\u65F6\u95F4\u624D\u80FD\u5B8C\u6210\u65F6\uFF08\u5047\u8BBE\u6211\u4EEC\u5728\u4F7F\u7528 <code>find</code> \u641C\u7D22\u4E00\u4E2A\u975E\u5E38\u5927\u7684\u76EE\u5F55\u7ED3\u6784\uFF09\u3002\u5927\u591A\u6570\u60C5\u51B5\u4E0B\uFF0C\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528 <code>Ctrl-C</code> \u6765\u505C\u6B62\u547D\u4EE4\u7684\u6267\u884C\u3002\u4F46\u662F\u5B83\u7684\u5DE5\u4F5C\u539F\u7406\u662F\u4EC0\u4E48\u5462\uFF1F\u4E3A\u4EC0\u4E48\u6709\u7684\u65F6\u5019\u4F1A\u65E0\u6CD5\u7ED3\u675F\u8FDB\u7A0B\uFF1F</p>\n<h2>\u7ED3\u675F\u8FDB\u7A0B</h2>\n<p>\u60A8\u7684 shell \u4F1A\u4F7F\u7528 UNIX \u63D0\u4F9B\u7684\u4FE1\u53F7\u673A\u5236\u6267\u884C\u8FDB\u7A0B\u95F4\u901A\u4FE1\u3002\u5F53\u4E00\u4E2A\u8FDB\u7A0B\u63A5\u6536\u5230\u4FE1\u53F7\u65F6\uFF0C\u5B83\u4F1A\u505C\u6B62\u6267\u884C\u3001\u5904\u7406\u8BE5\u4FE1\u53F7\u5E76\u57FA\u4E8E\u4FE1\u53F7\u4F20\u9012\u7684\u4FE1\u606F\u6765\u6539\u53D8\u5176\u6267\u884C\u3002\u5C31\u8FD9\u4E00\u70B9\u800C\u8A00\uFF0C\u4FE1\u53F7\u662F\u4E00\u79CD <em>\u8F6F\u4EF6\u4E2D\u65AD</em>\u3002</p>\n<p>\u5728\u4E0A\u9762\u7684\u4F8B\u5B50\u4E2D\uFF0C\u5F53\u6211\u4EEC\u8F93\u5165 <code>Ctrl-C</code> \u65F6\uFF0Cshell \u4F1A\u53D1\u9001\u4E00\u4E2A <code>SIGINT</code> \u4FE1\u53F7\u5230\u8FDB\u7A0B\u3002</p>\n<p>\u4E0B\u9762\u8FD9\u4E2A Python \u7A0B\u5E8F\u5411\u60A8\u5C55\u793A\u4E86\u6355\u83B7\u4FE1\u53F7 <code>SIGINT</code> \u5E76\u5FFD\u7565\u5B83\u7684\u57FA\u672C\u64CD\u4F5C\uFF0C\u5B83\u5E76\u4E0D\u4F1A\u8BA9\u7A0B\u5E8F\u505C\u6B62\u3002\u4E3A\u4E86\u505C\u6B62\u8FD9\u4E2A\u7A0B\u5E8F\uFF0C\u6211\u4EEC\u9700\u8981\u4F7F\u7528 <code>SIGQUIT</code> \u4FE1\u53F7\uFF0C\u901A\u8FC7\u8F93\u5165 <code>Ctrl-\\</code> \u53EF\u4EE5\u53D1\u9001\u8BE5\u4FE1\u53F7\u3002</p>\n<pre><code class="language-python">#!/usr/bin/env python\nimport signal, time\n\ndef handler(signum, time):\n    print(&quot;\\nI got a SIGINT, but I am not stopping&quot;)\n\nsignal.signal(signal.SIGINT, handler)\ni = 0\nwhile True:\n    time.sleep(.1)\n    print(&quot;\\r{}&quot;.format(i), end=&quot;&quot;)\n    i += 1\n</code></pre>\n<p>\u5982\u679C\u6211\u4EEC\u5411\u8FD9\u4E2A\u7A0B\u5E8F\u53D1\u9001\u4E24\u6B21 <code>SIGINT</code> \uFF0C\u7136\u540E\u518D\u53D1\u9001\u4E00\u6B21 <code>SIGQUIT</code>\uFF0C\u7A0B\u5E8F\u4F1A\u6709\u4EC0\u4E48\u53CD\u5E94\uFF1F\u6CE8\u610F <code>^</code> \u662F\u6211\u4EEC\u5728\u7EC8\u7AEF\u8F93\u5165 <code>Ctrl</code> \u65F6\u7684\u8868\u793A\u5F62\u5F0F\uFF1A</p>\n<pre><code>$ python sigint.py\n24^C\nI got a SIGINT, but I am not stopping\n26^C\nI got a SIGINT, but I am not stopping\n30^\\[1]    39913 quit       python sigint.py\u0192\n</code></pre>\n<p>\u5C3D\u7BA1 <code>SIGINT</code> \u548C <code>SIGQUIT</code> \u90FD\u5E38\u5E38\u7528\u6765\u53D1\u51FA\u548C\u7EC8\u6B62\u7A0B\u5E8F\u76F8\u5173\u7684\u8BF7\u6C42\u3002<code>SIGTERM</code> \u5219\u662F\u4E00\u4E2A\u66F4\u52A0\u901A\u7528\u7684\u3001\u4E5F\u66F4\u52A0\u4F18\u96C5\u5730\u9000\u51FA\u4FE1\u53F7\u3002\u4E3A\u4E86\u53D1\u51FA\u8FD9\u4E2A\u4FE1\u53F7\u6211\u4EEC\u9700\u8981\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-kill.html"><code>kill</code></a> \u547D\u4EE4, \u5B83\u7684\u8BED\u6CD5\u662F\uFF1A <code>kill -TERM &lt;PID&gt;</code>\u3002</p>\n<h2>\u6682\u505C\u548C\u540E\u53F0\u6267\u884C\u8FDB\u7A0B</h2>\n<p>\u4FE1\u53F7\u53EF\u4EE5\u8BA9\u8FDB\u7A0B\u505A\u5176\u4ED6\u7684\u4E8B\u60C5\uFF0C\u800C\u4E0D\u4EC5\u4EC5\u662F\u7EC8\u6B62\u5B83\u4EEC\u3002\u4F8B\u5982\uFF0C<code>SIGSTOP</code> \u4F1A\u8BA9\u8FDB\u7A0B\u6682\u505C\u3002\u5728\u7EC8\u7AEF\u4E2D\uFF0C\u952E\u5165 <code>Ctrl-Z</code> \u4F1A\u8BA9 shell \u53D1\u9001 <code>SIGTSTP</code> \u4FE1\u53F7\uFF0C<code>SIGTSTP</code> \u662F Terminal Stop \u7684\u7F29\u5199\uFF08\u5373 <code>terminal</code> \u7248\u672C\u7684 SIGSTOP\uFF09\u3002</p>\n<p>\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-fg.html"><code>fg</code></a> \u6216 <a href="https://www.runoob.com/linux/linux-comm-bg.html"><code>bg</code></a> \u547D\u4EE4\u6062\u590D\u6682\u505C\u7684\u5DE5\u4F5C\u3002\u5B83\u4EEC\u5206\u522B\u8868\u793A\u5728\u524D\u53F0\u7EE7\u7EED\u6216\u5728\u540E\u53F0\u7EE7\u7EED\u3002</p>\n<p><a href="https://www.runoob.com/linux/linux-comm-jobs.html"><code>jobs</code></a> \u547D\u4EE4\u4F1A\u5217\u51FA\u5F53\u524D\u7EC8\u7AEF\u4F1A\u8BDD\u4E2D\u5C1A\u672A\u5B8C\u6210\u7684\u5168\u90E8\u4EFB\u52A1\u3002\u60A8\u53EF\u4EE5\u4F7F\u7528 pid \u5F15\u7528\u8FD9\u4E9B\u4EFB\u52A1\uFF08\u4E5F\u53EF\u4EE5\u7528 <a href="https://www.runoob.com/linux/linux-comm-pgrep.html"><code>pgrep</code></a> \u627E\u51FA pid\uFF09\u3002\u66F4\u52A0\u7B26\u5408\u76F4\u89C9\u7684\u64CD\u4F5C\u662F\u60A8\u53EF\u4EE5\u4F7F\u7528\u767E\u5206\u53F7 + \u4EFB\u52A1\u7F16\u53F7\uFF08<code>jobs</code> \u4F1A\u6253\u5370\u4EFB\u52A1\u7F16\u53F7\uFF09\u6765\u9009\u53D6\u8BE5\u4EFB\u52A1\u3002\u5982\u679C\u8981\u9009\u62E9\u6700\u8FD1\u7684\u4E00\u4E2A\u4EFB\u52A1\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>$!</code> \u8FD9\u4E00\u7279\u6B8A\u53C2\u6570\u3002</p>\n<p>\u8FD8\u6709\u4E00\u4EF6\u4E8B\u60C5\u9700\u8981\u638C\u63E1\uFF0C\u90A3\u5C31\u662F\u547D\u4EE4\u4E2D\u7684 <code>&amp;</code> \u540E\u7F00\u53EF\u4EE5\u8BA9\u547D\u4EE4\u5728\u76F4\u63A5\u5728\u540E\u53F0\u8FD0\u884C\uFF0C\u8FD9\u4F7F\u5F97\u60A8\u53EF\u4EE5\u76F4\u63A5\u5728 shell \u4E2D\u7EE7\u7EED\u505A\u5176\u4ED6\u64CD\u4F5C\uFF0C\u4E0D\u8FC7\u5B83\u6B64\u65F6\u8FD8\u662F\u4F1A\u4F7F\u7528 shell \u7684\u6807\u51C6\u8F93\u51FA\uFF0C\u8FD9\u4E00\u70B9\u6709\u65F6\u4F1A\u6BD4\u8F83\u607C\u4EBA\uFF08\u8FD9\u79CD\u60C5\u51B5\u53EF\u4EE5\u4F7F\u7528 shell \u91CD\u5B9A\u5411\u5904\u7406\uFF09\u3002</p>\n<p>\u8BA9\u5DF2\u7ECF\u5728\u8FD0\u884C\u7684\u8FDB\u7A0B\u8F6C\u5230\u540E\u53F0\u8FD0\u884C\uFF0C\u60A8\u53EF\u4EE5\u952E\u5165 <code>Ctrl-Z</code> \uFF0C\u7136\u540E\u7D27\u63A5\u7740\u518D\u8F93\u5165 <code>bg</code>\u3002\u6CE8\u610F\uFF0C\u540E\u53F0\u7684\u8FDB\u7A0B\u4ECD\u7136\u662F\u60A8\u7684\u7EC8\u7AEF\u8FDB\u7A0B\u7684\u5B50\u8FDB\u7A0B\uFF0C\u4E00\u65E6\u60A8\u5173\u95ED\u7EC8\u7AEF\uFF08\u4F1A\u53D1\u9001\u53E6\u5916\u4E00\u4E2A\u4FE1\u53F7 <code>SIGHUP</code>\uFF09\uFF0C\u8FD9\u4E9B\u540E\u53F0\u7684\u8FDB\u7A0B\u4E5F\u4F1A\u7EC8\u6B62\u3002\u4E3A\u4E86\u9632\u6B62\u8FD9\u79CD\u60C5\u51B5\u53D1\u751F\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-nohup.html"><code>nohup</code></a>\uFF08\u4E00\u4E2A\u7528\u6765\u5FFD\u7565 <code>SIGHUP</code> \u7684\u5C01\u88C5\uFF09\u6765\u8FD0\u884C\u7A0B\u5E8F\u3002\u9488\u5BF9\u5DF2\u7ECF\u8FD0\u884C\u7684\u7A0B\u5E8F\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>disown</code> \u3002\u9664\u6B64\u4E4B\u5916\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528\u7EC8\u7AEF\u591A\u8DEF\u590D\u7528\u5668\u6765\u5B9E\u73B0\uFF0C\u4E0B\u4E00\u7AE0\u8282\u6211\u4EEC\u4F1A\u8FDB\u884C\u8BE6\u7EC6\u5730\u63A2\u8BA8\u3002</p>\n<p>\u4E0B\u9762\u8FD9\u4E2A\u7B80\u5355\u7684\u4F1A\u8BDD\u4E2D\u5C55\u793A\u6765\u4E86\u4E9B\u6982\u5FF5\u7684\u5E94\u7528\u3002</p>\n<pre><code>$ sleep 1000\n^Z\n[1]  + 18653 suspended  sleep 1000\n\n$ nohup sleep 2000 &amp;\n[2] 18745\nappending output to nohup.out\n\n$ jobs\n[1]  + suspended  sleep 1000\n[2]  - running    nohup sleep 2000\n\n$ bg %1\n[1]  - 18653 continued  sleep 1000\n\n$ jobs\n[1]  - running    sleep 1000\n[2]  + running    nohup sleep 2000\n\n$ kill -STOP %1\n[1]  + 18653 suspended (signal)  sleep 1000\n\n$ jobs\n[1]  + suspended (signal)  sleep 1000\n[2]  - running    nohup sleep 2000\n\n$ kill -SIGHUP %1\n[1]  + 18653 hangup     sleep 1000\n\n$ jobs\n[2]  + running    nohup sleep 2000\n\n$ kill -SIGHUP %2\n\n$ jobs\n[2]  + running    nohup sleep 2000\n\n$ kill %2\n[2]  + 18745 terminated  nohup sleep 2000\n\n$ jobs\n</code></pre>\n<p><code>SIGKILL</code> \u662F\u4E00\u4E2A\u7279\u6B8A\u7684\u4FE1\u53F7\uFF0C\u5B83\u4E0D\u80FD\u88AB\u8FDB\u7A0B\u6355\u83B7\u5E76\u4E14\u5B83\u4F1A\u9A6C\u4E0A\u7ED3\u675F\u8BE5\u8FDB\u7A0B\u3002\u4E0D\u8FC7\u8FD9\u6837\u505A\u4F1A\u6709\u4E00\u4E9B\u526F\u4F5C\u7528\uFF0C\u4F8B\u5982\u7559\u4E0B\u5B64\u513F\u8FDB\u7A0B\u3002</p>\n<p>\u60A8\u53EF\u4EE5\u5728 <a href="https://www.kyleblog.cn/posts/signal">\u8FD9\u91CC</a> \u6216\u4F7F\u7528 <code>kill -l</code> \u6765\u83B7\u53D6\u66F4\u591A\u5173\u4E8E\u4FE1\u53F7\u7684\u4FE1\u606F\u3002</p>\n<h1>\u7EC8\u7AEF\u591A\u8DEF\u590D\u7528</h1>\n<p>\u5F53\u60A8\u5728\u4F7F\u7528\u547D\u4EE4\u884C\u65F6\uFF0C\u60A8\u901A\u5E38\u4F1A\u5E0C\u671B\u540C\u65F6\u6267\u884C\u591A\u4E2A\u4EFB\u52A1\u3002\u4E3E\u4F8B\u6765\u8BF4\uFF0C\u60A8\u53EF\u4EE5\u60F3\u8981\u540C\u65F6\u8FD0\u884C\u60A8\u7684\u7F16\u8F91\u5668\uFF0C\u5E76\u5728\u7EC8\u7AEF\u7684\u53E6\u5916\u4E00\u4FA7\u6267\u884C\u7A0B\u5E8F\u3002\u5C3D\u7BA1\u518D\u6253\u5F00\u4E00\u4E2A\u65B0\u7684\u7EC8\u7AEF\u7A97\u53E3\u4E5F\u80FD\u8FBE\u5230\u76EE\u7684\uFF0C\u4F7F\u7528\u7EC8\u7AEF\u591A\u8DEF\u590D\u7528\u5668\u5219\u662F\u4E00\u79CD\u66F4\u597D\u7684\u529E\u6CD5\u3002</p>\n<p>\u50CF <a href="https://www.runoob.com/linux/linux-comm-tmux.html"><code>tmux</code></a> \u8FD9\u7C7B\u7684\u7EC8\u7AEF\u591A\u8DEF\u590D\u7528\u5668\u53EF\u4EE5\u5141\u8BB8\u6211\u4EEC\u57FA\u4E8E\u9762\u677F\u548C\u6807\u7B7E\u5206\u5272\u51FA\u591A\u4E2A\u7EC8\u7AEF\u7A97\u53E3\uFF0C\u8FD9\u6837\u60A8\u4FBF\u53EF\u4EE5\u540C\u65F6\u4E0E\u591A\u4E2A shell \u4F1A\u8BDD\u8FDB\u884C\u4EA4\u4E92\u3002</p>\n<p>\u4E0D\u4EC5\u5982\u6B64\uFF0C\u7EC8\u7AEF\u591A\u8DEF\u590D\u7528\u4F7F\u6211\u4EEC\u53EF\u4EE5\u5206\u79BB\u5F53\u524D\u7EC8\u7AEF\u4F1A\u8BDD\u5E76\u5728\u5C06\u6765\u91CD\u65B0\u8FDE\u63A5\u3002</p>\n<p>\u8FD9\u8BA9\u60A8\u64CD\u4F5C\u8FDC\u7AEF\u8BBE\u5907\u65F6\u7684\u5DE5\u4F5C\u6D41\u5927\u5927\u6539\u5584\uFF0C\u907F\u514D\u4E86 <code>nohup</code> \u548C\u5176\u4ED6\u7C7B\u4F3C\u6280\u5DE7\u7684\u4F7F\u7528\u3002</p>\n<p>\u73B0\u5728\u6700\u6D41\u884C\u7684\u7EC8\u7AEF\u591A\u8DEF\u5668\u662F <a href="https://www.runoob.com/linux/linux-comm-tmux.html"><code>tmux</code></a>\u3002<code>tmux</code> \u662F\u4E00\u4E2A\u9AD8\u5EA6\u53EF\u5B9A\u5236\u7684\u5DE5\u5177\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528\u76F8\u5173\u5FEB\u6377\u952E\u521B\u5EFA\u591A\u4E2A\u6807\u7B7E\u9875\u5E76\u5728\u5B83\u4EEC\u95F4\u5BFC\u822A\u3002</p>\n<p><code>tmux</code> \u7684\u5FEB\u6377\u952E\u9700\u8981\u6211\u4EEC\u638C\u63E1\uFF0C\u5B83\u4EEC\u90FD\u662F\u7C7B\u4F3C <code>&lt;C-b&gt; x</code> \u8FD9\u6837\u7684\u7EC4\u5408\uFF0C\u5373\u9700\u8981\u5148\u6309\u4E0B <code>Ctrl+b</code>\uFF0C\u677E\u5F00\u540E\u518D\u6309\u4E0B <code>x</code>\u3002<code>tmux</code> \u4E2D\u5BF9\u8C61\u7684\u7EE7\u627F\u7ED3\u6784\u5982\u4E0B\uFF1A</p>\n<ul>\n<li><p><strong>\u4F1A\u8BDD</strong> - \u6BCF\u4E2A\u4F1A\u8BDD\u90FD\u662F\u4E00\u4E2A\u72EC\u7ACB\u7684\u5DE5\u4F5C\u533A\uFF0C\u5176\u4E2D\u5305\u542B\u4E00\u4E2A\u6216\u591A\u4E2A\u7A97\u53E3</p>\n<ul>\n<li><code>tmux</code> \u5F00\u59CB\u4E00\u4E2A\u65B0\u7684\u4F1A\u8BDD</li>\n<li><code>tmux new -s NAME</code> \u4EE5\u6307\u5B9A\u540D\u79F0\u5F00\u59CB\u4E00\u4E2A\u65B0\u7684\u4F1A\u8BDD</li>\n<li><code>tmux ls</code> \u5217\u51FA\u5F53\u524D\u6240\u6709\u4F1A\u8BDD</li>\n<li>\u5728 <code>tmux</code> \u4E2D\u8F93\u5165 <code>&lt;C-b&gt; d</code> \uFF0C\u5C06\u5F53\u524D\u4F1A\u8BDD\u5206\u79BB</li>\n<li><code>tmux a</code> \u91CD\u65B0\u8FDE\u63A5\u6700\u540E\u4E00\u4E2A\u4F1A\u8BDD\u3002\u60A8\u4E5F\u53EF\u4EE5\u901A\u8FC7 <code>-t</code> \u6765\u6307\u5B9A\u5177\u4F53\u7684\u4F1A\u8BDD</li>\n</ul>\n</li>\n<li><p><strong>\u7A97\u53E3</strong> - \u76F8\u5F53\u4E8E\u7F16\u8F91\u5668\u6216\u662F\u6D4F\u89C8\u5668\u4E2D\u7684\u6807\u7B7E\u9875\uFF0C\u4ECE\u89C6\u89C9\u4E0A\u5C06\u4E00\u4E2A\u4F1A\u8BDD\u5206\u5272\u4E3A\u591A\u4E2A\u90E8\u5206</p>\n<ul>\n<li><code>&lt;C-b&gt; c</code> \u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u7A97\u53E3\uFF0C\u4F7F\u7528 <code>&lt;C-d&gt;</code> \u5173\u95ED</li>\n<li><code>&lt;C-b&gt; N</code> \u8DF3\u8F6C\u5230\u7B2C <em>N</em> \u4E2A\u7A97\u53E3\uFF0C\u6CE8\u610F\u6BCF\u4E2A\u7A97\u53E3\u90FD\u662F\u6709\u7F16\u53F7\u7684</li>\n<li><code>&lt;C-b&gt; p</code> \u5207\u6362\u5230\u524D\u4E00\u4E2A\u7A97\u53E3</li>\n<li><code>&lt;C-b&gt; n</code> \u5207\u6362\u5230\u4E0B\u4E00\u4E2A\u7A97\u53E3</li>\n<li><code>&lt;C-b&gt; ,</code> \u91CD\u547D\u540D\u5F53\u524D\u7A97\u53E3</li>\n<li><code>&lt;C-b&gt; w</code> \u5217\u51FA\u5F53\u524D\u6240\u6709\u7A97\u53E3</li>\n</ul>\n</li>\n<li><p><strong>\u9762\u677F</strong> - \u50CF vim \u4E2D\u7684\u5206\u5C4F\u4E00\u6837\uFF0C\u9762\u677F\u4F7F\u6211\u4EEC\u53EF\u4EE5\u5728\u4E00\u4E2A\u5C4F\u5E55\u91CC\u663E\u793A\u591A\u4E2A shell</p>\n<ul>\n<li><code>&lt;C-b&gt; &quot;</code> \u6C34\u5E73\u5206\u5272</li>\n<li><code>&lt;C-b&gt; %</code> \u5782\u76F4\u5206\u5272</li>\n<li><code>&lt;C-b&gt; &lt;\u65B9\u5411&gt;</code> \u5207\u6362\u5230\u6307\u5B9A\u65B9\u5411\u7684\u9762\u677F\uFF0C&lt;\u65B9\u5411&gt; \u6307\u7684\u662F\u952E\u76D8\u4E0A\u7684\u65B9\u5411\u952E</li>\n<li><code>&lt;C-b&gt; z</code> \u5207\u6362\u5F53\u524D\u9762\u677F\u7684\u7F29\u653E</li>\n<li><code>&lt;C-b&gt; [</code> \u5F00\u59CB\u5F80\u56DE\u5377\u52A8\u5C4F\u5E55\u3002\u60A8\u53EF\u4EE5\u6309\u4E0B\u7A7A\u683C\u952E\u6765\u5F00\u59CB\u9009\u62E9\uFF0C\u56DE\u8F66\u952E\u590D\u5236\u9009\u4E2D\u7684\u90E8\u5206</li>\n<li><code>&lt;C-b&gt; &lt;\u7A7A\u683C&gt;</code> \u5728\u4E0D\u540C\u7684\u9762\u677F\u6392\u5E03\u95F4\u5207\u6362</li>\n</ul>\n</li>\n</ul>\n<h1>\u522B\u540D</h1>\n<p>\u8F93\u5165\u4E00\u957F\u4E32\u5305\u542B\u8BB8\u591A\u9009\u9879\u7684\u547D\u4EE4\u4F1A\u975E\u5E38\u9EBB\u70E6\u3002\u56E0\u6B64\uFF0C\u5927\u591A\u6570 shell \u90FD\u652F\u6301\u8BBE\u7F6E\u522B\u540D\u3002shell \u7684\u522B\u540D\u76F8\u5F53\u4E8E\u4E00\u4E2A\u957F\u547D\u4EE4\u7684\u7F29\u5199\uFF0Cshell \u4F1A\u81EA\u52A8\u5C06\u5176\u66FF\u6362\u6210\u539F\u672C\u7684\u547D\u4EE4\u3002\u4F8B\u5982\uFF0Cbash \u4E2D\u7684\u522B\u540D\u8BED\u6CD5\u5982\u4E0B\uFF1A</p>\n<pre><code class="language-bash">alias alias_name=&quot;command_to_alias arg1 arg2&quot;\n</code></pre>\n<p>\u6CE8\u610F\uFF0C <code>=</code> \u4E24\u8FB9\u662F\u6CA1\u6709\u7A7A\u683C\u7684\uFF0C\u56E0\u4E3A <a href="https://www.runoob.com/linux/linux-comm-alias.html"><code>alias</code></a> \u662F\u4E00\u4E2A shell \u547D\u4EE4\uFF0C\u5B83\u53EA\u63A5\u53D7\u4E00\u4E2A\u53C2\u6570\u3002</p>\n<p>\u522B\u540D\u6709\u8BB8\u591A\u5F88\u65B9\u4FBF\u7684\u7279\u6027:</p>\n<pre><code class="language-bash"># \u521B\u5EFA\u5E38\u7528\u547D\u4EE4\u7684\u7F29\u5199\nalias ll=&quot;ls -lh&quot;\n\n# \u80FD\u591F\u5C11\u8F93\u5165\u5F88\u591A\nalias gs=&quot;git status&quot;\nalias gc=&quot;git commit&quot;\nalias v=&quot;vim&quot;\n\n# \u624B\u8BEF\u6253\u9519\u547D\u4EE4\u4E5F\u6CA1\u5173\u7CFB\nalias sl=ls\n\n# \u91CD\u65B0\u5B9A\u4E49\u4E00\u4E9B\u547D\u4EE4\u884C\u7684\u9ED8\u8BA4\u884C\u4E3A\nalias mv=&quot;mv -i&quot;           # -i prompts before overwrite\nalias mkdir=&quot;mkdir -p&quot;     # -p make parent dirs as needed\nalias df=&quot;df -h&quot;           # -h prints human readable format\n\n# \u522B\u540D\u53EF\u4EE5\u7EC4\u5408\u4F7F\u7528\nalias la=&quot;ls -A&quot;\nalias lla=&quot;la -l&quot;\n\n# \u5728\u5FFD\u7565\u67D0\u4E2A\u522B\u540D\n\\ls\n# \u6216\u8005\u7981\u7528\u522B\u540D\nunalias la\n\n# \u83B7\u53D6\u522B\u540D\u7684\u5B9A\u4E49\nalias ll\n# \u4F1A\u6253\u5370 ll=&#39;ls -lh&#39;\n</code></pre>\n<p>\u503C\u5F97\u6CE8\u610F\u7684\u662F\uFF0C\u5728\u9ED8\u8BA4\u60C5\u51B5\u4E0B shell \u5E76\u4E0D\u4F1A\u4FDD\u5B58\u522B\u540D\u3002\u4E3A\u4E86\u8BA9\u522B\u540D\u6301\u7EED\u751F\u6548\uFF0C\u60A8\u9700\u8981\u5C06\u914D\u7F6E\u653E\u8FDB shell \u7684\u542F\u52A8\u6587\u4EF6\u91CC\uFF0C\u50CF\u662F <code>.bashrc</code> \u6216 <code>.zshrc</code>\uFF0C\u4E0B\u4E00\u8282\u6211\u4EEC\u5C31\u4F1A\u8BB2\u5230\u3002</p>\n<h1>\u914D\u7F6E\u6587\u4EF6\uFF08Dotfiles\uFF09</h1>\n<p>\u5F88\u591A\u7A0B\u5E8F\u7684\u914D\u7F6E\u90FD\u662F\u901A\u8FC7\u7EAF\u6587\u672C\u683C\u5F0F\u7684\u88AB\u79F0\u4F5C <em>\u70B9\u6587\u4EF6</em> \u7684\u914D\u7F6E\u6587\u4EF6\u6765\u5B8C\u6210\u7684\uFF08\u4E4B\u6240\u4EE5\u79F0\u4E3A\u70B9\u6587\u4EF6\uFF0C\u662F\u56E0\u4E3A\u5B83\u4EEC\u7684\u6587\u4EF6\u540D\u4EE5 <code>.</code> \u5F00\u5934\uFF0C\u4F8B\u5982 <code>~/.vimrc</code>\u3002\u4E5F\u6B63\u56E0\u4E3A\u6B64\uFF0C\u5B83\u4EEC\u9ED8\u8BA4\u662F\u9690\u85CF\u6587\u4EF6\uFF0C<code>ls</code> \u5E76\u4E0D\u4F1A\u663E\u793A\u5B83\u4EEC\uFF09\u3002</p>\n<p>shell \u7684\u914D\u7F6E\u4E5F\u662F\u901A\u8FC7\u8FD9\u7C7B\u6587\u4EF6\u5B8C\u6210\u7684\u3002\u5728\u542F\u52A8\u65F6\uFF0C\u60A8\u7684 shell \u7A0B\u5E8F\u4F1A\u8BFB\u53D6\u5F88\u591A\u6587\u4EF6\u4EE5\u52A0\u8F7D\u5176\u914D\u7F6E\u9879\u3002\u6839\u636E shell \u672C\u8EAB\u7684\u4E0D\u540C\uFF0C\u60A8\u4ECE\u767B\u5F55\u5F00\u59CB\u8FD8\u662F\u4EE5\u4EA4\u4E92\u7684\u65B9\u5F0F\u5B8C\u6210\u8FD9\u4E00\u8FC7\u7A0B\u53EF\u80FD\u4F1A\u6709\u5F88\u5927\u7684\u4E0D\u540C\u3002\u5173\u4E8E\u8FD9\u4E00\u8BDD\u9898\uFF0C<a href="https://blog.flowblok.id.au/2013-02/shell-startup-scripts.html">\u8FD9\u91CC</a> \u6709\u975E\u5E38\u597D\u7684\u8D44\u6E90</p>\n<p>\u5BF9\u4E8E <code>bash</code> \u6765\u8BF4\uFF0C\u5728\u5927\u591A\u6570\u7CFB\u7EDF\u4E0B\uFF0C\u60A8\u53EF\u4EE5\u901A\u8FC7\u7F16\u8F91 <code>.bashrc</code> \u6216 <code>.bash_profile</code> \u6765\u8FDB\u884C\u914D\u7F6E\u3002\u5728\u6587\u4EF6\u4E2D\u60A8\u53EF\u4EE5\u6DFB\u52A0\u9700\u8981\u5728\u542F\u52A8\u65F6\u6267\u884C\u7684\u547D\u4EE4\uFF0C\u4F8B\u5982\u4E0A\u6587\u6211\u4EEC\u8BB2\u5230\u8FC7\u7684\u522B\u540D\uFF0C\u6216\u8005\u662F\u60A8\u7684\u73AF\u5883\u53D8\u91CF\u3002</p>\n<p>\u5B9E\u9645\u4E0A\uFF0C\u5F88\u591A\u7A0B\u5E8F\u90FD\u8981\u6C42\u60A8\u5728 shell \u7684\u914D\u7F6E\u6587\u4EF6\u4E2D\u5305\u542B\u4E00\u884C\u7C7B\u4F3C <code>export PATH=&quot;$PATH:/path/to/program/bin&quot;</code> \u7684\u547D\u4EE4\uFF0C\u8FD9\u6837\u624D\u80FD\u786E\u4FDD\u8FD9\u4E9B\u7A0B\u5E8F\u80FD\u591F\u88AB shell \u627E\u5230\u3002</p>\n<p>\u8FD8\u6709\u4E00\u4E9B\u5176\u4ED6\u7684\u5DE5\u5177\u4E5F\u53EF\u4EE5\u901A\u8FC7 <em>\u70B9\u6587\u4EF6</em> \u8FDB\u884C\u914D\u7F6E\uFF1A</p>\n<ul>\n<li><code>bash</code> - <code>~/.bashrc</code>, <code>~/.bash_profile</code></li>\n<li><code>git</code> - <code>~/.gitconfig</code></li>\n<li><code>vim</code> - <code>~/.vimrc</code> \u548C <code>~/.vim</code> \u76EE\u5F55</li>\n<li><code>ssh</code> - <code>~/.ssh/config</code></li>\n<li><code>tmux</code> - <code>~/.tmux.conf</code></li>\n</ul>\n<p>\u6211\u4EEC\u5E94\u8BE5\u5982\u4F55\u7BA1\u7406\u8FD9\u4E9B\u914D\u7F6E\u6587\u4EF6\u5462\uFF0C\u5B83\u4EEC\u5E94\u8BE5\u5728\u5B83\u4EEC\u7684\u6587\u4EF6\u5939\u4E0B\uFF0C\u5E76\u4F7F\u7528\u7248\u672C\u63A7\u5236\u7CFB\u7EDF\u8FDB\u884C\u7BA1\u7406\uFF0C\u7136\u540E\u901A\u8FC7\u811A\u672C\u5C06\u5176 <strong>\u7B26\u53F7\u94FE\u63A5</strong> \u5230\u9700\u8981\u7684\u5730\u65B9\u3002\u8FD9\u4E48\u505A\u6709\u5982\u4E0B\u597D\u5904\uFF1A</p>\n<ul>\n<li><strong>\u5B89\u88C5\u7B80\u5355</strong>: \u5982\u679C\u60A8\u767B\u5F55\u4E86\u4E00\u53F0\u65B0\u7684\u8BBE\u5907\uFF0C\u5728\u8FD9\u53F0\u8BBE\u5907\u4E0A\u5E94\u7528\u60A8\u7684\u914D\u7F6E\u53EA\u9700\u8981\u51E0\u5206\u949F\u7684\u65F6\u95F4\uFF1B</li>\n<li><strong>\u53EF\u79FB\u690D\u6027</strong>: \u60A8\u7684\u5DE5\u5177\u5728\u4EFB\u4F55\u5730\u65B9\u90FD\u4EE5\u76F8\u540C\u7684\u914D\u7F6E\u5DE5\u4F5C</li>\n<li><strong>\u540C\u6B65</strong>: \u5728\u4E00\u5904\u66F4\u65B0\u914D\u7F6E\u6587\u4EF6\uFF0C\u53EF\u4EE5\u540C\u6B65\u5230\u5176\u4ED6\u6240\u6709\u5730\u65B9</li>\n<li><strong>\u53D8\u66F4\u8FFD\u8E2A</strong>: \u60A8\u53EF\u80FD\u8981\u5728\u6574\u4E2A\u7A0B\u5E8F\u5458\u751F\u6DAF\u4E2D\u6301\u7EED\u7EF4\u62A4\u8FD9\u4E9B\u914D\u7F6E\u6587\u4EF6\uFF0C\u800C\u5BF9\u4E8E\u957F\u671F\u9879\u76EE\u800C\u8A00\uFF0C\u7248\u672C\u5386\u53F2\u662F\u975E\u5E38\u91CD\u8981\u7684</li>\n</ul>\n<p>\u914D\u7F6E\u6587\u4EF6\u4E2D\u9700\u8981\u653E\u4E9B\u4EC0\u4E48\uFF1F\u60A8\u53EF\u4EE5\u901A\u8FC7\u5728\u7EBF\u6587\u6863\u548C\u5E2E\u52A9\u624B\u518C\u4E86\u89E3\u6240\u4F7F\u7528\u5DE5\u5177\u7684\u8BBE\u7F6E\u9879\u3002\u53E6\u4E00\u4E2A\u65B9\u6CD5\u662F\u5728\u7F51\u4E0A\u641C\u7D22\u6709\u5173\u7279\u5B9A\u7A0B\u5E8F\u7684\u6587\u7AE0\uFF0C\u4F5C\u8005\u4EEC\u5728\u6587\u7AE0\u4E2D\u4F1A\u5206\u4EAB\u4ED6\u4EEC\u7684\u914D\u7F6E\u3002\u8FD8\u6709\u4E00\u79CD\u65B9\u6CD5\u5C31\u662F\u76F4\u63A5\u6D4F\u89C8\u5176\u4ED6\u4EBA\u7684\u914D\u7F6E\u6587\u4EF6\uFF1A\u60A8\u53EF\u4EE5\u5728\u8FD9\u91CC\u627E\u5230\u65E0\u6570\u7684 <a href="https://github.com/search?o=desc&q=dotfiles&s=stars&type=Repositories">dotfiles \u4ED3\u5E93</a>\u3002</p>\n<h2>\u53EF\u79FB\u690D\u6027</h2>\n<p>\u914D\u7F6E\u6587\u4EF6\u7684\u4E00\u4E2A\u5E38\u89C1\u7684\u75DB\u70B9\u662F\u5B83\u53EF\u80FD\u5E76\u4E0D\u80FD\u5728\u591A\u79CD\u8BBE\u5907\u4E0A\u751F\u6548\u3002\u4F8B\u5982\uFF0C\u5982\u679C\u60A8\u5728\u4E0D\u540C\u8BBE\u5907\u4E0A\u4F7F\u7528\u7684\u64CD\u4F5C\u7CFB\u7EDF\u6216\u8005 shell \u662F\u4E0D\u540C\u7684\uFF0C\u5219\u914D\u7F6E\u6587\u4EF6\u662F\u65E0\u6CD5\u751F\u6548\u7684\u3002\u6216\u8005\uFF0C\u6709\u65F6\u60A8\u4EC5\u5E0C\u671B\u7279\u5B9A\u7684\u914D\u7F6E\u53EA\u5728\u67D0\u4E9B\u8BBE\u5907\u4E0A\u751F\u6548\u3002</p>\n<p>\u6709\u4E00\u4E9B\u6280\u5DE7\u53EF\u4EE5\u8F7B\u677E\u8FBE\u6210\u8FD9\u4E9B\u76EE\u7684\u3002\u5982\u679C\u914D\u7F6E\u6587\u4EF6 if \u8BED\u53E5\uFF0C\u5219\u60A8\u53EF\u4EE5\u501F\u52A9\u5B83\u9488\u5BF9\u4E0D\u540C\u7684\u8BBE\u5907\u7F16\u5199\u4E0D\u540C\u7684\u914D\u7F6E\u3002\u4F8B\u5982\uFF0C\u60A8\u7684 shell \u53EF\u4EE5\u8FD9\u6837\u505A\uFF1A</p>\n<pre><code class="language-bash">if [[ &quot;$(uname)&quot; == &quot;Linux&quot; ]]; then {do_something}; fi\n\n# \u4F7F\u7528\u548C shell \u76F8\u5173\u7684\u914D\u7F6E\u65F6\u5148\u68C0\u67E5\u5F53\u524D shell \u7C7B\u578B\nif [[ &quot;$SHELL&quot; == &quot;zsh&quot; ]]; then {do_something}; fi\n\n# \u60A8\u4E5F\u53EF\u4EE5\u9488\u5BF9\u7279\u5B9A\u7684\u8BBE\u5907\u8FDB\u884C\u914D\u7F6E\nif [[ &quot;$(hostname)&quot; == &quot;myServer&quot; ]]; then {do_something}; fi\n</code></pre>\n<p>\u5982\u679C\u914D\u7F6E\u6587\u4EF6\u652F\u6301 include \u529F\u80FD\uFF0C\u60A8\u4E5F\u53EF\u4EE5\u591A\u52A0\u5229\u7528\u3002\u4F8B\u5982\uFF1A<code>~/.gitconfig</code> \u53EF\u4EE5\u8FD9\u6837\u7F16\u5199\uFF1A</p>\n<pre><code>[include]\n    path = ~/.gitconfig_local\n</code></pre>\n<p>\u7136\u540E\u6211\u4EEC\u53EF\u4EE5\u5728\u65E5\u5E38\u4F7F\u7528\u7684\u8BBE\u5907\u4E0A\u521B\u5EFA\u914D\u7F6E\u6587\u4EF6 <code>~/.gitconfig_local</code> \u6765\u5305\u542B\u4E0E\u8BE5\u8BBE\u5907\u76F8\u5173\u7684\u7279\u5B9A\u914D\u7F6E\u3002\u60A8\u751A\u81F3\u5E94\u8BE5\u521B\u5EFA\u4E00\u4E2A\u5355\u72EC\u7684\u4EE3\u7801\u4ED3\u5E93\u6765\u7BA1\u7406\u8FD9\u4E9B\u4E0E\u8BBE\u5907\u76F8\u5173\u7684\u914D\u7F6E\u3002</p>\n<p>\u5982\u679C\u60A8\u5E0C\u671B\u5728\u4E0D\u540C\u7684\u7A0B\u5E8F\u4E4B\u95F4\u5171\u4EAB\u67D0\u4E9B\u914D\u7F6E\uFF0C\u8BE5\u65B9\u6CD5\u4E5F\u9002\u7528\u3002\u4F8B\u5982\uFF0C\u5982\u679C\u60A8\u60F3\u8981\u5728 <code>bash</code> \u548C <code>zsh</code> \u4E2D\u540C\u65F6\u542F\u7528\u4E00\u4E9B\u522B\u540D\uFF0C\u60A8\u53EF\u4EE5\u628A\u5B83\u4EEC\u5199\u5728 <code>.aliases</code> \u91CC\uFF0C\u7136\u540E\u5728\u8FD9\u4E24\u4E2A shell \u91CC\u5E94\u7528\uFF1A</p>\n<pre><code class="language-bash"># Test if ~/.aliases exists and source it\nif [ -f ~/.aliases ]; then\n    source ~/.aliases\nfi\n</code></pre>\n<h1>\u8FDC\u7AEF\u8BBE\u5907</h1>\n<p>\u5BF9\u4E8E\u7A0B\u5E8F\u5458\u6765\u8BF4\uFF0C\u5728\u4ED6\u4EEC\u7684\u65E5\u5E38\u5DE5\u4F5C\u4E2D\u4F7F\u7528\u8FDC\u7A0B\u670D\u52A1\u5668\u5DF2\u7ECF\u975E\u5E38\u666E\u904D\u4E86\u3002\u5982\u679C\u60A8\u9700\u8981\u4F7F\u7528\u8FDC\u7A0B\u670D\u52A1\u5668\u6765\u90E8\u7F72\u540E\u7AEF\u8F6F\u4EF6\u6216\u60A8\u9700\u8981\u4E00\u4E9B\u8BA1\u7B97\u80FD\u529B\u5F3A\u5927\u7684\u670D\u52A1\u5668\uFF0C\u60A8\u5C31\u4F1A\u7528\u5230\u5B89\u5168 shell\uFF08SSH\uFF09\u3002\u548C\u5176\u4ED6\u5DE5\u5177\u4E00\u6837\uFF0CSSH \u4E5F\u662F\u53EF\u4EE5\u9AD8\u5EA6\u5B9A\u5236\u7684\uFF0C\u4E5F\u503C\u5F97\u6211\u4EEC\u82B1\u65F6\u95F4\u5B66\u4E60\u5B83\u3002</p>\n<p>\u901A\u8FC7\u5982\u4E0B\u547D\u4EE4\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528 <code>ssh</code> \u8FDE\u63A5\u5230\u5176\u4ED6\u670D\u52A1\u5668\uFF1A</p>\n<pre><code class="language-bash">ssh foo@bar.mit.edu\n</code></pre>\n<p>\u8FD9\u91CC\u6211\u4EEC\u5C1D\u8BD5\u4EE5\u7528\u6237\u540D <code>foo</code> \u767B\u5F55\u670D\u52A1\u5668 <code>bar.mit.edu</code>\u3002\u670D\u52A1\u5668\u53EF\u4EE5\u901A\u8FC7 URL \u6307\u5B9A\uFF08\u4F8B\u5982 <code>bar.mit.edu</code>\uFF09\uFF0C\u4E5F\u53EF\u4EE5\u4F7F\u7528 IP \u6307\u5B9A\uFF08\u4F8B\u5982 <code>foobar@192.168.1.42</code>\uFF09\u3002\u540E\u9762\u6211\u4EEC\u4F1A\u4ECB\u7ECD\u5982\u4F55\u4FEE\u6539 ssh \u914D\u7F6E\u6587\u4EF6\u4F7F\u6211\u4EEC\u53EF\u4EE5\u7528\u7C7B\u4F3C <code>ssh bar</code> \u8FD9\u6837\u7684\u547D\u4EE4\u6765\u767B\u5F55\u670D\u52A1\u5668\u3002</p>\n<h2>\u6267\u884C\u547D\u4EE4</h2>\n<p><code>ssh</code> \u7684\u4E00\u4E2A\u7ECF\u5E38\u88AB\u5FFD\u89C6\u7684\u7279\u6027\u662F\u5B83\u53EF\u4EE5\u76F4\u63A5\u8FDC\u7A0B\u6267\u884C\u547D\u4EE4\u3002\n<code>ssh foobar@server ls</code> \u53EF\u4EE5\u76F4\u63A5\u5728\u7528 foobar \u7684\u547D\u4EE4\u4E0B\u6267\u884C <code>ls</code> \u547D\u4EE4\u3002\n\u60F3\u8981\u914D\u5408\u7BA1\u9053\u6765\u4F7F\u7528\u4E5F\u53EF\u4EE5\uFF0C <code>ssh foobar@server ls | grep PATTERN</code> \u4F1A\u5728\u672C\u5730\u67E5\u8BE2\u8FDC\u7AEF <code>ls</code> \u7684\u8F93\u51FA\u800C <code>ls | ssh foobar@server grep PATTERN</code> \u4F1A\u5728\u8FDC\u7AEF\u5BF9\u672C\u5730 <code>ls</code> \u8F93\u51FA\u7684\u7ED3\u679C\u8FDB\u884C\u67E5\u8BE2\u3002</p>\n<h2>SSH \u5BC6\u94A5</h2>\n<p>\u57FA\u4E8E\u5BC6\u94A5\u7684\u9A8C\u8BC1\u673A\u5236\u4F7F\u7528\u4E86\u5BC6\u7801\u5B66\u4E2D\u7684\u516C\u94A5\uFF0C\u6211\u4EEC\u53EA\u9700\u8981\u5411\u670D\u52A1\u5668\u8BC1\u660E\u5BA2\u6237\u7AEF\u6301\u6709\u5BF9\u5E94\u7684\u79C1\u94A5\uFF0C\u800C\u4E0D\u9700\u8981\u516C\u5F00\u5176\u79C1\u94A5\u3002\u8FD9\u6837\u60A8\u5C31\u53EF\u4EE5\u907F\u514D\u6BCF\u6B21\u767B\u5F55\u90FD\u8F93\u5165\u5BC6\u7801\u7684\u9EBB\u70E6\u4E86\u79D8\u5BC6\u5C31\u53EF\u4EE5\u767B\u5F55\u3002\u4E0D\u8FC7\uFF0C\u79C1\u94A5(\u901A\u5E38\u662F <code>~/.ssh/id_rsa</code> \u6216\u8005 <code>~/.ssh/id_ed25519</code>) \u7B49\u6548\u4E8E\u60A8\u7684\u5BC6\u7801\uFF0C\u6240\u4EE5\u4E00\u5B9A\u8981\u597D\u597D\u4FDD\u5B58\u5B83\u3002</p>\n<h3>\u5BC6\u94A5\u751F\u6210</h3>\n<p>\u4F7F\u7528 <a href="https://www.runoob.com/python3/linux-comm-ssh.html"><code>ssh-keygen</code></a> \u547D\u4EE4\u53EF\u4EE5\u751F\u6210\u4E00\u5BF9\u5BC6\u94A5\uFF1A</p>\n<pre><code class="language-bash">ssh-keygen -o -a 100 -t ed25519 -f ~/.ssh/id_ed25519\n</code></pre>\n<p>\u60A8\u53EF\u4EE5\u4E3A\u5BC6\u94A5\u8BBE\u7F6E\u5BC6\u7801\uFF0C\u9632\u6B62\u6709\u4EBA\u6301\u6709\u60A8\u7684\u79C1\u94A5\u5E76\u4F7F\u7528\u5B83\u8BBF\u95EE\u60A8\u7684\u670D\u52A1\u5668\u3002\u60A8\u53EF\u4EE5\u4F7F\u7528 <code>ssh-agent</code>\u6216 <code>gpg-agent</code>\uFF0C\u8FD9\u6837\u5C31\u4E0D\u9700\u8981\u6BCF\u6B21\u90FD\u8F93\u5165\u8BE5\u5BC6\u7801\u4E86\u3002</p>\n<p>\u5982\u679C\u60A8\u66FE\u7ECF\u914D\u7F6E\u8FC7\u4F7F\u7528 SSH \u5BC6\u94A5\u63A8\u9001\u5230 GitHub(\u8FD9\u90E8\u5206\u5728Git\u6559\u7A0B\u4E2D\u6709\u4ECB\u7ECD)\uFF0C\u5E76\u4E14\u5DF2\u7ECF\u6709\u4E86\u4E00\u4E2A\u53EF\u7528\u7684\u5BC6\u94A5\u5BF9\u3002\u8981\u68C0\u67E5\u60A8\u662F\u5426\u6301\u6709\u5BC6\u7801\u5E76\u9A8C\u8BC1\u5B83\uFF0C\u60A8\u53EF\u4EE5\u8FD0\u884C <code>ssh-keygen -y -f /path/to/key</code>.</p>\n<h3>\u57FA\u4E8E\u5BC6\u94A5\u7684\u8BA4\u8BC1\u673A\u5236</h3>\n<p><code>ssh</code> \u4F1A\u67E5\u8BE2 <code>.ssh/authorized_keys</code> \u6765\u786E\u8BA4\u90A3\u4E9B\u7528\u6237\u53EF\u4EE5\u88AB\u5141\u8BB8\u767B\u5F55\u3002\u60A8\u53EF\u4EE5\u901A\u8FC7\u4E0B\u9762\u7684\u547D\u4EE4\u5C06\u4E00\u4E2A\u516C\u94A5\u62F7\u8D1D\u5230\u8FD9\u91CC\uFF1A</p>\n<pre><code class="language-bash">cat .ssh/id_ed25519.pub | ssh foobar@remote &#39;cat &gt;&gt; ~/.ssh/authorized_keys&#39;\n</code></pre>\n<p>\u5982\u679C\u652F\u6301 <code>ssh-copy-id</code> \u7684\u8BDD\uFF0C\u53EF\u4EE5\u4F7F\u7528\u4E0B\u9762\u8FD9\u79CD\u66F4\u7B80\u5355\u7684\u89E3\u51B3\u65B9\u6848\uFF1A</p>\n<pre><code class="language-bash">ssh-copy-id -i .ssh/id_ed25519.pub foobar@remote\n</code></pre>\n<h2>\u901A\u8FC7 SSH \u590D\u5236\u6587\u4EF6</h2>\n<p>\u4F7F\u7528 ssh \u590D\u5236\u6587\u4EF6\u6709\u5F88\u591A\u65B9\u6CD5\uFF1A</p>\n<ul>\n<li><code>ssh+tee</code>, \u6700\u7B80\u5355\u7684\u65B9\u6CD5\u662F\u6267\u884C <code>ssh</code> \u547D\u4EE4\uFF0C\u7136\u540E\u901A\u8FC7\u8FD9\u6837\u7684\u65B9\u6CD5\u5229\u7528\u6807\u51C6\u8F93\u5165\u5B9E\u73B0 <code>cat localfile | ssh remote_server tee serverfile</code>\u3002\u56DE\u5FC6\u4E00\u4E0B\uFF0C<a href="https://www.runoob.com/linux/linux-comm-tee.html"><code>tee</code></a> \u547D\u4EE4\u4F1A\u5C06\u6807\u51C6\u8F93\u51FA\u5199\u5165\u5230\u4E00\u4E2A\u6587\u4EF6\uFF1B</li>\n<li><a href="https://www.runoob.com/linux/linux-comm-scp.html"><code>scp</code></a> \uFF1A\u5F53\u9700\u8981\u62F7\u8D1D\u5927\u91CF\u7684\u6587\u4EF6\u6216\u76EE\u5F55\u65F6\uFF0C\u4F7F\u7528 <code>scp</code> \u547D\u4EE4\u5219\u66F4\u52A0\u65B9\u4FBF\uFF0C\u56E0\u4E3A\u5B83\u53EF\u4EE5\u65B9\u4FBF\u7684\u904D\u5386\u76F8\u5173\u8DEF\u5F84\u3002\u8BED\u6CD5\u5982\u4E0B\uFF1A<code>scp path/to/local_file remote_host:path/to/remote_file</code>\uFF1B</li>\n<li><a href="https://www.runoob.com/linux/linux-comm-rsync.html"><code>rsync</code></a> \u5BF9 <code>scp</code> \u8FDB\u884C\u4E86\u6539\u8FDB\uFF0C\u5B83\u53EF\u4EE5\u68C0\u6D4B\u672C\u5730\u548C\u8FDC\u7AEF\u7684\u6587\u4EF6\u4EE5\u9632\u6B62\u91CD\u590D\u62F7\u8D1D\u3002\u5B83\u8FD8\u53EF\u4EE5\u63D0\u4F9B\u4E00\u4E9B\u8BF8\u5982\u7B26\u53F7\u8FDE\u63A5\u3001\u6743\u9650\u7BA1\u7406\u7B49\u7CBE\u5FC3\u6253\u78E8\u7684\u529F\u80FD\u3002\u751A\u81F3\u8FD8\u53EF\u4EE5\u57FA\u4E8E <code>--partial</code> \u6807\u8BB0\u5B9E\u73B0\u65AD\u70B9\u7EED\u4F20\u3002<code>rsync</code> \u7684\u8BED\u6CD5\u548C <code>scp</code> \u7C7B\u4F3C\uFF1B</li>\n</ul>\n<h2>\u7AEF\u53E3\u8F6C\u53D1</h2>\n<p>\u5F88\u591A\u60C5\u51B5\u4E0B\u6211\u4EEC\u90FD\u4F1A\u9047\u5230\u8F6F\u4EF6\u9700\u8981\u76D1\u542C\u7279\u5B9A\u8BBE\u5907\u7684\u7AEF\u53E3\u3002\u5982\u679C\u662F\u5728\u60A8\u7684\u672C\u673A\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>localhost:PORT</code> \u6216 <code>127.0.0.1:PORT</code>\u3002\u4F46\u662F\u5982\u679C\u9700\u8981\u76D1\u542C\u8FDC\u7A0B\u670D\u52A1\u5668\u7684\u7AEF\u53E3\u8BE5\u5982\u4F55\u64CD\u4F5C\u5462\uFF1F\u8FD9\u79CD\u60C5\u51B5\u4E0B\u8FDC\u7AEF\u7684\u7AEF\u53E3\u5E76\u4E0D\u4F1A\u76F4\u63A5\u901A\u8FC7\u7F51\u7EDC\u66B4\u9732\u7ED9\u60A8\u3002</p>\n<p>\u6B64\u65F6\u5C31\u9700\u8981\u8FDB\u884C <em>\u7AEF\u53E3\u8F6C\u53D1</em>\u3002\u7AEF\u53E3\u8F6C\u53D1\u6709\u4E24\u79CD\uFF0C\u4E00\u79CD\u662F\u672C\u5730\u7AEF\u53E3\u8F6C\u53D1\u548C\u8FDC\u7A0B\u7AEF\u53E3\u8F6C\u53D1\uFF08\u53C2\u89C1\u4E0B\u56FE\uFF09\u3002</p>\n<p><strong>\u672C\u5730\u7AEF\u53E3\u8F6C\u53D1</strong>\n<img src="/image/a28N8.png" alt="Local Port Forwarding"></p>\n<p><strong>\u8FDC\u7A0B\u7AEF\u53E3\u8F6C\u53D1</strong>\n<img src="/image/4iK3b.png" alt="Remote Port Forwarding"></p>\n<p>\u5E38\u89C1\u7684\u60C5\u666F\u662F\u4F7F\u7528\u672C\u5730\u7AEF\u53E3\u8F6C\u53D1\uFF0C\u5373\u8FDC\u7AEF\u8BBE\u5907\u4E0A\u7684\u670D\u52A1\u76D1\u542C\u4E00\u4E2A\u7AEF\u53E3\uFF0C\u800C\u60A8\u5E0C\u671B\u5728\u672C\u5730\u8BBE\u5907\u4E0A\u7684\u4E00\u4E2A\u7AEF\u53E3\u5EFA\u7ACB\u8FDE\u63A5\u5E76\u8F6C\u53D1\u5230\u8FDC\u7A0B\u7AEF\u53E3\u4E0A\u3002\u4F8B\u5982\uFF0C\u6211\u4EEC\u5728\u8FDC\u7AEF\u670D\u52A1\u5668\u4E0A\u8FD0\u884C Jupyter notebook \u5E76\u76D1\u542C <code>8888</code> \u7AEF\u53E3\u3002 \u7136\u540E\uFF0C\u5EFA\u7ACB\u4ECE\u672C\u5730\u7AEF\u53E3 <code>9999</code> \u7684\u8F6C\u53D1\uFF0C\u4F7F\u7528 <code>ssh -L 9999:localhost:8888 foobar@remote_server</code> \u3002\u8FD9\u6837\u53EA\u9700\u8981\u8BBF\u95EE\u672C\u5730\u7684 <code>localhost:9999</code> \u5373\u53EF\u3002</p>\n<h2>SSH \u914D\u7F6E</h2>\n<p>\u6211\u4EEC\u5DF2\u7ECF\u4ECB\u7ECD\u4E86\u5F88\u591A\u53C2\u6570\u3002\u4E3A\u5B83\u4EEC\u521B\u5EFA\u4E00\u4E2A\u522B\u540D\u662F\u4E2A\u597D\u60F3\u6CD5\uFF0C\u6211\u4EEC\u53EF\u4EE5\u8FD9\u6837\u505A\uFF1A</p>\n<pre><code class="language-bash">alias my_server=&quot;ssh -i ~/.id_ed25519 --port 2222 -L 9999:localhost:8888 foobar@remote_server&quot;\n</code></pre>\n<p>\u4E0D\u8FC7\uFF0C\u66F4\u597D\u7684\u65B9\u6CD5\u662F\u4F7F\u7528 <code>~/.ssh/config</code>.</p>\n<pre><code class="language-bash">Host vm\n    User foobar\n    HostName 172.16.174.141\n    Port 2222\n    IdentityFile ~/.ssh/id_ed25519\n    LocalForward 9999 localhost:8888\n\n# \u5728\u914D\u7F6E\u6587\u4EF6\u4E2D\u4E5F\u53EF\u4EE5\u4F7F\u7528\u901A\u914D\u7B26\nHost *.mit.edu\n    User foobaz\n</code></pre>\n<p>\u8FD9\u4E48\u505A\u7684\u597D\u5904\u662F\uFF0C\u4F7F\u7528 <code>~/.ssh/config</code> \u6587\u4EF6\u6765\u521B\u5EFA\u522B\u540D\uFF0C\u7C7B\u4F3C <code>scp</code>\u3001<code>rsync</code> \u548C <code>mosh</code> \u7684\u8FD9\u4E9B\u547D\u4EE4\u90FD\u53EF\u4EE5\u8BFB\u53D6\u8FD9\u4E2A\u914D\u7F6E\u5E76\u5C06\u8BBE\u7F6E\u8F6C\u6362\u4E3A\u5BF9\u5E94\u7684\u547D\u4EE4\u884C\u9009\u9879\u3002</p>\n<p>\u6CE8\u610F\uFF0C<code>~/.ssh/config</code> \u6587\u4EF6\u4E5F\u53EF\u4EE5\u88AB\u5F53\u4F5C\u914D\u7F6E\u6587\u4EF6\uFF0C\u800C\u4E14\u4E00\u822C\u60C5\u51B5\u4E0B\u4E5F\u662F\u53EF\u4EE5\u88AB\u5BFC\u5165\u5176\u4ED6\u914D\u7F6E\u6587\u4EF6\u7684\u3002\u4E0D\u8FC7\uFF0C\u5982\u679C\u60A8\u5C06\u5176\u516C\u5F00\u5230\u4E92\u8054\u7F51\u4E0A\uFF0C\u90A3\u4E48\u5176\u4ED6\u4EBA\u90FD\u5C06\u4F1A\u770B\u5230\u60A8\u7684\u670D\u52A1\u5668\u5730\u5740\u3001\u7528\u6237\u540D\u3001\u5F00\u653E\u7AEF\u53E3\u7B49\u7B49\u3002\u8FD9\u4E9B\u4FE1\u606F\u53EF\u80FD\u4F1A\u5E2E\u52A9\u5230\u90A3\u4E9B\u4F01\u56FE\u653B\u51FB\u60A8\u7CFB\u7EDF\u7684\u9ED1\u5BA2\uFF0C\u6240\u4EE5\u8BF7\u52A1\u5FC5\u4E09\u601D\u3002</p>\n<p>\u670D\u52A1\u5668\u4FA7\u7684\u914D\u7F6E\u901A\u5E38\u653E\u5728 <code>/etc/ssh/sshd_config</code>\u3002\u60A8\u53EF\u4EE5\u5728\u8FD9\u91CC\u914D\u7F6E\u514D\u5BC6\u8BA4\u8BC1\u3001\u4FEE\u6539 ssh \u7AEF\u53E3\u3001\u5F00\u542F X11 \u8F6C\u53D1\u7B49\u7B49\u3002 \u60A8\u4E5F\u53EF\u4EE5\u4E3A\u6BCF\u4E2A\u7528\u6237\u5355\u72EC\u6307\u5B9A\u914D\u7F6E\u3002</p>\n<h2>\u6742\u9879</h2>\n<p>\u8FDE\u63A5\u8FDC\u7A0B\u670D\u52A1\u5668\u7684\u4E00\u4E2A\u5E38\u89C1\u75DB\u70B9\u662F\u9047\u5230\u7531\u5173\u673A\u3001\u4F11\u7720\u6216\u7F51\u7EDC\u73AF\u5883\u53D8\u5316\u5BFC\u81F4\u7684\u6389\u7EBF\u3002\u5982\u679C\u8FDE\u63A5\u7684\u5EF6\u8FDF\u5F88\u9AD8\u4E5F\u5F88\u8BA9\u4EBA\u8BA8\u538C\u3002<a href="https://mosh.org/">Mosh</a>\uFF08\u5373 mobile shell \uFF09\u5BF9 ssh \u8FDB\u884C\u4E86\u6539\u8FDB\uFF0C\u5B83\u5141\u8BB8\u8FDE\u63A5\u6F2B\u6E38\u3001\u95F4\u6B47\u8FDE\u63A5\u53CA\u667A\u80FD\u672C\u5730\u56DE\u663E\u3002</p>\n<p>\u6709\u65F6\u5C06\u4E00\u4E2A\u8FDC\u7AEF\u6587\u4EF6\u5939\u6302\u8F7D\u5230\u672C\u5730\u4F1A\u6BD4\u8F83\u65B9\u4FBF\uFF0C <a href="https://github.com/libfuse/sshfs">sshfs</a> \u53EF\u4EE5\u5C06\u8FDC\u7AEF\u670D\u52A1\u5668\u4E0A\u7684\u4E00\u4E2A\u6587\u4EF6\u5939\u6302\u8F7D\u5230\u672C\u5730\uFF0C\u7136\u540E\u60A8\u5C31\u53EF\u4EE5\u4F7F\u7528\u672C\u5730\u7684\u7F16\u8F91\u5668\u4E86\u3002</p>\n<h1>Shell &amp; \u6846\u67B6</h1>\n<p>\u5728 shell \u5DE5\u5177\u548C\u811A\u672C\u90A3\u8282\u8BFE\u4E2D\u6211\u4EEC\u5DF2\u7ECF\u4ECB\u7ECD\u4E86 <code>bash</code> shell\uFF0C\u56E0\u4E3A\u5B83\u662F\u76EE\u524D\u6700\u901A\u7528\u7684 shell\uFF0C\u5927\u591A\u6570\u7684\u7CFB\u7EDF\u90FD\u5C06\u5176\u4F5C\u4E3A\u9ED8\u8BA4 shell\u3002\u4F46\u662F\uFF0C\u5B83\u5E76\u4E0D\u662F\u552F\u4E00\u7684\u9009\u9879\u3002</p>\n<p>\u4F8B\u5982\uFF0C<code>zsh</code> shell \u662F <code>bash</code> \u7684\u8D85\u96C6\u5E76\u63D0\u4F9B\u4E86\u4E00\u4E9B\u65B9\u4FBF\u7684\u529F\u80FD\uFF1A</p>\n<ul>\n<li>\u667A\u80FD\u66FF\u6362, <code>**</code></li>\n<li>\u884C\u5185\u66FF\u6362/\u901A\u914D\u7B26\u6269\u5C55</li>\n<li>\u62FC\u5199\u7EA0\u9519</li>\n<li>\u66F4\u597D\u7684 tab \u8865\u5168\u548C\u9009\u62E9</li>\n<li>\u8DEF\u5F84\u5C55\u5F00 (<code>cd /u/lo/b</code> \u4F1A\u88AB\u5C55\u5F00\u4E3A <code>/usr/local/bin</code>)</li>\n</ul>\n<p><strong>\u6846\u67B6</strong> \u4E5F\u53EF\u4EE5\u6539\u8FDB\u60A8\u7684 shell\u3002\u6BD4\u8F83\u6D41\u884C\u7684\u901A\u7528\u6846\u67B6\u5305\u62EC <a href="https://github.com/sorin-ionescu/prezto">prezto</a> \u6216 <a href="https://ohmyz.sh/">oh-my-zsh</a>\u3002\u8FD8\u6709\u4E00\u4E9B\u66F4\u7CBE\u7B80\u7684\u6846\u67B6\uFF0C\u5B83\u4EEC\u5F80\u5F80\u4E13\u6CE8\u4E8E\u67D0\u4E00\u4E2A\u7279\u5B9A\u529F\u80FD\uFF0C\u4F8B\u5982 <a href="https://github.com/zsh-users/zsh-syntax-highlighting">zsh \u8BED\u6CD5\u9AD8\u4EAE</a> \u6216 <a href="https://github.com/zsh-users/zsh-history-substring-search">zsh \u5386\u53F2\u5B50\u4E32\u67E5\u8BE2</a>\u3002 \u50CF <a href="https://fishshell.com/">fish</a> \u8FD9\u6837\u7684 shell \u5305\u542B\u4E86\u5F88\u591A\u7528\u6237\u53CB\u597D\u7684\u529F\u80FD\uFF0C\u5176\u4E2D\u4E00\u4E9B\u7279\u6027\u5305\u62EC\uFF1A</p>\n<ul>\n<li>\u5411\u53F3\u5BF9\u9F50</li>\n<li>\u547D\u4EE4\u8BED\u6CD5\u9AD8\u4EAE</li>\n<li>\u5386\u53F2\u5B50\u4E32\u67E5\u8BE2</li>\n<li>\u57FA\u4E8E\u624B\u518C\u9875\u9762\u7684\u9009\u9879\u8865\u5168</li>\n<li>\u66F4\u667A\u80FD\u7684\u81EA\u52A8\u8865\u5168</li>\n<li>\u63D0\u793A\u7B26\u4E3B\u9898</li>\n</ul>\n<p>\u9700\u8981\u6CE8\u610F\u7684\u662F\uFF0C\u4F7F\u7528\u8FD9\u4E9B\u6846\u67B6\u53EF\u80FD\u4F1A\u964D\u4F4E\u60A8 shell \u7684\u6027\u80FD\uFF0C\u5C24\u5176\u662F\u5982\u679C\u8FD9\u4E9B\u6846\u67B6\u7684\u4EE3\u7801\u6CA1\u6709\u4F18\u5316\u6216\u8005\u4EE3\u7801\u8FC7\u591A\u3002\u60A8\u968F\u65F6\u53EF\u4EE5\u6D4B\u8BD5\u5176\u6027\u80FD\u6216\u7981\u7528\u67D0\u4E9B\u4E0D\u5E38\u7528\u7684\u529F\u80FD\u6765\u5B9E\u73B0\u901F\u5EA6\u4E0E\u529F\u80FD\u7684\u5E73\u8861\uFF0C\u5F53\u7136\u8FD9\u90E8\u5206\u5C1D\u8BD5\u6765\u6E90\u4E8E\u5174\u8DA3\uFF0C\u4F60\u53EF\u4EE5\u53EA\u662F\u7528\u9ED8\u8BA4\u7684 bash shell\u3002</p>\n<h1>\u7EC8\u7AEF\u6A21\u62DF\u5668</h1>\n<p>\u548C\u81EA\u5B9A\u4E49 shell \u4E00\u6837\uFF0C\u82B1\u70B9\u65F6\u95F4\u9009\u62E9\u9002\u5408\u60A8\u7684 <strong>\u7EC8\u7AEF\u6A21\u62DF\u5668</strong> \u5E76\u8FDB\u884C\u8BBE\u7F6E\u662F\u5F88\u6709\u5FC5\u8981\u7684\u3002\u6709\u8BB8\u591A\u7EC8\u7AEF\u6A21\u62DF\u5668\u53EF\u4F9B\u60A8\u9009\u62E9\uFF08\u8FD9\u91CC\u6709\u4E00\u4E9B\u5173\u4E8E\u5B83\u4EEC\u4E4B\u95F4 <a href="https://anarc.at/blog/2018-04-12-terminal-emulators-1/">\u6BD4\u8F83</a> \u7684\u4FE1\u606F\uFF09</p>\n<p>\u60A8\u4F1A\u82B1\u4E0A\u5F88\u591A\u65F6\u95F4\u5728\u4F7F\u7528\u7EC8\u7AEF\u4E0A\uFF0C\u56E0\u6B64\u7814\u7A76\u4E00\u4E0B\u7EC8\u7AEF\u7684\u8BBE\u7F6E\u662F\u5F88\u6709\u5FC5\u8981\u7684\uFF0C\u60A8\u53EF\u4EE5\u4ECE\u4E0B\u9762\u8FD9\u4E9B\u65B9\u9762\u6765\u914D\u7F6E\u60A8\u7684\u7EC8\u7AEF\uFF1A</p>\n<ul>\n<li>\u5B57\u4F53\u9009\u62E9</li>\n<li>\u5F69\u8272\u4E3B\u9898</li>\n<li>\u5FEB\u6377\u952E</li>\n<li>\u6807\u7B7E\u9875/\u9762\u677F\u652F\u6301</li>\n<li>\u56DE\u9000\u914D\u7F6E</li>\n<li>\u6027\u80FD\uFF08\u50CF <a href="https://github.com/jwilm/alacritty">Alacritty</a> \u6216\u8005 <a href="https://sw.kovidgoyal.net/kitty/">kitty</a> \u8FD9\u79CD\u6BD4\u8F83\u65B0\u7684\u7EC8\u7AEF\uFF0C\u5B83\u4EEC\u652F\u6301 GPU \u52A0\u901F\uFF09\u3002</li>\n</ul>\n<h2>\u4EFB\u52A1\u63A7\u5236</h2>\n<ol>\n<li><p>\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528\u7C7B\u4F3C <code>ps aux | grep</code> \u8FD9\u6837\u7684\u547D\u4EE4\u6765\u83B7\u53D6\u4EFB\u52A1\u7684 pid \uFF0C\u7136\u540E\u60A8\u53EF\u4EE5\u57FA\u4E8E pid \u6765\u7ED3\u675F\u8FD9\u4E9B\u8FDB\u7A0B\u3002\u4F46\u6211\u4EEC\u5176\u5B9E\u6709\u66F4\u597D\u7684\u65B9\u6CD5\u6765\u505A\u8FD9\u4EF6\u4E8B\u3002\u5728\u7EC8\u7AEF\u4E2D\u6267\u884C <code>sleep 10000</code> \u8FD9\u4E2A\u4EFB\u52A1\u3002\u7136\u540E\u7528 <code>Ctrl-Z</code> \u5C06\u5176\u5207\u6362\u5230\u540E\u53F0\u5E76\u4F7F\u7528 <code>bg</code> \u6765\u7EE7\u7EED\u5141\u8BB8\u5B83\u3002\u73B0\u5728\uFF0C\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-pgrep.html"><code>pgrep</code></a> \u6765\u67E5\u627E pid \u5E76\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-pkill.html"><code>pkill</code></a> \u7ED3\u675F\u8FDB\u7A0B\u800C\u4E0D\u9700\u8981\u624B\u52A8\u8F93\u5165 pid\u3002(\u63D0\u793A\uFF1A: \u4F7F\u7528 <code>-af</code> \u6807\u8BB0)\u3002</p>\n</li>\n<li><p>\u5982\u679C\u60A8\u5E0C\u671B\u67D0\u4E2A\u8FDB\u7A0B\u7ED3\u675F\u540E\u518D\u5F00\u59CB\u53E6\u5916\u4E00\u4E2A\u8FDB\u7A0B\uFF0C \u5E94\u8BE5\u5982\u4F55\u5B9E\u73B0\u5462\uFF1F\u5728\u8FD9\u4E2A\u7EC3\u4E60\u4E2D\uFF0C\u6211\u4EEC\u4F7F\u7528 <code>sleep 60 &amp;</code> \u4F5C\u4E3A\u5148\u6267\u884C\u7684\u7A0B\u5E8F\u3002\u4E00\u79CD\u65B9\u6CD5\u662F\u4F7F\u7528 <a href="https://www.runoob.com/linux/linux-comm-wait.html"><code>wait</code></a> \u547D\u4EE4\u3002\u5C1D\u8BD5\u542F\u52A8\u8FD9\u4E2A\u4F11\u7720\u547D\u4EE4\uFF0C\u7136\u540E\u5F85\u5176\u7ED3\u675F\u540E\u518D\u6267\u884C <code>ls</code> \u547D\u4EE4\u3002</p>\n<p> \u4F46\u662F\uFF0C\u5982\u679C\u6211\u4EEC\u5728\u4E0D\u540C\u7684 bash \u4F1A\u8BDD\u4E2D\u8FDB\u884C\u64CD\u4F5C\uFF0C\u5219\u4E0A\u8FF0\u65B9\u6CD5\u5C31\u4E0D\u8D77\u4F5C\u7528\u4E86\u3002\u56E0\u4E3A <code>wait</code> \u53EA\u80FD\u5BF9\u5B50\u8FDB\u7A0B\u8D77\u4F5C\u7528\u3002\u4E4B\u524D\u6211\u4EEC\u6CA1\u6709\u63D0\u8FC7\u7684\u4E00\u4E2A\u7279\u6027\u662F\uFF0C<code>kill</code> \u547D\u4EE4\u6210\u529F\u9000\u51FA\u65F6\u5176\u72B6\u6001\u7801\u4E3A 0 \uFF0C\u5176\u4ED6\u72B6\u6001\u5219\u662F\u975E 0\u3002<code>kill -0</code> \u5219\u4E0D\u4F1A\u53D1\u9001\u4FE1\u53F7\uFF0C\u4F46\u662F\u4F1A\u5728\u8FDB\u7A0B\u4E0D\u5B58\u5728\u65F6\u8FD4\u56DE\u4E00\u4E2A\u4E0D\u4E3A 0 \u7684\u72B6\u6001\u7801\u3002\u8BF7\u7F16\u5199\u4E00\u4E2A bash \u51FD\u6570 <code>pidwait</code> \uFF0C\u5B83\u63A5\u53D7\u4E00\u4E2A pid \u4F5C\u4E3A\u8F93\u5165\u53C2\u6570\uFF0C\u7136\u540E\u4E00\u76F4\u7B49\u5F85\u76F4\u5230\u8BE5\u8FDB\u7A0B\u7ED3\u675F\u3002\u60A8\u9700\u8981\u4F7F\u7528 <code>sleep</code> \u6765\u907F\u514D\u6D6A\u8D39 CPU \u6027\u80FD\u3002</p>\n</li>\n</ol>\n<h2>\u522B\u540D</h2>\n<ol>\n<li>\u521B\u5EFA\u4E00\u4E2A <code>dc</code> \u522B\u540D\uFF0C\u5B83\u7684\u529F\u80FD\u662F\u5F53\u6211\u4EEC\u9519\u8BEF\u7684\u5C06 <code>cd</code> \u8F93\u5165\u4E3A <code>dc</code> \u65F6\u4E5F\u80FD\u6B63\u786E\u6267\u884C\u3002</li>\n<li>\u6267\u884C <code>history | awk &#39;{$1=&quot;&quot;;print substr($0,2)}&#39; | sort | uniq -c | sort -n | tail -n 10</code> \u6765\u83B7\u53D6\u60A8\u6700\u5E38\u7528\u7684\u5341\u6761\u547D\u4EE4\uFF0C\u5C1D\u8BD5\u4E3A\u5B83\u4EEC\u521B\u5EFA\u522B\u540D\u3002\u6CE8\u610F\uFF1A\u8FD9\u4E2A\u547D\u4EE4\u53EA\u5728 Bash \u4E2D\u751F\u6548\uFF0C\u5982\u679C\u60A8\u4F7F\u7528 ZSH\uFF0C\u4F7F\u7528 <code>history 1</code> \u66FF\u6362 <code>history</code>\u3002</li>\n</ol>\n<h2>\u914D\u7F6E\u6587\u4EF6</h2>\n<p>\u8BA9\u6211\u4EEC\u5E2E\u52A9\u60A8\u8FDB\u4E00\u6B65\u5B66\u4E60\u914D\u7F6E\u6587\u4EF6\uFF1A</p>\n<ol>\n<li>\u4E3A\u60A8\u7684\u914D\u7F6E\u6587\u4EF6\u65B0\u5EFA\u4E00\u4E2A\u6587\u4EF6\u5939\uFF0C\u5E76\u8BBE\u7F6E\u597D\u7248\u672C\u63A7\u5236</li>\n<li>\u5728\u5176\u4E2D\u6DFB\u52A0\u81F3\u5C11\u4E00\u4E2A\u914D\u7F6E\u6587\u4EF6\uFF0C\u6BD4\u5982\u8BF4\u60A8\u7684 shell\uFF0C\u5728\u5176\u4E2D\u5305\u542B\u4E00\u4E9B\u81EA\u5B9A\u4E49\u8BBE\u7F6E\uFF08\u53EF\u4EE5\u4ECE\u8BBE\u7F6E <code>$PS1</code> \u5F00\u59CB\uFF09\u3002</li>\n<li>\u5EFA\u7ACB\u4E00\u79CD\u5728\u65B0\u8BBE\u5907\u8FDB\u884C\u5FEB\u901F\u5B89\u88C5\u914D\u7F6E\u7684\u65B9\u6CD5\uFF08\u65E0\u9700\u624B\u52A8\u64CD\u4F5C\uFF09\u3002\u6700\u7B80\u5355\u7684\u65B9\u6CD5\u662F\u5199\u4E00\u4E2A shell \u811A\u672C\u5BF9\u6BCF\u4E2A\u6587\u4EF6\u4F7F\u7528 <code>ln -s</code>\uFF0C\u4E5F\u53EF\u4EE5\u4F7F\u7528 <a href="https://wiki.archlinuxcn.org/zh-cn/Dotfiles">\u4E13\u7528\u5DE5\u5177</a></li>\n<li>\u5728\u65B0\u7684\u865A\u62DF\u673A\u4E0A\u6D4B\u8BD5\u8BE5\u5B89\u88C5\u811A\u672C\u3002</li>\n<li>\u5C06\u60A8\u73B0\u6709\u7684\u6240\u6709\u914D\u7F6E\u6587\u4EF6\u79FB\u52A8\u5230\u9879\u76EE\u4ED3\u5E93\u91CC\u3002</li>\n<li>\u5C06\u9879\u76EE\u53D1\u5E03\u5230 GitHub\u3002</li>\n</ol>\n<h2>\u8FDC\u7AEF\u8BBE\u5907</h2>\n<p>\u8FDB\u884C\u4E0B\u9762\u7684\u7EC3\u4E60\u9700\u8981\u60A8\u5148\u5B89\u88C5\u4E00\u4E2A Linux \u865A\u62DF\u673A\uFF08\u5982\u679C\u5DF2\u7ECF\u5B89\u88C5\u8FC7\u5219\u53EF\u4EE5\u76F4\u63A5\u4F7F\u7528\uFF09\uFF0C\u5982\u679C\u60A8\u5BF9\u865A\u62DF\u673A\u5C1A\u4E0D\u719F\u6089\uFF0C\u53EF\u4EE5\u53C2\u8003 <a href="https://www.cnblogs.com/aixxjl/p/18854590">\u8FD9\u7BC7\u6559\u7A0B</a> \u6765\u8FDB\u884C\u5B89\u88C5\uFF0C\u4E5F\u53EF\u4EE5\u4F7F\u7528<code>Wsl</code>\u6216\u8005<code>\u4E91\u670D\u52A1\u5668</code>\uFF0C\u5F53\u7136\u5982\u679C\u4F60\u5DF2\u7ECF\u5B66\u4E60\u4F7F\u7528\u8FC7<code>\u4E91\u670D\u52A1\u5668</code>\u8FD9\u4E9B\u5E94\u8BE5\u53EA\u662F\u57FA\u7840\u64CD\u4F5C\u3002</p>\n<ol>\n<li>\u524D\u5F80 <code>~/.ssh/</code> \u5E76\u67E5\u770B\u662F\u5426\u5DF2\u7ECF\u5B58\u5728 SSH \u5BC6\u94A5\u5BF9\u3002\u5982\u679C\u4E0D\u5B58\u5728\uFF0C\u8BF7\u4F7F\u7528 <code>ssh-keygen -o -a 100 -t ed25519</code> \u6765\u521B\u5EFA\u4E00\u4E2A\u3002\u5EFA\u8BAE\u4E3A\u5BC6\u94A5\u8BBE\u7F6E\u5BC6\u7801\u7136\u540E\u4F7F\u7528 <code>ssh-agent</code>\u3002\u66F4\u591A\u53EF\u4EE5\u53C2\u8003\u4E0A\u9762\u7684\u6587\u7AE0\u3002</li>\n<li>\u5728 <code>.ssh/config</code> \u52A0\u5165\u4E0B\u9762\u5185\u5BB9\uFF1A</li>\n</ol>\n<pre><code class="language-bash">Host vm\n    User username_goes_here\n    HostName ip_goes_here\n    IdentityFile ~/.ssh/id_ed25519\n    LocalForward 9999 localhost:8888\n</code></pre>\n<ol start="3">\n<li>\u4F7F\u7528 <code>ssh-copy-id vm</code> \u5C06\u60A8\u7684 ssh \u5BC6\u94A5\u62F7\u8D1D\u5230\u670D\u52A1\u5668\u3002</li>\n<li>\u4F7F\u7528 <code>python -m http.server 8888</code> \u5728\u60A8\u7684\u865A\u62DF\u673A\u4E2D\u542F\u52A8\u4E00\u4E2A Web \u670D\u52A1\u5668\u5E76\u901A\u8FC7\u672C\u673A\u7684 <code>http://localhost:9999</code> \u8BBF\u95EE\u865A\u62DF\u673A\u4E0A\u7684 Web \u670D\u52A1\u5668</li>\n<li>\u4F7F\u7528 <code>sudo vim /etc/ssh/sshd_config</code> \u7F16\u8F91 SSH \u670D\u52A1\u5668\u914D\u7F6E\uFF0C\u901A\u8FC7\u4FEE\u6539 <code>PasswordAuthentication</code> \u7684\u503C\u6765\u7981\u7528\u5BC6\u7801\u9A8C\u8BC1\u3002\u901A\u8FC7\u4FEE\u6539 <code>PermitRootLogin</code> \u7684\u503C\u6765\u7981\u7528 root \u767B\u5F55\u3002\u7136\u540E\u4F7F\u7528 <code>sudo service sshd restart</code> \u91CD\u542F <code>ssh</code> \u670D\u52A1\u5668\uFF0C\u7136\u540E\u91CD\u65B0\u5C1D\u8BD5\u3002</li>\n<li>(\u5C1D\u8BD5) \u5728\u865A\u62DF\u673A\u4E2D\u5B89\u88C5 <a href="https://mosh.org/"><code>mosh</code></a> \u5E76\u542F\u52A8\u8FDE\u63A5\u3002\u7136\u540E\u65AD\u5F00\u670D\u52A1\u5668/\u865A\u62DF\u673A\u7684\u7F51\u7EDC\u9002\u914D\u5668\u3002mosh \u53EF\u4EE5\u6062\u590D\u8FDE\u63A5\u5417\uFF1F</li>\n<li>(\u5C1D\u8BD5) \u67E5\u770B <code>ssh</code> \u7684 <code>-N</code> \u548C <code>-f</code> \u9009\u9879\u7684\u4F5C\u7528\uFF0C\u627E\u51FA\u5728\u540E\u53F0\u8FDB\u884C\u7AEF\u53E3\u8F6C\u53D1\u7684\u547D\u4EE4\u662F\u4EC0\u4E48\uFF1F</li>\n</ol>\n<h1>Shell \u811A\u672C</h1>\n<p>\u5230\u76EE\u524D\u4E3A\u6B62\uFF0C\u6211\u4EEC\u5DF2\u7ECF\u5B66\u4E60\u4E86\u5982\u4F55\u5728 shell \u4E2D\u6267\u884C\u547D\u4EE4\uFF0C\u5E76\u4F7F\u7528\u7BA1\u9053\u5C06\u547D\u4EE4\u7EC4\u5408\u4F7F\u7528\u3002\u4F46\u662F\uFF0C\u5F88\u591A\u60C5\u51B5\u4E0B\u6211\u4EEC\u9700\u8981\u6267\u884C\u4E00\u7CFB\u5217\u7684\u64CD\u4F5C\u5E76\u4F7F\u7528\u6761\u4EF6\u6216\u5FAA\u73AF\u8FD9\u6837\u7684\u63A7\u5236\u6D41\u3002</p>\n<p>shell \u811A\u672C\u7684\u590D\u6742\u6027\u8FDB\u4E00\u6B65\u63D0\u9AD8\u3002</p>\n<p>\u5927\u591A\u6570 shell \u90FD\u6709\u81EA\u5DF1\u7684\u4E00\u5957\u811A\u672C\u8BED\u8A00\uFF0C\u5305\u62EC\u53D8\u91CF\u3001\u63A7\u5236\u6D41\u548C\u81EA\u5DF1\u7684\u8BED\u6CD5\u3002shell \u811A\u672C\u4E0E\u5176\u4ED6\u811A\u672C\u8BED\u8A00\u4E0D\u540C\u4E4B\u5904\u5728\u4E8E\uFF0Cshell \u811A\u672C\u9488\u5BF9 shell \u6240\u4ECE\u4E8B\u7684\u76F8\u5173\u5DE5\u4F5C\u8FDB\u884C\u4E86\u4F18\u5316\u3002\u56E0\u6B64\uFF0C\u521B\u5EFA\u547D\u4EE4\u6D41\u7A0B\uFF08pipelines\uFF09\u3001\u5C06\u7ED3\u679C\u4FDD\u5B58\u5230\u6587\u4EF6\u3001\u4ECE\u6807\u51C6\u8F93\u5165\u4E2D\u8BFB\u53D6\u8F93\u5165\uFF0C\u8FD9\u4E9B\u90FD\u662F shell \u811A\u672C\u4E2D\u7684\u539F\u751F\u64CD\u4F5C\uFF0C\u8FD9\u8BA9\u5B83\u6BD4\u901A\u7528\u7684\u811A\u672C\u8BED\u8A00\u66F4\u6613\u7528\u3002\u672C\u8282\u4E2D\uFF0C\u6211\u4EEC\u4F1A\u4E13\u6CE8\u4E8E bash \u811A\u672C\uFF0C\u56E0\u4E3A\u5B83\u6700\u6D41\u884C\uFF0C\u5E94\u7528\u66F4\u4E3A\u5E7F\u6CDB\u3002</p>\n<p>\u5728 bash \u4E2D\u4E3A\u53D8\u91CF\u8D4B\u503C\u7684\u8BED\u6CD5\u662F <code>foo=bar</code>\uFF0C\u8BBF\u95EE\u53D8\u91CF\u4E2D\u5B58\u50A8\u7684\u6570\u503C\uFF0C\u5176\u8BED\u6CD5\u4E3A <code>$foo</code>\u3002\n\u9700\u8981\u6CE8\u610F\u7684\u662F\uFF0C<code>foo = bar</code> \uFF08\u4F7F\u7528\u7A7A\u683C\u9694\u5F00\uFF09\u662F\u4E0D\u80FD\u6B63\u786E\u5DE5\u4F5C\u7684\uFF0C\u56E0\u4E3A\u89E3\u91CA\u5668\u4F1A\u8C03\u7528\u7A0B\u5E8F <code>foo</code> \u5E76\u5C06 <code>=</code> \u548C <code>bar</code> \u4F5C\u4E3A\u53C2\u6570\u3002\n\u603B\u7684\u6765\u8BF4\uFF0C\u5728 shell \u811A\u672C\u4E2D\u4F7F\u7528\u7A7A\u683C\u4F1A\u8D77\u5230\u5206\u5272\u53C2\u6570\u7684\u4F5C\u7528\uFF0C\u6709\u65F6\u5019\u53EF\u80FD\u4F1A\u9020\u6210\u6DF7\u6DC6\uFF0C\u8BF7\u52A1\u5FC5\u591A\u52A0\u68C0\u67E5\u3002</p>\n<p>Bash \u4E2D\u7684\u5B57\u7B26\u4E32\u901A\u8FC7 <code>&#39;</code> \u548C <code>&quot;</code> \u5206\u9694\u7B26\u6765\u5B9A\u4E49\uFF0C\u4F46\u662F\u5B83\u4EEC\u7684\u542B\u4E49\u5E76\u4E0D\u76F8\u540C\u3002\u4EE5 <code>&#39;</code> \u5B9A\u4E49\u7684\u5B57\u7B26\u4E32\u4E3A\u539F\u4E49\u5B57\u7B26\u4E32\uFF0C\u5176\u4E2D\u7684\u53D8\u91CF\u4E0D\u4F1A\u88AB\u8F6C\u4E49\uFF0C\u800C <code>&quot;</code> \u5B9A\u4E49\u7684\u5B57\u7B26\u4E32\u4F1A\u5C06\u53D8\u91CF\u503C\u8FDB\u884C\u66FF\u6362\u3002</p>\n<pre><code class="language-bash">foo=bar\necho &quot;$foo&quot;\n# \u6253\u5370 bar\necho &#39;$foo&#39;\n# \u6253\u5370 $foo\n</code></pre>\n<p>\u548C\u5176\u4ED6\u5927\u591A\u6570\u7684\u7F16\u7A0B\u8BED\u8A00\u4E00\u6837\uFF0C<code>bash</code> \u4E5F\u652F\u6301 <code>if</code>, <code>case</code>, <code>while</code> \u548C <code>for</code> \u8FD9\u4E9B\u63A7\u5236\u6D41\u5173\u952E\u5B57\u3002\u540C\u6837\u5730\uFF0C\n <code>bash</code> \u4E5F\u652F\u6301\u51FD\u6570\uFF0C\u5B83\u53EF\u4EE5\u63A5\u53D7\u53C2\u6570\u5E76\u57FA\u4E8E\u53C2\u6570\u8FDB\u884C\u64CD\u4F5C\u3002\u4E0B\u9762\u8FD9\u4E2A\u51FD\u6570\u662F\u4E00\u4E2A\u4F8B\u5B50\uFF0C\u5B83\u4F1A\u521B\u5EFA\u4E00\u4E2A\u6587\u4EF6\u5939\u5E76\u4F7F\u7528 <code>cd</code> \u8FDB\u5165\u8BE5\u6587\u4EF6\u5939\u3002</p>\n<pre><code class="language-bash">mcd () {\n    mkdir -p &quot;$1&quot;\n    cd &quot;$1&quot;\n}\n</code></pre>\n<p>\u8FD9\u91CC <code>$1</code> \u662F\u811A\u672C\u7684\u7B2C\u4E00\u4E2A\u53C2\u6570\u3002\u4E0E\u5176\u4ED6\u811A\u672C\u8BED\u8A00\u4E0D\u540C\u7684\u662F\uFF0Cbash \u4F7F\u7528\u4E86\u5F88\u591A\u7279\u6B8A\u7684\u53D8\u91CF\u6765\u8868\u793A\u53C2\u6570\u3001\u9519\u8BEF\u4EE3\u7801\u548C\u76F8\u5173\u53D8\u91CF\u3002\u4E0B\u9762\u5217\u4E3E\u4E86\u5176\u4E2D\u4E00\u4E9B\u53D8\u91CF\uFF0C\u66F4\u5B8C\u6574\u7684\u5217\u8868\u53EF\u4EE5\u53C2\u8003 <a href="https://www.tldp.org/LDP/abs/html/special-chars.html">\u8FD9\u91CC</a>\u3002</p>\n<ul>\n<li><code>$0</code> - \u811A\u672C\u540D</li>\n<li><code>$1</code> \u5230 <code>$9</code> - \u811A\u672C\u7684\u53C2\u6570\u3002 <code>$1</code> \u662F\u7B2C\u4E00\u4E2A\u53C2\u6570\uFF0C\u4F9D\u6B64\u7C7B\u63A8\u3002</li>\n<li><code>$@</code> - \u6240\u6709\u53C2\u6570</li>\n<li><code>$#</code> - \u53C2\u6570\u4E2A\u6570</li>\n<li><code>$?</code> - \u524D\u4E00\u4E2A\u547D\u4EE4\u7684\u8FD4\u56DE\u503C</li>\n<li><code>$$</code> - \u5F53\u524D\u811A\u672C\u7684\u8FDB\u7A0B\u8BC6\u522B\u7801</li>\n<li><code>!!</code> - \u5B8C\u6574\u7684\u4E0A\u4E00\u6761\u547D\u4EE4\uFF0C\u5305\u62EC\u53C2\u6570\u3002\u5E38\u89C1\u5E94\u7528\uFF1A\u5F53\u4F60\u56E0\u4E3A\u6743\u9650\u4E0D\u8DB3\u6267\u884C\u547D\u4EE4\u5931\u8D25\u65F6\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>sudo !!</code> \u518D\u5C1D\u8BD5\u4E00\u6B21\u3002</li>\n<li><code>$_</code> - \u4E0A\u4E00\u6761\u547D\u4EE4\u7684\u6700\u540E\u4E00\u4E2A\u53C2\u6570\u3002\u5982\u679C\u4F60\u6B63\u5728\u4F7F\u7528\u7684\u662F\u4EA4\u4E92\u5F0F shell\uFF0C\u4F60\u53EF\u4EE5\u901A\u8FC7\u6309\u4E0B <code>Esc</code> \u4E4B\u540E\u952E\u5165 . \u6765\u83B7\u53D6\u8FD9\u4E2A\u503C\u3002</li>\n</ul>\n<p>\u547D\u4EE4\u901A\u5E38\u4F7F\u7528 <code>STDOUT</code> \u6765\u8FD4\u56DE\u8F93\u51FA\u503C\uFF0C\u4F7F\u7528 <code>STDERR</code> \u6765\u8FD4\u56DE\u9519\u8BEF\u53CA\u9519\u8BEF\u7801\uFF0C\u4FBF\u4E8E\u811A\u672C\u4EE5\u66F4\u52A0\u53CB\u597D\u7684\u65B9\u5F0F\u62A5\u544A\u9519\u8BEF\u3002\n\u8FD4\u56DE\u7801\u6216\u9000\u51FA\u72B6\u6001\u662F\u811A\u672C/\u547D\u4EE4\u4E4B\u95F4\u4EA4\u6D41\u6267\u884C\u72B6\u6001\u7684\u65B9\u5F0F\u3002\u8FD4\u56DE\u503C 0 \u8868\u793A\u6B63\u5E38\u6267\u884C\uFF0C\u5176\u4ED6\u6240\u6709\u975E 0 \u7684\u8FD4\u56DE\u503C\u90FD\u8868\u793A\u6709\u9519\u8BEF\u53D1\u751F\u3002</p>\n<p>\u9000\u51FA\u7801\u53EF\u4EE5\u642D\u914D <code>&amp;&amp;</code>\uFF08\u4E0E\u64CD\u4F5C\u7B26\uFF09\u548C <code>||</code>\uFF08\u6216\u64CD\u4F5C\u7B26\uFF09\u4F7F\u7528\uFF0C\u7528\u6765\u8FDB\u884C\u6761\u4EF6\u5224\u65AD\uFF0C\u51B3\u5B9A\u662F\u5426\u6267\u884C\u5176\u4ED6\u7A0B\u5E8F\u3002\u5B83\u4EEC\u90FD\u5C5E\u4E8E <a href="https://en.wikipedia.org/wiki/Short-circuit_evaluation">\u77ED\u8DEF\u8FD0\u7B97\u7B26</a>\uFF08short-circuiting\uFF09 \u540C\u4E00\u884C\u7684\u591A\u4E2A\u547D\u4EE4\u53EF\u4EE5\u7528 <code>;</code> \u5206\u9694\u3002\u7A0B\u5E8F <code>true</code> \u7684\u8FD4\u56DE\u7801\u6C38\u8FDC\u662F <code>0</code>\uFF0C<code>false</code> \u7684\u8FD4\u56DE\u7801\u6C38\u8FDC\u662F <code>1</code>\u3002\u8BA9\u6211\u4EEC\u770B\u51E0\u4E2A\u4F8B\u5B50</p>\n<pre><code class="language-bash">false || echo &quot;Oops, fail&quot;\n# Oops, fail\n\ntrue || echo &quot;Will not be printed&quot;\n#\n\ntrue &amp;&amp; echo &quot;Things went well&quot;\n# Things went well\n\nfalse &amp;&amp; echo &quot;Will not be printed&quot;\n#\n\nfalse ; echo &quot;This will always run&quot;\n# This will always run\n</code></pre>\n<p>\u53E6\u4E00\u4E2A\u5E38\u89C1\u7684\u6A21\u5F0F\u662F\u4EE5\u53D8\u91CF\u7684\u5F62\u5F0F\u83B7\u53D6\u4E00\u4E2A\u547D\u4EE4\u7684\u8F93\u51FA\uFF0C\u8FD9\u53EF\u4EE5\u901A\u8FC7 <em>\u547D\u4EE4\u66FF\u6362</em>\uFF08<em>command substitution</em>\uFF09\u5B9E\u73B0\u3002</p>\n<p>\u5F53\u60A8\u901A\u8FC7 <code>$( CMD )</code> \u8FD9\u6837\u7684\u65B9\u5F0F\u6765\u6267\u884C <code>CMD</code> \u8FD9\u4E2A\u547D\u4EE4\u65F6\uFF0C\u5B83\u7684\u8F93\u51FA\u7ED3\u679C\u4F1A\u66FF\u6362\u6389 <code>$( CMD )</code> \u3002\u4F8B\u5982\uFF0C\u5982\u679C\u6267\u884C <code>for file in $(ls)</code> \uFF0Cshell \u9996\u5148\u5C06\u8C03\u7528 <code>ls</code> \uFF0C\u7136\u540E\u904D\u5386\u5F97\u5230\u7684\u8FD9\u4E9B\u8FD4\u56DE\u503C\u3002\u8FD8\u6709\u4E00\u4E2A\u51B7\u95E8\u7684\u7C7B\u4F3C\u7279\u6027\u662F <em>\u8FDB\u7A0B\u66FF\u6362</em>\uFF08<em>process substitution</em>\uFF09\uFF0C <code>&lt;( CMD )</code> \u4F1A\u6267\u884C <code>CMD</code> \u5E76\u5C06\u7ED3\u679C\u8F93\u51FA\u5230\u4E00\u4E2A\u4E34\u65F6\u6587\u4EF6\u4E2D\uFF0C\u5E76\u5C06 <code>&lt;( CMD )</code> \u66FF\u6362\u6210\u4E34\u65F6\u6587\u4EF6\u540D\u3002\u8FD9\u5728\u6211\u4EEC\u5E0C\u671B\u8FD4\u56DE\u503C\u901A\u8FC7\u6587\u4EF6\u800C\u4E0D\u662F STDIN \u4F20\u9012\u65F6\u5F88\u6709\u7528\u3002\u4F8B\u5982\uFF0C <code>diff &lt;(ls foo) &lt;(ls bar)</code> \u4F1A\u663E\u793A\u6587\u4EF6\u5939 <code>foo</code> \u548C <code>bar</code> \u4E2D\u6587\u4EF6\u7684\u533A\u522B\u3002</p>\n<p>\u8BF4\u4E86\u5F88\u591A\uFF0C\u73B0\u5728\u8BE5\u770B\u4F8B\u5B50\u4E86\uFF0C\u4E0B\u9762\u8FD9\u4E2A\u4F8B\u5B50\u5C55\u793A\u4E86\u4E00\u90E8\u5206\u4E0A\u9762\u63D0\u5230\u7684\u7279\u6027\u3002\u8FD9\u6BB5\u811A\u672C\u4F1A\u904D\u5386\u6211\u4EEC\u63D0\u4F9B\u7684\u53C2\u6570\uFF0C\u4F7F\u7528 <code>grep</code> \u641C\u7D22\u5B57\u7B26\u4E32 <code>foobar</code>\uFF0C\u5982\u679C\u6CA1\u6709\u627E\u5230\uFF0C\u5219\u5C06\u5176\u4F5C\u4E3A\u6CE8\u91CA\u8FFD\u52A0\u5230\u6587\u4EF6\u4E2D\u3002</p>\n<pre><code class="language-bash">#!/bin/bash\n\necho &quot;Starting program at $(date)&quot; # date\u4F1A\u88AB\u66FF\u6362\u6210\u65E5\u671F\u548C\u65F6\u95F4\n\necho &quot;Running program $0 with $# arguments with pid $$&quot;\n\nfor file in &quot;$@&quot;; do\n    grep foobar &quot;$file&quot; &gt; /dev/null 2&gt; /dev/null\n    # \u5982\u679C\u6A21\u5F0F\u6CA1\u6709\u627E\u5230\uFF0C\u5219grep\u9000\u51FA\u72B6\u6001\u4E3A 1\n    # \u6211\u4EEC\u5C06\u6807\u51C6\u8F93\u51FA\u6D41\u548C\u6807\u51C6\u9519\u8BEF\u6D41\u91CD\u5B9A\u5411\u5230Null\uFF0C\u56E0\u4E3A\u6211\u4EEC\u5E76\u4E0D\u5173\u5FC3\u8FD9\u4E9B\u4FE1\u606F\n    if [[ $? -ne 0 ]]; then\n        echo &quot;File $file does not have any foobar, adding one&quot;\n        echo &quot;# foobar&quot; &gt;&gt; &quot;$file&quot;\n    fi\ndone\n</code></pre>\n<p>\u5728\u6761\u4EF6\u8BED\u53E5\u4E2D\uFF0C\u6211\u4EEC\u6BD4\u8F83 <code>$?</code> \u662F\u5426\u7B49\u4E8E 0\u3002\nBash \u5B9E\u73B0\u4E86\u8BB8\u591A\u7C7B\u4F3C\u7684\u6BD4\u8F83\u64CD\u4F5C\uFF0C\u60A8\u53EF\u4EE5\u67E5\u770B <a href="https://man7.org/linux/man-pages/man1/test.1.html"><code>test \u624B\u518C</code></a>\u3002\n\u5728 bash \u4E2D\u8FDB\u884C\u6BD4\u8F83\u65F6\uFF0C\u5C3D\u91CF\u4F7F\u7528\u53CC\u65B9\u62EC\u53F7 <code>[[ ]]</code> \u800C\u4E0D\u662F\u5355\u65B9\u62EC\u53F7 <code>[ ]</code>\uFF0C\u8FD9\u6837\u4F1A\u964D\u4F4E\u72AF\u9519\u7684\u51E0\u7387\uFF0C\u5C3D\u7BA1\u8FD9\u6837\u5E76\u4E0D\u80FD\u517C\u5BB9 <code>sh</code>\u3002 \u66F4\u8BE6\u7EC6\u7684\u8BF4\u660E\u53C2\u89C1 <a href="http://mywiki.wooledge.org/BashFAQ/031">\u8FD9\u91CC</a>\u3002</p>\n<p>\u5F53\u6267\u884C\u811A\u672C\u65F6\uFF0C\u6211\u4EEC\u7ECF\u5E38\u9700\u8981\u63D0\u4F9B\u5F62\u5F0F\u7C7B\u4F3C\u7684\u53C2\u6570\u3002bash \u4F7F\u6211\u4EEC\u53EF\u4EE5\u8F7B\u677E\u7684\u5B9E\u73B0\u8FD9\u4E00\u64CD\u4F5C\uFF0C\u5B83\u53EF\u4EE5\u57FA\u4E8E\u6587\u4EF6\u6269\u5C55\u540D\u5C55\u5F00\u8868\u8FBE\u5F0F\u3002\u8FD9\u4E00\u6280\u672F\u88AB\u79F0\u4E3A shell \u7684 <em>\u901A\u914D</em>\uFF08<em>globbing</em>\uFF09</p>\n<ul>\n<li>\u901A\u914D\u7B26 - \u5F53\u4F60\u60F3\u8981\u5229\u7528\u901A\u914D\u7B26\u8FDB\u884C\u5339\u914D\u65F6\uFF0C\u4F60\u53EF\u4EE5\u5206\u522B\u4F7F\u7528 <code>?</code> \u548C <code>*</code> \u6765\u5339\u914D\u4E00\u4E2A\u6216\u4EFB\u610F\u4E2A\u5B57\u7B26\u3002\u4F8B\u5982\uFF0C\u5BF9\u4E8E\u6587\u4EF6 <code>foo</code>, <code>foo1</code>, <code>foo2</code>, <code>foo10</code> \u548C <code>bar</code>, <code>rm foo?</code> \u8FD9\u6761\u547D\u4EE4\u4F1A\u5220\u9664 <code>foo1</code> \u548C <code>foo2</code> \uFF0C\u800C <code>rm foo*</code> \u5219\u4F1A\u5220\u9664\u9664\u4E86 <code>bar</code> \u4E4B\u5916\u7684\u6240\u6709\u6587\u4EF6\u3002</li>\n<li>\u82B1\u62EC\u53F7 <code>{}</code> - \u5F53\u4F60\u6709\u4E00\u7CFB\u5217\u7684\u6307\u4EE4\uFF0C\u5176\u4E2D\u5305\u542B\u4E00\u6BB5\u516C\u5171\u5B50\u4E32\u65F6\uFF0C\u53EF\u4EE5\u7528\u82B1\u62EC\u53F7\u6765\u81EA\u52A8\u5C55\u5F00\u8FD9\u4E9B\u547D\u4EE4\u3002\u8FD9\u5728\u6279\u91CF\u79FB\u52A8\u6216\u8F6C\u6362\u6587\u4EF6\u65F6\u975E\u5E38\u65B9\u4FBF\u3002</li>\n</ul>\n<pre><code class="language-bash">convert image.{png,jpg}\n# \u4F1A\u5C55\u5F00\u4E3A\nconvert image.png image.jpg\n\ncp /path/to/project/{foo,bar,baz}.sh /newpath\n# \u4F1A\u5C55\u5F00\u4E3A\ncp /path/to/project/foo.sh /path/to/project/bar.sh /path/to/project/baz.sh /newpath\n\n# \u4E5F\u53EF\u4EE5\u7ED3\u5408\u901A\u914D\u4F7F\u7528\nmv *{.py,.sh} folder\n# \u4F1A\u79FB\u52A8\u6240\u6709 *.py \u548C *.sh \u6587\u4EF6\n\nmkdir foo bar\n\n# \u4E0B\u9762\u547D\u4EE4\u4F1A\u521B\u5EFA foo/a, foo/b, ... foo/h, bar/a, bar/b, ... bar/h \u8FD9\u4E9B\u6587\u4EF6\ntouch {foo,bar}/{a..h}\ntouch foo/x bar/y\n# \u6BD4\u8F83\u6587\u4EF6\u5939 foo \u548C bar \u4E2D\u5305\u542B\u6587\u4EF6\u7684\u4E0D\u540C\ndiff &lt;(ls foo) &lt;(ls bar)\n# \u8F93\u51FA\n# &lt; x\n# ---\n# &gt; y\n</code></pre>\n<!-- Lastly, pipes `|` are a core feature of scripting. Pipes connect one program\'s output to the next program\'s input. We will cover them more in detail in the data wrangling lecture. -->\n\n<p>\u7F16\u5199 <code>bash</code> \u811A\u672C\u6709\u65F6\u5019\u4F1A\u5F88\u522B\u626D\u548C\u53CD\u76F4\u89C9\u3002\u4F8B\u5982 <a href="https://github.com/koalaman/shellcheck">shellcheck</a> \u8FD9\u6837\u7684\u5DE5\u5177\u53EF\u4EE5\u5E2E\u52A9\u4F60\u5B9A\u4F4D sh/bash \u811A\u672C\u4E2D\u7684\u9519\u8BEF\u3002</p>\n<p>\u6CE8\u610F\uFF0C\u811A\u672C\u5E76\u4E0D\u4E00\u5B9A\u53EA\u6709\u7528 bash \u5199\u624D\u80FD\u5728\u7EC8\u7AEF\u91CC\u8C03\u7528\u3002\u6BD4\u5982\u8BF4\uFF0C\u8FD9\u662F\u4E00\u6BB5 Python \u811A\u672C\uFF0C\u4F5C\u7528\u662F\u5C06\u8F93\u5165\u7684\u53C2\u6570\u5012\u5E8F\u8F93\u51FA\uFF1A</p>\n<pre><code class="language-python">#!/usr/local/bin/python\nimport sys\nfor arg in reversed(sys.argv[1:]):\n    print(arg)\n</code></pre>\n<p>\u5185\u6838\u77E5\u9053\u53BB\u7528 python \u89E3\u91CA\u5668\u800C\u4E0D\u662F shell \u547D\u4EE4\u6765\u8FD0\u884C\u8FD9\u6BB5\u811A\u672C\uFF0C\u662F\u56E0\u4E3A\u811A\u672C\u7684\u5F00\u5934\u7B2C\u4E00\u884C\u7684 <a href="https://en.wikipedia.org/wiki/Shebang_(Unix)">shebang</a>\u3002</p>\n<p>\u5728 <code>shebang</code> \u884C\u4E2D\u4F7F\u7528 <a href="https://man7.org/linux/man-pages/man1/env.1.html"><code>env</code></a> \u547D\u4EE4\u662F\u4E00\u79CD\u597D\u7684\u5B9E\u8DF5\uFF0C\u5B83\u4F1A\u5229\u7528\u73AF\u5883\u53D8\u91CF\u4E2D\u7684\u7A0B\u5E8F\u6765\u89E3\u6790\u8BE5\u811A\u672C\uFF0C\u8FD9\u6837\u5C31\u63D0\u9AD8\u4E86\u60A8\u7684\u811A\u672C\u7684\u53EF\u79FB\u690D\u6027\u3002<code>env</code> \u4F1A\u5229\u7528\u6211\u4EEC\u7B2C\u4E00\u8282\u8BB2\u5EA7\u4E2D\u4ECB\u7ECD\u8FC7\u7684 <code>PATH</code> \u73AF\u5883\u53D8\u91CF\u6765\u8FDB\u884C\u5B9A\u4F4D\u3002\n\u4F8B\u5982\uFF0C\u4F7F\u7528\u4E86 <code>env</code> \u7684 shebang \u770B\u4E0A\u53BB\u662F\u8FD9\u6837\u7684 <code>#!/usr/bin/env python</code>\u3002</p>\n<p>shell \u51FD\u6570\u548C\u811A\u672C\u6709\u5982\u4E0B\u4E00\u4E9B\u4E0D\u540C\u70B9\uFF1A</p>\n<ul>\n<li>\u51FD\u6570\u53EA\u80FD\u4E0E shell \u4F7F\u7528\u76F8\u540C\u7684\u8BED\u8A00\uFF0C\u811A\u672C\u53EF\u4EE5\u4F7F\u7528\u4EFB\u610F\u8BED\u8A00\u3002\u56E0\u6B64\u5728\u811A\u672C\u4E2D\u5305\u542B <code>shebang</code> \u662F\u5F88\u91CD\u8981\u7684\u3002</li>\n<li>\u51FD\u6570\u4EC5\u5728\u5B9A\u4E49\u65F6\u88AB\u52A0\u8F7D\uFF0C\u811A\u672C\u4F1A\u5728\u6BCF\u6B21\u88AB\u6267\u884C\u65F6\u52A0\u8F7D\u3002\u8FD9\u8BA9\u51FD\u6570\u7684\u52A0\u8F7D\u6BD4\u811A\u672C\u7565\u5FEB\u4E00\u4E9B\uFF0C\u4F46\u6BCF\u6B21\u4FEE\u6539\u51FD\u6570\u5B9A\u4E49\uFF0C\u90FD\u8981\u91CD\u65B0\u52A0\u8F7D\u4E00\u6B21\u3002</li>\n<li>\u51FD\u6570\u4F1A\u5728\u5F53\u524D\u7684 shell \u73AF\u5883\u4E2D\u6267\u884C\uFF0C\u811A\u672C\u4F1A\u5728\u5355\u72EC\u7684\u8FDB\u7A0B\u4E2D\u6267\u884C\u3002\u56E0\u6B64\uFF0C\u51FD\u6570\u53EF\u4EE5\u5BF9\u73AF\u5883\u53D8\u91CF\u8FDB\u884C\u66F4\u6539\uFF0C\u6BD4\u5982\u6539\u53D8\u5F53\u524D\u5DE5\u4F5C\u76EE\u5F55\uFF0C\u811A\u672C\u5219\u4E0D\u884C\u3002\u4F7F\u7528 <a href="https://man7.org/linux/man-pages/man1/export.1p.html"><code>export</code></a> \u5BFC\u51FA\u7684\u73AF\u5883\u53D8\u91CF\u4F1A\u4EE5\u4F20\u503C\u7684\u65B9\u5F0F\u4F20\u9012\u7ED9\u811A\u672C\u3002</li>\n<li>\u4E0E\u5176\u4ED6\u7A0B\u5E8F\u8BED\u8A00\u4E00\u6837\uFF0C\u51FD\u6570\u53EF\u4EE5\u63D0\u9AD8\u4EE3\u7801\u6A21\u5757\u6027\u3001\u4EE3\u7801\u590D\u7528\u6027\u5E76\u521B\u5EFA\u6E05\u6670\u6027\u7684\u7ED3\u6784\u3002shell \u811A\u672C\u4E2D\u5F80\u5F80\u4E5F\u4F1A\u5305\u542B\u5B83\u4EEC\u81EA\u5DF1\u7684\u51FD\u6570\u5B9A\u4E49\u3002</li>\n</ul>\n<h1>Shell \u5DE5\u5177</h1>\n<h2>\u67E5\u770B\u547D\u4EE4\u5982\u4F55\u4F7F\u7528</h2>\n<p>\u770B\u5230\u8FD9\u91CC\uFF0C\u60A8\u53EF\u80FD\u4F1A\u6709\u7591\u95EE\uFF0C\u6211\u4EEC\u5E94\u8BE5\u5982\u4F55\u4E3A\u7279\u5B9A\u7684\u547D\u4EE4\u627E\u5230\u5408\u9002\u7684\u6807\u8BB0\u5462\uFF1F\u4F8B\u5982 <code>ls -l</code>, <code>mv -i</code> \u548C <code>mkdir -p</code>\u3002\u66F4\u666E\u904D\u7684\u662F\uFF0C\u7ED9\u60A8\u4E00\u4E2A\u547D\u4EE4\u884C\uFF0C\u60A8\u5E94\u8BE5\u600E\u6837\u4E86\u89E3\u5982\u4F55\u4F7F\u7528\u8FD9\u4E2A\u547D\u4EE4\u884C\u5E76\u627E\u51FA\u5B83\u7684\u4E0D\u540C\u7684\u9009\u9879\u5462\uFF1F\n\u4E00\u822C\u6765\u8BF4\uFF0C\u60A8\u53EF\u80FD\u4F1A\u5148\u53BB\u7F51\u4E0A\u641C\u7D22\u7B54\u6848\uFF0C\u4F46\u662F\uFF0CUNIX \u53EF\u6BD4 StackOverflow \u51FA\u73B0\u7684\u65E9\uFF0C\u56E0\u6B64\u6211\u4EEC\u7684\u7CFB\u7EDF\u91CC\u5176\u5B9E\u65E9\u5C31\u5305\u542B\u4E86\u53EF\u4EE5\u83B7\u53D6\u76F8\u5173\u4FE1\u606F\u7684\u65B9\u6CD5\u3002</p>\n<p>\u5728\u4E0A\u4E00\u8282\u4E2D\u6211\u4EEC\u4ECB\u7ECD\u8FC7\uFF0C\u6700\u5E38\u7528\u7684\u65B9\u6CD5\u662F\u4E3A\u5BF9\u5E94\u7684\u547D\u4EE4\u884C\u6DFB\u52A0 <code>-h</code> \u6216 <code>--help</code> \u6807\u8BB0\u3002\u53E6\u5916\u4E00\u4E2A\u66F4\u8BE6\u7EC6\u7684\u65B9\u6CD5\u5219\u662F\u4F7F\u7528 <code>man</code> \u547D\u4EE4\u3002<a href="https://man7.org/linux/man-pages/man1/man.1.html"><code>man</code></a> \u547D\u4EE4\u662F\u624B\u518C\uFF08manual\uFF09\u7684\u7F29\u5199\uFF0C\u5B83\u63D0\u4F9B\u4E86\u547D\u4EE4\u7684\u7528\u6237\u624B\u518C\u3002</p>\n<p>\u4F8B\u5982\uFF0C<code>man rm</code> \u4F1A\u8F93\u51FA\u547D\u4EE4 <code>rm</code> \u7684\u8BF4\u660E\uFF0C\u540C\u65F6\u8FD8\u6709\u5176\u6807\u8BB0\u5217\u8868\uFF0C\u5305\u62EC\u4E4B\u524D\u6211\u4EEC\u4ECB\u7ECD\u8FC7\u7684 <code>-i</code>\u3002\n\u4E8B\u5B9E\u4E0A\uFF0C\u76EE\u524D\u6211\u4EEC\u7ED9\u51FA\u7684\u6240\u6709\u547D\u4EE4\u7684\u8BF4\u660E\u94FE\u63A5\uFF0C\u90FD\u662F\u7F51\u9875\u7248\u7684 Linux \u547D\u4EE4\u624B\u518C\u3002\u5373\u4F7F\u662F\u60A8\u5B89\u88C5\u7684\u7B2C\u4E09\u65B9\u547D\u4EE4\uFF0C\u524D\u63D0\u662F\u5F00\u53D1\u8005\u7F16\u5199\u4E86\u624B\u518C\u5E76\u5C06\u5176\u5305\u542B\u5728\u4E86\u5B89\u88C5\u5305\u4E2D\u3002\u5728\u4EA4\u4E92\u5F0F\u7684\u3001\u57FA\u4E8E\u5B57\u7B26\u5904\u7406\u7684\u7EC8\u7AEF\u7A97\u53E3\u4E2D\uFF0C\u4E00\u822C\u4E5F\u53EF\u4EE5\u901A\u8FC7 <code>:help</code> \u547D\u4EE4\u6216\u952E\u5165 <code>?</code> \u6765\u83B7\u53D6\u5E2E\u52A9\u3002</p>\n<p>\u6709\u65F6\u5019\u624B\u518C\u5185\u5BB9\u592A\u8FC7\u8BE6\u5B9E\uFF0C\u8BA9\u6211\u4EEC\u96BE\u4EE5\u5728\u5176\u4E2D\u67E5\u627E\u54EA\u4E9B\u6700\u5E38\u7528\u7684\u6807\u8BB0\u548C\u8BED\u6CD5\u3002\n<a href="https://tldr.sh/">TLDR pages</a> \u662F\u4E00\u4E2A\u5F88\u4E0D\u9519\u7684\u66FF\u4EE3\u54C1\uFF0C\u5B83\u63D0\u4F9B\u4E86\u4E00\u4E9B\u6848\u4F8B\uFF0C\u53EF\u4EE5\u5E2E\u52A9\u60A8\u5FEB\u901F\u627E\u5230\u6B63\u786E\u7684\u9009\u9879\u3002</p>\n<p>\u4F8B\u5982\uFF0C\u5728 tldr \u4E0A\u641C\u7D22 <a href="https://tldr.ostera.io/tar"><code>tar</code></a> \u7684\u7528\u6CD5\u3002</p>\n<h2>\u67E5\u627E\u6587\u4EF6</h2>\n<p>\u7A0B\u5E8F\u5458\u4EEC\u9762\u5BF9\u7684\u6700\u5E38\u89C1\u7684\u91CD\u590D\u4EFB\u52A1\u5C31\u662F\u67E5\u627E\u6587\u4EF6\u6216\u76EE\u5F55\u3002\u6240\u6709\u7684\u7C7B UNIX \u7CFB\u7EDF\u90FD\u5305\u542B\u4E00\u4E2A\u540D\u4E3A <a href="https://man7.org/linux/man-pages/man1/find.1.html"><code>find</code></a> \u7684\u5DE5\u5177\uFF0C\u5B83\u662F shell \u4E0A\u7528\u4E8E\u67E5\u627E\u6587\u4EF6\u7684\u7EDD\u4F73\u5DE5\u5177\u3002<code>find</code> \u547D\u4EE4\u4F1A\u9012\u5F52\u5730\u641C\u7D22\u7B26\u5408\u6761\u4EF6\u7684\u6587\u4EF6\uFF0C\u4F8B\u5982\uFF1A</p>\n<pre><code class="language-bash"># \u67E5\u627E\u6240\u6709\u540D\u79F0\u4E3Asrc\u7684\u6587\u4EF6\u5939\nfind . -name src -type d\n# \u67E5\u627E\u6240\u6709\u6587\u4EF6\u5939\u8DEF\u5F84\u4E2D\u5305\u542Btest\u7684python\u6587\u4EF6\nfind . -path &#39;*/test/*.py&#39; -type f\n# \u67E5\u627E\u524D\u4E00\u5929\u4FEE\u6539\u7684\u6240\u6709\u6587\u4EF6\nfind . -mtime -1\n# \u67E5\u627E\u6240\u6709\u5927\u5C0F\u5728500k\u81F310M\u7684tar.gz\u6587\u4EF6\nfind . -size +500k -size -10M -name &#39;*.tar.gz&#39;\n</code></pre>\n<p>\u9664\u4E86\u5217\u51FA\u6240\u5BFB\u627E\u7684\u6587\u4EF6\u4E4B\u5916\uFF0Cfind \u8FD8\u80FD\u5BF9\u6240\u6709\u67E5\u627E\u5230\u7684\u6587\u4EF6\u8FDB\u884C\u64CD\u4F5C\u3002\u8FD9\u80FD\u6781\u5927\u5730\u7B80\u5316\u4E00\u4E9B\u5355\u8C03\u7684\u4EFB\u52A1\u3002</p>\n<pre><code class="language-bash"># \u5220\u9664\u5168\u90E8\u6269\u5C55\u540D\u4E3A.tmp \u7684\u6587\u4EF6\nfind . -name &#39;*.tmp&#39; -exec rm {} \\;\n# \u67E5\u627E\u5168\u90E8\u7684 PNG \u6587\u4EF6\u5E76\u5C06\u5176\u8F6C\u6362\u4E3A JPG\nfind . -name &#39;*.png&#39; -exec magick {} {}.jpg \\;\n</code></pre>\n<p>\u5C3D\u7BA1 <code>find</code> \u7528\u9014\u5E7F\u6CDB\uFF0C\u5B83\u7684\u8BED\u6CD5\u5374\u6BD4\u8F83\u96BE\u4EE5\u8BB0\u5FC6\u3002\u4F8B\u5982\uFF0C\u4E3A\u4E86\u67E5\u627E\u6EE1\u8DB3\u6A21\u5F0F <code>PATTERN</code> \u7684\u6587\u4EF6\uFF0C\u60A8\u9700\u8981\u6267\u884C <code>find -name &#39;*PATTERN*&#39;</code> (\u5982\u679C\u60A8\u5E0C\u671B\u6A21\u5F0F\u5339\u914D\u65F6\u662F\u4E0D\u533A\u5206\u5927\u5C0F\u5199\uFF0C\u53EF\u4EE5\u4F7F\u7528 <code>-iname</code> \u9009\u9879\uFF09</p>\n<p>\u60A8\u5F53\u7136\u53EF\u4EE5\u4F7F\u7528 alias \u8BBE\u7F6E\u522B\u540D\u6765\u7B80\u5316\u4E0A\u8FF0\u64CD\u4F5C\uFF0C\u4F46 shell \u7684\u54F2\u5B66\u4E4B\u4E00\u4FBF\u662F\u5BFB\u627E\uFF08\u66F4\u597D\u7528\u7684\uFF09\u66FF\u4EE3\u65B9\u6848\u3002\n\u8BB0\u4F4F\uFF0Cshell \u6700\u597D\u7684\u7279\u6027\u5C31\u662F\u60A8\u53EA\u662F\u5728\u8C03\u7528\u7A0B\u5E8F\uFF0C\u56E0\u6B64\u60A8\u53EA\u8981\u627E\u5230\u5408\u9002\u7684\u66FF\u4EE3\u7A0B\u5E8F\u5373\u53EF\uFF08\u751A\u81F3\u81EA\u5DF1\u7F16\u5199\uFF09\u3002</p>\n<p>\u4F8B\u5982\uFF0C<a href="https://github.com/sharkdp/fd"><code>fd</code></a> \u5C31\u662F\u4E00\u4E2A\u66F4\u7B80\u5355\u3001\u66F4\u5FEB\u901F\u3001\u66F4\u53CB\u597D\u7684\u7A0B\u5E8F\uFF0C\u5B83\u53EF\u4EE5\u7528\u6765\u4F5C\u4E3A <code>find</code> \u7684\u66FF\u4EE3\u54C1\u3002\u5B83\u6709\u5F88\u591A\u4E0D\u9519\u7684\u9ED8\u8BA4\u8BBE\u7F6E\uFF0C\u4F8B\u5982\u8F93\u51FA\u7740\u8272\u3001\u9ED8\u8BA4\u652F\u6301\u6B63\u5219\u5339\u914D\u3001\u652F\u6301 unicode \u5E76\u4E14\u6211\u8BA4\u4E3A\u5B83\u7684\u8BED\u6CD5\u66F4\u7B26\u5408\u76F4\u89C9\u3002\u4EE5\u6A21\u5F0F <code>PATTERN</code> \u641C\u7D22\u7684\u8BED\u6CD5\u662F <code>fd PATTERN</code>\u3002</p>\n<p>\u5927\u591A\u6570\u4EBA\u90FD\u8BA4\u4E3A <code>find</code> \u548C <code>fd</code> \u5DF2\u7ECF\u5F88\u597D\u7528\u4E86\uFF0C\u4F46\u662F\u6709\u7684\u4EBA\u53EF\u80FD\u60F3\u77E5\u9053\uFF0C\u6211\u4EEC\u662F\u4E0D\u662F\u53EF\u4EE5\u6709\u66F4\u9AD8\u6548\u7684\u65B9\u6CD5\uFF0C\u4F8B\u5982\u4E0D\u8981\u6BCF\u6B21\u90FD\u641C\u7D22\u6587\u4EF6\u800C\u662F\u901A\u8FC7\u7F16\u8BD1\u7D22\u5F15\u6216\u5EFA\u7ACB\u6570\u636E\u5E93\u7684\u65B9\u5F0F\u6765\u5B9E\u73B0\u66F4\u52A0\u5FEB\u901F\u5730\u641C\u7D22\u3002</p>\n<p>\u8FD9\u5C31\u8981\u9760 <a href="https://man7.org/linux/man-pages/man1/locate.1.html"><code>locate</code></a> \u4E86\u3002\n<code>locate</code> \u4F7F\u7528\u4E00\u4E2A\u7531 <a href="https://man7.org/linux/man-pages/man1/updatedb.1.html"><code>updatedb</code></a> \u8D1F\u8D23\u66F4\u65B0\u7684\u6570\u636E\u5E93\uFF0C\u5728\u5927\u591A\u6570\u7CFB\u7EDF\u4E2D <code>updatedb</code> \u90FD\u4F1A\u901A\u8FC7 <a href="https://man7.org/linux/man-pages/man8/cron.8.html"><code>cron</code></a> \u6BCF\u65E5\u66F4\u65B0\u3002\u8FD9\u4FBF\u9700\u8981\u6211\u4EEC\u5728\u901F\u5EA6\u548C\u65F6\u6548\u6027\u4E4B\u95F4\u4F5C\u51FA\u6743\u8861\u3002\u800C\u4E14\uFF0C<code>find</code> \u548C\u7C7B\u4F3C\u7684\u5DE5\u5177\u53EF\u4EE5\u901A\u8FC7\u522B\u7684\u5C5E\u6027\u6BD4\u5982\u6587\u4EF6\u5927\u5C0F\u3001\u4FEE\u6539\u65F6\u95F4\u6216\u662F\u6743\u9650\u6765\u67E5\u627E\u6587\u4EF6\uFF0C<code>locate</code> \u5219\u53EA\u80FD\u901A\u8FC7\u6587\u4EF6\u540D\u3002 <a href="https://unix.stackexchange.com/questions/60205/locate-vs-find-usage-pros-and-cons-of-each-other">\u8FD9\u91CC</a> \u6709\u4E00\u4E2A\u66F4\u8BE6\u7EC6\u7684\u5BF9\u6BD4\u3002</p>\n<h2>\u67E5\u627E\u4EE3\u7801</h2>\n<p>\u67E5\u627E\u6587\u4EF6\u662F\u5F88\u6709\u7528\u7684\u6280\u80FD\uFF0C\u4F46\u662F\u5F88\u591A\u65F6\u5019\u60A8\u7684\u76EE\u6807\u5176\u5B9E\u662F\u67E5\u770B\u6587\u4EF6\u7684\u5185\u5BB9\u3002\u4E00\u4E2A\u6700\u5E38\u89C1\u7684\u573A\u666F\u662F\u60A8\u5E0C\u671B\u67E5\u627E\u5177\u6709\u67D0\u79CD\u6A21\u5F0F\u7684\u5168\u90E8\u6587\u4EF6\uFF0C\u5E76\u627E\u5B83\u4EEC\u7684\u4F4D\u7F6E\u3002</p>\n<p>\u4E3A\u4E86\u5B9E\u73B0\u8FD9\u4E00\u70B9\uFF0C\u5F88\u591A\u7C7B UNIX \u7684\u7CFB\u7EDF\u90FD\u63D0\u4F9B\u4E86 <a href="https://man7.org/linux/man-pages/man1/grep.1.html"><code>grep</code></a> \u547D\u4EE4\uFF0C\u5B83\u662F\u7528\u4E8E\u5BF9\u8F93\u5165\u6587\u672C\u8FDB\u884C\u5339\u914D\u7684\u901A\u7528\u5DE5\u5177\u3002\u5B83\u662F\u4E00\u4E2A\u975E\u5E38\u91CD\u8981\u7684 shell \u5DE5\u5177\uFF0C\u6211\u4EEC\u4F1A\u5728\u540E\u7EED\u7684\u6570\u636E\u6E05\u7406\u8BFE\u7A0B\u4E2D\u6DF1\u5165\u7684\u63A2\u8BA8\u5B83\u3002</p>\n<p><code>grep</code> \u6709\u5F88\u591A\u9009\u9879\uFF0C\u8FD9\u4E5F\u4F7F\u5B83\u6210\u4E3A\u4E00\u4E2A\u975E\u5E38\u5168\u80FD\u7684\u5DE5\u5177\u3002\u5176\u4E2D\u6211\u7ECF\u5E38\u4F7F\u7528\u7684\u6709 <code>-C</code> \uFF1A\u83B7\u53D6\u67E5\u627E\u7ED3\u679C\u7684\u4E0A\u4E0B\u6587\uFF08Context\uFF09\uFF1B<code>-v</code> \u5C06\u5BF9\u7ED3\u679C\u8FDB\u884C\u53CD\u9009\uFF08Invert\uFF09\uFF0C\u4E5F\u5C31\u662F\u8F93\u51FA\u4E0D\u5339\u914D\u7684\u7ED3\u679C\u3002\u4E3E\u4F8B\u6765\u8BF4\uFF0C <code>grep -C 5</code> \u4F1A\u8F93\u51FA\u5339\u914D\u7ED3\u679C\u524D\u540E\u4E94\u884C\u3002\u5F53\u9700\u8981\u641C\u7D22\u5927\u91CF\u6587\u4EF6\u7684\u65F6\u5019\uFF0C\u4F7F\u7528 <code>-R</code> \u4F1A\u9012\u5F52\u5730\u8FDB\u5165\u5B50\u76EE\u5F55\u5E76\u641C\u7D22\u6240\u6709\u7684\u6587\u672C\u6587\u4EF6\u3002</p>\n<p>\u4F46\u662F\uFF0C\u6211\u4EEC\u6709\u5F88\u591A\u529E\u6CD5\u53EF\u4EE5\u5BF9 <code>grep -R</code> \u8FDB\u884C\u6539\u8FDB\uFF0C\u4F8B\u5982\u4F7F\u5176\u5FFD\u7565 <code>.git</code> \u6587\u4EF6\u5939\uFF0C\u4F7F\u7528\u591A CPU \u7B49\u7B49\u3002</p>\n<p>\u56E0\u6B64\u4E5F\u51FA\u73B0\u4E86\u5F88\u591A\u5B83\u7684\u66FF\u4EE3\u54C1\uFF0C\u5305\u62EC <a href="https://beyondgrep.com/">ack</a>, <a href="https://github.com/ggreer/the_silver_searcher">ag</a> \u548C <a href="https://github.com/BurntSushi/ripgrep">rg</a>\u3002\u5B83\u4EEC\u90FD\u7279\u522B\u597D\u7528\uFF0C\u4F46\u662F\u529F\u80FD\u4E5F\u90FD\u5DEE\u4E0D\u591A\uFF0C\u6211\u6BD4\u8F83\u5E38\u7528\u7684\u662F ripgrep (<code>rg</code>) \uFF0C\u56E0\u4E3A\u5B83\u901F\u5EA6\u5FEB\uFF0C\u800C\u4E14\u7528\u6CD5\u975E\u5E38\u7B26\u5408\u76F4\u89C9\u3002\u4F8B\u5B50\u5982\u4E0B\uFF1A</p>\n<pre><code class="language-bash"># \u67E5\u627E\u6240\u6709\u4F7F\u7528\u4E86 requests \u5E93\u7684\u6587\u4EF6\nrg -t py &#39;import requests&#39;\n# \u67E5\u627E\u6240\u6709\u6CA1\u6709\u5199 shebang \u7684\u6587\u4EF6\uFF08\u5305\u542B\u9690\u85CF\u6587\u4EF6\uFF09\nrg -u --files-without-match &quot;^#\\!&quot;\n# \u67E5\u627E\u6240\u6709\u7684foo\u5B57\u7B26\u4E32\uFF0C\u5E76\u6253\u5370\u5176\u4E4B\u540E\u76845\u884C\nrg foo -A 5\n# \u6253\u5370\u5339\u914D\u7684\u7EDF\u8BA1\u4FE1\u606F\uFF08\u5339\u914D\u7684\u884C\u548C\u6587\u4EF6\u7684\u6570\u91CF\uFF09\nrg --stats PATTERN\n</code></pre>\n<p>\u4E0E <code>find</code>/<code>fd</code> \u4E00\u6837\uFF0C\u91CD\u8981\u7684\u662F\u4F60\u8981\u77E5\u9053\u6709\u4E9B\u95EE\u9898\u4F7F\u7528\u5408\u9002\u7684\u5DE5\u5177\u5C31\u4F1A\u8FCE\u5203\u800C\u89E3\uFF0C\u800C\u5177\u4F53\u9009\u62E9\u54EA\u4E2A\u5DE5\u5177\u5219\u4E0D\u662F\u90A3\u4E48\u91CD\u8981\u3002</p>\n<h2>\u67E5\u627E shell \u547D\u4EE4</h2>\n<p>\u76EE\u524D\u4E3A\u6B62\uFF0C\u6211\u4EEC\u5DF2\u7ECF\u5B66\u4E60\u4E86\u5982\u4F55\u67E5\u627E\u6587\u4EF6\u548C\u4EE3\u7801\uFF0C\u4F46\u968F\u7740\u4F60\u4F7F\u7528 shell \u7684\u65F6\u95F4\u8D8A\u6765\u8D8A\u4E45\uFF0C\u60A8\u53EF\u80FD\u60F3\u8981\u627E\u5230\u4E4B\u524D\u8F93\u5165\u8FC7\u7684\u67D0\u6761\u547D\u4EE4\u3002\u9996\u5148\uFF0C\u6309\u5411\u4E0A\u7684\u65B9\u5411\u952E\u4F1A\u663E\u793A\u4F60\u4F7F\u7528\u8FC7\u7684\u4E0A\u4E00\u6761\u547D\u4EE4\uFF0C\u7EE7\u7EED\u6309\u4E0A\u952E\u5219\u4F1A\u904D\u5386\u6574\u4E2A\u5386\u53F2\u8BB0\u5F55\u3002</p>\n<p><code>history</code> \u547D\u4EE4\u5141\u8BB8\u60A8\u4EE5\u7A0B\u5E8F\u5458\u7684\u65B9\u5F0F\u6765\u8BBF\u95EE shell \u4E2D\u8F93\u5165\u7684\u5386\u53F2\u547D\u4EE4\u3002\u8FD9\u4E2A\u547D\u4EE4\u4F1A\u5728\u6807\u51C6\u8F93\u51FA\u4E2D\u6253\u5370 shell \u4E2D\u7684\u5386\u53F2\u547D\u4EE4\u3002\u5982\u679C\u6211\u4EEC\u8981\u641C\u7D22\u5386\u53F2\u8BB0\u5F55\uFF0C\u5219\u53EF\u4EE5\u5229\u7528\u7BA1\u9053\u5C06\u8F93\u51FA\u7ED3\u679C\u4F20\u9012\u7ED9 <code>grep</code> \u8FDB\u884C\u6A21\u5F0F\u641C\u7D22\u3002\n<code>history | grep find</code> \u4F1A\u6253\u5370\u5305\u542B find \u5B50\u4E32\u7684\u547D\u4EE4\u3002</p>\n<p>\u5BF9\u4E8E\u5927\u591A\u6570\u7684 shell \u6765\u8BF4\uFF0C\u60A8\u53EF\u4EE5\u4F7F\u7528 <code>Ctrl+R</code> \u5BF9\u547D\u4EE4\u5386\u53F2\u8BB0\u5F55\u8FDB\u884C\u56DE\u6EAF\u641C\u7D22\u3002\u6572 <code>Ctrl+R</code> \u540E\u60A8\u53EF\u4EE5\u8F93\u5165\u5B50\u4E32\u6765\u8FDB\u884C\u5339\u914D\uFF0C\u67E5\u627E\u5386\u53F2\u547D\u4EE4\u884C\u3002</p>\n<p>\u53CD\u590D\u6309\u4E0B\u5C31\u4F1A\u5728\u6240\u6709\u641C\u7D22\u7ED3\u679C\u4E2D\u5FAA\u73AF\u3002\u5728 <a href="https://github.com/zsh-users/zsh-history-substring-search">zsh</a> \u4E2D\uFF0C\u4F7F\u7528\u65B9\u5411\u952E\u4E0A\u6216\u4E0B\u4E5F\u53EF\u4EE5\u5B8C\u6210\u8FD9\u9879\u5DE5\u4F5C\u3002</p>\n<p><code>Ctrl+R</code> \u53EF\u4EE5\u914D\u5408 <a href="https://github.com/junegunn/fzf/wiki/Configuring-shell-key-bindings#ctrl-r">fzf</a> \u4F7F\u7528\u3002<code>fzf</code> \u662F\u4E00\u4E2A\u901A\u7528\u7684\u6A21\u7CCA\u67E5\u627E\u5DE5\u5177\uFF0C\u5B83\u53EF\u4EE5\u548C\u5F88\u591A\u547D\u4EE4\u4E00\u8D77\u4F7F\u7528\u3002\u8FD9\u91CC\u6211\u4EEC\u53EF\u4EE5\u5BF9\u5386\u53F2\u547D\u4EE4\u8FDB\u884C\u6A21\u7CCA\u67E5\u627E\u5E76\u5C06\u7ED3\u679C\u4EE5\u8D4F\u5FC3\u60A6\u76EE\u7684\u683C\u5F0F\u8F93\u51FA\u3002</p>\n<p>\u53E6\u5916\u4E00\u4E2A\u548C\u5386\u53F2\u547D\u4EE4\u76F8\u5173\u7684\u6280\u5DE7\u6211\u559C\u6B22\u79F0\u4E4B\u4E3A <strong>\u57FA\u4E8E\u5386\u53F2\u7684\u81EA\u52A8\u8865\u5168</strong>\u3002\n\u8FD9\u4E00\u7279\u6027\u6700\u521D\u662F\u7531 <a href="https://fishshell.com/">fish</a> shell \u521B\u5EFA\u7684\uFF0C\u5B83\u53EF\u4EE5\u6839\u636E\u60A8\u6700\u8FD1\u4F7F\u7528\u8FC7\u7684\u5F00\u5934\u76F8\u540C\u7684\u547D\u4EE4\uFF0C\u52A8\u6001\u5730\u5BF9\u5F53\u524D\u7684 shell \u547D\u4EE4\u8FDB\u884C\u8865\u5168\u3002\u8FD9\u4E00\u529F\u80FD\u5728 <a href="https://github.com/zsh-users/zsh-autosuggestions">zsh</a> \u4E2D\u4E5F\u53EF\u4EE5\u4F7F\u7528\uFF0C\u5B83\u53EF\u4EE5\u6781\u5927\u7684\u63D0\u9AD8\u7528\u6237\u4F53\u9A8C\u3002</p>\n<p>\u4F60\u53EF\u4EE5\u4FEE\u6539 shell history \u7684\u884C\u4E3A\uFF0C\u4F8B\u5982\uFF0C\u5982\u679C\u5728\u547D\u4EE4\u7684\u5F00\u5934\u52A0\u4E0A\u4E00\u4E2A\u7A7A\u683C\uFF0C\u5B83\u5C31\u4E0D\u4F1A\u88AB\u52A0\u8FDB shell \u8BB0\u5F55\u4E2D\u3002\u5F53\u4F60\u8F93\u5165\u5305\u542B\u5BC6\u7801\u6216\u662F\u5176\u4ED6\u654F\u611F\u4FE1\u606F\u7684\u547D\u4EE4\u65F6\u4F1A\u7528\u5230\u8FD9\u4E00\u7279\u6027\u3002\n\u4E3A\u6B64\u4F60\u9700\u8981\u5728 <code>.bashrc</code> \u4E2D\u6DFB\u52A0 <code>HISTCONTROL=ignorespace</code> \u6216\u8005\u5411 <code>.zshrc</code> \u6DFB\u52A0 <code>setopt HIST_IGNORE_SPACE</code>\u3002\n\u5982\u679C\u4F60\u4E0D\u5C0F\u5FC3\u5FD8\u4E86\u5728\u524D\u9762\u52A0\u7A7A\u683C\uFF0C\u53EF\u4EE5\u901A\u8FC7\u7F16\u8F91 <code>.bash_history</code> \u6216 <code>.zhistory</code> \u6765\u624B\u52A8\u5730\u4ECE\u5386\u53F2\u8BB0\u5F55\u4E2D\u79FB\u9664\u90A3\u4E00\u9879\u3002</p>\n<h2>\u6587\u4EF6\u5939\u5BFC\u822A</h2>\n<p>\u4E4B\u524D\u5BF9\u6240\u6709\u64CD\u4F5C\u6211\u4EEC\u90FD\u9ED8\u8BA4\u4E00\u4E2A\u524D\u63D0\uFF0C\u5373\u60A8\u5DF2\u7ECF\u4F4D\u4E8E\u60F3\u8981\u6267\u884C\u547D\u4EE4\u7684\u76EE\u5F55\u4E0B\uFF0C\u4F46\u662F\u5982\u4F55\u624D\u80FD\u9AD8\u6548\u5730\u5728\u76EE\u5F55\u95F4\u968F\u610F\u5207\u6362\u5462\uFF1F\u6709\u5F88\u591A\u7B80\u4FBF\u7684\u65B9\u6CD5\u53EF\u4EE5\u505A\u5230\uFF0C\u6BD4\u5982\u8BBE\u7F6E alias\uFF0C\u4F7F\u7528 <a href="https://man7.org/linux/man-pages/man1/ln.1.html">ln -s</a> \u521B\u5EFA\u7B26\u53F7\u8FDE\u63A5\u7B49\u3002\u800C\u5F00\u53D1\u8005\u4EEC\u5DF2\u7ECF\u60F3\u5230\u4E86\u5F88\u591A\u66F4\u4E3A\u7CBE\u5999\u7684\u89E3\u51B3\u65B9\u6848\u3002</p>\n<p>\u7531\u4E8E\u672C\u8BFE\u7A0B\u7684\u76EE\u7684\u662F\u5C3D\u53EF\u80FD\u5BF9\u4F60\u7684\u65E5\u5E38\u4E60\u60EF\u8FDB\u884C\u4F18\u5316\u3002\u56E0\u6B64\uFF0C\u6211\u4EEC\u53EF\u4EE5\u4F7F\u7528 <a href="https://github.com/clvv/fasd"><code>fasd</code></a> \u548C <a href="https://github.com/wting/autojump">autojump</a> \u8FD9\u4E24\u4E2A\u5DE5\u5177\u6765\u67E5\u627E\u6700\u5E38\u7528\u6216\u6700\u8FD1\u4F7F\u7528\u7684\u6587\u4EF6\u548C\u76EE\u5F55\u3002</p>\n<p>Fasd \u57FA\u4E8E <a href="https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Places/Frecency_algorithm"><em>frecency</em> </a> \u5BF9\u6587\u4EF6\u548C\u6587\u4EF6\u6392\u5E8F\uFF0C\u4E5F\u5C31\u662F\u8BF4\u5B83\u4F1A\u540C\u65F6\u9488\u5BF9\u9891\u7387\uFF08<em>frequency</em>\uFF09\u548C\u65F6\u6548\uFF08<em>recency</em>\uFF09\u8FDB\u884C\u6392\u5E8F\u3002\u9ED8\u8BA4\u60C5\u51B5\u4E0B\uFF0C<code>fasd</code> \u4F7F\u7528\u547D\u4EE4 <code>z</code> \u5E2E\u52A9\u6211\u4EEC\u5FEB\u901F\u5207\u6362\u5230\u6700\u5E38\u8BBF\u95EE\u7684\u76EE\u5F55\u3002\u4F8B\u5982\uFF0C \u5982\u679C\u60A8\u7ECF\u5E38\u8BBF\u95EE <code>/home/user/files/cool_project</code> \u76EE\u5F55\uFF0C\u90A3\u4E48\u53EF\u4EE5\u76F4\u63A5\u4F7F\u7528 <code>z cool</code> \u8DF3\u8F6C\u5230\u8BE5\u76EE\u5F55\u3002\u5BF9\u4E8E autojump\uFF0C\u5219\u4F7F\u7528 <code>j cool</code> \u4EE3\u66FF\u5373\u53EF\u3002</p>\n<p>\u8FD8\u6709\u4E00\u4E9B\u66F4\u590D\u6742\u7684\u5DE5\u5177\u53EF\u4EE5\u7528\u6765\u6982\u89C8\u76EE\u5F55\u7ED3\u6784\uFF0C\u4F8B\u5982 <a href="https://linux.die.net/man/1/tree"><code>tree</code></a>, <a href="https://github.com/Canop/broot"><code>broot</code></a> \u6216\u66F4\u52A0\u5B8C\u6574\u7684\u6587\u4EF6\u7BA1\u7406\u5668\uFF0C\u4F8B\u5982 <a href="https://github.com/jarun/nnn"><code>nnn</code></a> \u6216 <a href="https://github.com/ranger/ranger"><code>ranger</code></a>\u3002</p>\n'
    }
  ],
  tags: {
    \u8BA1\u7B97\u673A\u57FA\u7840: [
      "command-line",
      "Git\u4F7F\u7528\u5165\u95E8",
      "markdown",
      "Python_Manage",
      "Shell",
      "Shell_tool"
    ]
  }
};

// src/index.tsx
var manifest = content_default;
var app = new Hono2();
var POSTS_PER_PAGE = 5;
app.get("/", (c) => {
  const page = 1;
  const posts = manifest.posts.slice(0, POSTS_PER_PAGE);
  const totalPages = Math.ceil(manifest.posts.length / POSTS_PER_PAGE);
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "\u9996\u9875", children: [
      /* @__PURE__ */ jsxDEV("div", { class: "posts-list", children: posts.map((post) => /* @__PURE__ */ jsxDEV(PostCard, { post })) }),
      totalPages > 1 && /* @__PURE__ */ jsxDEV("div", { class: "pagination", children: [
        /* @__PURE__ */ jsxDEV("span", { children: [
          "\u7B2C ",
          page,
          " \u9875 / \u5171 ",
          totalPages,
          " \u9875"
        ] }),
        /* @__PURE__ */ jsxDEV("a", { href: "/page/2", children: "\u4E0B\u4E00\u9875 \xBB" })
      ] })
    ] })
  );
});
app.get("/page/:page", (c) => {
  const page = parseInt(c.req.param("page")) || 1;
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const posts = manifest.posts.slice(start, end);
  const totalPages = Math.ceil(manifest.posts.length / POSTS_PER_PAGE);
  if (posts.length === 0)
    return c.redirect("/");
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: `\u7B2C ${page} \u9875`, children: [
      /* @__PURE__ */ jsxDEV("h2", { children: [
        "\u5F52\u6863 - \u7B2C ",
        page,
        " \u9875"
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "posts-list", children: posts.map((post) => /* @__PURE__ */ jsxDEV(PostCard, { post })) }),
      /* @__PURE__ */ jsxDEV("div", { class: "pagination", children: [
        page > 1 && /* @__PURE__ */ jsxDEV("a", { href: `/page/${page - 1}`, children: "\xAB \u4E0A\u4E00\u9875" }),
        /* @__PURE__ */ jsxDEV("span", { children: [
          " \u7B2C ",
          page,
          " \u9875 / \u5171 ",
          totalPages,
          " \u9875 "
        ] }),
        page < totalPages && /* @__PURE__ */ jsxDEV("a", { href: `/page/${page + 1}`, children: "\u4E0B\u4E00\u9875 \xBB" })
      ] })
    ] })
  );
});
app.get("/post/:slug", (c) => {
  const slug = c.req.param("slug");
  const post = manifest.posts.find((p) => p.slug === slug);
  if (!post)
    return c.notFound();
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: post.title, metaDescription: post.excerpt, children: /* @__PURE__ */ jsxDEV("article", { children: [
      /* @__PURE__ */ jsxDEV("h2", { children: post.title }),
      /* @__PURE__ */ jsxDEV("div", { class: "article-meta", children: [
        "\u53D1\u5E03\u4E8E: ",
        new Date(post.date).toLocaleDateString(),
        post.tags && /* @__PURE__ */ jsxDEV("span", { children: [
          " | \u6807\u7B7E: ",
          post.tags.map((t) => /* @__PURE__ */ jsxDEV("a", { href: `/tag/${t}`, children: t }))
        ] })
      ] }),
      post.featured_image && /* @__PURE__ */ jsxDEV("img", { src: post.featured_image, alt: post.title, style: "max-width: 100%; margin: 1em 0;" }),
      /* @__PURE__ */ jsxDEV("div", { class: "article-content", dangerouslySetInnerHTML: { __html: post.content } })
    ] }) })
  );
});
app.get("/tag/:tag", (c) => {
  const tag = c.req.param("tag");
  const slugs = manifest.tags[tag] || [];
  const posts = manifest.posts.filter((p) => slugs.includes(p.slug));
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: `\u6807\u7B7E: ${tag}`, children: [
      /* @__PURE__ */ jsxDEV("h2", { children: [
        '\u6807\u7B7E "',
        tag,
        '" \u4E0B\u7684\u6587\u7AE0'
      ] }),
      /* @__PURE__ */ jsxDEV("div", { class: "posts-list", children: posts.map((post) => /* @__PURE__ */ jsxDEV(PostCard, { post })) })
    ] })
  );
});
app.get("/tags", (c) => {
  const tags = Object.keys(manifest.tags);
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: "\u6240\u6709\u6807\u7B7E", children: [
      /* @__PURE__ */ jsxDEV("h2", { children: "\u6240\u6709\u6807\u7B7E" }),
      /* @__PURE__ */ jsxDEV("ul", { children: tags.map((tag) => /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: `/tag/${tag}`, children: [
        tag,
        " (",
        manifest.tags[tag].length,
        ")"
      ] }) })) })
    ] })
  );
});
app.get("/search", (c) => {
  const query = c.req.query("q")?.toLowerCase() || "";
  const posts = manifest.posts.filter(
    (p) => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query) || p.tags.some((t) => t.toLowerCase().includes(query))
  );
  return c.html(
    /* @__PURE__ */ jsxDEV(Layout, { title: `\u641C\u7D22: ${query}`, children: [
      /* @__PURE__ */ jsxDEV("h2", { children: [
        '"',
        query,
        '" \u7684\u641C\u7D22\u7ED3\u679C'
      ] }),
      posts.length === 0 ? /* @__PURE__ */ jsxDEV("p", { children: "\u6CA1\u6709\u627E\u5230\u76F8\u5173\u6587\u7AE0\u3002" }) : /* @__PURE__ */ jsxDEV("div", { class: "posts-list", children: posts.map((post) => /* @__PURE__ */ jsxDEV(PostCard, { post })) })
    ] })
  );
});
var src_default = app;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-CxR2uj/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-CxR2uj/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
