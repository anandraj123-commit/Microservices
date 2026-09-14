import { useState } from "react";

function ProductForm() {
  const [product, setProduct] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
  });

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
      });
  
      const data = await response.json();
  
      console.log(data);
  
      alert("Product created successfully");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  return (
    <div>
      <h1>Create Product</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Product Name</label>
          <input
            name="name"
            value={product.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>SKU</label>
          <input
            name="sku"
            value={product.sku}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}

export default ProductForm;