import { FormEvent, useState } from "react";
import { Amplify } from "aws-amplify";
import { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "./App.css";

Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function App() {
  const { signOut } = useAuthenticator();
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateRecipe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setRecipe("");
    try {
      const { data } = await client.queries.askBedrock({
        ingredients: ingredients.split(",").map((i) => i.trim()),
      });
      setRecipe(data?.body || "No recipe generated.");
    } catch (err) {
      console.error(err);
      setRecipe("Error generating recipe. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          Meet Your Personal <span className="highlight">Recipe AI</span>
        </h1>
        <p className="description">
          Simply type a few ingredients using the format ingredient1,
          ingredient2, etc., and Recipe AI will generate an all-new recipe on
          demand...
        </p>
      </div>
      <div className="form-container">
        <form onSubmit={generateRecipe}>
          <div className="search-container">
            <input
              className="wide-input"
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Chicken, white rice, yellow squash, onion"
            />
            <button className="search-button" type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>
      </div>
      {loading && (
        <div className="loader-container">
          <p>Generating your recipe...</p>
        </div>
      )}
      {recipe && (
        <div className="result-container">
          <p className="result">{recipe}</p>
        </div>
      )}
      <button onClick={signOut} style={{ marginTop: "20px" }}>
        Sign Out
      </button>
    </div>
  );
}