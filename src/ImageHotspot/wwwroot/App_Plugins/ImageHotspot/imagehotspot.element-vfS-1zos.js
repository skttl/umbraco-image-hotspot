import { html as f, css as R, state as d, property as $, customElement as D } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement as E } from "@umbraco-cms/backoffice/lit-element";
import { UmbPropertyValueChangeEvent as O } from "@umbraco-cms/backoffice/property-editor";
import { UmbDocumentDetailRepository as M, UmbDocumentItemRepository as B, UMB_DOCUMENT_WORKSPACE_CONTEXT as V } from "@umbraco-cms/backoffice/document";
import { UmbMediaDetailRepository as A } from "@umbraco-cms/backoffice/media";
import { UmbImagingRepository as I } from "@umbraco-cms/backoffice/imaging";
var X = Object.defineProperty, Y = Object.getOwnPropertyDescriptor, x = (t) => {
  throw TypeError(t);
}, n = (t, e, i, s) => {
  for (var a = s > 1 ? void 0 : s ? Y(e, i) : e, u = t.length - 1, l; u >= 0; u--)
    (l = t[u]) && (a = (s ? l(e, i, a) : l(a)) || a);
  return s && a && X(e, i, a), a;
}, y = (t, e, i) => e.has(t) || x("Cannot " + i), c = (t, e, i) => (y(t, e, "read from private field"), i ? i.call(t) : e.get(t)), g = (t, e, i) => e.has(t) ? x("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, i), F = (t, e, i, s) => (y(t, e, "write to private field"), e.set(t, i), i), h = (t, e, i) => (y(t, e, "access private method"), i), m, w, k, W, U, o, H, T, C, v, S, b, _;
let r = class extends E {
  constructor() {
    super(), g(this, o), this._imgWidth = 400, this._imgHeight = 0, this.value = {
      image: null,
      width: null,
      height: null,
      percentX: null,
      percentY: null,
      left: null,
      top: null
    }, g(this, m), g(this, w, new M(this)), g(this, k, new B(this)), g(this, W, new A(this)), g(this, U, new I(this));
  }
  set config(t) {
    this._config = t, h(this, o, v).call(this);
  }
  connectedCallback() {
    super.connectedCallback(), this.consumeContext(V, (t) => {
      F(this, m, t), h(this, o, v).call(this);
    });
  }
  render() {
    var t, e;
    return f`
      <div class="imagehotspot-editor theme${this._imgTheme}">
        <div class="imagehotspot-image" @click="${h(this, o, H)}">
          ${this._imgSrc ? f`
              <img src="${this._imgSrc}?width=${this._imgWidth}" srcset="${this._imgSrc}?width=${(this._imgWidth || 0) * 2} 2x" width="${this._imgWidth || 0}" height="${this._imgHeight || 0}" />
            ` : f`
              <div class="imagehotspot-placeholder-image"></div>
            `}
          ${(t = this.value) != null && t.left && ((e = this.value) != null && e.top) ? f`
              <div id="imagehotspot-hotspot" class="imagehotspot-hotspot" draggable="true" @dragend="${h(this, o, T)}" style="left:${this.value.left}px;top:${this.value.top}px;"></div>
            ` : ""}
        </div>
      </div>
    `;
  }
};
m = /* @__PURE__ */ new WeakMap();
w = /* @__PURE__ */ new WeakMap();
k = /* @__PURE__ */ new WeakMap();
W = /* @__PURE__ */ new WeakMap();
U = /* @__PURE__ */ new WeakMap();
o = /* @__PURE__ */ new WeakSet();
H = function(t) {
  h(this, o, C).call(this, t.offsetX, t.offsetY);
};
T = function(t) {
  var e, i;
  if (t.dataTransfer && this.value.left && this.value.top) {
    const s = this.value.left + t.offsetX - ((e = t.target) == null ? void 0 : e.clientWidth) / 2, a = this.value.top + t.offsetY - ((i = t.target) == null ? void 0 : i.clientHeight) / 2;
    h(this, o, C).call(this, s, a);
  }
};
C = function(t, e) {
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
v = async function() {
  var t, e, i;
  if (this._config && c(this, m)) {
    const s = (t = this._config.getValueByAlias("imageSrc")) == null ? void 0 : t.toString();
    let a = s ? c(this, m).getPropertyValue(s) : null;
    if (s && !a && (a = await h(this, o, b).call(this, c(this, m).getUnique(), s)), a && typeof a == "object") {
      let l = a[0];
      const p = await c(this, W).requestByUnique(l == null ? void 0 : l.mediaKey);
      if (p != null && p.data) {
        const q = h(this, o, _).call(this, "umbracoWidth", p.data) || 0, P = h(this, o, _).call(this, "umbracoHeight", p.data) || 0;
        this._imgWidth = this._config.getValueByAlias("width") || 400, this._imgHeight = this._imgWidth * P / q, this._imgSrc = (i = (e = (await c(this, U).requestThumbnailUrls([p.data.unique], this._imgHeight, this._imgWidth)).data) == null ? void 0 : e[0]) == null ? void 0 : i.url;
      }
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
S = async function(t) {
  var e, i;
  if (t) {
    const s = await c(this, k).requestItems([t]);
    return s != null && s.data ? (i = (e = s == null ? void 0 : s.data[0]) == null ? void 0 : e.parent) == null ? void 0 : i.unique : void 0;
  }
};
b = async function(t, e) {
  if (t) {
    const i = await c(this, w).requestByUnique(t);
    return h(this, o, _).call(this, e, i == null ? void 0 : i.data) || await h(this, o, b).call(this, await h(this, o, S).call(this, t), e);
  }
  return null;
};
_ = function(t, e) {
  if (!e)
    return null;
  const i = e == null ? void 0 : e.values.find((s) => s.alias === t);
  return i ? i.value : null;
};
r.properties = {
  value: { type: Object },
  config: { type: Object }
};
r.styles = R`
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
n([
  d()
], r.prototype, "_config", 2);
n([
  d()
], r.prototype, "_imgSrc", 2);
n([
  d()
], r.prototype, "_imgWidth", 2);
n([
  d()
], r.prototype, "_imgHeight", 2);
n([
  d()
], r.prototype, "_imgTheme", 2);
n([
  $({ attribute: !1 })
], r.prototype, "config", 1);
n([
  $({ attribute: !1 })
], r.prototype, "value", 2);
r = n([
  D("image-hotspot")
], r);
const J = r;
export {
  r as ImageHotspot,
  J as default
};
//# sourceMappingURL=imagehotspot.element-vfS-1zos.js.map
