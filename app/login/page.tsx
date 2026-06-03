import LoginPage from '../components/LoginPage';
import PublicRoute from '../components/PublicRoute';

export default function Login() {
  return (
    <PublicRoute>
      <LoginPage />
    </PublicRoute>
  );
}
