import { Inngest } from "inngest";
import dbConnect from "./db";
import User from "@/models/User";

// create client to send events
export const inngest = new Inngest({
  name: process.env.INNGEST_NAME || "F9erz", // <-- add a name here
  signingKey: process.env.INNGEST_SIGNING_KEY,
  eventKey: process.env.INNGEST_EVENT_KEY,
});

// inngest function to save usr data to database
export const syncUsercreation = inngest.createFunction(
  {
    id:'sync-user-from-clerk',
  },
  {
    event: "clerk/user.created",
  },
  async ({ event}) => {
    const {id, first_name, last_name, email_addresses, image_url} = event.data
    const userData = {
      _id:id,
      email: email_addresses[0].email_address,
      name: first_name + ' ' + last_name,
      imageurl:image_url
    }
    await dbConnect()
    await User.create(userData)
  }
)

// ngest function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: 'update-user-from-clerk',
  },
  {
    event: "clerk/user.updated",
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + ' ' + last_name,
      imageurl: image_url
    }
    await dbConnect()
    await User.findByIdAndUpdate(id, userData)
  }
)


// inngest function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: 'delete-user-with-clerk',
  },
  {
    event: "clerk/user.deleted",
  },
  async ({ event }) => {
    const { id } = event.data
    await dbConnect()
    await User.findByIdAndDelete(id)
  }
);
