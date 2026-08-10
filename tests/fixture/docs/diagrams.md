---
title: Diagrams
sidebar_position: 1
---

# Diagrams

This fixture is a minimal working Docusaurus 3 site for
`docusaurus-plugin-dgmo` + `remark-dgmo`. Copy the `docusaurus.config.ts`
in the parent directory as a template for your own site.

## Plain block (colorMode auto — dual-render)

Render once light, once dark. Toggle the moon/sun in the navbar — only
the matching SVG should be visible.

```dgmo
sequence
Browser -GET /-> Server
Server -200 OK-> Browser
```

## Colored sequence diagram with tags

Sequence diagrams can use `tag` blocks to assign explicit colors to
actors. Different palettes resolve color names differently, so toggling
modes also exercises the palette mapping.

```dgmo
sequence Treasure Hunt App
active-tag Layer

tag Layer as l
  Frontend teal
  Backend purple
  Data red

User is an actor
WebApp l: Frontend
API l: Backend
MapDB is a database l: Data

User -Search nearby loot-> WebApp
WebApp -GET /loot?lat&lon-> API
API -SELECT-> MapDB
MapDB -rows-> API
API -200 OK-> WebApp
WebApp -render markers-> User
```

## Showcase mode

Diagram first, then a collapsible disclosure with the source and the
open-in-editor + copy buttons in the toolbar row.

```dgmo showcase title="Login flow"
sequence
Client -POST /login-> API
API -validate-> Auth
Auth -JWT-> API
API -200 OK-> Client
```

## Per-block override — single-render light, catppuccin palette

Only one SVG, no toggle effect. The `palette=` and `colorMode=` fence
options override the integration defaults for this block alone.

```dgmo palette=catppuccin colorMode=light
pie
TypeScript  45
Python       30
Rust         25
```

## Map with points of interest

Maps need basemap coastlines and borders, which the integration supplies
to every block — the library no longer reads them off disk itself. A map
that renders as an error card, or as labels floating on an empty page,
means those never arrived.

```dgmo
map Port Calls

poi Denver
poi Miami
```
