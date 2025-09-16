import { Navigate } from 'react-router-dom';

// Redirect to dashboard - main app logic is handled there
const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;
