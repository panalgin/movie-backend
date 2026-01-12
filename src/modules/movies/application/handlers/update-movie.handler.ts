import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { UpdateMovieCommand } from '../commands';

@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler implements ICommandHandler<UpdateMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: UpdateMovieCommand): Promise<Movie> {
    const movie = await this.movieRepository.findById(command.id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${command.id} not found`);
    }

    const before = {
      title: movie.title,
      description: movie.description,
      ageRestriction: movie.ageRestriction,
    };

    const updatedMovie = movie.update({
      title: command.title,
      description: command.description,
      ageRestriction: command.ageRestriction,
    });

    const saved = await this.movieRepository.update(updatedMovie);

    await this.auditService.logSuccess(
      {
        action: AuditAction.MOVIE_UPDATE,
        entityType: AuditEntityType.MOVIE,
        entityId: saved.id,
        changes: {
          before,
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
