import "./App.css";
import React from "react";
import Pagination from "react-bootstrap/Pagination";

class ProductCard extends React.Component {
  constructor(props) {
    super(props);
    const { name, category, price, image, featured } = this.props.value;
    this.state = {
      name: name,
      category: category,
      price: price,
      image: image,
      featured: featured,
    };
  }

  render() {
    return (
      <div className="card">
        <div className="img-container">
          <img
            src={this.state.image["src"]}
            className="card-img-top"
            alt={this.state.image["alt"]}
          ></img>
          <p className="best-seller" hidden={!this.state.featured}>
            Best Seller
          </p>
          <button className="add_to_cart" onClick={this.props.onClick}>
            {" "}
            Add to Cart
          </button>
        </div>
        <div className="card-body">
          <p className="card-category">{this.state.category}</p>
          <h5 className="card-title">{this.state.name}</h5>
          <p className="card-text">{"$" + this.state.price}</p>
        </div>
      </div>
    );
  }
}

class Paginator extends React.Component {
  constructor(props) {
    super(props);
    let end = 4;
    let pages = Math.ceil(props.itemsCount / 6) - 1;
    if (pages < end) {
      end = pages;
    }
    this.state = {
      active: 0,
      start: 0,
      end: end,
    };
  }

  componentDidUpdate(nextProps) {
    console.log(this.props);
    console.log(nextProps);

    if (this.props.itemsCount !== nextProps.itemsCount) {
      let end = 4;
      let pages = Math.ceil(this.props.itemsCount / 6) - 1;
      if (pages < end) {
        end = pages;
      }
      let state = {
        active: 0,
        start: 0,
        end: end,
      };

      this.setState(state);
    }
  }

  renderPaginationNav() {
    let toRender = [];
    console.log(this.state);

    for (let i = this.state.start; i <= this.state.end; i++) {
      toRender.push(
        <Pagination.Item
          key={i}
          active={i === this.state.active}
          onClick={() => this.handleClick(i)}
        >
          {this.state.start + i - this.state.start + 1}
        </Pagination.Item>
      );
    }
    return toRender;
  }

  handleClick(i) {
    let state = { ...this.state };
    state.active = i;
    this.setState(state);
    console.log(i);
    this.props.onPageChange(state.active);
  }

  next() {
    let state = { ...this.state };
    state.active += 1;
    this.updatePageIndexes(state);
  }

  prev() {
    let state = { ...this.state };
    state.active -= 1;
    this.updatePageIndexes(state);
  }

  updatePageIndexes(state) {
    if (state.active > state.end) {
      state.start += 1;
      state.end += 1;
    } else if (state.active < state.start) {
      state.start -= 1;
      state.end -= 1;
    }
    console.log(state);

    this.setState(state);
    this.props.onPageChange(state.active);
  }

  render() {
    return (
      <Pagination>
        <Pagination.Prev
          style={{ visibility: this.state.active === 0 ? "hidden" : "unset" }}
          onClick={() => this.prev()}
        />
        {this.renderPaginationNav()}
        <Pagination.Next
          style={{
            visibility:
              this.state.active === Math.ceil(this.props.itemsCount / 6) - 1
                ? "hidden"
                : "unset",
          }}
          onClick={() => this.next()}
        />
      </Pagination>
    );
  }
}

class Cart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      closed: true,
      items: [],
    };
  }

  addItem(item) {
    let state = { ...this.state };
    state.items.push(item);
    state.closed = false;
    this.setState(state);
    console.log("Agregado Correctamente el producto");
    console.log(item);
  }

  clearCart() {
    let state = { ...this.state };
    state.items = [];
    state.closed = true;
    this.setState(state);
  }

  closeCart() {
    let state = { ...this.state };
    state.closed = true;
    this.setState(state);
  }

  openCart() {
    let state = { ...this.state };
    state.closed = false;
    this.setState(state);
  }

  render() {
    return (
      <div className="cart-container">
        <img
          src={process.env.PUBLIC_URL + "./assets/imgs/cart.svg"}
          alt="My Cart"
          className="cart"
          onClick={() => this.openCart()}
        ></img>
        <div>
          <span
            hidden={this.state.items.length === 0 ? true : false}
            className="cart-badge position-absolute bg-danger start-100 translate-middle badge rounded-pill"
          >
            {this.state.items.length}
          </span>
        </div>
        <div className="cart-content" hidden={this.state.closed}>
          {
            <div className="cart-close">
              <img
                src={process.env.PUBLIC_URL + "./assets/imgs/close.svg"}
                alt="Close"
                onClick={() => this.closeCart()}
              ></img>
            </div>
          }
          {this.state.items.map((item, index) => (
            <div className="cart-item" key={index}>
              <div className="cart-item-content">
                <h6>{item.name}</h6>
                <p>{"$ " + item.price}</p>
              </div>
              <div className="cart-item-image">
                <img src={item.image.src} alt={item.image.alt}></img>
              </div>
            </div>
          ))}
          {
            <button
              type="button"
              className="btn btn-dark"
              onClick={() => this.clearCart()}
              style={{ width: "100%" }}
            >
              Clear
            </button>
          }
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.cartElement = React.createRef();
    this.state = {
      items: [],
      filteredItems: [],
      page: 0,
      // navigationState: {
      //   active: 0,
      //   start: 0,
      //   end: 5,
      //   itemsCount: 0
      // },
    };
  }

  componentDidMount() {
    const urlProducts = "products.json";
    fetch(urlProducts, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => response.json())
      .then((productos) => {
        const { products } = productos;
        let items = products.map((product, index) => ({
          ...product,
          id: index,
        }));

        let filteredItems = [];
        for (let item of items) {
          if (item.featured !== true) filteredItems.push(item);
        }

        let currentState = { ...this.state };
        currentState.items = items;
        currentState.filteredItems = filteredItems;
        this.setState(currentState);
      });
  }

  renderNav() {
    return (
      <header>
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <a className="navbar-brand" href="index.html">
              <h2>
                Bejemas <em>Recruitment</em>
              </h2>
            </a>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ml-auto">
                <li className="nav-item active">
                  <a className="nav-link" href="index.html">
                    Home
                    <span className="sr-only">(current)</span>
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="contact.html">
                    About
                  </a>
                </li>
              </ul>
            </div>
            {this.renderCart()}
          </div>
        </nav>
      </header>
    );
  }

  renderHeader() {}

  renderCart() {
    return <Cart ref={this.cartElement}></Cart>;
  }

  addToCart(item) {
    this.cartElement.current.addItem(item);
  }

  onPageChange = (pageIndex) => {
    let state = { ...this.state };
    state.page = pageIndex;
    this.setState(state);
  };

  byName = (ascending) => {
    const items = [].concat(this.state.filteredItems).sort((a, b) => {
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    if (ascending) {
      return items;
    } else {
      return items.reverse();
    }
  };

  byPrice = (ascending) => {
    const items = [].concat(this.state.filteredItems).sort((a, b) => {
      return a.price > b.price ? 1 : -1;
    });

    if (ascending) {
      return items;
    } else {
      return items.reverse();
    }
  };

  onSort = (ascending, sortType) => {
    let items = [];
    if (sortType === "Price") {
      items = this.byPrice(ascending);
    } else {
      items = this.byName(ascending);
    }
    this.sort(items);
  };

  sort = (filteredItems) => {
    let state = { ...this.state };
    state.filteredItems = filteredItems;
    this.setState(state);
  };

  onFiltered = (filteredItems) => {
    let state = { ...this.state };
    state.filteredItems = filteredItems;
    state.page = 0;
    console.log("Apllying Filter");
    console.log(filteredItems);
    this.setState(state);
  };

  extractFeaturedItem() {
    for (let item of this.state.items) {
      if (item.featured === true) {
        return item;
      }
    }
  }

  render() {
    const item = this.extractFeaturedItem();
    const photoText = "Photograpy / Premium Photos";
    return (
      <>
        <header>
          <nav>
            <div className="logo-container">
              <img
                src={process.env.PUBLIC_URL + "./assets/imgs/logo.png"}
                alt="logo"
              />
            </div>
            {this.renderCart()}
          </nav>
          {this.state.items.length !== 0 ? (
            <HeaderContent
              data={item}
              add={(item) => {
                console.log(item);
                this.addToCart(item);
              }}
            />
          ) : null}
        </header>
        <main className="main">
          <div className="main-intro">
            <div className="photography">
              <p>{photoText}</p>
            </div>
            {this.state.filteredItems.length !== 0 ? (
              <SortBy onSort={this.onSort} />
            ) : null}
            <div className="filters">
              <img
                className="filter-img"
                src={process.env.PUBLIC_URL + "./assets/imgs/filters.svg"}
                alt="Filter.png"
              ></img>
            </div>
          </div>
          <div className="main-container">
            {this.state.items.length !== 0 ? (
              <FilterComponent
                value={this.state.filteredItems}
                onFiltered={(items) => {
                  this.onFiltered(items);
                }}
              />
            ) : null}
            <div className="main-content">
              <div className="cards-container">
                {this.state.filteredItems
                  .slice(this.state.page * 6, this.state.page * 6 + 6)
                  .map((item) => (
                    <ProductCard
                      key={item.id}
                      value={item}
                      onClick={() => this.addToCart(item)}
                    ></ProductCard>
                  ))}
              </div>
              {this.state.items.length !== 0 ? (
                <Paginator
                  onPageChange={this.onPageChange}
                  itemsCount={this.state.filteredItems.length}
                />
              ) : null}

              {/* <Paginator
                onPageChange={this.onPageChange}
                itemsCount={this.state.filteredItems.length}
              ></Paginator> */}
            </div>
          </div>
        </main>
      </>
    );
  }
}

class HeaderContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.data,
    };
  }

  render() {
    return (
      <div className="header-content">
        <div className="header-main-content">
          <h1> {this.state.item.name}</h1>

          <div className="header-img-container">
            {/* <img src={process.env.PUBLIC_URL + "/img/img2.jpg"} alt="logo" /> */}
            <img src={this.state.item.image.src} alt="logo" />
            <p className="featured">Photo of the day</p>
          </div>

          <button
            className="btn-addto-cart"
            onClick={() => {
              this.props.add(this.state.item);
            }}
          >
            Add to Cart
          </button>
        </div>
        <div className="header-info">
          <div className="header-description">
            <h5>{"About the " + this.state.item.name}</h5>
            <p className="header-category">Pets</p>
            <p>{this.state.item.details.description}</p>
          </div>
          <div className="header-also">
            <h5>People also buy</h5>
            <div className="also-img-container">
              <img
                src={this.state.item.details.recommendations[0].src}
                alt="logo"
              />
              <img
                src={this.state.item.details.recommendations[1].src}
                alt="logo"
              />
              <img
                src={this.state.item.details.recommendations[2].src}
                alt="logo"
              />
            </div>
            <h5>Details</h5>
            <p>
              {"Size: " +
                this.state.item.details.dimmentions.width +
                " x " +
                this.state.item.details.dimmentions.height}
            </p>
            <p>{"Size: " + this.state.item.details.size / 1000 + " Mb"}</p>
          </div>
        </div>
      </div>
    );
  }
}

class SortBy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ascending: true,
      sortType: "Price",
    };
  }

  sort(ascending, sortType) {
    let state = { ...this.state };
    state.ascending = ascending;
    state.sortType = sortType;
    this.setState(state);

    this.props.onSort(ascending, sortType);
  }

  render() {
    return (
      <div className="sort">
        <img
          className="sort_arrow"
          src={process.env.PUBLIC_URL + "./assets/imgs/arrow-up.svg"}
          alt="Arrow"
          onClick={() => {
            this.sort(false, this.state.sortType);
          }}
        ></img>
        <img
          className="sort_arrow"
          src={process.env.PUBLIC_URL + "./assets/imgs/arrow-down.svg"}
          alt="Arrow"
          onClick={() => {
            this.sort(true, this.state.sortType);
          }}
        ></img>
        <p>Sort By</p>
        <div className="dropdown">
          <button
            type="button"
            className="btn btn-ligth dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            {this.state.sortType}
          </button>
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item"
                onClick={() => {
                  this.sort(this.state.ascending, "Price");
                }}
              >
                Price
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => {
                  this.sort(this.state.ascending, "Name");
                }}
              >
                Name
              </button>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

class FilterComponent extends React.Component {
  constructor(props) {
    super(props);

    let categories = [];
    let maxPrice = 0;
    for (let item of props.value) {
      if (!categories.includes(item.category)) {
        categories.push(item.category);
      }
      if (item.price > maxPrice) {
        maxPrice = item.price;
      }
    }
    maxPrice = Math.ceil(maxPrice / 100) * 100;

    let values = [];
    for (let i = 0; i < 4; i++) {
      values.push(i * Math.ceil(maxPrice / 4) + Math.ceil(maxPrice / 4));
    }

    this.state = {
      items: props.value,
      priceFilter: null,
      categoryFilters: [],
      values: values,
      categories: categories,
      maxPrice: maxPrice,
    };
  }

  handlePriceChange(index) {
    let state = { ...this.state };
    if (this.state.priceFilter === null || this.state.priceFilter !== index) {
      state.priceFilter = index;
    } else {
      state.priceFilter = null;
    }
    this.applyFilters(state);
  }

  handleCategoryChange(categoryName) {
    let state = { ...this.state };
    const value = state.categoryFilters.indexOf(categoryName);
    if (value > -1) {
      state.categoryFilters.splice(value, 1);
    } else {
      state.categoryFilters.push(categoryName);
    }
    this.applyFilters(state);
  }
  applyFilters(state) {
    // Category Filters
    let filteredItems = [];
    if (state.categoryFilters.length === 0) {
      filteredItems = [...state.items];
    } else {
      for (let categoryFilter of state.categoryFilters) {
        for (let item of state.items) {
          if (item.category === categoryFilter) {
            filteredItems.push(item);
          }
        }
      }
    }

    let filteredItems2 = [];
    if (state.priceFilter === null) {
      filteredItems2 = [...filteredItems];
    } else {
      for (let item of filteredItems) {
        if (
          item.price <= (state.priceFilter + 1) * 50 &&
          item.price >= state.priceFilter * 50
        ) {
          filteredItems2.push(item);
        }
      }
    }
    this.setState(state);
    this.props.onFiltered(filteredItems2);
  }

  render() {
    return (
      <aside>
        <h5>Category</h5>
        <ul className="sidenav">
          {this.state.categories.map((category, index) => (
            <li key={index}>
              <input
                type="checkbox"
                onChange={() => {
                  this.handleCategoryChange(category);
                }}
                id={category + index}
                name={category + index}
                value={category}
              ></input>
              <label htmlFor={category + index}>
                {" "}
                {category.toUpperCase()}
              </label>
            </li>
          ))}
        </ul>

        <h5>Price Range</h5>
        <ul className="sidenav">
          {this.state.values.map((price, index) => {
            if (index === 0) {
              return (
                <li key={index}>
                  <input
                    type="checkbox"
                    checked={this.state.priceFilter === index ? true : false}
                    onChange={() => {
                      this.handlePriceChange(index);
                    }}
                    id={price + index}
                    name={price + index}
                    value={price}
                  ></input>
                  <label htmlFor={price + index}>
                    Lower than +{"$ " + price}
                  </label>
                </li>
              );
            } else if (index === this.state.values.length - 1) {
              return (
                <li key={index}>
                  <input
                    type="checkbox"
                    checked={this.state.priceFilter === index ? true : false}
                    onChange={() => {
                      this.handlePriceChange(index);
                    }}
                    id={price + index}
                    name={price + index}
                    value={price}
                  ></input>
                  <label htmlFor={price + index}>
                    More than +{"$ " + price}
                  </label>
                </li>
              );
            } else {
              return (
                <li key={index}>
                  <input
                    type="checkbox"
                    checked={this.state.priceFilter === index ? true : false}
                    onChange={() => {
                      this.handlePriceChange(index);
                    }}
                    id={price + index}
                    name={price + index}
                    value={price}
                  ></input>
                  <label htmlFor={price + index}>
                    {"$ " + price + " - $ " + (price + 50)}{" "}
                  </label>
                </li>
              );
            }
          })}
        </ul>
      </aside>
    );
  }
}

export { App };

{
  /* src={process.env.PUBLIC_URL + "./assets/imgs/cart.svg"} */
}
