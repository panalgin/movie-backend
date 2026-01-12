import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { BulkDeleteMoviesCommand } from '../commands';

@CommandHandler(BulkDeleteMoviesCommand)
export class BulkDeleteMoviesHandler
  implements ICommandHandler<BulkDeleteMoviesCommand>
{
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(
    command: BulkDeleteMoviesCommand,
  ): Promise<{ deleted: number }> {
    await this.movieRepository.deleteMany(command.ids);

    await this.auditService.logSuccess(
      {
        action: AuditAction.MOVIE_BULK_DELETE,
        entityType: AuditEntityType.MOVIE,
        metadata: {
          count: command.ids.length,
          movieIds: command.ids,
        },
      },
      {
        actorId: command.actorId,
        actorRole: command.actorRole,
      },
    );

    return { deleted: command.ids.length };
  }
}
