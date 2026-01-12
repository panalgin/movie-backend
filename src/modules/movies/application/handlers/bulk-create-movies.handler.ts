import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { BulkCreateMoviesCommand } from '../commands';

@CommandHandler(BulkCreateMoviesCommand)
export class BulkCreateMoviesHandler
  implements ICommandHandler<BulkCreateMoviesCommand>
{
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: BulkCreateMoviesCommand): Promise<Movie[]> {
    const movies = command.movies.map((dto) =>
      Movie.create({
        title: dto.title,
        description: dto.description,
        ageRestriction: dto.ageRestriction,
      }),
    );

    const saved = await this.movieRepository.saveMany(movies);

    await this.auditService.logSuccess(
      {
        action: AuditAction.MOVIE_BULK_CREATE,
        entityType: AuditEntityType.MOVIE,
        metadata: {
          count: saved.length,
          movieIds: saved.map((m) => m.id),
        },
      },
      {
        actorId: command.actorId,
        actorRole: command.actorRole,
      },
    );

    return saved;
  }
}
