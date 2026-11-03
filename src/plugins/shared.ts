import { hasTokens, syncStyles, syncVariables, warn } from '../core/ctx';
import { findPage, findSection } from '../core/sections';
import { attachLibrary, ensureWallpaperHolder } from '../components/library';

export const COMPONENTS_PAGE = 'Components';
const RUN_GENERAL = 'Run the Gutchek General plugin first, then this one.';

/**
 * Connects to the design system that Gutchek General owns: variables, styles, components and icons. Section plugins
 * never rebuild it. Missing tokens are added so builds stay bound; anything else missing is reported.
 */
export async function attachSystem() {
  if (!(await hasTokens())) throw new Error('This file has no Gutchek variables yet. ' + RUN_GENERAL);
  const page = findPage(COMPONENTS_PAGE);
  if (!page) throw new Error('This file has no Components page yet. ' + RUN_GENERAL);
  const vars = await syncVariables(false);
  const styles = await syncStyles(false);
  if (vars.created + styles.created) warn(vars.created + styles.created + ' Gutchek variables or styles were missing, so they were added. Gutchek General can review them.');
  const lib = await attachLibrary(page);
  if (!lib.exists) throw new Error('The Components page has no Gutchek component library. ' + RUN_GENERAL);
  if (lib.missingComponents || lib.missingIcons) {
    warn(
      'The component library is missing ' + lib.missingComponents + ' component(s) and ' + lib.missingIcons + ' icon(s) that the code uses. Those parts were drawn without instances. Run Gutchek General with "Component library" ticked to add them.',
    );
  }
  ensureWallpaperHolder(page);
}

/** Checklist status for a section that lives on a page. */
export function sectionStatus(page: PageNode | null, key: string): { status: string; needed: boolean } {
  const there = !!page && !!findSection(page, key);
  return { status: there ? 'In file' : 'Missing', needed: !there };
}

/** Loads a page if it exists so its sections can be inspected. */
export async function loaded(name: string): Promise<PageNode | null> {
  const page = findPage(name);
  if (page) await page.loadAsync();
  return page;
}

export function picked(ids: string[], prefix: string): number[] {
  return ids.filter((id) => id.indexOf(prefix + ':') === 0).map((id) => parseInt(id.slice(prefix.length + 1), 10));
}

export const plural = (n: number, word: string) => n + ' ' + word + (n === 1 ? '' : 's');
