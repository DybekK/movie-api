import { Test } from '@nestjs/testing';
import { HttpModule, HttpService, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { sign } from 'jsonwebtoken';
import {
  Movie,
  MovieSchema,
} from '../src/movies/dataSources/mongo/movie.schema';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { MovieDto } from '../src/movies/dataSources/movieDto';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../src/MongooseTestModule';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesRepository } from '../src/movies/dataSources/mongo/movies.repository';
import { Model } from 'mongoose';
import { MoviesModule } from '../src/movies/movies.module';
import { randomNumber } from '../src/helpers/randomNumber';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;

  let httpService: HttpService;
  let movieModel: Model<Movie>;

  let data;
  let response: AxiosResponse<any>;

  afterEach(() => {
    movieModel.deleteMany({});
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MoviesModule,
        HttpModule,
        rootMongooseTestModule(),
        MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
      ],
      providers: [MoviesRepository],
    }).compile();

    app = module.createNestApplication();
    httpService = module.get<HttpService>(HttpService);
    movieModel = module.get<Model<Movie>>('MovieModel');

    await app.init();
  });

  beforeEach(() => {
    data = {
      Title: 'Spiderman',
      Released: 'N/A',
      Genre: 'Short',
      Directory: 'Christian Davi',
    };

    response = {
      data,
      headers: {},
      config: {
        url: `http://${process.env.MOVIES_API_URL}/?apikey=${process.env.OMDb_API_KEY}&t=spiderman`,
      },
      status: 200,
      statusText: 'OK',
    };

    jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(response));
  });

  describe('Auth', () => {
    it('should return 403 when user is not authorized', () => {
      // when
      return (
        request(app.getHttpServer())
          .get('/movies')
          // then
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toBe('jwt must be provided');
          })
      );
    });

    it('should return 403 when token has expired', () => {
      //given
      const userId = randomNumber();

      const jwt = sign(
        {
          userId: randomNumber(),
          name: 'random',
          role: 'basic',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 0,
        },
      );

      // when
      return (
        request(app.getHttpServer())
          .get('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toBe('jwt expired');
          })
      );
    });

    it('should return 403 when user role is not supported', () => {
      // given
      const userId = randomNumber();

      const jwt = sign(
        {
          userId: randomNumber(),
          name: 'random',
          role: 'notSupportedRole',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );

      // when
      return (
        request(app.getHttpServer())
          .get('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(403)
          .expect((res) => {
            expect(res.body.message).toBe('role is not supported');
          })
      );
    });
  });

  describe('Get movies', () => {
    it('should return 200 when user has no movies', () => {
      // given
      const userId = randomNumber();
      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'basic',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );
      // when
      return (
        request(app.getHttpServer())
          .get('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(200)
          .expect([])
      );
    });

    it('should return 200 when user has movies', async () => {
      // given
      const userId = randomNumber();

      const movieDto = new MovieDto(
        data.Title,
        data.Released,
        data.Genre,
        data.Directory,
        userId,
      );

      const movie = await movieModel.create(movieDto);
      await movie.save();

      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'basic',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );
      // when
      return (
        request(app.getHttpServer())
          .get('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(200)
          .expect((res) => {
            expect(res.body[0]._id).toBe(movie.id);
          })
      );
    });
  });

  describe('Post movies', () => {
    it('should return 200 when premium user creates movie', () => {
      // given
      const userId = randomNumber();
      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'premium',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );
      // when
      return (
        request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBe(
              'movie has been created successfully',
            );
          })
      );
    });

    it('should return 200 when premium user creates more than 5 movies in month', async () => {
      // given
      const userId = randomNumber();
      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'premium',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );

      const movieDto = new MovieDto(
        data.Title,
        data.Released,
        data.Genre,
        data.Directory,
        userId,
      );

      for (let i = 0; i < 5; i++) {
        const movie = await movieModel.create(movieDto);
        await movie.save();
      }

      // when
      return (
        request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBe(
              'movie has been created successfully',
            );
          })
      );
    });

    it('should return 200 when basic user creates a movie', async () => {
      // given
      const userId = randomNumber();

      const movieDto = new MovieDto(
        data.Title,
        data.Released,
        data.Genre,
        data.Directory,
        userId,
      );

      const movie = await movieModel.create(movieDto);
      await movie.save();

      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'basic',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );
      // when
      return (
        request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(200)
          .expect((res) => {
            expect(res.body.message).toBe(
              'movie has been created successfully',
            );
          })
      );
    });

    it('should return 422 when basic user creates a movie with exceeded limit', async () => {
      // given
      const userId = randomNumber();

      const movieDto = new MovieDto(
        data.Title,
        data.Released,
        data.Genre,
        data.Directory,
        userId,
      );

      for (let i = 0; i < 5; i++) {
        const movie = await movieModel.create(movieDto);
        await movie.save();
      }

      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'basic',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );

      // when
      return (
        request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(422)
          .expect((res) => {
            expect(res.body.message).toBe(
              'limit of added movies on the basic account has been exceeded',
            );
          })
      );
    });

    it('should return 400 when movie was not found', () => {
      // given
      const userId = randomNumber();

      data = {
        Response: 'False',
      };

      response = {
        data,
        headers: {},
        config: {
          url: `http://${process.env.MOVIES_API_URL}/?apikey=${process.env.OMDb_API_KEY}&t=spiderman`,
        },
        status: 200,
        statusText: 'OK',
      };

      const jwt = sign(
        {
          userId,
          name: 'random',
          role: 'basic',
        },
        process.env.JWT_SECRET,
        {
          issuer: 'https://www.netguru.com/',
          subject: `${userId}`,
          expiresIn: 30 * 60,
        },
      );

      jest.spyOn(httpService, 'get').mockImplementationOnce(() => of(response));
      // when
      return (
        request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', 'Bearer ' + jwt)
          // then
          .expect(400)
      );
    });
  });
});
