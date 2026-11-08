import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TimeofworkService } from './timeofwork.service';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { UserCheckedInDto } from './dtos/user.checkedin.dto';
import { UserCheckedOutDto } from './dtos/usercheckedout.dto';
import { GetHorseDto } from './dtos/get.horse.dto';
import { Roles } from 'src/common/decorators/role.decorator';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { UdateTimeOfWorkUserDto } from './dtos/udate.timeofwork.user.dto';
import { JwtAuthGuards } from 'src/modules/auth/jwtAuthGuards';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth, ApiResult } from 'src/common/decorators/swagger.decorator';

@ApiTags('timeofwork')
@Controller('timeofwork')
export class TimeofworkController {
    constructor(private readonly timeOfVorkServices: TimeofworkService){}

    @ApiOperation({ summary: 'User check-in' })
    @ApiAuth("user","administrator","superadministrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("checkedin")
    @Roles("user","administrator","superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async userCheckedIn(@Body() data: UserCheckedInDto): Promise<TimeOfWorke | ApiResponse>{
        return await this.timeOfVorkServices.userCheckedIn(data);
    }

    @ApiOperation({ summary: 'User check-out' })
    @ApiAuth("user","administrator","superadministrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("checkedout")
    @Roles("user","administrator","superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async userCheckedOut(@Body() data: UserCheckedOutDto): Promise<TimeOfWorke | ApiResponse>{
        return await this.timeOfVorkServices.userCheckedOut(data);
    }

    @ApiOperation({ summary: 'Get total worked hours of a user in a date range' })
    @ApiAuth("user","administrator","superadministrator")
    @ApiCreatedResponse({ schema: { type: 'object', properties: { getOfTime: { type: 'string' } } } })
    @Post("gethoursebyuser")
    @Roles("user","administrator","superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getGourseByUserId(@Body() data: GetHorseDto): Promise< { getOfTime: string } | ApiResponse>{
        return await this.timeOfVorkServices.getTiemOfWorkByUserId(data);
    }

    @ApiOperation({ summary: 'Get time of work entry by id' })
    @ApiAuth("administrator", "superadministrator")
    @ApiResult(TimeOfWorke)
    @Get("getinfotimeofwork/:id")
    @Roles("administrator", "superadministrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async getInfoTimeOfWork(@Param("id") id: number){
        return await this.timeOfVorkServices.getInfoTimeOfWork(id);
    }

    @ApiOperation({ summary: "Update user's time of work entry" })
    @ApiAuth("administrator")
    @ApiResult(TimeOfWorke, { status: 201 })
    @Post("updateusertimeofwork")
    @Roles("administrator")
    @UseGuards(JwtAuthGuards,RoleGuards)
    async updateUserTimeOfWork(@Body() data: UdateTimeOfWorkUserDto): Promise<TimeOfWorke | ApiResponse | null>{
        return await this.timeOfVorkServices.updateUserTimeOfWork(data);
    }
}
