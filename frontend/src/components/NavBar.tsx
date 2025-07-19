import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center bg-gray-800 px-6 py-3 text-white">
      <div className="flex space-x-4">
        <Link to="/" className="hover:text-purple-400">
          Home
        </Link>
        <Link to="/profile" className="hover:text-purple-400">
          Profile
        </Link>
        <Link to="/collection" className="hover:text-purple-400">
          Collection
        </Link>
      </div>
      <div>
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700 transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/profile"
            className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-700 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
