"use server";

import { freePantryScans, proTierLimit } from "@/lib/arcjet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function scanPantryImage(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const isPro = user.subscriptionTier === "pro";
    //apply arcjet rate limit based on tier
    const arcjetClient = isPro ? proTierLimit : freePantryScans;
    //create a request object for arcjet
    const req = await request();
    const decision = await arcjetClient.protect(req, {
      userId: user.clerkId,
      requested: 1,
    });
    if (decision.isDenied()||decision.type =="ERROR") {
      if (decision.reason.isRateLimit()) {
        throw new Error(
          `Monthly scan limit reached ${isPro ? "Please contact support if you need more scans" : "Upgrade to Pro for Unlimited scans!"}`,
        );
      }
      throw new Error("Request Denied by security system");
    }
    const imageFile = formData.get("image");
    if (!imageFile) {
      throw new Error("No image provided");
    }
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });
    const prompt = `You are a professional chef and ingredient recognition expert. Analyze this image of a pantry/fridge and identify all visible food ingredients.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanations):
[
  {
    "name": "ingredient name",
    "quantity": "estimated quantity with unit",
    "confidence": 0.95
  }
]

Rules:
- Only identify food ingredients (not containers, utensils, or packaging)
- Be specific (e.g., "Cheddar Cheese" not just "Cheese")
- Estimate realistic quantities (e.g., "3 eggs", "1 cup milk", "2 tomatoes")
- Confidence should be 0.7-1.0 (omit items below 0.7)
- Maximum 20 items
- Common pantry staples are acceptable (salt, pepper, oil)
`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: imageFile.type, data: base64Image } },
    ]);
    const response = await result.response;
    const text = response.text();
    // console.log("text:", text);
    let ingredients;
    try {
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON found");
      ingredients = JSON.parse(match[0]);
      // console.log("RAW:", JSON.stringify(text));
    } catch (error) {
      console.error("Failed to parse Gemini response:", text);
      throw new Error("Failed to parse ingredients. Please try again.");
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error(
        "No ingredients detected in the image. Please try a clearer photo.",
      );
    }
    return {
      success: true,
      ingredients: ingredients.slice(0, 20),
      scansLimit: isPro ? "unlimited" : 10,
      message: `Found ${ingredients.length} ingredients!`,
    };
  } catch (error) {
    console.error("Error scanning pantry:", error);
    throw new Error(error.message || "Failed to scan image");
  }
}
export async function saveToPantry(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const ingredientsJson = formData.get("ingredients");
    const ingredients = JSON.parse(ingredientsJson);
    if (!ingredients || ingredients.length === 0) {
      throw new Error("No ingredients to save");
    }
    const savedItems = [];
    for (const ingredient of ingredients) {
      const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            name: ingredient.name,
            quantity: ingredient.quantity,
            imageURL: "",
            owner: user.id,
          },
        }),
      });
      if (response.ok) {
        const data = await response.json();
        savedItems.push(data.data);
      }
    }
    return {
      success: true,
      savedItems,
      message: `Saved ${savedItems.length} items to your pantry!`,
    };
  } catch (error) {
    console.error("Error saving to pantry:", error);
    throw new Error(error.message || "Failed to save items");
  }
}
export async function addPantryItemManually(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const isPro = user.subscriptionTier === "pro";

    const name = formData.get("name");
    const quantity = formData.get("quantity");
    if (!name || !quantity) {
      throw new Error("Name and qunatity are required");
    }

    const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name: name.trim(),
          quantity: quantity.trim(),
          imageURL: "",
          owner: user.id,
        },
      }),
    });
    console.log("data:", name, quantity);
    console.log("response:", response);
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed toadd item:", errorText);
      throw new Error("Failed to add item to pantry");
    }
    const data = await response.json();

    return {
      success: true,
      item: data.data,
      message: `Item added successfully!`,
    };
  } catch (error) {
    console.error("Error Adding Item Manually:", error);
    throw new Error(error.message || "Failed to add item");
  }
}
export async function getPantryItems() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      throw new Error("failed to fetch pantry items");
    }
    const data = await response.json();
    const isPro = user.subscriptionTier === "pro";
    return {
      success: true,
      items: data.data || [],
      scansLimit: isPro ? "unlimited" : 10,
    };
  } catch (error) {
    console.error("Error fetching pantry:", error);
    throw new Error(error.message || "Failed to load pantry");
  }
}
export async function deletePantryItem(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const itemId = formData.get("itemId");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to Delete items");
    }

    return {
      success: true,

      message: "Item removed from pantry",
    };
  } catch (error) {
    console.error("Error Deleting item:", error);
    throw new Error(error.message || "Failed to delete item");
  }
}
export async function updatePantryItem(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const isPro = user.subscriptionTier === "pro";

    const name = formData.get("name");
    const quantity = formData.get("quantity");
    const itemId = formData.get("itemId");
    if (!name || !quantity) {
      throw new Error("Name and qunatity are required");
    }

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          name: name.trim(),
          quantity: quantity.trim(),
        },
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to update item ");
    }
    const data = await response.json();

    return {
      success: true,
      item: data.data,
      message: `Item updated successfully!`,
    };
  } catch (error) {
    console.error("Error updating Item :", error);
    throw new Error(error.message || "Failed to update item");
  }
}
