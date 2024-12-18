import tt from "lodash";
import "zustand";
import Fe from "react";
import "immer";
var Mr = Object.defineProperty;
var Vr = (t, e, i) => e in t ? Mr(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i;
var he = (t, e, i) => (Vr(t, typeof e != "symbol" ? e + "" : e, i), i);
const Hr = {
  TEXT: "text",
  CHECKBOX: "checkbox",
  SLIDER: "slider",
  SELECT: "select",
  CHILDREN_ID: "children_id",
  PARENT_ID: "parent_id",
  ATTRIBUTES: "attributes",
  VISIBILITY: "visibility",
  ACTION: "action",
  STYLES: "styles",
  MODIFIER: "modifier",
  CSS_CODE: "css_code",
  IMAGE_PICKER: "image_picker",
  IMAGES_PICKER: "images_picker",
  VIDEO_PICKER: "video_picker",
  VIDEOS_PICKER: "videos_picker",
  FONT_PICKER: "font_picker",
  COLLECTION_PICKER: "collection_picker",
  COLLECTION_LIST: "collection_list",
  PRODUCT_PICKER: "product_picker",
  PRODUCT_LIST: "product_list",
  PAGE_PICKER: "page_picker",
  BLOG_PICKER: "blog_picker",
  ARTICLE_PICKER: "article_picker",
  COLOR: "color",
  VIDEO_URL: "video_url",
  BUTTON_GROUP: "button_group",
  LIQUID: "liquid",
  ICON_PICKER: "icon_picker",
  RICH_TEXT: "rich_text",
  SWITCH: "switch",
  GRID_AREA: "grid_area",
  TABLE: "table",
  DATE_PICKER: "date_picker",
  KEYFRAMES: "keyframes",
  SCREEN_PICKER: "screen_picker",
  MEGA_MENU: "mega_menu",
  NAVIGATION: "navigation",
  NAVIGATION_HAMBURGER: "navigation_hamburger",
  MENU: "menu",
  CAROUSEL_ID: "carousel_id",
  PRESET: "preset",
  DESIGN_SYNC: "design_sync"
};
var rt;
(function(t) {
  t.ELEMENTS = "https://preview.builder.xotiny.com/_elements", t[t.VERSION = 1026] = "VERSION";
})(rt || (rt = {}));
var nr;
(function(t) {
  t.All = "all", t.ArtCrafts = "artCrafts", t.Clothing = "clothing", t.Electronics = "electronics", t.Food = "food", t.Furniture = "furniture", t.Health = "health";
})(nr || (nr = {}));
var Gt;
(function(t) {
  t.AnnouncementBar = "Announcement bar", t.Brands = "Brands", t.BrandsStory = "Brand story", t.CallToAction = "Call to action", t.Collections = "Collections", t.Compare = "Compare", t.Contact = "Contact", t.CounterProgress = "Counter / progress", t.FAQs = "FAQs", t.Features = "Features", t.FeaturedProducts = "Featured products", t.Footer = "Footer", t.FreeShipping = "Free shipping", t.GalleryVideo = "Gallery / video", t.Header = "Header", t.Hero = "Hero", t.HistorySteps = "History / steps", t.PricingTable = "Pricing table", t.Products = "Products", t.Team = "Team", t.Testimonials = "Testimonials", t.TrustedBadges = "Trusted badges", t.Others = "Others";
})(Gt || (Gt = {}));
const Wr = (t) => t.charAt(0).toUpperCase() + t.slice(1);
Object.entries(Gt).map(([t, e]) => ({ label: Wr(e), value: e }));
JSON.stringify(["Image"]), JSON.stringify(["Image"]), JSON.stringify({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {
    count_from: {
      type: "number"
    },
    count_to: {
      type: "number"
    },
    prefixText: {
      type: "string"
    },
    suffixText: {
      type: "string"
    }
  },
  required: ["count_from", "count_to", "prefixText", "suffixText"],
  additionalProperties: !1
}), JSON.stringify(["Image"]), JSON.stringify({
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "array",
  items: {
    type: "object",
    properties: {
      title: {
        type: "string"
      },
      description: {
        type: "string"
      }
    },
    required: ["title", "description"],
    additionalProperties: !1
  }
});
var Ur = Object.defineProperty, zr = (t, e, i) => e in t ? Ur(t, e, { enumerable: !0, configurable: !0, writable: !0, value: i }) : t[e] = i, K = (t, e, i) => (zr(t, typeof e != "symbol" ? e + "" : e, i), i);
let or = !1;
const Ye = /* @__PURE__ */ new Map(), Kr = () => {
  if (!or) {
    or = !0;
    const t = "@localStorageCheck";
    try {
      return window.localStorage.setItem(t, t), window.localStorage.removeItem(t), !0;
    } catch {
      return !1;
    }
  }
}, qr = () => Kr() ? window.localStorage : {
  getItem(t) {
    var e;
    return (e = Ye.get(t)) != null ? e : null;
  },
  setItem(t, e) {
    Ye.set(t, e);
  },
  removeItem(t) {
    Ye.delete(t);
  },
  clear() {
    Ye.clear();
  },
  key(t) {
    return Array.from(Ye.keys())[t];
  },
  length: 0
};
qr();
class bt {
}
K(bt, "toCapitalize", (t) => t.replace(/(^|\s)(\w)/g, (e, i, c) => `${i}${c.toUpperCase()}`)), K(bt, "toFirstLetter", (t) => t.charAt(0).toUpperCase() + t.toLowerCase().slice(1)), K(bt, "toUpperCase", (t) => t.toUpperCase()), K(bt, "toLowerCase", (t) => t.toLowerCase());
const Yt = (t) => Object.entries(t);
class kt {
  constructor() {
    K(this, "id"), K(this, "events"), this.id = 0, this.events = {};
  }
  getEvents() {
    return this.events;
  }
  on(e, i) {
    var c;
    return this.id++, this.events = {
      ...this.events,
      [e]: [
        ...((c = this.events) == null ? void 0 : c[e]) || [],
        {
          listener: i,
          id: this.id
        }
      ]
    }, this.id;
  }
  once(e, i) {
    return this.events[e] ? this.events[e][0].id : (this.id++, this.events = {
      ...this.events,
      [e]: [
        {
          listener: i,
          id: this.id
        }
      ]
    }, this.id);
  }
  off(e) {
    this.events && Yt(this.events).forEach(([i, c]) => {
      this.events = {
        ...this.events,
        [i]: c.filter((d) => d.id !== e)
      };
    });
  }
  emit(e, i) {
    this.events[e] && this.events[e].forEach(({ listener: c }) => {
      c(i);
    });
  }
}
function ir(t, e) {
  for (let i = 0; i < t.length; i++)
    e(t[i], i, t);
}
class Gr {
  constructor() {
    K(this, "frameId"), K(this, "keepAliveFrameId"), K(this, "lastTimestamp"), K(this, "frames"), K(this, "keepAliveFrames"), K(this, "defaultTimestep"), K(this, "handleFrameLoop", (e) => {
      if (this.lastTimestamp) {
        const i = e - this.lastTimestamp;
        ir(this.keepAliveFrames, (c) => c.call(this, { delta: i, timestamp: e }));
      }
      this.lastTimestamp = e, this.keepAliveFrameId && cancelAnimationFrame(this.keepAliveFrameId), this.keepAliveFrameId = requestAnimationFrame(this.handleFrameLoop);
    }), K(this, "handleFrame", (e) => {
      ir(this.frames, (i) => i.call(this, { delta: this.defaultTimestep, timestamp: e }));
    }), K(this, "getFrames", () => this.frames), K(this, "add", (e, i = !1) => (this.cancelFrame(), this.frames.includes(e) || this.frames.push(e), i && !this.keepAliveFrames.includes(e) && this.keepAliveFrames.push(e), this.start(), this)), K(this, "start", () => {
      this.frameId = requestAnimationFrame(this.handleFrame), this.keepAliveFrameId = requestAnimationFrame(this.handleFrameLoop);
    }), K(this, "cancelFrame", () => {
      this.frameId != null && (cancelAnimationFrame(this.frameId), this.frameId = null), this.keepAliveFrameId != null && (cancelAnimationFrame(this.keepAliveFrameId), this.keepAliveFrameId = null);
    }), K(this, "stopFrame", (e, i) => {
      const c = e.indexOf(i);
      c !== -1 && e.splice(c, 1), e.length === 0 && (this.cancelFrame(), this.lastTimestamp = null);
    }), K(this, "remove", (e) => (this.stopFrame(this.frames, e), this.stopFrame(this.keepAliveFrames, e), this)), K(this, "clear", () => (this.frames = [], this.keepAliveFrames = [], this.cancelFrame(), this.lastTimestamp = null, this)), this.frameId = null, this.keepAliveFrameId = null, this.lastTimestamp = null, this.frames = [], this.keepAliveFrames = [], this.defaultTimestep = 1 / 60 * 1e3;
  }
}
new Gr();
function Jt() {
  return typeof document < "u";
}
const Sr = (t) => Object.keys(t), Jr = (t) => Object.values(t);
function Xr(t) {
  const e = t.trim();
  if (/^{|\[/g.test(e))
    try {
      const i = new Function(`return ${e}`)();
      return JSON.parse(JSON.stringify(i));
    } catch {
      return /^\[/g.test(e) ? [] : {};
    }
  else
    return {};
}
var yt = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function Qr(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var Er = { exports: {} }, zt = {}, ar = { exports: {} }, Kt = {};
/**
 * @license React
 * use-sync-external-store-shim.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lr;
function Yr() {
  if (lr)
    return Kt;
  lr = 1;
  var t = Fe;
  function e(f, v) {
    return f === v && (f !== 0 || 1 / f === 1 / v) || f !== f && v !== v;
  }
  var i = typeof Object.is == "function" ? Object.is : e, c = t.useState, d = t.useEffect, h = t.useLayoutEffect, x = t.useDebugValue;
  function b(f, v) {
    var N = v(), C = c({ inst: { value: N, getSnapshot: v } }), L = C[0].inst, j = C[1];
    return h(function() {
      L.value = N, L.getSnapshot = v, $(L) && j({ inst: L });
    }, [f, N, v]), d(function() {
      return $(L) && j({ inst: L }), f(function() {
        $(L) && j({ inst: L });
      });
    }, [f]), x(N), N;
  }
  function $(f) {
    var v = f.getSnapshot;
    f = f.value;
    try {
      var N = v();
      return !i(f, N);
    } catch {
      return !0;
    }
  }
  function O(f, v) {
    return v();
  }
  var m = typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u" ? O : b;
  return Kt.useSyncExternalStore = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : m, Kt;
}
var sr = {};
/**
 * @license React
 * use-sync-external-store-shim.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ur;
function Zr() {
  return ur || (ur = 1, process.env.NODE_ENV !== "production" && function() {
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
    var t = Fe, e = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function i(M) {
      {
        for (var D = arguments.length, g = new Array(D > 1 ? D - 1 : 0), R = 1; R < D; R++)
          g[R - 1] = arguments[R];
        c("error", M, g);
      }
    }
    function c(M, D, g) {
      {
        var R = e.ReactDebugCurrentFrame, E = R.getStackAddendum();
        E !== "" && (D += "%s", g = g.concat([E]));
        var F = g.map(function(T) {
          return String(T);
        });
        F.unshift("Warning: " + D), Function.prototype.apply.call(console[M], console, F);
      }
    }
    function d(M, D) {
      return M === D && (M !== 0 || 1 / M === 1 / D) || M !== M && D !== D;
    }
    var h = typeof Object.is == "function" ? Object.is : d, x = t.useState, b = t.useEffect, $ = t.useLayoutEffect, O = t.useDebugValue, m = !1, f = !1;
    function v(M, D, g) {
      m || t.startTransition !== void 0 && (m = !0, i("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release."));
      var R = D();
      if (!f) {
        var E = D();
        h(R, E) || (i("The result of getSnapshot should be cached to avoid an infinite loop"), f = !0);
      }
      var F = x({
        inst: {
          value: R,
          getSnapshot: D
        }
      }), T = F[0].inst, q = F[1];
      return $(function() {
        T.value = R, T.getSnapshot = D, N(T) && q({
          inst: T
        });
      }, [M, R, D]), b(function() {
        N(T) && q({
          inst: T
        });
        var U = function() {
          N(T) && q({
            inst: T
          });
        };
        return M(U);
      }, [M]), O(R), R;
    }
    function N(M) {
      var D = M.getSnapshot, g = M.value;
      try {
        var R = D();
        return !h(g, R);
      } catch {
        return !0;
      }
    }
    function C(M, D, g) {
      return D();
    }
    var L = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", j = !L, B = j ? C : v, S = t.useSyncExternalStore !== void 0 ? t.useSyncExternalStore : B;
    sr.useSyncExternalStore = S, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  }()), sr;
}
var cr;
function kr() {
  return cr || (cr = 1, function(t) {
    process.env.NODE_ENV === "production" ? t.exports = Yr() : t.exports = Zr();
  }(ar)), ar.exports;
}
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fr;
function en() {
  if (fr)
    return zt;
  fr = 1;
  var t = Fe, e = kr();
  function i(O, m) {
    return O === m && (O !== 0 || 1 / O === 1 / m) || O !== O && m !== m;
  }
  var c = typeof Object.is == "function" ? Object.is : i, d = e.useSyncExternalStore, h = t.useRef, x = t.useEffect, b = t.useMemo, $ = t.useDebugValue;
  return zt.useSyncExternalStoreWithSelector = function(O, m, f, v, N) {
    var C = h(null);
    if (C.current === null) {
      var L = { hasValue: !1, value: null };
      C.current = L;
    } else
      L = C.current;
    C = b(function() {
      function B(R) {
        if (!S) {
          if (S = !0, M = R, R = v(R), N !== void 0 && L.hasValue) {
            var E = L.value;
            if (N(E, R))
              return D = E;
          }
          return D = R;
        }
        if (E = D, c(M, R))
          return E;
        var F = v(R);
        return N !== void 0 && N(E, F) ? E : (M = R, D = F);
      }
      var S = !1, M, D, g = f === void 0 ? null : f;
      return [function() {
        return B(m());
      }, g === null ? void 0 : function() {
        return B(g());
      }];
    }, [m, f, v, N]);
    var j = d(O, C[0], C[1]);
    return x(function() {
      L.hasValue = !0, L.value = j;
    }, [j]), $(j), j;
  }, zt;
}
var dr = {};
/**
 * @license React
 * use-sync-external-store-shim/with-selector.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var pr;
function tn() {
  return pr || (pr = 1, process.env.NODE_ENV !== "production" && function() {
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
    var t = Fe, e = kr();
    function i(m, f) {
      return m === f && (m !== 0 || 1 / m === 1 / f) || m !== m && f !== f;
    }
    var c = typeof Object.is == "function" ? Object.is : i, d = e.useSyncExternalStore, h = t.useRef, x = t.useEffect, b = t.useMemo, $ = t.useDebugValue;
    function O(m, f, v, N, C) {
      var L = h(null), j;
      L.current === null ? (j = {
        hasValue: !1,
        value: null
      }, L.current = j) : j = L.current;
      var B = b(function() {
        var g = !1, R, E, F = function(Y) {
          if (!g) {
            g = !0, R = Y;
            var J = N(Y);
            if (C !== void 0 && j.hasValue) {
              var ne = j.value;
              if (C(ne, J))
                return E = ne, ne;
            }
            return E = J, J;
          }
          var se = R, ue = E;
          if (c(se, Y))
            return ue;
          var le = N(Y);
          return C !== void 0 && C(ue, le) ? ue : (R = Y, E = le, le);
        }, T = v === void 0 ? null : v, q = function() {
          return F(f());
        }, U = T === null ? void 0 : function() {
          return F(T());
        };
        return [q, U];
      }, [f, v, N, C]), S = B[0], M = B[1], D = d(m, S, M);
      return x(function() {
        j.hasValue = !0, j.value = D;
      }, [D]), $(D), D;
    }
    dr.useSyncExternalStoreWithSelector = O, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  }()), dr;
}
(function(t) {
  process.env.NODE_ENV === "production" ? t.exports = en() : t.exports = tn();
})(Er);
Er.exports;
function rn(t) {
  let e = t;
  return /<!--/g.test(e) && (e = e.replace(/<!--([\s\S]*?)-->/g, "")), /{%\s+comment\s+%}/g.test(e) && (e = e.replace(/{%\s+comment\s+%}([\s\S]*?){%\s+endcomment\s+%}/g, "")), e;
}
function nn(t = "") {
  return /{%|{{/g.test(rn(t));
}
function Or(...t) {
  const e = " ";
  return t.join(e).replace("undefined", "").replace(/\s+/g, e).trim();
}
function on(t) {
  let e = 5381, i = t.length;
  for (; i; )
    e = e * 33 ^ t.charCodeAt(--i);
  return e >>> 0;
}
function an(t, e = !1) {
  if (!Jt())
    return {};
  const i = e ? {} : [], c = new URLSearchParams(t);
  return Array.from(c.entries()).forEach((d) => {
    if (e) {
      const [h, x] = d;
      i[h] = x;
    } else
      i.push([d[0], d[1]]);
  }), i;
}
function ln(t) {
  return new URLSearchParams(t).toString().replace(/&/g, `&
`).replace(/\w.*=&?$/gm, "").replace(/\n+/g, "").replace(/&$/g, "");
}
const sn = {
  parse: an,
  stringify: ln
};
class vr extends Error {
  constructor(e, i, c) {
    super(e), K(this, "errors"), K(this, "code"), K(this, "rawError"), this.code = i, this.errors = e, this.rawError = c;
  }
}
function _t(t) {
  throw new Error('Could not dynamically require "' + t + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var Ir = { exports: {} };
/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
(function(t, e) {
  (function(i) {
    t.exports = i();
  })(function() {
    return function i(c, d, h) {
      function x(O, m) {
        if (!d[O]) {
          if (!c[O]) {
            var f = typeof _t == "function" && _t;
            if (!m && f)
              return f(O, !0);
            if (b)
              return b(O, !0);
            var v = new Error("Cannot find module '" + O + "'");
            throw v.code = "MODULE_NOT_FOUND", v;
          }
          var N = d[O] = { exports: {} };
          c[O][0].call(N.exports, function(C) {
            var L = c[O][1][C];
            return x(L || C);
          }, N, N.exports, i, c, d, h);
        }
        return d[O].exports;
      }
      for (var b = typeof _t == "function" && _t, $ = 0; $ < h.length; $++)
        x(h[$]);
      return x;
    }({ 1: [function(i, c, d) {
      (function(h) {
        var x = h.MutationObserver || h.WebKitMutationObserver, b;
        if (x) {
          var $ = 0, O = new x(C), m = h.document.createTextNode("");
          O.observe(m, {
            characterData: !0
          }), b = function() {
            m.data = $ = ++$ % 2;
          };
        } else if (!h.setImmediate && typeof h.MessageChannel < "u") {
          var f = new h.MessageChannel();
          f.port1.onmessage = C, b = function() {
            f.port2.postMessage(0);
          };
        } else
          "document" in h && "onreadystatechange" in h.document.createElement("script") ? b = function() {
            var j = h.document.createElement("script");
            j.onreadystatechange = function() {
              C(), j.onreadystatechange = null, j.parentNode.removeChild(j), j = null;
            }, h.document.documentElement.appendChild(j);
          } : b = function() {
            setTimeout(C, 0);
          };
        var v, N = [];
        function C() {
          v = !0;
          for (var j, B, S = N.length; S; ) {
            for (B = N, N = [], j = -1; ++j < S; )
              B[j]();
            S = N.length;
          }
          v = !1;
        }
        c.exports = L;
        function L(j) {
          N.push(j) === 1 && !v && b();
        }
      }).call(this, typeof yt < "u" ? yt : typeof self < "u" ? self : typeof window < "u" ? window : {});
    }, {}], 2: [function(i, c, d) {
      var h = i(1);
      function x() {
      }
      var b = {}, $ = ["REJECTED"], O = ["FULFILLED"], m = ["PENDING"];
      c.exports = f;
      function f(g) {
        if (typeof g != "function")
          throw new TypeError("resolver must be a function");
        this.state = m, this.queue = [], this.outcome = void 0, g !== x && L(this, g);
      }
      f.prototype.catch = function(g) {
        return this.then(null, g);
      }, f.prototype.then = function(g, R) {
        if (typeof g != "function" && this.state === O || typeof R != "function" && this.state === $)
          return this;
        var E = new this.constructor(x);
        if (this.state !== m) {
          var F = this.state === O ? g : R;
          N(E, F, this.outcome);
        } else
          this.queue.push(new v(E, g, R));
        return E;
      };
      function v(g, R, E) {
        this.promise = g, typeof R == "function" && (this.onFulfilled = R, this.callFulfilled = this.otherCallFulfilled), typeof E == "function" && (this.onRejected = E, this.callRejected = this.otherCallRejected);
      }
      v.prototype.callFulfilled = function(g) {
        b.resolve(this.promise, g);
      }, v.prototype.otherCallFulfilled = function(g) {
        N(this.promise, this.onFulfilled, g);
      }, v.prototype.callRejected = function(g) {
        b.reject(this.promise, g);
      }, v.prototype.otherCallRejected = function(g) {
        N(this.promise, this.onRejected, g);
      };
      function N(g, R, E) {
        h(function() {
          var F;
          try {
            F = R(E);
          } catch (T) {
            return b.reject(g, T);
          }
          F === g ? b.reject(g, new TypeError("Cannot resolve promise with itself")) : b.resolve(g, F);
        });
      }
      b.resolve = function(g, R) {
        var E = j(C, R);
        if (E.status === "error")
          return b.reject(g, E.value);
        var F = E.value;
        if (F)
          L(g, F);
        else {
          g.state = O, g.outcome = R;
          for (var T = -1, q = g.queue.length; ++T < q; )
            g.queue[T].callFulfilled(R);
        }
        return g;
      }, b.reject = function(g, R) {
        g.state = $, g.outcome = R;
        for (var E = -1, F = g.queue.length; ++E < F; )
          g.queue[E].callRejected(R);
        return g;
      };
      function C(g) {
        var R = g && g.then;
        if (g && (typeof g == "object" || typeof g == "function") && typeof R == "function")
          return function() {
            R.apply(g, arguments);
          };
      }
      function L(g, R) {
        var E = !1;
        function F(Y) {
          E || (E = !0, b.reject(g, Y));
        }
        function T(Y) {
          E || (E = !0, b.resolve(g, Y));
        }
        function q() {
          R(T, F);
        }
        var U = j(q);
        U.status === "error" && F(U.value);
      }
      function j(g, R) {
        var E = {};
        try {
          E.value = g(R), E.status = "success";
        } catch (F) {
          E.status = "error", E.value = F;
        }
        return E;
      }
      f.resolve = B;
      function B(g) {
        return g instanceof this ? g : b.resolve(new this(x), g);
      }
      f.reject = S;
      function S(g) {
        var R = new this(x);
        return b.reject(R, g);
      }
      f.all = M;
      function M(g) {
        var R = this;
        if (Object.prototype.toString.call(g) !== "[object Array]")
          return this.reject(new TypeError("must be an array"));
        var E = g.length, F = !1;
        if (!E)
          return this.resolve([]);
        for (var T = new Array(E), q = 0, U = -1, Y = new this(x); ++U < E; )
          J(g[U], U);
        return Y;
        function J(ne, se) {
          R.resolve(ne).then(ue, function(le) {
            F || (F = !0, b.reject(Y, le));
          });
          function ue(le) {
            T[se] = le, ++q === E && !F && (F = !0, b.resolve(Y, T));
          }
        }
      }
      f.race = D;
      function D(g) {
        var R = this;
        if (Object.prototype.toString.call(g) !== "[object Array]")
          return this.reject(new TypeError("must be an array"));
        var E = g.length, F = !1;
        if (!E)
          return this.resolve([]);
        for (var T = -1, q = new this(x); ++T < E; )
          U(g[T]);
        return q;
        function U(Y) {
          R.resolve(Y).then(function(J) {
            F || (F = !0, b.resolve(q, J));
          }, function(J) {
            F || (F = !0, b.reject(q, J));
          });
        }
      }
    }, { 1: 1 }], 3: [function(i, c, d) {
      (function(h) {
        typeof h.Promise != "function" && (h.Promise = i(2));
      }).call(this, typeof yt < "u" ? yt : typeof self < "u" ? self : typeof window < "u" ? window : {});
    }, { 2: 2 }], 4: [function(i, c, d) {
      var h = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(r) {
        return typeof r;
      } : function(r) {
        return r && typeof Symbol == "function" && r.constructor === Symbol && r !== Symbol.prototype ? "symbol" : typeof r;
      };
      function x(r, n) {
        if (!(r instanceof n))
          throw new TypeError("Cannot call a class as a function");
      }
      function b() {
        try {
          if (typeof indexedDB < "u")
            return indexedDB;
          if (typeof webkitIndexedDB < "u")
            return webkitIndexedDB;
          if (typeof mozIndexedDB < "u")
            return mozIndexedDB;
          if (typeof OIndexedDB < "u")
            return OIndexedDB;
          if (typeof msIndexedDB < "u")
            return msIndexedDB;
        } catch {
          return;
        }
      }
      var $ = b();
      function O() {
        try {
          if (!$ || !$.open)
            return !1;
          var r = typeof openDatabase < "u" && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform), n = typeof fetch == "function" && fetch.toString().indexOf("[native code") !== -1;
          return (!r || n) && typeof indexedDB < "u" && typeof IDBKeyRange < "u";
        } catch {
          return !1;
        }
      }
      function m(r, n) {
        r = r || [], n = n || {};
        try {
          return new Blob(r, n);
        } catch (u) {
          if (u.name !== "TypeError")
            throw u;
          for (var o = typeof BlobBuilder < "u" ? BlobBuilder : typeof MSBlobBuilder < "u" ? MSBlobBuilder : typeof MozBlobBuilder < "u" ? MozBlobBuilder : WebKitBlobBuilder, s = new o(), l = 0; l < r.length; l += 1)
            s.append(r[l]);
          return s.getBlob(n.type);
        }
      }
      typeof Promise > "u" && i(3);
      var f = Promise;
      function v(r, n) {
        n && r.then(function(o) {
          n(null, o);
        }, function(o) {
          n(o);
        });
      }
      function N(r, n, o) {
        typeof n == "function" && r.then(n), typeof o == "function" && r.catch(o);
      }
      function C(r) {
        return typeof r != "string" && (console.warn(r + " used as a key, but it is not a string."), r = String(r)), r;
      }
      function L() {
        if (arguments.length && typeof arguments[arguments.length - 1] == "function")
          return arguments[arguments.length - 1];
      }
      var j = "local-forage-detect-blob-support", B = void 0, S = {}, M = Object.prototype.toString, D = "readonly", g = "readwrite";
      function R(r) {
        for (var n = r.length, o = new ArrayBuffer(n), s = new Uint8Array(o), l = 0; l < n; l++)
          s[l] = r.charCodeAt(l);
        return o;
      }
      function E(r) {
        return new f(function(n) {
          var o = r.transaction(j, g), s = m([""]);
          o.objectStore(j).put(s, "key"), o.onabort = function(l) {
            l.preventDefault(), l.stopPropagation(), n(!1);
          }, o.oncomplete = function() {
            var l = navigator.userAgent.match(/Chrome\/(\d+)/), u = navigator.userAgent.match(/Edge\//);
            n(u || !l || parseInt(l[1], 10) >= 43);
          };
        }).catch(function() {
          return !1;
        });
      }
      function F(r) {
        return typeof B == "boolean" ? f.resolve(B) : E(r).then(function(n) {
          return B = n, B;
        });
      }
      function T(r) {
        var n = S[r.name], o = {};
        o.promise = new f(function(s, l) {
          o.resolve = s, o.reject = l;
        }), n.deferredOperations.push(o), n.dbReady ? n.dbReady = n.dbReady.then(function() {
          return o.promise;
        }) : n.dbReady = o.promise;
      }
      function q(r) {
        var n = S[r.name], o = n.deferredOperations.pop();
        if (o)
          return o.resolve(), o.promise;
      }
      function U(r, n) {
        var o = S[r.name], s = o.deferredOperations.pop();
        if (s)
          return s.reject(n), s.promise;
      }
      function Y(r, n) {
        return new f(function(o, s) {
          if (S[r.name] = S[r.name] || De(), r.db)
            if (n)
              T(r), r.db.close();
            else
              return o(r.db);
          var l = [r.name];
          n && l.push(r.version);
          var u = $.open.apply($, l);
          n && (u.onupgradeneeded = function(p) {
            var _ = u.result;
            try {
              _.createObjectStore(r.storeName), p.oldVersion <= 1 && _.createObjectStore(j);
            } catch (I) {
              if (I.name === "ConstraintError")
                console.warn('The database "' + r.name + '" has been upgraded from version ' + p.oldVersion + " to version " + p.newVersion + ', but the storage "' + r.storeName + '" already exists.');
              else
                throw I;
            }
          }), u.onerror = function(p) {
            p.preventDefault(), s(u.error);
          }, u.onsuccess = function() {
            var p = u.result;
            p.onversionchange = function(_) {
              _.target.close();
            }, o(p), q(r);
          };
        });
      }
      function J(r) {
        return Y(r, !1);
      }
      function ne(r) {
        return Y(r, !0);
      }
      function se(r, n) {
        if (!r.db)
          return !0;
        var o = !r.db.objectStoreNames.contains(r.storeName), s = r.version < r.db.version, l = r.version > r.db.version;
        if (s && (r.version !== n && console.warn('The database "' + r.name + `" can't be downgraded from version ` + r.db.version + " to version " + r.version + "."), r.version = r.db.version), l || o) {
          if (o) {
            var u = r.db.version + 1;
            u > r.version && (r.version = u);
          }
          return !0;
        }
        return !1;
      }
      function ue(r) {
        return new f(function(n, o) {
          var s = new FileReader();
          s.onerror = o, s.onloadend = function(l) {
            var u = btoa(l.target.result || "");
            n({
              __local_forage_encoded_blob: !0,
              data: u,
              type: r.type
            });
          }, s.readAsBinaryString(r);
        });
      }
      function le(r) {
        var n = R(atob(r.data));
        return m([n], { type: r.type });
      }
      function Oe(r) {
        return r && r.__local_forage_encoded_blob;
      }
      function $e(r) {
        var n = this, o = n._initReady().then(function() {
          var s = S[n._dbInfo.name];
          if (s && s.dbReady)
            return s.dbReady;
        });
        return N(o, r, r), o;
      }
      function Ie(r) {
        T(r);
        for (var n = S[r.name], o = n.forages, s = 0; s < o.length; s++) {
          var l = o[s];
          l._dbInfo.db && (l._dbInfo.db.close(), l._dbInfo.db = null);
        }
        return r.db = null, J(r).then(function(u) {
          return r.db = u, se(r) ? ne(r) : u;
        }).then(function(u) {
          r.db = n.db = u;
          for (var p = 0; p < o.length; p++)
            o[p]._dbInfo.db = u;
        }).catch(function(u) {
          throw U(r, u), u;
        });
      }
      function ce(r, n, o, s) {
        s === void 0 && (s = 1);
        try {
          var l = r.db.transaction(r.storeName, n);
          o(null, l);
        } catch (u) {
          if (s > 0 && (!r.db || u.name === "InvalidStateError" || u.name === "NotFoundError"))
            return f.resolve().then(function() {
              if (!r.db || u.name === "NotFoundError" && !r.db.objectStoreNames.contains(r.storeName) && r.version <= r.db.version)
                return r.db && (r.version = r.db.version + 1), ne(r);
            }).then(function() {
              return Ie(r).then(function() {
                ce(r, n, o, s - 1);
              });
            }).catch(o);
          o(u);
        }
      }
      function De() {
        return {
          forages: [],
          db: null,
          dbReady: null,
          deferredOperations: []
        };
      }
      function nt(r) {
        var n = this, o = {
          db: null
        };
        if (r)
          for (var s in r)
            o[s] = r[s];
        var l = S[o.name];
        l || (l = De(), S[o.name] = l), l.forages.push(n), n._initReady || (n._initReady = n.ready, n.ready = $e);
        var u = [];
        function p() {
          return f.resolve();
        }
        for (var _ = 0; _ < l.forages.length; _++) {
          var I = l.forages[_];
          I !== n && u.push(I._initReady().catch(p));
        }
        var k = l.forages.slice(0);
        return f.all(u).then(function() {
          return o.db = l.db, J(o);
        }).then(function(w) {
          return o.db = w, se(o, n._defaultConfig.version) ? ne(o) : w;
        }).then(function(w) {
          o.db = l.db = w, n._dbInfo = o;
          for (var P = 0; P < k.length; P++) {
            var W = k[P];
            W !== n && (W._dbInfo.db = o.db, W._dbInfo.version = o.version);
          }
        });
      }
      function Ot(r, n) {
        var o = this;
        r = C(r);
        var s = new f(function(l, u) {
          o.ready().then(function() {
            ce(o._dbInfo, D, function(p, _) {
              if (p)
                return u(p);
              try {
                var I = _.objectStore(o._dbInfo.storeName), k = I.get(r);
                k.onsuccess = function() {
                  var w = k.result;
                  w === void 0 && (w = null), Oe(w) && (w = le(w)), l(w);
                }, k.onerror = function() {
                  u(k.error);
                };
              } catch (w) {
                u(w);
              }
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function It(r, n) {
        var o = this, s = new f(function(l, u) {
          o.ready().then(function() {
            ce(o._dbInfo, D, function(p, _) {
              if (p)
                return u(p);
              try {
                var I = _.objectStore(o._dbInfo.storeName), k = I.openCursor(), w = 1;
                k.onsuccess = function() {
                  var P = k.result;
                  if (P) {
                    var W = P.value;
                    Oe(W) && (W = le(W));
                    var Z = r(W, P.key, w++);
                    Z !== void 0 ? l(Z) : P.continue();
                  } else
                    l();
                }, k.onerror = function() {
                  u(k.error);
                };
              } catch (P) {
                u(P);
              }
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function Pe(r, n, o) {
        var s = this;
        r = C(r);
        var l = new f(function(u, p) {
          var _;
          s.ready().then(function() {
            return _ = s._dbInfo, M.call(n) === "[object Blob]" ? F(_.db).then(function(I) {
              return I ? n : ue(n);
            }) : n;
          }).then(function(I) {
            ce(s._dbInfo, g, function(k, w) {
              if (k)
                return p(k);
              try {
                var P = w.objectStore(s._dbInfo.storeName);
                I === null && (I = void 0);
                var W = P.put(I, r);
                w.oncomplete = function() {
                  I === void 0 && (I = null), u(I);
                }, w.onabort = w.onerror = function() {
                  var Z = W.error ? W.error : W.transaction.error;
                  p(Z);
                };
              } catch (Z) {
                p(Z);
              }
            });
          }).catch(p);
        });
        return v(l, o), l;
      }
      function Be(r, n) {
        var o = this;
        r = C(r);
        var s = new f(function(l, u) {
          o.ready().then(function() {
            ce(o._dbInfo, g, function(p, _) {
              if (p)
                return u(p);
              try {
                var I = _.objectStore(o._dbInfo.storeName), k = I.delete(r);
                _.oncomplete = function() {
                  l();
                }, _.onerror = function() {
                  u(k.error);
                }, _.onabort = function() {
                  var w = k.error ? k.error : k.transaction.error;
                  u(w);
                };
              } catch (w) {
                u(w);
              }
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function Re(r) {
        var n = this, o = new f(function(s, l) {
          n.ready().then(function() {
            ce(n._dbInfo, g, function(u, p) {
              if (u)
                return l(u);
              try {
                var _ = p.objectStore(n._dbInfo.storeName), I = _.clear();
                p.oncomplete = function() {
                  s();
                }, p.onabort = p.onerror = function() {
                  var k = I.error ? I.error : I.transaction.error;
                  l(k);
                };
              } catch (k) {
                l(k);
              }
            });
          }).catch(l);
        });
        return v(o, r), o;
      }
      function Me(r) {
        var n = this, o = new f(function(s, l) {
          n.ready().then(function() {
            ce(n._dbInfo, D, function(u, p) {
              if (u)
                return l(u);
              try {
                var _ = p.objectStore(n._dbInfo.storeName), I = _.count();
                I.onsuccess = function() {
                  s(I.result);
                }, I.onerror = function() {
                  l(I.error);
                };
              } catch (k) {
                l(k);
              }
            });
          }).catch(l);
        });
        return v(o, r), o;
      }
      function Ne(r, n) {
        var o = this, s = new f(function(l, u) {
          if (r < 0) {
            l(null);
            return;
          }
          o.ready().then(function() {
            ce(o._dbInfo, D, function(p, _) {
              if (p)
                return u(p);
              try {
                var I = _.objectStore(o._dbInfo.storeName), k = !1, w = I.openKeyCursor();
                w.onsuccess = function() {
                  var P = w.result;
                  if (!P) {
                    l(null);
                    return;
                  }
                  r === 0 || k ? l(P.key) : (k = !0, P.advance(r));
                }, w.onerror = function() {
                  u(w.error);
                };
              } catch (P) {
                u(P);
              }
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function xt(r) {
        var n = this, o = new f(function(s, l) {
          n.ready().then(function() {
            ce(n._dbInfo, D, function(u, p) {
              if (u)
                return l(u);
              try {
                var _ = p.objectStore(n._dbInfo.storeName), I = _.openKeyCursor(), k = [];
                I.onsuccess = function() {
                  var w = I.result;
                  if (!w) {
                    s(k);
                    return;
                  }
                  k.push(w.key), w.continue();
                }, I.onerror = function() {
                  l(I.error);
                };
              } catch (w) {
                l(w);
              }
            });
          }).catch(l);
        });
        return v(o, r), o;
      }
      function ot(r, n) {
        n = L.apply(this, arguments);
        var o = this.config();
        r = typeof r != "function" && r || {}, r.name || (r.name = r.name || o.name, r.storeName = r.storeName || o.storeName);
        var s = this, l;
        if (!r.name)
          l = f.reject("Invalid arguments");
        else {
          var u = r.name === o.name && s._dbInfo.db, p = u ? f.resolve(s._dbInfo.db) : J(r).then(function(_) {
            var I = S[r.name], k = I.forages;
            I.db = _;
            for (var w = 0; w < k.length; w++)
              k[w]._dbInfo.db = _;
            return _;
          });
          r.storeName ? l = p.then(function(_) {
            if (_.objectStoreNames.contains(r.storeName)) {
              var I = _.version + 1;
              T(r);
              var k = S[r.name], w = k.forages;
              _.close();
              for (var P = 0; P < w.length; P++) {
                var W = w[P];
                W._dbInfo.db = null, W._dbInfo.version = I;
              }
              var Z = new f(function(Q, oe) {
                var te = $.open(r.name, I);
                te.onerror = function(ve) {
                  var Wt = te.result;
                  Wt.close(), oe(ve);
                }, te.onupgradeneeded = function() {
                  var ve = te.result;
                  ve.deleteObjectStore(r.storeName);
                }, te.onsuccess = function() {
                  var ve = te.result;
                  ve.close(), Q(ve);
                };
              });
              return Z.then(function(Q) {
                k.db = Q;
                for (var oe = 0; oe < w.length; oe++) {
                  var te = w[oe];
                  te._dbInfo.db = Q, q(te._dbInfo);
                }
              }).catch(function(Q) {
                throw (U(r, Q) || f.resolve()).catch(function() {
                }), Q;
              });
            }
          }) : l = p.then(function(_) {
            T(r);
            var I = S[r.name], k = I.forages;
            _.close();
            for (var w = 0; w < k.length; w++) {
              var P = k[w];
              P._dbInfo.db = null;
            }
            var W = new f(function(Z, Q) {
              var oe = $.deleteDatabase(r.name);
              oe.onerror = function() {
                var te = oe.result;
                te && te.close(), Q(oe.error);
              }, oe.onblocked = function() {
                console.warn('dropInstance blocked for database "' + r.name + '" until all open connections are closed');
              }, oe.onsuccess = function() {
                var te = oe.result;
                te && te.close(), Z(te);
              };
            });
            return W.then(function(Z) {
              I.db = Z;
              for (var Q = 0; Q < k.length; Q++) {
                var oe = k[Q];
                q(oe._dbInfo);
              }
            }).catch(function(Z) {
              throw (U(r, Z) || f.resolve()).catch(function() {
              }), Z;
            });
          });
        }
        return v(l, n), l;
      }
      var Tt = {
        _driver: "asyncStorage",
        _initStorage: nt,
        _support: O(),
        iterate: It,
        getItem: Ot,
        setItem: Pe,
        removeItem: Be,
        clear: Re,
        length: Me,
        key: Ne,
        keys: xt,
        dropInstance: ot
      };
      function Rt() {
        return typeof openDatabase == "function";
      }
      var de = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", xe = "~~local_forage_type~", Ve = /^~~local_forage_type~([^~]+)~/, Te = "__lfsc__:", we = Te.length, He = "arbf", We = "blob", Ae = "si08", it = "ui08", at = "uic8", Ue = "si16", ze = "si32", Se = "ur16", lt = "ui32", Ke = "fl32", qe = "fl64", je = we + He.length, st = Object.prototype.toString;
      function ut(r) {
        var n = r.length * 0.75, o = r.length, s, l = 0, u, p, _, I;
        r[r.length - 1] === "=" && (n--, r[r.length - 2] === "=" && n--);
        var k = new ArrayBuffer(n), w = new Uint8Array(k);
        for (s = 0; s < o; s += 4)
          u = de.indexOf(r[s]), p = de.indexOf(r[s + 1]), _ = de.indexOf(r[s + 2]), I = de.indexOf(r[s + 3]), w[l++] = u << 2 | p >> 4, w[l++] = (p & 15) << 4 | _ >> 2, w[l++] = (_ & 3) << 6 | I & 63;
        return k;
      }
      function Ge(r) {
        var n = new Uint8Array(r), o = "", s;
        for (s = 0; s < n.length; s += 3)
          o += de[n[s] >> 2], o += de[(n[s] & 3) << 4 | n[s + 1] >> 4], o += de[(n[s + 1] & 15) << 2 | n[s + 2] >> 6], o += de[n[s + 2] & 63];
        return n.length % 3 === 2 ? o = o.substring(0, o.length - 1) + "=" : n.length % 3 === 1 && (o = o.substring(0, o.length - 2) + "=="), o;
      }
      function Nt(r, n) {
        var o = "";
        if (r && (o = st.call(r)), r && (o === "[object ArrayBuffer]" || r.buffer && st.call(r.buffer) === "[object ArrayBuffer]")) {
          var s, l = Te;
          r instanceof ArrayBuffer ? (s = r, l += He) : (s = r.buffer, o === "[object Int8Array]" ? l += Ae : o === "[object Uint8Array]" ? l += it : o === "[object Uint8ClampedArray]" ? l += at : o === "[object Int16Array]" ? l += Ue : o === "[object Uint16Array]" ? l += Se : o === "[object Int32Array]" ? l += ze : o === "[object Uint32Array]" ? l += lt : o === "[object Float32Array]" ? l += Ke : o === "[object Float64Array]" ? l += qe : n(new Error("Failed to get type for BinaryArray"))), n(l + Ge(s));
        } else if (o === "[object Blob]") {
          var u = new FileReader();
          u.onload = function() {
            var p = xe + r.type + "~" + Ge(this.result);
            n(Te + We + p);
          }, u.readAsArrayBuffer(r);
        } else
          try {
            n(JSON.stringify(r));
          } catch (p) {
            console.error("Couldn't convert value into a JSON string: ", r), n(null, p);
          }
      }
      function At(r) {
        if (r.substring(0, we) !== Te)
          return JSON.parse(r);
        var n = r.substring(je), o = r.substring(we, je), s;
        if (o === We && Ve.test(n)) {
          var l = n.match(Ve);
          s = l[1], n = n.substring(l[0].length);
        }
        var u = ut(n);
        switch (o) {
          case He:
            return u;
          case We:
            return m([u], { type: s });
          case Ae:
            return new Int8Array(u);
          case it:
            return new Uint8Array(u);
          case at:
            return new Uint8ClampedArray(u);
          case Ue:
            return new Int16Array(u);
          case Se:
            return new Uint16Array(u);
          case ze:
            return new Int32Array(u);
          case lt:
            return new Uint32Array(u);
          case Ke:
            return new Float32Array(u);
          case qe:
            return new Float64Array(u);
          default:
            throw new Error("Unkown type: " + o);
        }
      }
      var Je = {
        serialize: Nt,
        deserialize: At,
        stringToBuffer: ut,
        bufferToString: Ge
      };
      function ct(r, n, o, s) {
        r.executeSql("CREATE TABLE IF NOT EXISTS " + n.storeName + " (id INTEGER PRIMARY KEY, key unique, value)", [], o, s);
      }
      function Xe(r) {
        var n = this, o = {
          db: null
        };
        if (r)
          for (var s in r)
            o[s] = typeof r[s] != "string" ? r[s].toString() : r[s];
        var l = new f(function(u, p) {
          try {
            o.db = openDatabase(o.name, String(o.version), o.description, o.size);
          } catch (_) {
            return p(_);
          }
          o.db.transaction(function(_) {
            ct(_, o, function() {
              n._dbInfo = o, u();
            }, function(I, k) {
              p(k);
            });
          }, p);
        });
        return o.serializer = Je, l;
      }
      function me(r, n, o, s, l, u) {
        r.executeSql(o, s, l, function(p, _) {
          _.code === _.SYNTAX_ERR ? p.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", [n.storeName], function(I, k) {
            k.rows.length ? u(I, _) : ct(I, n, function() {
              I.executeSql(o, s, l, u);
            }, u);
          }, u) : u(p, _);
        }, u);
      }
      function Ee(r, n) {
        var o = this;
        r = C(r);
        var s = new f(function(l, u) {
          o.ready().then(function() {
            var p = o._dbInfo;
            p.db.transaction(function(_) {
              me(_, p, "SELECT * FROM " + p.storeName + " WHERE key = ? LIMIT 1", [r], function(I, k) {
                var w = k.rows.length ? k.rows.item(0).value : null;
                w && (w = p.serializer.deserialize(w)), l(w);
              }, function(I, k) {
                u(k);
              });
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function Qe(r, n) {
        var o = this, s = new f(function(l, u) {
          o.ready().then(function() {
            var p = o._dbInfo;
            p.db.transaction(function(_) {
              me(_, p, "SELECT * FROM " + p.storeName, [], function(I, k) {
                for (var w = k.rows, P = w.length, W = 0; W < P; W++) {
                  var Z = w.item(W), Q = Z.value;
                  if (Q && (Q = p.serializer.deserialize(Q)), Q = r(Q, Z.key, W + 1), Q !== void 0) {
                    l(Q);
                    return;
                  }
                }
                l();
              }, function(I, k) {
                u(k);
              });
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function Ce(r, n, o, s) {
        var l = this;
        r = C(r);
        var u = new f(function(p, _) {
          l.ready().then(function() {
            n === void 0 && (n = null);
            var I = n, k = l._dbInfo;
            k.serializer.serialize(n, function(w, P) {
              P ? _(P) : k.db.transaction(function(W) {
                me(W, k, "INSERT OR REPLACE INTO " + k.storeName + " (key, value) VALUES (?, ?)", [r, w], function() {
                  p(I);
                }, function(Z, Q) {
                  _(Q);
                });
              }, function(W) {
                if (W.code === W.QUOTA_ERR) {
                  if (s > 0) {
                    p(Ce.apply(l, [r, I, o, s - 1]));
                    return;
                  }
                  _(W);
                }
              });
            });
          }).catch(_);
        });
        return v(u, o), u;
      }
      function ft(r, n, o) {
        return Ce.apply(this, [r, n, o, 1]);
      }
      function jt(r, n) {
        var o = this;
        r = C(r);
        var s = new f(function(l, u) {
          o.ready().then(function() {
            var p = o._dbInfo;
            p.db.transaction(function(_) {
              me(_, p, "DELETE FROM " + p.storeName + " WHERE key = ?", [r], function() {
                l();
              }, function(I, k) {
                u(k);
              });
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function dt(r) {
        var n = this, o = new f(function(s, l) {
          n.ready().then(function() {
            var u = n._dbInfo;
            u.db.transaction(function(p) {
              me(p, u, "DELETE FROM " + u.storeName, [], function() {
                s();
              }, function(_, I) {
                l(I);
              });
            });
          }).catch(l);
        });
        return v(o, r), o;
      }
      function Ct(r) {
        var n = this, o = new f(function(s, l) {
          n.ready().then(function() {
            var u = n._dbInfo;
            u.db.transaction(function(p) {
              me(p, u, "SELECT COUNT(key) as c FROM " + u.storeName, [], function(_, I) {
                var k = I.rows.item(0).c;
                s(k);
              }, function(_, I) {
                l(I);
              });
            });
          }).catch(l);
        });
        return v(o, r), o;
      }
      function pt(r, n) {
        var o = this, s = new f(function(l, u) {
          o.ready().then(function() {
            var p = o._dbInfo;
            p.db.transaction(function(_) {
              me(_, p, "SELECT key FROM " + p.storeName + " WHERE id = ? LIMIT 1", [r + 1], function(I, k) {
                var w = k.rows.length ? k.rows.item(0).key : null;
                l(w);
              }, function(I, k) {
                u(k);
              });
            });
          }).catch(u);
        });
        return v(s, n), s;
      }
      function vt(r) {
        var n = this, o = new f(function(s, l) {
          n.ready().then(function() {
            var u = n._dbInfo;
            u.db.transaction(function(p) {
              me(p, u, "SELECT key FROM " + u.storeName, [], function(_, I) {
                for (var k = [], w = 0; w < I.rows.length; w++)
                  k.push(I.rows.item(w).key);
                s(k);
              }, function(_, I) {
                l(I);
              });
            });
          }).catch(l);
        });
        return v(o, r), o;
      }
      function Lt(r) {
        return new f(function(n, o) {
          r.transaction(function(s) {
            s.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function(l, u) {
              for (var p = [], _ = 0; _ < u.rows.length; _++)
                p.push(u.rows.item(_).name);
              n({
                db: r,
                storeNames: p
              });
            }, function(l, u) {
              o(u);
            });
          }, function(s) {
            o(s);
          });
        });
      }
      function Ft(r, n) {
        n = L.apply(this, arguments);
        var o = this.config();
        r = typeof r != "function" && r || {}, r.name || (r.name = r.name || o.name, r.storeName = r.storeName || o.storeName);
        var s = this, l;
        return r.name ? l = new f(function(u) {
          var p;
          r.name === o.name ? p = s._dbInfo.db : p = openDatabase(r.name, "", "", 0), r.storeName ? u({
            db: p,
            storeNames: [r.storeName]
          }) : u(Lt(p));
        }).then(function(u) {
          return new f(function(p, _) {
            u.db.transaction(function(I) {
              function k(Z) {
                return new f(function(Q, oe) {
                  I.executeSql("DROP TABLE IF EXISTS " + Z, [], function() {
                    Q();
                  }, function(te, ve) {
                    oe(ve);
                  });
                });
              }
              for (var w = [], P = 0, W = u.storeNames.length; P < W; P++)
                w.push(k(u.storeNames[P]));
              f.all(w).then(function() {
                p();
              }).catch(function(Z) {
                _(Z);
              });
            }, function(I) {
              _(I);
            });
          });
        }) : l = f.reject("Invalid arguments"), v(l, n), l;
      }
      var mt = {
        _driver: "webSQLStorage",
        _initStorage: Xe,
        _support: Rt(),
        iterate: Qe,
        getItem: Ee,
        setItem: ft,
        removeItem: jt,
        clear: dt,
        length: Ct,
        key: pt,
        keys: vt,
        dropInstance: Ft
      };
      function ht() {
        try {
          return typeof localStorage < "u" && "setItem" in localStorage && !!localStorage.setItem;
        } catch {
          return !1;
        }
      }
      function gt(r, n) {
        var o = r.name + "/";
        return r.storeName !== n.storeName && (o += r.storeName + "/"), o;
      }
      function Dt() {
        var r = "_localforage_support_test";
        try {
          return localStorage.setItem(r, !0), localStorage.removeItem(r), !1;
        } catch {
          return !0;
        }
      }
      function Pt() {
        return !Dt() || localStorage.length > 0;
      }
      function Bt(r) {
        var n = this, o = {};
        if (r)
          for (var s in r)
            o[s] = r[s];
        return o.keyPrefix = gt(r, n._defaultConfig), Pt() ? (n._dbInfo = o, o.serializer = Je, f.resolve()) : f.reject();
      }
      function a(r) {
        var n = this, o = n.ready().then(function() {
          for (var s = n._dbInfo.keyPrefix, l = localStorage.length - 1; l >= 0; l--) {
            var u = localStorage.key(l);
            u.indexOf(s) === 0 && localStorage.removeItem(u);
          }
        });
        return v(o, r), o;
      }
      function y(r, n) {
        var o = this;
        r = C(r);
        var s = o.ready().then(function() {
          var l = o._dbInfo, u = localStorage.getItem(l.keyPrefix + r);
          return u && (u = l.serializer.deserialize(u)), u;
        });
        return v(s, n), s;
      }
      function A(r, n) {
        var o = this, s = o.ready().then(function() {
          for (var l = o._dbInfo, u = l.keyPrefix, p = u.length, _ = localStorage.length, I = 1, k = 0; k < _; k++) {
            var w = localStorage.key(k);
            if (w.indexOf(u) === 0) {
              var P = localStorage.getItem(w);
              if (P && (P = l.serializer.deserialize(P)), P = r(P, w.substring(p), I++), P !== void 0)
                return P;
            }
          }
        });
        return v(s, n), s;
      }
      function V(r, n) {
        var o = this, s = o.ready().then(function() {
          var l = o._dbInfo, u;
          try {
            u = localStorage.key(r);
          } catch {
            u = null;
          }
          return u && (u = u.substring(l.keyPrefix.length)), u;
        });
        return v(s, n), s;
      }
      function G(r) {
        var n = this, o = n.ready().then(function() {
          for (var s = n._dbInfo, l = localStorage.length, u = [], p = 0; p < l; p++) {
            var _ = localStorage.key(p);
            _.indexOf(s.keyPrefix) === 0 && u.push(_.substring(s.keyPrefix.length));
          }
          return u;
        });
        return v(o, r), o;
      }
      function X(r) {
        var n = this, o = n.keys().then(function(s) {
          return s.length;
        });
        return v(o, r), o;
      }
      function z(r, n) {
        var o = this;
        r = C(r);
        var s = o.ready().then(function() {
          var l = o._dbInfo;
          localStorage.removeItem(l.keyPrefix + r);
        });
        return v(s, n), s;
      }
      function H(r, n, o) {
        var s = this;
        r = C(r);
        var l = s.ready().then(function() {
          n === void 0 && (n = null);
          var u = n;
          return new f(function(p, _) {
            var I = s._dbInfo;
            I.serializer.serialize(n, function(k, w) {
              if (w)
                _(w);
              else
                try {
                  localStorage.setItem(I.keyPrefix + r, k), p(u);
                } catch (P) {
                  (P.name === "QuotaExceededError" || P.name === "NS_ERROR_DOM_QUOTA_REACHED") && _(P), _(P);
                }
            });
          });
        });
        return v(l, o), l;
      }
      function ie(r, n) {
        if (n = L.apply(this, arguments), r = typeof r != "function" && r || {}, !r.name) {
          var o = this.config();
          r.name = r.name || o.name, r.storeName = r.storeName || o.storeName;
        }
        var s = this, l;
        return r.name ? l = new f(function(u) {
          r.storeName ? u(gt(r, s._defaultConfig)) : u(r.name + "/");
        }).then(function(u) {
          for (var p = localStorage.length - 1; p >= 0; p--) {
            var _ = localStorage.key(p);
            _.indexOf(u) === 0 && localStorage.removeItem(_);
          }
        }) : l = f.reject("Invalid arguments"), v(l, n), l;
      }
      var ee = {
        _driver: "localStorageWrapper",
        _initStorage: Bt,
        _support: ht(),
        iterate: A,
        getItem: y,
        setItem: H,
        removeItem: z,
        clear: a,
        length: X,
        key: V,
        keys: G,
        dropInstance: ie
      }, re = function(r, n) {
        return r === n || typeof r == "number" && typeof n == "number" && isNaN(r) && isNaN(n);
      }, fe = function(r, n) {
        for (var o = r.length, s = 0; s < o; ) {
          if (re(r[s], n))
            return !0;
          s++;
        }
        return !1;
      }, ye = Array.isArray || function(r) {
        return Object.prototype.toString.call(r) === "[object Array]";
      }, pe = {}, ae = {}, ge = {
        INDEXEDDB: Tt,
        WEBSQL: mt,
        LOCALSTORAGE: ee
      }, Mt = [ge.INDEXEDDB._driver, ge.WEBSQL._driver, ge.LOCALSTORAGE._driver], Le = ["dropInstance"], Vt = ["clear", "getItem", "iterate", "key", "keys", "length", "removeItem", "setItem"].concat(Le), Cr = {
        description: "",
        driver: Mt.slice(),
        name: "localforage",
        size: 4980736,
        storeName: "keyvaluepairs",
        version: 1
      };
      function Lr(r, n) {
        r[n] = function() {
          var o = arguments;
          return r.ready().then(function() {
            return r[n].apply(r, o);
          });
        };
      }
      function Ht() {
        for (var r = 1; r < arguments.length; r++) {
          var n = arguments[r];
          if (n)
            for (var o in n)
              n.hasOwnProperty(o) && (ye(n[o]) ? arguments[0][o] = n[o].slice() : arguments[0][o] = n[o]);
        }
        return arguments[0];
      }
      var Fr = function() {
        function r(n) {
          x(this, r);
          for (var o in ge)
            if (ge.hasOwnProperty(o)) {
              var s = ge[o], l = s._driver;
              this[o] = l, pe[l] || this.defineDriver(s);
            }
          this._defaultConfig = Ht({}, Cr), this._config = Ht({}, this._defaultConfig, n), this._driverSet = null, this._initDriver = null, this._ready = !1, this._dbInfo = null, this._wrapLibraryMethodsWithReady(), this.setDriver(this._config.driver).catch(function() {
          });
        }
        return r.prototype.config = function(n) {
          if ((typeof n > "u" ? "undefined" : h(n)) === "object") {
            if (this._ready)
              return new Error("Can't call config() after localforage has been used.");
            for (var o in n) {
              if (o === "storeName" && (n[o] = n[o].replace(/\W/g, "_")), o === "version" && typeof n[o] != "number")
                return new Error("Database version must be a number.");
              this._config[o] = n[o];
            }
            return "driver" in n && n.driver ? this.setDriver(this._config.driver) : !0;
          } else
            return typeof n == "string" ? this._config[n] : this._config;
        }, r.prototype.defineDriver = function(n, o, s) {
          var l = new f(function(u, p) {
            try {
              var _ = n._driver, I = new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");
              if (!n._driver) {
                p(I);
                return;
              }
              for (var k = Vt.concat("_initStorage"), w = 0, P = k.length; w < P; w++) {
                var W = k[w], Z = !fe(Le, W);
                if ((Z || n[W]) && typeof n[W] != "function") {
                  p(I);
                  return;
                }
              }
              var Q = function() {
                for (var te = function(Pr) {
                  return function() {
                    var Br = new Error("Method " + Pr + " is not implemented by the current driver"), rr = f.reject(Br);
                    return v(rr, arguments[arguments.length - 1]), rr;
                  };
                }, ve = 0, Wt = Le.length; ve < Wt; ve++) {
                  var Ut = Le[ve];
                  n[Ut] || (n[Ut] = te(Ut));
                }
              };
              Q();
              var oe = function(te) {
                pe[_] && console.info("Redefining LocalForage driver: " + _), pe[_] = n, ae[_] = te, u();
              };
              "_support" in n ? n._support && typeof n._support == "function" ? n._support().then(oe, p) : oe(!!n._support) : oe(!0);
            } catch (te) {
              p(te);
            }
          });
          return N(l, o, s), l;
        }, r.prototype.driver = function() {
          return this._driver || null;
        }, r.prototype.getDriver = function(n, o, s) {
          var l = pe[n] ? f.resolve(pe[n]) : f.reject(new Error("Driver not found."));
          return N(l, o, s), l;
        }, r.prototype.getSerializer = function(n) {
          var o = f.resolve(Je);
          return N(o, n), o;
        }, r.prototype.ready = function(n) {
          var o = this, s = o._driverSet.then(function() {
            return o._ready === null && (o._ready = o._initDriver()), o._ready;
          });
          return N(s, n, n), s;
        }, r.prototype.setDriver = function(n, o, s) {
          var l = this;
          ye(n) || (n = [n]);
          var u = this._getSupportedDrivers(n);
          function p() {
            l._config.driver = l.driver();
          }
          function _(w) {
            return l._extend(w), p(), l._ready = l._initStorage(l._config), l._ready;
          }
          function I(w) {
            return function() {
              var P = 0;
              function W() {
                for (; P < w.length; ) {
                  var Z = w[P];
                  return P++, l._dbInfo = null, l._ready = null, l.getDriver(Z).then(_).catch(W);
                }
                p();
                var Q = new Error("No available storage method found.");
                return l._driverSet = f.reject(Q), l._driverSet;
              }
              return W();
            };
          }
          var k = this._driverSet !== null ? this._driverSet.catch(function() {
            return f.resolve();
          }) : f.resolve();
          return this._driverSet = k.then(function() {
            var w = u[0];
            return l._dbInfo = null, l._ready = null, l.getDriver(w).then(function(P) {
              l._driver = P._driver, p(), l._wrapLibraryMethodsWithReady(), l._initDriver = I(u);
            });
          }).catch(function() {
            p();
            var w = new Error("No available storage method found.");
            return l._driverSet = f.reject(w), l._driverSet;
          }), N(this._driverSet, o, s), this._driverSet;
        }, r.prototype.supports = function(n) {
          return !!ae[n];
        }, r.prototype._extend = function(n) {
          Ht(this, n);
        }, r.prototype._getSupportedDrivers = function(n) {
          for (var o = [], s = 0, l = n.length; s < l; s++) {
            var u = n[s];
            this.supports(u) && o.push(u);
          }
          return o;
        }, r.prototype._wrapLibraryMethodsWithReady = function() {
          for (var n = 0, o = Vt.length; n < o; n++)
            Lr(this, Vt[n]);
        }, r.prototype.createInstance = function(n) {
          return new r(n);
        }, r;
      }(), Dr = new Fr();
      c.exports = Dr;
    }, { 3: 3 }] }, {}, [4])(4);
  });
})(Ir);
const un = Ir.exports, cn = "fetcher-cache", fn = rt.VERSION, Ze = un.createInstance({
  name: cn,
  version: fn
});
class mr {
  constructor() {
    K(this, "set", async (e, i) => {
      await Ze.setItem(e, i);
    }), K(this, "get", async (e, i) => {
      const c = await Ze.getItem(e);
      if (!c)
        return;
      const { expire: d, timestamp: h, version: x } = c;
      if (i && x !== rt.VERSION.toString()) {
        await this.delete(e);
        return;
      }
      if (Date.now() - h > d) {
        await this.delete(e);
        return;
      }
      return c;
    }), K(this, "has", async (e) => await Ze.getItem(e) != null), K(this, "delete", async (e) => {
      e ? await Ze.removeItem(e) : await Ze.clear();
    });
  }
}
function hr(t) {
  let e;
  try {
    typeof t.body == "string" && (e = JSON.parse(t.body));
  } catch {
    e = t.body;
  }
  return {
    status: t.status,
    statusText: t.statusText,
    ok: t.ok,
    body: e,
    bodyUsed: t.bodyUsed,
    headers: t.headers,
    redirected: t.redirected,
    type: t.type,
    url: t.url
  };
}
function gr(t, e = "GET", i = {}, c = {}, d) {
  return d || `${t}-${e}-${JSON.stringify(i)}-${JSON.stringify(c)}`;
}
function dn(t, e, i) {
  let c = e;
  if (i) {
    const d = sn.stringify(i);
    d && (c = `${e}?${d}`);
  }
  return !e.startsWith("http") && t ? `${t.replace(/\/$/g, "")}/${c.replace(/^\//g, "")}` : c;
}
function pn(t) {
  return Object.getPrototypeOf(t) === Object.prototype;
}
const vn = {
  id: "",
  enabled: !1,
  expire: 1e3 * 60 * 60,
  cacheByVersion: !0
};
class Zt {
  constructor(e = {}, i = {}) {
    K(this, "options"), K(this, "aborter"), K(this, "headers", null), K(this, "request", async (c) => {
      const { url: d, baseUrl: h = "", retry: x = 1, timeout: b = 1e4, responseType: $ = "json", clientCache: O, body: m, params: f, method: v = "GET", takeLastest: N = !1, validateStatus: C = (D) => D >= 200 && D < 300, ...L } = {
        ...this.options,
        ...c,
        ...this.headers
      };
      let j = new Error();
      const B = new mr(), S = {
        ...vn,
        ...O
      }, M = async (D) => {
        if (D === 0)
          throw j;
        try {
          const g = dn(h, d, f), R = gr(g, c.method, f, m, S.id);
          let E = {}, F = null;
          Jt() && (F = await B.get(R, S.cacheByVersion));
          const T = typeof (S == null ? void 0 : S.enabled) == "boolean" ? S == null ? void 0 : S.enabled : S == null ? void 0 : S.enabled(F == null ? void 0 : F.response);
          if (T && F)
            return F.response;
          Jt() && await (B == null ? void 0 : B.delete(R));
          const q = {
            ...this.headers,
            ...L.headers
          }, U = await this.requestWithTimeout(g, b, m ? {
            ...L,
            method: v,
            body: pn(m) ? JSON.stringify(m) : m,
            headers: q
          } : {
            ...L,
            method: v,
            headers: q
          }, N, f, m);
          if (U.status === 502)
            throw new Error("Internal Server Error");
          if (!C(U.status))
            throw $ === "json" ? (E = await U.json(), new vr(E.errors || E.message, E.code, E)) : new vr("Internal Server Error", "INTERNAL_SERVER_ERROR");
          if (U.status === 204)
            return {
              status: U.status,
              statusText: U.statusText
            };
          if ($ === "json" ? (E = await U.json(), "payload" in E && (E = E.payload)) : E = await U.text(), T) {
            const { headers: Y, ...J } = hr(U);
            B.set(R, {
              response: {
                data: E,
                ...J
              },
              expire: S.expire,
              timestamp: Date.now(),
              ...S.cacheByVersion ? { version: rt.VERSION.toString() } : {}
            });
          }
          return {
            data: E,
            ...hr(U)
          };
        } catch (g) {
          return g instanceof Error && (j = g), M(D - 1);
        }
      };
      return await M(x);
    }), K(this, "removeCache", async (c) => {
      await new mr().delete(c);
    }), this.options = e, this.aborter = i;
  }
  createInstance(e) {
    return new Zt(e);
  }
  setHeaders(e) {
    this.headers = e;
  }
  async requestWithTimeout(e, i, c, d, h, x) {
    const b = typeof d == "boolean" ? d : d == null ? void 0 : d.enabled, $ = typeof d == "boolean" ? "" : d == null ? void 0 : d.id, O = gr(e, c.method, h, x, $);
    this.aborter[O] && b && this.aborter[O].abort(), this.aborter[O] = new AbortController();
    const m = setTimeout(() => this.aborter[O].abort(), i);
    try {
      return await fetch(e, {
        ...c,
        signal: this.aborter[O].signal
      });
    } catch (f) {
      throw f;
    } finally {
      clearTimeout(m);
    }
  }
}
new Zt();
const mn = "designSync";
function hn(t) {
  return t.type === Hr.DESIGN_SYNC ? mn : t.id;
}
function gn(t) {
  return t == null ? void 0 : t.reduce((e, i) => {
    const c = hn(i);
    return i.default == null || !c ? e : {
      ...e,
      [c]: i.default
    };
  }, {});
}
new kt();
new kt();
new kt();
const Xt = {
  attribute: (t, e = {}) => {
    var i, c, d, h, x, b, $, O;
    const m = {
      cascade: !0,
      enabled: (i = e == null ? void 0 : e.animationEnabled) != null ? i : !1,
      type: (c = e == null ? void 0 : e.animationType) != null ? c : "infinite",
      duration: (h = (d = e == null ? void 0 : e.animateDuration) == null ? void 0 : d.value) != null ? h : void 0,
      effect: (x = e == null ? void 0 : e.animateEffect) != null ? x : void 0,
      infiniteEffect: (b = e == null ? void 0 : e.animateInfiniteEffect) != null ? b : void 0,
      strength: (O = ($ = e == null ? void 0 : e.animateStrength) == null ? void 0 : $.value) != null ? O : void 0,
      ...e
    };
    if (!m.enabled)
      return 'xo-animate="none"';
    if (m.type === "infinite")
      return m.enabled ? `xo-animate="infinite" xo-animate-infinite="${m.infiniteEffect}"` : "";
    let f = 'xo-animate="scroll"';
    return m.cascade && (f += " xo-cascade"), m.duration && (f += ` xo-duration="${m.duration}"`), m.effect && (f += ` xo-type="${m.effect}"`), m.strength && (f += ` xo-strength="${m.strength}"`), f;
  },
  style: (t = {}) => {
    var e, i, c, d, h, x, b, $;
    const O = {
      cascade: !0,
      enabled: (e = t == null ? void 0 : t.animationEnabled) != null ? e : !1,
      type: (i = t == null ? void 0 : t.animationType) != null ? i : "infinite",
      duration: (d = (c = t == null ? void 0 : t.animateDuration) == null ? void 0 : c.value) != null ? d : void 0,
      effect: (h = t == null ? void 0 : t.animateEffect) != null ? h : void 0,
      infiniteEffect: (x = t == null ? void 0 : t.animateInfiniteEffect) != null ? x : void 0,
      strength: ($ = (b = t == null ? void 0 : t.animateStrength) == null ? void 0 : b.value) != null ? $ : void 0,
      ...t
    };
    return O.enabled && O.type === "infinite" ? `--xo-animate-infinite-duration: ${O.duration}ms` : "";
  }
}, xr = (t) => {
  var e, i, c, d, h, x, b, $, O, m, f, v, N, C, L, j, B, S, M, D, g, R, E, F;
  if (!((i = (e = t == null ? void 0 : t.normal) == null ? void 0 : e.background) != null && i["background-image-parallax"]))
    return "";
  const T = (c = t == null ? void 0 : t.normal) == null ? void 0 : c.background, q = ((d = T == null ? void 0 : T["background-repeat"]) == null ? void 0 : d.desktop) || "repeat", U = ((h = T == null ? void 0 : T["background-repeat"]) == null ? void 0 : h.tablet) || q, Y = ((x = T == null ? void 0 : T["background-repeat"]) == null ? void 0 : x.mobile) || U || q, J = (b = T == null ? void 0 : T["background-position"]) != null && b.desktop ? `${($ = T == null ? void 0 : T["background-position"]) == null ? void 0 : $.desktop.x}% ${(O = T == null ? void 0 : T["background-position"]) == null ? void 0 : O.desktop.y}%` : "center", ne = (m = T == null ? void 0 : T["background-position"]) != null && m.tablet ? `${(f = T == null ? void 0 : T["background-position"]) == null ? void 0 : f.tablet.x}% ${(v = T == null ? void 0 : T["background-position"]) == null ? void 0 : v.tablet.y}%` : J, se = (N = T == null ? void 0 : T["background-position"]) != null && N.mobile ? `${(C = T == null ? void 0 : T["background-position"]) == null ? void 0 : C.mobile.x}% ${(L = T == null ? void 0 : T["background-position"]) == null ? void 0 : L.mobile.y}%` : ne || J, ue = ((j = T == null ? void 0 : T["background-size"]) == null ? void 0 : j.desktop) || "cover", le = ((B = T == null ? void 0 : T["background-size"]) == null ? void 0 : B.tablet) || ue, Oe = ((S = T == null ? void 0 : T["background-size"]) == null ? void 0 : S.mobile) || le || ue, $e = (D = (M = T == null ? void 0 : T["background-image"]) == null ? void 0 : M.desktop) == null ? void 0 : D.url, Ie = ((R = (g = T == null ? void 0 : T["background-image"]) == null ? void 0 : g.tablet) == null ? void 0 : R.url) || $e, ce = ((F = (E = T == null ? void 0 : T["background-image"]) == null ? void 0 : E.mobile) == null ? void 0 : F.url) || Ie || $e;
  return `--bg-repeat-desktop: ${q};--bg-repeat-tablet: ${U};--bg-repeat-mobile: ${Y};--bg-position-desktop: ${J};--bg-position-tablet: ${ne};--bg-position-mobile: ${se};--bg-size-desktop: ${ue};--bg-size-tablet: ${le};--bg-size-mobile: ${Oe};--parallax-desktop: url(${$e});--parallax-tablet: url(${Ie});--parallax-mobile: url(${ce});`;
};
function ke(t, e) {
  if (t === "padding" || t === "margin")
    return `${t}-${e}`;
  if (t === "border-width")
    return `border-${e}-width`;
  if (t === "border-color")
    return `border-${e}-color`;
  if (t === "border-radius") {
    if (e === "top")
      return "border-start-start-radius";
    if (e === "right")
      return "border-start-end-radius";
    if (e === "bottom")
      return "border-end-end-radius";
    if (e === "left")
      return "border-end-start-radius";
  }
  return "";
}
function Tr(t, e) {
  var i, c, d, h, x, b, $, O, m, f, v, N, C, L, j, B;
  let S = "";
  return e.top && ((i = e.top) == null ? void 0 : i.value) != null && e.left && ((c = e.left) == null ? void 0 : c.value) != null && e.right && ((d = e.right) == null ? void 0 : d.value) != null && e.bottom && ((h = e.bottom) == null ? void 0 : h.value) != null ? (/* @__PURE__ */ new Set([e.top.value, e.left.value, e.right.value, e.bottom.value])).size === 1 && (/* @__PURE__ */ new Set([e.top.unit, e.left.unit, e.right.unit, e.bottom.unit])).size === 1 ? S = `${t}: ${e.top.value}${(x = e.top.unit) != null ? x : "px"};` : e.top.value === e.bottom.value && e.top.unit === e.bottom.unit && e.left.value === e.right.value && e.left.unit === e.right.unit ? S = `${t}: ${e.top.value}${e.top.unit} ${e.right.value}${(b = e.right.unit) != null ? b : "px"};` : e.left.value === e.right.value && e.left.unit === e.right.unit ? S = `${t}: ${e.top.value}${e.top.unit} ${e.right.value}${e.right.unit} ${e.bottom.value}${($ = e.bottom.unit) != null ? $ : "px"};` : S = `${t}: ${e.top.value}${e.top.unit} ${e.right.value}${e.right.unit} ${e.bottom.value}${e.bottom.unit} ${e.left.value}${(O = e.left.unit) != null ? O : "px"};` : (e.top && ((m = e.top) == null ? void 0 : m.value) != null && (S += `${ke(t, "top")}: ${e.top.value}${(f = e.top.unit) != null ? f : "px"};`), e.left && ((v = e.left) == null ? void 0 : v.value) != null && (S += `${ke(t, "left")}: ${e.left.value}${(N = e.left.unit) != null ? N : "px"};`), e.right && ((C = e.right) == null ? void 0 : C.value) != null && (S += `${ke(t, "right")}: ${e.right.value}${(L = e.right.unit) != null ? L : "px"};`), e.bottom && ((j = e.bottom) == null ? void 0 : j.value) != null && (S += `${ke(t, "bottom")}: ${e.bottom.value}${(B = e.bottom.unit) != null ? B : "px"};`)), S;
}
function bn(t, e) {
  let i = "";
  return e.top && e.left && e.right && e.bottom ? (/* @__PURE__ */ new Set([e.top, e.left, e.right, e.bottom])).size === 1 ? i = `${t}: ${e.top};` : e.top === e.bottom && e.left === e.right ? i = `${t}: ${e.top} ${e.right};` : e.left === e.right ? i = `${t}: ${e.top} ${e.right} ${e.bottom};` : i = `${t}: ${e.top} ${e.right} ${e.bottom} ${e.left};` : (e.top && (i += `${ke(t, "top")}: ${e.top};`), e.left && (i += `${ke(t, "left")}: ${e.left};`), e.right && (i += `${ke(t, "right")}: ${e.right};`), e.bottom && (i += `${ke(t, "bottom")}: ${e.bottom};`)), i;
}
function Rr(t) {
  var e;
  let i = "";
  return typeof t == "object" && ((e = t == null ? void 0 : t.points) == null ? void 0 : e.length) ? ([...t.points].sort((c, d) => c.position - d.position).forEach((c) => {
    i += `, ${c.color} ${c.position}%`;
  }), `background-image: linear-gradient(${Math.round(t.rotate)}deg${i});`) : "";
}
function yn(t) {
  let e = "";
  return t == null || t.forEach((i, c) => {
    var d;
    !i.horizontal || !i.vertical || i.horizontal.value == null || i.vertical.value == null || (e += `${i.horizontal.value}${i.horizontal.unit} ${i.vertical.value}${i.vertical.unit}`, i.blur.value != null && (e += ` ${i.blur.value}${i.blur.unit}`), ((d = i.spread) == null ? void 0 : d.value) != null && (e += ` ${i.spread.value}${i.spread.unit}`), e += ` ${i.color}${c !== t.length - 1 ? ", " : ""}`);
  }), e[e.length - 1] === "," && e.replace(/,$/, ";"), e;
}
function _n(t, e) {
  var i, c, d, h, x, b, $, O, m, f;
  let v = "";
  return (i = t.translateX) != null && i[e] && (v += `translateX(${(c = t.translateX[e]) == null ? void 0 : c.value}${(d = t.translateX[e]) == null ? void 0 : d.unit}) `), (h = t.translateY) != null && h[e] && (v += `translateY(${(x = t.translateY[e]) == null ? void 0 : x.value}${(b = t.translateY[e]) == null ? void 0 : b.unit}) `), ($ = t.rotate) != null && $[e] && (v += `rotate(${(O = t.rotate[e]) == null ? void 0 : O.value}deg) `), (m = t.scale) != null && m[e] && (v += `scale(${(f = t.scale[e]) == null ? void 0 : f.value}) `), v && `${v.trim()}`;
}
function $n(t, e, i) {
  if (t === "font-family" && e.fontFamily && i === "desktop")
    return `font-family: '${e.fontFamily}';`;
  if (t === "transition" && e.value && i === "desktop")
    return `${t}: ${e.value}${e.unit};`;
  if (t === "backdrop-filter" && e.value && i === "desktop")
    return `${t}: blur(${e.value}${e.unit});`;
  if (t === "overflow" && e && i === "desktop")
    return `${t}: ${e};`;
  if (t === "transform") {
    const c = _n(e, i);
    return c ? `${t}: ${c};` : "";
  }
  return "";
}
function wn(t, e, i) {
  if (/^(font-size|line-height|letter-spacing|width|height)$/g.test(t))
    return e.value ? `${t}: ${e.value}${e.unit};` : "";
  if (t === "opacity" && e.value != null)
    return e.value !== 100 ? `opacity: ${(e.value / 100).toFixed(2)};` : "";
  if (t === "font-weight" && e)
    return `${t}: ${e};`;
  if (t === "blur" && e.value != null)
    return `filter: blur(${e.value}${e.unit});`;
  if (t === "text-stroke-width" && e.value != null)
    return `-webkit-text-stroke-width: ${e.value}${e.unit};`;
  if (t === "text-stroke-color" && e)
    return `-webkit-text-stroke-color: ${e};`;
  if (t === "background-image")
    return i.backgroundType === "image" ? `${t}: url('${e.url}');` : "";
  if (t === "background-color" && (i.backgroundType === "standard" || !i.backgroundType))
    return `${t}: ${e};`;
  if (/^(box-shadow|text-shadow)$/g.test(t)) {
    const c = yn(e);
    return (e == null ? void 0 : e.length) && c ? `${t}: ${c};` : "";
  }
  return t === "background-position" ? `${t}: ${e.x}% ${e.y}%;` : /^(padding|margin|border-width|border-radius)$/g.test(t) ? Tr(t, e) : t === "border-color" ? bn(t, e) : t === "background-gradient" ? i.backgroundType === "standard" || !i.backgroundType ? Rr(e) : "" : t === "width-fit-content" && e ? "width: fit-content;" : t === "background-overlay" || t === "background-video" ? "" : `${t}: ${e};`;
}
function _e(t, e) {
  return e ? Object.entries(e).map(([i, c]) => c[t] ? wn(i, c[t], {
    backgroundType: e == null ? void 0 : e["background-type"]
  }) : $n(i, c, t)).join("") : "";
}
function qt(t, e) {
  var i, c, d, h, x, b, $;
  return {
    ...(i = t == null ? void 0 : t[e]) == null ? void 0 : i.typography,
    ...(c = t == null ? void 0 : t[e]) == null ? void 0 : c.background,
    ...(d = t == null ? void 0 : t[e]) == null ? void 0 : d.border,
    ...(h = t == null ? void 0 : t[e]) == null ? void 0 : h.spacing,
    ...(x = t == null ? void 0 : t[e]) == null ? void 0 : x.effect,
    ...(b = t == null ? void 0 : t[e]) == null ? void 0 : b.dimension,
    ...($ = t == null ? void 0 : t[e]) == null ? void 0 : $.advanced
  };
}
function be(t, e) {
  const i = e.trim();
  return i ? `
  ${t} {
    ${i}
  }
  ` : "";
}
function $t(t, e) {
  return e ? e.replaceAll("$element", t) : "";
}
function Sn(t) {
  return t.replace(/^\s*$(?:\r\n?|\n)/gm, "");
}
function En(t, e, i, c, d) {
  const h = `
    ${be(t(), e)}
    ${be(t("hover"), i)}
    ${be(t("active"), c)}
    ${d}
  `.trim();
  return h ? `
      @media (min-width: 768px) and (max-width: 991px) {
        ${h}
      }
    ` : "";
}
function kn(t, e, i, c, d, h, x, b) {
  var $, O;
  const m = `${e}
${x && b ? `background-image: url(${b.url});` : ""}`, f = (O = ($ = d == null ? void 0 : d.normal) == null ? void 0 : $.background) != null && O["mobile-static-image"] ? "display: none !important;" : "", v = `
    ${be(t(), m)}
    ${be(".xb-bg-video", f)}
    ${be(t("hover"), i)}
    ${be(t("active"), c)}
    ${h}
  `.trim();
  return v ? `
      @media (max-width: 767px) {
        ${v}
      }
    ` : "";
}
function On(t, e) {
  return (i) => {
    let c = `body .${t}`;
    if (i) {
      const d = `${c}:${i}`;
      e ? e.every((h) => h.includes("$element")) ? c = e.map((h) => h.replace(/\$element/g, d)).join(", ") : c = e.map((h) => /\$[^[]+\[[^\]]+\]/.test(h) ? `${c}  ${h.replaceAll(/\$[^[]+\[/g, "[")}` : `${d}  ${h.replaceAll("$", ":")}`).join(", ") : c = d;
    } else
      e && Array.isArray(e) && (e.every((d) => d.includes("$element")) ? c = e.map((d) => d.replace(/\$element/g, c)).join(", ") : c = e.reduce((d, h) => /\$[^[]+\[[^\]]+\]/.test(h) ? d : [...d, `${c}  ${h.replace(/\$\w+(\[\w+\])?/g, "")}`], []).join(", "));
    return c;
  };
}
function In(t, e, i) {
  var c, d, h, x, b, $, O, m;
  const f = qt(e, "normal"), v = qt(e, "hover"), N = qt(e, "active"), C = _e("desktop", f), L = _e("desktop", v), j = _e("desktop", N), B = _e("tablet", f), S = _e("tablet", v), M = _e("tablet", N), D = _e("mobile", f), g = _e("mobile", v), R = _e("mobile", N), E = On(t, e == null ? void 0 : e.selector), F = !!((d = (c = e == null ? void 0 : e.normal) == null ? void 0 : c.background) != null && d["background-image-mobile"]) && ((x = (h = e == null ? void 0 : e.normal) == null ? void 0 : h.background) == null ? void 0 : x["mobile-static-image"]), T = ($ = (b = e == null ? void 0 : e.normal) == null ? void 0 : b.background) == null ? void 0 : $["background-image-mobile"], q = typeof i == "string" ? $t(E(), i) : "", U = (m = (O = e == null ? void 0 : e.hover) == null ? void 0 : O["hover-relation"]) == null ? void 0 : m["hover-parent"];
  let Y = E("hover");
  return U && U !== t && (Y = `body .${U}:hover .${t}`), Sn(`
    ${be(E(), `${C}
${xr(e)}`)}
    ${be(Y, L)}
    ${be(`${E("active")}`, j)}
    ${tt.isEmpty(i || {}) ? "" : q}
    ${$t(E(), i == null ? void 0 : i.desktop)}
    ${En(E, B, S, M, $t(E(), i == null ? void 0 : i.tablet))}
    ${kn(E, D, g, R, e, $t(E(), i == null ? void 0 : i.mobile), F, T)}
  `);
}
const Qt = {
  attribute: (t) => {
    let e = "";
    return t.id && (e += ` id="${t.id}"`), t.custom && t.custom.length > 0 && t.custom.forEach((i) => {
      ["class", "id", "style", "text-binding", ""].includes(i.key) || (e += ` ${i.key}="${i.value}"`);
    }), e;
  },
  class: (t) => t.class ? t.class : ""
};
function xn(t, e) {
  return t.map(e).join("");
}
function Tn(t, e = "", i = "", c = !1) {
  var d, h, x, b;
  switch (t.actionType) {
    case "url":
      return t.url ? t.openNewTab ? `<a href="${t.url}" target="_blank" ${i}>${e}</a>` : `<a href="${t.url}" ${i}>${e}</a>` : `<div ${i}>${e}</div>`;
    case "email":
      return `<a href="mailto:${t.email}?subject=${(d = t.emailSubject) != null ? d : ""}&body=${(h = t.emailBody) != null ? h : ""}" ${i}>${e}</a>`;
    case "phone":
      return `<a href="tel:${t.phone}" ${i}>${e}</a>`;
    case "scroll":
      return c ? `<a href="${t.scrollTo}" xo-offset="${t.topOffset.value}" ${i}>${e}</a>` : `<a is="xo-scroll-to" href="${t.scrollTo}" xo-offset="${(b = (x = t.topOffset) == null ? void 0 : x.value) != null ? b : 0}" ${i}>${e}</a>`;
    default:
      return e;
  }
}
function Rn(t, e) {
  var i, c, d, h, x, b, $, O, m, f, v, N;
  if (((d = (c = (i = t == null ? void 0 : t.normal) == null ? void 0 : i.background) == null ? void 0 : c["background-type"]) != null ? d : "standard") === "standard")
    return "";
  const C = (b = (x = (h = t == null ? void 0 : t.normal) == null ? void 0 : h.background) == null ? void 0 : x["background-overlay"]) == null ? void 0 : b.desktop, L = (m = (O = ($ = t == null ? void 0 : t.normal) == null ? void 0 : $.background) == null ? void 0 : O["background-overlay"]) == null ? void 0 : m.tablet, j = (N = (v = (f = t == null ? void 0 : t.normal) == null ? void 0 : f.background) == null ? void 0 : v["background-overlay"]) == null ? void 0 : N.mobile, B = C || L || j;
  let S = "", M = "xb-bg-overlay";
  return e && (M += ` ${e}`), B ? (C && (S += `--overlay-desktop: ${C};`), L && (S += `--overlay-tablet: ${L};`), j && (S += `--overlay-mobile: ${j};`), `<div class="${M}" style="${S}"></div>`) : "";
}
function Nn(t, e) {
  var i, c, d, h, x, b, $, O, m, f, v, N, C, L, j, B, S;
  const M = (d = (c = (i = t == null ? void 0 : t.normal) == null ? void 0 : i.background) == null ? void 0 : c["background-type"]) != null ? d : "standard", D = (x = (h = t == null ? void 0 : t.normal) == null ? void 0 : h.background) == null ? void 0 : x["background-image-parallax"];
  if (M !== "image" || !D)
    return "";
  const g = (m = (O = ($ = (b = t == null ? void 0 : t.normal) == null ? void 0 : b.background) == null ? void 0 : $["background-image"]) == null ? void 0 : O.desktop) == null ? void 0 : m.url, R = (C = (N = (v = (f = t == null ? void 0 : t.normal) == null ? void 0 : f.background) == null ? void 0 : v["background-image"]) == null ? void 0 : N.tablet) == null ? void 0 : C.url, E = (S = (B = (j = (L = t == null ? void 0 : t.normal) == null ? void 0 : L.background) == null ? void 0 : j["background-image"]) == null ? void 0 : B.mobile) == null ? void 0 : S.url, F = g || R || E, T = "";
  let q = "xb-bg-parallax";
  return e && (q += ` ${e}`), F ? `
    <div class="${q}" style="${T}">
      <xo-parallax xo-lerp-ease="0.4" class="xb-bg-parallax__item">
        <xo-parallax-scroll
          xo-keyframes="
            {
              '0%': { backgroundPositionY: '200px' },
              '100%': { backgroundPositionY: '-200px' },
            }
          "
          class="xb-bg-parallax__url"
        >
        </xo-parallax-scroll>
      </xo-parallax>
    </div>
  ` : "";
}
function An(t, e) {
  var i, c, d, h, x, b, $, O, m, f, v, N, C, L, j;
  if (((d = (c = (i = t == null ? void 0 : t.normal) == null ? void 0 : i.background) == null ? void 0 : c["background-type"]) != null ? d : "standard") !== "video")
    return "";
  const B = ($ = (b = (x = (h = t == null ? void 0 : t.normal) == null ? void 0 : h.background) == null ? void 0 : x["background-video"]) == null ? void 0 : b.desktop) == null ? void 0 : $.url, S = (v = (f = (m = (O = t == null ? void 0 : t.normal) == null ? void 0 : O.background) == null ? void 0 : m["background-video"]) == null ? void 0 : f.tablet) == null ? void 0 : v.url, M = (j = (L = (C = (N = t == null ? void 0 : t.normal) == null ? void 0 : N.background) == null ? void 0 : C["background-video"]) == null ? void 0 : L.mobile) == null ? void 0 : j.url, D = B || S || M, g = S || M;
  let R = ' xo-breakpoints="{}"';
  const E = [];
  let F = "xb-bg-video";
  return e && (F += ` ${e}`), D ? (S && E.push(`991: { src: '${S}' }`), M && E.push(`767: { src: '${M}' }`), g && (R = ` xo-breakpoints="{${E.join(", ")}}"`), `<xo-video-cover class="${F}" xo-src="${B}"${R}></xo-video-cover>`) : "";
}
function jn(t, e) {
  return e ? `${t}="true"` : "";
}
function Nr(t) {
  let e = "";
  return t.desktop && (e += " xb-hide-desktop"), t.tablet && (e += " xb-hide-tablet"), t.mobile && (e += " xb-hide-mobile"), e;
}
const wt = (t, e) => /\b(font-size|line-height|letter-spacing|opacity|width|height|slider)\b/.test(t) ? e.value != null ? e.unit ? `${t}: ${e.value}${e.unit};` : `${t}: ${e.value};` : "" : t.includes("blur") ? `filter: blur(${e.value}${e.unit});` : t.includes("background-image") ? `${t}: url(${e.url});` : t.includes("background-position") ? `${t}: ${e.x}% ${e.y}%;` : /\b(padding|margin|border-width|border-radius)\b/.test(t) ? Tr(t, e) : `${t}: ${e};`, Cn = (t) => {
  const e = {
    desktop: "",
    tablet: "",
    mobile: ""
  };
  return Sr(t).forEach((i) => {
    i.includes("device") ? (t[i].desktop && (e.desktop += wt(i, t[i].desktop)), t[i].tablet && (e.tablet += wt(i, t[i].tablet)), t[i].mobile && (e.mobile += wt(i, t[i].mobile))) : e.desktop += wt(i, t[i]);
  }), e;
}, Ln = (t, e) => {
  let i = "";
  if (t && e) {
    const c = Cn(e);
    c.desktop && (i += `.${t}{${c.desktop}}
`), c.tablet && (i += `@media screen and (min-width: 768px) and (max-width: 1024px) {
        .${t} {
          ${c.tablet}
        }
      }`), c.mobile && (i += `@media screen and (max-width: 767px) {
        .${t} {
          ${c.mobile}
        }
      }`);
  }
  return i;
};
function Fn(t, e = {}) {
  var i, c, d, h, x, b, $, O;
  const m = {
    cascade: !0,
    enabled: (i = e == null ? void 0 : e.animationEnabled) != null ? i : !1,
    type: (c = e == null ? void 0 : e.animationType) != null ? c : "infinite",
    duration: (h = (d = e == null ? void 0 : e.animateDuration) == null ? void 0 : d.value) != null ? h : void 0,
    effect: (x = e == null ? void 0 : e.animateEffect) != null ? x : void 0,
    infiniteEffect: (b = e == null ? void 0 : e.animateInfiniteEffect) != null ? b : void 0,
    strength: (O = ($ = e == null ? void 0 : e.animateStrength) == null ? void 0 : $.value) != null ? O : void 0,
    ...e
  };
  if (m.type === "infinite")
    return `xb-animation-infinite="${m.infiniteEffect}" style="--xb-animation-infinite-duration: ${m.duration}ms"`;
  let f = `is="xo-animate-${t}"`;
  return m.enabled ? (m.cascade && (f += " xo-cascade"), m.duration && (f += ` xo-duration="${m.duration}"`), m.effect && (f += ` xo-type="${m.effect}"`), m.strength && (f += ` xo-strength="${m.strength}"`), f) : (f += " xo-disabled", f);
}
function Ar(t, e = !1) {
  var i, c, d, h, x;
  if (!t)
    return "";
  const b = e ? "xb-href" : "href", $ = e ? "xb-target" : "target";
  switch (t.actionType) {
    case "url":
      return t.url ? t.openNewTab ? `${b}="${t.url}" ${$}="_blank"` : `${b}="${t.url}"` : "";
    case "email":
      return `${b}="mailto:${t.email}?subject=${(i = t.emailSubject) != null ? i : ""}&body=${(c = t.emailBody) != null ? c : ""}"`;
    case "phone":
      return `${b}="tel:${t.phone}"`;
    case "scroll":
      return `xo-scroll-to ${b}="${(d = t == null ? void 0 : t.scrollTo) != null ? d : ""}" xo-offset="${(x = (h = t == null ? void 0 : t.topOffset) == null ? void 0 : h.value) != null ? x : 0}"`;
    default:
      return "";
  }
}
function Dn(t, { classNames: e = [], style: i = "" }, c = !0) {
  const { settings: d = {} } = t, h = Xt.attribute("deprecated", d), x = Xt.style(d), b = (d == null ? void 0 : d.visibilityEnabled) && (d == null ? void 0 : d.visibility) ? Nr(d == null ? void 0 : d.visibility) : "", $ = typeof (d == null ? void 0 : d.actionEnabled) == "boolean" && (d == null ? void 0 : d.actionEnabled) || typeof (d == null ? void 0 : d.actionEnabled) != "boolean" ? Ar(d == null ? void 0 : d.action) : "", O = (d == null ? void 0 : d.attrsEnabled) && (d == null ? void 0 : d.attributes) ? Qt.attribute(d == null ? void 0 : d.attributes) : "", m = (d == null ? void 0 : d.attrsEnabled) && (d == null ? void 0 : d.attributes) ? Qt.class(d == null ? void 0 : d.attributes) : "";
  let f = Or(...e, b, m, c ? t.id : "");
  f = f ? `class="${f}"` : "";
  let v = [x, i].filter(Boolean).join("; ");
  v = v ? `style="${v}"` : "";
  const N = `${h} ${$} ${O}`;
  return [f, v, N].filter(Boolean).join(" ");
}
class er {
  constructor(e = {}) {
    K(this, "style"), this.style = e;
  }
  static create(e = {}) {
    return new er(e);
  }
  set(e) {
    this.style = {
      ...this.style,
      ...e
    };
  }
  get() {
    return Object.entries(this.style).reduce((e, [i, c]) => {
      let d = i.replace(/([A-Z])/g, "-$1").toLowerCase();
      return d = /^(webkit|moz|ms|o)/.test(d) ? `-${d}` : d, `${e}${d}:${c};`;
    }, "");
  }
}
class tr {
  constructor(e = {}) {
    K(this, "attrs"), this.attrs = e;
  }
  static create(e = {}) {
    return new tr(e);
  }
  set(e) {
    this.attrs = {
      ...this.attrs,
      ...e
    };
  }
  get() {
    return Object.entries(this.attrs).reduce((e, [i, c]) => {
      const d = i.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${e}${d}="${c}" `;
    }, "").trim();
  }
}
const Pn = {
  classNames: Or,
  objectParse: Xr,
  hash: on,
  getAnimateAttr: Fn,
  animateAttr: Xt,
  getStyles: In,
  getBackgroundGradient: Rr,
  htmlAttr: Qt,
  map: xn,
  renderAction: Tn,
  renderBgOverlay: Rn,
  renderBgParallax: Nn,
  renderBgVideo: An,
  setAttrBoolean: jn,
  visibilityClass: Nr,
  getCssVariableParallax: xr,
  getCssVariableModifier: Ln,
  actionAttr: Ar,
  elementAttr: Dn,
  Style: er,
  Attribute: tr
};
var Bn = {
  aliceblue: "f0f8ff",
  antiquewhite: "faebd7",
  aqua: "0ff",
  aquamarine: "7fffd4",
  azure: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "000",
  blanchedalmond: "ffebcd",
  blue: "00f",
  blueviolet: "8a2be2",
  brown: "a52a2a",
  burlywood: "deb887",
  burntsienna: "ea7e5d",
  cadetblue: "5f9ea0",
  chartreuse: "7fff00",
  chocolate: "d2691e",
  coral: "ff7f50",
  cornflowerblue: "6495ed",
  cornsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "0ff",
  darkblue: "00008b",
  darkcyan: "008b8b",
  darkgoldenrod: "b8860b",
  darkgray: "a9a9a9",
  darkgreen: "006400",
  darkgrey: "a9a9a9",
  darkkhaki: "bdb76b",
  darkmagenta: "8b008b",
  darkolivegreen: "556b2f",
  darkorange: "ff8c00",
  darkorchid: "9932cc",
  darkred: "8b0000",
  darksalmon: "e9967a",
  darkseagreen: "8fbc8f",
  darkslateblue: "483d8b",
  darkslategray: "2f4f4f",
  darkslategrey: "2f4f4f",
  darkturquoise: "00ced1",
  darkviolet: "9400d3",
  deeppink: "ff1493",
  deepskyblue: "00bfff",
  dimgray: "696969",
  dimgrey: "696969",
  dodgerblue: "1e90ff",
  firebrick: "b22222",
  floralwhite: "fffaf0",
  forestgreen: "228b22",
  fuchsia: "f0f",
  gainsboro: "dcdcdc",
  ghostwhite: "f8f8ff",
  gold: "ffd700",
  goldenrod: "daa520",
  gray: "808080",
  green: "008000",
  greenyellow: "adff2f",
  grey: "808080",
  honeydew: "f0fff0",
  hotpink: "ff69b4",
  indianred: "cd5c5c",
  indigo: "4b0082",
  ivory: "fffff0",
  khaki: "f0e68c",
  lavender: "e6e6fa",
  lavenderblush: "fff0f5",
  lawngreen: "7cfc00",
  lemonchiffon: "fffacd",
  lightblue: "add8e6",
  lightcoral: "f08080",
  lightcyan: "e0ffff",
  lightgoldenrodyellow: "fafad2",
  lightgray: "d3d3d3",
  lightgreen: "90ee90",
  lightgrey: "d3d3d3",
  lightpink: "ffb6c1",
  lightsalmon: "ffa07a",
  lightseagreen: "20b2aa",
  lightskyblue: "87cefa",
  lightslategray: "789",
  lightslategrey: "789",
  lightsteelblue: "b0c4de",
  lightyellow: "ffffe0",
  lime: "0f0",
  limegreen: "32cd32",
  linen: "faf0e6",
  magenta: "f0f",
  maroon: "800000",
  mediumaquamarine: "66cdaa",
  mediumblue: "0000cd",
  mediumorchid: "ba55d3",
  mediumpurple: "9370db",
  mediumseagreen: "3cb371",
  mediumslateblue: "7b68ee",
  mediumspringgreen: "00fa9a",
  mediumturquoise: "48d1cc",
  mediumvioletred: "c71585",
  midnightblue: "191970",
  mintcream: "f5fffa",
  mistyrose: "ffe4e1",
  moccasin: "ffe4b5",
  navajowhite: "ffdead",
  navy: "000080",
  oldlace: "fdf5e6",
  olive: "808000",
  olivedrab: "6b8e23",
  orange: "ffa500",
  orangered: "ff4500",
  orchid: "da70d6",
  palegoldenrod: "eee8aa",
  palegreen: "98fb98",
  paleturquoise: "afeeee",
  palevioletred: "db7093",
  papayawhip: "ffefd5",
  peachpuff: "ffdab9",
  peru: "cd853f",
  pink: "ffc0cb",
  plum: "dda0dd",
  powderblue: "b0e0e6",
  purple: "800080",
  rebeccapurple: "663399",
  red: "f00",
  rosybrown: "bc8f8f",
  royalblue: "4169e1",
  saddlebrown: "8b4513",
  salmon: "fa8072",
  sandybrown: "f4a460",
  seagreen: "2e8b57",
  seashell: "fff5ee",
  sienna: "a0522d",
  silver: "c0c0c0",
  skyblue: "87ceeb",
  slateblue: "6a5acd",
  slategray: "708090",
  slategrey: "708090",
  snow: "fffafa",
  springgreen: "00ff7f",
  steelblue: "4682b4",
  tan: "d2b48c",
  teal: "008080",
  thistle: "d8bfd8",
  tomato: "ff6347",
  turquoise: "40e0d0",
  violet: "ee82ee",
  wheat: "f5deb3",
  white: "fff",
  whitesmoke: "f5f5f5",
  yellow: "ff0",
  yellowgreen: "9acd32"
};
Mn(Bn);
function Mn(t) {
  var e = {};
  for (var i in t)
    t.hasOwnProperty(i) && (e[t[i]] = i);
  return e;
}
var Vn = { exports: {} }, et = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var br;
function Hn() {
  if (br)
    return et;
  br = 1;
  var t = Fe, e = Symbol.for("react.element"), i = Symbol.for("react.fragment"), c = Object.prototype.hasOwnProperty, d = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, h = { key: !0, ref: !0, __self: !0, __source: !0 };
  function x(b, $, O) {
    var m, f = {}, v = null, N = null;
    O !== void 0 && (v = "" + O), $.key !== void 0 && (v = "" + $.key), $.ref !== void 0 && (N = $.ref);
    for (m in $)
      c.call($, m) && !h.hasOwnProperty(m) && (f[m] = $[m]);
    if (b && b.defaultProps)
      for (m in $ = b.defaultProps, $)
        f[m] === void 0 && (f[m] = $[m]);
    return { $$typeof: e, type: b, key: v, ref: N, props: f, _owner: d.current };
  }
  return et.Fragment = i, et.jsx = x, et.jsxs = x, et;
}
var St = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var yr;
function Wn() {
  return yr || (yr = 1, process.env.NODE_ENV !== "production" && function() {
    var t = Fe, e = Symbol.for("react.element"), i = Symbol.for("react.portal"), c = Symbol.for("react.fragment"), d = Symbol.for("react.strict_mode"), h = Symbol.for("react.profiler"), x = Symbol.for("react.provider"), b = Symbol.for("react.context"), $ = Symbol.for("react.forward_ref"), O = Symbol.for("react.suspense"), m = Symbol.for("react.suspense_list"), f = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), N = Symbol.for("react.offscreen"), C = Symbol.iterator, L = "@@iterator";
    function j(a) {
      if (a === null || typeof a != "object")
        return null;
      var y = C && a[C] || a[L];
      return typeof y == "function" ? y : null;
    }
    var B = t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function S(a) {
      {
        for (var y = arguments.length, A = new Array(y > 1 ? y - 1 : 0), V = 1; V < y; V++)
          A[V - 1] = arguments[V];
        M("error", a, A);
      }
    }
    function M(a, y, A) {
      {
        var V = B.ReactDebugCurrentFrame, G = V.getStackAddendum();
        G !== "" && (y += "%s", A = A.concat([G]));
        var X = A.map(function(z) {
          return String(z);
        });
        X.unshift("Warning: " + y), Function.prototype.apply.call(console[a], console, X);
      }
    }
    var D = !1, g = !1, R = !1, E = !1, F = !1, T;
    T = Symbol.for("react.module.reference");
    function q(a) {
      return !!(typeof a == "string" || typeof a == "function" || a === c || a === h || F || a === d || a === O || a === m || E || a === N || D || g || R || typeof a == "object" && a !== null && (a.$$typeof === v || a.$$typeof === f || a.$$typeof === x || a.$$typeof === b || a.$$typeof === $ || a.$$typeof === T || a.getModuleId !== void 0));
    }
    function U(a, y, A) {
      var V = a.displayName;
      if (V)
        return V;
      var G = y.displayName || y.name || "";
      return G !== "" ? A + "(" + G + ")" : A;
    }
    function Y(a) {
      return a.displayName || "Context";
    }
    function J(a) {
      if (a == null)
        return null;
      if (typeof a.tag == "number" && S("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof a == "function")
        return a.displayName || a.name || null;
      if (typeof a == "string")
        return a;
      switch (a) {
        case c:
          return "Fragment";
        case i:
          return "Portal";
        case h:
          return "Profiler";
        case d:
          return "StrictMode";
        case O:
          return "Suspense";
        case m:
          return "SuspenseList";
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case b:
            var y = a;
            return Y(y) + ".Consumer";
          case x:
            var A = a;
            return Y(A._context) + ".Provider";
          case $:
            return U(a, a.render, "ForwardRef");
          case f:
            var V = a.displayName || null;
            return V !== null ? V : J(a.type) || "Memo";
          case v: {
            var G = a, X = G._payload, z = G._init;
            try {
              return J(z(X));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var ne = Object.assign, se = 0, ue, le, Oe, $e, Ie, ce, De;
    function nt() {
    }
    nt.__reactDisabledLog = !0;
    function Ot() {
      {
        if (se === 0) {
          ue = console.log, le = console.info, Oe = console.warn, $e = console.error, Ie = console.group, ce = console.groupCollapsed, De = console.groupEnd;
          var a = {
            configurable: !0,
            enumerable: !0,
            value: nt,
            writable: !0
          };
          Object.defineProperties(console, {
            info: a,
            log: a,
            warn: a,
            error: a,
            group: a,
            groupCollapsed: a,
            groupEnd: a
          });
        }
        se++;
      }
    }
    function It() {
      {
        if (se--, se === 0) {
          var a = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: ne({}, a, {
              value: ue
            }),
            info: ne({}, a, {
              value: le
            }),
            warn: ne({}, a, {
              value: Oe
            }),
            error: ne({}, a, {
              value: $e
            }),
            group: ne({}, a, {
              value: Ie
            }),
            groupCollapsed: ne({}, a, {
              value: ce
            }),
            groupEnd: ne({}, a, {
              value: De
            })
          });
        }
        se < 0 && S("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var Pe = B.ReactCurrentDispatcher, Be;
    function Re(a, y, A) {
      {
        if (Be === void 0)
          try {
            throw Error();
          } catch (G) {
            var V = G.stack.trim().match(/\n( *(at )?)/);
            Be = V && V[1] || "";
          }
        return `
` + Be + a;
      }
    }
    var Me = !1, Ne;
    {
      var xt = typeof WeakMap == "function" ? WeakMap : Map;
      Ne = new xt();
    }
    function ot(a, y) {
      if (!a || Me)
        return "";
      {
        var A = Ne.get(a);
        if (A !== void 0)
          return A;
      }
      var V;
      Me = !0;
      var G = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var X;
      X = Pe.current, Pe.current = null, Ot();
      try {
        if (y) {
          var z = function() {
            throw Error();
          };
          if (Object.defineProperty(z.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(z, []);
            } catch (ae) {
              V = ae;
            }
            Reflect.construct(a, [], z);
          } else {
            try {
              z.call();
            } catch (ae) {
              V = ae;
            }
            a.call(z.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (ae) {
            V = ae;
          }
          a();
        }
      } catch (ae) {
        if (ae && V && typeof ae.stack == "string") {
          for (var H = ae.stack.split(`
`), ie = V.stack.split(`
`), ee = H.length - 1, re = ie.length - 1; ee >= 1 && re >= 0 && H[ee] !== ie[re]; )
            re--;
          for (; ee >= 1 && re >= 0; ee--, re--)
            if (H[ee] !== ie[re]) {
              if (ee !== 1 || re !== 1)
                do
                  if (ee--, re--, re < 0 || H[ee] !== ie[re]) {
                    var fe = `
` + H[ee].replace(" at new ", " at ");
                    return a.displayName && fe.includes("<anonymous>") && (fe = fe.replace("<anonymous>", a.displayName)), typeof a == "function" && Ne.set(a, fe), fe;
                  }
                while (ee >= 1 && re >= 0);
              break;
            }
        }
      } finally {
        Me = !1, Pe.current = X, It(), Error.prepareStackTrace = G;
      }
      var ye = a ? a.displayName || a.name : "", pe = ye ? Re(ye) : "";
      return typeof a == "function" && Ne.set(a, pe), pe;
    }
    function Tt(a, y, A) {
      return ot(a, !1);
    }
    function Rt(a) {
      var y = a.prototype;
      return !!(y && y.isReactComponent);
    }
    function de(a, y, A) {
      if (a == null)
        return "";
      if (typeof a == "function")
        return ot(a, Rt(a));
      if (typeof a == "string")
        return Re(a);
      switch (a) {
        case O:
          return Re("Suspense");
        case m:
          return Re("SuspenseList");
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case $:
            return Tt(a.render);
          case f:
            return de(a.type, y, A);
          case v: {
            var V = a, G = V._payload, X = V._init;
            try {
              return de(X(G), y, A);
            } catch {
            }
          }
        }
      return "";
    }
    var xe = Object.prototype.hasOwnProperty, Ve = {}, Te = B.ReactDebugCurrentFrame;
    function we(a) {
      if (a) {
        var y = a._owner, A = de(a.type, a._source, y ? y.type : null);
        Te.setExtraStackFrame(A);
      } else
        Te.setExtraStackFrame(null);
    }
    function He(a, y, A, V, G) {
      {
        var X = Function.call.bind(xe);
        for (var z in a)
          if (X(a, z)) {
            var H = void 0;
            try {
              if (typeof a[z] != "function") {
                var ie = Error((V || "React class") + ": " + A + " type `" + z + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof a[z] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw ie.name = "Invariant Violation", ie;
              }
              H = a[z](y, z, V, A, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (ee) {
              H = ee;
            }
            H && !(H instanceof Error) && (we(G), S("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", V || "React class", A, z, typeof H), we(null)), H instanceof Error && !(H.message in Ve) && (Ve[H.message] = !0, we(G), S("Failed %s type: %s", A, H.message), we(null));
          }
      }
    }
    var We = Array.isArray;
    function Ae(a) {
      return We(a);
    }
    function it(a) {
      {
        var y = typeof Symbol == "function" && Symbol.toStringTag, A = y && a[Symbol.toStringTag] || a.constructor.name || "Object";
        return A;
      }
    }
    function at(a) {
      try {
        return Ue(a), !1;
      } catch {
        return !0;
      }
    }
    function Ue(a) {
      return "" + a;
    }
    function ze(a) {
      if (at(a))
        return S("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", it(a)), Ue(a);
    }
    var Se = B.ReactCurrentOwner, lt = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ke, qe, je;
    je = {};
    function st(a) {
      if (xe.call(a, "ref")) {
        var y = Object.getOwnPropertyDescriptor(a, "ref").get;
        if (y && y.isReactWarning)
          return !1;
      }
      return a.ref !== void 0;
    }
    function ut(a) {
      if (xe.call(a, "key")) {
        var y = Object.getOwnPropertyDescriptor(a, "key").get;
        if (y && y.isReactWarning)
          return !1;
      }
      return a.key !== void 0;
    }
    function Ge(a, y) {
      if (typeof a.ref == "string" && Se.current && y && Se.current.stateNode !== y) {
        var A = J(Se.current.type);
        je[A] || (S('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', J(Se.current.type), a.ref), je[A] = !0);
      }
    }
    function Nt(a, y) {
      {
        var A = function() {
          Ke || (Ke = !0, S("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", y));
        };
        A.isReactWarning = !0, Object.defineProperty(a, "key", {
          get: A,
          configurable: !0
        });
      }
    }
    function At(a, y) {
      {
        var A = function() {
          qe || (qe = !0, S("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", y));
        };
        A.isReactWarning = !0, Object.defineProperty(a, "ref", {
          get: A,
          configurable: !0
        });
      }
    }
    var Je = function(a, y, A, V, G, X, z) {
      var H = {
        $$typeof: e,
        type: a,
        key: y,
        ref: A,
        props: z,
        _owner: X
      };
      return H._store = {}, Object.defineProperty(H._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(H, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: V
      }), Object.defineProperty(H, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: G
      }), Object.freeze && (Object.freeze(H.props), Object.freeze(H)), H;
    };
    function ct(a, y, A, V, G) {
      {
        var X, z = {}, H = null, ie = null;
        A !== void 0 && (ze(A), H = "" + A), ut(y) && (ze(y.key), H = "" + y.key), st(y) && (ie = y.ref, Ge(y, G));
        for (X in y)
          xe.call(y, X) && !lt.hasOwnProperty(X) && (z[X] = y[X]);
        if (a && a.defaultProps) {
          var ee = a.defaultProps;
          for (X in ee)
            z[X] === void 0 && (z[X] = ee[X]);
        }
        if (H || ie) {
          var re = typeof a == "function" ? a.displayName || a.name || "Unknown" : a;
          H && Nt(z, re), ie && At(z, re);
        }
        return Je(a, H, ie, G, V, Se.current, z);
      }
    }
    var Xe = B.ReactCurrentOwner, me = B.ReactDebugCurrentFrame;
    function Ee(a) {
      if (a) {
        var y = a._owner, A = de(a.type, a._source, y ? y.type : null);
        me.setExtraStackFrame(A);
      } else
        me.setExtraStackFrame(null);
    }
    var Qe;
    Qe = !1;
    function Ce(a) {
      return typeof a == "object" && a !== null && a.$$typeof === e;
    }
    function ft() {
      {
        if (Xe.current) {
          var a = J(Xe.current.type);
          if (a)
            return `

Check the render method of \`` + a + "`.";
        }
        return "";
      }
    }
    function jt(a) {
      {
        if (a !== void 0) {
          var y = a.fileName.replace(/^.*[\\\/]/, ""), A = a.lineNumber;
          return `

Check your code at ` + y + ":" + A + ".";
        }
        return "";
      }
    }
    var dt = {};
    function Ct(a) {
      {
        var y = ft();
        if (!y) {
          var A = typeof a == "string" ? a : a.displayName || a.name;
          A && (y = `

Check the top-level render call using <` + A + ">.");
        }
        return y;
      }
    }
    function pt(a, y) {
      {
        if (!a._store || a._store.validated || a.key != null)
          return;
        a._store.validated = !0;
        var A = Ct(y);
        if (dt[A])
          return;
        dt[A] = !0;
        var V = "";
        a && a._owner && a._owner !== Xe.current && (V = " It was passed a child from " + J(a._owner.type) + "."), Ee(a), S('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', A, V), Ee(null);
      }
    }
    function vt(a, y) {
      {
        if (typeof a != "object")
          return;
        if (Ae(a))
          for (var A = 0; A < a.length; A++) {
            var V = a[A];
            Ce(V) && pt(V, y);
          }
        else if (Ce(a))
          a._store && (a._store.validated = !0);
        else if (a) {
          var G = j(a);
          if (typeof G == "function" && G !== a.entries)
            for (var X = G.call(a), z; !(z = X.next()).done; )
              Ce(z.value) && pt(z.value, y);
        }
      }
    }
    function Lt(a) {
      {
        var y = a.type;
        if (y == null || typeof y == "string")
          return;
        var A;
        if (typeof y == "function")
          A = y.propTypes;
        else if (typeof y == "object" && (y.$$typeof === $ || y.$$typeof === f))
          A = y.propTypes;
        else
          return;
        if (A) {
          var V = J(y);
          He(A, a.props, "prop", V, a);
        } else if (y.PropTypes !== void 0 && !Qe) {
          Qe = !0;
          var G = J(y);
          S("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", G || "Unknown");
        }
        typeof y.getDefaultProps == "function" && !y.getDefaultProps.isReactClassApproved && S("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function Ft(a) {
      {
        for (var y = Object.keys(a.props), A = 0; A < y.length; A++) {
          var V = y[A];
          if (V !== "children" && V !== "key") {
            Ee(a), S("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", V), Ee(null);
            break;
          }
        }
        a.ref !== null && (Ee(a), S("Invalid attribute `ref` supplied to `React.Fragment`."), Ee(null));
      }
    }
    var mt = {};
    function ht(a, y, A, V, G, X) {
      {
        var z = q(a);
        if (!z) {
          var H = "";
          (a === void 0 || typeof a == "object" && a !== null && Object.keys(a).length === 0) && (H += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var ie = jt(G);
          ie ? H += ie : H += ft();
          var ee;
          a === null ? ee = "null" : Ae(a) ? ee = "array" : a !== void 0 && a.$$typeof === e ? (ee = "<" + (J(a.type) || "Unknown") + " />", H = " Did you accidentally export a JSX literal instead of a component?") : ee = typeof a, S("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", ee, H);
        }
        var re = ct(a, y, A, G, X);
        if (re == null)
          return re;
        if (z) {
          var fe = y.children;
          if (fe !== void 0)
            if (V)
              if (Ae(fe)) {
                for (var ye = 0; ye < fe.length; ye++)
                  vt(fe[ye], a);
                Object.freeze && Object.freeze(fe);
              } else
                S("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              vt(fe, a);
        }
        if (xe.call(y, "key")) {
          var pe = J(a), ae = Object.keys(y).filter(function(Le) {
            return Le !== "key";
          }), ge = ae.length > 0 ? "{key: someKey, " + ae.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!mt[pe + ge]) {
            var Mt = ae.length > 0 ? "{" + ae.join(": ..., ") + ": ...}" : "{}";
            S(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ge, pe, Mt, pe), mt[pe + ge] = !0;
          }
        }
        return a === c ? Ft(re) : Lt(re), re;
      }
    }
    function gt(a, y, A) {
      return ht(a, y, A, !0);
    }
    function Dt(a, y, A) {
      return ht(a, y, A, !1);
    }
    var Pt = Dt, Bt = gt;
    St.Fragment = c, St.jsx = Pt, St.jsxs = Bt;
  }()), St;
}
(function(t) {
  process.env.NODE_ENV === "production" ? t.exports = Hn() : t.exports = Wn();
})(Vn);
class Un {
  constructor(e, i) {
    he(this, "template");
    he(this, "designMode");
    he(this, "emptyAttr", () => (this.template = this.template.replace(/\s=""/g, "").replace(/class=["']\s*["']/g, "").replace(/style=["']\s*["']/g, ""), this));
    he(this, "animateAttr", () => (this.designMode || (this.template = this.template.replace(/xo-animate="none"/g, "")), this));
    he(this, "decodeHtmlEntities", () => (this.template = this.template.replace(/&gt;/g, ">").replace(/&lt;/g, "<"), this));
    he(this, "getTemplate", () => this.template.trim());
    this.template = e, this.designMode = i;
  }
}
const zn = (t, e) => new Un(t, e);
class Kn {
  constructor(e) {
    he(this, "template");
    he(this, "addOptionalChaining", () => (this.template = this.template.replace(/(settings\.)(\w)/g, "settings?.$2"), this));
    he(this, "handleComment", () => (/<!--/g.test(this.template) && (this.template = this.template.replace(/<!--([\s\S]*?)-->/g, "")), /{%\s+comment\s+%}/g.test(this.template) && (this.template = this.template.replace(/{%\s+comment\s+%}([\s\S]*?){%\s+endcomment\s+%}/g, "")), this));
    he(this, "getTemplate", () => this.template.trim());
    this.template = e;
  }
}
const qn = (t) => new Kn(t);
class _r extends Error {
  constructor(e) {
    super(e), this.name = "TemplateEngineError", this.message = e;
  }
}
const Et = new kt();
async function Gn(t) {
  try {
    const e = await t();
    Et.emit("loaderSuccess", e);
  } catch (e) {
    e instanceof Error && Et.emit("loaderError", e.message);
  }
}
function $r({ index: t = 0, designMode: e = !0, previewMode: i = !1, template: c, script: d = "", element: h = {}, rootElements: x, children: b = [], parent: $ = {}, globalSettings: O = {}, pageSettings: m = {}, startSignal: f = "", endSignal: v = "", staticLoaderData: N = {}, dataId: C, plan: L }) {
  var F;
  const j = x[h.elementId], B = (F = gn(j == null ? void 0 : j.settings)) != null ? F : {}, S = {
    ...h,
    settings: { ...B, ...h.settings }
  }, M = {
    ...Pn,
    staticLoader: Gn,
    staticLoaderData: N,
    designMode: e,
    previewMode: i,
    dataId: C,
    plan: L,
    element: { ...tt.omit(S, "template"), index: t },
    children: b.map((T) => tt.omit(T, "template")),
    parent: tt.omit($, "template"),
    global: {
      settings: O
    },
    page: {
      settings: m
    }
  }, D = Sr(M), g = Jr(M), R = nn(c) && !(j != null && j.serverCompileDisabled) ? `{% assign designMode = ${e} %}
` : "", E = new Function(...D, tt.unescape(`
        ${d}
        return \`${f}${R}${qn(c).handleComment().addOptionalChaining().getTemplate()}${v}\`;
      `));
  return zn(E(...g), e).emptyAttr().animateAttr().decodeHtmlEntities().getTemplate();
}
function wr(t, e, i) {
  if (!e)
    return i;
  throw t instanceof Error ? new _r(t.message) : new _r("Unknown error");
}
class eo {
  static compile({ index: e = 0, designMode: i = !0, previewMode: c = !1, template: d, script: h = "", element: x = {}, rootElements: b, children: $ = [], parent: O = {}, globalSettings: m = {}, pageSettings: f = {}, throwOnError: v = !0, startSignal: N = "", endSignal: C = "", staticLoaderData: L = {}, dataId: j, plan: B }) {
    try {
      const S = d.replace(/{#/g, "{").replace(/#}/g, "}");
      return $r({
        index: e,
        designMode: i,
        previewMode: c,
        dataId: j,
        plan: B,
        template: S,
        script: h,
        element: x,
        rootElements: b,
        children: $,
        parent: O,
        globalSettings: m,
        pageSettings: f,
        startSignal: N,
        endSignal: C,
        staticLoaderData: L
      });
    } catch (S) {
      return wr(S, v, d);
    }
  }
  static $compile({ index: e = 0, template: i, script: c = "", element: d = {}, rootElements: h, children: x = [], parent: b = {}, throwOnError: $ = !0, startSignal: O = "", endSignal: m = "", staticLoaderData: f = {}, dataId: v, plan: N }) {
    try {
      const C = "_____join-start-signal_____", L = "_____join-end-signal_____", j = "_____str-temp-signal_____";
      return $r({
        index: e,
        designMode: !0,
        previewMode: !1,
        dataId: v,
        plan: N,
        template: i.replace(/`/g, j).replace(/\${#.*#}/g, (S) => S.replaceAll(j, "`")).replace(/\${/g, C).replace(/}/g, L).replaceAll(`${C}#`, "${").replaceAll(`#${L}`, "}"),
        script: c.replaceAll("${#", "${").replaceAll("#}", "}"),
        element: d,
        rootElements: h,
        children: x,
        parent: b,
        startSignal: O,
        endSignal: m,
        staticLoaderData: f
      }).replaceAll(C, "${").replaceAll(L, "}").replaceAll(j, "`");
    } catch (C) {
      return wr(C, $, i);
    }
  }
  static removeScript(e) {
    return e.replace(/<script\s+design-mode([\s\S]*?)<\/script>/g, "");
  }
  static removeStyle(e) {
    return e.replace(/<style\s+design-mode([\s\S]*?)<\/style>/g, "");
  }
  static getScriptContent(e) {
    const i = e.match(/<script\s+design-mode([\s\S]*?)<\/script>/g);
    return i ? i.join("").trim().replace(/^<script\s+design-mode([\s\S]*?)>/g, "").replace(/<\/script>$/g, "") : "";
  }
  static getStaticLoaderDataAsync() {
    return new Promise((e, i) => {
      Et.on("loaderSuccess", (c) => {
        e(c);
      }), Et.on("loaderError", (c) => {
        const d = new Error(c);
        i(d);
      });
    });
  }
}
const jr = {
  table: "xo-table",
  thead: "xo-thead",
  tbody: "xo-tbody",
  tr: "xo-tr",
  td: "xo-td",
  th: "xo-th",
  tfoot: "xo-tfoot"
};
function to(t) {
  return Yt(jr).reduce((e, [i, c]) => e.replace(new RegExp(`<${i}>`, "g"), `<${c}>`).replace(new RegExp(`<${i}\\s`, "g"), `<${c} `).replace(new RegExp(`</${i}>`, "g"), `</${c}>`), t);
}
function ro(t) {
  return Yt(jr).reduce((e, [i, c]) => e.replace(new RegExp(`<${c}>`, "g"), `<${i}>`).replace(new RegExp(`<${c}\\s`, "g"), `<${i} `).replace(new RegExp(`</${c}>`, "g"), `</${i}>`), t);
}
export {
  eo as TemplateEngine,
  _r as TemplateEngineError,
  ro as tableDecode,
  to as tableEncode
};
