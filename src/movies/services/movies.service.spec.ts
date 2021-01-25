import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { MoviesApiClient } from '../dataSources/moviesApi.client';
import { MoviesRepository } from '../dataSources/mongo/movies.repository';
import { UserRole } from '../auth/userContext';
import { MovieDto } from '../dataSources/movieDto';
import { Movie } from '../dataSources/mongo/movie.schema';
import { HttpModule, HttpService } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ExceededLimitException } from '../exceptions/ExceededLimitException';

const mockRepository = {
  create() {
    return {};
  },
};

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let moviesApiClient: MoviesApiClient;
  let moviesRepository: MoviesRepository;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        MoviesApiClient,
        MoviesRepository,
        { provide: getModelToken('Movie'), useValue: mockRepository },
      ],
      imports: [HttpModule],
    }).compile();

    moviesService = await module.resolve<MoviesService>(MoviesService);
    moviesApiClient = module.get<MoviesApiClient>(MoviesApiClient);
    moviesRepository = module.get<MoviesRepository>(MoviesRepository);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
  });

  describe('create', () => {
    it('should create movie for premium user', async () => {
      // given
      const title = 'newMovie';
      const released = 'N/A';
      const genre = 'horror';
      const director = 'Jacek';
      const userId = 123;

      const countedUserMovies = 6;

      const clientResult = new MovieDto(
        title,
        released,
        genre,
        director,
        userId,
      );

      jest
        .spyOn(moviesApiClient, 'fetchMovies')
        .mockResolvedValue(clientResult);

      jest
        .spyOn(moviesRepository, 'countUserMoviesInMonth')
        .mockResolvedValue(countedUserMovies);

      jest
        .spyOn(moviesRepository, 'create')
        .mockResolvedValue(<Movie>clientResult);

      // when
      const movie = await moviesService.create(title, userId, UserRole.PREMIUM);
      // then
      expect(movie.userId).toBe(userId);
      expect(movie.title).toBe(title);
      expect(movie.released).toBe(released);
      expect(movie.genre).toBe(genre);
      expect(movie.director).toBe(director);
    });

    it('should create movie for basic user when he has not exceeded the limit', async () => {
      // given
      const title = 'newMovie';
      const released = 'N/A';
      const genre = 'horror';
      const director = 'Jacek';
      const userId = 123;

      const countedUserMovies = 4;

      const clientResult = new MovieDto(
        title,
        released,
        genre,
        director,
        userId,
      );

      jest
        .spyOn(moviesApiClient, 'fetchMovies')
        .mockResolvedValue(clientResult);

      jest
        .spyOn(moviesRepository, 'countUserMoviesInMonth')
        .mockResolvedValue(countedUserMovies);

      jest
        .spyOn(moviesRepository, 'create')
        .mockResolvedValue(<Movie>clientResult);

      // when
      const movie = await moviesService.create(title, userId, UserRole.PREMIUM);
      // then
      expect(movie.userId).toBe(userId);
      expect(movie.title).toBe(title);
      expect(movie.released).toBe(released);
      expect(movie.genre).toBe(genre);
      expect(movie.director).toBe(director);
    });

    it('should not create movie for basic user when he has exceeded the limit', () => {
      // given
      const title = 'newMovie';
      const released = 'N/A';
      const genre = 'horror';
      const director = 'Jacek';
      const userId = 123;

      const countedUserMovies = 6;

      const clientResult = new MovieDto(
        title,
        released,
        genre,
        director,
        userId,
      );

      jest
        .spyOn(moviesApiClient, 'fetchMovies')
        .mockResolvedValue(clientResult);

      jest
        .spyOn(moviesRepository, 'countUserMoviesInMonth')
        .mockResolvedValue(countedUserMovies);

      jest
        .spyOn(moviesRepository, 'create')
        .mockResolvedValue(<Movie>clientResult);

      expect(
        () =>
          // when
          moviesService.create(title, userId, UserRole.BASIC),
        // then
      ).rejects.toThrow(ExceededLimitException);
    });
  });

  describe('getMoviesByUser', () => {
    it('should fetch movies by user', async () => {
      // given
      const userId = 123;
      const expectedResult = <Movie[]>[
        {
          title: 'newMovie',
          released: 'N/A',
          genre: 'horror',
          director: 'Jacek',
          userId,
        },
      ];

      jest
        .spyOn(moviesRepository, 'findMoviesByUser')
        .mockResolvedValue(expectedResult);

      // when
      const movies = await moviesService.getMoviesByUser(userId);

      // then
      expect(movies.length).toBe(1);
      expect(movies[0].userId).toBe(userId);
      expect(movies[0].title).toBe(expectedResult[0].title);
      expect(movies[0].released).toBe(expectedResult[0].released);
      expect(movies[0].genre).toBe(expectedResult[0].genre);
      expect(movies[0].director).toBe(expectedResult[0].director);
    });
  });
});
