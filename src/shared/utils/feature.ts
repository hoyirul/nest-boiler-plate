export function filterFeatureTree(tree: any[], permissions: string[]) {
  return tree
    .map(node => {
      const canView = permissions.some(p => p.includes(node.code));
      const children = filterFeatureTree(node.children || [], permissions);

      if (canView || children.length > 0) {
        return { ...node, children };
      }
      return null;
    })
    .filter(Boolean);
}
