# Block Library Sources

## Purpose
Define where block assets come from and how the library should be kept current.

## Why this deserves its own document
This is about provenance and product quality, not just asset storage. The docs should make it clear which source is trusted, which source is transitional, and which source should be retired.

## Source tiers
1. Product-owned canonical assets
2. Curated internal additions
3. Legacy imported assets
4. Temporary fallback assets

## Provenance model
Every block family should describe:
- where it came from
- whether it is canonical
- whether it is editable
- whether it is a fallback
- whether it should be replaced later

## Metadata expectations
- stable name
- category
- visual role
- source tier
- reuse or licensing note
- canonical status

## Naming rules
- use predictable human-readable names
- keep IDs stable
- avoid duplicate aliases unless they are explicitly documented
- align names between docs and implementation

## Maintenance workflow
- review new assets against the canonical set
- deduplicate obvious overlaps
- normalize names and categories
- update docs when the source hierarchy changes
- note replacement candidates for old assets

## Rebuild strategy
If the library is rebuilt, the plan should explain:
- what stays
- what is renamed
- what is retired
- what is promoted to canonical status
- what temporary fallback material remains

## Saved source links
### Herman Miller
- https://www.hermanmiller.com/resources/3d-models-and-planning-tools/product-models/
- https://www.hermanmiller.com/resources/3d-models-and-planning-tools/product-models/pc/office-chairs/
- https://www.hermanmiller.com/products/seating/office-chairs/aeron-chair/pro-resources/
- https://www.hermanmiller.com/resources/

### Steelcase
- https://www.steelcase.com/resources/revit/
- https://www.steelcase.com/resources/models/
- https://www.steelcase.com/eu-en/resources/revit/
- https://www.steelcase.com/resources/3d-models-cad/

### BIMobject / BIM sources
- https://www.bimobject.com/
- https://www.bimobject.com/en-us
- https://www.bimobject.com/en/search
- https://www.bimobject.com/en/collections
- https://www.bimobject.com/en/collections/library
- https://www.bimobject.com/en/categories
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_freestanding_cabinet_acl810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_suspended_acu810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_wooden_mobile_pedestal_400w_spo053
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_ab_freestanding_recess_handle_aclr810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_freestanding_cabinet_acl820
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_ab_mobile_recess_handle_400w_spor053
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_a_double_desk_43addxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_j_double_desk_43jddxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_f_double_bench_43fdbxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_g_double_bench_43gdbxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_rectmeetingtable_platform_140x450
- https://www.bimobject.com/en-us/rockworth/product/furniture_officedesks-tables_rockworth_i-box_98ig1xxx
- https://www.bimobject.com/en-us/rockworth/product/furniture_officedesks-tables_rockworth_meetbox_98m4fg2024
- https://www.bimobject.com/en-us/rockworth/product/rockworth_conferencetable_platform_120x450
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_freestanding_cabinet_act810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_ab_freestanding_recess_handle_cabinet_achr811
- https://www.bimobject.com/en-us/rockworth/product/rockworth_joy_series_50_3_shelf_swing_door_50swdl040090
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_3_tiers_locker_xs_64cle3xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_6_tiers_locker_385e_64cli385e6xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_6_tiers_locker_xs_64cle6xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_4_tiers_locker_s_64cls4xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_sofas_haf_1seat-with-back
- https://www.bimobject.com/en-us/rockworth/product/rockworth_sofas_haf_2seat-with-back
- https://www.bimobject.com/en-us/rockworth/product/rockworth_sofas_haf_3seat-with-back
- https://www.bimobject.com/en-us/practika/product/fridman-h
- https://www.bimobject.com/en-us/practika/product/hatters
- https://www.bimobject.com/en-us/seps2bim/product/f0240
- https://www.bimobject.com/en-us/modernform-workplace/product/modernform_midbackchair_series12_71x67

### Rockworth
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_freestanding_cabinet_acl810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_suspended_acu810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_wooden_mobile_pedestal_400w_spo053
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_ab_freestanding_recess_handle_aclr810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_freestanding_cabinet_acl820
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_ab_mobile_recess_handle_400w_spor053
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_a_double_desk_43addxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_j_double_desk_43jddxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_f_double_bench_43fdbxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_s43_new_leg_g_double_bench_43gdbxxxx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_rectmeetingtable_platform_140x450
- https://www.bimobject.com/en-us/rockworth/product/furniture_officedesks-tables_rockworth_i-box_98ig1xxx
- https://www.bimobject.com/en-us/rockworth/product/furniture_officedesks-tables_rockworth_meetbox_98m4fg2024
- https://www.bimobject.com/en-us/rockworth/product/rockworth_conferencetable_platform_120x450
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_freestanding_cabinet_act810
- https://www.bimobject.com/en-us/rockworth/product/rockworth_cabinet_ab_freestanding_recess_handle_cabinet_achr811
- https://www.bimobject.com/en-us/rockworth/product/rockworth_joy_series_50_3_shelf_swing_door_50swdl040090
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_3_tiers_locker_xs_64cle3xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_6_tiers_locker_385e_64cli385e6xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_6_tiers_locker_xs_64cle6xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_modular_4_tiers_locker_s_64cls4xx
- https://www.bimobject.com/en-us/rockworth/product/rockworth_sofas_haf_1seat-with-back
- https://www.bimobject.com/en-us/rockworth/product/rockworth_sofas_haf_2seat-with-back
- https://www.bimobject.com/en-us/rockworth/product/rockworth_sofas_haf_3seat-with-back

### Practika
- https://www.bimobject.com/en-us/practika/product/fridman-h
- https://www.bimobject.com/en-us/practika/product/hatters

### SEPS2BIM
- https://www.bimobject.com/en-us/seps2bim/product/f0240

### Modernform Workplace
- https://www.bimobject.com/en-us/modernform-workplace/product/modernform_midbackchair_series12_71x67

## Acceptance criteria
- the source order is unambiguous
- the canonical set is easy to identify
- contributors can evaluate a block without guessing
- old material does not quietly become the default

## Useful framing
This document should read like a source-governance and rebuild strategy, not a simple inventory.
