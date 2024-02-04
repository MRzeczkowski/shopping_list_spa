import React, {Component} from 'react';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            loading: true,
            newProductName: ''
        };

        this.renderProductsTable = this.renderProductsTable.bind(this);
        this.handlePurchasedChange = this.handlePurchasedChange.bind(this);
    }

    componentDidMount() {
        this.populateProductsData();
    }

    async populateProductsData() {
        const response = await fetch('ShoppingList');
        const data = await response.json();
        this.setState({products: data, loading: false});
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderProductsTable(this.state.products);

        return (
            <div>
                <h1>Here is your shopping list!</h1>
                <div>
                    <input
                        type="text"
                        value={this.state.newProductName}
                        onChange={e => this.setState({newProductName: e.target.value})}
                        placeholder="Enter new product name"
                    />
                    <button onClick={this.handleAddProduct}>
                        Add
                    </button>
                </div>
                <h1 id="tableLabel">Products</h1>
                {contents}
            </div>
        );
    }

    renderProductsTable(products) {
        return (
            <table className="table table-striped" aria-labelledby="tableLabel">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Purchased</th>
                </tr>
                </thead>
                <tbody>
                {products.map(product =>
                    <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>
                            <input
                                type="checkbox"
                                checked={product.isPurchased}
                                onChange={() => this.handlePurchasedChange(product.id, !product.isPurchased)}
                            />
                        </td>
                        <td>
                            <button onClick={() => this.handleDeleteProduct(product.id)} className="btn btn-danger">
                                Delete
                            </button>
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        );
    }

    async handlePurchasedChange(id, isPurchased) {
        try {
            const response = await fetch(`/ShoppingList/${id}/${isPurchased}`, {
                method: 'PUT'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Update the local state to reflect the change
            this.setState(prevState => ({
                products: prevState.products.map(product =>
                    product.id === id ? {...product, isPurchased: isPurchased} : product
                )
            }));
        } catch (error) {
            console.error('Failed to update the product:', error);
        }
    }

    handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await fetch(`/ShoppingList/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            this.setState(prevState => ({
                products: prevState.products.filter(product => product.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete the product:', error);
        }
    };
    
    handleAddProduct = async () => {
        const {newProductName} = this.state;
        if (!newProductName) {
            alert('Please enter a product name.');
            return;
        }

        try {
            const response = await fetch(`/ShoppingList/${encodeURIComponent(newProductName)}`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const newProduct = await response.json();

            this.setState(prevState => ({
                products: [...prevState.products, newProduct],
                newProductName: ''
            }));
        } catch (error) {
            console.error('Failed to add the product:', error);
        }
    };
}
