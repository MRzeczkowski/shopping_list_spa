using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;

namespace ShoppingList.Controllers;

[ApiController]
[Route("[controller]")]
public class ShoppingListController : ControllerBase
{
    private static IMongoDatabase? _database;
    private readonly ILogger<ShoppingListController> _logger;
    private readonly IConfiguration _configuration;

    public ShoppingListController(ILogger<ShoppingListController> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

        EnsureMongoConnection();
    }

    [HttpGet]
    public ActionResult<IEnumerable<Product>> Get()
    {
        EnsureMongoConnection();

        try
        {
            var productsCollection = GetProductsCollection();
            var products = productsCollection.Find(product => true).ToList();
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving products from database.");
            return StatusCode(500, "An error occurred while fetching the products.");
        }
    }

    [HttpPost]
    public IActionResult Post([FromBody] string productName)
    {
        EnsureMongoConnection();

        if (ModelState.IsValid)
        {
            try
            {
                var newProduct = new Product
                {
                    Id = ObjectId.GenerateNewId(),
                    Name = productName,
                    IsPurchased = false
                };

                var productsCollection = GetProductsCollection();
                productsCollection.InsertOne(newProduct);
                _logger.LogInformation("Product created successfully: {ProductName}", productName);
                return CreatedAtAction(nameof(Get), new { id = newProduct.Id }, newProduct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating new product: {ProductName}", productName);
                return StatusCode(500, "An error occurred while creating the product.");
            }
        }
        else
        {
            _logger.LogWarning("Model state invalid for creating product: {ProductName}", productName);
            return BadRequest(ModelState);
        }
    }

    [HttpPut("{id}")]
    public IActionResult Put(string id, [FromBody] bool isPurchased)
    {
        EnsureMongoConnection();

        try
        {
            var filter = Builders<Product>.Filter.Eq(p => p.Id, new ObjectId(id));
            var update = Builders<Product>.Update.Set(p => p.IsPurchased, isPurchased);

            var productsCollection = GetProductsCollection();
            productsCollection.UpdateOne(filter, update);
            _logger.LogInformation("Product updated successfully: {ProductId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product: {ProductId}", id);
            return StatusCode(500, "An error occurred while updating the product.");
        }
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        EnsureMongoConnection();

        try
        {
            var productsCollection = GetProductsCollection();
            productsCollection.DeleteOne(product => product.Id == new ObjectId(id));
            _logger.LogInformation("Product deleted successfully: {ProductId}", id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product: {ProductId}", id);
            return StatusCode(500, "An error occurred while deleting the product.");
        }
    }

    private void EnsureMongoConnection()
    {
        if (_database != null)
        {
            return;
        }

        try
        {
            var mongoDbSettings = _configuration.GetSection("MongoDB");
            var connectionString = mongoDbSettings["ConnectionString"];
            var databaseName = mongoDbSettings["Database"];

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);

            _logger.LogInformation("MongoDB connection established successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error establishing MongoDB connection.");
            throw;
        }
    }

    private IMongoCollection<Product> GetProductsCollection() =>
        _database!.GetCollection<Product>(_configuration.GetSection("MongoDB")["CollectionName"]);
}