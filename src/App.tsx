import { BrowserRouter, Routes, Route, Navigate, useOutletContext } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from './lib/auth/AuthProvider'
import { ThemeProvider } from './lib/theme'
import { RequireAuth } from './components/auth/RequireAuth'
import { RequireTeam } from './components/auth/RequireTeam'
import { RouteLoadingFallback } from './components/ui/RouteLoadingFallback'
import type { Team } from './types/team'

const routerBasename =
  import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')

const LandingPage = lazy(() =>
  import('./components/landing/LandingPage').then((m) => ({ default: m.LandingPage })),
)
const LoginPage = lazy(() =>
  import('./components/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const SignupPage = lazy(() =>
  import('./components/auth/SignupPage').then((m) => ({ default: m.SignupPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('./components/auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const AuthVerifyPage = lazy(() =>
  import('./components/auth/AuthVerifyPage').then((m) => ({ default: m.AuthVerifyPage })),
)
const AuthResetPage = lazy(() =>
  import('./components/auth/AuthResetPage').then((m) => ({ default: m.AuthResetPage })),
)
const InvitePage = lazy(() =>
  import('./components/team/InvitePage').then((m) => ({ default: m.InvitePage })),
)
const ProjectShell = lazy(() =>
  import('./components/editor/ProjectShell').then((m) => ({ default: m.ProjectShell })),
)
const MapView = lazy(() =>
  import('./components/editor/MapView').then((m) => ({ default: m.MapView })),
)
const RosterPage = lazy(() =>
  import('./components/editor/RosterPage').then((m) => ({ default: m.RosterPage })),
)
const EngineChooserPage = lazy(() =>
  import('./components/editor/EngineChooserPage').then((m) => ({ default: m.EngineChooserPage })),
)
const TeamOnboardingPage = lazy(() =>
  import('./components/team/TeamOnboardingPage').then((m) => ({
    default: m.TeamOnboardingPage,
  })),
)
const TeamHomePage = lazy(() =>
  import('./components/team/TeamHomePage').then((m) => ({ default: m.TeamHomePage })),
)
const TeamSettingsPage = lazy(() =>
  import('./components/team/TeamSettingsPage').then((m) => ({ default: m.TeamSettingsPage })),
)
const TeamSettingsGeneral = lazy(() =>
  import('./components/team/TeamSettingsGeneral').then((m) => ({
    default: m.TeamSettingsGeneral,
  })),
)
const TeamSettingsMembers = lazy(() =>
  import('./components/team/TeamSettingsMembers').then((m) => ({
    default: m.TeamSettingsMembers,
  })),
)
const DashboardRedirect = lazy(() =>
  import('./components/team/DashboardRedirect').then((m) => ({
    default: m.DashboardRedirect,
  })),
)
const AccountPage = lazy(() =>
  import('./components/team/AccountPage').then((m) => ({ default: m.AccountPage })),
)
const HelpPage = lazy(() =>
  import('./components/help/HelpPage').then((m) => ({ default: m.HelpPage })),
)
const ProjectDocsPage = lazy(() =>
  import('./components/help/ProjectDocsPage').then((m) => ({ default: m.ProjectDocsPage })),
)
const ReportsPage = lazy(() =>
  import('./components/reports/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  })),
)
const ScenariosPage = lazy(() =>
  import('./components/editor/reports/ScenariosPage').then((m) => ({
    default: m.ScenariosPage,
  })),
)
const OrgChartPage = lazy(() =>
  import('./components/editor/OrgChartPage').then((m) => ({
    default: m.OrgChartPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('./components/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function TeamSettingsGeneralBridge() {
  const { team, isAdmin } = useOutletContext<{ team: Team; isAdmin: boolean }>()
  return <TeamSettingsGeneral team={team} isAdmin={isAdmin} />
}

function TeamSettingsMembersBridge() {
  const { team, isAdmin } = useOutletContext<{ team: Team; isAdmin: boolean }>()
  return <TeamSettingsMembers team={team} isAdmin={isAdmin} />
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={routerBasename}>
        <AuthProvider>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route path="/auth/verify" element={<AuthVerifyPage />} />
            <Route path="/auth/reset" element={<AuthResetPage />} />
            <Route path="/invite/:token" element={<InvitePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/docs" element={<ProjectDocsPage />} />

            {/* Auth-only */}
            <Route
              path="/onboarding/team"
              element={
                <RequireAuth>
                  <TeamOnboardingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />

            {/* Auth + Team required */}
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <RequireTeam>
                    <DashboardRedirect />
                  </RequireTeam>
                </RequireAuth>
              }
            />
            <Route
              path="/t/:teamSlug"
              element={
                <RequireAuth>
                  <RequireTeam>
                    <TeamHomePage />
                  </RequireTeam>
                </RequireAuth>
              }
            />
            <Route
              path="/t/:teamSlug/settings"
              element={
                <RequireAuth>
                  <RequireTeam>
                    <TeamSettingsPage />
                  </RequireTeam>
                </RequireAuth>
              }
            >
              <Route index element={<TeamSettingsGeneralBridge />} />
              <Route path="members" element={<TeamSettingsMembersBridge />} />
            </Route>

            {/* Office editor */}
            <Route
              path="/t/:teamSlug/o/:officeSlug"
              element={
                <RequireAuth>
                  <RequireTeam>
                    <ProjectShell />
                  </RequireTeam>
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="engine" replace />} />
              <Route path="engine" element={<EngineChooserPage />} />
              <Route path="map" element={<MapView />} />
              <Route path="roster" element={<RosterPage />} />

              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/scenarios" element={<ScenariosPage />} />

              <Route path="org-chart" element={<OrgChartPage />} />
            </Route>

            <Route path="/project/*" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
