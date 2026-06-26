# OpenWaterTowers

OpenWaterTowers is an open source civic infrastructure database and field atlas
for water towers, standpipes, and public water storage landmarks.

The first dataset focuses on Coeur d'Alene, Hayden, Post Falls, Rathdrum, and
nearby North Idaho. The long-term goal is to make the project useful anywhere:
local contributors can verify sites from public viewpoints, attach public
sources, add non-sensitive engineering/civic context, map approximate service
areas when public data allows it, and publish evidence-backed records that
happen to render on a map.

## Goal

Make water towers discoverable, documented, and historically legible without
exposing sensitive operational details.

OpenWaterTowers is meant to sit at the intersection of civic infrastructure,
local history, field observation, geography, and public records. A good record
should answer simple public-interest questions:

- What is this structure?
- Who owns or operates it?
- What public water system or pressure/service area is it associated with?
- What non-sensitive public facts are known about its age, size, type, and role?
- What public sources support those claims?

## Current Records

- City of Coeur d'Alene Industrial Standpipe near Hanley Ave and N Carrington
  Ln.

## Candidate Layer

Candidate records live in [`data/candidates.geojson`](data/candidates.geojson).
They are not verified field records yet. The first candidate batch comes from
OpenStreetMap features tagged `man_made=water_tower` in the Coeur d'Alene,
Hayden, Post Falls, Rathdrum, and nearby Kootenai County corridor.

Use the candidate layer as a route-planning and research queue:

- verify from public roads only
- take a clean public-facing photo
- match the site to a public utility/city/water-district source
- fill in owner, tank type, capacity, build year, and source links
- move the record to `data/towers.geojson` once verified

## Service Areas

Service-area records live in
[`data/service-areas.geojson`](data/service-areas.geojson). This layer is for
publicly documented water-service areas, pressure zones, districts, or other
non-sensitive coverage boundaries that help explain what a tower supports.

Good service-area sources include:

- city water system master plans
- utility service-area maps
- water district public maps
- public council packets and engineering reports
- state or local public water system records

Use conservative geometry. Prefer official public polygons. If only a diagram
or prose description is available, mark the geometry as `approximate` and cite
the source clearly. Do not trace or publish restricted utility maps.

## Data Model

Tower records live in [`data/towers.geojson`](data/towers.geojson). Each
feature uses standard GeoJSON point geometry plus a `properties` object for
civic and engineering notes. Richer database tables live beside the map layer:

- [`data/operators.json`](data/operators.json)
- [`data/sources.json`](data/sources.json)
- [`data/photos.json`](data/photos.json)
- [`data/projects.json`](data/projects.json)
- [`data/claims.json`](data/claims.json)
- [`data/service-areas.geojson`](data/service-areas.geojson)

See [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) for the full schema direction.

Important fields:

- `name`
- `aliases`
- `operatorId`
- `ownerOperator`
- `structureType`
- `serviceAreaIds`
- `serviceRole`
- `sourceIds`
- `photoIds`
- `projectIds`
- `claimIds`
- `capacityGallons`
- `heightFeet`
- `constructedDisplay`
- `confidence`
- `publicNotes`
- `sources`

## Publishing Rules

- Use photos taken from public viewpoints only.
- Do not trespass or cross fences.
- Do not publish access instructions, gate details, lock details, alarm details,
  or other operational/security information.
- Crop or blur telecom/RF/security signage unless it is directly necessary for
  public-record verification.
- Treat service-area geometry as civic context, not operational guidance.
- Prefer public documents, city packets, utility plans, legal notices, and field
  observations.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the field-verification workflow,
data standards, and safety rules. Use the
[`Field Visit Checklist`](docs/FIELD_CHECKLIST.md) before visiting candidate
locations.

## License

Code is licensed under the MIT License. Data and original documentation are
licensed under CC BY 4.0 unless a source-specific restriction applies.

## Local Preview

From this folder:

```sh
python3 -m http.server 4173
```

Then open <http://localhost:4173>.
