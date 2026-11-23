import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { VacationService } from './vacation.service';
import { AddVacationsDto } from './dto/add.vacations.dto';
import { Vacations } from 'src/entitets/entities/Vacations';
import { ApiResponse } from 'src/misc/api.response.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { Request } from 'express';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('vacation')
@Controller('vacation')
export class VacationController {
    constructor(private readonly vacationsServices: VacationService){}

    @ApiOperation({ summary: 'Get vacations for managed employees (all for superadministrator)' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(Vacations, { isArray: true })
    @Get("allvacations")
    @Roles("administrator", "superadministrator")
    async getAllVacations(@Req() req: Request): Promise<Vacations[] | ApiResponse>{
        if (req.user.role === Role.SUPER_ADMIN) {
            return await this.vacationsServices.findAll();
        }
        return await this.vacationsServices.findAllForManager(req.user.id);
    }

    @ApiOperation({ summary: 'Get logged-in user vacations' })
    @ApiAuth("user")
    @ApiResult(Vacations, { isArray: true })
    @Get("myvacations")
    @Roles("user")
    async getMyVacations(@Req() req: Request): Promise<Vacations[] | ApiResponse>{
        return await this.vacationsServices.findAllForUser(req.user.id);
    }

    @ApiOperation({ summary: 'Get vacation by id' })
    @ApiAuth("user")
    @ApiResult(Vacations)
    @Get("vacationbyid/:id")
    @Roles("user")
    async getVacationByIdForUser(@Param("id", ParseIntPipe) id: number, @Req() req: Request): Promise<Vacations | ApiResponse>{
        return await this.vacationsServices.findById(id, req.user.id);
    }

    @ApiOperation({ summary: 'Request a vacation (employees with an assigned manager only)' })
    @ApiAuth("user")
    @ApiResult(Vacations, { status: 201 })
    @Post("addvacations")
    @Roles("user")
    async addVacations(@Body() vacations: AddVacationsDto, @Req() req: Request): Promise<Vacations | ApiResponse>{
        return await this.vacationsServices.addVactions(vacations, req.user.id);
    }
}
