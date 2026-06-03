import LeaderboardPage from '../components/LeaderboardPage';
import AuthChecker from '../components/AuthChecker';

export default function Leaderboard() {
  return (
    <AuthChecker>
      <LeaderboardPage />
    </AuthChecker>
  );
}
