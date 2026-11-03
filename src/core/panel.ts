import PANEL from './panel.html';
import { ctx, flush, loadFonts } from './ctx';
import { breathe } from './sections';

export interface Item {
  id: string;
  label: string;
  /** Short state shown beside the item, for example "Missing" or "In file". */
  status: string;
  /** Ticked by default: the file lacks this part or it is out of date. */
  needed: boolean;
  hint?: string;
}

export interface Group {
  title: string;
  note?: string;
  items: Item[];
}

export interface PluginDef {
  name: string;
  intro: string;
  /** Looks at the file and reports what is there, without changing anything. */
  survey(): Promise<Group[]>;
  /** Builds or fixes only the selected items and returns a one-line summary. */
  run(ids: string[], step: (label: string) => Promise<void>): Promise<string>;
}

const secs = (ms: number) => (ms < 60000 ? Math.round(ms / 1000) + 's' : Math.floor(ms / 60000) + 'm ' + Math.round((ms % 60000) / 1000) + 's');
const message = (e: unknown) => (e && (e as Error).message ? (e as Error).message : String(e));

/** Opens the checklist panel for a plugin. Nothing in the file changes until the person presses Update. */
export function startPlugin(def: PluginDef) {
  figma.skipInvisibleInstanceChildren = true;
  figma.showUI(PANEL, { width: 400, height: 640, themeColors: true });
  let busy = false;

  const survey = async () => {
    try {
      figma.ui.postMessage({ type: 'init', name: def.name, intro: def.intro, groups: await def.survey() });
    } catch (e) {
      figma.ui.postMessage({ type: 'error', text: 'Could not read this file: ' + message(e) });
    }
  };

  figma.ui.onmessage = async (msg: { type: string; ids?: string[] }) => {
    if (msg.type === 'close') {
      figma.closePlugin();
      return;
    }
    if (msg.type !== 'run' || busy) return;
    busy = true;
    ctx.warnings.length = 0;
    ctx.pending = [];
    const started = Date.now();
    let stage = 'Starting';
    const step = async (label: string) => {
      await flush();
      stage = label;
      figma.ui.postMessage({ type: 'progress', text: label });
      await breathe();
    };
    try {
      await step('Loading fonts');
      await loadFonts();
      const summary = await def.run(msg.ids || [], step);
      await flush();
      figma.ui.postMessage({ type: 'done', text: summary + ' (' + secs(Date.now() - started) + ')', notes: ctx.warnings.slice() });
      figma.notify(def.name + ': ' + summary);
    } catch (e) {
      console.error('[' + def.name + '] failed at "' + stage + '"', e);
      figma.ui.postMessage({ type: 'error', text: 'Stopped at "' + stage + '": ' + message(e), notes: ctx.warnings.slice() });
    } finally {
      busy = false;
      ctx.theme = 'light';
      await survey();
    }
  };

  survey();
}
