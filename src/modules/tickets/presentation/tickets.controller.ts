import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '../../auth/domain/entities';
import { CurrentUser, Roles } from '../../auth/presentation/decorators';
import { JwtAuthGuard, RolesGuard } from '../../auth/presentation/guards';
import { BuyTicketCommand } from '../application/commands';
import { BuyTicketDto } from '../application/dto';
import { GetMyTicketsQuery, GetTicketByIdQuery } from '../application/queries';

interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  age: number;
  role: UserRole;
}

@ApiTags('Tickets')
@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('v1')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy tickets (Customer only)' })
  @ApiResponse({
    status: 201,
    description: 'Tickets purchased successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({
    description: 'Forbidden - Customer only or age restriction',
  })
  async buyTickets(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BuyTicketDto,
  ) {
    return this.commandBus.execute(
      new BuyTicketCommand(
        user.id,
        dto.sessionId,
        dto.quantity ?? 1,
        user.role,
      ),
    );
  }

  @Get('my/v1')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my tickets (Customer only)' })
  @ApiResponse({
    status: 200,
    description: 'List of user tickets',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getMyTickets(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetMyTicketsQuery(user.id));
  }

  @Get(':id/v1')
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a ticket by ID (Customer only)' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Ticket does not belong to user' })
  async getTicket(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.queryBus.execute(new GetTicketByIdQuery(id, user.id));
  }
}
