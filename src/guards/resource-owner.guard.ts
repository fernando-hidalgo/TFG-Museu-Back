import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {

    //Evita crearle listas o ratings a otros usuarios que no son el autenticado
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        return request.user.id == request.body.userId
    }

}