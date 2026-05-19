import { customElement, html, css, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbLitElement } from "@umbraco-cms/backoffice/lit-element";
import { UmbPropertyValueChangeEvent } from "@umbraco-cms/backoffice/property-editor";
import type { ImageHotspotValue } from "../types/imagehotspotvalue";
import type { UmbPropertyEditorConfigCollection, UmbPropertyEditorUiElement } from '@umbraco-cms/backoffice/property-editor';
import { UMB_PROPERTY_DATASET_CONTEXT } from "@umbraco-cms/backoffice/property";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT, UmbDocumentWorkspaceContext } from "@umbraco-cms/backoffice/document";
import { UmbDocumentDetailRepository } from "@umbraco-cms/backoffice/document";
import { UmbDocumentItemRepository } from "@umbraco-cms/backoffice/document";
import { UmbMediaDetailRepository } from "@umbraco-cms/backoffice/media";
import { UmbEntityUnique } from "@umbraco-cms/backoffice/entity";
import { UmbElementDetailModel } from "@umbraco-cms/backoffice/content";
import { UmbImagingRepository } from "@umbraco-cms/backoffice/imaging";
import type { UmbImagingResizeModel } from "@umbraco-cms/backoffice/imaging";

const _UNOBSERVED = Symbol('unobserved');

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

  @state()
  private _debugInfo: Record<string, string | number | boolean | null | undefined> = {};

  @state()
  private _imageLoaded: boolean = false;

  @property({ attribute: false })
  public set config(config: UmbPropertyEditorConfigCollection) {
    this._config = config;
    this.#applyTheme();
    this.#observeImageProperty();
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

  #propertyDatasetContext?: typeof UMB_PROPERTY_DATASET_CONTEXT.TYPE;
  #parentPropertyDatasetContext?: typeof UMB_PROPERTY_DATASET_CONTEXT.TYPE;
  #documentWorkspaceContext?: UmbDocumentWorkspaceContext;
  #documentDetailRepository = new UmbDocumentDetailRepository(this);
  #documentItemRepository = new UmbDocumentItemRepository(this);
  #mediaDetailRepository = new UmbMediaDetailRepository(this);
  #imagingRepository = new UmbImagingRepository(this);
  #datasetContextOwnsProperty = false;
  #loadGeneration = 0;

  constructor() {
    super();
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (context) => {
      this.#propertyDatasetContext = context;
      this.#observeImageProperty();
    });
    this.consumeContext(UMB_PROPERTY_DATASET_CONTEXT, (context) => {
      this.#parentPropertyDatasetContext = context;
      this.#observeImageProperty();
    }).passContextAliasMatches();
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
      this.#documentWorkspaceContext = context;
      this.#observeImageProperty();
    }).passContextAliasMatches();
  }

  async #observeImageProperty() {
    if (!this._config) return;
    const alias = this._config.getValueByAlias("imageSrc")?.toString();
    if (!alias) {
      this.#loadImage();
      return;
    }

    const datasetContext = this.#propertyDatasetContext ?? this.#parentPropertyDatasetContext;
    if (datasetContext) {
      const observable = await datasetContext.propertyValueByAlias(alias);
      this.observe(observable, (v) => {
        if (v !== undefined) {
          this.#datasetContextOwnsProperty = true;
          this.#loadImage(v as Array<any> | null);
        } else {
          this.#datasetContextOwnsProperty = false;
          if (!this.#documentWorkspaceContext) {
            this.#loadImage();
          }
        }
      }, 'imagePropertyObserver');
    }

    if (this.#documentWorkspaceContext) {
      const workspaceObservable = await this.#documentWorkspaceContext.propertyValueByAlias?.(alias);
      if (workspaceObservable) {
        this.observe(workspaceObservable, (v) => {
          if (!this.#datasetContextOwnsProperty) {
            this.#loadImage(v != null ? v as Array<any> : _UNOBSERVED);
          }
        }, 'imageWorkspaceObserver');
      }
    }

    if (!datasetContext && !this.#documentWorkspaceContext) {
      this.#loadImage();
    }
  }

  #onClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const percentX = event.offsetX / target.clientWidth;
    const percentY = event.offsetY / target.clientHeight;
    this.#setPosition(percentX, percentY);
  }

  #onDragEnd(event: DragEvent) {
    if (event.dataTransfer && this.value.percentX != null && this.value.percentY != null) {
      const target = event.target as HTMLElement;
      const deltaX = event.offsetX - (target.clientWidth / 2);
      const deltaY = event.offsetY - (target.clientHeight / 2);
      const container = target.closest('.imagehotspot-image') as HTMLElement;
      const percentX = this.value.percentX + deltaX / (container?.clientWidth ?? this._imgWidth);
      const percentY = this.value.percentY + deltaY / (container?.clientHeight ?? this._imgHeight);
      this.#setPosition(percentX, percentY);
    }
  }

  #setPosition(percentX: number, percentY: number) {
    this.value = {
      percentX,
      percentY,
      left: Math.round(percentX * this._imgWidth),
      top: Math.round(percentY * this._imgHeight),
      width: this._imgWidth,
      height: this._imgHeight,
      image: this._imgSrc
    };
    this.dispatchEvent(new UmbPropertyValueChangeEvent());
    this.requestUpdate();
  }

  #applyTheme() {
    if (!this._config) return;
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

  async #loadImage(observedValue: Array<any> | null | typeof _UNOBSERVED = _UNOBSERVED) {
    if (!this._config) return;

    const generation = ++this.#loadGeneration;
    const debug: Record<string, string | number | boolean | null | undefined> = {};
    this._imageLoaded = false;
    this._imgSrc = undefined;

    const imagePropertyAlias = this._config.getValueByAlias("imageSrc")?.toString();
    debug['configuredAlias'] = imagePropertyAlias ?? null;

    if (!imagePropertyAlias) {
      this._imageLoaded = true;
      this._debugInfo = debug;
      return;
    }

    let imageValue: Array<any> | null = null;
    debug['hasPropertyDatasetContext'] = !!this.#propertyDatasetContext;
    debug['hasDocumentWorkspaceContext'] = !!this.#documentWorkspaceContext;

    if (this.#propertyDatasetContext) {
      if (observedValue !== _UNOBSERVED) {
        imageValue = (observedValue as Array<any>) ?? null;
      } else {
        const propertyObservable = await this.#propertyDatasetContext.propertyValueByAlias(imagePropertyAlias);
        const rawValue = await new Promise<unknown>((resolve) => {
          let sub: any;
          let resolved = false;
          sub = (propertyObservable as any).subscribe((value: any) => {
            if (!resolved) {
              resolved = true;
              resolve(value);
              Promise.resolve().then(() => sub?.unsubscribe());
            }
          });
        });
        imageValue = rawValue !== undefined ? ((rawValue as Array<any>) ?? null) : null;
      }
      debug['valueFromDatasetContext'] = imageValue ? JSON.stringify(imageValue) : null;
    }

    if (!imageValue && observedValue === _UNOBSERVED && this.#parentPropertyDatasetContext && this.#parentPropertyDatasetContext !== this.#propertyDatasetContext) {
      const parentObservable = await this.#parentPropertyDatasetContext.propertyValueByAlias(imagePropertyAlias);
      const rawParent = await new Promise<unknown>((resolve) => {
        let sub: any;
        let resolved = false;
        sub = (parentObservable as any).subscribe((value: any) => {
          if (!resolved) {
            resolved = true;
            resolve(value);
            Promise.resolve().then(() => sub?.unsubscribe());
          }
        });
      });
      if (rawParent) {
        imageValue = (rawParent as Array<any>) ?? null;
        debug['valueFromParentDatasetContext'] = imageValue ? JSON.stringify(imageValue) : null;
      }
    }

    if (!imageValue && observedValue === _UNOBSERVED && this.#documentWorkspaceContext) {
      imageValue = this.#documentWorkspaceContext.getPropertyValue<Array<any>>(imagePropertyAlias) ?? null;
      debug['valueFromWorkspaceContext'] = imageValue ? JSON.stringify(imageValue) : null;

      if (!imageValue) {
        imageValue = await this.#getValueFromUnique(this.#documentWorkspaceContext.getUnique(), imagePropertyAlias);
        debug['valueFromParentLookup'] = imageValue ? JSON.stringify(imageValue) : null;
      }
    }

    if (imageValue && typeof imageValue === 'object') {
      const firstImageValue = imageValue[0];
      debug['mediaKey'] = firstImageValue?.mediaKey ?? null;

      const media = await this.#mediaDetailRepository.requestByUnique(firstImageValue?.mediaKey);
      debug['mediaUnique'] = media?.data?.unique ?? null;

      if (media?.data) {
        const mediaWidth = this.#getPropertyValue("umbracoWidth", media.data) || 0;
        const mediaHeight = this.#getPropertyValue("umbracoHeight", media.data) || 0;
        this._imgWidth = this._config.getValueByAlias("width") || 400;
        this._imgHeight = mediaWidth > 0 ? Math.round(this._imgWidth * mediaHeight / mediaWidth) : 0;
        debug['mediaSourceWidth'] = mediaWidth;
        debug['mediaSourceHeight'] = mediaHeight;
        debug['displayWidth'] = this._imgWidth;
        debug['displayHeight'] = this._imgHeight;

        const imagingModel: UmbImagingResizeModel = { width: this._imgWidth, height: this._imgHeight || undefined };
        const result = await this.#imagingRepository.requestResizedItems([media.data.unique], imagingModel);
        debug['requestResizedItemsReturnedData'] = (result.data?.length ?? 0) > 0;
        this._imgSrc = result.data?.[0]?.url;
        debug['resolvedImgSrc'] = this._imgSrc ?? null;

        if (this._imgSrc && this.value?.percentX != null && this.value?.percentY != null) {
          this.value = {
            ...this.value,
            image: this._imgSrc,
            width: this._imgWidth,
            height: this._imgHeight,
            left: Math.round(this.value.percentX * this._imgWidth),
            top: Math.round(this.value.percentY * this._imgHeight),
          };
          this.dispatchEvent(new UmbPropertyValueChangeEvent());
        }
      }
    }

    if (generation !== this.#loadGeneration) return;
    this._imageLoaded = true;
    this._debugInfo = debug;
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

  render() {
    return html`
      ${this._imageLoaded && this._imgSrc ? html`
        <uui-box class="imagehotspot-editor theme${this._imgTheme}" style="--placeholder-width-num:${this._imgWidth};--placeholder-height-num:${this._imgHeight}">
          <div class="imagehotspot-image" @click="${this.#onClick}">
            <img src="${this._imgSrc}" width="${this._imgWidth || 0}" height="${this._imgHeight || 0}" />
            ${this.value?.left && this.value?.top
          ? html`
                <div id="imagehotspot-hotspot" class="imagehotspot-hotspot" draggable="true" @dragend="${this.#onDragEnd}" style="left:${((this.value.percentX ?? 0) * 100).toFixed(4)}%;top:${((this.value.percentY ?? 0) * 100).toFixed(4)}%;"></div>
              `
          : html`
                <div class="imagehotspot-instruction">
                  <uui-tag look="secondary">
                    <umb-localize key="imageHotspot_pickHotspotInstruction"></umb-localize>
                  </uui-tag>
                </div>
              `
        }
          </div>
        </uui-box>
      ` : ''}
      ${this._imageLoaded && !this._imgSrc ? html`
        <uui-box class="imagehotspot-warning" .headline=${this.localize.term('imageHotspot_warningHeadline')}>
          <umb-localize key="imageHotspot_warningBody" .args=${[this._debugInfo['configuredAlias']]}></umb-localize>
          ${this.value?.percentX != null && this.value?.percentY != null ? html`
            <p class="stored-value-hint">
              <umb-localize key="imageHotspot_storedPosition" .args=${[String(Math.round(this.value.percentX * 100) / 100), String(Math.round(this.value.percentY * 100) / 100)]}></umb-localize>
            </p>
          ` : ''}
          <details>
            <summary>${this.localize.term('imageHotspot_debugInfo')}</summary>
            <uui-table class="debug-table">
              <uui-table-head>
                <uui-table-head-cell>${this.localize.term('imageHotspot_debugKey')}</uui-table-head-cell>
                <uui-table-head-cell>${this.localize.term('imageHotspot_debugValue')}</uui-table-head-cell>
              </uui-table-head>
              ${Object.entries(this._debugInfo).map(([k, v]) => html`
                <uui-table-row>
                  <uui-table-cell class="key-cell">${k}</uui-table-cell>
                  <uui-table-cell class="value-cell">${v === null || v === undefined ? html`<em>null</em>` : String(v)}</uui-table-cell>
                </uui-table-row>
              `)}
            </uui-table>
          </details>
        </uui-box>
      ` : ''}
    `;
  }

  static styles = css`
    .imagehotspot-editor {
      display: inline-block;
      line-height: 0;
      --uui-box-default-padding: 0;
      width: calc(1px * var(--placeholder-width-num, 400));
      max-width: 100%;
      aspect-ratio: var(--placeholder-width-num, 400) / var(--placeholder-height-num, 300);
      contain: paint;
    }

    .imagehotspot-image {
      position: relative;
      display: inline-block;
      cursor: crosshair;

      img {
        max-width:100%;
        height:auto;
      }
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

    .imagehotspot-instruction {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .theme1 .imagehotspot-hotspot { background: rgb(223, 59, 58); }
    .theme2 .imagehotspot-hotspot { background: rgb(100, 189, 99); }
    .theme3 .imagehotspot-hotspot { background: rgb(54, 180, 246); }
    .theme4 .imagehotspot-hotspot { background: rgb(239, 144, 0); }

    .imagehotspot-warning { --uui-box-default-padding: var(--uui-size-space-5); }
    .imagehotspot-warning details { margin-top: var(--uui-size-space-3, 6px); }
    .imagehotspot-warning summary { cursor: pointer; font-weight: bold; }

    .imagehotspot-warning .stored-value-hint { margin: var(--uui-size-space-4, 9px) 0 0; font-size: 13px; color: var(--uui-color-text-alt, #666); }
    .imagehotspot-warning .stored-value-hint strong { color: var(--uui-color-text, inherit); }
    .imagehotspot-warning .debug-table { margin-top: var(--uui-size-space-3, 6px); font-size: 12px; }
    .imagehotspot-warning .key-cell { font-weight: bold; white-space: nowrap; font-family: monospace; }
    .imagehotspot-warning .value-cell { word-break: break-all; font-family: monospace; color: var(--uui-color-text-alt, #666); }
  `;
}

export default ImageHotspot;


declare global {
  interface HTMLElementTagNameMap {
    'image-hotspot': ImageHotspot;
  }
}
