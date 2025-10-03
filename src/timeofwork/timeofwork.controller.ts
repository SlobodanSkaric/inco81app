import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TimeofworkService } from './timeofwork.service';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { UserCheckedInDto } from './dtos/user.checkedin.dto';
import { UserCheckedOutDto } from './dtos/usercheckedout.dto';
import { GetHorseDto } from './dtos/get.horse.dto';
import { Roles } from 'src/common/decorators/role.decorators';
import { RoleGuards } from 'src/common/guards/roles.guards';
import { UdateTimeOfWorkUserDto } from './dtos/udate.timeofwork.user.dto';

@Controller('timeofwork')
export class TimeofworkController {
    constructor(private readonly timeOfVorkServices: TimeofworkService){}

    @Post("checkedin")
    async userCheckedIn(@Body() data: UserCheckedInDto): Promise<TimeOfWorke | ApiResponse>{
        return await this.timeOfVorkServices.userCheckedIn(data);
    }

    @Post("checkedout")
    async userCheckedOut(@Body() data: UserCheckedOutDto): Promise<TimeOfWorke | ApiResponse>{
        return await this.timeOfVorkServices.userCheckedOut(data);
    }

    @Post("gethoursebyuser")
    async getGourseByUserId(@Body() data: GetHorseDto): Promise< { getOfTime: string } | ApiResponse>{
        return await this.timeOfVorkServices.getTiemOfWorkByUserId(data);
    }

    @Get("getinfotimeofwork/{:id}")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async getInfoTimeOfWork(@Param("id") id: number){
        return await this.timeOfVorkServices.getInfoTimeOfWork(id);
    }

    @Post("updateusertimeofwork")
    @Roles("administrator")
    @UseGuards(RoleGuards)
    async updateUserTimeOfWork(@Body() data: UdateTimeOfWorkUserDto): Promise<TimeOfWorke | ApiResponse | null>{
        return await this.timeOfVorkServices.updateUserTimeOfWork(data);
    }
}
