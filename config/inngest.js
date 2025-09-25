import { Inngest } from "inngest";
import dbConnect from "./db";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "F9erz" ,
  name: process.env.INNGEST_NAME || "F9erz",

});

// Inngest fucntion to save user data to a database
export const syncUsercreation = inngest.createFunction(
  {
    id:'sync-user-from-clerk'
  },

  {event:'clerk/user.created'},
  async ({event}) => {
    const {id, fiirst_name, last_name, email_addresses, image_url} = event.data
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: fiirst_name + '' + last_namee,
      imageUrl: image_url,
    }
    await dbConnect()
    await User.create(userData)
  }
)

// Inngest function to update user data in a database
export const syncUserUpdation = inngest.createFunction(
  {
    id:'update-from-clerk'
  },
  {event:'clerk/user.updated'},
  async ({event}) => {     const {id, fiirst_name, last_name, email_addresses, image_url} = event.data
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: fiirst_name + '' + last_namee,
      imageUrl: image_url,
    }
    await dbConnect()
    await User.findByIdAndUpdate(id, userData)
  }
)

// Inngest function to delete user data from a database
export const syncUserDeletion = inngest.createFunction(
  { 
    id:'delete-user-with-clerk'
  },
  {event:'clerk/user.deleted'},
  async ({event}) => {
    const {id} = event.data
    
    await dbConnect()
    await User.findByIdAndDelete(id)
  }
)