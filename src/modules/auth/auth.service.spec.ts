import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { ApiResponse } from 'src/misc/api.response.dto';
import { AuthUserServices } from './auth.user.services';
import { JwtService } from '@nestjs/jwt';

describe('AuthServiceAdminstrator', () => {
  let service: AuthService;
  let authUserService: AuthUserServices;
  let jwtService: JwtService;

  const mockAdminstrator = {
    adminId: 1,
    name: "Slobodan",
    lastname: "Skaric",
    email: "slobodan.skaric@gmail.com",
    phonenumber: "123456789",
    password: "hashedpassword",
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService,
        {
          provide: AuthUserServices,
          useValue: {
            getUserByEmail: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
             signAsync: jest.fn()
          }
        }
      ],
    }).compile();

     service = module.get<AuthService>(AuthService);
     authUserService = module.get<AuthUserServices>(AuthUserServices);
     jwtService = module.get<JwtService>(JwtService);
  });
  
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it("Admin login with correct credentials", async () =>{
      jest.spyOn(authUserService, "getUserByEmail").mockResolvedValue(mockAdminstrator as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
      jest.spyOn(jwtService, "signAsync").mockResolvedValueOnce("accessToken").mockResolvedValueOnce("refreshToken");

      const result = await service.adminstratorLogin({email: "slobodan.skaric@gmail.com", password: "password"}, {ip: "127.0.0.1"} as any);
      expect(result).toEqual({
        accessToken: "accessToken",
        refreshToken: "refreshToken",
        administratorInfo: {
          adminId: 1,
          name: "Slobodan",
          lastname: "Skaric",
          email: "slobodan.skaric@gmail.com",
          phonenumber: "123456789",
        }
      });
    });

    it("Admin login with incorrect email", async () =>{
      jest.spyOn(authUserService, "getUserByEmail").mockResolvedValue(null);

      const result = await service.adminstratorLogin({email: "incorrect@gmail.com", password: "password"}, {ip: "127.0.0.1"} as any);
      expect(result).toEqual(new ApiResponse(
        "error",
        -1010,
        "Email is not exites"
      )); 
    });

    it("Admin login with incorrect password", async () =>{
      jest.spyOn(authUserService, "getUserByEmail").mockResolvedValue(mockAdminstrator as any);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

      const result = await service.adminstratorLogin({email: "slobodan.skaric@gmail.com", password: "incorrectpassword"}, {ip: "127.0.0.1"} as any);
      expect(result).toEqual(new ApiResponse(
        "error",
        -1011,
        "Password is not correct"
      )); 
    });
  });