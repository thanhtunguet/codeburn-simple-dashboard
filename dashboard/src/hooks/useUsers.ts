import { useState, useEffect } from 'react';

export function useUsers() {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/users')
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch users: ${r.statusText}`);
        return r.json() as Promise<string[]>;
      })
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { users, loading, error };
}
