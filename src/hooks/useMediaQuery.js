import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false);

  useEffect(() => {
    const media = window.matchMedia?.(query);
    if (!media) return undefined;
    const handleChange = (event) => setMatches(event.matches);
    setMatches(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
