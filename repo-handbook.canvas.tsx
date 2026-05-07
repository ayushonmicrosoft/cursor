import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Link,
  Stack,
  Table,
  Text,
  useHostTheme,
} from 'cursor/canvas'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'system-map', label: 'System map' },
  { id: 'user-flows', label: 'Primary flows' },
  { id: 'editor', label: 'Editor surface' },
  { id: 'auth', label: 'Auth and access' },
  { id: 'data', label: 'Data and state' },
  { id: 'testing', label: 'Testing and quality' },
  { id: 'repo-tour', label: 'Repository tour' },
  { id: 'gotchas', label: 'Gotchas' },
]

function SectionNav() {
  const theme = useHostTheme()
  return (
    <Card>
      <CardHeader>
        <H2>Table of contents</H2>
      </CardHeader>
      <CardBody>
        <Stack gap={10}>
          {sections.map((section) => (
            <Link key={section.id} href={`#${section.id}`} tone={theme.accent}>
              {section.label}
            </Link>
          ))}
        </Stack>
      </CardBody>
    </Card>
  )
}

export default function RepoHandbookCanvas() {
  const theme = useHostTheme()

  return (
    <Stack gap={20}>
      <Card>
        <CardHeader>
          <Stack gap={10}>
            <H1>OandOcraft repository handbook</H1>
            <Text tone="secondary">
              A compact, all-in-one docs site for understanding the repo: what
              it does, how the app is wired, where the important code lives, and
              what to watch for when changing behavior.
            </Text>
            <Stack direction="horizontal" gap={8}>
              <Badge tone="info">React + TypeScript</Badge>
              <Badge tone="info">Router-driven app</Badge>
              <Badge tone="info">Editor-heavy product</Badge>
              <Badge tone="info">Vitest coverage</Badge>
            </Stack>
          </Stack>
        </CardHeader>
        <CardBody>
          <Grid columns={3} gap={12}>
            <Card>
              <CardBody>
                <Text tone="secondary">Primary domain</Text>
                <H3>Office planning</H3>
                <Text>
                  Hybrid workplace layout, seat assignment, reports, and
                  editing workflows.
                </Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text tone="secondary">Core surfaces</Text>
                <H3>Landing, auth, editor</H3>
                <Text>
                  The repo spans marketing pages, sign-in flows, and a rich map
                  editor with multiple render engines.
                </Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text tone="secondary">Operational focus</Text>
                <H3>Quality first</H3>
                <Text>
                  Tests, lint, route guards, and engine fallbacks are central to
                  keeping the app stable.
                </Text>
              </CardBody>
            </Card>
          </Grid>
        </CardBody>
      </Card>

      <SectionNav />

      <Divider />

      <section id="overview">
        <Stack gap={12}>
          <H2>Overview</H2>
          <Text>
            OandOcraft is a workplace planning application. Users sign in,
            choose a team, open an office, and interact with an editor that can
            place desks, rooms, shapes, labels, and custom SVGs. The app also
            includes onboarding, reports, and admin tooling.
          </Text>
          <Text tone="secondary">
            The codebase is organized to keep the public landing experience
            separate from the authenticated editor shell while still sharing the
            same UI system, routing, and state stores.
          </Text>
        </Stack>
      </section>

      <section id="system-map">
        <Stack gap={12}>
          <H2>System map</H2>
          <Table
            headers={["Area", "What it owns", "Important files"]}
            rows={[
              [
                'Routing shell',
                'Top-level app routes, auth gating, lazy loading',
                '`src/App.tsx`',
              ],
              [
                'Landing page',
                'Marketing hero, footer, signup/login entry points',
                '`src/components/landing/*`',
              ],
              [
                'Auth flows',
                'Login, signup, reset, verify, access guards',
                '`src/components/auth/*`',
              ],
              [
                'Editor surface',
                'Canvas, sidebar tools, minimap, engines, overlays',
                '`src/components/editor/*`',
              ],
              [
                'Team shell',
                'Team home, settings, account, roster, office switcher',
                '`src/components/team/*`',
              ],
              [
                'State stores',
                'UI, canvas, elements, project, floors, employees, toasts',
                '`src/stores/*`',
              ],
              [
                'Domain logic',
                'SVG sanitization, office persistence, demo seeding',
                '`src/lib/*`',
              ],
              [
                'Tests',
                'Behavioral and integration tests for routes and editor UX',
                '`src/__tests__` and `src/components/**/__tests__`',
              ],
            ]}
          />
        </Stack>
      </section>

      <Divider />

      <section id="user-flows">
        <Stack gap={12}>
          <H2>Primary flows</H2>
          <Grid columns={2} gap={16}>
            <Card>
              <CardHeader>
                <H3>Public entry</H3>
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>Landing page → signup/login → team onboarding.</Text>
                  <Text tone="secondary">
                    These routes stay lightweight, responsive, and safe for
                    first-time users.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <H3>Authenticated work</H3>
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>Dashboard → team home → office editor → reports.</Text>
                  <Text tone="secondary">
                    Most product value lives here, with state persisted through
                    the project and element stores.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <H3>Editor interactions</H3>
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>
                    Add desks, walls, labels, rooms, SVGs, then move and
                    assign them.
                  </Text>
                  <Text tone="secondary">
                    The editor combines tool selection, drag/drop, keyboard
                    shortcuts, and context menus.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <H3>Operational controls</H3>
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>Admin entry, conflict recovery, onboarding, export.</Text>
                  <Text tone="secondary">
                    These flows protect user work and give power users extra
                    control.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Grid>
        </Stack>
      </section>

      <Divider />

      <section id="editor">
        <Stack gap={12}>
          <H2>Editor surface</H2>
          <Text>
            The editor is the deepest part of the repo. It is built from a few
            cooperating layers: the canvas stage, left sidebar tools, right-side
            reports, a minimap, and engine abstractions that allow both Konva
            and Pixi renderers.
          </Text>
          <Table
            headers={["Component", "Role", "Notes"]}
            rows={[
              ['`CanvasStage`', 'Main editing canvas', 'Handles placement, selection, and engine tool interactions.'],
              ['`ElementLibrary`', 'Tool palette', 'Builds new elements from library items and shape creators.'],
              ['`Minimap`', 'Navigation aid', 'Interactive pan control with collapse/expand behavior.'],
              ['`EngineHost`', 'Renderer router', 'Chooses Konva or Pixi and falls back on failure.'],
              ['`FirstRunCoach`', 'Onboarding', 'Guides new users through editor basics and stores progress.'],
              ['`ConflictModal`', 'Sync safety', 'Handles concurrent edits and recovery choices.'],
            ]}
          />
        </Stack>
      </section>

      <section id="auth">
        <Stack gap={12}>
          <H2>Auth and access</H2>
          <Text>
            Route access is layered. Public pages are open, while onboarding,
            account, admin, dashboard, and office routes are wrapped in auth and
            team guards.
          </Text>
          <Code>
{`<Route
  path="/admin"
  element={
    <RequireAuth>
      <AdminGate>
        <AdminPage />
      </AdminGate>
    </RequireAuth>
  }
/>`}
          </Code>
          <Text tone="secondary">
            The admin experience is intentionally narrow. The code currently
            uses client-side gating for the UI affordance, so backend permission
            checks should remain the source of truth for anything sensitive.
          </Text>
        </Stack>
      </section>

      <Divider />

      <section id="data">
        <Stack gap={12}>
          <H2>Data and state</H2>
          <Grid columns={2} gap={16}>
            <Card>
              <CardHeader>
                <H3>Stores</H3>
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>
                    The app uses localized stores for UI state, canvas
                    geometry, elements, employees, floors, projects, and toasts.
                  </Text>
                  <Text tone="secondary">
                    Most editor actions are store-driven, which keeps rendering
                    components relatively thin.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>
                <H3>Persistence</H3>
              </CardHeader>
              <CardBody>
                <Stack gap={8}>
                  <Text>
                    Office data is loaded and saved through repository helpers,
                    with demo seeding for empty workspaces.
                  </Text>
                  <Text tone="secondary">
                    LocalStorage is also used for onboarding progress,
                    dismissed cards, and user preferences.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Grid>
          <Text>
            SVG uploads are sanitized before becoming custom canvas elements.
            Shape creation now also includes parsing SVG dimensions from the raw
            markup so the editor can size custom assets correctly.
          </Text>
        </Stack>
      </section>

      <Divider />

      <section id="testing">
        <Stack gap={12}>
          <H2>Testing and quality</H2>
          <Text>
            The repo leans on Vitest with behavioral tests around editor
            interactions, route fallbacks, accessibility, and onboarding flows.
          </Text>
          <Table
            headers={["What to test", "Why it matters", "Representative files"]}
            rows={[
              ['Route fallback behavior', 'Prevents dead-end engine states and broken navigation.', '`src/components/editor/__tests__/engineRouteFallback.test.tsx`'],
              ['Mini UI interactions', 'Validates pointer events, anchors, and collapse affordances.', '`src/__tests__/minimapInteractive.test.tsx`'],
              ['Onboarding flow', 'Preserves first-use guidance and dismissal logic.', '`src/__tests__/firstRunCoach.test.tsx`'],
              ['Conflict handling', 'Protects against concurrent edits and data loss.', '`src/__tests__/conflictModal.test.tsx`'],
              ['SVG safety', 'Ensures user-uploaded assets are sanitized and sized correctly.', '`src/__tests__/customSvg.test.tsx`'],
            ]}
          />
        </Stack>
      </section>

      <Divider />

      <section id="repo-tour">
        <Stack gap={12}>
          <H2>Repository tour</H2>
          <Table
            headers={["Path", "Purpose", "Read first when…"]}
            rows={[
              ['`src/App.tsx`', 'Root router and provider composition', 'Changing routes, guards, or lazy loading.'],
              ['`src/components/landing/*`', 'Marketing and footer UX', 'Editing public entry points or site copy.'],
              ['`src/components/auth/*`', 'Login and signup flows', 'Tweaking authentication interactions.'],
              ['`src/components/team/*`', 'Team dashboard and account surfaces', 'Modifying the workspace shell or office navigation.'],
              ['`src/components/editor/*`', 'Core editor UI and engines', 'Working on canvas, tools, minimap, or renderer behavior.'],
              ['`src/lib/*`', 'Reusable domain helpers', 'Adjusting SVG sanitization, office persistence, or demos.'],
              ['`src/stores/*`', 'App state containers', 'Altering state shape, persistence, or cross-component coordination.'],
              ['`src/__tests__`', 'Cross-cutting UI and behavior tests', 'Verifying user-visible regression coverage.'],
            ]}
          />
        </Stack>
      </section>

      <Divider />

      <section id="gotchas">
        <Stack gap={12}>
          <H2>Gotchas</H2>
          <Grid columns={2} gap={16}>
            <Card>
              <CardBody>
                <Stack gap={8}>
                  <Text>Renderer state is more subtle than it looks.</Text>
                  <Text tone="secondary">
                    Pixi fallback logic needs to update both route and store
                    state, or the UI can become inconsistent.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stack gap={8}>
                  <Text>Element creation must preserve shape semantics.</Text>
                  <Text tone="secondary">
                    Shape labels, variants, and SVG dimensions need to agree or
                    library items will appear wrong in the canvas.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stack gap={8}>
                  <Text>LocalStorage keys are part of behavior.</Text>
                  <Text tone="secondary">
                    Some tests still assert legacy keys like
                    `firstRunWelcomeSeen`, so migration compatibility matters.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stack gap={8}>
                  <Text>Testing async UI needs care.</Text>
                  <Text tone="secondary">
                    Pointer and routing interactions often need `waitFor` or
                    `act` to avoid false negatives and warnings.
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          </Grid>
        </Stack>
      </section>

      <Divider />

      <Card>
        <CardHeader>
          <H2>Quick reference</H2>
        </CardHeader>
        <CardBody>
          <Stack gap={10}>
            <Text>
              Start at <Link href="#overview" tone={theme.accent}>Overview</Link>, then jump to the editor section for the
              part of the app most likely to need work.
            </Text>
            <Text tone="secondary">
              If you are debugging a specific feature, the best entry point is
              usually the related test file — the test names describe the user
              behavior very directly.
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  )
}
