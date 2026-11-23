import { Body, Controller, Get, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { TimeofworkService } from './timeofwork.service';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { UserCheckedInDto } from './dtos/user.checkedin.dto';
import { UserCheckedOutDto } from './dtos/usercheckedout.dto';
import { GetHorseDto } from './dtos/get.horse.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { UdateTimeOfWorkUserDto } from './dtos/udate.timeofwork.user.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';
import { Request } from 'express';

@ApiTags('timeofwork')
@Controller('timeofwork')
export class TimeofworkController {
    constructor(private readonly timeOfVorkServices: TimeofworkService){}

    @ApiOperation({ summary: 'User check-in' })
    @ApiAuth("user","administrator","superadministrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("checkedin")
    @Roles("user","administrator","superadministrator")
    async userCheckedIn(@Req() req: Request): Promise<TimeOfWorke | ApiResponse>{
        const userId = req.user.id;
        return await this.timeOfVorkServices.userCheckedIn(userId);
    }

    @ApiOperation({ summary: 'User check-out' })
    @ApiAuth("user","administrator","superadministrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("checkedout")
    @Roles("user","administrator","superadministrator")
    async userCheckedOut(@Req() req: Request): Promise<TimeOfWorke | ApiResponse>{
        const userId = req.user.id;
        return await this.timeOfVorkServices.userCheckedOut(userId);
    }

    @ApiOperation({ summary: 'Get total worked hours of a user in a date range' })
    @ApiAuth("user","administrator","superadministrator")
    @ApiCreatedResponse({ schema: { type: 'object', properties: { getOfTime: { type: 'string' } } } })
    @Post("gethoursebyuser")
    @Roles("user","administrator","superadministrator")
    async getHourseByUserId(@Body() data: GetHorseDto, @Req() req: Request): Promise< { getOfTime: string } | ApiResponse>{
        const userId = req.user.id;
        const dtoInstance = new GetHorseDto();
        dtoInstance.startDate = data.startDate;
        dtoInstance.endDate = data.endDate;
        return await this.timeOfVorkServices.getTiemOfWorkByUserId(dtoInstance, userId);
    }

    @ApiOperation({ summary: 'Get time of work entry by id' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(TimeOfWorke)
    @Get("getinfotimeofwork/:id")
    @Roles("administrator", "superadministrator")
    async getInfoTimeOfWork(@Param("id", ParseIntPipe) id: number, @Req() req: Request): Promise<TimeOfWorke | ApiResponse>{
        return await this.timeOfVorkServices.getInfoTimeOfWork(id, req.user.id, req.user.role);
    }

    @ApiOperation({ summary: "Update user's time of work entry" })
    @ApiAuth("administrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("updateusertimeofwork")
    @Roles("administrator")
    async updateUserTimeOfWork(@Body() data: UdateTimeOfWorkUserDto, @Req() req: Request): Promise<TimeOfWorke | ApiResponse | null>{
        const userId = req.user.id;
        return await this.timeOfVorkServices.updateUserTimeOfWork(data, userId);
    }
}
