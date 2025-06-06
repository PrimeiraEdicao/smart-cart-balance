import { useState, useEffect } from 'react';

// Um hook genérico para persistir estado no localStorage
function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      // Se um valor estiver salvo, use-o. Senão, use o valor padrão.
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.error("Erro ao ler do localStorage", error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      // Sempre que o estado mudar, salve-o no localStorage.
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Erro ao escrever no localStorage", error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;