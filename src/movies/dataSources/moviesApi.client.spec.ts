import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { MovieNotFoundException } from '../exceptions/MovieNotFoundException';
import { MoviesApiClient } from './moviesApi.client';
import { HttpModule, HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MovieDto } from './movieDto';

describe('MoviesApiClient', () => {
  let moviesApiClient: MoviesApiClient;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MoviesApiClient],
      imports: [HttpModule],
    }).compile();

    moviesApiClient = module.get<MoviesApiClient>(MoviesApiClient);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(moviesApiClient).toBeDefined();
  });

  it('should throw exception if movie was not found', () => {
    // given
    const title = 'newMovie';

    const mockedResponse: AxiosResponse = {
      data: {
        Response: 'False',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(mockedResponse));

    expect(
      () =>
        // when
        moviesApiClient.fetchMovies(title),
      // then
    ).rejects.toThrow(MovieNotFoundException);
  });

  it('should return movieDto if movie was found', async () => {
    // given
    const title = 'newMovie';

    const movieData = {
      Title: 'Spiderman',
      Released: 'N/A',
      Genre: 'Short',
      Director: 'Christian Davi',
    };

    const mockedResponse: AxiosResponse = {
      data: {
        Response: 'True',
        ...movieData,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    };

    jest
      .spyOn(httpService, 'get')
      .mockImplementationOnce(() => of(mockedResponse));

    // when
    const movieDto = await moviesApiClient.fetchMovies(title);
    // then
    const expectedMovieDto = new MovieDto(
      movieData.Title,
      movieData.Released,
      movieData.Genre,
      movieData.Director,
    );
    expect(movieDto.title).toBe(expectedMovieDto.title);
  });
});
