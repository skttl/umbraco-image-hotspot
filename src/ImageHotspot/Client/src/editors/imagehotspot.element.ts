import { customElement, html, css, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbPropertyValueChangeEvent } from "@umbraco-cms/backoffice/property-editor";
import type { ImageHotspotValue } from "../types/imagehotspotvalue";
import type { UmbPropertyEditorConfigCollection, UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';
import { UMB_DOCUMENT_WORKSPACE_CONTEXT, UmbDocumentWorkspaceContext } from "@umbraco-cms/backoffice/document";
import { UmbDocumentDetailRepository } from "@umbraco-cms/backoffice/document";
import { UmbDocumentItemRepository } from "@umbraco-cms/backoffice/document";
import { UmbMediaDetailRepository } from "@umbraco-cms/backoffice/media";
import { UmbEntityUnique } from "@umbraco-cms/backoffice/entity";
import { UmbElementDetailModel } from "@umbraco-cms/backoffice/content";
import { UmbImagingRepository } from "@umbraco-cms/backoffice/imaging";

@customElement("image-hotspot")
export class ImageHotspot extends UmbLitElement implements UmbPropertyEditorUiElement {

  static properties = {
    value: { type: Object },
    config: { type: Object },
  }

  @state()
  private _config?: UmbPropertyEditorConfigCollection;

  @state()
  private _imgSrc?: string;

  @state()
  private _imgWidth: number = 400;

  @state()
  private _imgHeight: number = 0;

  @state()
  private _imgTheme?: number;

  @property({ attribute: false })
  public set config(config: UmbPropertyEditorConfigCollection) {
    this._config = config;
    this.#setConfig();
  };

  @property({ attribute: false })
  value: ImageHotspotValue = {
    image: null,
    width: null,
    height: null,
    percentX: null,
    percentY: null,
    left: null,
    top: null,
  };

  #documentWorkspaceContext?: UmbDocumentWorkspaceContext;
  #documentDetailRepository = new UmbDocumentDetailRepository(this);
  #documentItemRepository = new UmbDocumentItemRepository(this);
  #mediaDetailRepository = new UmbMediaDetailRepository(this);
  #imagingRepository = new UmbImagingRepository(this);

  #onClick(event: MouseEvent) {
    this.#setPosition(event.offsetX, event.offsetY);
  }

  #onDragEnd(event: DragEvent) {
    if (event.dataTransfer && this.value.left && this.value.top) {
      const left = this.value.left + event.offsetX - ((event.target as HTMLElement)?.clientWidth / 2);
      const top = this.value.top + event.offsetY - ((event.target as HTMLElement)?.clientHeight / 2);
      this.#setPosition(left, top);
    }
  }

  #setPosition(x: number, y: number) {
    this.value = {
      left: x,
      top: y,
      percentX: x / this._imgWidth,
      percentY: y / this._imgHeight,
      width: this._imgWidth,
      height: this._imgHeight,
      image: this._imgSrc
    };
    this.dispatchEvent(new UmbPropertyValueChangeEvent());
    this.requestUpdate();
  }

  async #setConfig() {
    if (this._config && this.#documentWorkspaceContext) {

      const imagePropertyAlias = this._config.getValueByAlias("imageSrc")?.toString();
      let imageValue = imagePropertyAlias ? this.#documentWorkspaceContext.getPropertyValue<Array<any>>(imagePropertyAlias) : null;

      if (imagePropertyAlias && !imageValue) {
        imageValue = await this.#getValueFromUnique(this.#documentWorkspaceContext.getUnique(), imagePropertyAlias);
      }

      if (imageValue && typeof imageValue === 'object') {
        let firstImageValue = imageValue[0];

        const media = await this.#mediaDetailRepository.requestByUnique(firstImageValue?.mediaKey);

        if (media?.data) {
          const mediaWidth = this.#getPropertyValue("umbracoWidth", media.data) || 0;
          const mediaHeight = this.#getPropertyValue("umbracoHeight", media.data) || 0;
          this._imgWidth = this._config.getValueByAlias("width") || 400;
          this._imgHeight = this._imgWidth * mediaHeight / mediaWidth;


          this._imgSrc = (await this.#imagingRepository.requestThumbnailUrls([media.data.unique], this._imgHeight, this._imgWidth)).data?.[0]?.url;
        }
      }

      const theme = this._config.getValueByAlias("theme") || "Red";
      switch (theme) {
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
  }

  async #getParentFromUnique(unique: string | undefined | null) : Promise<UmbEntityUnique | undefined> {
    if (unique) {
      const parent = await this.#documentItemRepository.requestItems([unique]);
      const parentUnique = parent?.data ? parent?.data[0]?.parent?.unique : undefined;
      return parentUnique;
    }
    return undefined;
  }

  async #getValueFromUnique(unique: UmbEntityUnique | undefined | null, alias: string): Promise<Array<any> | null> {
    if (unique) {
      const item = await this.#documentDetailRepository.requestByUnique(unique);
      const value = this.#getPropertyValue(alias, item?.data);
      return value as Array<any> || await this.#getValueFromUnique(await this.#getParentFromUnique(unique), alias);
    }

    return null;
  }

  #getPropertyValue(alias: string, item: UmbElementDetailModel | undefined): any {
    if (!item) {
      return null;
    }

    const value = item?.values.find((i) => i.alias === alias);
    if (value) {
      return value.value;
    }
    return null;
  }

  connectedCallback() {
    super.connectedCallback();
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
      this.#documentWorkspaceContext = context;
      this.#setConfig();
    });
  }
  constructor() {
    super();

  }

  render() {
    return html`
      <div class="imagehotspot-editor theme${this._imgTheme}">
        <div class="imagehotspot-image" @click="${this.#onClick}">
          ${this._imgSrc
        ? html`
              <img src="${this._imgSrc}?width=${this._imgWidth}" srcset="${this._imgSrc}?width=${(this._imgWidth || 0) * 2} 2x" width="${this._imgWidth || 0}" height="${this._imgHeight || 0}" />
            `
        : html`
              <div class="imagehotspot-placeholder-image"></div>
            `
      }
          ${this.value?.left && this.value?.top
        ? html`
              <div id="imagehotspot-hotspot" class="imagehotspot-hotspot" draggable="true" @dragend="${this.#onDragEnd}" style="left:${this.value.left}px;top:${this.value.top}px;"></div>
            `
        : ''
      }
        </div>
      </div>
    `;
  }

  static styles = css`
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
}

export default ImageHotspot;


declare global {
  interface HTMLElementTagNameMap {
    'image-hotspot': ImageHotspot;
  }
}
