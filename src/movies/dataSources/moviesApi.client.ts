import { HttpService, Injectable } from '@nestjs/common';
import lowercaseKeys from 'lowercase-keys';
import { MovieDto } from './movieDto';
import { FetchedMovie } from './mongo/fetchedMovie';
import { MovieNotFoundException } from '../exceptions/MovieNotFoundException';

@Injectable()
export class MoviesApiClient {
  constructor(private readonly httpService: HttpService) {}

  async fetchMovies(title: string): Promise<MovieDto> {
    const { data } = await this.httpService
      .get<FetchedMovie>(
        `http://${process.env.MOVIES_API_URL}/?apikey=${process.env.OMDb_API_KEY}&t=${title}`,
      )
      .toPromise();

    if (data.Response === 'False') {
      throw new MovieNotFoundException(data.Error);
    }

    delete data.Response;
    return <MovieDto>(<unknown>lowercaseKeys(<any>data));
  }
}
