# OandOcraft Block Library Sources

The current block refresh is being steered to a SmartDraw-like standard with
manufacturer planning symbols as the reference language, not generic icon packs.

## Priority Order

1. MillerKnoll
2. Steelcase
3. BIMobject for category gaps only

## Core Families To Rebuild First

- Workstations and benching
  - Primary source: MillerKnoll
  - Backup source: Steelcase
- Private offices and executive desks
  - Primary source: MillerKnoll
  - Backup source: Steelcase
- Meeting tables and boardroom layouts
  - Primary source: Steelcase
  - Backup source: MillerKnoll
- Phone booths and focus pods
  - Primary source: Steelcase
  - Gap fill: BIMobject
- Lounge seating, reception, waiting areas
  - Primary source: MillerKnoll
  - Gap fill: BIMobject
- Storage, credenzas, printer bays, lockers
  - Primary source: Steelcase
  - Gap fill: BIMobject

## Conversion Rules

- Use the source assets as dimensional and typology references, not as raw
  pasted DWG/BIM imports.
- Normalize every block into a consistent top-view SVG/Konva language.
- Keep one stroke system across all blocks.
- Prefer simplified, readable plan symbols over photoreal detail.
- Avoid decorative gradients and tiny inner details that blur at planner zoom.
- Preserve realistic proportions so seating density and circulation stay
  believable.

## Visual Target

- Cleaner than the current cartoon blocks
- More professional than generic icon-pack furniture
- Close to SmartDraw / CAD planning readability
- Consistent enough that mixed brands still look like one OandOcraft library
