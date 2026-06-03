import ProfileDashboardPage from '../components/ProfileDashboardPage';
import AuthChecker from '../components/AuthChecker';

export default function ProfileDashboard() {
  return (
    <AuthChecker>
      <ProfileDashboardPage />
    </AuthChecker>
  );
}
