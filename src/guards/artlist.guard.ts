import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ArtListService } from 'src/art-list/art-list.service';

@Injectable()
export class ArtlistGuard implements CanActivate {
  constructor(private ArtListService: ArtListService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authId = request.user.id;
  
    if (request.body.arlistsIds) {
      const promises = request.body.arlistsIds.map(async (e) => {
        const ownerId = await this.ArtListService.getListOwner(e);
        return ownerId === authId;
      });
  
      const results = await Promise.all(promises);
      return results.every(Boolean);
    }
  
    const listId = request.params.id;
    const ownerId = await this.ArtListService.getListOwner(listId);
    return authId === ownerId;
  }    
}