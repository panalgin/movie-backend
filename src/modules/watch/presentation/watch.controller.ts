import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '../../auth/domain/entities';
import { CurrentUser, Roles } from '../../auth/presentation/decorators';
import { JwtAuthGuard, RolesGuard } from '../../auth/presentation/guards';
import { WatchMovieCommand } from '../application/commands';
import { WatchMovieDto } from '../application/dto';
import { GetWatchHistoryQuery } from '../application/queries';

interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  age: number;
  role: UserRole;
}

@ApiTags('Watch')
@Controller('watch/v1')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WatchController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Watch a movie (Customer only)' })
  @ApiResponse({
    status: 201,
    description: 'Movie watched successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Invalid ticket' })
  async watchMovie(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: WatchMovieDto,
  ) {
    return this.commandBus.execute(
      new WatchMovieCommand(user.id, dto.ticketId),
    );
  }

  @Get('history')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get watch history (Customer only)' })
  @ApiResponse({
    status: 200,
    description: 'Watch history',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getWatchHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetWatchHistoryQuery(user.id));
  }
}
