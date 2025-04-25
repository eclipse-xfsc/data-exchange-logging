import { useLocation as useReactRouterLocation } from 'react-router-dom';

export const useLocation = () => {
  const location = useReactRouterLocation();

  return {
    ...location,
    parsed: {
      hash: Object.fromEntries(
        new URLSearchParams(location.hash.slice(1)).entries()
      ),
      search: Object.fromEntries(
        new URLSearchParams(location.search.slice(1)).entries()
      ),
    },
  };
};
