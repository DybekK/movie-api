import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { MoviesService } from '../services/movies.service';
import { Payload } from './payload';
import { exceptionHandler } from './exceptionHandler';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  async getAllMovies(@Req() { userContext }: Request | any) {
    return await this.moviesService.getMoviesByUser(userContext.userId);
  }

  @Post()
  async addMovie(
    @Req() { userContext }: Request | any,
    @Body() { title }: Payload,
    @Res() response,
  ) {
    try {
      const movie = await this.moviesService.create(
        title,
        userContext.userId,
        userContext.role,
      );
      return response.status(HttpStatus.OK).json({
        message: 'movie has been created successfully',
        data: movie,
      });
    } catch (err) {
      return exceptionHandler(err, response);
    }
  }
}
