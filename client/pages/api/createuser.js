import { client } from "../../lib/client";

export default async (req, res, next) => {
  const { userAddress } = req.body;
  //   console.log(userAddress);

  const userDoc = {
    _type: "users",
    _id: `${userAddress}-user`,
    name: "unnamed",
    walletAddress: userAddress,
  };

  try {
    await client.createIfNotExists(userDoc);
    res.status(200).send("Successful");
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};
