import { html as d, css as P, state as u, property as U, customElement as D } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as E } from "@umbraco-cms/backoffice/lit-element";
import { UmbPropertyValueChangeEvent as O } from "@umbraco-cms/backoffice/property-editor";
import { UmbDocumentDetailRepository as q, UmbDocumentItemRepository as R, UMB_DOCUMENT_WORKSPACE_CONTEXT as M } from "@umbraco-cms/backoffice/document";
import { UmbMediaDetailRepository as B } from "@umbraco-cms/backoffice/media";
var V = Object.defineProperty, A = Object.getOwnPropertyDescriptor, C = (t) => {
  throw TypeError(t);
}, l = (t, e, i, s) => {
  for (var n = s > 1 ? void 0 : s ? A(e, i) : e, c = t.length - 1, a; c >= 0; c--)
    (a = t[c]) && (n = (s ? a(e, i, n) : a(n)) || n);
  return s && n && V(e, i, n), n;
}, b = (t, e, i) => e.has(t) || C("Cannot " + i), p = (t, e, i) => (b(t, e, "read from private field"), i ? i.call(t) : e.get(t)), m = (t, e, i) => e.has(t) ? C("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), I = (t, e, i, s) => (b(t, e, "write to private field"), e.set(t, i), i), h = (t, e, i) => (b(t, e, "access private method"), i), g, y, w, k, o, $, x, W, _, H, v, f;
let r = class extends E {
  constructor() {
    super(), m(this, o), this._imgWidth = 400, this._imgHeight = 0, this.value = {
      image: null,
      width: null,
      height: null,
      percentX: null,
      percentY: null,
      left: null,
      top: null
    }, m(this, g), m(this, y, new q(this)), m(this, w, new R(this)), m(this, k, new B(this));
  }
  set config(t) {
    this._config = t, h(this, o, _).call(this);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(M, (t) => {
      I(this, g, t), h(this, o, _).call(this);
    });
  }
  render() {
    var t, e;
    return d`
      <div class="imagehotspot-editor theme${this._imgTheme}">
        <div class="imagehotspot-image" @click="${h(this, o, $)}">
          ${this._imgSrc ? d`
              <img src="${this._imgSrc}?width=${this._imgWidth}" srcset="${this._imgSrc}?width=${(this._imgWidth || 0) * 2} 2x" width="${this._imgWidth || 0}" height="${this._imgHeight || 0}" />
            ` : d`
              <div class="imagehotspot-placeholder-image"></div>
            `}
          ${(t = this.value) != null && t.left && ((e = this.value) != null && e.top) ? d`
              <div id="imagehotspot-hotspot" class="imagehotspot-hotspot" draggable="true" @dragend="${h(this, o, x)}" style="left:${this.value.left}px;top:${this.value.top}px;"></div>
            ` : ""}
        </div>
      </div>
    `;
  }
};
g = /* @__PURE__ */ new WeakMap();
y = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
$ = function(t) {
  h(this, o, W).call(this, t.offsetX, t.offsetY);
};
x = function(t) {
  var e, i;
  if (t.dataTransfer && this.value.left && this.value.top) {
    const s = this.value.left + t.offsetX - ((e = t.target) == null ? void 0 : e.clientWidth) / 2, n = this.value.top + t.offsetY - ((i = t.target) == null ? void 0 : i.clientHeight) / 2;
    h(this, o, W).call(this, s, n);
  }
};
W = function(t, e) {
  this.value = {
    left: t,
    top: e,
    percentX: t / this._imgWidth,
    percentY: e / this._imgHeight,
    width: this._imgWidth,
    height: this._imgHeight,
    image: this._imgSrc
  }, this.dispatchEvent(new O()), this.requestUpdate();
};
_ = async function() {
  var t, e;
  if (this._config && p(this, g)) {
    const i = (t = this._config.getValueByAlias("imageSrc")) == null ? void 0 : t.toString();
    let s = i ? p(this, g).getPropertyValue(i) : null;
    if (i && !s && (s = await h(this, o, v).call(this, p(this, g).getUnique(), i)), s && typeof s == "object") {
      let c = s[0];
      const a = await p(this, k).requestByUnique(c == null ? void 0 : c.mediaKey);
      this._imgSrc = (e = a == null ? void 0 : a.data) == null ? void 0 : e.urls[0].url;
      const S = h(this, o, f).call(this, "umbracoWidth", a == null ? void 0 : a.data) || 0, T = h(this, o, f).call(this, "umbracoHeight", a == null ? void 0 : a.data) || 0;
      this._imgWidth = this._config.getValueByAlias("width") || 400, this._imgHeight = this._imgWidth * T / S;
    }
    switch (this._config.getValueByAlias("theme") || "Red") {
      case "Red":
        this._imgTheme = 1;
        break;
      case "Green":
        this._imgTheme = 2;
        break;
      case "Blue":
        this._imgTheme = 3;
        break;
      case "Orange":
        this._imgTheme = 4;
        break;
      default:
        this._imgTheme = 1;
        break;
    }
  }
};
H = async function(t) {
  var e, i;
  if (t) {
    const s = await p(this, w).requestItems([t]);
    return s != null && s.data ? (i = (e = s == null ? void 0 : s.data[0]) == null ? void 0 : e.parent) == null ? void 0 : i.unique : void 0;
  }
};
v = async function(t, e) {
  if (t) {
    const i = await p(this, y).requestByUnique(t);
    return h(this, o, f).call(this, e, i == null ? void 0 : i.data) || await h(this, o, v).call(this, await h(this, o, H).call(this, t), e);
  }
  return null;
};
f = function(t, e) {
  if (!e)
    return null;
  const i = e == null ? void 0 : e.values.find((s) => s.alias === t);
  return i ? i.value : null;
};
r.properties = {
  value: { type: Object },
  config: { type: Object }
};
r.styles = P`
    .imagehotspot-editor {
      border: 1px solid #bbbabf;
      display: inline-block;
      line-height: 0;
    }

    .imagehotspot-image {
      position: relative;
      display: inline-block;
      cursor: crosshair;
    }

    .imagehotspot-hotspot {
      background: rgba(0, 0, 0, 0.5);
      position: absolute;
      width: 21px;
      height: 21px;
      border-radius: 50%;
      border: 3px solid #fff;
      opacity: 0.8;
      transform: translate(-50%, -50%);
      cursor: move;
    }

    .imagehotspot-placeholder-image {
      display: block;
      width: 400px;
      height: 300px;
      border: 1px solid #999;
      background: rgba(0, 0, 0, 0.1);
    }

    .theme1 .imagehotspot-hotspot { background: rgb(223, 59, 58); }
    .theme2 .imagehotspot-hotspot { background: rgb(100, 189, 99); }
    .theme3 .imagehotspot-hotspot { background: rgb(54, 180, 246); }
    .theme4 .imagehotspot-hotspot { background: rgb(239, 144, 0); }
  `;
l([
  u()
], r.prototype, "_config", 2);
l([
  u()
], r.prototype, "_imgSrc", 2);
l([
  u()
], r.prototype, "_imgWidth", 2);
l([
  u()
], r.prototype, "_imgHeight", 2);
l([
  u()
], r.prototype, "_imgTheme", 2);
l([
  U({ attribute: !1 })
], r.prototype, "config", 1);
l([
  U({ attribute: !1 })
], r.prototype, "value", 2);
r = l([
  D("image-hotspot")
], r);
const N = r;
export {
  r as ImageHotspot,
  N as default
};
//# sourceMappingURL=imagehotspot.element-BwGSLmNw.js.map
