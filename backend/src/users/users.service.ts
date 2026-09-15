import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
    ){}

    async findAll(){
        return this.prisma.usuario.findMany({
            select: {
                id: true,
                nombre: true,
                correo: true,
                estado: true,
                creadoEn: true,
                rol: {
                    select: {
                        id: true,
                        nombre: true
                    }
                }
            }
        })
    }
    
}
