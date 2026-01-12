import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { CreateMovieCommand } from '../commands';

@CommandHandler(CreateMovieCommand)
export class CreateMovieHandler implements ICommandHandler<CreateMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: CreateMovieCommand): Promise<Movie> {
    const movie = Movie.create({
      title: command.title,
      description: command.description,
      ageRestriction: command.ageRestriction,
    });

    const saved = await this.movieRepository.save(movie);

    await this.auditService.logSuccess(
      {
        action: AuditAction.MOVIE_CREATE,
        entityType: AuditEntityType.MOVIE,
        entityId: saved.id,
        changes: {
          after: {
            title: saved.title,
            description: saved.description,
            ageRestriction: saved.ageRestriction,
          },
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
