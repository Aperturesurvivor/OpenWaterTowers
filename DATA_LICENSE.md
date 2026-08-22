# Data License

Unless otherwise noted below or in a record, OpenWaterTowers original dataset
records and original project documentation are licensed under the Creative
Commons Attribution 4.0 International License.

License text: https://creativecommons.org/licenses/by/4.0/

Source records may include links to third-party public documents, maps, meeting
packets, legal notices, OpenStreetMap records, or field observations. Those
source materials keep their own licenses and terms. OpenWaterTowers stores
citations and derived public-interest metadata; it does not relicense external
source documents.

## File-level boundaries

- `data/candidates.geojson` is a collective database with feature-level
  licensing. Each feature declares `properties.dataLicense` and
  `properties.dataAttribution`.
- Candidate features whose IDs begin with `osm-` contain coordinates and tags
  derived from OpenStreetMap. Those feature records are offered under the Open
  Database License 1.0 (ODbL) and require attribution to OpenStreetMap
  contributors: <https://www.openstreetmap.org/copyright>.
- Candidate features whose IDs begin with `map-identified-` contain original
  OpenWaterTowers contributor metadata and are licensed CC BY 4.0. A later
  source match can add a separate source-specific notice without changing the
  license on the original observation.
- Original records in `data/towers.geojson`, `data/service-areas.geojson`,
  `data/operators.json`, `data/sources.json`, `data/photos.json`,
  `data/projects.json`, and `data/claims.json` are licensed CC BY 4.0, except
  for any field or embedded source material explicitly marked with a
  source-specific license or restriction.

A citation to an external source does not relicense that source. Conversely,
coordinates, tags, or other data copied from OpenStreetMap remain subject to
the ODbL even when combined with original OpenWaterTowers material.

When reusing the dataset, attribute:

For CC BY records: OpenWaterTowers contributors, CC BY 4.0.

For ODbL candidate records: © OpenStreetMap contributors, ODbL 1.0.
