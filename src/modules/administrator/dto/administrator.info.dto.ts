export class AdministratorInfoDto{
    adminId: number;
    name: string;
    lastname: string;
    email: string;
    phonenumber:string;

    constructor(adminId: number, name: string, lasname: string, email: string, phonenumber: string){
        this.adminId = adminId;
        this.name = name;
        this.lastname = lasname;
        this.email = email;
        this.phonenumber = phonenumber;
    }

}