export class SuperadministratorInfoDto {
    adminId: number;
    name: string;
    email: string;
    phonenumber:string;

    constructor(adminId: number, name: string, email: string, phonenumber: string){
        this.adminId = adminId;
        this.name = name;
        this.email = email;
        this.phonenumber = phonenumber;
    }
}