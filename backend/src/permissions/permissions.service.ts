import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class PermissionsService {


constructor(
 private readonly prisma: PrismaService,
){}



async getUserPermissions(
 userId:number
){


 const usuario =
 await this.prisma.usuario.findUnique({

  where:{
    id:userId
  },

  include:{
    rol:{
      include:{
        permisos:{
          include:{
            permiso:true
          }
        }
      }
    }
  }

 });



 return usuario?.rol.permisos.map(
   item => item.permiso.nombre
 ) ?? [];


}


}