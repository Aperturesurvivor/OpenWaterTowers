# OpenWaterTowers Data Model

OpenWaterTowers is a public civic infrastructure database that renders spatially
on a map. The map layer should stay simple and durable, while the surrounding
tables preserve evidence, source status, photos, project history, and
open-source review state.

## Design Principles

- Store map geometry in GeoJSON.
- Store evidence-backed facts as claims, not only prose.
- Link records by stable IDs.
- Prefer public, accessible, citable sources.
- Mark unknowns plainly.
- Keep sensitive operational details out of the public dataset.

## Tables

### Structures

File: `data/towers.geojson`

One feature per visible public water storage structure or landmark.

Useful fields:

- `id`
- `name`
- `aliases`
- `structureCategory`
- `structureType`
- `materials`
- `status`
- `confidence`
- `geometry`
- `addressDisplay`
- `nearbyIntersection`
- `city`
- `county`
- `region`
- `country`
- `operatorId`
- `ownerOperator`
- `publicWaterSystemIds`
- `serviceAreaIds`
- `serviceRole`
- `pressureZone`
- `capacityGallons`
- `capacityDisplay`
- `heightFeet`
- `diameterFeet`
- `baseElevationFeetMsl`
- `overflowElevationFeetMsl`
- `constructedDisplay`
- `constructedNote`
- `engineer`
- `contractor`
- `fabricator`
- `paintCoatingHistory`
- `rehabilitationHistory`
- `photoIds`
- `sourceIds`
- `projectIds`
- `claimIds`
- `publicNotes`
- `openQuestions`
- `dataQuality`

### Service Areas

File: `data/service-areas.geojson`

One feature per public water district, pressure zone, municipal service area, or
other non-sensitive public coverage area.

Useful fields:

- `id`
- `name`
- `operatorId`
- `ownerOperator`
- `areaType`
- `geometry`
- `geometryConfidence`
- `sourceBasis`
- `relatedTowerIds`
- `publicWaterSystemIds`
- `sourceIds`
- `publicNotes`
- `openQuestions`

### Operators

File: `data/operators.json`

Public entities that own, operate, plan, or maintain structures.

Useful fields:

- `id`
- `name`
- `type`
- `jurisdiction`
- `website`
- `publicWaterSystemIds`
- `sourceIds`
- `notes`

### Sources

File: `data/sources.json`

Public documents, field observations, OSM records, news items, legal notices,
photos, or other evidence used by claims.

Useful fields:

- `id`
- `title`
- `sourceType`
- `publisher`
- `publicationDate`
- `url`
- `archiveUrl`
- `accessedAt`
- `linkStatus`
- `licenseNotes`
- `relevantPages`
- `notes`

### Photos

File: `data/photos.json`

Field photos and public media metadata.

Useful fields:

- `id`
- `structureId`
- `path`
- `photographer`
- `takenAt`
- `viewpointType`
- `caption`
- `altText`
- `license`
- `safetyReview`
- `sourceId`

### Projects

File: `data/projects.json`

Construction, rehabilitation, repainting, demolition, inspection, or capital
improvement projects.

Useful fields:

- `id`
- `name`
- `projectType`
- `structureIds`
- `operatorId`
- `status`
- `dateDisplay`
- `costDisplay`
- `contractor`
- `engineer`
- `sourceIds`
- `publicNotes`
- `openQuestions`

### Claims

File: `data/claims.json`

Atomic, source-linked facts. Claims make review and correction easier than
embedding all facts directly in prose.

Useful fields:

- `id`
- `subjectType`
- `subjectId`
- `field`
- `value`
- `unit`
- `confidence`
- `sourceIds`
- `quoteOrSummary`
- `reviewStatus`
- `notes`

## Public Safety Exclusions

Do not publish:

- access routes beyond ordinary public roads
- gate, lock, alarm, camera, or security details
- SCADA, controls, telemetry, electrical, or network diagrams
- internal piping/control schematics
- vulnerability assessments
- emergency operation procedures
- restricted, leaked, or non-public documents
