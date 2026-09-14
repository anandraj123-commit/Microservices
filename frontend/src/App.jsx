import { useState } from "react";
import ProductForm from "./component/ProductForm";
import OrderForm from "./component/ OrderForm";

function App() {
  const [page, setPage] = useState("product");

  return (
    <div>
      <nav
        style={{
          padding: "20px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: "15px",
          justifyContent: "center",
        }}
      >
        <button onClick={() => setPage("product")}>
          Create Product
        </button>

        <button onClick={() => setPage("order")}>
          Create Order
        </button>
      </nav>

      {page === "product" && <ProductForm />}

      {page === "order" && <OrderForm />}
    </div>
  );
}

export default App;