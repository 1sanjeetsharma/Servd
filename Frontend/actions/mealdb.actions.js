"use server";
const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
export async function getRecipeOfTheDay() {
  try {
    const res = await fetch(`${MEALDB_BASE}/random.php`, {
      next: { revalidate: 86400 }, //cache for 24 hours
    });
    if (!res.ok) {
      throw new Error("Failed to fetch recipe of the day");
    }

    const data = await res.json();
    return {
      success: true,
      recipe: data.meals[0],
    };
  } catch (error) {
    console.error("Error Fetching Recipe of the Day:", error);
    throw new Error(error.message || "Failed to load recipe");
  }
}
export const getCategories = async () => {
  try {
    const res = await fetch(`${MEALDB_BASE}/list.php?c=list`, {
      next: { revalidate: 604800 }, //cache for 1 week
    });
    if (!res.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await res.json();
    return {
      success: true,
      categories: data.meals || [],
    };
  } catch (error) {
    console.error("Error Fetching categories:", error);
    throw new Error(error.message || "Failed to load categories");
  }
};
export const getAreas = async () => {
  try {
    const res = await fetch(`${MEALDB_BASE}/list.php?a=list`, {
      next: { revalidate: 604800 }, //cache for 1 week
    });
    if (!res.ok) {
      throw new Error("Failed to fetch areas");
    }

    const data = await res.json();
    return {
      success: true,
      areas: data.meals || [],
    };
  } catch (error) {
    console.error("Error Fetching areas:", error);
    throw new Error(error.message || "Failed to load areas");
  }
};
export const getMealsByCategory = async (category) => {
  try {
    const res = await fetch(`${MEALDB_BASE}/Filter.php?c=${category}`, {
      next: { revalidate: 86400 }, //cache for 1 week
    });
    if (!res.ok) {
      throw new Error("Failed to fetch meals");
    }

    const data = await res.json();
    return {
      success: true,
      meals: data.meals || [],
      category,
    };
  } catch (error) {
    console.error("Error Fetching meals by category:", error);
    throw new Error(error.message || "Failed to load meals by category");
  }
};
export const getMealsByArea = async (Area) => {
  try {
    const res = await fetch(`${MEALDB_BASE}/Filter.php?a=${Area}`, {
      next: { revalidate: 86400 }, //cache for 1 week
    });
    if (!res.ok) {
      throw new Error("Failed to fetch meals");
    }

    const data = await res.json();
    return {
      success: true,
      meals: data.meals || [],
      Area,
    };
  } catch (error) {
    console.error("Error Fetching meals by Area:", error);
    throw new Error(error.message || "Failed to load meals by Area");
  }
};
