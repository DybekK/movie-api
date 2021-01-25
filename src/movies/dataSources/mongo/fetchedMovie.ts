export interface FetchedMovie {
  Response: 'True' | 'False';
  Error?: string;
  Title?: string;
  Released?: string;
  Genre?: string;
  Director?: string;
}
