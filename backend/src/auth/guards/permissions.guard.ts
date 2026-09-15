import {
 Injectable,
 CanActivate,
 ExecutionContext,
 ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { PermissionsService } from '../../permissions/permissions.service.js';


@Injectable()
export class PermissionsGuard
implements CanActivate {


constructor(

 private readonly reflector: Reflector,

 private readonly permissionsService: PermissionsService,

){}



async canActivate(
 context: ExecutionContext
){


 const requiredPermissions =
 this.reflector.get<string[]>(
   'permissions',
   context.getHandler()
 );


 // Si la ruta no tiene permisos definidos
 // dejamos pasar

 if(!requiredPermissions){

   return true;

 }



 const request =
 context.switchToHttp()
 .getRequest();



 const user =
 request.user;



 const userPermissions =
 await this.permissionsService
 .getUserPermissions(user.id);



 const hasPermission =
 requiredPermissions.every(
   permission =>
   userPermissions.includes(permission)
 );


 if(!hasPermission){

   throw new ForbiddenException(
     'No tienes permisos suficientes'
   );

 }


 return true;


}


}