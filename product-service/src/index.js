const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const products = [];

app.get("/products", (req, res) => {
  res.json(products);
});

app.post("/products", (req, res) => {
  console.log('product creation request received',req.body);
  const product = {
    id: Date.now().toString(),
    ...req.body,
  };

  products.push(product);
  console.log('product created',product);
  console.log(products);

  res.status(201).json({
    message: "Product created successfully",
    product,
  });
});

app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});