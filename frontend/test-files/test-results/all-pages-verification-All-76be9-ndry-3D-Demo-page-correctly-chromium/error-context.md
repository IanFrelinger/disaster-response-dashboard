# Page snapshot

```yaml
- navigation:
  - img
  - heading "Terrain Visualization" [level=1]
  - paragraph: Real-time 3D mapping system
  - link "Simple Test":
    - /url: /simple-test
  - link "3D Terrain Demo":
    - /url: /terrain-3d
  - link "Foundry 3D Demo":
    - /url: /foundry-terrain
  - link "Foundry Test":
    - /url: /foundry-test
  - link "Data Fusion Demo":
    - /url: /data-fusion
- main:
  - heading "Something went wrong" [level=1]
  - heading "Error Details" [level=2]
  - paragraph:
    - strong: "Error:"
    - text: Cannot read properties of null (reading 'hazards')
  - paragraph:
    - strong: "Stack:"
  - text: "TypeError: Cannot read properties of null (reading 'hazards') at FoundryTerrain3DDemo (http://localhost:3001/src/components/tacmap/FoundryTerrain3DDemo.tsx?t=1754682028263:559:117) at renderWithHooks (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:11548:26) at mountIndeterminateComponent (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:14926:21) at beginWork (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:15914:22) at beginWork$1 (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:19753:22) at performUnitOfWork (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:19198:20) at workLoopSync (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:19137:13) at renderRootSync (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:19116:15) at recoverFromConcurrentError (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:18736:28) at performConcurrentWorkOnRoot (http://localhost:3001/node_modules/.vite/deps/chunk-PJEEZAML.js?v=50bbc553:18684:30)"
  - button "Reload Page"
  - button "Try Again"
```