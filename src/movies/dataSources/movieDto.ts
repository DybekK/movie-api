export class MovieDto {
  constructor(
    title: string,
    released: string,
    genre: string,
    director: string,
    userId?: number | null,
  ) {
    this.title = title;
    this.released = released;
    this.genre = genre;
    this.director = director;
    this.userId = userId;
  }

  userId?: number | null;

  readonly title: string;

  readonly released: string;

  readonly genre: string;

  readonly director: string;
}
