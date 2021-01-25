import { Injectable } from '@nestjs/common';
import { Movie } from '../dataSources/mongo/movie.schema';
import { MoviesApiClient } from '../dataSources/moviesApi.client';
import { MoviesRepository } from '../dataSources/mongo/movies.repository';
import { UserRole } from '../auth/userContext';
import { ExceededLimitException } from '../exceptions/ExceededLimitException';

@Injectable()
export class MoviesService {
  constructor(
    private readonly moviesRepository: MoviesRepository,
    private readonly moviesApiClient: MoviesApiClient,
  ) {}

  async create(title: string, userId: number, role: UserRole): Promise<Movie> {
    const data = await this.moviesApiClient.fetchMovies(title);

    if (role !== UserRole.PREMIUM) {
      const count = await this.moviesRepository.countUserMoviesInMonth(userId);
      if (count >= 5) {
        throw new ExceededLimitException(
          'limit of added movies on the basic account has been exceeded',
        );
      }
    }
    return await this.moviesRepository.create(userId, data);
  }

  async getMoviesByUser(userId: number): Promise<Movie[]> {
    return await this.moviesRepository.findMoviesByUser(userId);
  }
}
