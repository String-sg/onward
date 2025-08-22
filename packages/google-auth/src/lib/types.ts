export interface Session {
  id: string;
  csrfToken(): string;
}
