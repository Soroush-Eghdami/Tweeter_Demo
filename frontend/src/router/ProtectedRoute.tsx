import { Navigate } from "react-router-dom";
import { useMyProfile } from "../hooks/useMyProfile";

interface ProtectedRoutePropsType {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRoutePropsType) => {
  const { data, isLoading } = useMyProfile();

  if (isLoading)
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-center items-center backdrop-blur-md bg-black/70">
        <div className="w-14 h-14 border-4 border-gray-600 border-t-white rounded-full animate-spin" />
      </div>
    );

  return data ? children : <Navigate to={"/login"} replace />;
};

export default ProtectedRoute;
