# fd-popover CD loop reproduction

Minimal Angular app reproducing two `_startAncestorResizeObserver` bugs in `@fundamental-ngx/core`.

## Setup

```bash
npm install
npm start          # http://localhost:3000
```

## Versions

| Package | Version |
|---|---|
| `@angular/core` | ^21.2.23 |
| `@angular/cdk` | ^21.2.14 |
| `@fundamental-ngx/core` | ^0.63.0 |
| `zone.js` | ^0.15.0 |

---

## Bug 1 — style mutation loop

**Steps:** click **"1. Open popover"**

**Observed:** CD counter climbs to ~30 000 immediately, page freezes.

**Cause:**
1. `PopoverService.open()` calls `_startAncestorResizeObserver()`, which creates a `MutationObserver` on the nearest scrollable ancestor with `{ subtree: true, childList: true, attributes: ['style', 'class'] }`.
2. CDK `updatePosition()` writes to `pane.style` (sets `transform`, `width`, etc.).
3. The observer fires on the `style` attribute change.
4. The callback calls `scheduleUpdate()` → `requestAnimationFrame(() => updatePosition())`.
5. Zone.js patches `rAF` — the callback runs inside the Angular zone → `ApplicationRef.tick()` on every frame.
6. `updatePosition()` writes `pane.style` again → observer fires again → loop.

---

## Bug 2 — childList mutation loop

**Steps:**
1. Click **"1. Open popover"**.
2. Click **"2. Toggle sidebar"** (to isolate Bug 2, first apply the Bug 1 fix below and then toggle the sidebar).

**Observed:** A second loop starts; CD counter spikes again.

**Cause:**
1. Inserting the sidebar into the scrollable container is a real `childList` mutation.
2. CDK responds by running `updatePosition()`.
3. `updatePosition()` appends `overlayHost` into the container: `placementElement.append(this._overlayRef.hostElement)`.
4. This second `childList` mutation fires the observer. `m.target = container`, `m.addedNodes = [overlayHost]`.
5. The **old filter** checked only `m.target`: `container !== overlayHost` → passes → another `scheduleUpdate()`.
6. Loop.

**Why the old filter failed:**
`childList` mutation semantics: `m.target` is the **parent** receiving the insertion, not the inserted node.  
Old filter: `if (m.target === overlayHost || overlayHost.contains(m.target)) return` — `m.target = container` → passes.

---

## The fix (in `_startAncestorResizeObserver`)

Applied to `node_modules/@fundamental-ngx/core/fesm2022/fundamental-ngx-core-popover.mjs`:

```js
const filteredScheduleUpdate = (mutations) => {
    const overlayHost = this._overlayRef?.hostElement;
    const pane = this._overlayRef?.overlayElement;
    const isOverlayNode = (node) => {
        if (!node) return false;
        if (overlayHost && (overlayHost === node || overlayHost.contains(node))) return true;
        if (pane && (pane === node || pane.contains(node))) return true;
        return false;
    };
    const anyOutside = mutations.some(m => {
        if (isOverlayNode(m.target)) return false;
        if (m.addedNodes.length > 0 && Array.from(m.addedNodes).every(isOverlayNode)) return false;
        if (m.removedNodes.length > 0 && Array.from(m.removedNodes).every(isOverlayNode)) return false;
        return true;
    });
    if (anyOutside) scheduleUpdate();
};
```

Key changes vs old filter:
- **Bug 1**: `m.target` is the `pane` element (style attribute write) → `isOverlayNode(pane) = true` → filtered out.
- **Bug 2**: `m.addedNodes = [overlayHost]` → `every(isOverlayNode)` is true → filtered out.
- **Real changes** (e.g. sidebar appearing in the container): `m.target = container`, `m.addedNodes = [sidebarDiv]` → `sidebarDiv` is not an overlay node → `anyOutside = true` → `scheduleUpdate()` fires exactly once.

---

## Zone bootstrap setup

- NgModule bootstrap via `platformBrowserDynamic().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })`.
- `zone.js` loaded as Angular polyfill (`polyfills: ["zone.js"]` in `angular.json`).
- This is the zone setup that makes the MutationObserver/rAF loop deadly: every rAF callback runs inside the Angular zone and triggers `ApplicationRef.tick()`.
