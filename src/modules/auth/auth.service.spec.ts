import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, LoginMeta } from './auth.service';
import * as bcrypt from 'bcrypt';
import { AuthUserServices } from './auth.user.services';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginAttemptsService } from './login.attempts.service';
import { CustomersService } from '../customers/customers.service';
import { RefreshSessionService } from './refresh.session.service';
import { RedisService } from '../redis/redis.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';

const loginMeta: LoginMeta = { ip: '127.0.0.1', ua: 'jest' };

const mockLoginAttemptsService = {
  assetorsNotLocked: jest.fn().mockResolvedValue(undefined),
  registerFailer: jest.fn().mockResolvedValue(undefined),
  resetFailures: jest.fn().mockResolvedValue(undefined),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SECRET_TOKEN_KEY') return 'access-secret';
    if (key === 'SECRET_REFRESH_TOKEN_KEY') return 'refresh-secret';
    return undefined;
  }),
};

const mockRefreshSessionService = {
  create: jest.fn().mockResolvedValue({ sid: 'test-sid', jti: 'test-jti' }),
};

const mockCustomersService = {
  getByEmail: jest.fn(),
};

const mockRedisService = {};

async function createAuthModule(authUserOverrides: Partial<{ getUserByEmail: jest.Mock }> = {}) {
  const authUserMock = {
    getUserByEmail: jest.fn(),
    ...authUserOverrides,
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      { provide: AuthUserServices, useValue: authUserMock },
      { provide: JwtService, useValue: { signAsync: jest.fn() } },
      { provide: ConfigService, useValue: mockConfigService },
      { provide: LoginAttemptsService, useValue: mockLoginAttemptsService },
      { provide: CustomersService, useValue: mockCustomersService },
      { provide: RefreshSessionService, useValue: mockRefreshSessionService },
      { provide: RedisService, useValue: mockRedisService },
    ],
  }).compile();

  return {
    module,
    service: module.get<AuthService>(AuthService),
    authUserService: module.get<AuthUserServices>(AuthUserServices),
    jwtService: module.get<JwtService>(JwtService),
  };
}

describe('AuthServiceAdminstrator', () => {
  let service: AuthService;
  let authUserService: AuthUserServices;
  let jwtService: JwtService;

  const mockAdminstrator = {
    userId: 1,
    adminId: 1,
    name: 'Slobodan',
    lastname: 'Skaric',
    email: 'slobodan.skaric@gmail.com',
    phonenumber: '123456789',
    password: 'hashedpassword',
    role: Role.ADMIN,
    visibility: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    ({ service, authUserService, jwtService } = await createAuthModule());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Admin login with correct credentials', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(mockAdminstrator as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service.adminstratorLogin(
      { email: 'slobodan.skaric@gmail.com', password: 'password' },
      loginMeta,
    );
    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      administratorInfo: {
        adminId: 1,
        name: 'Slobodan',
        lastname: 'Skaric',
        email: 'slobodan.skaric@gmail.com',
        phonenumber: '123456789',
      },
    });
    expect(mockLoginAttemptsService.resetFailures).toHaveBeenCalled();
  });

  it('Admin login with incorrect email', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(null);

    await expect(
      service.adminstratorLogin({ email: 'incorrect@gmail.com', password: 'password' }, loginMeta),
    ).rejects.toMatchObject({
      status: HttpStatus.UNAUTHORIZED,
    });
    expect(mockLoginAttemptsService.registerFailer).toHaveBeenCalled();
  });

  it('Admin login with incorrect password', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(mockAdminstrator as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.adminstratorLogin(
        { email: 'slobodan.skaric@gmail.com', password: 'incorrectpassword' },
        loginMeta,
      ),
    ).rejects.toBeInstanceOf(HttpException);
    expect(mockLoginAttemptsService.registerFailer).toHaveBeenCalled();
  });
});

describe('AuthServiceUser', () => {
  let service: AuthService;
  let authUserService: AuthUserServices;
  let jwtService: JwtService;

  const mockUser = {
    userId: 1,
    name: 'Slobodan',
    lastname: 'Skaric',
    email: 'slobodan.skaric@gmail.com',
    phonenumber: '123456789',
    password: 'hashedpassword',
    role: Role.USER,
    visibility: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    ({ service, authUserService, jwtService } = await createAuthModule());
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('User login with correct credencials', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service.userLogin(
      { email: 'slobodan.skaric@gmail.com', password: 'password' },
      loginMeta,
    );

    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      userInfo: {
        userId: 1,
        name: 'Slobodan',
        lastname: 'Skaric',
        email: 'slobodan.skaric@gmail.com',
        phonenumber: '123456789',
        timeOfWorks: [],
        sumTimeOfWork: '',
      },
    });
  });

  it('User login with incorrect email', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(null);

    await expect(
      service.userLogin({ email: 'incorrect@gmail.com', password: 'password' }, loginMeta),
    ).rejects.toMatchObject({ status: HttpStatus.UNAUTHORIZED });
  });

  it('User login with incorrect password', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(mockUser as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.userLogin(
        { email: 'slobodan.skaric@gmail.com', password: 'incorrectpassword' },
        loginMeta,
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});

describe('Login superadministrators', () => {
  let service: AuthService;
  let authUserService: AuthUserServices;
  let jwtService: JwtService;

  const mockSuperadministrator = {
    userId: 1,
    name: 'Slobodan',
    email: 'slobodan.skaric@gmail.com',
    phonenumber: '123456789',
    password: 'hashedpassword',
    role: Role.SUPER_ADMIN,
    visibility: 1,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    ({ service, authUserService, jwtService } = await createAuthModule());
  });

  it('Services should be defined', () => {
    expect(service).toBeDefined();
    expect(authUserService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('Login superadmibnistrators with correct credentcials', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(mockSuperadministrator as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service.loginSuperAdministrators(
      { email: 'slobodan.skaric@gmail.com', password: 'plainpasswords' },
      loginMeta,
    );

    expect(result).toEqual({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      superadministrastorsInfo: {
        superAdmistratorId: 1,
        username: 'Slobodan',
        email: 'slobodan.skaric@gmail.com',
        phoneNumber: '123456789',
      },
    });
  });

  it('Login superadministrators with incorrect email', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(null);

    await expect(
      service.loginSuperAdministrators(
        { email: 'incorrect@gmail.com', password: 'password' },
        loginMeta,
      ),
    ).rejects.toMatchObject({ status: HttpStatus.UNAUTHORIZED });
  });

  it('Login superadministrators with incorect password', async () => {
    jest.spyOn(authUserService, 'getUserByEmail').mockResolvedValue(mockSuperadministrator as any);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      service.loginSuperAdministrators(
        { email: 'slobodan.skaric@gmail.com', password: 'incorrectpassword' },
        loginMeta,
      ),
    ).rejects.toBeInstanceOf(HttpException);
  });
});