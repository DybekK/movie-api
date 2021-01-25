export class MovieNotFoundException extends Error {
  constructor(message?: string) {
    super();
    this.message = message;
    this.name = 'MovieNotFoundException';
  }
}
