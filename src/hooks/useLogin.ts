import { useMutation } from '@tanstack/react-query';
import { login } from '../clients/authClient';

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}
