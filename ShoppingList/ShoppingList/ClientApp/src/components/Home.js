import React, {Component} from 'react';

export class Home extends Component {
    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = {products: [], loading: true};

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
    
    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : this.renderProductsTable(this.state.products);

        return (
            <div>
                <h1>Here is your shopping list!</h1>
                <div>
                    <h1 id="tableLabel">Products</h1>
                    {contents}
                </div>
            </div>
        );
    }
}
