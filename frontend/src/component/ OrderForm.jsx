import { useEffect, useState } from "react";

function OrderForm() {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    productId: "",
    quantity: 1,
    customerName: "",
  });

  const [message, setMessage] = useState("");

  // Fetch products from Product Service
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/products");
        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Failed to load products:", error);
      }
    };

    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3002/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          productId: formData.productId,
          quantity: Number(formData.quantity),
          customerName: formData.customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create order");
        return;
      }

      console.log("Order response:", data);

      setMessage("Order created successfully");

      setFormData({
        productId: "",
        quantity: 1,
        customerName: "",
      });
    } catch (error) {
      console.error("Order error:", error);

      setMessage("Order Service is not available");
    }
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "10px",
      }}
    >
      <h2>Create Order</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Customer Name</label>

          <br />

          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
            }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Select Product</label>

          <br />

          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
            }}
          >
            <option value="">Select Product</option>

            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ₹{product.price}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Quantity</label>

          <br />

          <input
            type="number"
            name="quantity"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "8px",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Place Order
        </button>
      </form>

      {message && (
        <p
          style={{
            marginTop: "20px",
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default OrderForm;