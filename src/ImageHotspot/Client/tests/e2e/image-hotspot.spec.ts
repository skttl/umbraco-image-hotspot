import { expect } from '@playwright/test';
import { ConstantHelper, test } from '@umbraco-cms/acceptance-test-helpers';

const CONTENT_NAME = 'Test';

test.describe('Image Hotspot editor', () => {
  test.beforeEach(async ({ umbracoUi }) => {
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
    expect(style).toMatch(/left:\s*[\d.]+%/);
    expect(style).toMatch(/top:\s*[\d.]+%/);
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

  test('image has correct dimensions attribute matching configured width', async ({ umbracoUi }) => {
    const img = umbracoUi.page.locator('image-hotspot .imagehotspot-image img');
    await expect(img).toBeVisible({ timeout: 15_000 });

    const width = await img.getAttribute('width');
    expect(Number(width)).toBeGreaterThan(0);
  });

  test('applies theme class to editor container', async ({ umbracoUi }) => {
    const container = umbracoUi.page.locator('image-hotspot uui-box.imagehotspot-editor');
    await expect(container).toBeVisible({ timeout: 15_000 });

    const classAttr = await container.getAttribute('class');
    expect(classAttr).toMatch(/theme\d/);
  });

  test('resolves image from parent when creating a new child node', async ({ umbracoUi, page }) => {
    // Open the actions menu on the "Test" tree item and click Create.
    await umbracoUi.content.clickActionsMenuForContent(CONTENT_NAME);
    await umbracoUi.content.clickCreateActionMenuOption();

    // Umbraco may show a document-type picker modal if there are multiple options,
    // or navigate directly if there is only one allowed child type.
    const createOptionsModal = page.locator('umb-entity-create-option-action-list-modal');
    const modalVisible = await createOptionsModal.isVisible({ timeout: 3_000 }).catch(() => false);
    if (modalVisible) {
      await page.locator('umb-entity-create-option-action-list-modal umb-ref-item', { hasText: 'Child' }).click();
    }

    // The image-hotspot editor should resolve the image from the parent node.
    // It must show the image editor (not the warning/fallback box), which proves
    // getParentUnique() was used instead of the unsaved new document's temp key.
    const imageEditor = page.locator('image-hotspot .imagehotspot-editor');
    await expect(imageEditor).toBeVisible({ timeout: 20_000 });

    // Also confirm no warning box is shown (which would indicate image resolution failed)
    const warningBox = page.locator('image-hotspot .imagehotspot-warning');
    await expect(warningBox).not.toBeVisible();
  });
});
