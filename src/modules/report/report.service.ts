import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeOfWorke } from 'entitets/entities/TimeOfWorke';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as PDFDocument from 'pdfkit';
import { Users } from 'entitets/entities/Users';
import { ReportDto } from './dto/report.dto';
import { generateRandomDocName } from 'src/misc/random.docname';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(TimeOfWorke) private readonly timeOfWorkRepository: Repository<TimeOfWorke>,
        @InjectRepository(Users) private readonly userRepository: Repository<Users>,    
        private readonly configServices: ConfigService
    ){}

    async createPdfReport(report: ReportDto): Promise<string | {message: string}> {
        const getUser = await this.userRepository.findOneBy({userId: report.userId});

        if(!getUser){
            return {message: "Korisnik nije pronađen"}
        }

        const doc = new PDFDocument();
        const filePathServer = this.configServices.get<string>("SERVER_PDF_PATH")+ getUser.name + "-"+getUser.lastname + "-" + generateRandomDocName(getUser.userId,new Date().getMonth() + "-" + new Date().getFullYear(),1, 1000) + ".pdf";
        const filePathHostMacines = this.configServices.get<string>("HOST_MACHINE_PDF_PATH")+ getUser.name+"-"+getUser.lastname + "-" + generateRandomDocName(getUser.userId,new Date().getMonth() + "-" + new Date().getFullYear(),1, 1000) + ".pdf";
        if (!fs.existsSync('./exports')) {
            fs.mkdirSync('./exports');
        }

        doc.pipe(fs.createWriteStream(filePathServer));
        doc.pipe(fs.createWriteStream(filePathHostMacines));

        doc.fontSize(20).text('Izveštaj', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Zaposleni: ${getUser.name} ${getUser.lastname}`);
        doc.text(`Za period: ${report.startDate} do ${report.endDate}`);

        doc.moveDown();
        doc.fontSize(14).text('Radni sati:', { underline: true });
        doc.moveDown();

        const workEntries = await this.timeOfWorkRepository.createQueryBuilder("time_of_worke")
            .where("time_of_worke.user_id = :userId", { userId: report.userId })
            .andWhere("time_of_worke.checked_in >= :startDate", { startDate: report.startDate })
            .andWhere("time_of_worke.checked_out <= :endDate", { endDate: report.endDate })
            .getMany();
        

        const totalHours = workEntries.reduce((sum, entry) => {
            if (entry.checked_in && entry.checked_out) {
                const hours = (entry.checked_out.getTime() - entry.checked_in.getTime()) / (1000 * 60 * 60);
                return sum + hours;
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
                    hoursWorked = (entry.checked_out.getTime() - entry.checked_in.getTime()) / (1000 * 60 * 60);
                }
                const timeObjectCheckedIn = new Date(entry.checked_in);
                const timeObjectCheckedOut = new Date(entry.checked_out);

                const chedenInHourse = timeObjectCheckedIn.getHours();
                const chedenInMinutes = timeObjectCheckedIn.getMinutes();
                const chedenOutHourse = timeObjectCheckedOut.getHours();
                const chedenOutMinutes = timeObjectCheckedOut.getMinutes();
                doc.fontSize(10).text(`${ counter }. Datum: ${entry.dateAndTime.toISOString().split('T')[0]} - Pocetak: ${chedenInHourse}:${chedenInMinutes} - Zavrsetak: ${chedenOutHourse}:${chedenOutMinutes} - Sati: ${hoursWorked.toFixed(2)}`);
                counter++;
            });
        }
        
        doc.moveDown();
        doc.fontSize(12).text(`Ukupno radnih sati: ${totalHours.toFixed(2)}`);
        doc.moveDown();

        doc.end();
        return {message: "Uspešno kreiran izveštaj"};
    }
}
