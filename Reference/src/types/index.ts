export type ComponentKind = 'Container' | 'Field' | 'Widget';

export interface SceneNode {
  id: string;
  kind: ComponentKind;
  name: string;
  children?: string[]; // child IDs
}

export interface SceneGraph {
  nodes: Record<string, SceneNode>;
  rootId: string;
}
