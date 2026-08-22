import json
import unittest
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def load_json(relative_path):
    with (ROOT / relative_path).open(encoding="utf-8") as handle:
        return json.load(handle)


class RepositoryIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.towers = load_json("data/towers.geojson")
        cls.candidates = load_json("data/candidates.geojson")
        cls.service_areas = load_json("data/service-areas.geojson")
        cls.sources = load_json("data/sources.json")["sources"]
        cls.photos = load_json("data/photos.json")["photos"]
        cls.projects = load_json("data/projects.json")["projects"]
        cls.claims = load_json("data/claims.json")["claims"]
        cls.operators = load_json("data/operators.json")["operators"]

    def assert_unique_ids(self, records, label):
        ids = [record["id"] for record in records]
        self.assertEqual(len(ids), len(set(ids)), f"duplicate {label} IDs")
        self.assertTrue(all(ids), f"blank {label} ID")

    def assert_refs_exist(self, refs, valid_ids, context):
        missing = sorted(set(refs) - set(valid_ids))
        self.assertEqual(missing, [], f"{context} references missing IDs: {missing}")

    def test_geojson_collections_are_nonempty(self):
        for label, collection in (
            ("towers", self.towers),
            ("candidates", self.candidates),
            ("service areas", self.service_areas),
        ):
            self.assertEqual(collection.get("type"), "FeatureCollection", label)
            self.assertIsInstance(collection.get("features"), list, label)
            self.assertGreater(len(collection["features"]), 0, label)
            for feature in collection["features"]:
                self.assertEqual(feature.get("type"), "Feature", label)
                self.assertIn("id", feature, label)
                self.assertIsInstance(feature.get("properties"), dict, label)

    def test_all_record_ids_are_unique(self):
        groups = {
            "tower": self.towers["features"],
            "candidate": self.candidates["features"],
            "service area": self.service_areas["features"],
            "source": self.sources,
            "photo": self.photos,
            "project": self.projects,
            "claim": self.claims,
            "operator": self.operators,
        }
        for label, records in groups.items():
            with self.subTest(label=label):
                self.assert_unique_ids(records, label)

    def test_tower_references_resolve(self):
        source_ids = {record["id"] for record in self.sources}
        photo_ids = {record["id"] for record in self.photos}
        project_ids = {record["id"] for record in self.projects}
        claim_ids = {record["id"] for record in self.claims}
        operator_ids = {record["id"] for record in self.operators}
        area_ids = {record["id"] for record in self.service_areas["features"]}

        for tower in self.towers["features"]:
            props = tower["properties"]
            tower_id = tower["id"]
            checks = (
                (props.get("sourceIds", []), source_ids, "source"),
                (props.get("photoIds", []), photo_ids, "photo"),
                (props.get("projectIds", []), project_ids, "project"),
                (props.get("claimIds", []), claim_ids, "claim"),
                (props.get("serviceAreaIds", []), area_ids, "service area"),
            )
            for refs, valid_ids, label in checks:
                self.assert_refs_exist(refs, valid_ids, f"tower {tower_id} {label}")
            if props.get("operatorId"):
                self.assertIn(props["operatorId"], operator_ids, tower_id)

    def test_related_table_references_resolve(self):
        tower_ids = {record["id"] for record in self.towers["features"]}
        source_ids = {record["id"] for record in self.sources}
        project_ids = {record["id"] for record in self.projects}
        operator_ids = {record["id"] for record in self.operators}
        claim_subject_ids = tower_ids | project_ids | operator_ids

        for photo in self.photos:
            self.assertIn(photo["structureId"], tower_ids, photo["id"])
            self.assertIn(photo["sourceId"], source_ids, photo["id"])
        for claim in self.claims:
            self.assertIn(claim["subjectId"], claim_subject_ids, claim["id"])
            self.assert_refs_exist(
                claim.get("sourceIds", []), source_ids, f"claim {claim['id']} source"
            )
        for project in self.projects:
            self.assert_refs_exist(
                project.get("structureIds", []), tower_ids, f"project {project['id']} tower"
            )
            self.assert_refs_exist(
                project.get("sourceIds", []), source_ids, f"project {project['id']} source"
            )
            if project.get("operatorId"):
                self.assertIn(project["operatorId"], operator_ids, project["id"])
        for operator in self.operators:
            self.assert_refs_exist(
                operator.get("sourceIds", []), source_ids, f"operator {operator['id']} source"
            )

    def test_candidate_source_references_resolve(self):
        source_ids = {record["id"] for record in self.sources}
        for candidate in self.candidates["features"]:
            self.assert_refs_exist(
                candidate["properties"].get("sourceIds", []),
                source_ids,
                f"candidate {candidate['id']} source",
            )

    def test_local_photo_assets_exist_inside_repository(self):
        paths = [record["properties"].get("photo") for record in self.towers["features"]]
        paths.extend(record.get("path") for record in self.photos)
        for relative_path in filter(None, paths):
            with self.subTest(path=relative_path):
                self.assertFalse(Path(relative_path).is_absolute())
                resolved = (ROOT / relative_path).resolve()
                self.assertTrue(resolved.is_relative_to(ROOT))
                self.assertTrue(resolved.is_file(), relative_path)

    def test_candidate_license_boundaries_are_explicit(self):
        licensing = self.candidates.get("licensing", {})
        self.assertEqual(licensing.get("type"), "collective database")
        self.assertEqual(set(licensing.get("licenses", [])), {"CC-BY-4.0", "ODbL-1.0"})

        for feature in self.candidates["features"]:
            props = feature["properties"]
            if feature["id"].startswith("osm-"):
                self.assertEqual(props.get("dataLicense"), "ODbL-1.0", feature["id"])
                self.assertEqual(
                    props.get("dataAttribution"), "OpenStreetMap contributors", feature["id"]
                )
                self.assertTrue(
                    any("openstreetmap.org" in source.get("url", "") for source in props["sources"]),
                    feature["id"],
                )
            elif feature["id"].startswith("map-identified-"):
                self.assertEqual(props.get("dataLicense"), "CC-BY-4.0", feature["id"])
                self.assertEqual(
                    props.get("dataAttribution"), "OpenWaterTowers contributors", feature["id"]
                )
            else:
                self.fail(f"candidate {feature['id']} has no recognized license boundary")

    def test_source_metadata_is_well_formed(self):
        allowed_statuses = {"live", "intermittent", "broken", "local"}
        for source in self.sources:
            with self.subTest(source=source["id"]):
                self.assertIn(source["linkStatus"], allowed_statuses)
                for key in ("url", "archiveUrl", "stableLandingPageUrl"):
                    value = source.get(key, "")
                    if value:
                        parsed = urlparse(value)
                        self.assertEqual(parsed.scheme, "https", f"{source['id']} {key}")
                        self.assertTrue(parsed.netloc, f"{source['id']} {key}")
                if source.get("stableLandingPageUrl"):
                    self.assertNotEqual(source["stableLandingPageUrl"], source.get("url"))
                    self.assertTrue(source.get("lastCheckedAt"), source["id"])

    def test_osm_tile_policy_and_marker_labels_are_guarded(self):
        app_source = (ROOT / "app.js").read_text(encoding="utf-8")
        index_source = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn(
            'tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"]', app_source
        )
        for deprecated_host in (
            "a.tile.openstreetmap.org",
            "b.tile.openstreetmap.org",
            "c.tile.openstreetmap.org",
        ):
            self.assertNotIn(deprecated_host, app_source)
        add_to_position = app_source.index(".addTo(map);")
        accessible_label_position = app_source.index(
            'markerEl.setAttribute("aria-label", properties.name);', add_to_position
        )
        self.assertGreater(accessible_label_position, add_to_position)
        self.assertIn('src="app.js?v=20260821-osm-a11y"', index_source)


if __name__ == "__main__":
    unittest.main()
