import { Test, TestingModule } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { Repository } from 'typeorm';
import { Items } from 'entitets/entities/Items';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetItemsDto } from './dtos/get.itmes.dto';

const mockItemsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
}

describe('ItemsService', () => {
  let service: ItemsService;
  let repository: Repository<Items>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ItemsService,
        {
          provide: getRepositoryToken(Items),
          useValue: mockItemsRepository,
        }
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
    repository = module.get<Repository<Items>>(getRepositoryToken(Items));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("Get all items", async () => {
      const mockItems = [
        {
          itemId: 1,
          itemName: "Item1",
          price: 100,
          stockQuantity: 10
        },
        {
          itemId: 2,
          itemName: "Item2",
          price: 200,
          stockQuantity: 20
        },
        {
          itemId: 3,
          itemName: "Item3",
          price: 300,
          stockQuantity: 30
        }

    ]

     mockItemsRepository.find.mockResolvedValue(mockItems);

     const result = await service.findAllItems();
     expect(result).toEqual(mockItems);
     expect(repository.find).toHaveBeenCalled();
  });

  it("Get item by id", async () =>{
    const mockItem = {
      itemId: 1,
      itemName: "Item1",
      price: 100,
      stockQuantity: 10
    }

    mockItemsRepository.findOne.mockResolvedValue(mockItem);

    const result = await service.getItemsById(1);
    expect(result).toEqual(mockItem);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { itemId: 1 } });
  });

  it("Add items", async () => {
    const mockItems = {
      itemName: "Item1",
      price: 100,
      stockQuantity: 10
    }

    const savedItems = {
      itemId: 1,
      itemName: "Item1",
      price: 100,
      stockQuantity: 10
    }

    mockItemsRepository.save.mockResolvedValue(savedItems);

    const result = await service.addItems(mockItems);
    expect(result).toEqual(
      new GetItemsDto(
        expect.any(Number),
        mockItems.itemName,
        mockItems.price,
        mockItems.stockQuantity
    ));

    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      itemName: mockItems.itemName,
      price: mockItems.price,
      stockQuantity: mockItems.stockQuantity
    }));
  });
});
