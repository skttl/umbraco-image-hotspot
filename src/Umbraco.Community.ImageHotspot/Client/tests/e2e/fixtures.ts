import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { ApiHelpers, DocumentBuilder, DocumentTypeBuilder, MediaBuilder } from '@umbraco-cms/acceptance-test-helpers';

export const fixture = {
  single: '2ecf6429-3210-4448-81e3-5c7a4b73acc1',
  multiple: '2ecf6429-3210-4448-81e3-5c7a4b73acc2',
  missing: '2ecf6429-3210-4448-81e3-5c7a4b73acc3',
  inherited: '2ecf6429-3210-4448-81e3-5c7a4b73acc4',
  childType: '2ecf6429-3210-4448-81e3-5c7a4b73acc5',
  singleType: '2ecf6429-3210-4448-81e3-5c7a4b73acc6',
  multipleType: '2ecf6429-3210-4448-81e3-5c7a4b73acc7',
  media: '2ecf6429-3210-4448-81e3-5c7a4b73acc8',
  hotspotType: '2ecf6429-3210-4448-81e3-5c7a4b73acc9',
  singlePickerType: '2ecf6429-3210-4448-81e3-5c7a4b73ac10',
  multiplePickerType: '2ecf6429-3210-4448-81e3-5c7a4b73ac11',
};

export const initialHotspot = { percentX: 55.75, percentY: 74.878 };

export async function resetDocument(api: ApiHelpers, id: string) {
  const document = await api.document.get(id);
  document.values = document.values.filter((value: { alias: string }) => value.alias !== 'hotspot');
  document.values.push({ alias: 'hotspot', culture: null, segment: null, value: initialHotspot });
  expect((await api.document.update(id, document)).ok()).toBeTruthy();
}

export async function createFixtures(api: ApiHelpers) {
  const endpoint = (path: string) => `${api.baseUrl}/umbraco/management/api/v1/${path}`;
  if (!(await api.get(endpoint(`media/${fixture.media}`))).ok()) {
    const mediaType = await api.mediaType.getByName('Image');
    const temporaryId = randomUUID();
    await api.page.setContent('<div style="width:400px;height:200px;background:royalblue"></div>');
    const image = await api.page.screenshot({ clip: { x: 0, y: 0, width: 400, height: 200 } });
    const uploaded = await api.page.request.post(endpoint('temporary-file'), {
      multipart: { Id: temporaryId, File: { name: 'hotspot-fixture.png', mimeType: 'image/png', buffer: image } },
    });
    expect(uploaded.ok(), 'Upload fixture image').toBeTruthy();
    const media = new MediaBuilder().withId(fixture.media).withMediaTypeId(mediaType.id)
      .addVariant().withName('ImageHotspot E2E image').done()
      .addValue().withAlias('umbracoFile').addValueData().withTemporaryFileId(temporaryId).done().done().build();
    await api.media.create(media);
  }

  for (const type of [
    { id: fixture.hotspotType, name: 'ImageHotspot E2E hotspot', editorAlias: 'Umbraco.Plain.Json', editorUiAlias: 'ImageHotspot.PropertyEditorUi', values: [{ alias: 'imageSrc', value: 'image' }, { alias: 'width', value: 400 }, { alias: 'theme', value: 'Red' }] },
    { id: fixture.singlePickerType, name: 'ImageHotspot E2E single picker', editorAlias: 'Umbraco.MediaPicker.Single', editorUiAlias: 'Umb.PropertyEditorUi.MediaPicker.Single', values: [] },
    { id: fixture.multiplePickerType, name: 'ImageHotspot E2E multiple picker', editorAlias: 'Umbraco.MediaPicker3', editorUiAlias: 'Umb.PropertyEditorUi.MediaPicker', values: [] },
  ]) {
    if (!(await api.get(endpoint(`data-type/${type.id}`))).ok()) {
      const created = await api.post(endpoint('data-type'), type);
      expect(created.ok(), `Create ${type.name}`).toBeTruthy();
    }
  }

  for (const [id, name, imageType] of [
    [fixture.childType, 'ImageHotspot E2E child', null],
    [fixture.singleType, 'ImageHotspot E2E single', fixture.singlePickerType],
    [fixture.multipleType, 'ImageHotspot E2E multiple', fixture.multiplePickerType],
  ] as const) {
    if ((await api.get(endpoint(`document-type/${id}`))).ok()) continue;
    const group = randomUUID();
    let builder = new DocumentTypeBuilder().withId(id).withName(name).withAlias(name.replaceAll(' ', '')).withAllowedAsRoot(true)
      .addContainer().withId(group).withName('Content').withType('Group').done()
      .addProperty().withAlias('hotspot').withName('Hotspot').withDataTypeId(fixture.hotspotType).withContainerId(group).done();
    if (imageType) {
      builder = builder.addProperty().withAlias('image').withName('Image').withDataTypeId(imageType).withContainerId(group).done()
        .addAllowedDocumentType().withId(fixture.childType).done();
    }
    await api.documentType.create(builder.build());
  }

  for (const [id, name, type, hasImage, parent] of [
    [fixture.single, 'ImageHotspot E2E single', fixture.singleType, true, null],
    [fixture.multiple, 'ImageHotspot E2E multiple', fixture.multipleType, true, null],
    [fixture.missing, 'ImageHotspot E2E missing', fixture.singleType, false, null],
    [fixture.inherited, 'ImageHotspot E2E inherited', fixture.childType, false, fixture.single],
  ] as const) {
    if (await api.document.doesExist(id)) continue;
    let builder = new DocumentBuilder().withId(id).withDocumentTypeId(type)
      .addVariant().withName(name).done()
      .addValue().withAlias('hotspot').withValue(initialHotspot).done();
    if (parent) builder = builder.withParentId(parent);
    if (hasImage) builder = builder.addValue().withAlias('image').addMediaPickerValue().withMediaKey(fixture.media).done().done();
    await api.document.create(builder.build());
  }
}
