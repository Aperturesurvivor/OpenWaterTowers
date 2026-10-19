# OpenWaterTowers Reddit Post Kit

Prepared 2026-07-24. This is a posting package, not a record that the post has
already been published.

## Primary post

Start with the local Coeur d'Alene subreddit as an image/gallery post. Verify
the community's current rules immediately before publishing.

### Title

I’m building an open-source atlas of North Idaho’s water towers—what am I missing?

### Body

I’m local, and I started photographing and researching the water towers,
standpipes, and other public water-storage landmarks around Coeur d’Alene,
Post Falls, Hayden, and nearby communities.

It turned into **OpenWaterTowers**, an open-source civic atlas built from public
records and field photos taken from public roads. The first batch has **seven
field-observed records** and **nine candidates** still waiting for verification
or better sourcing. Each record separates verified facts from observations and
open questions instead of presenting every map point as equally certain.

I’m especially looking for:

- structures I missed;
- corrections or local history;
- older photos, news stories, or public city/utility documents; and
- people interested in verifying candidates from public viewpoints.

For safety, the project avoids access instructions, gate/lock/alarm details,
restricted utility maps, and other non-public operational information.

I directed the project and fieldwork, with AI assistance in the software,
research organization, and documentation.

GitHub, map source, data, and contribution guide:
https://github.com/Aperturesurvivor/OpenWaterTowers

If you recognize one of these structures—or know of another North Idaho water
tower—tell me what you know and, if possible, include a public source.

## Image order

Upload these as a four-image gallery in this order:

1. `assets/current-preview.png`
   - Purpose: immediately explains that this is a real map and sourced civic
     record, not only a photography collection.
   - Alt text: “OpenWaterTowers desktop map showing a verified North Idaho
     standpipe record beside its photograph and public facts.”
2. `assets/post-falls-spokane-street-water-tower-2026-07-16-2.jpg`
   - Purpose: the most recognizable traditional water-tower silhouette and the
     strongest local-history hook.
   - Alt text: “Historic Spokane Street water tower in Post Falls, photographed
     from a public area beneath a cloudy sky.”
3. `assets/post-falls-ford-rock-tank-2026-07-16-1.jpg`
   - Purpose: visual variety and strong Post Falls identity.
   - Alt text: “Low cylindrical Ford Rock water tank painted with a Post Falls
     landscape mural.”
4. `assets/post-falls-beck-road-standpipe-2026-07-16-1.jpg`
   - Purpose: shows that the atlas covers modern standpipes as well as classic
     elevated towers.
   - Alt text: “Tall pale-blue Beck Road standpipe against a deep blue,
     cloud-streaked North Idaho sky.”

Do not use photos centered on gates, signs, locks, communications equipment, or
other access/security details as publicity images.

## First comment

If the subreddit supports an image post but not a useful body, use this as the
first comment:

> The project is open source here:
> https://github.com/Aperturesurvivor/OpenWaterTowers
>
> The useful contributions are corrections, public historical sources, older
> photos, and structures I missed. Please do not post access instructions,
> security details, or non-public utility information.

## Shorter Idaho adaptation

### Title

I’m mapping North Idaho’s water towers and public water-storage landmarks

### Body

I’ve been building **OpenWaterTowers**, an open-source atlas combining field
photos, public records, maps, and local history for water towers and standpipes
around North Idaho.

The first release has seven field-observed records and nine candidates. I’m
looking for corrections, historical sources, older photos, and structures I
missed—especially outside the Coeur d’Alene/Post Falls area.

Everything is documented from public viewpoints and public sources, and the
project deliberately excludes access or security details.

https://github.com/Aperturesurvivor/OpenWaterTowers

## GIS adaptation

### Title

OpenWaterTowers: a source-linked civic atlas using MapLibre and GeoJSON

### Body

I built a small open-source field atlas for water towers, standpipes, and public
water-storage landmarks in North Idaho. The current site uses MapLibre with
reviewable GeoJSON/JSON records for structures, candidates, service areas,
operators, sources, photos, projects, and claims.

The data model keeps field observation, public-record evidence, confidence, and
unresolved questions separate. The first release has seven field-observed
records and nine candidates.

I’d particularly value feedback on the schema, provenance model, conservative
service-area handling, and how to make local contribution easier without
publishing operationally sensitive infrastructure details.

https://github.com/Aperturesurvivor/OpenWaterTowers

## Response guide

### “Why does this need to exist?”

Water towers are visible civic landmarks, but information about them is usually
scattered across city plans, council packets, utility documents, maps, and
local memory. The atlas makes that public history discoverable while preserving
sources and uncertainty.

### “Is publishing infrastructure information unsafe?”

The project only uses public records and observations from public viewpoints.
It excludes access instructions, gate/lock/alarm details, restricted maps, and
other non-public operational information. If a detail is unnecessary for the
public-history purpose, it does not belong in the dataset.

### “How was it built?”

The current interface is a lightweight static MapLibre application backed by
GeoJSON and JSON files. Josiah directed the concept, fieldwork, product
decisions, and review. AI materially assisted with implementation, research
organization, and documentation.

### “Can I contribute?”

Yes. The repository includes `CONTRIBUTING.md` and a field checklist. Useful
contributions include public-source corrections, historical context, public
photos, and candidate verification from public viewpoints.

### If someone posts sensitive details

Do not repeat or incorporate them. Ask the commenter to remove the sensitive
information, retain only the non-sensitive lead if independently verifiable,
and use public sources before changing the dataset.

## Finish line and outcome log

The first post is complete when it has been published and its response has been
reviewed after 48 hours.

Record:

- Post URL:
- Subreddit:
- Published:
- Views:
- Upvotes:
- Comments:
- Useful location leads:
- Factual corrections:
- Historical sources/photos:
- Potential contributors:
- Safety/moderation issues:
- Decision: complete / make one follow-up post / productize contributor flow

Success is at least one of:

- three useful location leads;
- one sourced factual correction;
- one outside contributor; or
- one meaningful local-history source or photo collection.
