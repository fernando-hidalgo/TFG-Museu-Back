import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { RatingService } from 'src/rating/rating.service';

@Injectable()
export class RatingGuard implements CanActivate {
  constructor(private RatingService: RatingService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()

        const authId = request.user.id;
        const ratingId = request.params.id;

        const ownerId = (await this.RatingService.findById(ratingId)).user.id;
        return authId == ownerId;
    }
}