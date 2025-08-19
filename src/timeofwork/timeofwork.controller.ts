import { Controller, Get } from '@nestjs/common';

@Controller('timeofwork')
export class TimeofworkController {

    //Cheched role. Role must be administrator
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(Role.Administrator)
    // @Get()
    // Add curent time of work, simulation checked card

    @Get("current")
    addCurrentTimeOfWork() {}
}
