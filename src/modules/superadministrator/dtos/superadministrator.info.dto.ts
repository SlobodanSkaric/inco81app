export class SuperadministratorInfoDto {
    superAdmistratorId: number;
    username: string;
    email: string;
    phoneNumber:string;

    constructor(adminId: number, name: string, email: string, phonenumber: string){
        this.superAdmistratorId = adminId;
        this.username = name;
        this.email = email;
        this.phoneNumber = phonenumber;
    }
}