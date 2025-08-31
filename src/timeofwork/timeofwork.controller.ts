import { Body, Controller, Post } from '@nestjs/common';
import { TimeofworkService } from './timeofwork.service';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AddWorksDto } from './dtos/add.works.dto';
import { UserCheckedInDto } from './dtos/user.checkedin.dto';
import { UserCheckedOutDto } from './dtos/usercheckedout.dto';
import { GetHorseDto } from './dtos/get.horse.dto';

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
}