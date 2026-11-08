import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { AddVacationsDto } from './dto/add.vacations.dto';
import { Vacations } from 'src/entitets/entities/Vacations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

@ApiTags('vacation')
@Controller('vacation')
export class VacationController {
    constructor(private readonly vacationsServices: VacationService){}

    @ApiOperation({ summary: 'Get all vacations' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(Vacations, { isArray: true })
    @Get("allvacations")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards, RoleGuards)
    async getAllVacations(): Promise<Vacations[] | ApiResponse>{
        return await this.vacationsServices.findAll();
    }

    @ApiOperation({ summary: 'Get vacation by id' })
    @ApiAuth("user", "administrator", "superadministrator")
    @ApiResult(Vacations)
    @Get("vacationbyid/:id")
    @Roles("user", "administrator", "superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getVacationById(@Param("id") id: number): Promise<Vacations | ApiResponse>{
        return await this.vacationsServices.findById(id);
    }

    @ApiOperation({ summary: 'Request a vacation' })
    @ApiAuth("user", "administrator", "superadministrator")
    @ApiResult(Vacations, { status: 201 })
    @Post("addvacations")
    @Roles("user", "administrator", "superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async addVacations(@Body() vacations: AddVacationsDto): Promise<Vacations | ApiResponse>{
        return await this.vacationsServices.addVactions(vacations);
    }
}
