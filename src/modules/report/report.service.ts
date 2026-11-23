import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'src/entitets/entities/TimeOfWorke';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { Users } from 'src/entitets/entities/Users';
import { ReportDto } from './dto/report.dto';
import { generateRandomDocName } from 'src/misc/random.docname';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { ApiResponse } from 'src/misc/api.response.dto';
import { calendarDateKey, calendarRangeBounds, clippedOverlapMs } from 'src/utils/data.utils';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(TimeOfWorke) private readonly timeOfWorkRepository: Repository<TimeOfWorke>,
        @InjectRepository(Users) private readonly userRepository: Repository<Users>,    
        private readonly configServices: ConfigService
    ){}

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    async createPdfReport(report: ReportDto, adminId: number, role: Role): Promise<{message: string} | ApiResponse> {
        const anyUser = await this.userRepository.findOne({
            where: { userId: report.userId, visibility: 1 },
        });
        if (!anyUser) {
            return new ApiResponse("error", 404, "User not found");
        }
        const allowed =
            role === Role.SUPER_ADMIN || anyUser.managerId === adminId;
        if (!allowed) {
            return new ApiResponse("error", 403, "You are not authorized to generate a report for this user");
        }
        const getUser = anyUser;

        const startDate = calendarDateKey(report.startDate);
        const endDate = calendarDateKey(report.endDate);
        if (!startDate || !endDate) {
            return new ApiResponse("error", 400, "Invalid date format");
        }
        if (startDate > endDate) {
            return new ApiResponse("error", 400, "Start date must not be after end date");
        }

        const doc = new PDFDocument();
        const generateRandomDocumentsName = generateRandomDocName(getUser.userId, new Date().getMonth() + 1 + "-" + new Date().getFullYear(),1, 1000);
        const filrPathNameEnv = this.configServices.get<string>("SERVER_PDF_PATH");
        const baseDir = path.resolve(filrPathNameEnv ? filrPathNameEnv : "./exports/");
        const fileName = `${getUser.userId}-${generateRandomDocumentsName}.pdf`;
        const filePathServer = path.join(baseDir, fileName);
        
        const hostBaseDir = path.resolve(this.configServices.get<string>("HOST_MACHINE_PDF_PATH") || "./exports/");
        const filePathHostMacines = path.join(hostBaseDir, fileName);
        if (!fs.existsSync(filrPathNameEnv ? filrPathNameEnv : "./exports/")) {
            fs.mkdirSync(filrPathNameEnv ? filrPathNameEnv : "./exports/", { recursive: true });
        }

        const stream = fs.createWriteStream(filePathServer)

        doc.pipe(stream);

        doc.fontSize(20).text('Izveštaj', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Zaposleni: ${getUser.name} ${getUser.lastname}`);
        doc.text(`Za period: ${startDate} do ${endDate}`);

        doc.moveDown();
        doc.fontSize(14).text('Radni sati:', { underline: true });
        doc.moveDown();

        const workEntries = await this.timeOfWorkRepository.createQueryBuilder("time_of_worke")
            .where("time_of_worke.user_id = :userId", { userId: report.userId })
            .andWhere("time_of_worke.checked_in IS NOT NULL")
            .andWhere("time_of_worke.checked_out IS NOT NULL")
            .andWhere("DATE(time_of_worke.checked_in) <= :endDate", { endDate })
            .andWhere("time_of_worke.status = 0")
            .andWhere("DATE(time_of_worke.checked_out) >= :startDate", { startDate })
            .getMany();
        

        const { start: rangeStart, end: rangeEnd } = calendarRangeBounds(startDate, endDate);
        const totalHours = workEntries.reduce((sum, entry) => {
            if (entry.checked_in && entry.checked_out) {
                return sum + clippedOverlapMs(entry.checked_in, entry.checked_out, rangeStart, rangeEnd) / (1000 * 60 * 60);
            }
            return sum;
        }, 0);
        
        let counter = 1;
       
        if (workEntries.length === 0) {
            doc.text('Nema unetih radnih sati za ovaj period.');
        } else {
            workEntries.forEach(entry => {
                let hoursWorked = 0;
                if (entry.checked_in && entry.checked_out) {
                    hoursWorked = clippedOverlapMs(entry.checked_in, entry.checked_out, rangeStart, rangeEnd) / (1000 * 60 * 60);
                }
                const timeObjectCheckedIn = new Date(entry.checked_in);
                const timeObjectCheckedOut = new Date(entry.checked_out);

                doc.fontSize(10).text(`${ counter }. Datum: ${timeObjectCheckedIn.toISOString().split('T')[0]} - Pocetak: ${this.formatTime(timeObjectCheckedIn)} - Zavrsetak: ${this.formatTime(timeObjectCheckedOut)} - Sati: ${hoursWorked.toFixed(2)}`);
                counter++;
            });
        }
        
        doc.moveDown();
        doc.fontSize(12).text(`Ukupno radnih sati: ${totalHours.toFixed(2)}`);
        doc.moveDown();

        await new Promise<void>((resolve, reject) => {
            stream.on("finish", () => {
                fs.copyFile(filePathServer, filePathHostMacines, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
            stream.on("error", reject);
            doc.end();
        });

        return {message: "Uspešno kreiran izveštaj"};
    }
}
