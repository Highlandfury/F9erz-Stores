import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/User"; // <-- make sure path is correct

// Inngest client
export const inngest = new Inngest({
  id: "f9erz-app",
  name: process.env.INNGEST_NAME || "F9erz",
});

// Clerk → User created
export const syncUsercreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    console.log("User created event:", event); // debug

    const { id, first_name, last_name, email_addresses, image_url } = event.data || {};

    if (!id) throw new Error("No user data in event");

    const userData = {
      _id: id,
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    };

    await dbConnect();
    await User.create(userData);
  }
);

// Clerk → User updated
export const syncUserUpdation = inngest.createFunction(
  { id: "update-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    console.log("User updated event:", event);

    const { id, first_name, last_name, email_addresses, image_url } = event.data || {};

    await dbConnect();
    await User.findByIdAndUpdate(id, {
      email: email_addresses?.[0]?.email_address || "",
      name: `${first_name || ""} ${last_name || ""}`.trim(),
      imageUrl: image_url,
    });
  }
);

// Clerk → User deleted
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    console.log("User deleted event:", event);

    const { id } = event.data || {};
    if (!id) throw new Error("No user ID in event");

    await dbConnect();
    await User.findByIdAndDelete(id);
  }
);
