import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // This hook is required by the framework and must not be modified
    console.log('Framework ready');
  }, []);
}