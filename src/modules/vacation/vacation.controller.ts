import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { AddVacationsDto } from './dtos/add.vacations.dto';
import { Vacations } from 'entitets/entities/Vacations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';

@Controller('vacation')
export class VacationController {
    constructor(private readonly vacationsServices: VacationService){}

    @Get("allvacations")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllVacations(): Promise<Vacations[] | ApiResponse>{
        return await this.vacationsServices.findAll();
    }

    @Get("vacationbyid/:id")
    @Roles("user", "administrator", "superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getVacationById(@Param("id") id: number): Promise<Vacations | ApiResponse>{
        return await this.vacationsServices.findById(id);
    }

    @Post("addvacations")
    @Roles("user", "administrator", "superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async addVacations(@Body() vacations: AddVacationsDto): Promise<Vacations | ApiResponse>{
        return await this.vacationsServices.addVactions(vacations);
    }
}
