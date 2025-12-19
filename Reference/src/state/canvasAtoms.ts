import { atom } from 'jotai';
import type { SceneGraph } from '@model';

export const sceneGraphAtom = atom<SceneGraph>({
  nodes: { root: { id: 'root', kind: 'Container', name: 'Root', children: [] } },
  rootId: 'root',
});

export const selectedIdAtom = atom<string | null>(null);

export const breadcrumbPathAtom = atom((get) => {
  const selectedId = get(selectedIdAtom);
  return selectedId ? ['root', selectedId] : ['root'];
});
