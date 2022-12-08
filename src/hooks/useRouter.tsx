import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export const useRouter = () => {
  const navigate = useNavigate();
  const { pathname, state: locationState } = useLocation();
  const [searchParams] = useSearchParams();
  const searchParamsObject = Object.fromEntries(searchParams.entries());

  return {
    pathname,
    locationState,
    searchParamsObject,
    navigate,
  };
};
