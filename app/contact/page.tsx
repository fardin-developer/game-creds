import ContactUsPage from '../components/ContactUsPage';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Contact() {
  return (
    <ProtectedRoute>
      <ContactUsPage />
    </ProtectedRoute>
  );
}
