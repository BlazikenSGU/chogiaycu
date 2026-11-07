
import { useAuth } from '../hooks/useAuth';

export default function AuthDebug() {
  const {
    user,
    status,
    isAuthenticated,
    isAdmin,
  } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h2>Authentication Debug</h2>

      <p>Status: {status}</p>
      <p>
        Authenticated:
        {isAuthenticated ? ' Yes' : ' No'}
      </p>
      <p>Admin: {isAdmin ? ' Yes' : ' No'}</p>

      <pre>
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
}
