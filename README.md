## **FreeCodeCamp**- Information Security and Quality Assurance

### Project Stock Price Checker (learning project)

An api to request stock-prices and set likes.

### Installation

Live version is installed on glitch.com
(https://s-projects18-fcc-64.glitch.me/)

One can create a new glitch-project and imported it from github.
It's a node.js project so it can also be installed per console.

### Usage REST-Api

| METHOD | URL + PARMS | STATUS RETURNED |  DATA RETURNED |
| ------ | ----------- | --------------- | -------------- |
| GET | /api/stock-prices?stock=goog | 200, 400, 500 | {stockData:{stock:..., price:...}} |
| GET | /api/stock-prices?stock=goog&like=true* | 200, 400, 500 | {stockData:{stock:..., price:..., likes:...}} |
| GET | /api/stock-prices?stock=goog&stock=msft | 200, 400, 500 | {stockData:[{...}, {...}]} |
| GET | /api/stock-prices?stock=goog&stock=msft&like=true* | 200, 400, 500 | {stockData:[{stock:..., price:..., rel_likes:...}, {...}]} |
```* here data is created on the server, so GET probably is not the best choise```

### Example return values

```
{"stockData":{"stock":"GOOG","price":"786.90","likes":1}}
```

```
{"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}
```
