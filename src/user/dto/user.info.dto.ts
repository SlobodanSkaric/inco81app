import { TimeOfWorke } from "entitets/entities/TimeOfWorke";

export class UserInfoDto{
    userId: number;
    name: string;
    lastname: string;
    email: string;
    phonenumber:string;
    timeOfWorks: TimeOfWorke[];
    sumTimeOfWork: string;

    constructor(userId: number, name: string, lasname: string, email: string, phonenumber: string, timeOfWorks: TimeOfWorke[] = [], sumTimeOfWork: string = ""){
        this.userId = userId;
        this.name = name;
        this.lastname = lasname;
        this.email = email;
        this.phonenumber = phonenumber;
        this.timeOfWorks = timeOfWorks;
        this.sumTimeOfWork = sumTimeOfWork;
    }
}