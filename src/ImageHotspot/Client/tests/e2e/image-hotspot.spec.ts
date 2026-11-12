import { expect } from '@playwright/test';
import { ConstantHelper } from '@umbraco-cms/acceptance-test-helpers';
import { fixture, initialHotspot, resetDocument, test } from './fixtures.js';

const CONTENT_NAME = 'ImageHotspot E2E single';

test.describe('Image Hotspot editor', () => {
  test.beforeEach(async ({ umbracoUi, umbracoApi }) => {
    await resetDocument(umbracoApi, fixture.single);
    await umbracoUi.goToBackOffice();
    await umbracoUi.content.goToSection(ConstantHelper.sections.content);
    await umbracoUi.content.goToContentWithName(CONTENT_NAME);
  });

  test('renders the image-hotspot custom element', async ({ umbracoUi }) => {
    const element = umbracoUi.page.locator('image-hotspot');
    await expect(element).toBeVisible();
  });

  test('shows the editor with an image when image property is configured', async ({ umbracoUi }) => {
    const imageBox = umbracoUi.page.locator('image-hotspot .imagehotspot-editor');
    await expect(imageBox).toBeVisible({ timeout: 15_000 });
  });

  test('shows the hotspot marker when a saved position exists', async ({ umbracoUi }) => {
    const hotspot = umbracoUi.page.locator('image-hotspot #imagehotspot-hotspot');
    await expect(hotspot).toBeVisible({ timeout: 15_000 });
  });

  test('hotspot marker has correct percentage position from saved value', async ({ umbracoUi }) => {
    const hotspot = umbracoUi.page.locator('image-hotspot #imagehotspot-hotspot');
    await expect(hotspot).toBeVisible({ timeout: 15_000 });

    const style = await hotspot.getAttribute('style');
    expect(style).toContain(`left:${initialHotspot.percentX.toFixed(4)}%`);
    expect(style).toContain(`top:${initialHotspot.percentY.toFixed(4)}%`);
  });

  test('clicking the image updates the hotspot position', async ({ umbracoUi }) => {
    const imageBox = umbracoUi.page.locator('image-hotspot .imagehotspot-image');
    await expect(imageBox).toBeVisible({ timeout: 15_000 });

    const hotspot = umbracoUi.page.locator('image-hotspot #imagehotspot-hotspot');
    const styleBefore = await hotspot.getAttribute('style');

    const box = (await imageBox.boundingBox())!;
    const clickX = box.x + box.width * 0.2;
    const clickY = box.y + box.height * 0.2;
    await umbracoUi.page.mouse.click(clickX, clickY);

    await expect(hotspot).toBeVisible({ timeout: 5_000 });
    const styleAfter = await hotspot.getAttribute('style');
    expect(styleAfter).not.toEqual(styleBefore);
  });

  test('clicking the image dispatches a property-value-change event', async ({ umbracoUi }) => {
    const imageBox = umbracoUi.page.locator('image-hotspot .imagehotspot-image');
    await expect(imageBox).toBeVisible({ timeout: 15_000 });

    // Record the hotspot style before clicking
    const hotspot = umbracoUi.page.locator('image-hotspot #imagehotspot-hotspot');
    const styleBefore = await hotspot.getAttribute('style');

    // Click the image
    const box = (await imageBox.boundingBox())!;
    await umbracoUi.page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.3);

    // If a change event was dispatched from the element, the value will have been
    // updated and the hotspot position will differ from before the click.
    // This is a reliable observable side-effect that doesn't depend on exposeFunction.
    await expect(hotspot).toBeVisible({ timeout: 5_000 });
    const styleAfter = await hotspot.getAttribute('style');
    expect(styleAfter).not.toEqual(styleBefore);

    // Additionally verify the save button becomes enabled, confirming the workspace
    // received the change event and marked the document as dirty.
    const saveButton = umbracoUi.page.getByRole('button', { name: /^save$/i }).first();
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
  });

  test('save button is enabled after clicking the image', async ({ umbracoUi }) => {
    const imageBox = umbracoUi.page.locator('image-hotspot .imagehotspot-image');
    await expect(imageBox).toBeVisible({ timeout: 15_000 });

    const box = (await imageBox.boundingBox())!;
    await umbracoUi.page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.3);

    const saveButton = umbracoUi.page.getByRole('button', { name: /save/i }).first();
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
  });

  test('dragging the marker updates the hotspot coordinates', async ({ page }) => {
    const marker = page.locator('image-hotspot #imagehotspot-hotspot');
    await expect(marker).toBeVisible();
    const original = await marker.getAttribute('style');
    await marker.dragTo(page.locator('image-hotspot .imagehotspot-image'), { targetPosition: { x: 300, y: 60 } });
    await expect(marker).not.toHaveAttribute('style', original!);
    await expect(page.getByRole('button', { name: /^save$/i }).first()).toBeEnabled();
  });

  test('image has correct dimensions attribute matching configured width', async ({ umbracoUi }) => {
    const img = umbracoUi.page.locator('image-hotspot .imagehotspot-image img');
    await expect(img).toBeVisible({ timeout: 15_000 });

    const width = await img.getAttribute('width');
    expect(Number(width)).toBe(400);
  });

  test('applies theme class to editor container', async ({ umbracoUi }) => {
    const container = umbracoUi.page.locator('image-hotspot uui-box.imagehotspot-editor');
    await expect(container).toBeVisible({ timeout: 15_000 });

    const classAttr = await container.getAttribute('class');
    expect(classAttr).toContain('theme1');
  });

  test('resolves image from parent when creating a new child node', async ({ page }) => {
    await page.goto(`/umbraco/section/content/workspace/document/create/parent/document/${fixture.single}/${fixture.childType}`);
    await expect(page).toHaveURL(/\/workspace\/document\/create\/parent\//);
    // The new document has no saved key; its workspace parent must supply the image.
    const imageEditor = page.locator('image-hotspot .imagehotspot-editor');
    await expect(imageEditor).toBeVisible({ timeout: 20_000 });

    // Also confirm no warning box is shown (which would indicate image resolution failed)
    const warningBox = page.locator('image-hotspot .imagehotspot-warning');
    await expect(warningBox).not.toBeVisible();
  });

  test('resolves a saved child image from its parent', async ({ page, umbracoUi }) => {
    await page.goto(`/umbraco/section/content/workspace/document/edit/${fixture.inherited}`);
    await expect(umbracoUi.page.locator('image-hotspot .imagehotspot-editor')).toBeVisible();
    await expect(umbracoUi.page.locator('image-hotspot img')).toHaveJSProperty('naturalWidth', 400);
  });

  test('resolves the first image from a multiple media picker', async ({ page }) => {
    await page.goto(`/umbraco/section/content/workspace/document/edit/${fixture.multiple}`);
    await expect(page.locator('image-hotspot .imagehotspot-editor')).toBeVisible();
    await expect(page.locator('image-hotspot img')).toHaveJSProperty('naturalWidth', 400);
  });

  test('save and reload preserves the clicked hotspot coordinates', async ({ page, umbracoUi, umbracoApi }) => {
    const image = page.locator('image-hotspot .imagehotspot-image');
    await expect(image).toBeVisible();
    await image.click({ position: { x: 80, y: 40 } });
    await umbracoUi.content.clickSaveButtonAndWaitForContentToBeUpdated();
    const saved = await umbracoApi.document.get(fixture.single);
    const value = saved.values.find((entry: { alias: string }) => entry.alias === 'hotspot').value;
    expect(value.percentX).toBeCloseTo(20, 1);
    expect(value.percentY).toBeCloseTo(20, 1);
    await page.reload();
    const hotspot = page.locator('image-hotspot #imagehotspot-hotspot');
    await expect(hotspot).toBeVisible();
    await expect(hotspot).toHaveAttribute('style', /left:20\.0000%;top:20\.0000%;/);
  });

  test('missing image shows a warning without changing saved coordinates', async ({ page, umbracoApi }) => {
    await page.goto(`/umbraco/section/content/workspace/document/edit/${fixture.missing}`);
    await expect(page.locator('image-hotspot .imagehotspot-warning')).toBeVisible();
    await expect(page.locator('image-hotspot .stored-value-hint')).toContainText('55.75');
    const saved = await umbracoApi.document.get(fixture.missing);
    expect(saved.values.find((entry: { alias: string }) => entry.alias === 'hotspot').value).toEqual(initialHotspot);
  });
});
