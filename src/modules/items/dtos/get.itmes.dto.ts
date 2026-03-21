export class GetItemsDto{
    itemId: number;
    itemName: string;
    price: number;
    stockQuantity: number;
    
    constructor(itemId: number, itemName: string, price: number, stockQuantity: number) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.price = price;
        this.stockQuantity = stockQuantity;
    }
}