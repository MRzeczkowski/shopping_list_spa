using MongoDB.Bson;

namespace ShoppingList;

public class ProductModel
{
    public ObjectId? Id { get; init; }

    public required string Name { get; init; }

    public bool IsPurchased { get; init; }
}

public class Product
{
    public string? Id { get; init; }

    public required string Name { get; init; }

    public bool IsPurchased { get; init; }
}