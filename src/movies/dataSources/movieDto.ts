import { MaxLength, IsNotEmpty, IsString, IsNumber } from 'class-validator';

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

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly title: string;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly released: string;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly genre: string;

  @IsString()
  @MaxLength(255)
  @IsNotEmpty()
  readonly director: string;
}
