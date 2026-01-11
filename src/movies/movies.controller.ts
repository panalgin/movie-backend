import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Role } from '@prisma/client';
import { Public, Roles } from '../auth/decorators';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import {
  CreateMovieCommand,
  DeleteMovieCommand,
  UpdateMovieCommand,
} from './commands';
import { CreateMovieDto, UpdateMovieDto } from './dto';
import { GetMovieByIdQuery, GetMoviesQuery } from './queries';

@Controller('movies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MoviesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
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
  @Public()
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.queryBus.execute(
      new GetMoviesQuery(
        skip ? Number.parseInt(skip, 10) : undefined,
        take ? Number.parseInt(take, 10) : undefined,
      ),
    );
  }

  @Get(':id')
  @Public()
  async findOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetMovieByIdQuery(id));
  }

  @Put(':id')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteMovieCommand(id));
  }
}
