(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.ArchiveOrder = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  function safeReadOrder(storage, key){
    try {
      const value = JSON.parse(storage.getItem(key) || '[]');
      return Array.isArray(value) && value.every(item => typeof item === 'string') ? value : [];
    } catch {
      return [];
    }
  }

  function safeWriteOrder(storage, key, order){
    try {
      storage.setItem(key, JSON.stringify(order));
      return true;
    } catch {
      return false;
    }
  }

  function safeRemoveOrder(storage, key){
    try {
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function applySavedOrder(apps, order){
    const knownSlugs = new Set(apps.map(app => app.slug));
    const savedSlugs = order.filter(slug => knownSlugs.has(slug));
    const savedSet = new Set(savedSlugs);
    const newApps = apps.filter(app => !savedSet.has(app.slug));
    const appsBySlug = new Map(apps.map(app => [app.slug, app]));
    return [...newApps, ...savedSlugs.map(slug => appsBySlug.get(slug))];
  }

  function mergeVisibleOrder(allApps, visibleApps){
    const visibleSlugs = new Set(visibleApps.map(app => app.slug));
    const queue = [...visibleApps];
    return allApps.map(app => visibleSlugs.has(app.slug) ? queue.shift() : app);
  }

  function moveBeforeOrAfter(apps, slug, targetSlug){
    const from = apps.findIndex(app => app.slug === slug);
    const target = apps.findIndex(app => app.slug === targetSlug);
    if(from < 0 || target < 0 || from === target) return [...apps];
    const result = [...apps];
    const [app] = result.splice(from, 1);
    const insertion = from < target ? target : target;
    result.splice(insertion, 0, app);
    return result;
  }

  function moveToEdge(apps, slug, edge){
    const from = apps.findIndex(app => app.slug === slug);
    if(from < 0 || !['first', 'last'].includes(edge)) return [...apps];
    const result = [...apps];
    const [app] = result.splice(from, 1);
    if(edge === 'first') result.unshift(app);
    else result.push(app);
    return result;
  }

  return { safeReadOrder, safeWriteOrder, safeRemoveOrder, applySavedOrder, mergeVisibleOrder, moveBeforeOrAfter, moveToEdge };
});
