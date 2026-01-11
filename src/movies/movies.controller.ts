import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreateMovieCommand,
  DeleteMovieCommand,
  UpdateMovieCommand,
} from './commands';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { GetMovieByIdQuery, GetMoviesQuery } from './queries';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async create(@Body() dto: CreateMovieDto) {
    return this.commandBus.execute(
      new CreateMovieCommand(
        dto.title,
        dto.description,
        dto.releaseYear,
        dto.rating,
      ),
    );
  }

  @Get()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.queryBus.execute(
      new GetMoviesQuery(
        skip ? parseInt(skip, 10) : undefined,
        take ? parseInt(take, 10) : undefined,
      ),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMovieByIdQuery(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
    return this.commandBus.execute(
      new UpdateMovieCommand(
        id,
        dto.title,
        dto.description,
        dto.releaseYear,
        dto.rating,
      ),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteMovieCommand(id));
  }
}
