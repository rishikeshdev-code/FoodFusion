import { useEffect, useState } from "react";
import { getFoods } from "./api";

function ApiTest() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadFoods = async () => {
      try {
        const data = await getFoods();
        setFoods(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, []);

  if (loading) {
    return <h2>Loading foods from MongoDB...</h2>;
  }

  if (error) {
    return <h2>Food API Error: {error}</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h1>FoodFusion API Test</h1>

      <p>
        MongoDB foods loaded: <strong>{foods.length}</strong>
      </p>

      {foods.map((food) => (
        <div
          key={food._id}
          style={{
            padding: "15px",
            marginBottom: "10px",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <strong>
            {food.emoji} {food.name}
          </strong>

          <p>
            Category: {food.category}
            <br />
            Price: ₹{food.price}
            <br />
            Rating: ⭐ {food.rating}
          </p>
        </div>
      ))}
    </div>
  );
}

export default ApiTest;