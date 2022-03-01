import { client } from "../../lib/client";

const query = `*[_type == "conversations" && isDm == true]{
    "conversation": userReference->{
        name,
        walletAddress,
        "image":profileImage.asset->url
    }
}`;

export default async (req, res, next) => {
  try {
    const sanityResponse = await client.fetch(query);
    // console.log(sanityResponse);
    const response = sanityResponse.map((item) => {
      return {
        avatar: item.conversation.image,
        name: item.conversation.name,
        id: item.conversation.walletAddress,
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("⚠️", error);
  }
};
