import { test, expect } from '@playwright/test';

const THREE_BODY_SEARCH = {
  numFound: 1,
  docs: [
    {
      key: '/works/OL18201437W',
      title: 'The Three-Body Problem',
      author_name: ['Cixin Liu'],
      isbn: ['9780765382030'],
      number_of_pages_median: 416,
      first_publish_year: 2008
    }
  ]
};

test.beforeEach(async ({ page }) => {
  await page.route('**/search.json*', (route) => {
    const url = new URL(route.request().url());
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const isbn = url.searchParams.get('isbn') ?? '';
    const matches = q.startsWith('three') || isbn.includes('9780765382030');
    const body = matches ? THREE_BODY_SEARCH : { numFound: 0, docs: [] };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.route('**/covers.openlibrary.org/**', (route) =>
    route.fulfill({ status: 404, contentType: 'image/jpeg', body: '' })
  );
});

test('guest flow: add a book, move shelves, track progress, view insights', async ({
  page
}) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('main').getByRole('button', { name: 'Try as Guest' }).click();

  await expect(page.getByRole('complementary', { name: /Sidebar/ })).toBeVisible();

  await page.getByRole('button', { name: 'Add Book' }).click();
  await expect(page.getByRole('dialog', { name: /Search.*Books/ })).toBeVisible();

  await page.getByRole('textbox', { name: 'Search books to add' }).fill('Three');
  await expect(page.getByRole('heading', { name: 'The Three-Body Problem' })).toBeVisible();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.locator('[role="status"]:not(.sr-only)')).toContainText(/Three-Body/);
  await page.getByRole('button', { name: 'Close search dialog' }).click();

  await page.getByRole('button', { name: 'Want to Read' }).click();
  await page.getByRole('heading', { name: 'The Three-Body Problem', exact: true }).click();

  const shelfSelect = page.locator('#shelf-select');
  await expect(shelfSelect).toBeVisible();
  await shelfSelect.selectOption('currently-reading');
  await expect(page.getByText('Reading Progress')).toBeVisible();

  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(page.locator('[role="status"]:not(.sr-only)')).toContainText(/finished/);
  await page.getByRole('button', { name: 'Close book details' }).click();

  await page.getByRole('button', { name: 'Year in Review' }).click();
  const reviewHeading = page.getByRole('heading', { name: /2026 Year in Review/ });
  await expect(reviewHeading).toBeVisible();
  await expect(reviewHeading).toBeFocused();
  await expect(page.getByText('Books Finished')).toBeVisible();
});

test('mobile sidebar opens as a dialog with trapped focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('main').getByRole('button', { name: 'Try as Guest' }).click();

  const trigger = page.getByRole('button', { name: 'Toggle navigation menu' });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const drawer = page.getByRole('dialog', { name: 'Sidebar navigation' });
  await expect(drawer).toBeVisible();
  await expect(page.getByRole('button', { name: 'Bookshelf home' })).toBeFocused();
  await expect(drawer.getByRole('button', { name: 'Want to Read' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
});