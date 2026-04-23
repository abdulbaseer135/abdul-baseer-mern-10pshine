import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
    <div className="text-8xl mb-6">🔍</div>
    <h1 className="text-4xl font-bold text-gray-800 mb-3">404</h1>
    <p className="text-gray-500 mb-6">
      Oops! The page you're looking for doesn't exist.
    </p>
    <Link
      to="/dashboard"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
    >
      Go to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;