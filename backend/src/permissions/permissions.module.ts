import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';


@Module({

imports:[
 PrismaModule
],

providers:[
 PermissionsService
],

exports:[
 PermissionsService
]

})
export class PermissionsModule {}