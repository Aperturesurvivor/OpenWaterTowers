# Contributing To OpenWaterTowers

OpenWaterTowers welcomes careful public-interest contributions about water
towers, standpipes, tanks, and related public water storage landmarks.

## Contribution Workflow

1. Add possible sites to `data/candidates.geojson`.
2. Verify from public viewpoints only.
3. Add a clear public-facing photo when available.
4. Match the site to public sources.
5. Fill in non-sensitive civic and engineering context.
6. Move verified records to `data/towers.geojson`.
7. Add service-area context to `data/service-areas.geojson` only when supported
   by public sources.

## Field Rules

- Stay on public roads, sidewalks, trails, parks, or other lawful public access
  points.
- Do not trespass, cross fences, enter utility property, or bypass access
  controls.
- Do not publish access instructions, gate details, lock details, camera
  locations, alarm details, internal layouts, SCADA/control details, or other
  operational/security information.
- Avoid close-up photos of security signage, telecom/RF equipment, access
  panels, control boxes, or site-specific vulnerability details.
- If a photo includes sensitive signage or equipment, crop or blur it before
  publishing.

## Data Standards

Tower records use GeoJSON points. Service areas use GeoJSON polygons or
multipolygons. Keep records factual, sourced, and conservative.

Tower records should include:

- `name`
- `aliases`
- `area`
- `nearbyIntersection`
- `ownerOperator`
- `structureType`
- `serviceAreaIds`
- `serviceRole`
- `pressureZone`
- `capacityGallons`
- `capacityDisplay`
- `heightFeet`
- `overflowElevationFeetMsl`
- `constructedDisplay`
- `constructedNote`
- `status`
- `confidence`
- `observedAt`
- `photo`
- `photoCredit`
- `publicNotes`
- `sources`

Service-area records should include:

- `name`
- `ownerOperator`
- `areaType`
- `geometryConfidence`
- `sourceBasis`
- `publicNotes`
- `sources`

Use `unknown`, `null`, or an empty array rather than guessing.

## Source Preferences

Preferred sources:

- city or water-district master plans
- public utility maps
- council packets, minutes, bid notices, and engineering reports
- state public water system records
- OpenStreetMap for candidate discovery
- field observations from public viewpoints

Avoid unsourced claims, private maps, leaked documents, and anything that looks
restricted or operationally sensitive.

## Service-Area Mapping

Service-area data can make the project much more useful, but it deserves extra
care. The goal is to show civic context: which district, pressure zone, or
public service area a structure is associated with.

Good service-area geometry is:

- public
- cited
- approximate when appropriate
- free of access/security detail
- useful for understanding public infrastructure at a neighborhood or district
  level

Do not overfit or reverse-engineer exact operational boundaries from scattered
clues.
