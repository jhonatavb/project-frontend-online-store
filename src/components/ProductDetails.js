import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import PropTypes from 'prop-types';
import * as api from '../services/api';
import '../App.css';
import FormsAvaliation from './FormsAvaliation';

class ProductDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      product: [],
      quantity: 1,
      cartQuantity: 0,
    };

    this.getProduct = this.getProduct.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.loadCartList = this.loadCartList.bind(this);
    this.increaseQuantity = this.increaseQuantity.bind(this);
    this.decreaseQuantity = this.decreaseQuantity.bind(this);
    this.cartQuantity = this.cartQuantity.bind(this);
  }

  componentDidMount() {
    this.getProduct();
    this.cartQuantity();
  }

  handleClick() {
    const { product:
      { id, title, thumbnail, price }, quantity } = this.state;
    const previousList = this.loadCartList();
    const availableQuantity = this.productQuantityAvailable();

    if (previousList[id] && previousList[id].quantity < availableQuantity) {
      for (let i = 0; i < quantity; i += 1) {
        previousList[id].quantity += 1;
      }
    } else {
      previousList[id] = { id,
        title,
        thumbnail,
        price,
        quantity,
        availableQuantity };
    }
    localStorage.setItem('cartList', JSON.stringify(previousList));
    this.setState({
      quantity: 1,
    });
    this.cartQuantity();
  }

  async getProduct() {
    const { match: { params: { categoryId, id } } } = this.props;
    const productObj = await api.getProductsFromCategoryAndQuery(categoryId, '');
    const product = productObj.results
      .find((prod) => prod.id === id);
    this.setState({ product });
  }

  productQuantityAvailable() {
    const { product } = this.state;
    const quantityAvailable = product.available_quantity;
    return quantityAvailable;
  }

  increaseQuantity() {
    const { quantity, product } = this.state;
    const quantityAvailable = product.available_quantity;
    const prevState = quantity;
    if (prevState < quantityAvailable) {
      this.setState({
        quantity: prevState + 1,
      });
    }
  }

  decreaseQuantity() {
    const { quantity } = this.state;
    const prevState = quantity;
    if (quantity > 1) {
      this.setState({
        quantity: prevState - 1,
      });
    }
  }

  loadCartList() {
    let previousList = localStorage.getItem('cartList');
    if (previousList === null) {
      previousList = {};
      return previousList;
    }
    return JSON.parse(previousList);
  }

  cartQuantity() {
    const localValues = JSON.parse(localStorage.getItem('cartList'));

    if (!localValues) {
      const quantity = 0;
      return quantity;
    }
    const quantity = Object.values(localValues);
    const result = quantity
      .reduce(((acc, cur) => ({
        cartQuantity: acc.quantity + cur.quantity,
      })));
    this.setState({
      cartQuantity: result.cartQuantity,
    });
  }

  render() {
    const { product:
      { title, thumbnail, price },
    quantity, cartQuantity } = this.state;

    return (
      <div>
        <header className="header-details-product">
          <Link to="/">
            Página Inicial
          </Link>
          <Link to="/ShoppingCart" data-testid="shopping-cart-button">
            <FaShoppingCart size={ 30 } />
            <p data-testid="shopping-cart-size">{ cartQuantity }</p>
          </Link>
        </header>
        <h3 data-testid="product-detail-name">
          { title }
          { ' - R$ ' }
          { price === undefined ? price : parseFloat(price).toFixed(2).replace('.', ',') }
        </h3>
        <div className="container-image-and-product-details">
          <div className="container-image-details">
            <img className="image-details" src={ thumbnail } alt="product" />
          </div>
          <div className="container-description-details">
            <h4>Especificações técnicas</h4>
            <ul>
              <li>Especificação um</li>
              <li>Especificação dois</li>
              <li>Especificação três</li>
              <li>Especificação quatro</li>
              <li>Especificação cinco</li>
              <li>Especificação seis</li>
            </ul>
          </div>
        </div>
        <h3>
          Quantidade
        </h3>
        <button
          className="decrease-btn"
          type="button"
          onClick={ this.decreaseQuantity }
        >
          -
        </button>
        <span
          className="quantity-product-details"
        >
          { quantity }
        </span>
        <button
          className="increase-btn"
          type="button"
          onClick={ () => this.increaseQuantity() }
        >
          +
        </button>
        <button
          type="button"
          data-testid="product-detail-add-to-cart"
          className="add-to-cart-btn-details"
          onClick={ this.handleClick }
        >
          Adicionar ao carrinho
        </button>
        <FormsAvaliation />
      </div>
    );
  }
}

ProductDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      categoryId: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

export default ProductDetails;
